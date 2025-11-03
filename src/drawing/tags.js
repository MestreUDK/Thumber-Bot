// ARQUIVO: src/drawing/tags.js
// (ATUALIZADO: Le o 'tag_config.json' e usa os moldes .png)

const Jimp = require('jimp');
const fs = require('fs');
const path = require('path');

// --- 1. Carrega o Dicionario de Tags (o tag_config.json) ---
let tagConfig;
try {
  // Sobe 2 niveis (de src/drawing para a raiz) e acha o config
  const configPath = path.join(__dirname, '..', '..', 'tag_config.json');
  tagConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
} catch (err) {
  console.error('ERRO FATAL: Nao foi possivel ler o tag_config.json!', err);
  // Se falhar, cria um config de fallback para o bot nao quebrar
  tagConfig = { "DEFAULT": { "text": null, "color": "tag_cinza_claro.png" } };
}

// --- 2. Cache de Moldes de Tag (para nao carregar 10x) ---
const tagMolds = {};

async function getTagMold(moldName) {
  // Se ja carregamos 'tag_laranja.png', nao carrega de novo
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
    const genreText = config.text || generoUpper; 
    
    // Pega o nome do arquivo de cor (ex: 'tag_vermelho.png')
    const moldName = config.color;

    const textWidth = Jimp.measureText(fontTag, genreText);
    const tagWidth = textWidth + (tagPaddingHorizontal * 2);

    if (currentTagX + tagWidth > textAreaWidth + padding) {
      currentTagX = padding;
      currentTagY += tagHeight + 15;
    }
    
    // --- *** A NOVA MAGICA *** ---
    const tagMold = await getTagMold(moldName);
    
    if (tagMold) {
      // Clona o molde, redimensiona (estica) e cola na capa
      image.composite(
        tagMold.clone().resize(tagWidth, tagHeight), // Estica o molde
        currentTagX, 
        currentTagY
      );
    }
    // --- *** FIM DA MAGICA *** ---

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
