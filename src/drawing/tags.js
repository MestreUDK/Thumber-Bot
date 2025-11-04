// ARQUIVO: src/drawing/tags.js
// (CORRIGIDO: .radius() e Posição acima da classificacao)

const Jimp = require('jimp');
const fs = require('fs');
const path = require('path');

let tagConfig;
try {
  const configPath = path.join(__dirname, '..', '..', 'tag_config.json');
  tagConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
} catch (err) {
  tagConfig = { "DEFAULT": { "text": null, "color": "tag_cinza_claro.png" } };
}

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
    return null;
  }
}

async function drawTags(image, anime, fonts, padding, textAreaWidth, altura) { 
  const { fontTag } = fonts;
  const tagHeight = 35;
  const tagPaddingHorizontal = 15;
  const generos = anime.genres || [];

  const classificationHeight = 60;
  const spaceBelowTags = 10;
  
  let currentTagY = altura - padding - classificationHeight - spaceBelowTags - tagHeight;
  let currentTagX = padding;
  
  for (const genero of generos.slice(0, 4)) { // Limite de 4 tags
    const generoUpper = genero.toUpperCase();
    const config = tagConfig[generoUpper] || tagConfig["DEFAULT"];
    const genreText = (config.text || generoUpper).toUpperCase(); 
    const moldName = config.color;

    const textWidth = Jimp.measureText(fontTag, genreText);
    const tagWidth = textWidth + (tagPaddingHorizontal * 2);

    if (currentTagX + tagWidth > textAreaWidth + padding) {
       break; 
    }
    
    const slices = await getTagSlices(moldName);
    if (slices) {
      const meioWidth = tagWidth - (cantoLargura * 2);
      image.composite(slices.left, currentTagX, currentTagY);
      if (meioWidth > 0) {
          image.composite(slices.middle.clone().resize(meioWidth, tagHeight), currentTagX + cantoLargura, currentTagY);
      }
      image.composite(slices.right, currentTagX + cantoLargura + meioWidth, currentTagY);
    } else {
      // Fallback (agora com .radius() correto)
      const tagFallback = new Jimp(tagWidth, tagHeight, 0xFFBB00FF);
      await tagFallback.radius(10); // <--- O BUG ESTAVA AQUI
      image.composite(tagFallback, currentTagX, currentTagY);
    }

    const textY = currentTagY + (tagHeight - Jimp.measureTextHeight(fontTag, genreText, tagWidth)) / 2;
    image.print(fontTag, currentTagX + tagPaddingHorizontal, textY, genreText);
    currentTagX += tagWidth + 10;
  }
}

module.exports = { drawTags };
