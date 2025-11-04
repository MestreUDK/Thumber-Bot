// ARQUIVO: src/drawing/bottomBar.js
// (NOVO ARTISTA: Desenha Studio, 6 Tags em 2 linhas, e Classificacao na direita)

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
    console.error(`ERRO: Nao foi possivel carregar o molde de tag: ${moldName}`);
    return null;
  }
}

// --- 3. Funcao de desenhar uma linha de tags ---
// (Esta e uma funcao auxiliar interna)
async function drawTagLine(image, tags, fonts, startX, startY, maxWidth) {
  const { fontTag } = fonts;
  const tagHeight = 35;
  const tagPaddingHorizontal = 15;
  const spaceBetween = 10;
  let currentTagX = startX;

  for (const genero of tags) {
    const generoUpper = genero.toUpperCase();
    const config = tagConfig[generoUpper] || tagConfig["DEFAULT"];
    const genreText = (config.text || generoUpper).toUpperCase(); 
    const moldName = config.color;

    const textWidth = Jimp.measureText(fontTag, genreText);
    const tagWidth = textWidth + (tagPaddingHorizontal * 2);

    if (currentTagX + tagWidth > maxWidth) {
       break; // Para se nao couber
    }
    
    const slices = await getTagSlices(moldName);
    if (slices) {
      const meioWidth = tagWidth - (cantoLargura * 2);
      image.composite(slices.left, currentTagX, startY);
      if (meioWidth > 0) {
          image.composite(slices.middle.clone().resize(meioWidth, tagHeight), currentTagX + cantoLargura, startY);
      }
      image.composite(slices.right, currentTagX + cantoLargura + meioWidth, startY);
    }

    const textY = startY + (tagHeight - Jimp.measureTextHeight(fontTag, genreText, tagWidth)) / 2;
    image.print(fontTag, currentTagX + tagPaddingHorizontal, textY, genreText);
    currentTagX += tagWidth + spaceBetween;
  }
  return currentTagX; // Retorna onde parou
}

// --- 4. Funcao Principal de Desenhar a Barra ---
async function drawBottomBar(image, anime, fonts, padding, textAreaWidth, altura) { 
  const { fontTitulo } = fonts;
  
  const classificationHeight = 60;
  const tagHeight = 35;
  const spaceBetween = 10;
  const spaceAboveBar = 15;
  const generos = anime.genres || [];

  // --- POSICOES (Calculado de baixo para cima) ---
  
  // 1. Posicao da Classificacao e Linha 1 de Tags
  const classificationY = altura - padding - classificationHeight;
  const tagLine1Y = classificationY + (classificationHeight / 2) - (tagHeight / 2); // Centraliza com a classificacao
  
  // 2. Posicao da Linha 2 de Tags
  const tagLine2Y = tagLine1Y - tagHeight - spaceBetween;
  
  // 3. Posicao do Estudio
  const estudio = anime.studios.nodes.length > 0 ? anime.studios.nodes[0].name : 'Estudio desconhecido';
  const studioTextHeight = Jimp.measureTextHeight(fontTitulo, estudio, textAreaWidth);
  const studioY = tagLine2Y - studioTextHeight - spaceBetween;

  
  // --- DESENHAR ---
  
  // Desenha o Estudio
  image.print(fontTitulo, padding, studioY, estudio, textAreaWidth); 
  
  // Desenha a Linha 1 de Tags (as primeiras 4)
  const tagsLinha1 = generos.slice(0, 4);
  const nextTagX = await drawTagLine(image, tagsLinha1, fonts, padding, tagLine1Y, textAreaWidth);

  // Desenha a Linha 2 de Tags (as proximas 2)
  const tagsLinha2 = generos.slice(4, 6);
  await drawTagLine(image, tagsLinha2, fonts, padding, tagLine2Y, textAreaWidth);
  
  // Desenha a Classificacao (onde voce marcou o retangulo)
  if (anime.classificacaoManual) { 
    const ratingFileName = getRatingImageName(anime.classificacaoManual);
    if (ratingFileName) {
      try {
        const ratingImagePath = path.join(__dirname, '..', '..', 'assets', 'classificacao', ratingFileName);
        const ratingImage = await Jimp.read(ratingImagePath);
        ratingImage.resize(Jimp.AUTO, classificationHeight);
        
        const ratingX = nextTagX; // Onde a ultima tag da linha 1 parou
        if (ratingX + ratingImage.bitmap.width < textAreaWidth + padding) {
            image.composite(ratingImage, ratingX, classificationY);
        }
      } catch (err) { /* ignora */ }
    }
  }
}

module.exports = { drawBottomBar };
