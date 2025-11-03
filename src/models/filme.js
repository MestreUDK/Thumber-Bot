// ARQUIVO: src/models/filme.js
// (CORRIGIDO: Agora importa e desenha a Classificacao)

const Jimp = require('jimp');
// --- *** 1. IMPORTAR A FUNCAO QUE FALTA *** ---
const { drawPoster } = require('../drawing/poster.js'); 
const { drawClassification } = require('../drawing/classification.js'); // <--- ADICIONADO

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
  image.print(
    fontFilme,
    textoAreaX, // X (Onde a area de texto comeca)
    0,          // Y (Topo da imagem)
    {
      text: titulo,
      alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER, 
      alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
    },
    textoAreaLargura, // Max Largura
    altura          // Max Altura
  );
  
  // --- *** 5. CHAMAR A FUNCAO QUE FALTA *** ---
  // (Desenha a classificacao no canto inferior esquerdo)
  await drawClassification(image, anime, padding, altura); // <--- ADICIONADO
}

module.exports = { draw };
