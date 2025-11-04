// ARQUIVO: src/drawing/bottomBar.js
// (ATUALIZADO com "Fluxo de Tags" inteligente e correcao no Jimp.AUTO)

const Jimp = require('jimp');
const fs = require('fs');
const path = require('path');
const { getRatingImageName } = require('../utils.js');

// --- 1. Carrega o Dicionario de Tags (Sem mudancas) ---
let tagConfig;
try {
  const configPath = path.join(__dirname, '..', '..', 'tag_config.json');
  tagConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
} catch (err) {
  console.error('ERRO FATAL: Nao foi possivel ler o tag_config.json!', err);
  tagConfig = { "DEFAULT": { "text": null, "color": "tag_cinza_claro.png" } };
}

// --- 2. Cache de Moldes de Tag (Sem mudancas) ---
const tagMolds = {};
const cantoLargura = 22; 
const meioLargura = 16; 

async function getTagSlices(moldName) {
  if (tagMolds[moldName]) {
    return tagMolds[moldName];
  }
  try {
    const moldPath = path.join(__dirname, '..', '..', 'assets', 'tags', moldName);
    const mold = await Jimp.read(moldPath);
    const slices = {
      left: mold.clone().crop(0, 0, cantoLargura, 45),
      middle: mold.clone().crop(cantoLargura, 0, meioLargura, 45),
      right: mold.clone().crop(cantoLargura + meioLargura, 0, cantoLargura, 45)
    };
    tagMolds[moldName] = slices;
    return slices;
  } catch (err) {
    console.error(`ERRO: Nao foi possivel carregar o molde de tag: ${moldName}`);
    return null;
  }
}

// --- 4. Funcao Principal de Desenhar a Barra (LOGICA ATUALIZADA) ---
async function drawBottomBar(image, anime, fonts, padding, textAreaWidth, altura) { 
  const { fontEstudioTV, fontTagTV } = fonts;

  const classificationHeight = 60;
  const tagHeight = 45; 
  const spaceBetween = 10; 
  const spaceBetweenLines = 15; 
  const tagPaddingHorizontal = 15; // Padding interno da tag

  // --- POSICOES ---
  const line1Y = altura - padding - classificationHeight + (classificationHeight / 2) - (tagHeight / 2);
  const classificationY = altura - padding - classificationHeight;
  const line2Y = line1Y - tagHeight - spaceBetweenLines;

  const estudio = anime.studios.nodes.length > 0 ? anime.studios.nodes[0].name : 'Estudio desconhecido';
  const studioTextHeight = Jimp.measureTextHeight(fontEstudioTV, estudio, textAreaWidth);
  const studioY = line2Y - studioTextHeight - spaceBetween;

  // --- 1. Desenha o Estudio ---
  image.print(fontEstudioTV, padding, studioY, estudio, textAreaWidth); 

  
  // --- 2. LOGICA DE FLUXO DE TAGS ---
  const generos = anime.genres ? anime.genres.slice(0, 6) : []; 
  
  let currentTagX = padding;
  let currentTagY = line1Y; // Comecamos na Linha 1 (a de baixo)
  let onSecondLine = false; 

  for (const genero of generos) {
    const generoUpper = genero.toUpperCase();
    const config = tagConfig[generoUpper] || tagConfig["DEFAULT"];
    const genreText = (config.text || generoUpper).toUpperCase(); 
    const moldName = config.color;
    const textWidth = Jimp.measureText(fontTagTV, genreText);
    const tagWidth = textWidth + (tagPaddingHorizontal * 2);

    if (currentTagX + tagWidth > textAreaWidth + padding) {
      if (onSecondLine) {
        break; 
      }
      currentTagY = line2Y;
      currentTagX = padding;
      onSecondLine = true;

      if (currentTagX + tagWidth > textAreaWidth + padding) {
        break; 
      }
    }

    // --- Desenha a Tag ---
    const slices = await getTagSlices(moldName);
    if (slices) {
      const meioWidth = tagWidth - (cantoLargura * 2);
      image.composite(slices.left, currentTagX, currentTagY);
      if (meioWidth > 0) {
          image.composite(slices.middle.clone().resize(meioWidth, tagHeight), currentTagX + cantoLargura, currentTagY);
      }
      image.composite(slices.right, currentTagX + cantoLargura + meioWidth, currentTagY);
    }
    
    const textY = currentTagY + (tagHeight - Jimp.measureTextHeight(fontTagTV, genreText, tagWidth)) / 2;
    image.print(fontTagTV, currentTagX + tagPaddingHorizontal, textY, genreText);
    
    currentTagX += tagWidth + spaceBetween;
  }
  
  // --- 3. Desenha a Classificacao ---
  let ratingX = padding;
  if (!onSecondLine) {
    ratingX = currentTagX; 
  }

  if (anime.classificacaoManual) { 
    const ratingFileName = getRatingImageName(anime.classificacaoManual);
    if (ratingFileName) {
      try {
        const ratingImagePath = path.join(__dirname, '..', '..', 'assets', 'classificacao', ratingFileName);
        const ratingImage = await Jimp.read(ratingImagePath);
        
        // --- *** CORRECAO ESTAVA AQUI *** ---
        // (Estava "Jimpo.AUTO", corrigido para "Jimp.AUTO")
        ratingImage.resize(Jimp.AUTO, classificationHeight);

        if (ratingX + ratingImage.bitmap.width < textAreaWidth + padding) {
            image.composite(ratingImage, ratingX, classificationY);
        }
      } catch (err) { /* ignora */ }
    }
  }
}

module.exports = { drawBottomBar };
