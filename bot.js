// ARQUIVO: bot.js (Arquivo Principal - Com Fluxo de Etapas)

require('dotenv').config();
const { Telegraf } = require('telegraf'); 
const LocalSession = require('telegraf-session-local');
const fs = require('fs');
const path = require('path');

// --- Carrega a versão do package.json ---
let botVersion = 'v?'; 
try {
  const packageJsonPath = path.join(__dirname, 'package.json');
  const packageJsonData = fs.readFileSync(packageJsonPath, 'utf8');
  const packageData = JSON.parse(packageJsonData);
  if (packageData.version) {
    botVersion = `v${packageData.version}`;
  }
} catch (err) {
  console.error("Nao foi possivel ler o package.json para pegar a versao:", err.message);
}

// Importa nossas funcoes da pasta 'src'
const { buscarAnime } = require('./src/anilist.js');
const { carregarFontes } = require('./src/image.js'); 
const { enviarMenuLayout, enviarMenuFonteDados } = require('./menus/index.js'); 
// --- *** IMPORTAÇÃO CORRIGIDA *** ---
const { registerEvents } = require('./src/events/index.js'); // Aponta para a nova pasta
const { checkPermission, allowedIds } = require('./src/security.js');

const BOT_TOKEN = process.env.BOT_TOKEN;

if (!BOT_TOKEN) {
  console.error('ERRO: Token do bot (BOT_TOKEN) não foi encontrado!');
  process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);
bot.use(new LocalSession().middleware()); 

// --- REGISTRA OS COMANDOS PRINCIPAIS ---

bot.start((ctx) => {
  const welcomeMessage = "Bem-vindo(a) ao Thumber Bot feito pelo Mestre UDK, aqui é possível criar capas para seus posts de animes de forma descomplicada e intuitiva";
  ctx.reply(welcomeMessage);
});

// --- COMANDO /ajuda ATUALIZADO ---
bot.command('ajuda', (ctx) => {
  const helpMessage = `
Olá! Aqui está como usar o Thumber Bot:

<b>Criação:</b>
<code>/capa Nome do Anime</code> (Gera Imagem)
<code>/post Nome do Anime</code> (Gera Texto)

<b>Restauração:</b>
<code>/passcode</code> (Cola um código antigo)

O que acontece depois:

<b>1. 🔍 Fonte dos Dados:</b> Escolha como iniciar:
• <b>🔗 AniList:</b> Busca dados automáticos.
• <b>✍️ Manual:</b> Cria do zero.

<b>2. 🎨 Layout:</b> Escolha o modelo (📺 TV, 🎬 Filme ou 📼 ONA).

<b>3. ✏️ Edição:</b> Edite todas as informações e troque imagens.

<b>4. ✅ Gerar:</b> Receba sua Capa (ou Post) e o <b>Passcode</b> de segurança!

---
<i>Thumber Bot ${botVersion}</i>
`; 

  ctx.reply(helpMessage, { parse_mode: 'HTML' });
});


// --- COMANDO /capa (Gera Imagem) ---
bot.command('capa', checkPermission, async (ctx) => {
  try {
    const nomeDoAnime = ctx.message.text.replace('/capa', '').trim();
    if (!nomeDoAnime) {
      return ctx.reply('Por favor, me diga o nome do anime. Ex: /capa To Your Eternity');
    }

    ctx.session.searchTitle = nomeDoAnime; 
    ctx.session.state = 'source_select';
    ctx.session.isPostMode = false; // <--- Define modo CAPA
    await enviarMenuFonteDados(ctx); 

  } catch (err) {
    console.error('ERRO CRITICO NO COMANDO /CAPA:', err);
    return ctx.reply(`Ocorreu um erro critico: ${err.message}`);
  }
});

// --- COMANDO /post (Gera Texto) ---
bot.command('post', checkPermission, async (ctx) => {
  try {
    const nomeDoAnime = ctx.message.text.replace('/post', '').trim();
    if (!nomeDoAnime) {
      return ctx.reply('Por favor, me diga o nome do anime. Ex: /post To Your Eternity');
    }

    ctx.session.searchTitle = nomeDoAnime; 
    ctx.session.state = 'source_select';
    ctx.session.isPostMode = true; // <--- Define modo POST
    await enviarMenuFonteDados(ctx); 

  } catch (err) {
    console.error('ERRO CRITICO NO COMANDO /POST:', err);
    return ctx.reply(`Ocorreu um erro critico: ${err.message}`);
  }
});

// --- COMANDO /passcode ---
bot.command('passcode', checkPermission, async (ctx) => {
  // Define o estado para esperar o código
  ctx.session.state = 'awaiting_passcode';
  ctx.reply('🔐 Por favor, envie o seu **Passcode** agora:', { parse_mode: 'Markdown' });
});

// --- REGISTRA TODOS OS OUTROS EVENTOS ---
registerEvents(bot, checkPermission);


// --- INICIA O BOT ---
carregarFontes().then(() => {
  bot.launch();
  console.log(`Bot REATORADO iniciado e rodando (Versão ${botVersion})...`);
}).catch(err => {
  console.error('Falha ao carregar fontes no inicio!', err);
  process.exit(1);
});
