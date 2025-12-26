// ARQUIVO: src/utils.js

function traduzirTemporada(season) {
  if (!season) return '';
  switch (season.toUpperCase()) {
    case 'SPRING': return 'PRIMAVERA';
    case 'SUMMER': return 'VERÃO';
    case 'FALL': return 'OUTONO';
    case 'WINTER': return 'INVERNO';
    default: return season;
  }
}

function getRatingImageName(apiRating) {
  if (!apiRating) return null;
  const rating = String(apiRating).toUpperCase();
  if (rating === 'G' || rating === 'ALL') return 'L.png';
  if (rating === 'PG') return 'A12.png';
  if (rating === 'PG-13') return 'A14.png';
  if (rating === 'R+' || rating === 'R-17' || rating === 'R') return 'A16.png';
  if (rating === 'NC-17' || rating === 'RX') return 'A18.png';
  if (['10','12','14','16','18'].includes(rating)) return `A${rating}.png`;
  if (rating === 'L') return 'L.png';
  return null;
}

// --- Formatação de Texto Híbrida ---
function formatarClassificacaoTxt(apiRating) {
  if (!apiRating) return "??"; // <--- MUDANÇA: Retorna ?? se nulo
  
  const rating = String(apiRating).toUpperCase();
  
  // 1. Dicionário Reverso (Nacional -> Internacional)
  const mapReverso = {
      'L': 'G',
      '10': 'PG',
      '12': 'PG-13',
      '14': 'PG-13',
      '16': 'R-17 / R+',
      '18': 'Rx / NC-17'
  };

  if (['L', '10', '12', '14', '16', '18'].includes(rating)) {
      const internacional = mapReverso[rating] || '??';
      const nacional = rating === 'L' ? 'L' : `A${rating}`;
      return `#${nacional} (${internacional})`;
  }

  // 2. Mapeamento Padrão (Internacional -> Nacional)
  let nacional = "??"; // Default
  if (rating === 'G' || rating === 'ALL') nacional = 'L';
  else if (rating === 'PG') nacional = 'A12';
  else if (rating === 'PG-13') nacional = 'A14';
  else if (rating === 'R+' || rating === 'R-17' || rating === 'R') nacional = 'A16';
  else if (rating === 'NC-17' || rating === 'RX') nacional = 'A18';
  else nacional = rating;

  if (rating === nacional.replace('A','')) return `#${nacional}`;
  return `#${nacional} (${rating})`;
}

const zlib = require('zlib');
module.exports = { traduzirTemporada, getRatingImageName, formatarClassificacaoTxt };