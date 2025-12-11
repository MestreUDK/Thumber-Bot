// ARQUIVO: src/config/passcode_keys.js
const KEY_MAP = {
  // Controle
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
  
  // NOVOS CAMPOS MANUAIS (v1.4.5)
  'yearManual': 'ym',      // Para editar o Ano
  'seasonManual': 'sm',    // Para editar a Temporada (com link)
  'typeManual': 'tm',      // Para editar o Tipo (#TV, #Filme)
  'statusManual': 'stm'    // Para editar o Status
};

module.exports = KEY_MAP;
