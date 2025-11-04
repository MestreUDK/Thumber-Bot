// ARQUIVO: src/models/ona.js
// (ATUALIZADO: Ordem de desenho corrigida)

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
  
  // 4. Textos (Info, Titulo, Estudio) - CONTINUAM NO TOPO
  await drawText(image, animeONA, fonts, padding, textoAreaLargura);
  
  // --- *** MUDANCA DE POSICAO *** ---
  
  // 5. Classificacao (desenhada primeiro no fundo)
  await drawClassification(image, animeONA, padding, altura);
  
  // 6. Tags (desenhadas logo acima da classificacao)
  await drawTags(image, animeONA, fonts, padding, textoAreaLargura, altura);
}

module.exports = { draw };
