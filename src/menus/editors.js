// ARQUIVO: src/menus/editors.js

const { Markup } = require('telegraf');
const { traduzirTemporada } = require('../utils.js');

// --- Menu TV/ONA (Mantido) ---
async function enviarMenuEdicaoCompleto(ctx) {
  const animeData = ctx.session.animeData;
  if (!animeData) return ctx.reply('Sessao expirada. Por favor, faca a busca novamente com /capa');

  const titulo = (animeData.title && animeData.title.romaji) || "N/A";
  const estudio = (animeData.studios && animeData.studios.nodes.length > 0) ? animeData.studios.nodes[0].name : 'N/A';
  const temporada = animeData.season ? `${traduzirTemporada(animeData.season)} ${animeData.seasonYear}` : "N/A";
  const episodios = animeData.episodes || '??';
  const infoLinha = (animeData.infoManual !== null && animeData.infoManual !== undefined) 
      ? animeData.infoManual 
      : `${temporada} - ${episodios} EPISÓDIOS`;
  const tags = (animeData.genres && animeData.genres.length > 0) ? animeData.genres.join(', ') : 'N/A';
  const classificacao = animeData.classificacaoManual || 'Nenhuma';
  const layout = animeData.layout || 'TV'; 

  const texto = `
Confirme os dados (Estes dados serão usados na imagem):

` + "```" + `
Layout: ${layout}
Título: ${titulo}
Estúdio: ${estudio}
Info: ${infoLinha} 
Tags: ${tags}
Classificação: ${classificacao}
` + "```" + `
`;

  const botoes = Markup.inlineKeyboard([
    [ Markup.button.callback('✅ Gerar Capa Agora!', 'generate_final') ],
    [ Markup.button.callback('🏷️ Título', 'edit_title'), Markup.button.callback('ℹ️ Info', 'edit_info') ],
    [ Markup.button.callback('🎥 Estúdio', 'edit_studio'), Markup.button.callback('🎭 Tags', 'edit_tags') ],
    [ Markup.button.callback('🚦 Classificação', 'edit_rating') ],
    [ Markup.button.callback('🖼️ Pôster', 'edit_poster'), Markup.button.callback('🌆 Fundo', 'edit_fundo') ],
    [ Markup.button.callback('⬅️ Voltar (Layout)', 'voltar_layout'), Markup.button.callback('❌ Cancelar', 'cancel_edit') ]
  ]);

  try { if (ctx.callbackQuery) await ctx.deleteMessage(); } catch (e) {}
  await ctx.reply(texto, botoes);
}

// --- Menu Filme (Mantido) ---
async function enviarMenuEdicaoFilme(ctx) {
  const animeData = ctx.session.animeData;
  if (!animeData) return ctx.reply('Sessao expirada. Por favor, faca a busca novamente com /capa');

  const titulo = (animeData.title && animeData.title.romaji) || "N/A";
  const classificacao = animeData.classificacaoManual || 'Nenhuma';
  const layout = animeData.layout || 'FILME'; 

  const texto = `
Editando Modelo FILME:

` + "```" + `
Layout: ${layout}
Título: ${titulo}
Classificação: ${classificacao}
` + "```" + `
`;

  const botoes = Markup.inlineKeyboard([
    [ Markup.button.callback('✅ Gerar Capa Agora!', 'generate_final') ],
    [ Markup.button.callback('🏷️ Título', 'edit_title'), Markup.button.callback('🚦 Classificação', 'edit_rating') ],
    [ Markup.button.callback('🖼️ Editar Pôster', 'edit_poster') ],
    [ Markup.button.callback('⬅️ Voltar (Layout)', 'voltar_layout'), Markup.button.callback('❌ Cancelar', 'cancel_edit') ]
  ]);

  try { if (ctx.callbackQuery) await ctx.deleteMessage(); } catch (e) {}
  await ctx.reply(texto, botoes);
}

// --- *** NOVO: Menu Exclusivo para POST (Texto) *** ---
// Atualizado com todos os botões de edição solicitados
async function enviarMenuEdicaoPost(ctx) {
  const data = ctx.session.animeData;
  if (!data) return ctx.reply('Sessão expirada. Use /post novamente.');

  const titulo = (data.title && data.title.romaji) || "N/A";
  
  const texto = `
📝 **Editor de Post**
Editando: ${titulo}

Escolha o campo para alterar:
`;

  const botoes = Markup.inlineKeyboard([
    [ Markup.button.callback('✅ Gerar Post Final', 'generate_final') ],
    
    // Identificação
    [ Markup.button.callback('🏷️ Título', 'edit_title'), Markup.button.callback('🔤 Alt. Nome', 'edit_alt_name') ],
    [ Markup.button.callback('🏮 Abrev.', 'edit_abrev'), Markup.button.callback('🎧 Áudio', 'edit_audio') ],
    
    // Dados Técnicos (Novos)
    [ Markup.button.callback('🗓️ Ano', 'edit_year'), Markup.button.callback('💈 Temporada (Txt)', 'edit_season') ],
    [ Markup.button.callback('📺 Tipo', 'edit_type'), Markup.button.callback('🆙 Status', 'edit_status') ],
    
    // Dados da Obra (Com o Link da Temporada)
    [ Markup.button.callback('📌 Temp (Nº)', 'edit_season_num'), Markup.button.callback('🔗 Link Temp.', 'edit_season_url') ],
    [ Markup.button.callback('🔢 Episódios', 'edit_episodes'), Markup.button.callback('🧩 Nome Temp.', 'edit_season_name') ],
    [ Markup.button.callback('🔗 Parte', 'edit_part_num') ],
    
    // Padrões
    [ Markup.button.callback('🎥 Estúdio', 'edit_studio'), Markup.button.callback('🎭 Tags', 'edit_tags') ],
    [ Markup.button.callback('🚦 Classificação', 'edit_rating'), Markup.button.callback('ℹ️ Sinopse', 'edit_synopsis') ],
    
    // Controle
    [ Markup.button.callback('🖼️ Pôster (Opcional)', 'edit_poster'), Markup.button.callback('❌ Cancelar', 'cancel_edit') ]
  ]);

  try { if (ctx.callbackQuery) await ctx.deleteMessage(); } catch (e) {}
  await ctx.reply(texto, botoes);
}

module.exports = { 
    enviarMenuEdicao: enviarMenuEdicaoCompleto, 
    enviarMenuEdicaoFilme,
    enviarMenuEdicaoPost 
};
