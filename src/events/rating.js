// Arquivo: src/events/rating.js

const { irParaMenuEdicao } = require('./common.js');

module.exports = (bot, checkPermission) => {
  const ratings = ['set_rating_L', 'set_rating_10', 'set_rating_12', 'set_rating_14', 'set_rating_16', 'set_rating_18', 'set_rating_NONE'];
  
  bot.action(ratings, checkPermission, async (ctx) => {
      if (!ctx.session || ctx.session.state !== 'rating_select') return ctx.answerCbQuery();

      const acao = ctx.match[0];
      const map = {
          'set_rating_L': 'L', 'set_rating_10': '10', 'set_rating_12': '12', 
          'set_rating_14': '14', 'set_rating_16': '16', 'set_rating_18': '18', 
          'set_rating_NONE': null
      };
      
      ctx.session.animeData.classificacaoManual = map[acao];
      ctx.session.state = 'main_edit'; 
      
      await ctx.answerCbQuery(`Classificação: ${map[acao] || 'Nenhuma'}`);
      await irParaMenuEdicao(ctx); 
  });

  bot.action('voltar_edicao_principal', checkPermission, async (ctx) => {
    ctx.session.state = 'main_edit';
    await irParaMenuEdicao(ctx);
  });
};
