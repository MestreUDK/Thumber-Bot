// ARQUIVO: src/models/ona.js
// (Revertido para a versao correta)

const { drawBackground } = require('../drawing/background.js');
const { drawPoster } = require('../drawing/poster.js');
const { drawText } = require('../drawing/text.js');
const { drawTags } = require('../drawing/tags.js');
const { drawClassification } = require('../drawing/classification.js');
const { drawStudio } = require('../drawing/studio.js');

async function draw(image, anime, fonts, consts) {
  const { largura, altura, padding } = consts;

  const animeONA = JSON.parse(JSON.stringify(anime));
  animeONA.season = 'ONA';
  animeONA.seasonYear = ''; 

  await drawBackground(image, animeONA.bannerImage, largura, altura);
  const posterWidth = await drawPoster(image, animeONA.coverImage.large, largura, altura, padding);
  const textoAreaLargura = largura - posterWidth - (padding * 2);
  
  await drawText(image, animeONA, fonts, padding, textoAreaLargura);
  await drawClassification(image, animeONA, padding, altura);
  await drawTags(image, animeONA, fonts, padding, textoAreaLargura, altura);
  await drawStudio(image, animeONA, fonts, padding, textoAreaLargura, altura);
}

module.exports = { draw };
