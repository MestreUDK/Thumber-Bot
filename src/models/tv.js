// ARQUIVO: src/models/tv.js
// (VERIFICADO: Passando a altura total da capa (720) para o fundo)

const { drawBackground } = require('../drawing/background.js');
const { drawPoster } = require('../drawing/poster.js');
const { drawText } = require('../drawing/text.js');
const { drawBottomBar } = require('../drawing/bottomBar.js');

async function draw(image, anime, fonts, consts) {
  const { largura, altura, padding } = consts; // 'altura' aqui será 720

  // 1. Desenha o Poster
  const posterWidth = await drawPoster(image, anime.coverImage.large, largura, altura, padding);
  
  // 2. Desenha o Fundo, passando a 'altura' (720px) para ele
  await drawBackground(image, anime.bannerImage, largura, altura, posterWidth); // <-- 'altura' é 720
  
  const textoAreaLargura = largura - posterWidth - (padding * 2);

  // 4. Textos (Info, Titulo)
  await drawText(image, anime, fonts, padding, textoAreaLargura);

  // 5. Barra Inferior
  await drawBottomBar(image, anime, fonts, padding, textoAreaLargura, altura);
}

module.exports = { draw };
