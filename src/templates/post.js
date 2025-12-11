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
  POST_TEMPLATE = "ERRO: Crie o arquivo assets/templates/post.txt";
}

function formatarPost(anime) {
  const dados = {};
  
  // 1. Título e Alternativo
  dados.titulo = anime.title.romaji || "Desconhecido";
  // Se editou o alternativo (usamos title.english), usa ele. Se não, vazio.
  dados.alternativo = anime.title.english ? `(${anime.title.english})` : "";
  dados.abrev = anime.abrev || "{_Abrev_}";
  
  // 2. Tags Traduzidas
  dados.tags = (anime.genres || []).map(tag => {
      const upper = tag.toUpperCase().trim();
      const translated = (tagConfig[upper] && tagConfig[upper].text) ? tagConfig[upper].text : tag;
      return `#${translated.replace(/\s+/g, '_')}`;
  }).join(' & ');
  
  dados.audio = anime.audio || "#legendado | #dublado"; 
  
  // 3. Ano (Manual ou Automático)
  if (anime.yearManual) {
      dados.ano = anime.yearManual;
  } else {
      const anoInicio = anime.startDate && anime.startDate.year ? anime.startDate.year : "????";
      const anoFim = anime.endDate && anime.endDate.year ? anime.endDate.year : "";
      dados.ano = anoFim ? `${anoInicio} à ${anoFim}` : `${anoInicio}`;
  }
  
  // 4. Temporada (Manual/Link ou Automático)
  if (anime.seasonManual) {
      dados.temporada = anime.seasonManual; // Aceita link: [Texto](Url)
  } else {
      dados.temporada = anime.season ? `#${traduzirTemporada(anime.season).toLowerCase()}` : "#indefinida";
  }
  
  // 5. Status (Manual ou Automático)
  if (anime.statusManual) {
      dados.status = anime.statusManual;
  } else {
      let st = "Indefinido";
      if (anime.status === 'FINISHED') st = "Completo";
      if (anime.status === 'RELEASING') st = "Em Lançamento";
      if (anime.status === 'NOT_YET_RELEASED') st = "Não Lançado";
      dados.status = st;
  }
  
  // 6. Estúdio
  dados.estudio = (anime.studios && anime.studios.nodes.length > 0) 
    ? `#${anime.studios.nodes[0].name.replace(/\s+/g, '')}` : "#Desconhecido";
    
  // 7. Classificação
  const rawRating = anime.classificacaoManual || "Indefinida";
  dados.classificacao = formatarClassificacaoTxt(rawRating);

  // 8. Tipo (Manual ou Automático)
  if (anime.typeManual) {
      dados.tipo = anime.typeManual;
  } else {
      dados.tipo = anime.format ? `#${anime.format}` : "#TV";
  }
  
  // 9. Dados Manuais
  dados.numTemporada = anime.seasonNum || "1";
  dados.episodios = anime.episodes || "?";
  dados.parte = anime.partNum || "1";
  dados.nomeTemporada = anime.seasonName || "Nome da temporada";
  
  // 10. Sinopse
  let sin = anime.description || "Sinopse indisponível.";
  // Limpeza básica de HTML
  sin = sin.replace(/<br>/g, "\n").replace(/<i>/g, "").replace(/<\/i>/g, "");
  dados.sinopse = sin;

  // Substituição no Template
  let textoFinal = POST_TEMPLATE;
  for (const [chave, valor] of Object.entries(dados)) {
      textoFinal = textoFinal.split(`{{${chave}}}`).join(valor);
  }
  
  return textoFinal.trim();
}

module.exports = { formatarPost };
