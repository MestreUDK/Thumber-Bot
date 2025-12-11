// ARQUIVO: src/templates/post.js
const { traduzirTemporada } = require('../utils.js');

function formatarPost(anime) {
  // 1. Tratamento de Dados
  const titulo = anime.title.romaji || "Desconhecido";
  const alternativo = anime.title.english ? `(${anime.title.english})` : "";
  const abrev = anime.abrev || "{_Abrev_}"; // Campo novo
  
  // Formata Tags com #
  const tagsFormatadas = (anime.genres || []).map(t => `#${t.replace(/\s+/g, '_')}`).join(' ');
  
  // Tratamento de Audio (Manual)
  const audio = anime.audio || "#legendado | #dublado"; // Default
  
  // Tratamento de Ano e Status
  const anoInicio = anime.startDate && anime.startDate.year ? anime.startDate.year : "????";
  const anoFim = anime.endDate && anime.endDate.year ? anime.endDate.year : "";
  const anoStr = anoFim ? `${anoInicio} à ${anoFim}` : `${anoInicio}`;
  
  // Temporada e Status
  const temporada = anime.season ? `#${traduzirTemporada(anime.season).toLowerCase()}` : "#indefinida";
  const status = anime.status === 'FINISHED' ? 'Completo' : (anime.status === 'RELEASING' ? 'Em Lançamento' : 'Indefinido');
  
  const estudio = (anime.studios && anime.studios.nodes.length > 0) 
    ? `#${anime.studios.nodes[0].name.replace(/\s+/g, '')}` 
    : "#Desconhecido";
    
  const classificacao = anime.classificacaoManual ? `+${anime.classificacaoManual}` : "Livre/Indefinida";
  const tipo = anime.format ? `#${anime.format}` : "#TV";
  
  // Dados Específicos de Temporada (Manuais)
  const numTemporada = anime.seasonNum || "1";
  const episodios = anime.episodes || "?";
  const parte = anime.partNum || "1";
  const nomeTemporada = anime.seasonName || "Nome da temporada";
  
  // Sinopse (Limpa tags HTML que o Anilist manda, como <br>)
  let sinopse = anime.description || "Sinopse indisponível.";
  sinopse = sinopse.replace(/<br>/g, "\n").replace(/<i>/g, "").replace(/<\/i>/g, "");

  // 2. Montagem do Template
  return `
⁣⛩️ | *${titulo}* ${alternativo}
🏮 | ${abrev}
👑 | @AnimesUDK

🎭 | Tags | ${tagsFormatadas}
🎧 | Áudio | ${audio}
🗓️ | Ano | ${anoStr}
💈 | Temporada | ${temporada}

🎥 | Estúdio | ${estudio}
🚥 | Etária | ${classificacao} (classificação indicativa)
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
