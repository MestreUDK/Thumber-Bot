// ARQUIVO: bot.js (Arquivo Principal - Com Whitelist)
// (Atualizado para definir o layout padrao)

require('dotenv').config();
const { Telegraf } = require('telegraf'); 
const LocalSession = require('telegraf-session-local');

// Importa nossas funcoes da pasta 'src'
const { buscarAnime } = require('./src/anilist.js');
const { carregarFontes } = require('./src/image.js'); 
const { enviarConfirmacao } = require('./src/confirmation.js');
const { registerEvents } = require('./src/events.js');
const { checkPermission, allowedIds } = require('./src/security.js');

const BOT_TOKEN = process.env.BOT_TOKEN;

if (!BOT_TOKEN) {
  console.error('ERRO: Token do bot (BOT_TOKEN) não foi encontrado!');
  process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);
bot.use(new LocalSession().middleware()); 

// --- REGISTRA OS COMANDOS PRINCIPAIS ---

bot.start((ctx) => { /* ... (sem mudancas) ... */ });

bot.command('capa', checkPermission, async (ctx) => {
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
    
    // --- *** MUDANCA: Define o Layout Padrao *** ---
    // (A API do AniList nos da o formato)
    const formato = anime.format ? String(anime.format).toUpperCase() : 'TV';
    if (formato === 'MOVIE') {
        anime.layout = 'FILME';
    } else if (formato === 'ONA') {
        anime.layout = 'ONA';
    } else {
        anime.layout = 'TV';
    }
    // --- FIM DA MUDANCA ---
    
    ctx.session.animeData = anime; 
    ctx.session.awaitingInput = null; 
    
    await enviarConfirmacao(ctx);

  } catch (err) {
    console.error('ERRO CRITICO NO COMANDO /CAPA:', err);
    return ctx.reply(`Ocorreu um erro critico: ${err.message}`);
  }
});

// --- REGISTRA TODOS OS OUTROS EVENTOS ---
registerEvents(bot, checkPermission);


// --- INICIA O BOT ---
carregarFontes().then(() => {
  bot.launch();
  console.log('Bot REATORADO iniciado e rodando (com Modelos)...');
}).catch(err => {
  console.error('Falha ao carregar fontes no inicio!', err);
  process.exit(1);
});
