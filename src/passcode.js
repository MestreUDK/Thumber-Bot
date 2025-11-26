// ARQUIVO: src/passcode.js
// (NOVO: Lógica avançada de compressão e minificação de Passcode)

const zlib = require('zlib');

// 1. Dicionário de Mapeamento (Minificação)
// Transforma nomes longos em letras curtas para economizar espaço
const KEY_MAP = {
  'title': 't',
  'romaji': 'r',
  'english': 'e',
  'season': 's',
  'seasonYear': 'y',
  'episodes': 'ep',
  'studios': 'st',
  'nodes': 'n',
  'name': 'nm',
  'genres': 'g',
  'averageScore': 'sc',
  'format': 'fmt',
  'coverImage': 'ci',
  'large': 'l',
  'bannerImage': 'bi',
  'classificacaoManual': 'cm',
  'infoManual': 'im',
  'layout': 'la'
};

// Cria o mapa reverso para ler o código depois (t -> title)
const REVERSE_MAP = Object.fromEntries(
  Object.entries(KEY_MAP).map(([k, v]) => [v, k])
);

// 2. Função para encurtar URLs do Telegram
// Se a imagem for do próprio bot, removemos o domínio e o token para economizar MUITO espaço
function compressUrl(url) {
  if (!url || typeof url !== 'string') return url;
  const botToken = process.env.BOT_TOKEN;
  const telegramPrefix = `https://api.telegram.org/file/bot${botToken}/`;
  
  if (url.startsWith(telegramPrefix)) {
    return url.replace(telegramPrefix, '~TG~/'); // ~TG~ é nosso marcador
  }
  return url;
}

function decompressUrl(url) {
  if (!url || typeof url !== 'string') return url;
  if (url.startsWith('~TG~/')) {
    const botToken = process.env.BOT_TOKEN;
    return url.replace('~TG~/', `https://api.telegram.org/file/bot${botToken}/`);
  }
  return url;
}

// 3. Função Recursiva para Minificar as Chaves do Objeto
function minifyObject(obj) {
  if (Array.isArray(obj)) {
    return obj.map(minifyObject);
  } else if (obj !== null && typeof obj === 'object') {
    const newObj = {};
    for (const key in obj) {
      const newKey = KEY_MAP[key] || key; // Usa a chave curta se existir
      let value = obj[key];
      
      // Se for URL, tenta comprimir
      if (key === 'large' || key === 'bannerImage' || key === 'coverImage') {
         if (typeof value === 'string') value = compressUrl(value);
      }
      
      newObj[newKey] = minifyObject(value);
    }
    return newObj;
  }
  return obj;
}

// 4. Função Recursiva para Restaurar (Desminificar)
function unminifyObject(obj) {
  if (Array.isArray(obj)) {
    return obj.map(unminifyObject);
  } else if (obj !== null && typeof obj === 'object') {
    const newObj = {};
    for (const key in obj) {
      const originalKey = REVERSE_MAP[key] || key; // Restaura a chave original
      let value = obj[key];
      
      // Se for URL, tenta restaurar
      if (originalKey === 'large' || originalKey === 'bannerImage' || originalKey === 'coverImage') {
         if (typeof value === 'string') value = decompressUrl(value);
      }

      newObj[originalKey] = unminifyObject(value);
    }
    return newObj;
  }
  return obj;
}

// --- FUNÇÕES PRINCIPAIS EXPORTADAS ---

function gerarPasscode(animeData) {
  try {
    // 1. Minifica o objeto (encurta chaves e URLs)
    const minified = minifyObject(animeData);
    
    // 2. Transforma em string JSON
    const jsonStr = JSON.stringify(minified);
    
    // 3. Comprime usando Deflate (Algoritmo zip)
    const compressedBuffer = zlib.deflateSync(jsonStr);
    
    // 4. Converte para Base64 (URL Safe para evitar problemas no Telegram)
    return compressedBuffer.toString('base64url'); 
  } catch (e) {
    console.error('Erro ao gerar passcode otimizado:', e);
    return null;
  }
}

function lerPasscode(passcodeString) {
  try {
    // 1. Converte de Base64URL para Buffer
    const buffer = Buffer.from(passcodeString, 'base64url');
    
    // 2. Descomprime (Inflate)
    const decompressedBuffer = zlib.inflateSync(buffer);
    
    // 3. Lê o JSON minificado
    const jsonStr = decompressedBuffer.toString();
    const minified = JSON.parse(jsonStr);
    
    // 4. Restaura as chaves originais e URLs
    return unminifyObject(minified);
  } catch (e) {
    console.error('Erro ao ler passcode:', e.message);
    return null; 
  }
}

module.exports = { gerarPasscode, lerPasscode };
