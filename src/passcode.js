// ARQUIVO: src/passcode.js
// (VERSÃO v1.5.0 - Com Logs de Erro e Tratamento de Sujeira)

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

// --- Minificação ---
function minifyObject(obj) {
  if (Array.isArray(obj)) return obj.map(minifyObject);
  else if (obj !== null && typeof obj === 'object') {
    const newObj = {};
    for (const key in obj) {
      let value = obj[key];
      // Filtra nulos para economizar espaço
      if (value === null || value === undefined) continue;

      const newKey = KEY_MAP[key] || key;
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
    console.error('ERRO AO GERAR PASSCODE:', e);
    return null;
  }
}

function lerPasscode(passcodeString) {
  try {
    if (!passcodeString) return null;

    // 1. Limpeza Agressiva (Remove espaços, quebras de linha, crases)
    let limpo = passcodeString.replace(/[\s\n\r`]/g, '');
    
    // 2. Correção de segurança para Base64URL
    // Às vezes o copy-paste converte hifens (-) em travessões (–) ou underscores (_) em outros símbolos
    // Essa regex remove TUDO que não for o alfabeto oficial do Base64URL
    limpo = limpo.replace(/[^a-zA-Z0-9\-_]/g, '');

    const buffer = Buffer.from(limpo, 'base64url');
    const decompressedBuffer = zlib.inflateSync(buffer);
    const jsonStr = decompressedBuffer.toString();
    const minified = JSON.parse(jsonStr);
    
    return unminifyObject(minified);

  } catch (e) {
    // --- LOG DE DIAGNÓSTICO (Vai aparecer no seu terminal) ---
    console.error('=======================================');
    console.error('❌ ERRO AO LER PASSCODE!');
    console.error('Erro Técnico:', e.message);
    console.error('Tamanho do código recebido:', passcodeString ? passcodeString.length : 0);
    console.error('=======================================');
    return null; 
  }
}

module.exports = { gerarPasscode, lerPasscode };
