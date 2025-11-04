// ARQUIVO: src/drawing/bottomBar.js
// (ATUALIZADO: Usa as novas fontes 'fontEstudioTV' e 'fontTagTV')

const Jimp = require('jimp');
const fs = require('fs');
const path = require('path');
const { getRatingImageName } = require('../utils.js');

// --- 1. Carrega o Dicionario de Tags (Sem mudancas) ---
let tagConfig;
try {
  const configPath = path.join(__dirname, '..', '..', 'tag_config.json');
  tagConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
} catch (err) { /* ... */ }

// --- 2. Cache de Moldes de Tag (Sem mudancas) ---
const tagMolds = {};
const cantoLargura = 14;
const meioLargura = 2;

async function getTagSlices(moldName) { /* ... (Sem mudancas) ... */ }

// --- 3. Funcao de desenhar uma linha de tags ---
// (ATUALIZADO: Pega 'fontTagTV' do objeto 'fonts')
async function drawTagLine(image, tags, fonts, startX, startY, maxWidth) {
  // --- *** MUDANCA AQUI *** ---
  const { fontTagTV } = fonts; // Pega a fonte de 32px
  const tagHeight = 35;
  const tagPaddingHorizontal = 15;
  const spaceBetween = 10;
  let currentTagX = startX;

  for (const genero of tags) {
    const generoUpper = genero.toUpperCase();
    const config = tagConfig[generoUpper] || tagConfig["DEFAULT"];
    const genreText = (config.text || generoUpper).toUpperCase(); 
    const moldName = config.color;

    // Usa fontTagTV (Roboto Bold 32)
    const textWidth = Jimp.measureText(fontTagTV, genreText); 
    const tagWidth = textWidth + (tagPaddingHorizontal * 2);

    if (currentTagX + tagWidth > maxWidth) {
       break; 
    }
    
    const slices = await getTagSlices(moldName);
    if (slices) {
      //... (codigo de fatiar)
    }

    // Usa fontTagTV (Roboto Bold 32)
    const textY = startY + (tagHeight - Jimp.measureTextHeight(fontTagTV, genreText, tagWidth)) / 2;
    image.print(fontTagTV, currentTagX + tagPaddingHorizontal, textY, genreText);
    currentTagX += tagWidth + spaceBetween;
  }
  return currentTagX; // Retorna onde parou
}

// --- 4. Funcao Principal de Desenhar a Barra ---
// (ATUALIZADO: Pega 'fontEstudioTV' do objeto 'fonts')
async function drawBottomBar(image, anime, fonts, padding, textAreaWidth, altura) { 
  // --- *** MUDANCA AQUI *** ---
  const { fontEstudioTV } = fonts; // Pega a fonte de 40px
  
  const classificationHeight = 60;
  const tagHeight = 35;
  const spaceBetween = 10;
  const spaceBetweenLines = 15;
  const generos = anime.genres || [];

  // 1. Posicao da Linha 1 de Tags e Classificacao
  const line1Y = altura - padding - classificationHeight + (classificationHeight / 2) - (tagHeight / 2);
  const classificationY = altura - padding - classificationHeight;
  
  // 2. Posicao da Linha 2 de Tags
  const line2Y = line1Y - tagHeight - spaceBetweenLines;
  
  // 3. Posicao do Estudio
  const estudio = anime.studios.nodes.length > 0 ? anime.studios.nodes[0].name : 'Estudio desconhecido';
  // Usa fontEstudioTV (Boogaloo 40)
  const studioTextHeight = Jimp.measureTextHeight(fontEstudioTV, estudio, textAreaWidth);
  const studioY = line2Y - studioTextHeight - spaceBetween;
  
  // --- DESENHAR ---
  
  // Desenha o Estudio (com fontEstudioTV)
  image.print(fontEstudioTV, padding, studioY, estudio, textAreaWidth); 
  
  // Desenha a Linha 2 de Tags (tags 5 e 6)
  const tagsLinha2 = generos.slice(4, 6);
  // (Passa o objeto 'fonts' inteiro para a funcao)
  await drawTagLine(image, tagsLinha2, fonts, padding, line2Y, textAreaWidth);

  // Desenha a Linha 1 de Tags (as primeiras 4)
  const tagsLinha1 = generos.slice(0, 4);
  const nextTagX = await drawTagLine(image, tagsLinha1, fonts, padding, line1Y, textAreaWidth);
  
  // Desenha a Classificacao
  if (anime.classificacaoManual) { 
    // ... (codigo da classificacao sem mudancas)
  }
}

// (O codigo de getTagSlices e tagConfig e o mesmo)
// (Preciso colar o codigo completo para o usuario)

// --- Codigo Completo para src/drawing/bottomBar.js ---

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
async function drawTagLine(image, tags, fonts, startX, startY, maxWidth) {
  const { fontTagTV } = fonts; // <--- USA A FONTE CORRETA
  const tagHeight = 35;
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
          image.composite(slices.middle.clone().resize(meioWidth, tagHeight), currentTagX + cantoLargura, startY);
      }
      image.composite(slices.right, currentTagX + cantoLargura + meioWidth, startY);
    }

    const textY = startY + (tagHeight - Jimp.measureTextHeight(fontTagTV, genreText, tagWidth)) / 2;
    image.print(fontTagTV, currentTagX + tagPaddingHorizontal, textY, genreText);
    currentTagX += tagWidth + spaceBetween;
  }
  return currentTagX;
}

