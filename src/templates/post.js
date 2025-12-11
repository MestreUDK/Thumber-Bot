// ARQUIVO: src/templates/post.js
const { traduzirTemporada, formatarClassificacaoTxt } = require('../utils.js');
const fs = require('fs');
const path = require('path');

// Carrega config de tags
let tagConfig = {};
try {
  tagConfig = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'tag_config.json'), 'utf-8'));
} catch (e) { console.error("Erro tag_config", e); }

// Carrega o Template de Texto
let POST_TEMPLATE = "";
try {
  POST_TEMPLATE = fs.readFileSync(path.join(__dirname, '..', '..', 'assets', 'templates', 'post.txt'), 'utf-8');
} catch (e) {
  console.error("ERRO CRITICO: Nao achei assets/templates/post.txt", e);
  POST_TEMPLATE = "Erro: Template não encontrado.";
}

function formatarPost(anime) {
  // 1. Preparar Dados (Igual antes)
  const dados = {};
  
  dados.titulo = anime.title.romaji || "Desconhecido";
  dados.alternativo = anime.title.english ? `(${anime.title.english})` : "";
  dados.abrev = anime.abrev || "{_Abrev_}";
  
  // Tags
  dados.tags = (anime.genres || []).map(tag => {
      const upper = tag.toUpperCase().trim();
      const translated = (tagConfig[upper] && tagConfig[upper].text) ? tagConfig[upper].text : tag;
      return `#${translated.replace(/\s+/g, '_')}`;
  }).join(' & ');
  
  dados.audio = anime.audio || "#legendado | #dublado"; 
  
  // Datas
  const anoInicio = anime.startDate && anime.startDate.year ? anime.startDate.year : "????";
  const anoFim = anime.endDate && anime.endDate.year ? anime.endDate.year : "";
  dados.ano = anoFim ? `${anoInicio} à ${anoFim}` : `${anoInicio}`;
  
  dados.temporada = anime.season ? `#${traduzirTemporada(anime.season).toLowerCase()}` : "#indefinida";
  
  // Status
  let st = "Indefinido";
  if (anime.status === 'FINISHED') st = "Completo";
  if (anime.status === 'RELEASING') st = "Em Lançamento";
  if (anime.status === 'NOT_YET_RELEASED') st = "Não Lançado";
  dados.status = st;
  
  dados.estudio = (anime.studios && anime.studios.nodes.length > 0) 
    ? `#${anime.studios.nodes[0].name.replace(/\s+/g, '')}` : "#Desconhecido";
    
  // Classificacao
  const rawRating = anime.classificacaoManual || "Indefinida";
  dados.classificacao = formatarClassificacaoTxt(rawRating);

  dados.tipo = anime.format ? `#${anime.format}` : "#TV";
  
  // Manuais
  dados.numTemporada = anime.seasonNum || "1";
  dados.episodios = anime.episodes || "?";
  dados.parte = anime.partNum || "1";
  dados.nomeTemporada = anime.seasonName || "Nome da temporada";
  
  // Sinopse
  let sin = anime.description || "Sinopse indisponível.";
  sin = sin.replace(/<br>/g, "\n").replace(/<i>/g, "").replace(/<\/i>/g, "");
  dados.sinopse = sin;

  // 2. Substituição no Template (Simples e Eficiente)
  let textoFinal = POST_TEMPLATE;
  
  // Substitui cada {{chave}} pelo valor correspondente
  for (const [chave, valor] of Object.entries(dados)) {
      // Regex global para trocar todas as ocorrencias
      textoFinal = textoFinal.split(`{{${chave}}}`).join(valor);
  }
  
  return textoFinal.trim();
}

module.exports = { formatarPost };
