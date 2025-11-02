// ARQUIVO: image.js
// (Responsavel por toda a geracao de imagem com Jimp)

const Jimp = require('jimp');
const path = require('path');
// Importamos a funcao de traducao
const { traduzirTemporada } = require('./utils.js');

async function gerarCapa(anime) {
  try {
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
    
    if (anime.coverImage && anime.coverImage.large) {
      const cover = await Jimp.read(anime.coverImage.large);
      const coverWidth = largura * 0.3;
      cover.resize(coverWidth, Jimp.AUTO); 
      image.composite(cover, largura - cover.bitmap.width - padding, padding);
    }
    
    // (Ainda estamos usando as fontes padrao, vamos mudar isso em breve)
    const fontTitulo = await Jimp.loadFont(Jimp.FONT_SANS_64_WHITE);
    const fontInfo = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
    const fontTag = await Jimp.loadFont(Jimp.FONT_SANS_16_WHITE);
    
    let currentTextY = padding;
    const temporada = traduzirTemporada(anime.season);
    const episodios = anime.episodes || '??';
    const infoTopo = `${temporada} ${anime.seasonYear} - ${episodios} EPISODIOS`;
    image.print(fontInfo, padding, currentTextY, infoTopo, textoAreaLargura);
    currentTextY += Jimp.measureTextHeight(fontInfo, infoTopo, textoAreaLargura) + 10;
    
    const titulo = anime.title.romaji || anime.title.english || "Titulo Desconhecido";
    image.print(fontTitulo, padding, currentTextY, titulo, textoAreaLargura);
    currentTextY += Jimp.measureTextHeight(fontTitulo, titulo, textoAreaLargura) + 20;
    
    const estudio = anime.studios.nodes.length > 0 ? anime.studios.nodes[0].name : 'Estudio desconhecido';
    image.print(fontInfo, padding, currentTextY, `Estudio: ${estudio}`, textoAreaLargura);
    currentTextY += Jimp.measureTextHeight(fontInfo, `Estudio: ${estudio}`, textoAreaLargura) + 20;
    
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
      image.print(fontTag, currentTagX + tagPaddingHorizontal, currentTagY + tagPaddingVertical, genreText);
      currentTagX += tagWidth + 10;
    }
    
    // --- *** NOVO BLOCO DE WATERMARK COM LOGO *** ---
    try {
        const logoPath = path.join(__dirname, 'logo', 'logo1.jpg');
        const logo = await Jimp.read(logoPath);
        const watermarkText = '@AnimesUDK';
        const watermarkFont = fontInfo; // Usa a mesma fonte da Info
        const logoHeight = 40; // Define a altura da logo
        
        logo.resize(Jimp.AUTO, logoHeight); // Redimensiona a logo
        
        const logoX = padding;
        const logoY = altura - padding - logoHeight; // Alinha pela base
        
        const textHeight = Jimp.measureTextHeight(watermarkFont, watermarkText, 1000);
        const textX = logoX + logo.bitmap.width + 10; // 10px de espaco
        const textY = altura - padding - textHeight; // Alinha pela base
        
        image.composite(logo, logoX, logoY); // Cola a logo
        image.print(watermarkFont, textX, textY, watermarkText); // Escreve o texto

    } catch (err) {
        console.warn(`Aviso: Nao foi possivel carregar a logo/logo1.jpg.`, err.message);
        // Fallback: se a logo falhar, escreve so o texto
        const fallbackText = '@AnimesUDK';
        image.print(fontInfo, padding, altura - padding - Jimp.measureTextHeight(fontInfo, fallbackText, 1000), fallbackText);
    }
    // --- *** FIM DO NOVO BLOCO *** ---
    
    
    const buffer = await image.getBufferAsync(Jimp.MIME_PNG);
    return { success: true, buffer: buffer };
    
  } catch (err) {
    console.error('ERRO GERAL AO GERAR IMAGEM:', err);
    return { success: false, error: err.message };
  }
}

module.exports = { gerarCapa };
