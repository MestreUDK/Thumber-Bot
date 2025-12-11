// Arquivo: src/menus/sources.js

const { Markup } = require('telegraf');

async function enviarMenuFonteDados(ctx) {
  const nomeDoAnime = ctx.session.searchTitle || "Anime Desconhecido";
  const texto = `
Como você quer obter os dados para:
` + "```" + `${nomeDoAnime}` + "```" + `
`;

  const botoes = Markup.inlineKeyboard([
    [
      Markup.button.callback('🔗 Anilist', 'source_anilist'),
      Markup.button.callback('✍️ Manual', 'source_manual')
    ],
    [
      Markup.button.callback('❌ Cancelar Busca', 'cancel_edit')
    ]
  ]);

  try { if (ctx.callbackQuery) await ctx.deleteMessage(); } catch (e) {}
  await ctx.reply(texto, botoes);
}

module.exports = { enviarMenuFonteDados };
