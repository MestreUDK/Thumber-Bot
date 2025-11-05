// ARQUIVO: src/drawing/background.js
// (ATUALIZADO: Fundo ajustado com 'resize()' para preencher totalmente, permitindo distorção)

const Jimp = require('jimp');

async function drawBackground(image, bannerUrl, width, height, posterWidth) {
  
  const backgroundWidth = width - posterWidth;

  if (bannerUrl) {
    const banner = await Jimp.read(bannerUrl);
    
    // *** MUDANÇA AQUI: De .contain() para .resize() ***
    // .resize() vai esticar ou encolher a imagem para preencher exatamente
    // backgroundWidth x height, mesmo que isso cause distorção da proporção original.
    banner.resize(backgroundWidth, height);
    
    image.composite(banner, 0, 0); 
  }

  const overlay = new Jimp(backgroundWidth, height, '#000000');
  overlay.opacity(0.6);
  image.composite(overlay, 0, 0); 
}

module.exports = { drawBackground };
