// ARQUIVO: src/passcode.js
// (CORRIGIDO E OTIMIZADO)

const zlib = require('zlib');
const KEY_MAP = require('./config/passcode_keys.js');

const REVERSE_MAP = Object.fromEntries(
  Object.entries(KEY_MAP).map(([k, v]) => [v, k])
);

// --- Lógica de URL ---
function compressUrl(url) {
  if (!url || typeof url !== 'string') return url;
  const botToken = process.env.BOT_TOKEN;
  const telegramPrefix = `https://api.telegram.org/file/bot${botToken}/`;
  if (url.startsWith(telegramPrefix)) return url.replace(telegramPrefix, '~TG~/');
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

// --- Funções de Minificação (INTELIGENTE) ---
function minifyObject(obj) {
  if (Array.isArray(obj)) {
    return obj.map(minifyObject);
  } else if (obj !== null && typeof obj === 'object') {
    const newObj = {};
    for (const key in obj) {
      let value = obj[key];
      
      // --- OTIMIZAÇÃO: LIXEIRA AUTOMÁTICA ---
      // Se o campo for nulo (ex: 'sinopse' numa Capa), ele é ignorado.
      // Isso cria um Passcode exclusivo apenas com o que importa.
      if (value === null || value === undefined) continue;
      // ----------------------------------------

      const newKey = KEY_MAP[key] || key;
      
      // Comprime URL
      if (key === 'large' || key === 'bannerImage' || key === 'coverImage') {
         if (typeof value === 'string') value = compressUrl(value);
      }
      
      newObj[newKey] = minifyObject(value);
    }
    return newObj;
  }
  return obj;
}

function unminifyObject(obj) {
  if (Array.isArray(obj)) return obj.map(unminifyObject);
  else if (obj !== null && typeof obj === 'object') {
    const newObj = {};
    for (const key in obj) {
      const originalKey = REVERSE_MAP[key] || key;
      let value = obj[key];
      
      if (originalKey === 'large' || originalKey === 'bannerImage' || originalKey === 'coverImage') {
         if (typeof value === 'string') value = decompressUrl(value);
      }
      newObj[originalKey] = unminifyObject(value);
    }
    return newObj;
  }
  return obj;
}

// --- Funções Principais ---

function gerarPasscode(animeData) {
  try {
    const minified = minifyObject(animeData);
    const jsonStr = JSON.stringify(minified);
    const compressedBuffer = zlib.deflateSync(jsonStr);
    return compressedBuffer.toString('base64url');
  } catch (e) {
    console.error('Erro ao gerar passcode:', e);
    return null;
  }
}

function lerPasscode(passcodeString) {
  try {
    if (!passcodeString) return null;

    // --- CORREÇÃO DE LEITURA (CRÍTICO) ---
    // Remove espaços, enters e crases que o Telegram adiciona
    const limpo = passcodeString.replace(/[^a-zA-Z0-9\-_]/g, '');
    // -------------------------------------
    
    const buffer = Buffer.from(limpo, 'base64url');
    const decompressedBuffer = zlib.inflateSync(buffer);
    const jsonStr = decompressedBuffer.toString();
    const minified = JSON.parse(jsonStr);
    return unminifyObject(minified);
  } catch (e) {
    console.error('Erro ao ler passcode:', e.message);
    return null; 
  }
}

module.exports = { gerarPasscode, lerPasscode };
