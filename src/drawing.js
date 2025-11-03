// ARQUIVO: src/drawing.js
// (CORRIGIDO: Adicionado 'await' na funcao .round())

const Jimp = require('jimp');
const path = require('path');
const { traduzirTemporada, getRatingImageName } = require('./utils.js');

// --- 1. Desenha o Fundo e o Overlay ---
async function drawBackground(image, bannerUrl, width, height) {
  if (bannerUrl) {
    const banner = await Jimp.read(bannerUrl);
    banner.cover(width, height);
    image.composite(banner, 0, 0);
  }
  
  const overlay = new Jimp(width, height, '#000000');
  overlay.opacity(0.6);
  image.composite(overlay, 0, 0);
}

// --- 2. Desenha o Poster (e retorna a largura dele) ---
async function drawPoster(image, posterUrl, width, height, padding) {
  if (!posterUrl) {
    return 0;
  }
  
  const cover = await Jimp.read(posterUrl);
  cover.resize(Jimp.AUTO, height); 
  
  const posterWidth = cover.bitmap.width; 
  
  const coverX = width - posterWidth;
  const coverY = 0; 
  
  image.composite(cover, coverX, coverY);
  
  return posterWidth; 
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
  
  return currentTextY;
}

// --- 4. Desenha as Tags de Genero ---
async function drawTags(image, anime, fonts, padding, textAreaWidth, currentTextY) {
  const { fontTag } = fonts;
  let currentTagX = padding;
  let currentTagY = currentTextY;
  
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
      currentTagY += tagHeight + 15;
    }
    
    // --- *** A CORRECAO ESTA AQUI *** ---
    
    // 1. Cria a imagem do fundo
    const tagBackground = new Jimp(tagWidth, tagHeight, tagColor); 
    // 2. Arredonda ela (e AGUARDA a conclusao)
    await tagBackground.round(tagBorderRadius); 
    // 3. Cola ela na imagem principal
    image.composite(tagBackground, currentTagX, currentTagY); 
    
    // --- *** FIM DA CORRECAO *** ---

    // Calcula a posicao Y do texto para centraliza-lo
    const textY = currentTagY + (tagHeight - Jimp.measureTextHeight(fontTag, genreText, tagWidth)) / 2;
    
    image.print(
      fontTag, 
      currentTagX + tagPaddingHorizontal, 
      textY, 
      genreText
    );
    
    currentTagX += tagWidth + 10;
  }
}

// --- 5. Desenha a Classificacao ---
async function drawClassification(image, anime, padding, height) {
  if (!anime.classificacaoManual) {
    return;
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
