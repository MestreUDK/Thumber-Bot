// ARQUIVO: bot.js (Arquivo Principal)

require('dotenv').config();
const { Telegraf, session } = require('telegraf'); // 'session' PRECISA estar aqui

// Importa nossas funcoes da pasta 'src'
const { buscarAnime } = require('./src/anilist.js');
const { carregarFontes } = require('./src/image.js'); 
const { enviarConfirmacao } = require('./src/confirmation.js');
const { registerEvents } = require('./src/events.js');

const BOT_TOKEN = process.env.BOT_TOKEN;

if (!BOT_TOKEN) {
  console.error('ERRO: Token do bot (BOT_TOKEN) não foi encontrado!');
  process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);

// --- *** A LINHA QUE CORRIGE O ERRO *** ---
// Ela CRIA o 'ctx.session'. O erro acontece se ela faltar.
bot.use(session()); 

// --- REGISTRA OS COMANDOS PRINCIPAIS ---

bot.start((ctx) => {
  ctx.reply('Ola! Eu sou o bot gerador de capas.\n\nEnvie /capa [nome do anime] para comecar.');
});

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
    
    anime.classificacaoManual = null; 
    
    // *** O PONTO QUE ESTAVA DANDO ERRO ***
    // Agora 'ctx.session' vai existir por causa do 'bot.use(session())'
    ctx.session.animeData = anime; 
    ctx.session.awaitingInput = null; 
    
    await enviarConfirmacao(ctx);

  } catch (err) {
    console.error('ERRO CRITICO NO COMANDO /CAPA:', err);
    return ctx.reply(`Ocorreu um erro critico: ${err.message}`);
  }
});

// --- REGISTRA TODOS OS OUTROS EVENTOS ---
// (Botoes e respostas de texto da pasta 'src/events.js')
registerEvents(bot);


// --- INICIA O BOT ---
carregarFontes().then(() => {
  bot.launch();
  console.log('Bot REATORADO iniciado e rodando (fontes carregadas)...');
}).catch(err => {
  console.error('Falha ao carregar fontes no inicio!', err);
  process.exit(1);
});
