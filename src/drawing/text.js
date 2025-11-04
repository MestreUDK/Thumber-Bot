// ARQUIVO: src/drawing/text.js
// (ATUALIZADO: Nao desenha mais o Estudio)

const Jimp = require('jimp');
const { traduzirTemporada } = require('../utils.js'); 

// --- 3. Desenha os Textos Principais (Info e Titulo) ---
async function drawText(image, anime, fonts, padding, textAreaWidth) {
  const { fontTitulo, fontInfo } = fonts;
  let currentTextY = padding;

  const temporada = traduzirTemporada(anime.season);
  const episodios = anime.episodes || '??';
  
  const infoTopo = `${temporada} ${anime.seasonYear} - ${episodios} EPISODIOS`;
  image.print(fontInfo, padding, currentTextY, infoTopo, textAreaWidth);
  currentTextY += Jimp.measureTextHeight(fontInfo, infoTopo, textAreaWidth) + 10;
  
  const titulo = anime.title.romaji || anime.title.english || "Titulo Desconhecido";
  image.print(fontTitulo, padding, currentTextY, titulo, textAreaWidth);
  currentTextY += Jimp.measureTextHeight(fontTitulo, titulo, textAreaWidth) + 20;
  
  // A parte do "Estudio" foi removida daqui
  
  return currentTextY; // Retorna o Y (nao e mais usado, mas e bom manter)
}

module.exports = { drawText };
