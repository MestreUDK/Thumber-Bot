// =======================================================
// ISSO É NOVO:
// Faz o Node.js ler o arquivo .env que você criou no Discloud
require('dotenv').config();
// =======================================================

const { Telegraf } = require('telegraf');

// Agora ele vai ler o BOT_TOKEN que está no arquivo .env
const BOT_TOKEN = process.env.BOT_TOKEN;

if (!BOT_TOKEN) {
  // Se ele não achar, o erro vai continuar
  console.error('ERRO: Token do bot (BOT_TOKEN) não foi encontrado!');
  console.error('Certifique-se de que o arquivo .env existe e tem o token.');
  process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);

bot.start((ctx) => {
  ctx.reply('Olá! Eu sou o bot gerador de capas.\n\nEnvie /capa [nome do anime] para começar.');
});

bot.command('capa', (ctx) => {
  const nomeDoAnime = ctx.message.text.replace('/capa', '').trim();

  if (!nomeDoAnime) {
    return ctx.reply('Por favor, me diga o nome do anime. Ex: /capa To Your Eternity');
  }
  
  ctx.reply(`Recebido! Preparando capa para: ${nomeDoAnime}`);
});

bot.launch();

console.log('Bot iniciado e rodando na nuvem...');
