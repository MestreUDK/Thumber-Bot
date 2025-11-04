// ARQUIVO: src/image.js
// (ATUALIZADO: Carregando as fontes 'Roboto-Bold' 27 e 25)

const Jimp = require('jimp');
const path = require('path');
const Modelos = require('./models'); // Importa nossos modelos (tv.js, filme.js, etc.)

// --- 1. CARREGAMENTO DE FONTES (ATUALIZADO) ---
let fontTitulo, fontInfo, fontTag, fontFilme; 

async function carregarFontes() {
  // Se ja carregou tudo, nao faz de novo
  if (fontTitulo && fontInfo && fontTag && fontFilme) {
    return;
  }
  try {
    console.log('Carregando fontes personalizadas (Bold)...');
    fontTitulo = await Jimp.loadFont(path.join(__dirname, '..', 'assets', 'fonts', 'boogaloo_40.fnt'));
    
    // --- *** MUDANCA ESTA AQUI *** ---
    // Trocamos 'roboto_27.fnt' por 'roboto_bold_27.fnt'
    fontInfo = await Jimp.loadFont(path.join(__dirname, '..', 'assets', 'fonts', 'roboto_bold_27.fnt')); 
    // Trocamos 'roboto_25.fnt' por 'roboto_bold_25.fnt'
    fontTag = await Jimp.loadFont(path.join(__dirname, '..', 'assets', 'fonts', 'roboto_bold_25.fnt')); 
    // --- *** FIM DA MUDANCA *** ---
    
    fontFilme = await Jimp.loadFont(path.join(__dirname, '..', 'assets', 'fonts', 'boogaloo_108.fnt')); 
    
    console.log('Fontes carregadas com sucesso.');
  } catch (err) {
    console.error('ERRO CRITICO AO CARREGAR FONTES:', err);
    console.log('Usando fontes padrao como fallback...');
    // Fallbacks (caso os arquivos novos falhem)
    fontTitulo = await Jimp.loadFont(Jimp.FONT_SANS_64_WHITE);
    fontInfo = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
    fontTag = await Jimp.loadFont(Jimp.FONT_SANS_16_WHITE);
    fontFilme = await Jimp.loadFont(Jimp.FONT_SANS_64_WHITE);
  }
}

// --- 2. GERADOR DE CAPA (O "DIRETOR") ---
// (Nenhuma mudanca nesta funcao)
async function gerarCapa(anime) {
  try {
    await carregarFontes();
    const fonts = { fontTitulo, fontInfo, fontTag, fontFilme };
    
    const largura = 1280;
    const altura = 720;
    const padding = 40;
    const consts = { largura, altura, padding };
    
    // Cria a imagem base
    const image = new Jimp(largura, altura, '#000000');
    
    // Escolhe o "artista" (modelo) baseado no que foi salvo na sessao
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
