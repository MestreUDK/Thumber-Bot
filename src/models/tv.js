// ARQUIVO: src/models/tv.js
// (ATUALIZADO: Ordem de desenho corrigida para mover o Estudio)

// --- *** ATUALIZADO: Importa o novo 'studio.js' *** ---
const { drawBackground } = require('../drawing/background.js');
const { drawPoster } = require('../drawing/poster.js');
const { drawText } = require('../drawing/text.js');
const { drawTags } = require('../drawing/tags.js');
const { drawClassification } = require('../drawing/classification.js');
const { drawStudio } = require('../drawing/studio.js'); // <-- NOVO

async function draw(image, anime, fonts, consts) {
  const { largura, altura, padding } = consts;

  // 1. Fundo
  await drawBackground(image, anime.bannerImage, largura, altura);

  // 2. Poster
  const posterWidth = await drawPoster(image, anime.coverImage.large, largura, altura, padding);

  // 3. Area de Texto
  const textoAreaLargura = largura - posterWidth - (padding * 2);

  // --- *** ORDEM DE DESENHO ATUALIZADA *** ---
  
  // 4. Textos (Info, Titulo) - Ficam no TOPO
  await drawText(image, anime, fonts, padding, textoAreaLargura);

  // 5. Classificacao - Fica no FUNDO
  await drawClassification(image, anime, padding, altura);
  
  // 6. Tags (Calcula a pos acima da Classificacao)
  await drawTags(image, anime, fonts, padding, textoAreaLargura, altura);
  
  // 7. Estudio (Calcula a pos acima das Tags)
  await drawStudio(image, anime, fonts, padding, textoAreaLargura, altura);
}

module.exports = { draw };
