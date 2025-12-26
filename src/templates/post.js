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

// --- Função auxiliar para formatar datas (dd/mm/yyyy) ---
function formatarDataAniList(dateObj) {
    if (!dateObj || !dateObj.year) return null;
    
    // Se tiver dia e mês, formata bonito: 25/12/2025
    if (dateObj.day && dateObj.month) {
        const dia = String(dateObj.day).padStart(2, '0');
        const mes = String(dateObj.month).padStart(2, '0');
        return `${dia}/${mes}/${dateObj.year}`;
    }
    
    // Se faltar dados, retorna só o ano
    return `${dateObj.year}`;
}
// --------------------------------------------------------

function formatarPost(anime) {
  const dados = {};
  
  // 1. Cabeçalho
  dados.titulo = anime.title.romaji || "??";
  
  // Alternativo: Se vazio, fica vazio (mas NÃO apaga a linha do título)
  dados.alternativo = anime.title.english ? ` (${anime.title.english})` : ""; 
  
  // Linha Condicional: Abreviação (Se vazia, apaga a linha no final)
  dados.linhaAbrev = anime.abrev ? `🏮 | {${anime.abrev}}` : "";
  
  // 2. Tags (Ordenadas A-Z e MINÚSCULAS)
  let tagsList = (anime.genres || []).map(tag => {
      const upper = tag.toUpperCase().trim();
      const translated = (tagConfig[upper] && tagConfig[upper].text) ? tagConfig[upper].text : tag;
      
      // Força minúsculo (.toLowerCase) e substitui espaços por _
      return `#${translated.toLowerCase().replace(/\s+/g, '_')}`;
  });
  
  tagsList.sort((a, b) => a.localeCompare(b));
  dados.tags = tagsList.length > 0 ? tagsList.join(', ') : "??";
  
  dados.audio = anime.audio || "??"; 
  
  // 3. Dados Técnicos (Datas Completas)
  if (anime.yearManual) {
      dados.ano = anime.yearManual;
  } else {
      const inicioStr = formatarDataAniList(anime.startDate);
      const fimStr = formatarDataAniList(anime.endDate);
      
      if (!inicioStr) {
          dados.ano = "??";
      } else if (fimStr) {
          dados.ano = `${inicioStr} à ${fimStr}`;
      } else {
          // Se não tem fim (e não está lançando), ou é filme/ova de um dia só
          dados.ano = inicioStr;
      }
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