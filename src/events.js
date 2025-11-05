// ARQUIVO: src/events.js
// (Atualizado para o fluxo de classificacao E 'edit_info')

const { gerarCapa } = require('./image.js');
// ATUALIZADO: Importa os 4 menus
const { 
  enviarMenuLayout, 
  enviarMenuEdicao, 
  enviarMenuEdicaoFilme, 
  enviarMenuClassificacao // Importa o novo menu
} = require('./confirmation.js');

// --- Funcao interna (Sem alteracao) ---
async function irParaMenuEdicao(ctx) {
  const layout = ctx.session.animeData.layout || 'TV';

  if (layout === 'FILME') {
    await enviarMenuEdicaoFilme(ctx);
  } else {
    await enviarMenuEdicao(ctx);
  }
}


function registerEvents(bot, checkPermission) {

  // --- ETAPA 1: BOTOES DE LAYOUT (Sem alteracao) ---
  bot.action(['set_layout_TV', 'set_layout_FILME', 'set_layout_ONA'], checkPermission, async (ctx) => {
    // ... (codigo mantido)
    if (ctx.session.state !== 'layout_select' || !ctx.session.animeData) {
        return ctx.answerCbQuery('Comando invalido. Use /capa primeiro.');
    }
    const acao = ctx.match[0];
    const novoLayout = acao.replace('set_layout_', '');
    ctx.session.animeData.layout = novoLayout;
    await enviarMenuLayout(ctx);
  });

  bot.action('ir_para_edicao', checkPermission, async (ctx) => {
    // ... (codigo mantido)
    if (!ctx.session || ctx.session.state !== 'layout_select') return ctx.answerCbQuery();
    ctx.session.state = 'main_edit';
    await irParaMenuEdicao(ctx); 
  });

  // --- ETAPA 2: BOTOES DE EDICAO (COM MUDANCAS) ---

  bot.action('voltar_layout', checkPermission, async (ctx) => {
    // ... (codigo mantido)
    if (!ctx.session || (ctx.session.state !== 'main_edit' && ctx.session.state !== 'awaiting_input' && ctx.session.state !== 'rating_select')) return ctx.answerCbQuery();
    ctx.session.state = 'layout_select';
    ctx.session.awaitingInput = null;
    await enviarMenuLayout(ctx);
  });

  bot.action('generate_final', checkPermission, async (ctx) => {
    // ... (codigo mantido)
    if (!ctx.session || ctx.session.state !== 'main_edit') return ctx.answerCbQuery();
    try {
      await ctx.deleteMessage(); 
      await ctx.reply('Gerando sua capa com os dados editados...');
      const animeData = ctx.session.animeData;
      if (!animeData) { return ctx.reply('Sessao expirada.'); }
      
      const resultadoImagem = await gerarCapa(animeData);
      
      // *** ATUALIZADO: Agora pega erros da geracao de imagem (links 404) ***
      if (!resultadoImagem.success) {
        return ctx.reply(`Erro ao gerar imagem: ${resultadoImagem.error}`);
      }
      
      ctx.session = null;
      return ctx.replyWithPhoto({ source: resultadoImagem.buffer });
    } catch (err) { console.error('ERRO NO BOTAO GERAR:', err); }
  });

  bot.action('cancel_edit', checkPermission, async (ctx) => {
    // ... (codigo mantido)
    ctx.session = null;
    await ctx.deleteMessage();
    await ctx.reply('Geracao cancelada.');
  });

  // Botoes de Edicao (Texto e Imagem)
  // --- *** MUDANCA: 'edit_rating' removido, 'edit_info' adicionado *** ---
  bot.action(['edit_title', 'edit_studio', 'edit_tags', 'edit_poster', 'edit_fundo', 'edit_info'], checkPermission, async (ctx) => {
    if (!ctx.session || ctx.session.state !== 'main_edit') return ctx.answerCbQuery();
    try {
      const acao = ctx.match[0];
      ctx.session.state = 'awaiting_input'; 
      ctx.session.awaitingInput = acao; 

      let pergunta = 'O que voce quer colocar?';
      if (acao === 'edit_title') pergunta = 'Digite o novo **Titulo**';
      if (acao === 'edit_info') pergunta = 'Digite a nova **Info** (ex: VERAO 2024 - 12 EPISÓDIOS)'; // <-- ADICIONADO
      if (acao === 'edit_studio') pergunta = 'Digite o novo **Estudio**';
      if (acao === 'edit_tags') pergunta = 'Digite as novas **Tags** (separadas por virgula)';
      if (acao === 'edit_poster') pergunta = 'Envie o **link (URL)** OU faça o **UPLOAD** da nova imagem do Pôster';
      if (acao === 'edit_fundo') pergunta = 'Envie o **link (URL)** OU faça o **UPLOAD** da nova imagem de Fundo';

      await ctx.reply(pergunta);
    } catch (err) { console.error('ERRO NO BOTAO EDITAR:', err); }
  });

  // --- *** Handler exclusivo para 'edit_rating' (Mantido) *** ---
  bot.action('edit_rating', checkPermission, async (ctx) => {
    if (!ctx.session || ctx.session.state !== 'main_edit') return ctx.answerCbQuery('Estado invalido.');
    ctx.session.state = 'rating_select'; 
    await enviarMenuClassificacao(ctx); // Chama o novo menu
  });


  // --- ETAPA 3: OUVIR AS RESPOSTAS (COM MUDANCAS) ---

  bot.on('text', checkPermission, async (ctx) => {
    try {
      if (ctx.message.text.startsWith('/')) return; 
      if (ctx.session.state !== 'awaiting_input' || !ctx.session.animeData) { return; }

      const state = ctx.session.awaitingInput;
      const animeData = ctx.session.animeData;
      const userInput = ctx.message.text.trim();

      if (state === 'edit_title') { animeData.title.romaji = userInput; }
      if (state === 'edit_info') { animeData.infoManual = userInput; } // <-- ADICIONADO
      if (state === 'edit_studio') { animeData.studios.nodes = [{ name: userInput }]; }
      if (state === 'edit_tags') { animeData.genres = userInput.split(',').map(tag => tag.trim()); }
      // --- 'edit_rating' foi removido daqui (corretamente) ---
      if (state === 'edit_poster') {
        if (!animeData.coverImage) animeData.coverImage = {};
        animeData.coverImage.large = userInput;
      }
      if (state === 'edit_fundo') { animeData.bannerImage = userInput; }

      ctx.session.state = 'main_edit'; 
      ctx.session.awaitingInput = null;
      ctx.session.animeData = animeData;

      await ctx.reply('Dados atualizados!');
      await irParaMenuEdicao(ctx); 

    } catch (err) { console.error('ERRO AO PROCESSAR TEXTO:', err); }
  });

  bot.on('photo', checkPermission, async (ctx) => {
    // ... (codigo mantido)
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
      await irParaMenuEdicao(ctx);

    } catch (err) { console.error('ERRO AO PROCESSAR FOTO:', err); }
  });

  // --- *** ETAPA 4: NOVOS HANDLERS PARA BOTOES DE CLASSIFICACAO *** ---
  // (Sem alteracao, mantido como voce enviou)
  bot.action(
    [
      'set_rating_L', 'set_rating_10', 'set_rating_12', 
      'set_rating_14', 'set_rating_16', 'set_rating_18', 'set_rating_NONE'
    ], 
    checkPermission, 
    async (ctx) => {
      // Verifica se estamos no estado correto
      if (!ctx.session || ctx.session.state !== 'rating_select') return ctx.answerCbQuery();

      const acao = ctx.match[0];
      let novaClassificacao = null;

      if (acao === 'set_rating_L') novaClassificacao = 'L';
      if (acao === 'set_rating_10') novaClassificacao = '10';
      if (acao === 'set_rating_12') novaClassificacao = '12';
      if (acao === 'set_rating_14') novaClassificacao = '14';
      if (acao === 'set_rating_16') novaClassificacao = '16';
      if (acao === 'set_rating_18') novaClassificacao = '18';
      if (acao === 'set_rating_NONE') novaClassificacao = null;

      // Salva a escolha na sessao
      ctx.session.animeData.classificacaoManual = novaClassificacao;
      // Volta ao menu principal
      ctx.session.state = 'main_edit'; 

      await ctx.answerCbQuery(`Classificação definida como: ${novaClassificacao || 'Nenhuma'}`);

      // Mostra o menu de edição principal atualizado
      await irParaMenuEdicao(ctx); 
    }
  );

  bot.action('voltar_edicao_principal', checkPermission, async (ctx) => {
    // Verifica se estamos no estado correto
    if (!ctx.session || ctx.session.state !== 'rating_select') return ctx.answerCbQuery();

    // Apenas volta o estado e chama o menu principal
    ctx.session.state = 'main_edit';
    await irParaMenuEdicao(ctx);
  });
}

module.exports = { registerEvents };
