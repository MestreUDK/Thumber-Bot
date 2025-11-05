// ARQUIVO: src/drawing/background.js
// (ATUALIZADO: Altura do fundo ajustada para 720px)

const Jimp = require('jimp');

async function drawBackground(image, bannerUrl, width, height, posterWidth) {
  
  const backgroundWidth = width - posterWidth;
  
  // --- *** MUDANCA AQUI *** ---
  const desiredBackgroundHeight = 720; // Altura desejada para o fundo
  // --- *** FIM DA MUDANCA *** ---

  if (bannerUrl) {
    const banner = await Jimp.read(bannerUrl);
    
    // ATUALIZADO: Aplica .cover() na altura desejada
    banner.cover(backgroundWidth, desiredBackgroundHeight);
    
    // ATUALIZADO: Compõe o banner a partir do topo (0,0) na altura desejada
    image.composite(banner, 0, 0); 
  }

  // ATUALIZADO: O overlay tambem so cobre a area restante e a altura desejada
  const overlay = new Jimp(backgroundWidth, desiredBackgroundHeight, '#000000');
  overlay.opacity(0.6);
  image.composite(overlay, 0, 0); 
}

module.exports = { drawBackground };
