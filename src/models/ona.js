// ARQUIVO: src/models/ona.js
// (Modelo para ONA - igual TV, mas muda os dados)

const { 
  drawBackground, 
  drawPoster, 
  drawText, 
  drawTags, 
  drawClassification 
} = require('../drawing'); // Importa o "artista"

async function draw(image, anime, fonts, consts) {
  const { largura, altura, padding } = consts;

  // --- A MUDANCA DO ONA ---
  // Cria uma copia dos dados para nao baguncar o original
  const animeONA = JSON.parse(JSON.stringify(anime));
  animeONA.season = 'ONA'; // Troca "VERAO" por "ONA"
  animeONA.seasonYear = '';  // Remove o ano
  // --- FIM DA MUDANCA ---

  // 1. Fundo
  await drawBackground(image, animeONA.bannerImage, largura, altura);
  
  // 2. Poster
  const posterWidth = await drawPoster(image, animeONA.coverImage.large, largura, altura, padding);
  
  // 3. Area de Texto
  const textoAreaLargura = largura - posterWidth - (padding * 2);
  
  // 4. Textos (usa os dados modificados 'animeONA')
  const proximoY = await drawText(image, animeONA, fonts, padding, textoAreaLargura);
  
  // 5. Tags
  await drawTags(image, animeONA, fonts, padding, textoAreaLargura, proximoY);
  
  // 6. Classificacao
  await drawClassification(image, animeONA, padding, altura);
}

module.exports = { draw };
