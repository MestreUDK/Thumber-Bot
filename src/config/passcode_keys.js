// ARQUIVO: src/config/passcode_keys.js

const KEY_MAP = {
  // Controle Interno
  'mode': 'm',

  // Campos Básicos
  'title': 't', 'romaji': 'r', 'english': 'e',
  'season': 's', 'seasonYear': 'y', 'episodes': 'ep',
  'studios': 'st', 'nodes': 'n', 'name': 'nm',
  'genres': 'g', 'averageScore': 'sc', 'format': 'fmt',
  'coverImage': 'ci', 'large': 'l', 'bannerImage': 'bi',
  'classificacaoManual': 'cm', 'infoManual': 'im', 'layout': 'la',
  
  // Campos do Post
  'description': 'desc', 'abrev': 'abr', 'audio': 'aud',
  'seasonNum': 'sn', 'partNum': 'pn', 'seasonName': 'snm',
  
  // Campos Manuais e URL
  'yearManual': 'ym', 
  'seasonManual': 'sm',
  'typeManual': 'tm', 
  'statusManual': 'stm',
  'seasonUrl': 'surl'
};

module.exports = KEY_MAP;
