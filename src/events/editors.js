// ARQUIVO: src/events/editors.js
const { enviarMenuClassificacao } = require('../menus/index.js');
const { lerPasscode } = require('../passcode.js');
const { irParaMenuEdicao } = require('./common.js');

module.exports = (bot, checkPermission) => {

  // Lista de botões que chamam input de texto
  const botoesEdicao = [
      'edit_title', 'edit_studio', 'edit_tags', 'edit_poster', 'edit_fundo', 'edit_info',
      'edit_abrev', 'edit_audio', 'edit_synopsis', 
      'edit_season_num', 'edit_episodes', 'edit_part_num', 'edit_season_name',
      // NOVOS:
      'edit_alt_name', 'edit_year', 'edit_season', 'edit_type', 'edit_status'
  ];

  bot.action(botoesEdicao, checkPermission, async (ctx) => {
    if (!ctx.session || ctx.session.state !== 'main_edit') return ctx.answerCbQuery();
    const acao = ctx.match[0];
    ctx.session.state = 'awaiting_input'; 
    ctx.session.awaitingInput = acao; 
    
    let pergunta = 'Digite o novo valor:';
    
    // Perguntas personalizadas
    if(acao === 'edit_alt_name') pergunta = 'Digite o **Nome Alternativo** (Ex: Attack on Titan):';
    if(acao === 'edit_year') pergunta = 'Digite o **Ano** (Ex: 2024 ou 2023 à 2024):';
    if(acao === 'edit_type') pergunta = 'Digite o **Tipo** (Ex: #TV ou #Filme):';
    if(acao === 'edit_status') pergunta = 'Digite o **Status** (Ex: Completo):';
    
    if(acao === 'edit_season') {
        pergunta = 'Digite a **Temporada**. \n\nDica: Para criar um link, use o formato:\n`[Outono 2024](https://site.com)`';
    }

    await ctx.reply(pergunta, { parse_mode: 'Markdown' });
  });

  // --- BOTÃO RATING ---
  bot.action('edit_rating', checkPermission, async (ctx) => {
    ctx.session.state = 'rating_select'; 
    await enviarMenuClassificacao(ctx);
  });

  // --- RECEBIMENTO DE TEXTO ---
  bot.on('text', checkPermission, async (ctx) => {
    if (ctx.message.text.startsWith('/')) return;

    // 1. Passcode (Mantido igual)
    if (ctx.session.state === 'awaiting_passcode') {
        const codigo = ctx.message.text.trim();
        const dados = lerPasscode(codigo);
        if (!dados) return ctx.reply('❌ Código inválido.');
        ctx.session.animeData = dados;
        ctx.session.state = 'main_edit';
        
        if (dados.mode === 'p') {
             ctx.session.isPostMode = true;
             await ctx.reply('✅ Dados de **POST** restaurados.');
        } else if (dados.mode === 'c') {
             ctx.session.isPostMode = false;
             await ctx.reply('✅ Dados de **CAPA** restaurados.');
        } else {
             // Fallback
             if (dados.description || dados.abrev) {
                 ctx.session.isPostMode = true;
                 await ctx.reply('⚠️ Passcode antigo: Detectado como **POST**.');
             } else {
                 ctx.session.isPostMode = false;
                 await ctx.reply('⚠️ Passcode antigo: Detectado como **CAPA**.');
             }
        }
        return await irParaMenuEdicao(ctx);
    }

    // 2. Edição de Campos
    if (ctx.session.state !== 'awaiting_input' || !ctx.session.animeData) return;
    const state = ctx.session.awaitingInput;
    const anime = ctx.session.animeData;
    const input = ctx.message.text.trim();

    // Mapeamento Existente
    if (state === 'edit_title') anime.title.romaji = input;
    if (state === 'edit_info') anime.infoManual = input;
    if (state === 'edit_studio') anime.studios.nodes = [{ name: input }];
    if (state === 'edit_tags') anime.genres = input.split(',').map(t => t.trim());
    if (state === 'edit_abrev') anime.abrev = input;
    if (state === 'edit_audio') anime.audio = input;
    if (state === 'edit_synopsis') anime.description = input;
    if (state === 'edit_season_num') anime.seasonNum = input;
    if (state === 'edit_episodes') anime.episodes = input;
    if (state === 'edit_part_num') anime.partNum = input;
    if (state === 'edit_season_name') anime.seasonName = input;

    // --- NOVOS CAMPOS ---
    if (state === 'edit_alt_name') anime.title.english = input;
    if (state === 'edit_year') anime.yearManual = input;
    if (state === 'edit_type') anime.typeManual = input;
    if (state === 'edit_status') anime.statusManual = input;
    if (state === 'edit_season') anime.seasonManual = input; // Salva o link ou texto
    // --------------------

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

  // Handler de fotos (Mantido)
  bot.on('photo', checkPermission, async (ctx) => {
      // ... (sem alterações)
      if (ctx.session.state !== 'awaiting_input') return;
      const fileLink = await ctx.telegram.getFileLink(ctx.message.photo.pop().file_id);
      const url = fileLink.href;
      if (ctx.session.awaitingInput === 'edit_poster') {
          if (!ctx.session.animeData.coverImage) ctx.session.animeData.coverImage = {};
          ctx.session.animeData.coverImage.large = url;
      }
      if (ctx.session.awaitingInput === 'edit_fundo') ctx.session.animeData.bannerImage = url;
      ctx.session.state = 'main_edit';
      ctx.session.awaitingInput = null;
      await ctx.reply('✅ Imagem recebida!');
      await irParaMenuEdicao(ctx);
  });
};
