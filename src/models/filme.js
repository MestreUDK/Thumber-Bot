// ARQUIVO: src/models/filme.js
// (CORRIGIDO: Importando o modulo 'poster' corretamente)

const Jimp = require('jimp');
// --- *** A CORRECAO ESTA AQUI *** ---
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
  image.print(
    fontFilme,
    padding, 
    0,       
    titulo,
    textoAreaLargura, 
    altura          
  );
}

module.exports = { draw };
