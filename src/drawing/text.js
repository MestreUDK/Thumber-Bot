// ARQUIVO: src/drawing/text.js
const Jimp = require('jimp');
const { traduzirTemporada } = require('../utils.js'); // Sobe um nivel para 'src/utils.js'

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
  
  const estudio = anime.studios.nodes.length > 0 ? anime.studios.nodes[0].name : 'Estudio desconhecido';
  image.print(fontTitulo, padding, currentTextY, estudio, textAreaWidth); 
  currentTextY += Jimp.measureTextHeight(fontTitulo, estudio, textAreaWidth) + 20;
  
  return currentTextY;
}

module.exports = { drawText };
