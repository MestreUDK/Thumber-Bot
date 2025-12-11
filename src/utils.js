// ARQUIVO: src/utils.js
// (ATUALIZADO: Nova função para formatar texto da classificação)

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

// Retorna o nome do arquivo de imagem (usado na CAPA)
function getRatingImageName(apiRating) {
  if (!apiRating) return null;
  const rating = String(apiRating).toUpperCase();
  
  if (rating === 'G' || rating === 'ALL') return 'L.png';
  if (rating === 'PG') return 'A12.png'; // PG geralmente é 10 ou 12, ajustado para 12 aqui
  if (rating === 'PG-13') return 'A14.png';
  if (rating === 'R+' || rating === 'R-17' || rating === 'R') return 'A16.png';
  if (rating === 'NC-17' || rating === 'RX') return 'A18.png';
  
  // Se já vier numero (modo manual)
  if (['10','12','14','16','18'].includes(rating)) return `A${rating}.png`;
  if (rating === 'L') return 'L.png';
  
  return null;
}

// --- *** NOVA FUNÇÃO: Formatação de Texto para o Post *** ---
// Retorna formato: "#A14 (PG-13)"
function formatarClassificacaoTxt(apiRating) {
  if (!apiRating) return "Indefinida";
  const rating = String(apiRating).toUpperCase();
  
  let nacional = "Indefinida";
  
  // Mapeamento Internacional -> Nacional
  if (rating === 'G' || rating === 'ALL') nacional = 'L';
  else if (rating === 'PG') nacional = 'A12';
  else if (rating === 'PG-13') nacional = 'A14';
  else if (rating === 'R+' || rating === 'R-17' || rating === 'R') nacional = 'A16';
  else if (rating === 'NC-17' || rating === 'RX') nacional = 'A18';
  // Mapeamento Manual (Se o usuário digitou 14, 16, etc)
  else if (['10','12','14','16','18'].includes(rating)) nacional = `A${rating}`;
  else if (rating === 'L') nacional = 'L';
  else nacional = rating; // Fallback

  // Retorna formato híbrido: #A14 (PG-13)
  // Se a classificação original for igual a nacional (ex: manual), mostra só uma
  if (rating === nacional.replace('A','')) return `#${nacional}`;
  return `#${nacional} (${rating})`;
}

// Funções de Passcode (Mantidas)
const zlib = require('zlib'); // Se não usar aqui, pode remover o require se estiver no passcode.js
// ... (Se as funções gerarPasscode/lerPasscode estiverem aqui, mantenha. Se moveu para passcode.js, ignore)

module.exports = {
  traduzirTemporada,
  getRatingImageName,
  formatarClassificacaoTxt // <-- Exportando a nova função
};
