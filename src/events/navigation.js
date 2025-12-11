// Arquivo: src/events/navigation.js

const { enviarMenuLayout, enviarMenuFonteDados } = require('../confirmation.js');
const { irParaMenuEdicao } = require('./common.js');

module.exports = (bot, checkPermission) => {

  bot.action(['set_layout_TV', 'set_layout_FILME', 'set_layout_ONA'], checkPermission, async (ctx) => {
    if (ctx.session.state !== 'layout_select') return ctx.answerCbQuery();
    ctx.session.animeData.layout = ctx.match[0].replace('set_layout_', '');
    await enviarMenuLayout(ctx);
  });

  bot.action('ir_para_edicao', checkPermission, async (ctx) => {
    if (!ctx.session) return ctx.answerCbQuery();
    ctx.session.state = 'main_edit';
    await irParaMenuEdicao(ctx); 
  });

  bot.action('voltar_source_select', checkPermission, async (ctx) => {
    if (!ctx.session) return ctx.answerCbQuery();
    ctx.session.state = 'source_select'; 
    ctx.session.animeData = null; 
    await enviarMenuFonteDados(ctx); 
  });

  bot.action('voltar_layout', checkPermission, async (ctx) => {
    if (!ctx.session) return ctx.answerCbQuery();
    ctx.session.state = 'layout_select';
    ctx.session.awaitingInput = null;
    await enviarMenuLayout(ctx);
  });

  bot.action('cancel_edit', checkPermission, async (ctx) => {
    ctx.session = null; 
    await ctx.deleteMessage();
    await ctx.reply('Operação cancelada.');
  });
};
