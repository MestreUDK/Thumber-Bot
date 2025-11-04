// ARQUIVO: src/confirmation.js
// (Atualizado com nomes de botoes de layout mais curtos)

const { Markup } = require('telegraf');
const { traduzirTemporada } = require('./utils.js');

// --- FUNCAO 1: Menu de Escolha de Layout (Botoes atualizados) ---
async function enviarMenuLayout(ctx) {
  const layout = ctx.session.animeData.layout || 'TV';
  
  const texto = `
Qual modelo de capa voce quer usar?

Modelo Atual: ` + "```" + `${layout}` + "```" + `
`;

  // --- *** MUDANCA: Texto dos botoes simplificado *** ---
  const botoes = Markup.inlineKeyboard([
    [ 
      Markup.button.callback('TV', 'set_layout_TV'),
      Markup.button.callback('Filme', 'set_layout_FILME'),
      Markup.button.callback('ONA', 'set_layout_ONA')
    ],
    [ Markup.button.callback('Próximo Passo (Editar Dados) ➡️', 'ir_para_edicao') ]
  ]);
  
  try {
    if (ctx.callbackQuery) {
      await ctx.deleteMessage();
    }
  } catch (e) { /* ignora */ }
  
  await ctx.reply(texto, botoes);
}


// --- FUNCAO 2: Menu de Edicao COMPLETO (Para TV/ONA) ---
async function enviarMenuEdicaoCompleto(ctx) {
  const animeData = ctx.session.animeData;
  if (!animeData) {
    return ctx.reply('Sessao expirada. Por favor, faca a busca novamente com /capa');
  }

  const titulo = (animeData.title && animeData.title.romaji) || "N/A";
  const estudio = (animeData.studios && animeData.studios.nodes.length > 0) ? animeData.studios.nodes[0].name : 'N/A';
  const temporada = animeData.season ? `${traduzirTemporada(animeData.season)} ${animeData.seasonYear}` : "N/A";
  const episodios = animeData.episodes || '??';
  const tags = (animeData.genres && animeData.genres.length > 0) ? animeData.genres.join(', ') : 'N/A';
  const classificacao = animeData.classificacaoManual || '(Nenhuma)';
  const layout = animeData.layout || 'TV'; 

  const texto = `
Confirme os dados (Estes dados serao usados na imagem):

` + "```" + `
Layout: ${layout}
Titulo: ${titulo}
Estudio: ${estudio}
Info: ${temporada} - ${episodios} EPISODIOS
Tags: ${tags}
Classificacao: ${classificacao}
` + "```" + `
`;

  const botoes = Markup.inlineKeyboard([
    [ Markup.button.callback('✅ Gerar Capa Agora!', 'generate_final') ],
    [ 
      Markup.button.callback('Editar Titulo', 'edit_title'),
      Markup.button.callback('Editar Estudio', 'edit_studio')
    ],
    [ 
      Markup.button.callback('Editar Tags', 'edit_tags'),
      Markup.button.callback('Editar Classificacao', 'edit_rating')
    ],
    [ 
      Markup.button.callback('🖼️ Editar Pôster', 'edit_poster'),
      Markup.button.callback('🌆 Editar Fundo', 'edit_fundo')
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

// --- FUNCAO 3: Menu de Edicao SIMPLES (Para Filme) ---
async function enviarMenuEdicaoFilme(ctx) {
  const animeData = ctx.session.animeData;
  if (!animeData) {
    return ctx.reply('Sessao expirada. Por favor, faca a busca novamente com /capa');
  }

  const titulo = (animeData.title && animeData.title.romaji) || "N/A";
  const classificacao = animeData.classificacaoManual || '(Nenhuma)';
  const layout = animeData.layout || 'FILME'; 

  const texto = `
Editando Modelo FILME:

` + "```" + `
Layout: ${layout}
Titulo: ${titulo}
Classificacao: ${classificacao}
` + "```" + `
`;

  const botoes = Markup.inlineKeyboard([
    [ Markup.button.callback('✅ Gerar Capa Agora!', 'generate_final') ],
    [ 
      Markup.button.callback('Editar Titulo', 'edit_title'),
      Markup.button.callback('Editar Classificacao', 'edit_rating')
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


module.exports = { 
  enviarMenuLayout,
  enviarMenuEdicao: enviarMenuEdicaoCompleto,
  enviarMenuEdicaoFilme
};
