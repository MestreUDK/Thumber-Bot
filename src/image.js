// ARQUIVO: src/image.js
// (Atualizado: Remove "Estudio:" e centraliza a classificacao)

const Jimp = require('jimp');
const path = require('path');
const { traduzirTemporada, getRatingImageName } = require('./utils.js');

let fontTitulo, fontInfo, fontTag;

async function carregarFontes() {
  if (fontTitulo && fontInfo && fontTag) {
    return;
  }
  try {
    console.log('Carregando fontes personalizadas (3 fontes)...');
    fontTitulo = await Jimp.loadFont(path.join(__dirname, '..', 'assets', 'fonts', 'boogaloo_40.fnt'));
    fontInfo = await Jimp.loadFont(path.join(__dirname, '..', 'assets', 'fonts', 'roboto_27.fnt'));
    fontTag = await Jimp.loadFont(path.join(__dirname, '..', 'assets', 'fonts', 'roboto_25.fnt'));
    console.log('Fontes carregadas com sucesso.');
  } catch (err) {
    console.error('ERRO CRITICO AO CARREGAR FONTES:', err);
    console.log('Usando fontes padrao como fallback...');
    fontTitulo = await Jimp.loadFont(Jimp.FONT_SANS_64_WHITE);
    fontInfo = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
    fontTag = await Jimp.loadFont(Jimp.FONT_SANS_16_WHITE);
  }
}


async function gerarCapa(anime) {
  try {
    await carregarFontes();
    
    const largura = 1280;
    const altura = 720;
    const padding = 40;
    const textoAreaLargura = largura * 0.6;
    const image = new Jimp(largura, altura, '#000000');
    
    if (anime.bannerImage) {
      const banner = await Jimp.read(anime.bannerImage);
      banner.cover(largura, altura);
      image.composite(banner, 0, 0);
    }
    
    const overlay = new Jimp(largura, altura, '#000000');
    overlay.opacity(0.6);
    image.composite(overlay, 0, 0);
    
    // Variaveis para guardar a posicao do poster (para a classificacao)
    let coverX = 0;
    let coverY = 0;
    let coverWidth = 0;
    let coverHeight = 0;

    if (anime.coverImage && anime.coverImage.large) {
      const cover = await Jimp.read(anime.coverImage.large);
      coverWidth = largura * 0.3;
      cover.resize(coverWidth, Jimp.AUTO); 
      coverHeight = cover.bitmap.height; // Guarda a altura
      coverX = largura - cover.bitmap.width - padding;
      coverY = padding;
      image.composite(cover, coverX, coverY);
    }
    
    let currentTextY = padding;
    const temporada = traduzirTemporada(anime.season);
    const episodios = anime.episodes || '??';
    
    const infoTopo = `${temporada} ${anime.seasonYear} - ${episodios} EPISODIOS`;
    image.print(fontInfo, padding, currentTextY, infoTopo, textoAreaLargura);
    currentTextY += Jimp.measureTextHeight(fontInfo, infoTopo, textoAreaLargura) + 10;
    
    const titulo = anime.title.romaji || anime.title.english || "Titulo Desconhecido";
    image.print(fontTitulo, padding, currentTextY, titulo, textoAreaLargura);
    currentTextY += Jimp.measureTextHeight(fontTitulo, titulo, textoAreaLargura) + 20;
    
    // --- *** MUDANCA: REMOVIDO "Estudio: " *** ---
    const estudio = anime.studios.nodes.length > 0 ? anime.studios.nodes[0].name : 'Estudio desconhecido';
    // Agora so printa o nome do estudio, sem o prefixo
    image.print(fontTitulo, padding, currentTextY, estudio, textoAreaLargura); 
    currentTextY += Jimp.measureTextHeight(fontTitulo, estudio, textoAreaLargura) + 20;
    
    let currentTagX = padding;
    let currentTagY = currentTextY;
    const tagHeight = 30;
    const tagPaddingHorizontal = 10;
    const tagPaddingVertical = 5;
    const generos = anime.genres || [];
    
    for (const genero of generos.slice(0, 4)) {
      const genreText = genero.toUpperCase();
      const textWidth = Jimp.measureText(fontTag, genreText);
      const tagWidth = textWidth + (tagPaddingHorizontal * 2);

      if (currentTagX + tagWidth > textoAreaLargura + padding) {
        currentTagX = padding;
        currentTagY += tagHeight + 10;
      }
      
      const tagBg = new Jimp(tagWidth, tagHeight, '#FFA500');
      image.composite(tagBg, currentTagX, currentTagY);
      image.print(fontTag, currentTagX + tagPaddingHorizontal, currentTagY + 2, genreText);
      currentTagX += tagWidth + 10;
    }
    
    // Bloco da logo (desativado como voce pediu)
    /* try {
        const logoPath = path.join(__dirname, '..', 'assets', 'logo', 'logo1.jpg');
        ...
    } catch (err) { ... }
    */
    
    // --- *** MUDANCA: POSICAO DA CLASSIFICACAO *** ---
    if (anime.classificacaoManual) { 
      const ratingFileName = getRatingImageName(anime.classificacaoManual);
      if (ratingFileName) {
        try {
          const ratingImagePath = path.join(__dirname, '..', 'assets', 'classificacao', ratingFileName);
          const ratingImage = await Jimp.read(ratingImagePath);
          ratingImage.resize(Jimp.AUTO, 60);
          
          // Centraliza a classificacao ABAIXO do poster
          const ratingX = (coverX + (coverWidth / 2)) - (ratingImage.bitmap.width / 2);
          const ratingY = coverY + coverHeight + 10; // 10px abaixo do poster

          image.composite(ratingImage, ratingX, ratingY);
        } catch (err) {
          console.warn(`Aviso: Nao foi possivel carregar a imagem ${ratingFileName} da pasta /classificacao/`);
        }
      }
    }
    
    const buffer = await image.getBufferAsync(Jimp.MIME_PNG);
    return { success: true, buffer: buffer };
    
  } catch (err) {
    console.error('ERRO GERAL AO GERAR IMAGEM:', err);
    return { success: false, error: err.message };
  }
}

module.exports = { gerarCapa, carregarFontes };
