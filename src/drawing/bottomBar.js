// ARQUIVO: src/drawing/bottomBar.js
// (NOVO ARTISTA: Desenha tags e classificacao na mesma linha)

const Jimp = require('jimp');
const fs = require('fs');
const path = require('path');
const { getRatingImageName } = require('../utils.js');

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
const cantoLargura = 14;
const meioLargura = 2;

async function getTagSlices(moldName) {
  if (tagMolds[moldName]) {
    return tagMolds[moldName];
  }
  try {
    const moldPath = path.join(__dirname, '..', '..', 'assets', 'tags', moldName);
    const mold = await Jimp.read(moldPath);
    const slices = {
      left: mold.clone().crop(0, 0, cantoLargura, 35),
      middle: mold.clone().crop(cantoLargura, 0, meioLargura, 35),
      right: mold.clone().crop(cantoLargura + meioLargura, 0, cantoLargura, 35)
    };
    tagMolds[moldName] = slices;
    return slices;
  } catch (err) {
    console.error(`ERRO: Nao foi possivel carregar o molde de tag: ${moldName}`, err.message);
    return null;
  }
}

// --- 3. Funcao Principal de Desenhar a Barra Inferior ---
async function drawBottomBar(image, anime, fonts, padding, textAreaWidth, altura) { 
  const { fontTag } = fonts;
  
  const tagHeight = 35;
  const tagPaddingHorizontal = 15;
  const classificationHeight = 60; // Altura da imagem de classificacao
  
  // --- Calcula a Posicao Y (baseado no item mais alto, a classificacao) ---
  const bottomY = altura - padding - classificationHeight;
  
  // --- 1. Desenha as Tags ---
  const generos = anime.genres || [];
  let currentTagX = padding; // Comeca na esquerda
  
  // *** MUDANCA: Limite de 6 tags ***
  for (const genero of generos.slice(0, 6)) {
    const generoUpper = genero.toUpperCase();
    const config = tagConfig[generoUpper] || tagConfig["DEFAULT"];
    const genreText = (config.text || generoUpper).toUpperCase(); 
    const moldName = config.color;

    const textWidth = Jimp.measureText(fontTag, genreText);
    const tagWidth = textWidth + (tagPaddingHorizontal * 2);

    // Se a proxima tag nao couber, para de desenhar
    if (currentTagX + tagWidth > textAreaWidth + padding) {
       break; 
    }
    
    // Calcula o Y da tag para alinha-la ao *centro* da barra
    const tagY = bottomY + (classificationHeight / 2) - (tagHeight / 2);
    
    const slices = await getTagSlices(moldName);
    if (slices) {
      const meioWidth = tagWidth - (cantoLargura * 2);
      image.composite(slices.left, currentTagX, tagY);
      if (meioWidth > 0) {
          image.composite(slices.middle.clone().resize(meioWidth, tagHeight), currentTagX + cantoLargura, tagY);
      }
      image.composite(slices.right, currentTagX + cantoLargura + meioWidth, tagY);
    }

    const textY = tagY + (tagHeight - Jimp.measureTextHeight(fontTag, genreText, tagWidth)) / 2;
    image.print(fontTag, currentTagX + tagPaddingHorizontal, textY, genreText);
    
    currentTagX += tagWidth + 10; // Move o X para a proxima
  }

  // --- 2. Desenha a Classificacao (APOS as tags) ---
  if (anime.classificacaoManual) { 
    const ratingFileName = getRatingImageName(anime.classificacaoManual);
    if (ratingFileName) {
      try {
        const ratingImagePath = path.join(__dirname, '..', '..', 'assets', 'classificacao', ratingFileName);
        const ratingImage = await Jimp.read(ratingImagePath);
        ratingImage.resize(Jimp.AUTO, classificationHeight);
        
        // --- *** MUDANCA: Posicao X agora e DEPOIS das tags *** ---
        const ratingX = currentTagX + 10; // 10px depois da ultima tag
        const ratingY = bottomY;

        // Verifica se a classificacao cabe na tela
        if (ratingX + ratingImage.bitmap.width < textAreaWidth + padding) {
            image.composite(ratingImage, ratingX, ratingY);
        }
      } catch (err) {
        console.warn(`Aviso: Nao foi possivel carregar a imagem ${ratingFileName} da pasta /classificacao/`);
      }
    }
  }
}

module.exports = { drawBottomBar };
