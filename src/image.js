// ARQUIVO: src/image.js
// (AGORA E O "DIRETOR" - Limpo e 100% modularizado)

const Jimp = require('jimp');
const path = require('path');

// Importa as funcoes de desenho da nova pasta 'src/drawing/'
const { drawBackground } = require('./drawing/background.js');
const { drawPoster } = require('./drawing/poster.js');
const { drawText } = require('./drawing/text.js');
const { drawTags } = require('./drawing/tags.js');
const { drawClassification } = require('./drawing/classification.js');

// --- 1. CARREGAMENTO DE FONTES (Continua aqui) ---
let fontTitulo, fontInfo, fontTag;

async function carregarFontes() {
  if (fontTitulo && fontInfo && fontTag) {
    return;
  }
  try {
    console.log('Carregando fontes personalizadas (3 fontes)...');
    // Sobe 2 niveis (de src/image.js para a raiz) e desce para assets/
    fontTitulo = await Jimp.loadFont(path.join(__dirname, '..', 'assets', 'fonts', 'boogaloo_40.fnt'));
    fontInfo = await Jimp.loadFont(path.join(__dirname, '..', 'assets', 'fonts', 'roboto_27.fnt'));
    fontTag = await Jimp.loadFont(path.join(__dirname, '..', 'assets', 'fonts', 'roboto_25.fnt'));
    console.log('Fontes carregadas com sucesso.');
  } catch (err) {
    console.error('ERRO CRITICO AO CARREGAR FONTES:', err);
    fontTitulo = await Jimp.loadFont(Jimp.FONT_SANS_64_WHITE);
    fontInfo = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
    fontTag = await Jimp.loadFont(Jimp.FONT_SANS_16_WHITE);
  }
}

// --- 2. GERADOR DE CAPA (Agora muito mais limpo) ---
async function gerarCapa(anime) {
  try {
    await carregarFontes();
    const fonts = { fontTitulo, fontInfo, fontTag };
    
    const largura = 1280;
    const altura = 720;
    const padding = 40;
    
    const image = new Jimp(largura, altura, '#000000');
    
    // --- Chama os modulos de desenho em ordem ---
    await drawBackground(image, anime.bannerImage, largura, altura);
    
    const posterWidth = await drawPoster(image, anime.coverImage.large, largura, altura, padding);
    
    const textoAreaLargura = largura - posterWidth - (padding * 2);
    
    const proximoY = await drawText(image, anime, fonts, padding, textoAreaLargura);
    
    await drawTags(image, anime, fonts, padding, textoAreaLargura, proximoY);
    
    await drawClassification(image, anime, padding, altura);
    
    const buffer = await image.getBufferAsync(Jimp.MIME_PNG);
    return { success: true, buffer: buffer };
    
  } catch (err) {
    console.error('ERRO GERAL AO GERAR IMAGEM:', err);
    return { success: false, error: err.message };
  }
}

module.exports = { gerarCapa, carregarFontes };
