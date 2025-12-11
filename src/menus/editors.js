// Arquivo: src/menus/editors.js

const { Markup } = require('telegraf');
const { traduzirTemporada } = require('../utils.js');

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

// Exportamos 'enviarMenuEdicao' como alias para 'enviarMenuEdicaoCompleto' para manter compatibilidade
module.exports = { enviarMenuEdicao: enviarMenuEdicaoCompleto, enviarMenuEdicaoFilme };
