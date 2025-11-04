// ARQUIVO: src/drawing/studio.js
// (ATUALIZADO: Posicao Y corrigida para a nova barra inferior)

const Jimp = require('jimp');

async function drawStudio(image, anime, fonts, padding, textAreaWidth, altura) {
  const { fontTitulo } = fonts; 
  
  const estudio = anime.studios.nodes.length > 0 ? anime.studios.nodes[0].name : 'Estudio desconhecido';
  
  // --- Calcula a Posicao Y (a partir do Fundo) ---
  const bottomBarHeight = 60; // A altura da nova barra (tags + classificacao)
  const spaceAboveBar = 15;
  
  const studioTextHeight = Jimp.measureTextHeight(fontTitulo, estudio, textAreaWidth);
  
  // O Y comeca no fundo, sobe o padding, a barra, o espaco, e o proprio texto
  const studioY = altura - padding - bottomBarHeight - spaceAboveBar - studioTextHeight;
  
  image.print(
    fontTitulo,
    padding, 
    studioY, 
    estudio, 
    textAreaWidth
  ); 
}

module.exports = { drawStudio };