// --- 4. Funcao Principal de Desenhar a Barra ---
async function drawBottomBar(image, anime, fonts, padding, textAreaWidth, altura) { 
  const { fontEstudioTV } = fonts; // <--- USA A FONTE CORRETA
  
  const classificationHeight = 60;
  const tagHeight = 35;
  const spaceBetween = 10; 
  const spaceBetweenLines = 15; 
  const generos = anime.genres || [];

  // --- POSICOES ---
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
```Certo! Eu não estou perdido, estou 100% focado no seu novo pedido.

Sua ideia é excelente. Você quer mais controle sobre as fontes para o seu modelo principal (TV/ONA), separando o Título do Estúdio e ajustando os tamanhos.

Você está correto, os arquivos que você me mostrou (`tv.js` e `ona.js`) **não** precisam de alteração. Eles são os "diretores" e apenas passam o objeto `fonts` para os "artistas".

Para fazer a mudança que você quer (Título = `boogaloo_47`, Estúdio = `boogaloo_40`, Info = `roboto_bold_34`, Tags = `roboto_bold_32`), precisamos atualizar os 3 arquivos que *de fato* usam essas fontes:

1.  `src/image.js` (O "carregador" de fontes)
2.  `src/drawing/text.js` (O "artista" que desenha o Título e as Infos)
3.  `src/drawing/bottomBar.js` (O "artista" que desenha o Estúdio e as Tags)

(Eu assumi que você quer usar o `roboto_bold` que testamos antes, e não o `medium`, pois ele dá um resultado mais forte).

---

### 1. Arquivo: `src/image.js`

Vamos atualizar esta é a função `carregarFontes` para carregar 5 fontes diferentes e criar um objeto `fonts` mais específico.

* **Arquivo:** `src/image.js` (no GitHub)
* **Ação:** Substitua **todo** o conteúdo deste arquivo por este código.

```javascript
// ARQUIVO: src/image.js
// (ATUALIZADO: Carrega as 5 fontes separadamente para o Modelo TV)

const Jimp = require('jimp');
const path = require('path');
const Modelos = require('./models');

// --- 1. CARREGAMENTO DE FONTES (ATUALIZADO) ---
let fontTituloTV, fontInfoTV, fontEstudioTV, fontTagTV, fontFilme;

async function carregarFontes() {
  if (fontTituloTV && fontInfoTV && fontEstudioTV && fontTagTV && fontFilme) {
    return; // Ja estao carregadas
  }
  try {
    console.log('Carregando fontes personalizadas (5 fontes)...');
    
    // Carrega as fontes que voce upou (usando Bold por padrao)
    fontTituloTV = await Jimp.loadFont(path.join(__dirname, '..', 'assets', 'fonts', 'boogaloo_47.fnt'));
    fontInfoTV = await Jimp.loadFont(path.join(__dirname, '..', 'assets', 'fonts', 'roboto_bold_34.fnt'));
    fontEstudioTV = await Jimp.loadFont(path.join(__dirname, '..', 'assets', 'fonts', 'boogaloo_40.fnt'));
    fontTagTV = await Jimp.loadFont(path.join(__dirname, '..', 'assets', 'fonts', 'roboto_bold_32.fnt'));
    fontFilme = await Jimp.loadFont(path.join(__dirname, '..', 'assets', 'fonts', 'boogaloo_108.fnt')); 
    
    console.log('Fontes carregadas com sucesso.');
  } catch (err) {
    console.error('ERRO CRITICO AO CARREGAR FONTES:', err);
    console.log('Usando fontes padrao como fallback...');
    // Fallbacks
    fontTituloTV = await Jimp.loadFont(Jimp.FONT_SANS_64_WHITE);
    fontInfoTV = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
    fontEstudioTV = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
    fontTagTV = await Jimp.loadFont(Jimp.FONT_SANS_16_WHITE);
    fontFilme = await Jimp.loadFont(Jimp.FONT_SANS_64_WHITE);
  }
}

// --- 2. GERADOR DE CAPA (O "DIRETOR") ---
async function gerarCapa(anime) {
  try {
    await carregarFontes();
    // Passa o objeto 'fonts' completo para os modelos
    const fonts = { fontTituloTV, fontInfoTV, fontEstudioTV, fontTagTV, fontFilme };
    
    const largura = 1280;
    const altura = 720;
    const padding = 40;
    const consts = { largura, altura, padding };
    
    // Cria a imagem base
    const image = new Jimp(largura, altura, '#000000');
    
    // Escolhe o "artista" (modelo)
    switch (anime.layout) {
      case 'FILME':
        await Modelos.FILME(image, anime, fonts, consts);
        break;
      case 'ONA':
        await Modelos.ONA(image, anime, fonts, consts);
        break;
      case 'TV':
      default:
        await Modelos.TV(image, anime, fonts, consts);
        break;
    }
    
    const buffer = await image.getBufferAsync(Jimp.MIME_PNG);
    return { success: true, buffer: buffer };
    
  } catch (err) {
    console.error('ERRO GERAL AO GERAR IMAGEM:', err);
    return { success: false, error: err.message };
  }
}

module.exports = { gerarCapa, carregarFontes };
