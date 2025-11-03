// ARQUIVO: src/models/filme.js
// (Modelo para Filme - Fundo preto, poster e titulo grande)

const Jimp = require('jimp');
// ATUALIZADO: so importa o poster
const { drawPoster } = require('../drawing/poster.js'); 

async function draw(image, anime, fonts, consts) {
  const { largura, altura, padding } = consts;
  const { fontFilme } = fonts; // Usa a nova fonte 108px
  
  // 1. Fundo Preto (O 'image' ja e preto por padrao)
  
  // 2. Poster
  const posterWidth = await drawPoster(image, anime.coverImage.large, largura, altura, padding);
  
  // 3. Area de Texto
  const textoAreaLargura = largura - posterWidth - (padding * 2);
  const titulo = anime.title.romaji || anime.title.english || "Titulo Desconhecido";
  
  // 4. Desenha o Titulo
  // (Centraliza o texto verticalmente na area livre)
  image.print(
    fontFilme,
    padding, // X
    0,       // Y
    {
      text: titulo,
      alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT,
      alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
    },
    textoAreaLargura, // Max Largura
    altura          // Max Altura
  );
}

module.exports = { draw };
