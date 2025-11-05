// ARQUIVO: src/models/tv.js
// (ATUALIZADO: Ordem de desenho invertida)

const { drawBackground } = require('../drawing/background.js');
const { drawPoster } = require('../drawing/poster.js');
const { drawText } = require('../drawing/text.js');
const { drawBottomBar } = require('../drawing/bottomBar.js');

async function draw(image, anime, fonts, consts) {
  const { largura, altura, padding } = consts;

  // --- *** MUDANCA DE ORDEM *** ---
  // 1. Desenha o Poster PRIMEIRO para saber a largura dele
  const posterWidth = await drawPoster(image, anime.coverImage.large, largura, altura, padding);
  
  // 2. Desenha o Fundo AGORA, passando o posterWidth que acabamos de pegar
  await drawBackground(image, anime.bannerImage, largura, altura, posterWidth);
  // --- *** FIM DA MUDANCA *** ---

  // 3. Calcula a area de texto (restante)
  const textoAreaLargura = largura - posterWidth - (padding * 2);

  // 4. Textos (Info, Titulo) - Ficam no TOPO
  await drawText(image, anime, fonts, padding, textoAreaLargura);

  // 5. Barra Inferior (Estudio, Tags, Classificacao)
  await drawBottomBar(image, anime, fonts, padding, textoAreaLargura, altura);
}

module.exports = { draw };
