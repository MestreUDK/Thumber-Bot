// ARQUIVO: src/drawing/bottomBar.js
// (ATUALIZADO com "Fluxo de Tags" inteligente entre as linhas)

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

// --- *** FUNCAO 'drawTagLine' REMOVIDA *** ---
// (Nao precisamos mais dela, a logica estara dentro da 'drawBottomBar')


// --- 4. Funcao Principal de Desenhar a Barra (LOGICA ATUALIZADA) ---
async function drawBottomBar(image, anime, fonts, padding, textAreaWidth, altura) { 
  const { fontEstudioTV, fontTagTV } = fonts;

  const classificationHeight = 60;
  const tagHeight = 45; 
  const spaceBetween = 10; 
  const spaceBetweenLines = 15; 
  const tagPaddingHorizontal = 15; // Padding interno da tag

  // --- POSICOES ---
  // Linha 1 = A linha de baixo, junto com a classificacao
  const line1Y = altura - padding - classificationHeight + (classificationHeight / 2) - (tagHeight / 2);
  const classificationY = altura - padding - classificationHeight;
  // Linha 2 = A linha acima da Linha 1
  const line2Y = line1Y - tagHeight - spaceBetweenLines;

  // O Estudio fica acima de tudo
  const estudio = anime.studios.nodes.length > 0 ? anime.studios.nodes[0].name : 'Estudio desconhecido';
  const studioTextHeight = Jimp.measureTextHeight(fontEstudioTV, estudio, textAreaWidth);
  const studioY = line2Y - studioTextHeight - spaceBetween;

  // --- 1. Desenha o Estudio (fica la em cima) ---
  image.print(fontEstudioTV, padding, studioY, estudio, textAreaWidth); 

  
  // --- 2. LOGICA DE FLUXO DE TAGS ---
  const generos = anime.genres ? anime.genres.slice(0, 6) : []; // Limita a 6 tags no total
  
  let currentTagX = padding;
  let currentTagY = line1Y; // Comecamos na Linha 1 (a de baixo)
  let onSecondLine = false; // Flag para saber se ja pulamos de linha

  for (const genero of generos) {
    // Calcula o tamanho da tag
    const generoUpper = genero.toUpperCase();
    const config = tagConfig[generoUpper] || tagConfig["DEFAULT"];
    const genreText = (config.text || generoUpper).toUpperCase(); 
    const moldName = config.color;
    const textWidth = Jimp.measureText(fontTagTV, genreText);
    const tagWidth = textWidth + (tagPaddingHorizontal * 2);

    // Verifica se a tag cabe na linha ATUAL
    if (currentTagX + tagWidth > textAreaWidth + padding) {
      
      // Se nao coube, e ja estamos na segunda linha, paramos tudo.
      if (onSecondLine) {
        break; 
      }

      // Se nao coube, e estamos na primeira linha, pulamos para a segunda.
      currentTagY = line2Y;     // Move o Y para a Linha 2
      currentTagX = padding;    // Reseta o X
      onSecondLine = true;      // Ativa a flag

      // Verifica se a tag cabe na segunda linha (caso a tag seja gigante)
      if (currentTagX + tagWidth > textAreaWidth + padding) {
        break; // Nao cabe nem na linha nova, desiste
      }
    }

    // --- Desenha a Tag (na posicao (X, Y) calculada) ---
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
    
    // Atualiza o X para a proxima tag
    currentTagX += tagWidth + spaceBetween;
  }
  
  // --- 3. Desenha a Classificacao ---
  
  // Define onde a classificacao vai comecar
  let ratingX = padding;
  if (!onSecondLine) {
    // Se ainda estamos na primeira linha, coloca a classificacao
    // logo depois da ultima tag desenhada.
    ratingX = currentTagX; 
  }
  // (Se ja pulamos para a segunda linha, a classificacao
  // sera desenhada no comeco (padding) da Linha 1)

  if (anime.classificacaoManual) { 
    const ratingFileName = getRatingImageName(anime.classificacaoManual);
    if (ratingFileName) {
      try {
        const ratingImagePath = path.join(__dirname, '..', '..', 'assets', 'classificacao', ratingFileName);
        const ratingImage = await Jimp.read(ratingImagePath);
        ratingImage.resize(Jimp.AUTO, classificationHeight);

        // Verifica se a classificacao cabe
        if (ratingX + ratingImage.bitmap.width < textAreaWidth + padding) {
            image.composite(ratingImage, ratingX, classificationY);
        }
      } catch (err) { /* ignora */ }
    }
  }
}

module.Dexports = { drawBottomBar };
