// ARQUIVO: src/drawing/bottomBar.js
// (ATUALIZADO: Busca inteligente de tags em Inglês E Português)

const Jimp = require('jimp');
const fs = require('fs');
const path = require('path');
const { getRatingImageName } = require('../utils.js');

// --- 1. Carrega o Dicionario de Tags ---
let tagConfig;
try {
  const configPath = path.join(__dirname, '..', '..', 'tag_config.json');
  tagConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
} catch (err) {
  console.error('ERRO FATAL: Nao foi possivel ler o tag_config.json!', err);
  tagConfig = { "DEFAULT": { "text": null, "color": "tag_cinza_claro.png" } };
}

// --- 2. Cache de Moldes de Tag ---
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

// --- *** NOVA FUNÇÃO: BUSCA INTELIGENTE *** ---
function findTagConfig(tagName) {
  if (!tagName) return tagConfig["DEFAULT"];
  
  const upperName = tagName.toUpperCase().trim();

  // 1. Tenta encontrar direto pela chave em Inglês (Ex: "ACTION")
  // (Comportamento original da API)
  if (tagConfig[upperName]) {
    return tagConfig[upperName];
  }

  // 2. Se não achou, procura pelo campo "text" em Português (Ex: "AÇÃO")
  // (Comportamento para o Modo Manual)
  const found = Object.values(tagConfig).find(conf => 
    conf.text && conf.text.toUpperCase() === upperName
  );

  if (found) return found;

  // 3. Se não achar nada, retorna o padrão
  return tagConfig["DEFAULT"];
}
// -----------------------------------------------

// --- 4. Funcao Principal de Desenhar a Barra ---
async function drawBottomBar(image, anime, fonts, padding, textAreaWidth, altura) { 
  const { fontEstudioTV, fontTagTV } = fonts;

  const classificationHeight = 65;
  const tagHeight = 45; 
  const spaceBetween = 10; 
  const spaceBetweenLines = 15; 
  const tagPaddingHorizontal = 15;

  // --- POSICOES Y ---
  const line1Y = (altura - padding - classificationHeight + (classificationHeight / 2) - (tagHeight / 2))
                 - tagHeight - spaceBetweenLines;
  const classificationY = line1Y - (classificationHeight / 2) + (tagHeight / 2);
  const line2Y = line1Y - tagHeight - spaceBetweenLines;

  // --- 1. DESENHA A CLASSIFICACAO ---
  let tagsStartX_Line1 = padding;
  if (anime.classificacaoManual) { 
    const ratingFileName = getRatingImageName(anime.classificacaoManual);
    if (ratingFileName) {
      try {
        const ratingImagePath = path.join(__dirname, '..', '..', 'assets', 'classificacao', ratingFileName);
        const ratingImage = await Jimp.read(ratingImagePath);
        ratingImage.resize(Jimp.AUTO, classificationHeight);

        const ratingX = padding;
        const ratingWidth = ratingImage.bitmap.width;

        if (ratingX + ratingWidth < textAreaWidth + padding) {
            image.composite(ratingImage, ratingX, classificationY);
            tagsStartX_Line1 = ratingX + ratingWidth + spaceBetween;
        }
      } catch (err) { /* ignora */ }
    }
  }

  // --- 2. LOGICA DE FLUXO DE TAGS (ATUALIZADA) ---
  const generos = anime.genres ? anime.genres.slice(0, 6) : []; 

  let currentTagX = tagsStartX_Line1; 
  let currentTagY = line1Y;
  let onSecondLine = false;

  for (const genero of generos) {
    // --- *** MUDANÇA: Usa a nova função de busca *** ---
    const config = findTagConfig(genero);
    
    // Define o texto: Se a config tiver tradução, usa ela. Se não, usa o original.
    // Isso garante que se você digitar "Action", ele desenha "AÇÃO".
    // E se você digitar "Ação", ele desenha "AÇÃO".
    const genreText = (config.text || genero).toUpperCase(); 
    const moldName = config.color;
    // ----------------------------------------------------

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
  
  // --- 3. DESENHA O ESTUDIO ---
  const estudio = anime.studios.nodes.length > 0 ? anime.studios.nodes[0].name : 'Estudio desconhecido';
  const studioTextHeight = Jimp.measureTextHeight(fontEstudioTV, estudio, textAreaWidth);
  let studioY;
  
  const extraGap = 15;

  if (onSecondLine) {
    studioY = line2Y - studioTextHeight - spaceBetween;
  } else {
    studioY = line1Y - studioTextHeight - spaceBetween - extraGap;
  }
  
  image.print(fontEstudioTV, padding, studioY, estudio, textAreaWidth);
}

module.exports = { drawBottomBar };
