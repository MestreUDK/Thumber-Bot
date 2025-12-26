// ARQUIVO: src/events/sources.js
const { buscarAnime } = require('../anilist.js');
const { enviarMenuLayout, enviarMenuFonteDados } = require('../menus/index.js');
// Importamos a função de navegação inteligente
const { irParaMenuEdicao } = require('./common.js');

module.exports = (bot, checkPermission) => {

  // --- ANILIST ---
  bot.action('source_anilist', checkPermission, async (ctx) => {
    try {
      if (!ctx.session || ctx.session.state !== 'source_select') return ctx.answerCbQuery('Sessão expirada.');
      const nomeDoAnime = ctx.session.searchTitle;
      await ctx.deleteMessage();
      await ctx.reply(`Buscando dados no AniList para: ${nomeDoAnime}...`);

      const resultadoApi = await buscarAnime(nomeDoAnime);

      if (!resultadoApi.success) {
        await ctx.reply(`Falha ao buscar: ${resultadoApi.error}\n\nTente buscar manualmente.`);
        return await enviarMenuFonteDados(ctx);
      }

      const anime = resultadoApi.data;
      // Inicializa campos extras
      anime.classificacaoManual = null; anime.infoManual = null; 
      anime.abrev = null; anime.audio = null;
      anime.seasonNum = null; anime.partNum = null; anime.seasonName = null;

      // --- TRADUÇÃO AUTOMÁTICA DA ORIGEM (v1.5.0) ---
      const sourceMap = {
          'MANGA': 'Mangá',
          'LIGHT_NOVEL': 'Light Novel',
          'ORIGINAL': 'Original',
          'VISUAL_NOVEL': 'Visual Novel',
          'VIDEO_GAME': 'Game',
          'NOVEL': 'Novel',
          'DOUJINSHI': 'Doujin',
          'WEB_NOVEL': 'Web Novel'
      };
      // Se a API trouxer a fonte, traduz. Se não, define como 'Outro'.
      anime.origem = sourceMap[anime.source] || "Outro";
      // ----------------------------------------------

      const formato = anime.format ? String(anime.format).toUpperCase() : 'TV';
      if (formato === 'MOVIE') anime.layout = 'FILME';
      else if (formato === 'ONA') anime.layout = 'ONA';
      else anime.layout = 'TV';

      ctx.session.animeData = anime; 

      // --- LÓGICA DE NAVEGAÇÃO ---
      if (ctx.session.isPostMode) {
          ctx.session.state = 'main_edit';
          // Usa a função centralizada para abrir o menu de Post
          await irParaMenuEdicao(ctx);
      } else {
          ctx.session.state = 'layout_select';
          await enviarMenuLayout(ctx);
      }

    } catch (err) { console.error('ERRO EM source_anilist:', err); }
  });

  // --- MANUAL ---
  bot.action('source_manual', checkPermission, async (ctx) => {
    try {
      if (!ctx.session || ctx.session.state !== 'source_select') return ctx.answerCbQuery('Sessão expirada.');
      const nomeDoAnime = ctx.session.searchTitle || "Anime Sem Título";
      
      const anime = {
        title: { romaji: nomeDoAnime, english: null },
        season: null, seasonYear: null, episodes: null,
        studios: { nodes: [] }, genres: [], averageScore: null,
        format: 'TV', status: null, description: null,
        startDate: { year: null }, endDate: { year: null },
        coverImage: { large: null }, bannerImage: null,
        classificacaoManual: null, infoManual: null, layout: 'TV',
        abrev: null, audio: null, seasonNum: null, partNum: null, seasonName: null,
        
        origem: 'Mangá' // <--- Padrão para Manual (v1.5.0)
      };

      ctx.session.animeData = anime;
      await ctx.deleteMessage();

      // --- LÓGICA DE NAVEGAÇÃO ---
      if (ctx.session.isPostMode) {
          ctx.session.state = 'main_edit'; 
          await ctx.reply('Modo manual ativado (Post).');
          await irParaMenuEdicao(ctx);
      } else {
          ctx.session.state = 'layout_select'; 
          await ctx.reply('Modo manual ativado. Escolha o layout.');
          await enviarMenuLayout(ctx);
      }

    } catch (err) { console.error('ERRO EM source_manual:', err); }
  });
};