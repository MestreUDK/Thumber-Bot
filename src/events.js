// ARQUIVO: src/events.js
// (Atualizado para escolher entre menu Completo ou Filme)

const { gerarCapa } = require('./image.js');
// ATUALIZADO: Importa os 3 menus
const { enviarMenuLayout, enviarMenuEdicao, enviarMenuEdicaoFilme } = require('./confirmation.js');

// --- *** FUNCAO INTERNA: Decide qual menu de edicao mostrar *** ---
async function irParaMenuEdicao(ctx) {
  const layout = ctx.session.animeData.layout || 'TV';
  
  if (layout === 'FILME') {
    await enviarMenuEdicaoFilme(ctx);
  } else {
    // Para 'TV' ou 'ONA'
    await enviarMenuEdicao(ctx);
  }
}


function registerEvents(bot, checkPermission) {

  // --- ETAPA 1: BOTOES DE LAYOUT ---
  
  bot.action(['set_layout_TV', 'set_layout_FILME', 'set_layout_ONA'], checkPermission, async (ctx) => {
    if (ctx.session.state !== 'layout_select' || !ctx.session.animeData) {
        return ctx.answerCbQuery('Comando invalido. Use /capa primeiro.');
    }
    
    const acao = ctx.match[0];
    const novoLayout = acao.replace('set_layout_', '');
    
    ctx.session.animeData.layout = novoLayout;
    
    await enviarMenuLayout(ctx);
  });

  bot.action('ir_para_edicao', checkPermission, async (ctx) => {
    if (!ctx.session || ctx.session.state !== 'layout_select') return ctx.answerCbQuery();
    
    ctx.session.state = 'main_edit';
    // --- *** MUDANCA: Chama a funcao inteligente *** ---
    await irParaMenuEdicao(ctx); 
  });

  // --- ETAPA 2: BOTOES DE EDICAO ---
  
  bot.action('voltar_layout', checkPermission, async (ctx) => {
    // Funciona em qualquer estado de edicao
    if (!ctx.session || (ctx.session.state !== 'main_edit' && ctx.session.state !== 'awaiting_input')) return ctx.answerCbQuery();
    
    ctx.session.state = 'layout_select';
    ctx.session.awaitingInput = null; // Limpa o "esperando input"
    await enviarMenuLayout(ctx);
  });

  bot.action('generate_final', checkPermission, async (ctx) => {
    if (!ctx.session || ctx.session.state !== 'main_edit') return ctx.answerCbQuery();
    try {
      await ctx.deleteMessage(); 
      await ctx.reply('Gerando sua capa com os dados editados...');
      
      const animeData = ctx.session.animeData;
      if (!animeData) { return ctx.reply('Sessao expirada.'); }
      const resultadoImagem = await gerarCapa(animeData);

      if (!resultadoImagem.success) {
        return ctx.reply(`Erro ao gerar imagem: ${resultadoImagem.error}`);
      }
      
      ctx.session = null;
      return ctx.replyWithPhoto({ source: resultadoImagem.buffer });
    } catch (err) { console.error('ERRO NO BOTAO GERAR:', err); }
  });

  bot.action('cancel_edit', checkPermission, async (ctx) => {
    ctx.session = null;
    await ctx.deleteMessage();
    await ctx.reply('Geracao cancelada.');
  });

  // Botoes de Edicao (agora inclui os de imagem)
  bot.action(['edit_title', 'edit_studio', 'edit_tags', 'edit_rating', 'edit_poster', 'edit_fundo'], checkPermission, async (ctx) => {
    if (!ctx.session || ctx.session.state !== 'main_edit') return ctx.answerCbQuery();
    try {
      const acao = ctx.match[0];
      ctx.session.state = 'awaiting_input'; 
      ctx.session.awaitingInput = acao; 
      
      let pergunta = 'O que voce quer colocar?';
      if (acao === 'edit_title') pergunta = 'Digite o novo **Titulo**';
      if (acao === 'edit_studio') pergunta = 'Digite o novo **Estudio**';
      if (acao === 'edit_tags') pergunta = 'Digite as novas **Tags** (separadas por virgula)';
      if (acao === 'edit_rating') pergunta = 'Digite a **Classificacao** (ex: 16)';
      if (acao === 'edit_poster') pergunta = 'Envie o **link (URL)** OU faça o **UPLOAD** da nova imagem do Pôster';
      if (acao === 'edit_fundo') pergunta = 'Envie o **link (URL)** OU faça o **UPLOAD** da nova imagem de Fundo';
      
      await ctx.reply(pergunta);
    } catch (err) { console.error('ERRO NO BOTAO EDITAR:', err); }
  });

  // --- ETAPA 3: OUVIR AS RESPOSTAS ---

  bot.on('text', checkPermission, async (ctx) => {
    try {
      if (ctx.message.text.startsWith('/')) return; 
      if (ctx.session.state !== 'awaiting_input' || !ctx.session.animeData) { return; }

      const state = ctx.session.awaitingInput;
      const animeData = ctx.session.animeData;
      const userInput = ctx.message.text.trim();

      if (state === 'edit_title') { animeData.title.romaji = userInput; }
      if (state === 'edit_studio') { animeData.studios.nodes = [{ name: userInput }]; }
      if (state === 'edit_tags') { animeData.genres = userInput.split(',').map(tag => tag.trim()); }
      if (state === 'edit_rating') { animeData.classificacaoManual = userInput; }
      if (state === 'edit_poster') {
        if (!animeData.coverImage) animeData.coverImage = {};
        animeData.coverImage.large = userInput;
      }
      if (state === 'edit_fundo') { animeData.bannerImage = userInput; }

      ctx.session.state = 'main_edit'; 
      ctx.session.awaitingInput = null;
      ctx.session.animeData = animeData;
      
      await ctx.reply('Dados atualizados!');
      // --- *** MUDANCA: Chama a funcao inteligente *** ---
      await irParaMenuEdicao(ctx); 

    } catch (err) { console.error('ERRO AO PROCESSAR TEXTO:', err); }
  });

  bot.on('photo', checkPermission, async (ctx) => {
    try {
      if (ctx.session.state !== 'awaiting_input' || !ctx.session.animeData) { return; }
      
      const state = ctx.session.awaitingInput;
      const animeData = ctx.session.animeData;
      if (state !== 'edit_poster' && state !== 'edit_fundo') { return; }
      
      const photo = ctx.message.photo.pop();
      const fileLink = await ctx.telegram.getFileLink(photo.file_id);
      const imageUrl = fileLink.href;
      
      if (state === 'edit_poster') {
        if (!animeData.coverImage) animeData.coverImage = {};
        animeData.coverImage.large = imageUrl;
        await ctx.reply('Pôster atualizado com a imagem enviada!');
      } 
      if (state === 'edit_fundo') {
        animeData.bannerImage = imageUrl;
        await ctx.reply('Fundo atualizado com a imagem enviada!');
      }
      
      ctx.session.state = 'main_edit'; 
      ctx.session.awaitingInput = null;
      ctx.session.animeData = animeData;
      // --- *** MUDANCA: Chama a funcao inteligente *** ---
      await irParaMenuEdicao(ctx);
      
    } catch (err) { console.error('ERRO AO PROCESSAR FOTO:', err); }
  });
}

module.exports = { registerEvents };
