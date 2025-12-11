// Arquivo: src/events/common.js

const { enviarMenuEdicao, enviarMenuEdicaoFilme } = require('../confirmation.js');

async function irParaMenuEdicao(ctx) {
  const layout = ctx.session.animeData.layout || 'TV';
  if (layout === 'FILME') {
    await enviarMenuEdicaoFilme(ctx);
  } else {
    await enviarMenuEdicao(ctx);
  }
}

module.exports = { irParaMenuEdicao };
