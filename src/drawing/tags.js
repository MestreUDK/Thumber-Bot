// ARQUIVO: src/drawing/tags.js
// (CORRIGIDO: Removida a funcao .round() que estava quebrando)
const Jimp = require('jimp');

async function drawTags(image, anime, fonts, padding, textAreaWidth, currentTextY) {
  const { fontTag } = fonts;
  let currentTagX = padding;
  let currentTagY = currentTextY;
  
  const tagHeight = 35;
  const tagPaddingHorizontal = 15;
  const tagColor = 0xFFBB00FF; // Laranja
  const generos = anime.genres || [];
  
  for (const genero of generos.slice(0, 4)) {
    const genreText = genero.toUpperCase();
    const textWidth = Jimp.measureText(fontTag, genreText);
    const tagWidth = textWidth + (tagPaddingHorizontal * 2);

    if (currentTagX + tagWidth > textAreaWidth + padding) {
      currentTagX = padding;
      currentTagY += tagHeight + 15;
    }
    
    // --- *** A CORRECAO DO BUG ESTA AQUI *** ---
    // (Usando um retangulo simples, sem o .round())
    const tagBackground = new Jimp(tagWidth, tagHeight, tagColor); 
    image.composite(tagBackground, currentTagX, currentTagY); 
    // --- *** FIM DA CORRECAO *** ---

    const textY = currentTagY + (tagHeight - Jimp.measureTextHeight(fontTag, genreText, tagWidth)) / 2;
    
    image.print(
      fontTag, 
      currentTagX + tagPaddingHorizontal, 
      textY, 
      genreText
    );
    
    currentTagX += tagWidth + 10;
  }
}

module.exports = { drawTags };
