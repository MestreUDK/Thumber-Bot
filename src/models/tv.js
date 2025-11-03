// ARQUIVO: src/models/tv.js
// (CORRIGIDO: Importando os 5 modulos de desenho corretamente)

// --- *** A CORRECAO ESTA AQUI *** ---
// Em vez de importar 1 modulo, importamos os 5 arquivos de /drawing/
const { drawBackground } = require('../drawing/background.js');
const { drawPoster } = require('../drawing/poster.js');
const { drawText } = require('../drawing/text.js');
const { drawTags } = require('../drawing/tags.js');
const { drawClassification } = require('../drawing/classification.js');

async function draw(image, anime, fonts, consts) {
  const { largura, altura, padding } = consts;
  
  // 1. Fundo
  await drawBackground(image, anime.bannerImage, largura, altura);
  
  // 2. Poster
  const posterWidth = await drawPoster(image, anime.coverImage.large, largura, altura, padding);
  
  // 3. Area de Texto
  const textoAreaLargura = largura - posterWidth - (padding * 2);
  
  // 4. Textos
  const proximoY = await drawText(image, anime, fonts, padding, textoAreaLargura);
  
  // 5. Tags
  await drawTags(image, anime, fonts, padding, textoAreaLargura, proximoY);
  
  // 6. Classificacao
  await drawClassification(image, anime, padding, altura);
}

module.exports = { draw };
