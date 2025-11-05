// ARQUIVO: bot.js (Arquivo Principal - Com Fluxo de Etapas)

require('dotenv').config();
const { Telegraf } = require('telegraf'); 
const LocalSession = require('telegraf-session-local');

// Importa nossas funcoes da pasta 'src'
const { buscarAnime } = require('./src/anilist.js');
const { carregarFontes } = require('./src/image.js'); 
// --- *** IMPORTAÇÃO ATUALIZADA *** ---
// Agora importa a nova funcao 'enviarMenuFonteDados'
const { enviarMenuLayout, enviarMenuFonteDados } = require('./src/confirmation.js'); 
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

bot.start((ctx) => {
  const welcomeMessage = "Bem-vindo(a) ao Thumber Bot feito pelo Mestre UDK, aqui é possível criar capas para seus posts de animes de forma descomplicada e intuitiva";
  ctx.reply(welcomeMessage);
});

bot.command('ajuda', (ctx) => {
  const helpMessage = `
Olá! Aqui está como usar o Thumber Bot:

Use o comando \`/capa [NOME_DO_ANIME]\`
*Exemplo: /capa To Your Eternity*

O que acontece depois:

**1. 🔍 Fonte dos Dados:** O bot perguntará se você quer buscar os dados no "AniList" ou preencher "Manual".
(Para animes não encontrados, use "Manual").

**2. 🎨 Layout:** Você precisará escolher um modelo de capa (TV, Filme ou ONA).

**3. ✏️ Edição:** Você poderá editar todas as informações usando os botões (título, estúdio, tags, classificação) e até trocar as imagens de pôster e fundo (enviando um link ou fazendo upload).

**4. ✅ Gerar:** Quando tudo estiver perfeito, clique em "Gerar Capa" e o bot a enviará para você em segundos!
`;
  
  ctx.reply(helpMessage, { parse_mode: 'Markdown' });
});


// --- *** COMANDO /CAPA TOTALMENTE REFEITO *** ---
bot.command('capa', checkPermission, async (ctx) => {
  try {
    const nomeDoAnime = ctx.message.text.replace('/capa', '').trim();
    if (!nomeDoAnime) {
      return ctx.reply('Por favor, me diga o nome do anime. Ex: /capa To Your Eternity');
    }

    // --- NOVA LÓGICA ---
    // 1. Apenas salva o nome da busca na sessão
    ctx.session.searchTitle = nomeDoAnime; 
    // 2. Define o novo estado de "seleção de fonte"
    ctx.session.state = 'source_select'; 
    // 3. Chama o NOVO menu de seleção (ANILIST / MANUAL)
    await enviarMenuFonteDados(ctx); 
    // --- FIM DA NOVA LÓGICA ---

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
  console.log('Bot REATORADO iniciado e rodando (com Fluxo de Etapas)...');
}).catch(err => {
  console.error('Falha ao carregar fontes no inicio!', err);
  process.exit(1);
});
