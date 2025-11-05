// ARQUIVO: src/confirmation.js
// (Botões 'Anilist' e 'Manual' com texto simplificado)

const { Markup } = require('telegraf');
const { traduzirTemporada } = require('./utils.js');

// --- FUNCAO 1: Menu de Escolha de Layout (Sem alteração) ---
async function enviarMenuLayout(ctx) {
  const layout = ctx.session.animeData.layout || 'TV';

  const texto = `
Qual modelo de capa voce quer usar?

Modelo Atual: ` + "```" + `${layout}` + "```" + `
`;

  const botoes = Markup.inlineKeyboard([
    [ 
      Markup.button.callback('📺 TV', 'set_layout_TV'),
      Markup.button.callback('🎬 Filme', 'set_layout_FILME'),
      Markup.button.callback('📼 ONA', 'set_layout_ONA')
    ],
    [ Markup.button.callback('Próximo Passo (Editar Dados) ➡️', 'ir_para_edicao') ],
    [ Markup.button.callback('⬅️ Voltar (Fonte de Dados)', 'voltar_source_select') ] 
  ]);

  try {
    if (ctx.callbackQuery) {
      await ctx.deleteMessage();
    }
  } catch (e) { /* ignora */ }

  await ctx.reply(texto, botoes);
}


// --- FUNCAO 2: Menu de Edicao COMPLETO (TV/ONA) (Sem alteração) ---
async function enviarMenuEdicaoCompleto(ctx) {
  const animeData = ctx.session.animeData;
  if (!animeData) {
    return ctx.reply('Sessao expirada. Por favor, faca a busca novamente com /capa');
  }

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
    [ 
      Markup.button.callback('🏷️ Título', 'edit_title'),
      Markup.button.callback('ℹ️ Info', 'edit_info')
    ],
    [ 
      Markup.button.callback('🎥 Estúdio', 'edit_studio'),
      Markup.button.callback('🎭 Tags', 'edit_tags')
    ],
    [ 
      Markup.button.callback('🚦 Classificação', 'edit_rating')
    ],
    [ 
      Markup.button.callback('🖼️ Pôster', 'edit_poster'),
      Markup.button.callback('🌆 Fundo', 'edit_fundo')
    ],
    [ 
      Markup.button.callback('⬅️ Voltar (Layout)', 'voltar_layout'),
      Markup.button.callback('❌ Cancelar', 'cancel_edit') 
    ]
  ]);

  try {
    if (ctx.callbackQuery) {
      await ctx.deleteMessage();
    }
  } catch (e) { /* ignora */ }

  await ctx.reply(texto, botoes);
}

// --- FUNCAO 3: Menu de Edicao SIMPLES (Filme) (Sem alteração) ---
async function enviarMenuEdicaoFilme(ctx) {
  const animeData = ctx.session.animeData;
  if (!animeData) {
    return ctx.reply('Sessao expirada. Por favor, faca a busca novamente com /capa');
  }

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
    [ 
      Markup.button.callback('🏷️ Título', 'edit_title'),
      Markup.button.callback('🚦 Classificação', 'edit_rating')
    ],
    [ 
      Markup.button.callback('🖼️ Editar Pôster', 'edit_poster')
    ],
    [ 
      Markup.button.callback('⬅️ Voltar (Layout)', 'voltar_layout'),
      Markup.button.callback('❌ Cancelar', 'cancel_edit') 
    ]
  ]);

  try {
    if (ctx.callbackQuery) {
      await ctx.deleteMessage();
    }
  } catch (e) { /* ignora */ }

  await ctx.reply(texto, botoes);
}

// --- FUNCAO 4: MENU DE CLASSIFICACAO (Sem alteração) ---
async function enviarMenuClassificacao(ctx) {
  const classificacaoAtual = ctx.session.animeData.classificacaoManual || 'Nenhuma';

  const texto = `
Escolha a Classificação Indicativa:

Atual: ` + "```" + `${classificacaoAtual}` + "```" + `
`;

  const botoes = Markup.inlineKeyboard([
    [
      Markup.button.callback('🟩 Livre', 'set_rating_L'),
      Markup.button.callback('🟦 A10', 'set_rating_10'),
      Markup.button.callback('🟨 A12', 'set_rating_12')
    ],
    [
      Markup.button.callback('🟧 A14', 'set_rating_14'),
      Markup.button.callback('🟥 A16', 'set_rating_16'),
      Markup.button.callback('⬛ A18', 'set_rating_18')
    ],
    [
      Markup.button.callback('Remover (Sem Classificação)', 'set_rating_NONE')
    ],
    [
      Markup.button.callback('⬅️ Voltar para Edição', 'voltar_edicao_principal')
    ]
  ]);

  try {
    if (ctx.callbackQuery) {
      await ctx.deleteMessage();
    }
  } catch (e) { /* ignora */ }

  await ctx.reply(texto, botoes);
}

// --- FUNCAO 5: NOVO MENU DE FONTE DE DADOS (ATUALIZADO) ---
async function enviarMenuFonteDados(ctx) {
  const nomeDoAnime = ctx.session.searchTitle || "Anime Desconhecido";

  const texto = `
Como você quer obter os dados para:
` + "```" + `${nomeDoAnime}` + "```" + `
`;

  // --- *** MUDANÇA NOS TEXTOS DOS BOTÕES *** ---
  const botoes = Markup.inlineKeyboard([
    [
      Markup.button.callback('🔗 Anilist', 'source_anilist'), // <-- TEXTO MUDADO
      Markup.button.callback('✍️ Manual', 'source_manual')    // <-- TEXTO MUDADO
    ],
    [
      Markup.button.callback('❌ Cancelar Busca', 'cancel_edit')
    ]
  ]);
  // --- FIM DA MUDANÇA ---

  try {
    if (ctx.callbackQuery) {
      await ctx.deleteMessage();
    }
  } catch (e) { /* ignora */ }

  await ctx.reply(texto, botoes);
}


module.exports = { 
  enviarMenuLayout,
  enviarMenuEdicao: enviarMenuEdicaoCompleto,
  enviarMenuEdicaoFilme,
  enviarMenuClassificacao,
  enviarMenuFonteDados
};
