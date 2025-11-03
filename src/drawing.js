// ARQUIVO: src/drawing.js
// (O "Artista" - Contem toda a logica de desenho do Jimp)

const Jimp = require('jimp');
const path = require('path');
const { traduzirTemporada, getRatingImageName } = require('./utils.js');

// --- 1. Desenha o Fundo e o Overlay ---
async function drawBackground(image, bannerUrl, width, height) {
  if (bannerUrl) {
    const banner = await Jimp.read(bannerUrl);
    banner.cover(width, height); // Cobre 1280x720
    image.composite(banner, 0, 0);
  }
  
  const overlay = new Jimp(width, height, '#000000');
  overlay.opacity(0.6);
  image.composite(overlay, 0, 0);
}

// --- 2. Desenha o Poster (e retorna a largura dele) ---
async function drawPoster(image, posterUrl, width, height, padding) {
  if (!posterUrl) {
    return 0; // Retorna 0 de largura se nao ha poster
  }
  
  const cover = await Jimp.read(posterUrl);
  // Redimensiona o poster para PREENCHER a altura total (720px)
  cover.resize(Jimp.AUTO, height); 
  
  const posterWidth = cover.bitmap.width; // Salva a largura
  
  // Alinha na direita (X) e no topo (Y)
  const coverX = width - posterWidth;
  const coverY = 0; 
  
  image.composite(cover, coverX, coverY);
  
  return posterWidth; // Retorna a largura para o texto saber o limite
}

// --- 3. Desenha os Textos Principais (e retorna a proxima altura Y) ---
async function drawText(image, anime, fonts, padding, textAreaWidth) {
  const { fontTitulo, fontInfo } = fonts;
  let currentTextY = padding;

  const temporada = traduzirTemporada(anime.season);
  const episodios = anime.episodes || '??';
  
  const infoTopo = `${temporada} ${anime.seasonYear} - ${episodios} EPISODIOS`;
  image.print(fontInfo, padding, currentTextY, infoTopo, textAreaWidth);
  currentTextY += Jimp.measureTextHeight(fontInfo, infoTopo, textAreaWidth) + 10;
  
  const titulo = anime.title.romaji || anime.title.english || "Titulo Desconhecido";
  image.print(fontTitulo, padding, currentTextY, titulo, textAreaWidth);
  currentTextY += Jimp.measureTextHeight(fontTitulo, titulo, textAreaWidth) + 20;
  
  const estudio = anime.studios.nodes.length > 0 ? anime.studios.nodes[0].name : 'Estudio desconhecido';
  image.print(fontTitulo, padding, currentTextY, estudio, textAreaWidth); 
  currentTextY += Jimp.measureTextHeight(fontTitulo, estudio, textAreaWidth) + 20;
  
  return currentTextY; // Retorna onde o proximo item deve comecar
}

// --- 4. Desenha as Tags de Genero ---
async function drawTags(image, anime, fonts, padding, textAreaWidth, currentTextY) {
  const { fontTag } = fonts;
  let currentTagX = padding;
  
  const tagHeight = 35;
  const tagPaddingHorizontal = 15;
  const tagBorderRadius = 10;
  const tagColor = 0xFFBB00FF; // Laranja
  const generos = anime.genres || [];
  
  for (const genero of generos.slice(0, 4)) {
    const genreText = genero.toUpperCase();
    const textWidth = Jimp.measureText(fontTag, genreText);
    const tagWidth = textWidth + (tagPaddingHorizontal * 2);

    if (currentTagX + tagWidth > textAreaWidth + padding) {
      currentTagX = padding;
      currentTextY += tagHeight + 15;
    }
    
    // Cria o fundo arredondado
    image.composite(
      new Jimp(tagWidth, tagHeight, tagColor).round(tagBorderRadius), 
      currentTagX, 
      currentTextY
    );

    const textY = currentTextY + (tagHeight - Jimp.measureTextHeight(fontTag, genreText, tagWidth)) / 2;
    
    image.print(fontTag, currentTagX + tagPaddingHorizontal, textY, genreText);
    currentTagX += tagWidth + 10;
  }
}

// --- 5. Desenha a Classificacao ---
async function drawClassification(image, anime, padding, height) {
  if (!anime.classificacaoManual) {
    return; // Nao faz nada se nao houver classificacao
  }
  
  const ratingFileName = getRatingImageName(anime.classificacaoManual);
  if (ratingFileName) {
    try {
      const ratingImagePath = path.join(__dirname, '..', 'assets', 'classificacao', ratingFileName);
      const ratingImage = await Jimp.read(ratingImagePath);
      ratingImage.resize(Jimp.AUTO, 60);
      
      const ratingX = padding;
      const ratingY = height - ratingImage.bitmap.height - padding; 

      image.composite(ratingImage, ratingX, ratingY);
    } catch (err) {
      console.warn(`Aviso: Nao foi possivel carregar a imagem ${ratingFileName} da pasta /classificacao/`);
    }
  }
}

// Exporta todas as funcoes de desenho
module.exports = {
  drawBackground,
  drawPoster,
  drawText,
  drawTags,
  drawClassification
};
