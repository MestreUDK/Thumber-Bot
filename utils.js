// ARQUIVO: utils.js
// (Funcoes de ajuda que movemos do bot.js)

// --- FUNCAO PARA TRADUZIR (SEM ACENTOS) ---
function traduzirTemporada(season) {
  if (!season) return '';
  switch (season.toUpperCase()) {
    case 'SPRING': return 'PRIMAVERA';
    case 'SUMMER': return 'VERAO';
    case 'FALL': return 'OUTONO';
    case 'WINTER': return 'INVERNO';
    default: return season;
  }
}

// --- FUNCAO DE MAPEAMENTO DE CLASSIFICACAO ---
function getRatingImageName(apiRating) {
  if (!apiRating) return null;
  const rating = String(apiRating).toUpperCase();
  if (rating === 'G' || rating === 'ALL') return 'L.png';
  if (rating === 'PG') return 'A12.png';
  if (rating === 'PG-13') return 'A14.png';
  if (rating === 'R+' || rating === 'R-17' || rating === 'R') return 'A16.png';
  if (rating === 'NC-17' || rating === 'RX') return 'A18.png';
  if (rating === '10') return 'A10.png';
  if (rating === '12') return 'A12.png';
  if (rating === '14') return 'A14.png';
  if (rating === '16') return 'A16.png';
  if (rating === '18') return 'A18.png';
  return null;
}

// Exporta as funcoes para que outros arquivos possam usa-las
module.exports = {
  traduzirTemporada,
  getRatingImageName
};
