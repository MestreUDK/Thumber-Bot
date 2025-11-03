// ARQUIVO: bot.js (Arquivo Principal - Com Whitelist)

require('dotenv').config();
const { Telegraf } = require('telegraf'); 
const LocalSession = require('telegraf-session-local');

// Importa nossas funcoes da pasta 'src'
const { buscarAnime } = require('./src/anilist.js');
const { carregarFontes } = require('./src/image.js'); 
const { enviarConfirmacao } = require('./src/confirmation.js');
const { registerEvents } = require('./src/events.js');
// --- *** NOVO: Importa o modulo de seguranca *** ---
const { checkPermission, allowedIds } = require('./src/security.js');

const BOT_TOKEN = process.env.BOT_TOKEN;

if (!BOT_TOKEN) {
  console.error('ERRO: Token do bot (BOT_TOKEN) não foi encontrado!');
  process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);
bot.use(new LocalSession().middleware()); 

// --- REGISTRA OS COMANDOS PRINCIPAIS ---

// --- *** ATUALIZADO: Comando /start *** ---
// (Agora reconhece Admin, Whitelist e Estranhos)
bot.start((ctx) => {
  const userId = String(ctx.from.id);
  const username = ctx.from.username || 'N/A';
  const adminId = process.env.ADMIN_ID;

  if (userId === String(adminId)) {
    // 1. Mensagem para o Admin
    ctx.reply('Ola Mestre! Eu sou o bot gerador de capas. Seus comandos estao prontos.');
  } else if (allowedIds.has(userId)) {
    // 2. Mensagem para a Whitelist
    ctx.reply('Ola! Voce esta na lista de permissao. Bem-vindo(a) ao bot!\nEnvie /capa [nome do anime] para comecar.');
  } else {
    // 3. Mensagem para Estranhos
    console.log(`[LOG] Novo usuario tentou iniciar: ID=${userId}, Nome=${username}`);
    ctx.reply(`Desculpe, este e um bot privado.\n\nSeu ID de usuario e: ${userId}\n(Informe este ID para o administrador)`);
  }
});

// --- *** ATUALIZADO: Comando /capa *** ---
// (Adicionamos o 'checkPermission' para proteger o comando)
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
    ctx.session.animeData = anime; 
    ctx.session.awaitingInput = null; 
    
    await enviarConfirmacao(ctx);

  } catch (err) {
    console.error('ERRO CRITICO NO COMANDO /CAPA:', err);
    return ctx.reply(`Ocorreu um erro critico: ${err.message}`);
  }
});

// --- REGISTRA TODOS OS OUTROS EVENTOS ---
// (Passamos o 'checkPermission' para proteger botoes e uploads)
registerEvents(bot, checkPermission);


// --- INICIA O BOT ---
carregarFontes().then(() => {
  bot.launch();
  console.log('Bot REATORADO iniciado e rodando (com Seguranca de Whitelist)...');
}).catch(err => {
  console.error('Falha ao carregar fontes no inicio!', err);
  process.exit(1);
});
