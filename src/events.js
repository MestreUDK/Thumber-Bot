// ARQUIVO: src/events.js
// (Atualizado para lidar com o fluxo de etapas)

const { gerarCapa } = require('./image.js');
// ATUALIZADO: Importa os dois menus
const { enviarMenuLayout, enviarMenuEdicao } = require('./confirmation.js');

function registerEvents(bot, checkPermission) {

  // --- ETAPA 1: BOTOES DE LAYOUT ---
  
  bot.action(['set_layout_TV', 'set_layout_FILME', 'set_layout_ONA'], checkPermission, async (ctx) => {
    if (ctx.session.state !== 'layout_select' || !ctx.session.animeData) {
        return ctx.reply('Comando invalido. Use /capa primeiro.');
    }
    
    const acao = ctx.match[0];
    const novoLayout = acao.replace('set_layout_', ''); // ex: 'TV'
    
    ctx.session.animeData.layout = novoLayout;
    
    await enviarMenuLayout(ctx); // Re-envia o menu de layout atualizado
  });

  bot.action('ir_para_edicao', checkPermission, async (ctx) => {
    if (ctx.session.state !== 'layout_select') return;
    
    ctx.session.state = 'main_edit'; // Muda o estado para a proxima etapa
    await enviarMenuEdicao(ctx); // Envia o menu de edicao
  });

  // --- ETAPA 2: BOTOES DE EDICAO ---
  
  bot.action('voltar_layout', checkPermission, async (ctx) => {
    if (ctx.session.state !== 'main_edit') return;
    
    ctx.session.state = 'layout_select'; // Volta o estado
    await enviarMenuLayout(ctx); // Envia o menu de layout
  });

  bot.action('generate_final', checkPermission, async (ctx) => {
    if (ctx.session.state !== 'main_edit') return;
    try {
      await ctx.deleteMessage(); 
      await ctx.reply('Gerando sua capa com os dados editados...');
      //... (resto do codigo sem mudancas)
      const animeData = ctx.session.animeData;
      if (!animeData) { /* ... */ }
      const resultadoImagem = await gerarCapa(animeData);
      if (!resultadoImagem.success) { /* ... */ }
      ctx.session = null;
      return ctx.replyWithPhoto({ source: resultadoImagem.buffer });
    } catch (err) { /* ... */ }
  });

  bot.action('cancel_edit', checkPermission, async (ctx) => {
    ctx.session = null;
    await ctx.deleteMessage();
    await ctx.reply('Geracao cancelada.');
  });

  bot.action(['edit_title', 'edit_studio', 'edit_tags', 'edit_rating', 'edit_poster', 'edit_fundo'], checkPermission, async (ctx) => {
    if (ctx.session.state !== 'main_edit') return;
    try {
      const acao = ctx.match[0];
      ctx.session.state = 'awaiting_input'; // Define o estado de "espera"
      ctx.session.awaitingInput = acao; 
      
      let pergunta = 'O que voce quer colocar?';
      if (acao === 'edit_title') pergunta = 'Digite o novo **Titulo**';
      if (acao === 'edit_studio') pergunta = 'Digite o novo **Estudio**';
      if (acao === 'edit_tags') pergunta = 'Digite as novas **Tags** (separadas por virgula)';
      if (acao === 'edit_rating') pergunta = 'Digite a **Classificacao** (ex: 16)';
      if (acao === 'edit_poster') pergunta = 'Envie o **link (URL)** OU faça o **UPLOAD** da nova imagem do Pôster';
      if (acao === 'edit_fundo') pergunta = 'Envie o **link (URL)** OU faça o **UPLOAD** da nova imagem de Fundo';
      
      await ctx.reply(pergunta);
    } catch (err) { /* ... */ }
  });

  // --- ETAPA 3: OUVIR AS RESPOSTAS ---

  bot.on('text', checkPermission, async (ctx) => {
    try {
      if (ctx.message.text.startsWith('/')) return; // Ignora comandos
      
      // So processa se estiver no estado de "espera"
      if (ctx.session.state !== 'awaiting_input' || !ctx.session.animeData) {
        return;
      }

      const state = ctx.session.awaitingInput;
      const animeData = ctx.session.animeData;
      const userInput = ctx.message.text.trim();

      if (state === 'edit_title') {
        animeData.title.romaji = userInput;
      } else if (state === 'edit_studio') {
        animeData.studios.nodes = [{ name: userInput }]; 
      } else if (state === 'edit_tags') {
        animeData.genres = userInput.split(',').map(tag => tag.trim());
      } else if (state === 'edit_rating') {
        animeData.classificacaoManual = userInput;
      } else if (state === 'edit_poster') {
        if (!animeData.coverImage) animeData.coverImage = {};
        animeData.coverImage.large = userInput;
      } else if (state === 'edit_fundo') {
        animeData.bannerImage = userInput;
      }

      ctx.session.state = 'main_edit'; // Retorna ao menu de edicao
      ctx.session.awaitingInput = null;
      ctx.session.animeData = animeData;
      
      await ctx.reply('Dados atualizados!');
      await enviarMenuEdicao(ctx); // Mostra o menu de edicao

    } catch (err) { /* ... */ }
  });

  bot.on('photo', checkPermission, async (ctx) => {
    try {
      if (ctx.session.state !== 'awaiting_input' || !ctx.session.animeData) {
        return; 
      }
      
      const state = ctx.session.awaitingInput;
      const animeData = ctx.session.animeData;
      
      if (state !== 'edit_poster' && state !== 'edit_fundo') {
        return;
      }
      
      const photo = ctx.message.photo.pop();
      const fileLink = await ctx.telegram.getFileLink(photo.file_id);
      const imageUrl = fileLink.href;
      
      if (state === 'edit_poster') {
        if (!animeData.coverImage) animeData.coverImage = {};
        animeData.coverImage.large = imageUrl;
        await ctx.reply('Pôster atualizado com a imagem enviada!');
      } else if (state === 'edit_fundo') {
        animeData.bannerImage = imageUrl;
        await ctx.reply('Fundo atualizado com a imagem enviada!');
      }
      
      ctx.session.state = 'main_edit'; // Retorna ao menu de edicao
      ctx.session.awaitingInput = null;
      ctx.session.animeData = animeData;
      await enviarMenuEdicao(ctx); // Mostra o menu de edicao
      
    } catch (err) { /* ... */ }
  });
}

module.exports = { registerEvents };
