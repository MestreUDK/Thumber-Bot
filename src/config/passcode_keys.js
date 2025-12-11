// ARQUIVO: src/config/passcode_keys.js

const KEY_MAP = {
  // Controle Interno (IMPORTANTE: Estava faltando)
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
  
  // Campos Manuais e URL (Novos da v1.4.5)
  'yearManual': 'ym', 
  'seasonManual': 'sm',
  'typeManual': 'tm', 
  'statusManual': 'stm',
  'seasonUrl': 'surl',
  'titleEnglish': 'en_t' // Usado no edit_alt_name
};

module.exports = KEY_MAP;
