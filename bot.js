const { Telegraf } = require('telegraf');

// =======================================================
// LEIA ISSO:
// O Token NÃO é colocado aqui. Ele é lido das "Variáveis de Ambiente"
// que você vai configurar no painel do Discloud.
const BOT_TOKEN = process.env.BOT_TOKEN;
// =======================================================

if (!BOT_TOKEN) {
  // Se o bot não achar o token, ele vai avisar nos Logs do Discloud
  console.error('ERRO: Token do bot (BOT_TOKEN) não foi encontrado nas variáveis de ambiente!');
  process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);

bot.start((ctx) => {
  ctx.reply('Olá! Eu sou o bot gerador de capas.\n\nEnvie /capa [nome do anime] para começar.');
});

bot.command('capa', (ctx) => {
  // Pega o texto que vem depois do /capa
  const nomeDoAnime = ctx.message.text.replace('/capa', '').trim();

  // Verifica se o usuário mandou um nome
  if (!nomeDoAnime) {
    return ctx.reply('Por favor, me diga o nome do anime. Ex: /capa To Your Eternity');
  }

  // Por enquanto, vamos só confirmar o que recebemos
  ctx.reply(`Recebido! Preparando capa para: ${nomeDoAnime}`);

  // (Futuramente, aqui vamos chamar a API do AniList e a biblioteca de imagem)
});

// Inicia o bot
bot.launch();

console.log('Bot iniciado e rodando na nuvem...');
