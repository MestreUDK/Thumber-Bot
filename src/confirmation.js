// ARQUIVO: src/confirmation.js
// (Atualizado para usar texto monoespacado)

const { Markup } = require('telegraf');
const { traduzirTemporada } = require('./utils.js');

async function enviarConfirmacao(ctx) {
  const animeData = ctx.session.animeData;
  if (!animeData) {
    return ctx.reply('Sessao expirada. Por favor, faca a busca novamente com /capa');
  }

  // Prepara o texto de confirmacao
  const titulo = (animeData.title && animeData.title.romaji) || "N/A";
  const estudio = (animeData.studios && animeData.studios.nodes.length > 0) ? animeData.studios.nodes[0].name : 'N/A';
  const temporada = animeData.season ? `${traduzirTemporada(animeData.season)} ${animeData.seasonYear}` : "N/A";
  const episodios = animeData.episodes || '??';
  const tags = (animeData.genres && animeData.genres.length > 0) ? animeData.genres.join(', ') : 'N/A';
  const classificacao = animeData.classificacaoManual || '(Nenhuma)';

  // --- *** MUDANCA: Adicionado "```" para texto monoespacado *** ---
  const texto = `
Confirme os dados (Estes dados serao usados na imagem):

` + "```" + `
Titulo: ${titulo}
Estudio: ${estudio}
Info: ${temporada} - ${episodios} EPISODIOS
Tags: ${tags}
Classificacao: ${classificacao}
` + "```" + `
`;

  // Prepara os botoes
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
    [ Markup.button.callback('❌ Cancelar', 'cancel_edit') ]
  ]);

  try {
    if (ctx.callbackQuery) {
      await ctx.deleteMessage();
    }
  } catch (e) {
    console.warn('Nao consegui apagar a mensagem anterior (normal se for a primeira vez)');
  }

  // Envia a mensagem (usamos .reply() normal, ja que ``` nao e HTML)
  await ctx.reply(texto, botoes);
}

module.exports = { enviarConfirmacao };
