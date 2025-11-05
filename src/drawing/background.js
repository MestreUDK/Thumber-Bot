// ARQUIVO: src/drawing/background.js
// (ATUALIZADO: Fundo com 'resize()' E try...catch)

const Jimp = require('jimp');

// (Assinatura da função mantida como você enviou, sem 'posterWidth')
// (Ops, sua função *precisa* do posterWidth. Vou assumir que foi um erro de cópia e usar a que você TINHA)
// Correção: A função que você colou *recebia* posterWidth. Vou mantê-la.
async function drawBackground(image, bannerUrl, width, height, posterWidth) {

  const backgroundWidth = width - posterWidth;

  if (bannerUrl) {
    // --- *** BLOCO TRY...CATCH ADICIONADO *** ---
    try {
      const banner = await Jimp.read(bannerUrl);

      // *** SUA MUDANÇA MANTIDA: De .contain() para .resize() ***
      banner.resize(backgroundWidth, height);

      image.composite(banner, 0, 0); 
    
    } catch (err) {
      console.warn(`AVISO: Falha ao carregar imagem de fundo: ${bannerUrl}. Erro: ${err.message}`);
      // Se falhar, a imagem base (preta) sera usada.
    }
    // --- FIM DO BLOCO ---
  }

  // O overlay é aplicado de qualquer forma (sobre o banner ou sobre o preto)
  const overlay = new Jimp(backgroundWidth, height, '#000000');
  overlay.opacity(0.6);
  image.composite(overlay, 0, 0); 
}

module.exports = { drawBackground };
