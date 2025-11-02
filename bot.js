// ARQUIVO: bot.js
// (Versao completa com Sessoes)

require('dotenv').config();
// Adicionamos 'session' e 'Markup' do Telegraf
const { Telegraf, session, Markup } = require('telegraf');

const { buscarAnime } = require('./anilist.js');
const { gerarCapa, carregarFontes } = require('./image.js'); 
// Precisamos do utils.js aqui tambem
const { traduzirTemporada } = require('./utils.js');

const BOT_TOKEN = process.env.BOT_TOKEN;

if (!BOT_TOKEN) {
  console.error('ERRO: Token do bot (BOT_TOKEN) não foi encontrado!');
  process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);

// --- *** INICIA A SESSAO (A LINHA MAIS IMPORTANTE) *** ---
// Esta linha CRIA o 'ctx.session'. O erro acontece se ela faltar.
bot.use(session());

// --- FUNCAO: Enviar a mensagem de confirmacao ---
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
    // Tenta apagar a mensagem anterior de "botoes" se ela existir
    if (ctx.callbackQuery) {
      await ctx.deleteMessage();
    }
  } catch (e) {
    console.warn('Nao consegui apagar a mensagem anterior (normal se for a primeira vez)');
  }

  // Envia a mensagem com os dados e os botoes
  await ctx.replyWithHTML(texto, botoes);
}


// --- COMANDO /START ---
bot.start((ctx) => {
  ctx.reply('Ola! Eu sou o bot gerador de capas.\n\nEnvie /capa [nome do anime] para comecar.');
});

// --- COMANDO /CAPA ---
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
    
    // --- Salva na SESSAO ---
    anime.classificacaoManual = null; 
    ctx.session.animeData = anime; // <--- O PONTO QUE ESTAVA DANDO ERRO
    ctx.session.awaitingInput = null; 
    
    // Envia a mensagem de confirmacao (com os botoes)
    await enviarConfirmacao(ctx);

  } catch (err) {
    console.error('ERRO CRITICO NO COMANDO /CAPA:', err);
    return ctx.reply(`Ocorreu um erro critico: ${err.message}`);
  }
});

// --- OUVIR OS BOTOES ---

// Botao [Gerar Capa Agora!]
bot.action('generate_final', async (ctx) => {
  try {
    await ctx.deleteMessage(); 
    await ctx.reply('Gerando sua capa com os dados editados...');
    
    const animeData = ctx.session.animeData;
    if (!animeData) {
      return ctx.reply('Sessao expirada. Faca a busca novamente.');
    }

    const resultadoImagem = await gerarCapa(animeData);

    if (!resultadoImagem.success) {
      return ctx.reply(`Erro ao gerar imagem: ${resultadoImagem.error}`);
    }
    
    ctx.session = null; // Limpa a sessao
    return ctx.replyWithPhoto({ source: resultadoImagem.buffer });

  } catch (err) {
    console.error('ERRO NO BOTAO GERAR:', err);
    return ctx.reply(`Ocorreu um erro critico: ${err.message}`);
  }
});

// Botao [Cancelar]
bot.action('cancel_edit', async (ctx) => {
  ctx.session = null; // Limpa a sessao
  await ctx.deleteMessage();
  await ctx.reply('Geracao cancelada.');
});

// Botoes de Edicao (Titulo, Estudio, Tags, Classificacao)
bot.action(['edit_title', 'edit_studio', 'edit_tags', 'edit_rating'], async (ctx) => {
  try {
    const acao = ctx.match[0];
    ctx.session.awaitingInput = acao; 
    
    let pergunta = 'O que voce quer colocar?';
    if (acao === 'edit_title') pergunta = 'Digite o novo **Titulo** (ex: Fumetsu no Anata e (3a TEMP))';
    if (acao === 'edit_studio') pergunta = 'Digite o novo **Estudio** (ex: Drive | Studio Massket)';
    if (acao === 'edit_tags') pergunta = 'Digite as novas **Tags** (separadas por virgula, ex: Aventura, Shounen, Drama)';
    if (acao === 'edit_rating') pergunta = 'Digite a **Classificacao** (ex: 16, 18, L)';
    
    await ctx.replyWithHTML(pergunta);
  } catch (err) {
    console.error('ERRO NO BOTAO EDITAR:', err);
  }
});


// --- OUVIR AS RESPOSTAS DE TEXTO (EDICAO) ---
bot.on('text', async (ctx) => {
  try {
    // Se o bot nao estiver esperando nada, ignora a mensagem
    if (!ctx.session || !ctx.session.awaitingInput || !ctx.session.animeData) {
      return;
    }

    const state = ctx.session.awaitingInput;
    const animeData = ctx.session.animeData;
    const userInput = ctx.message.text.trim();

    // Atualiza os dados na sessao
    if (state === 'edit_title') {
      animeData.title.romaji = userInput;
    }
    if (state === 'edit_studio') {
      animeData.studios.nodes = [{ name: userInput }]; 
    }
    if (state === 'edit_tags') {
      animeData.genres = userInput.split(',').map(tag => tag.trim());
    }
    if (state === 'edit_rating') {
      animeData.classificacaoManual = userInput;
    }

    ctx.session.awaitingInput = null; // Limpa o estado
    ctx.session.animeData = animeData; // Salva os dados
    
    await ctx.reply('Dados atualizados!');
    await enviarConfirmacao(ctx); // Mostra os botoes de novo

  } catch (err) {
    console.error('ERRO AO PROCESSAR TEXTO:', err);
    return ctx.reply(`Ocorreu um erro critico: ${err.message}`);
  }
});


// --- INICIO DO BOT ---
carregarFontes().then(() => {
  bot.launch();
  console.log('Bot MODULARIZADO iniciado e rodando (fontes carregadas)...');
}).catch(err => {
  console.error('Falha ao carregar fontes no inicio!', err);
  process.exit(1);
});
