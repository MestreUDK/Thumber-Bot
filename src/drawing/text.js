// ARQUIVO: src/drawing/text.js
// (ATUALIZADO: Usa as novas fontes 'fontTituloTV' e 'fontInfoTV')

const Jimp = require('jimp');
const { traduzirTemporada } = require('../utils.js'); 

// --- 3. Desenha os Textos Principais (Info e Titulo) ---
async function drawText(image, anime, fonts, padding, textAreaWidth) {
  // --- *** MUDANCA: Pega as fontes corretas do objeto *** ---
  const { fontTituloTV, fontInfoTV } = fonts;
  let currentTextY = padding;

  const temporada = traduzirTemporada(anime.season);
  const episodios = anime.episodes || '??';
  
  // Usa fontInfoTV (Roboto Bold 34)
  const infoTopo = `${temporada} ${anime.seasonYear} - ${episodios} EPISÓDIOS`;
  image.print(fontInfoTV, padding, currentTextY, infoTopo, textAreaWidth);
  currentTextY += Jimp.measureTextHeight(fontInfoTV, infoTopo, textAreaWidth) + 10;
  
  // Usa fontTituloTV (Boogaloo 47)
  const titulo = anime.title.romaji || anime.title.english || "Titulo Desconhecido";
  image.print(fontTituloTV, padding, currentTextY, titulo, textAreaWidth);
  currentTextY += Jimp.measureTextHeight(fontTituloTV, titulo, textAreaWidth) + 20;
  
  return currentTextY;
}

module.exports = { drawText };
