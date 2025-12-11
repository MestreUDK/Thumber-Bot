// ARQUIVO: src/config/passcode_keys.js
const KEY_MAP = {
  // Controle Interno
  'mode': 'm', // <-- NOVO: 'p' (post) ou 'c' (capa)

  // Campos Básicos
  'title': 't', 'romaji': 'r', 'english': 'e',
  'season': 's', 'seasonYear': 'y', 'episodes': 'ep',
  'studios': 'st', 'nodes': 'n', 'name': 'nm',
  'genres': 'g', 'averageScore': 'sc', 'format': 'fmt',
  'coverImage': 'ci', 'large': 'l', 'bannerImage': 'bi',
  'classificacaoManual': 'cm', 'infoManual': 'im', 'layout': 'la',
  
  // Campos do Post
  'description': 'desc', 'status': 'stat',
  'startDate': 'sd', 'endDate': 'ed', 'year': 'yr',
  'abrev': 'abr', 'audio': 'aud', 'seasonNum': 'sn',
  'partNum': 'pn', 'seasonName': 'snm'
};

module.exports = KEY_MAP;
