// Arquivo: src/menus/ratings.js

const { Markup } = require('telegraf');

async function enviarMenuClassificacao(ctx) {
  const classificacaoAtual = ctx.session.animeData.classificacaoManual || 'Nenhuma';
  const texto = `
Escolha a Classificação Indicativa:

Atual: ` + "```" + `${classificacaoAtual}` + "```" + `
`;

  const botoes = Markup.inlineKeyboard([
    [ Markup.button.callback('🟩 Livre', 'set_rating_L'), Markup.button.callback('🟦 A10', 'set_rating_10'), Markup.button.callback('🟨 A12', 'set_rating_12') ],
    [ Markup.button.callback('🟧 A14', 'set_rating_14'), Markup.button.callback('🟥 A16', 'set_rating_16'), Markup.button.callback('⬛ A18', 'set_rating_18') ],
    [ Markup.button.callback('Remover (Sem Classificação)', 'set_rating_NONE') ],
    [ Markup.button.callback('⬅️ Voltar para Edição', 'voltar_edicao_principal') ]
  ]);

  try { if (ctx.callbackQuery) await ctx.deleteMessage(); } catch (e) {}
  await ctx.reply(texto, botoes);
}

module.exports = { enviarMenuClassificacao };
