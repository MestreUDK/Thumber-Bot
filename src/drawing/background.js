// ARQUIVO: src/drawing/background.js
// (CORRIGIDO: Utiliza a altura total da capa (720px) para o fundo, ajustando-se a largura restante)

const Jimp = require('jimp');

// A função recebe 'height' que é a altura TOTAL da imagem final (720px)
async function drawBackground(image, bannerUrl, width, height, posterWidth) {
  
  // Calcula a largura exata do "pedaço restante" à esquerda do pôster
  const backgroundWidth = width - posterWidth;

  if (bannerUrl) {
    const banner = await Jimp.read(bannerUrl);
    
    // Agora, banner.cover() usará backgroundWidth e o 'height' total da capa (720px)
    // Isso fará com que o fundo preencha o espaço lateral restante,
    // esticando/encolhendo para caber na largura e altura totais.
    banner.cover(backgroundWidth, height);
    
    // Compõe a imagem do banner na posição (0,0)
    image.composite(banner, 0, 0); 
  }

  // O overlay também cobre a área restante (backgroundWidth x height)
  const overlay = new Jimp(backgroundWidth, height, '#000000');
  overlay.opacity(0.6);
  image.composite(overlay, 0, 0); 
}

module.exports = { drawBackground };
