// Arquivo: src/menus/layout.js

const { Markup } = require('telegraf');

async function enviarMenuLayout(ctx) {
  const layout = ctx.session.animeData.layout || 'TV';
  const texto = `
Qual modelo de capa voce quer usar?

Modelo Atual: ` + "```" + `${layout}` + "```" + `
`;

  const botoes = Markup.inlineKeyboard([
    [ 
      Markup.button.callback('📺 TV', 'set_layout_TV'),
      Markup.button.callback('🎬 Filme', 'set_layout_FILME'),
      Markup.button.callback('📼 ONA', 'set_layout_ONA')
    ],
    [ Markup.button.callback('Próximo Passo (Editar Dados) ➡️', 'ir_para_edicao') ],
    [ Markup.button.callback('⬅️ Voltar (Fonte de Dados)', 'voltar_source_select') ] 
  ]);

  try { if (ctx.callbackQuery) await ctx.deleteMessage(); } catch (e) {}
  await ctx.reply(texto, botoes);
}

module.exports = { enviarMenuLayout };
