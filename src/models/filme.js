// ARQUIVO: src/models/filme.js
// (CORRIGIDO: Esta versao estava faltando)

const Jimp = require('jimp');
const { drawPoster } = require('../drawing/poster.js'); 
const { drawClassification } = require('../drawing/classification.js'); // <-- O import que faltava

async function draw(image, anime, fonts, consts) {
  const { largura, altura, padding } = consts;
  const { fontFilme } = fonts; 

  // 1. Fundo Preto 
  // 2. Poster
  const posterWidth = await drawPoster(image, anime.coverImage.large, largura, altura, padding);

  // 3. Area de Texto
  const textoAreaX = padding;
  const textoAreaLargura = largura - posterWidth - (padding * 2);
  const titulo = anime.title.romaji || anime.title.english || "Titulo Desconhecido";

  // 4. Desenha o Titulo
  image.print(
    fontFilme,
    textoAreaX, 
    0,          
    {
      text: titulo,
      alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER, 
      alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
    },
    textoAreaLargura, 
    altura          
  );
  
  // 5. Desenha a Classificacao
  await drawClassification(image, anime, padding, altura);
}

module.exports = { draw };
