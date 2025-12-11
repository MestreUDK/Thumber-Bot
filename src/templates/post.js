// ARQUIVO: src/templates/post.js
const { traduzirTemporada, formatarClassificacaoTxt } = require('../utils.js');
const fs = require('fs');
const path = require('path');

let tagConfig = {};
try {
  tagConfig = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'tag_config.json'), 'utf-8'));
} catch (e) { console.error("Erro tag_config", e); }

let POST_TEMPLATE = "";
try {
  POST_TEMPLATE = fs.readFileSync(path.join(__dirname, '..', '..', 'assets', 'templates', 'post.txt'), 'utf-8');
} catch (e) { POST_TEMPLATE = "ERRO: Template não encontrado."; }

function formatarPost(anime) {
  const dados = {};
  
  // Campos Básicos
  dados.titulo = anime.title.romaji || "Desconhecido";
  dados.alternativo = anime.title.english ? `(${anime.title.english})` : "";
  dados.abrev = anime.abrev || "{_Abrev_}";
  
  // --- TAGS (Separadas por vírgula) ---
  dados.tags = (anime.genres || []).map(tag => {
      const upper = tag.toUpperCase().trim();
      const translated = (tagConfig[upper] && tagConfig[upper].text) ? tagConfig[upper].text : tag;
      return `#${translated.replace(/\s+/g, '_')}`;
  }).join(', '); // <--- ALTERADO AQUI PARA VÍRGULA
  
  dados.audio = anime.audio || "#legendado | #dublado"; 
  
  // Ano e Status
  if (anime.yearManual) {
      dados.ano = anime.yearManual;
  } else {
      const anoInicio = anime.startDate && anime.startDate.year ? anime.startDate.year : "????";
      const anoFim = anime.endDate && anime.endDate.year ? anime.endDate.year : "";
      dados.ano = anoFim ? `${anoInicio} à ${anoFim}` : `${anoInicio}`;
  }

  // Temporada (Texto Visual: Primavera 2024)
  if (anime.seasonManual) {
      dados.temporada = anime.seasonManual; 
  } else {
      dados.temporada = anime.season ? `#${traduzirTemporada(anime.season).toLowerCase()}` : "#indefinida";
  }
  
  // Status
  if (anime.statusManual) dados.status = anime.statusManual;
  else {
      let st = "Indefinido";
      if (anime.status === 'FINISHED') st = "Completo";
      if (anime.status === 'RELEASING') st = "Em Lançamento";
      if (anime.status === 'NOT_YET_RELEASED') st = "Não Lançado";
      dados.status = st;
  }
  
  dados.estudio = (anime.studios && anime.studios.nodes.length > 0) 
    ? `#${anime.studios.nodes[0].name.replace(/\s+/g, '')}` : "#Desconhecido";
    
  // Classificação (Nova Lógica)
  const rawRating = anime.classificacaoManual || "Indefinida";
  dados.classificacao = formatarClassificacaoTxt(rawRating);

  // Tipo
  if (anime.typeManual) dados.tipo = anime.typeManual;
  else dados.tipo = anime.format ? `#${anime.format}` : "#TV";
  
  // --- TEMPORADA NUMÉRICA (COM HYPERLINK) ---
  const num = anime.seasonNum || "1";
  // Se tiver URL salva, cria o link: [Temporada 1](https://...)
  if (anime.seasonUrl) {
      dados.numTemporada = `[Temporada ${num}](${anime.seasonUrl})`;
  } else {
      dados.numTemporada = `Temporada ${num}`;
  }

  dados.episodios = anime.episodes || "?";
  dados.parte = anime.partNum || "1";
  dados.nomeTemporada = anime.seasonName || "Nome da temporada";
  
  // Sinopse
  let sin = anime.description || "Sinopse indisponível.";
  sin = sin.replace(/<br>/g, "\n").replace(/<i>/g, "").replace(/<\/i>/g, "");
  dados.sinopse = sin;

  // Substituição
  let textoFinal = POST_TEMPLATE;
  for (const [chave, valor] of Object.entries(dados)) {
      textoFinal = textoFinal.split(`{{${chave}}}`).join(valor);
  }
  
  return textoFinal.trim();
}

module.exports = { formatarPost };
