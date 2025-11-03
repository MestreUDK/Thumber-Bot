// ARQUIVO: src/models/tv.js
// (Modelo padrao para TV e Series)

const { 
  drawBackground, 
  drawPoster, 
  drawText, 
  drawTags, 
  drawClassification 
} = require('../drawing'); // Importa o "artista"

async function draw(image, anime, fonts, consts) {
  const { largura, altura, padding } = consts;
  
  // 1. Fundo
  await drawBackground(image, anime.bannerImage, largura, altura);
  
  // 2. Poster
  const posterWidth = await drawPoster(image, anime.coverImage.large, largura, altura, padding);
  
  // 3. Area de Texto
  const textoAreaLargura = largura - posterWidth - (padding * 2);
  
  // 4. Textos
  const proximoY = await drawText(image, anime, fonts, padding, textoAreaLargura);
  
  // 5. Tags
  await drawTags(image, anime, fonts, padding, textoAreaLargura, proximoY);
  
  // 6. Classificacao
  await drawClassification(image, anime, padding, altura);
}

module.exports = { draw };
