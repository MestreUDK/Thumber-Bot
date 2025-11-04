// ARQUIVO: src/models/filme.js
// (CORRIGIDO: Remove 'bottomBar' e chama 'classification' diretamente)

const Jimp = require('jimp');
const { drawPoster } = require('../drawing/poster.js'); 
// --- *** MUDANCA: Importa o 'classification' em vez do 'bottomBar' *** ---
const { drawClassification } = require('../drawing/classification.js'); 

async function draw(image, anime, fonts, consts) {
  const { largura, altura, padding } = consts;
  const { fontFilme } = fonts; // Usa a nova fonte 108px

  // 1. Fundo Preto (o 'image' ja e preto por padrao)

  // 2. Poster
  const posterWidth = await drawPoster(image, anime.coverImage.large, largura, altura, padding);

  // 3. Area de Texto
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

  // --- *** MUDANCA: Chama apenas o 'classification' *** ---
  // (Isso vai desenhar APENAS a classificacao, sem studio ou tags)
  await drawClassification(image, anime, padding, altura);
}

module.exports = { draw };
