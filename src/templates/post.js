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
  
  // 1. Cabeçalho
  dados.titulo = anime.title.romaji || "Desconhecido";
  dados.alternativo = anime.title.english ? ` (${anime.title.english})` : ""; // Espaço antes do parentese
  
  // Linha Condicional: Abreviação (Com chaves {} e ícone)
  if (anime.abrev) {
      dados.linhaAbrev = `🏮 | {${anime.abrev}}`;
  } else {
      dados.linhaAbrev = ""; // Se vazio, a linha some
  }
  
  // 2. Tags (Ordenadas A-Z e traduzidas)
  let tagsList = (anime.genres || []).map(tag => {
      const upper = tag.toUpperCase().trim();
      const translated = (tagConfig[upper] && tagConfig[upper].text) ? tagConfig[upper].text : tag;
      return `#${translated.replace(/\s+/g, '_')}`; // Adiciona # e remove espaços
  });
  
  // Ordenação Alfabética
  tagsList.sort((a, b) => a.localeCompare(b));
  dados.tags = tagsList.join(', ');
  
  dados.audio = anime.audio || "#legendado"; 
  
  // 3. Dados Técnicos
  if (anime.yearManual) {
      dados.ano = anime.yearManual;
  } else {
      const anoInicio = anime.startDate && anime.startDate.year ? anime.startDate.year : "????";
      const anoFim = anime.endDate && anime.endDate.year ? anime.endDate.year : "";
      dados.ano = anoFim ? `${anoInicio} à ${anoFim}` : `${anoInicio}`;
  }
  
  dados.origem = anime.origem || "Outro"; // Novo Campo

  if (anime.seasonManual) {
      dados.temporada = anime.seasonManual;
  } else {
      dados.temporada = anime.season ? `#${traduzirTemporada(anime.season).toLowerCase()}` : "#indefinida";
  }
  
  dados.estudio = (anime.studios && anime.studios.nodes.length > 0) 
    ? `#${anime.studios.nodes[0].name.replace(/\s+/g, '')}` : "#Desconhecido";
    
  const rawRating = anime.classificacaoManual || "Indefinida";
  dados.classificacao = formatarClassificacaoTxt(rawRating);

  dados.tipo = anime.typeManual || (anime.format ? `#${anime.format}` : "#TV");
  
  // Status
  if (anime.statusManual) dados.status = anime.statusManual;
  else {
      let st = "Indefinido";
      if (anime.status === 'FINISHED') st = "Completo";
      if (anime.status === 'RELEASING') st = "Em Lançamento";
      if (anime.status === 'NOT_YET_RELEASED') st = "Não Lançado";
      dados.status = st;
  }
  
  // 4. Temporada e Links
  const num = anime.seasonNum || "1ª Temporada";
  // Link no formato Markdown: [Texto](URL)
  if (anime.seasonUrl) {
      dados.linkTemporada = `[${num}](${anime.seasonUrl})`;
  } else {
      dados.linkTemporada = num;
  }
  dados.episodios = anime.episodes || "?";

  // Linhas Condicionais: Parte e Nome Temp
  if (anime.partNum) {
      dados.linhaParte = `🔗 | Parte ${anime.partNum}`;
  } else {
      dados.linhaParte = "";
  }
  
  if (anime.seasonName) {
      dados.linhaNomeTemp = `🧩 | ${anime.seasonName}`;
  } else {
      dados.linhaNomeTemp = "";
  }
  
  // 5. Sinopse
  let sin = anime.description || "Sinopse indisponível.";
  sin = sin.replace(/<br>/g, "\n").replace(/<i>/g, "").replace(/<\/i>/g, "");
  dados.sinopse = sin;

  // 6. Substituição no Template
  let textoFinal = POST_TEMPLATE;
  for (const [chave, valor] of Object.entries(dados)) {
      // Remove a linha inteira do template se o valor for vazio (para as linhas condicionais)
      if (valor === "") {
          // Regex para remover a linha que contém {{chave}} vazia e a quebra de linha seguinte
          const regex = new RegExp(`^.*{{${chave}}}.*(\\r\\n|\\n|\\r)?`, "gm");
          textoFinal = textoFinal.replace(regex, "");
      } else {
          textoFinal = textoFinal.split(`{{${chave}}}`).join(valor);
      }
  }
  
  return textoFinal.trim();
}

module.exports = { formatarPost };