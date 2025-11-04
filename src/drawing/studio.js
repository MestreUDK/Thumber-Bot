// ARQUIVO: src/drawing/studio.js
// (Novo artista para desenhar o estudio acima das tags)

const Jimp = require('jimp');

async function drawStudio(image, anime, fonts, padding, textAreaWidth, altura) {
  const { fontTitulo } = fonts; // Usa a fonte do titulo (Boogaloo)
  
  const estudio = anime.studios.nodes.length > 0 ? anime.studios.nodes[0].name : 'Estudio desconhecido';
  
  // --- Calcula a Posicao Y (a partir do Fundo) ---
  const classificationHeight = 60; // Altura da imagem de classificacao
  const spaceAboveClassification = 10;
  const tagHeight = 35; // Altura das tags
  const spaceAboveTags = 15;
  
  // Mede a altura do proprio texto do estudio
  const studioTextHeight = Jimp.measureTextHeight(fontTitulo, estudio, textAreaWidth);
  
  // O Y comeca no fundo, sobe o padding, a classificacao, o espaco, as tags, o espaco, e o proprio texto
  const studioY = altura - padding - classificationHeight - spaceAboveClassification - tagHeight - spaceAboveTags - studioTextHeight;
  
  image.print(
    fontTitulo,
    padding, 
    studioY, 
    estudio, 
    textAreaWidth
  ); 
}

module.exports = { drawStudio };
