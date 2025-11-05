// ARQUIVO: src/drawing/poster.js
// (ATUALIZADO com try...catch para links quebrados)

const Jimp = require('jimp');

async function drawPoster(image, posterUrl, width, height, padding) {
  if (!posterUrl) {
    return 0; // Sem poster, sem largura
  }

  // --- *** BLOCO TRY...CATCH ADICIONADO *** ---
  try {
    const cover = await Jimp.read(posterUrl);
    cover.resize(Jimp.AUTO, height); 

    const posterWidth = cover.bitmap.width; 
    const coverX = width - posterWidth;
    const coverY = 0; 

    image.composite(cover, coverX, coverY);
    return posterWidth; // Retorna a largura do poster desenhado
    
  } catch (err) {
    console.warn(`AVISO: Falha ao carregar imagem do poster: ${posterUrl}. Erro: ${err.message}`);
    // Se falhar, nao desenha nada e retorna 0
    return 0;
  }
  // --- FIM DO BLOCO ---
}

module.exports = { drawPoster };
