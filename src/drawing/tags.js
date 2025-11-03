// ARQUIVO: src/drawing/tags.js
// (CORRIGIDO: Troca .round() por .radius(), O ERRO ESTAVA AQUI)

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

// --- 2. Cache de Moldes de Tag (para nao carregar 10x) ---
const tagMolds = {};

async function getTagMold(moldName) {
  if (tagMolds[moldName]) {
    return tagMolds[moldName];
  }
  
  try {
    const moldPath = path.join(__dirname, '..', '..', 'assets', 'tags', moldName);
    const mold = await Jimp.read(moldPath);
    tagMolds[moldName] = mold; // Salva no cache
    return mold;
  } catch (err) {
    console.error(`ERRO: Nao foi possivel carregar o molde de tag: ${moldName}`, err.message);
    return null;
  }
}

// --- 3. Funcao Principal de Desenhar as Tags ---
async function drawTags(image, anime, fonts, padding, textAreaWidth, currentTextY) {
  const { fontTag } = fonts;
  let currentTagX = padding;
  let currentTagY = currentTextY;
  
  const tagHeight = 35;
  const tagPaddingHorizontal = 15;
  const generos = anime.genres || [];
  
  for (const genero of generos.slice(0, 4)) {
    const generoUpper = genero.toUpperCase();
    
    // Pega a config do JSON (ou usa o DEFAULT)
    const config = tagConfig[generoUpper] || tagConfig["DEFAULT"];
    
    // Pega o texto (traduzido ou o original)
    const genreText = (config.text || generoUpper).toUpperCase(); 
    
    const moldName = config.color;

    const textWidth = Jimp.measureText(fontTag, genreText);
    const tagWidth = textWidth + (tagPaddingHorizontal * 2);

    if (currentTagX + tagWidth > textAreaWidth + padding) {
      currentTagX = padding;
      currentTagY += tagHeight + 15;
    }
    
    const tagMold = await getTagMold(moldName);
    
    if (tagMold) {
      // Clona o molde, redimensiona (estica) e cola na capa
      image.composite(
        tagMold.clone().resize(tagWidth, tagHeight), // Estica o molde
        currentTagX, 
        currentTagY
      );
    } else {
      // Fallback se o molde (ex: tag_laranja.png) nao for encontrado
      // --- *** CORRECAO DO BUG: .radius() no lugar de .round() *** ---
      const tagFallback = new Jimp(tagWidth, tagHeight, 0xFFBB00FF);
      await tagFallback.radius(10); // <--- AQUI ESTAVA O ERRO
      image.composite(tagFallback, currentTagX, currentTagY);
    }

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
