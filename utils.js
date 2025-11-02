// ARQUIVO: utils.js

// --- FUNCAO PARA TRADUZIR (SEM ACENTOS) ---
function traduzirTemporada(season) {
  if (!season) return '';
  switch (season.toUpperCase()) {
    case 'SPRING': return 'VERAO';
    case 'SUMMER': return 'VERAO';
    case 'FALL': return 'OUTONO';
    case 'WINTER': return 'INVERNO';
    default: return season;
  }
}

// Exporta SOMENTE a funcao que sobrou
module.exports = {
  traduzirTemporada
};
