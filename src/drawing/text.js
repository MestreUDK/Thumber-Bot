// ARQUIVO: src/drawing/text.js
// (ATUALIZADO: Textos alinhados a direita)

const Jimp = require('jimp');
const { traduzirTemporada } = require('../utils.js'); 

// --- 3. Desenha os Textos Principais (Info e Titulo) ---
async function drawText(image, anime, fonts, padding, textAreaWidth) {
  const { fontTituloTV, fontInfoTV } = fonts;
  let currentTextY = padding;

  const temporada = traduzirTemporada(anime.season);
  const episodios = anime.episodes || '??';
  const infoTopo = `${temporada} ${anime.seasonYear} • ${episodios} EPISÓDIOS`;

  // --- *** MUDANÇA AQUI (INFO) *** ---
  // Trocamos a chamada simples por uma chamada com objeto de opções
  // para definir o 'alignmentX' como 'RIGHT' (Direita).
  image.print(
    fontInfoTV,
    padding, // O X onde a area de texto comeca
    currentTextY,
    {
      text: infoTopo,
      alignmentX: Jimp.HORIZONTAL_ALIGN_RIGHT // Alinhamento a Direita
    },
    textAreaWidth // A largura maxima da area de texto
  );
  currentTextY += Jimp.measureTextHeight(fontInfoTV, infoTopo, textAreaWidth) + 10;
  // --- FIM DA MUDANCA ---

  const titulo = anime.title.romaji || anime.title.english || "Titulo Desconhecido";

  // --- *** MUDANÇA AQUI (TITULO) *** ---
  // Fazemos a mesma coisa para o Titulo.
  image.print(
    fontTituloTV,
    padding, // O X onde a area de texto comeca
    currentTextY,
    {
      text: titulo,
      alignmentX: Jimp.HORIZONTAL_ALIGN_RIGHT // Alinhamento a Direita
    },
    textAreaWidth // A largura maxima da area de texto
  );
  currentTextY += Jimp.measureTextHeight(fontTituloTV, titulo, textAreaWidth) + 20;
  // --- FIM DA MUDANCA ---

  return currentTextY;
}

module.exports = { drawText };
