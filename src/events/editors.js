// Arquivo: src/events/editors.js

const { enviarMenuClassificacao } = require('../menus/index.js');
const { lerPasscode } = require('../passcode.js');
const { irParaMenuEdicao } = require('./common.js');

module.exports = (bot, checkPermission) => {

  // --- BOTÕES QUE PEDEM INPUT ---
  bot.action(['edit_title', 'edit_studio', 'edit_tags', 'edit_poster', 'edit_fundo', 'edit_info'], checkPermission, async (ctx) => {
    if (!ctx.session || ctx.session.state !== 'main_edit') return ctx.answerCbQuery();
    const acao = ctx.match[0];
    ctx.session.state = 'awaiting_input'; 
    ctx.session.awaitingInput = acao; 
    
    let pergunta = 'Digite o novo valor:';
    if(acao === 'edit_title') pergunta = 'Digite o novo **Título**:';
    if(acao === 'edit_info') pergunta = 'Digite a nova **Info**:';
    if(acao === 'edit_studio') pergunta = 'Digite o novo **Estúdio**:';
    if(acao === 'edit_tags') pergunta = 'Digite as **Tags** (separadas por vírgula):';
    if(acao === 'edit_poster') pergunta = 'Envie a imagem ou link do **Pôster**:';
    if(acao === 'edit_fundo') pergunta = 'Envie a imagem ou link do **Fundo**:';

    await ctx.reply(pergunta, { parse_mode: 'Markdown' });
  });

  // --- BOTÃO DE RATING ---
  bot.action('edit_rating', checkPermission, async (ctx) => {
    ctx.session.state = 'rating_select'; 
    await enviarMenuClassificacao(ctx);
  });

  // --- RECEBIMENTO DE TEXTO ---
  bot.on('text', checkPermission, async (ctx) => {
    if (ctx.message.text.startsWith('/')) return;

    // 1. RESTAURAR PASSCODE
    if (ctx.session.state === 'awaiting_passcode') {
        const codigo = ctx.message.text.trim();
        const dados = lerPasscode(codigo);
        if (!dados) return ctx.reply('❌ Código inválido.');
        
        ctx.session.animeData = dados;
        ctx.session.state = 'main_edit';
        
        if (dados.description || dados.abrev || dados.seasonName) {
             ctx.session.isPostMode = true;
             await ctx.reply('✅ Dados de **POST** restaurados.');
        } else {
             ctx.session.isPostMode = false;
             await ctx.reply('✅ Dados de **CAPA** restaurados.');
        }
        return await irParaMenuEdicao(ctx);
    }

    // 2. EDIÇÃO DE CAMPOS
    if (ctx.session.state !== 'awaiting_input' || !ctx.session.animeData) return;
    const state = ctx.session.awaitingInput;
    const anime = ctx.session.animeData;
    const input = ctx.message.text.trim();

    if (state === 'edit_title') anime.title.romaji = input;
    if (state === 'edit_info') anime.infoManual = input;
    if (state === 'edit_studio') anime.studios.nodes = [{ name: input }];
    if (state === 'edit_tags') anime.genres = input.split(',').map(t => t.trim());
    
    // Tratamento especial para URLs de imagem via texto
    if (state === 'edit_poster') {
        if (!anime.coverImage) anime.coverImage = {};
        anime.coverImage.large = input;
    }
    if (state === 'edit_fundo') anime.bannerImage = input;

    ctx.session.state = 'main_edit';
    ctx.session.awaitingInput = null;
    await ctx.reply('✅ Atualizado!');
    await irParaMenuEdicao(ctx);
  });

  // --- RECEBIMENTO DE FOTOS ---
  bot.on('photo', checkPermission, async (ctx) => {
      if (ctx.session.state !== 'awaiting_input') return;
      const state = ctx.session.awaitingInput;
      if (state !== 'edit_poster' && state !== 'edit_fundo') return;
      
      const fileLink = await ctx.telegram.getFileLink(ctx.message.photo.pop().file_id);
      const url = fileLink.href;
      
      if (state === 'edit_poster') {
          if (!ctx.session.animeData.coverImage) ctx.session.animeData.coverImage = {};
          ctx.session.animeData.coverImage.large = url;
      }
      if (state === 'edit_fundo') ctx.session.animeData.bannerImage = url;
      
      ctx.session.state = 'main_edit';
      ctx.session.awaitingInput = null;
      await ctx.reply('✅ Imagem recebida!');
      await irParaMenuEdicao(ctx);
  });
};
