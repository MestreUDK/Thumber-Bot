// ARQUIVO: src/drawing/background.js
// (ATUALIZADO: Recebe posterWidth para preencher so o espaco restante)

const Jimp = require('jimp');

// ATUALIZADO: Funcao agora recebe 'posterWidth'
async function drawBackground(image, bannerUrl, width, height, posterWidth) {
  
  // Calcula a largura exata do "pedaco restante"
  const backgroundWidth = width - posterWidth;

  if (bannerUrl) {
    const banner = await Jimp.read(bannerUrl);
    
    // ATUALIZADO: Aplica .cover() apenas na area restante
    banner.cover(backgroundWidth, height);
    image.composite(banner, 0, 0); // Compõe na esquerda (0, 0)
  }

  // ATUALIZADO: O overlay tambem so cobre a area restante
  const overlay = new Jimp(backgroundWidth, height, '#000000');
  overlay.opacity(0.6);
  image.composite(overlay, 0, 0); // Compõe na esquerda, em cima do banner
}

module.exports = { drawBackground };
