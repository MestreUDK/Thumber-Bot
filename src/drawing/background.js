// ARQUIVO: src/drawing/background.js
// (ATUALIZADO: Fundo ajustado com 'contain()' para evitar cortes)

const Jimp = require('jimp');

async function drawBackground(image, bannerUrl, width, height, posterWidth) {
  
  const backgroundWidth = width - posterWidth;

  if (bannerUrl) {
    const banner = await Jimp.read(bannerUrl);
    
    // *** MUDANÇA AQUI: De .cover() para .contain() ***
    // .contain() vai redimensionar o banner para CABER DENTRO da area (backgroundWidth, height)
    // Se a proporção for diferente, ele deixará barras (preenchidas com preto)
    // para não cortar o conteúdo da imagem original.
    banner.contain(backgroundWidth, height);
    
    // Compõe a imagem do banner na posição (0,0)
    image.composite(banner, 0, 0); 
  }

  const overlay = new Jimp(backgroundWidth, height, '#000000');
  overlay.opacity(0.6);
  image.composite(overlay, 0, 0); 
}

module.exports = { drawBackground };
