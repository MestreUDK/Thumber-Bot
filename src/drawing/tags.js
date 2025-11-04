// ARQUIVO: src/drawing/tags.js
// (ATUALIZADO: Posição movida para o fundo, acima da classificação)

const Jimp = require('jimp');
const fs = require('fs');
const path = require('path');

// --- 1. Carrega o Dicionario de Tags (o tag_config.json) ---
let tagConfig;
try {
  const configPath = path.join(__dirname, '..', '..', 'tag_config.json');
  tagConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
} catch (err) {
  console.error('ERRO FATAL: Nao foi possivel ler o tag_config.json!', err);
  tagConfig = { "DEFAULT": { "text": null, "color": "tag_cinza_claro.png" } };
}

// --- 2. Cache de Moldes de Tag (COM FATIAS) ---
const tagMolds = {};
const cantoLargura = 14; // Largura do seu canto arredondado (14px + 2px meio + 14px = 30px total)
const meioLargura = 2;  // Largura da fatia do meio no seu molde

async function getTagSlices(moldName) {
  if (tagMolds[moldName]) {
    return tagMolds[moldName];
  }
  try {
    const moldPath = path.join(__dirname, '..', '..', 'assets', 'tags', moldName);
    const mold = await Jimp.read(moldPath);
    
    // Fatiar o molde em 3 partes
    const cantoEsquerdo = mold.clone().crop(0, 0, cantoLargura, 35);
    const meio = mold.clone().crop(cantoLargura, 0, meioLargura, 35);
    const cantoDireito = mold.clone().crop(cantoLargura + meioLargura, 0, cantoLargura, 35);
    
    const slices = { left: cantoEsquerdo, middle: meio, right: cantoDireito };
    tagMolds[moldName] = slices;
    return slices;
  } catch (err) {
    console.error(`ERRO: Nao foi possivel carregar ou fatiar o molde de tag: ${moldName}`, err.message);
    return null;
  }
}

// --- 3. Funcao Principal de Desenhar as Tags ---
// *** MUDANÇA: 'currentTextY' foi trocado por 'altura' ***
async function drawTags(image, anime, fonts, padding, textAreaWidth, altura) { 
  const { fontTag } = fonts;
  
  const tagHeight = 35;
  const tagPaddingHorizontal = 15;
  const generos = anime.genres || [];

  // --- *** MUDANÇA: Calcula a posicao Y a partir do FUNDO *** ---
  const classificationHeight = 60; // Altura da imagem de classificacao
  const spaceBelowTags = 10; // Espaco entre tags e classificacao
  
  // O Y comeca no fundo, sobe o padding, sobe a classificacao, sobe o espaco, e sobe a altura da propria tag
  let currentTagY = altura - padding - classificationHeight - spaceBelowTags - tagHeight;
  let currentTagX = padding;
  // --- FIM DA MUDANÇA ---
  
  for (const genero of generos.slice(0, 4)) {
    const generoUpper = genero.toUpperCase();
    
    const config = tagConfig[generoUpper] || tagConfig["DEFAULT"];
    const genreText = (config.text || generoUpper).toUpperCase(); 
    const moldName = config.color;

    const textWidth = Jimp.measureText(fontTag, genreText);
    const tagWidth = textWidth + (tagPaddingHorizontal * 2);

    // Se nao couber na linha, para de desenhar
    if (currentTagX + tagWidth > textAreaWidth + padding) {
       break; 
    }
    
    const slices = await getTagSlices(moldName);
    
    if (slices) {
      const meioWidth = tagWidth - (cantoLargura * 2);
      
      image.composite(slices.left, currentTagX, currentTagY);
      
      if (meioWidth > 0) {
          image.composite(
              slices.middle.clone().resize(meioWidth, tagHeight), // Estica o meio
              currentTagX + cantoLargura, 
              currentTagY
          );
      }
      
      image.composite(
          slices.right, 
          currentTagX + cantoLargura + meioWidth, 
          currentTagY
      );
      
    } // (Nao precisamos mais do Fallback, pois o bug do .radius() esta resolvido)

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

module.exports = { drawTags };
