// ARQUIVO: src/events/common.js

// Importa todos os menus
const { enviarMenuEdicao, enviarMenuEdicaoFilme, enviarMenuEdicaoPost } = require('../menus/index.js');

async function irParaMenuEdicao(ctx) {
  // 1. Se for modo POST, vai direto para o menu de Post
  if (ctx.session.isPostMode) {
      return await enviarMenuEdicaoPost(ctx);
  }

  // 2. Se for modo CAPA, verifica o layout
  const layout = ctx.session.animeData.layout || 'TV';
  if (layout === 'FILME') {
    await enviarMenuEdicaoFilme(ctx);
  } else {
    await enviarMenuEdicao(ctx);
  }
}

module.exports = { irParaMenuEdicao };
