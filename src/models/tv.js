// ARQUIVO: src/models/tv.js
// (Revertido para a versao correta)

const { drawBackground } = require('../drawing/background.js');
const { drawPoster } = require('../drawing/poster.js');
const { drawText } = require('../drawing/text.js');
const { drawTags } = require('../drawing/tags.js');
const { drawClassification } = require('../drawing/classification.js');
const { drawStudio } = require('../drawing/studio.js');

async function draw(image, anime, fonts, consts) {
  const { largura, altura, padding } = consts;

  await drawBackground(image, anime.bannerImage, largura, altura);
  const posterWidth = await drawPoster(image, anime.coverImage.large, largura, altura, padding);
  const textoAreaLargura = largura - posterWidth - (padding * 2);

  await drawText(image, anime, fonts, padding, textoAreaLargura);
  await drawClassification(image, anime, padding, altura);
  await drawTags(image, anime, fonts, padding, textoAreaLargura, altura);
  await drawStudio(image, anime, fonts, padding, textoAreaLargura, altura);
}

module.exports = { draw };
