// ARQUIVO: src/models/filme.js
// (ATUALIZADO: Agora usa o 'bottomBar' para desenhar so a classificacao)

const Jimp = require('jimp');
const { drawPoster } = require('../drawing/poster.js'); 
// --- *** MUDANCA: Importa o novo 'bottomBar.js' *** ---
const { drawBottomBar } = require('../drawing/bottomBar.js'); 

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
  
  // 5. Desenha a Barra Inferior (que so vai desenhar a classificacao)
  // (Como o "anime" nao tera 'studios' ou 'genres' no modo filme, ele so desenha o A14)
  await drawBottomBar(image, anime, fonts, padding, textoAreaLargura, altura);
}

module.exports = { draw };
