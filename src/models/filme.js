// ARQUIVO: src/models/filme.js
// (CORRIGIDO: Titulo 100% centralizado na area preta)

const Jimp = require('jimp');
const { drawPoster } = require('../drawing/poster.js'); 

async function draw(image, anime, fonts, consts) {
  const { largura, altura, padding } = consts;
  const { fontFilme } = fonts; // Usa a nova fonte 108px

  // 1. Fundo Preto (o 'image' ja e preto por padrao)

  // 2. Poster
  const posterWidth = await drawPoster(image, anime.coverImage.large, largura, altura, padding);

  // 3. Area de Texto
  // A area de texto e o espaco do inicio (0) + padding ate o poster
  const textoAreaX = padding;
  const textoAreaLargura = largura - posterWidth - (padding * 2);
  const titulo = anime.title.romaji || anime.title.english || "Titulo Desconhecido";

  // 4. Desenha o Titulo
  // --- *** A MUDANCA ESTA AQUI *** ---
  image.print(
    fontFilme,
    textoAreaX, // X (Onde a area de texto comeca)
    0,          // Y (Topo da imagem)
    {
      text: titulo,
      alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER, // <--- CORRIGIDO
      alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE  // (Ja estava correto)
    },
    textoAreaLargura, // Max Largura
    altura          // Max Altura
  );
}

module.exports = { draw };
