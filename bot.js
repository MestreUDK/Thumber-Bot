// ARQUIVO: bot.js
// (Arquivo principal, agora muito mais limpo)

require('dotenv').config();
const { Telegraf } = require('telegraf');

// Importamos nossas funcoes dos arquivos separados
const { buscarAnime } = require('./anilist.js');
const { gerarCapa } = require('./image.js');

const BOT_TOKEN = process.env.BOT_TOKEN;

if (!BOT_TOKEN) {
  console.error('ERRO: Token do bot (BOT_TOKEN) não foi encontrado!');
  process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);

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

    // 1. CHAMA O MODULO DA API
    const resultadoApi = await buscarAnime(nomeDoAnime);

    if (!resultadoApi.success) {
      return ctx.reply(`Falha ao buscar. A API retornou o erro: ${resultadoApi.error}`);
    }
    
    const anime = resultadoApi.data;
    ctx.reply(`Anime encontrado! Gerando imagem...`);

    // 2. CHAMA O MODULO DE IMAGEM
    const resultadoImagem = await gerarCapa(anime);

    if (!resultadoImagem.success) {
      return ctx.reply(`Erro ao gerar imagem: ${resultadoImagem.error}`);
    }
    
    // 3. ENVIA O RESULTADO
    return ctx.replyWithPhoto({ source: resultadoImagem.buffer });

  } catch (err) {
    console.error('ERRO CRITICO NO COMANDO /CAPA:', err);
    return ctx.reply(`Ocorreu um erro critico: ${err.message}`);
  }
});


bot.launch();
console.log('Bot MODULARIZADO iniciado e rodando na nuvem...');
