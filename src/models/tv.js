// ARQUIVO: src/models/tv.js
// (ATUALIZADO: Chama o novo 'drawBottomBar')

const { drawBackground } = require('../drawing/background.js');
const { drawPoster } = require('../drawing/poster.js');
const { drawText } = require('../drawing/text.js');
const { drawStudio } = require('../drawing/studio.js');
// --- *** MUDANCA: Importa o novo 'bottomBar.js' *** ---
const { drawBottomBar } = require('../drawing/bottomBar.js');

async function draw(image, anime, fonts, consts) {
  const { largura, altura, padding } = consts;

  await drawBackground(image, anime.bannerImage, largura, altura);
  const posterWidth = await drawPoster(image, anime.coverImage.large, largura, altura, padding);
  const textoAreaLargura = largura - posterWidth - (padding * 2);

  // --- ORDEM DE DESENHO ATUALIZADA ---
  
  // 1. Textos (Info, Titulo) - Ficam no TOPO
  await drawText(image, anime, fonts, padding, textoAreaLargura);

  // 2. Estudio (Calcula a pos acima da barra)
  await drawStudio(image, anime, fonts, padding, textoAreaLargura, altura);
  
  // 3. Barra Inferior (Tags + Classificacao)
  await drawBottomBar(image, anime, fonts, padding, textoAreaLargura, altura);
}

module.exports = { draw };
