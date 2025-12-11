// ARQUIVO: src/passcode.js
const zlib = require('zlib');

// 1. Dicionário de Mapeamento (Atualizado com novos campos do Post)
const KEY_MAP = {
  'title': 't', 'romaji': 'r', 'english': 'e',
  'season': 's', 'seasonYear': 'y', 'episodes': 'ep',
  'studios': 'st', 'nodes': 'n', 'name': 'nm',
  'genres': 'g', 'averageScore': 'sc', 'format': 'fmt',
  'coverImage': 'ci', 'large': 'l', 'bannerImage': 'bi',
  'classificacaoManual': 'cm', 'infoManual': 'im', 'layout': 'la',
  // --- Novos Campos do Post ---
  'description': 'desc', 'status': 'stat',
  'startDate': 'sd', 'endDate': 'ed', 'year': 'yr',
  'abrev': 'abr', 'audio': 'aud', 'seasonNum': 'sn',
  'partNum': 'pn', 'seasonName': 'snm'
};

const REVERSE_MAP = Object.fromEntries(
  Object.entries(KEY_MAP).map(([k, v]) => [v, k])
);

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

function minifyObject(obj) {
  if (Array.isArray(obj)) return obj.map(minifyObject);
  else if (obj !== null && typeof obj === 'object') {
    const newObj = {};
    for (const key in obj) {
      const newKey = KEY_MAP[key] || key;
      let value = obj[key];
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
    const buffer = Buffer.from(passcodeString, 'base64url');
    const decompressedBuffer = zlib.inflateSync(buffer);
    const jsonStr = decompressedBuffer.toString();
    const minified = JSON.parse(jsonStr);
    return unminifyObject(minified);
  } catch (e) {
    return null; 
  }
}

module.exports = { gerarPasscode, lerPasscode };
