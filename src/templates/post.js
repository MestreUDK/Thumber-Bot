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
  dados.titulo = anime.title.romaji || "??";
  
  // Alternativo: Se vazio, fica vazio (mas NÃO apaga a linha do título)
  dados.alternativo = anime.title.english ? ` (${anime.title.english})` : ""; 
  
  // Linha Condicional: Abreviação (Essa sim, se vazia, some a linha)
  dados.linhaAbrev = anime.abrev ? `🏮 | {${anime.abrev}}` : "";
  
  // 2. Tags
  let tagsList = (anime.genres || []).map(tag => {
      const upper = tag.toUpperCase().trim();
      const translated = (tagConfig[upper] && tagConfig[upper].text) ? tagConfig[upper].text : tag;
      return `#${translated.replace(/\s+/g, '_')}`;
  });
  tagsList.sort((a, b) => a.localeCompare(b));
  dados.tags = tagsList.length > 0 ? tagsList.join(', ') : "??";
  
  dados.audio = anime.audio || "??"; 
  
  // 3. Dados Técnicos
  if (anime.yearManual) {
      dados.ano = anime.yearManual;
  } else {
      const anoInicio = anime.startDate && anime.startDate.year ? anime.startDate.year : "??";
      const anoFim = anime.endDate && anime.endDate.year ? anime.endDate.year : "";
      dados.ano = anoFim ? `${anoInicio} à ${anoFim}` : `${anoInicio}`;
  }
  
  dados.origem = anime.origem || "??";

  if (anime.seasonManual) {
      dados.temporada = anime.seasonManual;
  } else {
      dados.temporada = anime.season ? `#${traduzirTemporada(anime.season).toLowerCase()}` : "??";
  }
  
  dados.estudio = (anime.studios && anime.studios.nodes.length > 0) 
    ? `#${anime.studios.nodes[0].name.replace(/\s+/g, '')}` : "??";
    
  const rawRating = anime.classificacaoManual || null;
  // A função formatarClassificacaoTxt no utils já foi ajustada ou retornará "??" se nulo
  dados.classificacao = formatarClassificacaoTxt(rawRating);

  dados.tipo = anime.typeManual || (anime.format ? `#${anime.format}` : "??");
  
  // Status
  if (anime.statusManual) dados.status = anime.statusManual;
  else {
      let st = "??";
      if (anime.status === 'FINISHED') st = "Completo";
      if (anime.status === 'RELEASING') st = "Em Lançamento";
      if (anime.status === 'NOT_YET_RELEASED') st = "Não Lançado";
      dados.status = st;
  }
  
  // 4. Temporada e Links
  const num = anime.seasonNum || "1ª Temporada";
  if (anime.seasonUrl) {
      dados.linkTemporada = `[${num}](${anime.seasonUrl})`;
  } else {
      dados.linkTemporada = num;
  }
  dados.episodios = anime.episodes || "??";

  // Linhas Condicionais
  dados.linhaParte = anime.partNum ? `🔗 | Parte ${anime.partNum}` : "";
  dados.linhaNomeTemp = anime.seasonName ? `🧩 | ${anime.seasonName}` : "";
  
  // 5. Sinopse
  let sin = anime.description || "??";
  sin = sin.replace(/<br>/g, "\n").replace(/<i>/g, "").replace(/<\/i>/g, "");
  dados.sinopse = sin;

  // 6. Substituição Segura no Template
  let textoFinal = POST_TEMPLATE;

  // Lista de variáveis que devem DELETAR a linha se estiverem vazias
  const variaveisQueApagamLinha = ['linhaAbrev', 'linhaParte', 'linhaNomeTemp'];

  // Primeiro processa quem apaga linha
  for (const chave of variaveisQueApagamLinha) {
      const valor = dados[chave];
      if (!valor || valor === "") {
          // Remove a linha inteira onde essa variável está
          const regex = new RegExp(`^.*{{${chave}}}.*(\\r\\n|\\n|\\r)?`, "gm");
          textoFinal = textoFinal.replace(regex, "");
      } else {
          // Substitui normalmente
          textoFinal = textoFinal.replace(`{{${chave}}}`, valor);
      }
  }

  // Depois processa o resto (inline) sem apagar linhas
  for (const [chave, valor] of Object.entries(dados)) {
      if (variaveisQueApagamLinha.includes(chave)) continue; // Já foi
      textoFinal = textoFinal.split(`{{${chave}}}`).join(valor);
  }
  
  return textoFinal.trim();
}

module.exports = { formatarPost };