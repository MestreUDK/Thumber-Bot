// ARQUIVO: src/models/filme.js
// (CORRIGIDO: Titulo alinhado ao TOPO-ESQUERDA, como no desenho)

const Jimp = require('jimp');
const { drawPoster } = require('../drawing/poster.js'); 

async function draw(image, anime, fonts, consts) {
  const { largura, altura, padding } = consts;
  const { fontFilme } = fonts; 
  
  // 1. Fundo Preto (o 'image' ja e preto por padrao)
  
  // 2. Poster
  const posterWidth = await drawPoster(image, anime.coverImage.large, largura, altura, padding);
  
  // 3. Area de Texto
  const textoAreaLargura = largura - posterWidth - (padding * 2);
  const titulo = anime.title.romaji || anime.title.english || "Titulo Desconhecido";
  
  // 4. Desenha o Titulo
  // --- *** MUDANCA: Alinhamento vertical no TOPO *** ---
  image.print(
    fontFilme,
    padding, // X
    padding, // Y (com o mesmo padding do topo)
    {
      text: titulo,
      alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT,
      alignmentY: Jimp.VERTICAL_ALIGN_TOP // Alinha no TOPO
    },
    textoAreaLargura, 
    altura          
  );
}

module.exports = { draw };
