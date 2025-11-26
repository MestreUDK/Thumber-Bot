// ARQUIVO: src/utils.js
// (ATUALIZADO: Funções de Passcode adicionadas)

// --- FUNCAO PARA TRADUZIR (SEM ACENTOS) ---
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

// --- *** NOVO: FUNÇÕES DE PASSCODE *** ---

// Transforma o objeto animeData em uma string Base64
function gerarPasscode(animeData) {
  try {
    const jsonStr = JSON.stringify(animeData);
    // Cria um Buffer e converte para base64
    return Buffer.from(jsonStr).toString('base64');
  } catch (e) {
    console.error('Erro ao gerar passcode:', e);
    return null;
  }
}

// Transforma a string Base64 de volta em objeto
function lerPasscode(passcodeString) {
  try {
    // Converte de base64 para texto
    const jsonStr = Buffer.from(passcodeString, 'base64').toString('utf-8');
    return JSON.parse(jsonStr);
  } catch (e) {
    return null; // Retorna null se o código for inválido
  }
}

// Exporta as funcoes
module.exports = {
  traduzirTemporada,
  getRatingImageName,
  gerarPasscode, // <-- Exportado
  lerPasscode    // <-- Exportado
};
