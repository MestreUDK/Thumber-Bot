// ARQUIVO: src/models/ona.js
// (CORRIGIDO: Importando os 5 modulos de desenho corretamente)

// --- *** A CORRECAO ESTA AQUI *** ---
const { drawBackground } = require('../drawing/background.js');
const { drawPoster } = require('../drawing/poster.js');
const { drawText } = require('../drawing/text.js');
const { drawTags } = require('../drawing/tags.js');
const { drawClassification } = require('../drawing/classification.js');

async function draw(image, anime, fonts, consts) {
  const { largura, altura, padding } = consts;

  const animeONA = JSON.parse(JSON.stringify(anime));
  animeONA.season = 'ONA';
  animeONA.seasonYear = ''; 

  // 1. Fundo
  await drawBackground(image, animeONA.bannerImage, largura, altura);
  
  // 2. Poster
  const posterWidth = await drawPoster(image, animeONA.coverImage.large, largura, altura, padding);
  
  // 3. Area de Texto
  const textoAreaLargura = largura - posterWidth - (padding * 2);
  
  // 4. Textos (usa os dados modificados 'animeONA')
  const proximoY = await drawText(image, animeONA, fonts, padding, textoAreaLargura);
  
  // 5. Tags
  await drawTags(image, animeONA, fonts, padding, textoAreaLargura, proximoY);
  
  // 6. Classificacao
  await drawClassification(image, animeONA, padding, altura);
}

module.exports = { draw };
