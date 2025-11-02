// ARQUIVO: bot.js
// (Atualizado com Sessoes para edicao)

require('dotenv').config();
// Adicionamos 'session' e 'Markup' do Telegraf
const { Telegraf, session, Markup } = require('telegraf');

const { buscarAnime } = require('./anilist.js');
const { gerarCapa, carregarFontes } = require('./image.js'); 

const BOT_TOKEN = process.env.BOT_TOKEN;

if (!BOT_TOKEN) {
  console.error('ERRO: Token do bot (BOT_TOKEN) não foi encontrado!');
  process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);

// --- *** NOVO: INICIA A SESSAO *** ---
// Isso permite que o bot lembre dos dados do anime enquanto voce edita
bot.use(session());

// --- *** NOVA FUNCAO: Enviar a mensagem de confirmacao *** ---
// (Esta funcao e chamada varias vezes)
async function enviarConfirmacao(ctx) {
  const animeData = ctx.session.animeData;
  if (!animeData) {
    return ctx.reply('Sessao expirada. Por favor, faca a busca novamente com /capa');
  }

  // Prepara o texto de confirmacao
  const titulo = animeData.title.romaji || "N/A";
  const estudio = animeData.studios.nodes.length > 0 ? animeData.studios.nodes[0].name : 'N/A';
  const temporada = animeData.season ? `${traduzirTemporada(animeData.season)} ${animeData.seasonYear}` : "N/A";
  const episodios = animeData.episodes || '??';
  const tags = animeData.genres.join(', ') || 'N/A';
  // Mostra a classificacao que voce adicionou
  const classificacao = animeData.classificacaoManual || '(Nenhuma)';

  const texto = `
Confirme os dados (Estes dados serao usados na imagem):

**Titulo:** ${titulo}
**Estudio:** ${estudio}
**Info:** ${temporada} - ${episodios} EPISODIOS
**Tags:** ${tags}
**Classificacao:** ${classificacao}
  `;

  // Prepara os botoes
  const botoes = Markup.inlineKeyboard([
    // Linha 1: Gerar!
    [ Markup.button.callback('✅ Gerar Capa Agora!', 'generate_final') ],
    // Linha 2: Botoes de edicao
    [ 
      Markup.button.callback('Editar Titulo', 'edit_title'),
      Markup.button.callback('Editar Estudio', 'edit_studio')
    ],
    // Linha 3: Botoes de edicao
    [ 
      Markup.button.callback('Editar Tags', 'edit_tags'),
      Markup.button.callback('Editar Classificacao', 'edit_rating')
    ],
    // Linha 4: Cancelar
    [ Markup.button.callback('❌ Cancelar', 'cancel_edit') ]
  ]);

  // Envia a mensagem com os dados e os botoes
  // (usamos replyWithHTML para o Markdown funcionar)
  await ctx.replyWithHTML(texto, botoes);
}


// --- COMANDO /START (Sem mudancas) ---
bot.start((ctx) => {
  ctx.reply('Ola! Eu sou o bot gerador de capas.\n\nEnvie /capa [nome do anime] para comecar.');
});

// --- COMANDO /CAPA (Atualizado) ---
bot.command('capa', async (ctx) => {
  try {
    const nomeDoAnime = ctx.message.text.replace('/capa', '').trim();
    if (!nomeDoAnime) {
      return ctx.reply('Por favor, me diga o nome do anime. Ex: /capa To Your Eternity');
    }

    ctx.reply(`Buscando dados para: ${nomeDoAnime}...`);
    const resultadoApi = await buscarAnime(nomeDoAnime);

    if (!resultadoApi.success) {
      return ctx.reply(`Falha ao buscar. A API retornou o erro: ${resultadoApi.error}`);
    }
    
    const anime = resultadoApi.data;
    
    // --- *** MUDANCA: Salva na SESSAO *** ---
    // Adiciona o campo de classificacao vazio
    anime.classificacaoManual = null; 
    // Salva tudo na sessao
    ctx.session.animeData = anime; 
    ctx.session.awaitingInput = null; // Limpa o estado de espera
    
    // Envia a mensagem de confirmacao (com os botoes)
    await enviarConfirmacao(ctx);

  } catch (err) {
    console.error('ERRO CRITICO NO COMANDO /CAPA:', err);
    return ctx.reply(`Ocorreu um erro critico: ${err.message}`);
  }
});

