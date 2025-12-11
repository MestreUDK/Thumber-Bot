// ARQUIVO: src/templates/post.js
// (ATUALIZADO: Tradução de Tags e Classificação Híbrida)

const { traduzirTemporada, formatarClassificacaoTxt } = require('../utils.js');
const fs = require('fs');
const path = require('path');

// Carrega o dicionário de tags para tradução
let tagConfig = {};
try {
  const configPath = path.join(__dirname, '..', '..', 'tag_config.json');
  tagConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
} catch (e) { console.error("Erro ao carregar tag_config no template", e); }


function formatarPost(anime) {
  // 1. Tratamento de Dados Básicos
  const titulo = anime.title.romaji || "Desconhecido";
  const alternativo = anime.title.english ? `(${anime.title.english})` : "";
  const abrev = anime.abrev || "{_Abrev_}"; 
  
  // --- TRADUÇÃO DE TAGS ---
  // Pega a tag em ingles (Action), busca no JSON, retorna a tradução (AÇÃO) ou original
  const tagsFormatadas = (anime.genres || []).map(tag => {
      const upper = tag.toUpperCase().trim();
      // Tenta achar a tradução no dicionário, se não achar, usa a tag original
      const translated = (tagConfig[upper] && tagConfig[upper].text) ? tagConfig[upper].text : tag;
      // Formata como #Tag_Exemplo (Capitalizada fica mais bonito que tudo maiusculo)
      // Vamos deixar como o dicionário manda (Maiúsculo) ou Capitalizar? 
      // O seu exemplo pedia #gênero. Vou manter como está no dicionário (geralmente UPPER).
      return `#${translated.replace(/\s+/g, '_')}`;
  }).join(' & ');
  
  const audio = anime.audio || "#legendado | #dublado"; 
  
  // Datas
  const anoInicio = anime.startDate && anime.startDate.year ? anime.startDate.year : "????";
  const anoFim = anime.endDate && anime.endDate.year ? anime.endDate.year : "";
  const anoStr = anoFim ? `${anoInicio} à ${anoFim}` : `${anoInicio}`;
  
  const temporada = anime.season ? `#${traduzirTemporada(anime.season).toLowerCase()}` : "#indefinida";
  
  // Status (Tradução simples)
  let status = "Indefinido";
  if (anime.status === 'FINISHED') status = "Completo";
  if (anime.status === 'RELEASING') status = "Em Lançamento";
  if (anime.status === 'NOT_YET_RELEASED') status = "Não Lançado";
  
  const estudio = (anime.studios && anime.studios.nodes.length > 0) 
    ? `#${anime.studios.nodes[0].name.replace(/\s+/g, '')}` 
    : "#Desconhecido";
    
  // --- CLASSIFICAÇÃO HÍBRIDA ---
  // Usa o campo 'classificacaoManual' (se editado) ou tenta pegar da API se existisse
  // Como sua API query não traz 'rating' nativo do Anilist, usamos o manual ou padrão.
  const rawRating = anime.classificacaoManual || "Indefinida";
  const classificacao = formatarClassificacaoTxt(rawRating);

  const tipo = anime.format ? `#${anime.format}` : "#TV";
  
  // Dados Manuais Específicos
  const numTemporada = anime.seasonNum || "1";
  const episodios = anime.episodes || "?";
  const parte = anime.partNum || "1";
  const nomeTemporada = anime.seasonName || "Nome da temporada";
  
  // Sinopse Limpa
  let sinopse = anime.description || "Sinopse indisponível.";
  sinopse = sinopse.replace(/<br>/g, "\n").replace(/<i>/g, "").replace(/<\/i>/g, "");

  // 2. O MODELO (Template)
  return `
⁣⛩️ | *${titulo}* ${alternativo}
🏮 | ${abrev}
👑 | @AnimesUDK

🎭 | Tags | ${tagsFormatadas}
🎧 | Áudio | ${audio}
🗓️ | Ano | ${anoStr}
💈 | Temporada | ${temporada}

🎥 | Estúdio | ${estudio}
🚥 | Etária | ${classificacao}
📺 | Tipo | ${tipo}
🆙 | Status | ${status}

📌 | Temporada ${numTemporada} | ${episodios} Episódios 
🔗 | Parte ${parte}
🧩 | ${nomeTemporada}

ℹ️ | Sinopse
> _${sinopse}_
`.trim();
}

module.exports = { formatarPost };
