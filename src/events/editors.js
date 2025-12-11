// ARQUIVO: src/events/editors.js
// (ATUALIZADO: Limpeza de input no Passcode)

const { enviarMenuClassificacao } = require('../menus/index.js');
const { lerPasscode } = require('../passcode.js');
const { irParaMenuEdicao } = require('./common.js');

module.exports = (bot, checkPermission) => {

  // --- BOTÕES DE EDIÇÃO ---
  const botoesEdicao = [
      'edit_title', 'edit_studio', 'edit_tags', 'edit_poster', 'edit_fundo', 'edit_info',
      'edit_abrev', 'edit_audio', 'edit_synopsis', 
      'edit_season_num', 'edit_episodes', 'edit_part_num', 'edit_season_name',
      'edit_alt_name', 'edit_year', 'edit_season', 'edit_type', 'edit_status',
      'edit_season_url'
  ];

  bot.action(botoesEdicao, checkPermission, async (ctx) => {
    if (!ctx.session || ctx.session.state !== 'main_edit') return ctx.answerCbQuery();
    const acao = ctx.match[0];
    ctx.session.state = 'awaiting_input'; 
    ctx.session.awaitingInput = acao; 
    
    let pergunta = 'Digite o novo valor:';
    
    if(acao === 'edit_alt_name') pergunta = 'Digite o **Nome Alternativo**:';
    if(acao === 'edit_year') pergunta = 'Digite o **Ano**:';
    if(acao === 'edit_season_url') pergunta = 'Envie o **Link (URL)** para a Temporada:';
    // ... (demais perguntas personalizadas podem ficar aqui ou usar o padrão)

    await ctx.reply(pergunta, { parse_mode: 'Markdown' });
  });

  bot.action('edit_rating', checkPermission, async (ctx) => {
    ctx.session.state = 'rating_select'; 
    await enviarMenuClassificacao(ctx);
  });

  // --- TEXTO ---
  bot.on('text', checkPermission, async (ctx) => {
    if (ctx.message.text.startsWith('/')) return;

    // 1. RESTAURAR PASSCODE
    if (ctx.session.state === 'awaiting_passcode') {
        // Limpa espaços e crases que podem vir na cópia
        const codigo = ctx.message.text.replace(/`/g, '').trim();
        
        const dados = lerPasscode(codigo);
        if (!dados) return ctx.reply('❌ Código inválido. Verifique se copiou corretamente.');
        
        ctx.session.animeData = dados;
        ctx.session.state = 'main_edit';
        
        // Detecção de modo
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

    // 2. EDIÇÃO DE CAMPOS
    if (ctx.session.state !== 'awaiting_input' || !ctx.session.animeData) return;
    const state = ctx.session.awaitingInput;
    const anime = ctx.session.animeData;
    const input = ctx.message.text.trim();

    // Mapeamento Geral
    if (state === 'edit_title') anime.title.romaji = input;
    if (state === 'edit_info') anime.infoManual = input;
    if (state === 'edit_studio') anime.studios.nodes = [{ name: input }];
    if (state === 'edit_tags') anime.genres = input.split(',').map(t => t.trim());
    
    // Post
    if (state === 'edit_abrev') anime.abrev = input;
    if (state === 'edit_audio') anime.audio = input;
    if (state === 'edit_synopsis') anime.description = input;
    if (state === 'edit_season_num') anime.seasonNum = input;
    if (state === 'edit_episodes') anime.episodes = input;
    if (state === 'edit_part_num') anime.partNum = input;
    if (state === 'edit_season_name') anime.seasonName = input;

    // Manuais e Link
    if (state === 'edit_alt_name') anime.title.english = input;
    if (state === 'edit_year') anime.yearManual = input;
    if (state === 'edit_type') anime.typeManual = input;
    if (state === 'edit_status') anime.statusManual = input;
    if (state === 'edit_season') anime.seasonManual = input;
    if (state === 'edit_season_url') anime.seasonUrl = input;

    // Imagens
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

  // FOTOS
  bot.on('photo', checkPermission, async (ctx) => {
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
