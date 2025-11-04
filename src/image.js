// ARQUIVO: src/image.js
// (ATUALIZADO: Carrega as 5 fontes separadamente)

const Jimp = require('jimp');
const path = require('path');
const Modelos = require('./models');

// --- 1. CARREGAMENTO DE FONTES (ATUALIZADO) ---
// Vamos carregar todas as 5 fontes que usamos
let fontTituloTV, fontInfoTV, fontEstudioTV, fontTagTV, fontFilme;

async function carregarFontes() {
  if (fontTituloTV && fontInfoTV && fontEstudioTV && fontTagTV && fontFilme) {
    return; // Ja estao carregadas
  }
  try {
    console.log('Carregando fontes personalizadas (5 fontes)...');
    
    // Carrega as fontes que voce upou (usando Bold por padrao)
    fontTituloTV = await Jimp.loadFont(path.join(__dirname, '..', 'assets', 'fonts', 'boogaloo_47.fnt'));
    fontInfoTV = await Jimp.loadFont(path.join(__dirname, '..', 'assets', 'fonts', 'roboto_bold_34.fnt'));
    fontEstudioTV = await Jimp.loadFont(path.join(__dirname, '..', 'assets', 'fonts', 'boogaloo_40.fnt'));
    fontTagTV = await Jimp.loadFont(path.join(__dirname, '..', 'assets', 'fonts', 'roboto_bold_32.fnt'));
    fontFilme = await Jimp.loadFont(path.join(__dirname, '..', 'assets', 'fonts', 'boogaloo_108.fnt')); 
    
    console.log('Fontes carregadas com sucesso.');
  } catch (err) {
    console.error('ERRO CRITICO AO CARREGAR FONTES:', err);
    console.log('Usando fontes padrao como fallback...');
    // Fallbacks
    fontTituloTV = await Jimp.loadFont(Jimp.FONT_SANS_64_WHITE);
    fontInfoTV = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
    fontEstudioTV = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
    fontTagTV = await Jimp.loadFont(Jimp.FONT_SANS_16_WHITE);
    fontFilme = await Jimp.loadFont(Jimp.FONT_SANS_64_WHITE);
  }
}

// --- 2. GERADOR DE CAPA (O "DIRETOR") ---
async function gerarCapa(anime) {
  try {
    await carregarFontes();
    // Passa o objeto 'fonts' completo para os modelos
    const fonts = { fontTituloTV, fontInfoTV, fontEstudioTV, fontTagTV, fontFilme };
    
    const largura = 1280;
    const altura = 720;
    const padding = 40;
    const consts = { largura, altura, padding };
    
    const image = new Jimp(largura, altura, '#000000');
    
    // Escolhe o "artista" (modelo)
    switch (anime.layout) {
      case 'FILME':
        await Modelos.FILME(image, anime, fonts, consts);
        break;
      case 'ONA':
        await Modelos.ONA(image, anime, fonts, consts);
        break;
      case 'TV':
      default:
        await Modelos.TV(image, anime, fonts, consts);
        break;
    }
    
    const buffer = await image.getBufferAsync(Jimp.MIME_PNG);
    return { success: true, buffer: buffer };
    
  } catch (err) {
    console.error('ERRO GERAL AO GERAR IMAGEM:', err);
    return { success: false, error: err.message };
  }
}

module.exports = { gerarCapa, carregarFontes };
