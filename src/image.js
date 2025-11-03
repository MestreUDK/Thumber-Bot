// ARQUIVO: src/image.js
// (AGORA E O "DIRETOR" - Limpo e modularizado)

const Jimp = require('jimp');
const path = require('path');

// Importa as funcoes de desenho do novo arquivo
const { 
  drawBackground, 
  drawPoster, 
  drawText, 
  drawTags, 
  drawClassification 
} = require('./drawing.js');

// --- 1. CARREGAMENTO DE FONTES (Continua aqui) ---
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

// --- 2. GERADOR DE CAPA (Agora muito mais limpo) ---
async function gerarCapa(anime) {
  try {
    // Garante que as fontes estao carregadas
    await carregarFontes();
    const fonts = { fontTitulo, fontInfo, fontTag };
    
    // Define as constantes
    const largura = 1280;
    const altura = 720;
    const padding = 40;
    
    // Cria a imagem base
    const image = new Jimp(largura, altura, '#000000');
    
    // --- Chama os modulos de desenho em ordem ---
    
    // 1. Desenha Fundo e Overlay
    await drawBackground(image, anime.bannerImage, largura, altura);
    
    // 2. Desenha o Poster (e pega a largura dele)
    const posterWidth = await drawPoster(image, anime.coverImage.large, largura, altura, padding);
    
    // 3. Define a area de texto (baseado na largura do poster)
    const textoAreaLargura = largura - posterWidth - (padding * 2);
    
    // 4. Desenha os Textos (e pega a proxima altura Y)
    const proximoY = await drawText(image, anime, fonts, padding, textoAreaLargura);
    
    // 5. Desenha as Tags (usando a altura Y que o texto retornou)
    await drawTags(image, anime, fonts, padding, textoAreaLargura, proximoY);
    
    // 6. Desenha a Classificacao
    await drawClassification(image, anime, padding, altura);

    // Bloco da logo (Continua desativado)
    /* ... */
    
    // Retorna a imagem pronta
    const buffer = await image.getBufferAsync(Jimp.MIME_PNG);
    return { success: true, buffer: buffer };
    
  } catch (err) {
    console.error('ERRO GERAL AO GERAR IMAGEM:', err);
    return { success: false, error: err.message };
  }
}

module.exports = { gerarCapa, carregarFontes };
