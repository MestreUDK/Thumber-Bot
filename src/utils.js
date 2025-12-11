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
  if (rating === 'PG') return 'A12.png'; // Ajuste fino
  if (rating === 'PG-13') return 'A14.png'; // ou A14
  if (rating === 'R+' || rating === 'R-17' || rating === 'R') return 'A16.png';
  if (rating === 'NC-17' || rating === 'RX') return 'A18.png';
  
  // Se já vier numero (modo manual)
  if (['10','12','14','16','18'].includes(rating)) return `A${rating}.png`;
  if (rating === 'L') return 'L.png';
  
  return null;
}

// --- Formatação de Texto Híbrida ---
function formatarClassificacaoTxt(apiRating) {
  if (!apiRating) return "Indefinida";
  const rating = String(apiRating).toUpperCase();
  
  // 1. Dicionário Reverso (Nacional -> Internacional)
  // Usado quando a origem é MANUAL (o usuário escolheu A14)
  const mapReverso = {
      'L': 'G',
      '10': 'PG',
      '12': 'PG-13',
      '14': 'PG-13', // ou TV-14
      '16': 'R-17',
      '18': 'R+ / NC-17'
  };

  // Se o input for um dos manuais (10, 12, 14...), retornamos o formato híbrido
  if (['L', '10', '12', '14', '16', '18'].includes(rating)) {
      const internacional = mapReverso[rating] || '??';
      const nacional = rating === 'L' ? 'L' : `A${rating}`;
      return `#${nacional} (${internacional})`;
  }

  // 2. Mapeamento Padrão (Internacional -> Nacional)
  // Usado quando a origem é ANILIST (vem PG-13)
  let nacional = "Indefinida";
  if (rating === 'G' || rating === 'ALL') nacional = 'L';
  else if (rating === 'PG') nacional = 'A10';
  else if (rating === 'PG-13') nacional = 'A14'; // Anilist PG-13 geralmente vira 12 ou 14
  else if (rating === 'R+' || rating === 'R-17' || rating === 'R') nacional = 'A16';
  else if (rating === 'NC-17' || rating === 'RX') nacional = 'A18';
  else nacional = rating; 

  if (rating === nacional.replace('A','')) return `#${nacional}`;
  return `#${nacional} (${rating})`;
}

const zlib = require('zlib');
module.exports = { traduzirTemporada, getRatingImageName, formatarClassificacaoTxt };