// --- *** NOVOS EVENTOS: Ouvir os Botoes *** ---

// Botao [Gerar Capa Agora!]
bot.action('generate_final', async (ctx) => {
  await ctx.deleteMessage(); // Apaga a mensagem dos botoes
  await ctx.reply('Gerando sua capa com os dados editados...');
  
  const animeData = ctx.session.animeData;
  if (!animeData) {
    return ctx.reply('Sessao expirada. Faca a busca novamente.');
  }

  const resultadoImagem = await gerarCapa(animeData);

  if (!resultadoImagem.success) {
    return ctx.reply(`Erro ao gerar imagem: ${resultadoImagem.error}`);
  }
  
  // Limpa a sessao
  ctx.session.animeData = null;
  ctx.session.awaitingInput = null;
  
  // Envia a imagem final!
  return ctx.replyWithPhoto({ source: resultadoImagem.buffer });
});

// Botao [Cancelar]
bot.action('cancel_edit', async (ctx) => {
  ctx.session.animeData = null;
  ctx.session.awaitingInput = null;
  await ctx.deleteMessage();
  await ctx.reply('Geracao cancelada.');
});

// Botoes de Edicao (Titulo, Estudio, Tags, Classificacao)
bot.action(['edit_title', 'edit_studio', 'edit_tags', 'edit_rating'], async (ctx) => {
  const acao = ctx.match[0]; // Pega qual botao foi clicado
  
  // Salva o que o bot deve esperar
  ctx.session.awaitingInput = acao; 
  
  // Pergunta ao usuario
  let pergunta = 'O que voce quer colocar?';
  if (acao === 'edit_title') pergunta = 'Digite o novo **Titulo** (ex: Fumetsu no Anata e (3a TEMP))';
  if (acao === 'edit_studio') pergunta = 'Digite o novo **Estudio** (ex: Drive | Studio Massket)';
  if (acao === 'edit_tags') pergunta = 'Digite as novas **Tags** (separadas por virgula, ex: Aventura, Shounen, Drama)';
  if (acao === 'edit_rating') pergunta = 'Digite a **Classificacao** (ex: 16, 18, L)';
  
  await ctx.replyWithHTML(pergunta);
});


// --- *** NOVO EVENTO: Ouvir as Respostas de Texto *** ---
// (Quando o usuario esta digitando a edicao)
bot.on('text', async (ctx) => {
  // Se o bot nao estiver esperando nada, ignora a mensagem
  if (!ctx.session.awaitingInput || !ctx.session.animeData) {
    return;
  }

  const state = ctx.session.awaitingInput;
  const animeData = ctx.session.animeData;
  const userInput = ctx.message.text.trim();

  // Atualiza os dados na sessao
  if (state === 'edit_title') {
    animeData.title.romaji = userInput;
    console.log(`Sessao atualizada: Titulo = ${userInput}`);
  }
  if (state === 'edit_studio') {
    // Substitui o estudio da API pelo seu
    animeData.studios.nodes = [{ name: userInput }]; 
    console.log(`Sessao atualizada: Estudio = ${userInput}`);
  }
  if (state === 'edit_tags') {
    // Transforma o texto "A, B, C" em uma lista ["A", "B", "C"]
    animeData.genres = userInput.split(',').map(tag => tag.trim());
    console.log(`Sessao atualizada: Tags = ${animeData.genres}`);
  }
  if (state === 'edit_rating') {
    animeData.classificacaoManual = userInput;
    console.log(`Sessao atualizada: Classificacao = ${userInput}`);
  }

  // Limpa o estado (nao esta mais esperando)
  ctx.session.awaitingInput = null;
  
  // Salva os dados atualizados
  ctx.session.animeData = animeData;
  
  // Mostra a mensagem de confirmacao ATUALIZADA
  await ctx.reply('Dados atualizados!');
  await enviarConfirmacao(ctx);
});


// --- INICIO DO BOT ---
// (Move o bot.launch para dentro do carregarFontes)
carregarFontes().then(() => {
  bot.launch();
  console.log('Bot MODULARIZADO iniciado e rodando (fontes carregadas)...');
}).catch(err => {
  console.error('Falha ao carregar fontes no inicio!', err);
  process.exit(1);
});
