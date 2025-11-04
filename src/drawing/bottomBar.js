// ARQUIVO: src/drawing/bottomBar.js
// (ATUALIZADO para os novos moldes de 45px de altura)

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

// --- 2. Cache de Moldes de Tag (ATUALIZADO) ---
const tagMolds = {};
// ATUALIZADO: Largura do canto = 22px (Raio de 50% de 45px de altura)
const cantoLargura = 22; 
// ATUALIZADO: Largura do miolo = 16px (Baseado no seu molde de 60px: 60 - 22 - 22 = 16)
const meioLargura = 16; 

async function getTagSlices(moldName) {
  if (tagMolds[moldName]) {
    return tagMolds[moldName];
  }
  try {
    const moldPath = path.join(__dirname, '..', '..', 'assets', 'tags', moldName);
    const mold = await Jimp.read(moldPath);
    const slices = {
      // ATUALIZADO: Corta com 45px de altura
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

// --- 3. Funcao de desenhar uma linha de tags ---
async function drawTagLine(image, tags, fonts, startX, startY, maxWidth) {
  const { fontTagTV } = fonts;
  // ATUALIZADO: Altura da tag
  const tagHeight = 45; 
  const tagPaddingHorizontal = 15;
  const spaceBetween = 10;
  let currentTagX = startX;

  for (const genero of tags) {
    const generoUpper = genero.toUpperCase();
    const config = tagConfig[generoUpper] || tagConfig["DEFAULT"];
    const genreText = (config.text || generoUpper).toUpperCase(); 
    const moldName = config.color;

    const textWidth = Jimp.measureText(fontTagTV, genreText);
    const tagWidth = textWidth + (tagPaddingHorizontal * 2);

    if (currentTagX + tagWidth > maxWidth) {
       break; 
    }

    const slices = await getTagSlices(moldName);
    if (slices) {
      const meioWidth = tagWidth - (cantoLargura * 2);
      image.composite(slices.left, currentTagX, startY);
      if (meioWidth > 0) {
          // ATUALIZADO: Redimensiona para 45px de altura
          image.composite(slices.middle.clone().resize(meioWidth, tagHeight), currentTagX + cantoLargura, startY);
      }
      image.composite(slices.right, currentTagX + cantoLargura + meioWidth, startY);
    }

    // ATUALIZADO: Calcula o Y do texto baseado na nova altura de 45px
    const textY = startY + (tagHeight - Jimp.measureTextHeight(fontTagTV, genreText, tagWidth)) / 2;
    image.print(fontTagTV, currentTagX + tagPaddingHorizontal, textY, genreText);
    currentTagX += tagWidth + spaceBetween;
  }
  return currentTagX;
}

// --- 4. Funcao Principal de Desenhar a Barra ---
async function drawBottomBar(image, anime, fonts, padding, textAreaWidth, altura) { 
  const { fontEstudioTV } = fonts;

  const classificationHeight = 60;
  // ATUALIZADO: Altura da tag
  const tagHeight = 45; 
  const spaceBetween = 10; 
  const spaceBetweenLines = 15; 
  const generos = anime.genres || [];

  // --- POSICOES (As formulas sao dinamicas, vao se ajustar sozinhas) ---
  const line1Y = altura - padding - classificationHeight + (classificationHeight / 2) - (tagHeight / 2);
  const classificationY = altura - padding - classificationHeight;
  const line2Y = line1Y - tagHeight - spaceBetweenLines;

  const estudio = anime.studios.nodes.length > 0 ? anime.studios.nodes[0].name : 'Estudio desconhecido';
  const studioTextHeight = Jimp.measureTextHeight(fontEstudioTV, estudio, textAreaWidth);
  const studioY = line2Y - studioTextHeight - spaceBetween;

  // --- DESENHAR ---
  image.print(fontEstudioTV, padding, studioY, estudio, textAreaWidth); 

  const tagsLinha2 = generos.slice(4, 6); 
  await drawTagLine(image, tagsLinha2, fonts, padding, line2Y, textAreaWidth);

  const tagsLinha1 = generos.slice(0, 4);
  const nextTagX = await drawTagLine(image, tagsLinha1, fonts, padding, line1Y, textAreaWidth);

  if (anime.classificacaoManual) { 
    const ratingFileName = getRatingImageName(anime.classificacaoManual);
    if (ratingFileName) {
      try {
        const ratingImagePath = path.join(__dirname, '..', '..', 'assets', 'classificacao', ratingFileName);
        const ratingImage = await Jimp.read(ratingImagePath);
        ratingImage.resize(Jimp.AUTO, classificationHeight);

        const ratingX = nextTagX; 

        if (ratingX + ratingImage.bitmap.width < textAreaWidth + padding) {
            image.composite(ratingImage, ratingX, classificationY);
        }
      } catch (err) { /* ignora */ }
    }
  }
}

module.exports = { drawBottomBar };
