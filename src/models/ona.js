// ARQUIVO: src/models/ona.js
// (ATUALIZADO: Agora preserva o 'seasonYear' original)

const { drawBackground } = require('../drawing/background.js');
const { drawPoster } = require('../drawing/poster.js');
const { drawText } = require('../drawing/text.js');
const { drawBottomBar } = require('../drawing/bottomBar.js');

async function draw(image, anime, fonts, consts) {
  const { largura, altura, padding } = consts; // 'altura' aqui será 720

  const animeONA = JSON.parse(JSON.stringify(anime));
  animeONA.season = 'ONA';
  
  // --- *** MUDANÇA AQUI *** ---
  // A linha "animeONA.seasonYear = '';" foi REMOVIDA.
  // Agora, o 'seasonYear' original (ex: 2012) sera passado para o 'drawText'.

  // 1. Desenha o Poster
  const posterWidth = await drawPoster(image, animeONA.coverImage.large, largura, altura, padding);

  // 2. Desenha o Fundo, passando a 'altura' (720px) para ele
  await drawBackground(image, animeONA.bannerImage, largura, altura, posterWidth); // <-- 'altura' é 720

  const textoAreaLargura = largura - posterWidth - (padding * 2);

  // 4. Textos (Info, Titulo)
  // Agora 'animeONA' sera passado com o 'seasonYear' correto
  await drawText(image, animeONA, fonts, padding, textoAreaLargura);

  // 5. Barra Inferior
  await drawBottomBar(image, animeONA, fonts, padding, textoAreaLargura, altura);
}

module.exports = { draw };
