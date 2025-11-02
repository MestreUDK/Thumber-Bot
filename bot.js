require('dotenv').config();
const { Telegraf } = require('telegraf');
const axios = require('axios');
const Jimp = require('jimp'); // Importamos a biblioteca de imagem

const BOT_TOKEN = process.env.BOT_TOKEN;

if (!BOT_TOKEN) {
  console.error('ERRO: Token do bot (BOT_TOKEN) não foi encontrado!');
  process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);

// --- Função da API ANILIST (continua igual) ---
async function buscarAnime(nome) {
  const query = `
    query ($search: String) {
      Media (search: $search, type: ANIME) {
        title {
          romaji
          english
        }
        season
        seasonYear
        episodes
        studios(isMain: true) {
          nodes {
            name
          }
        }
        genres
        averageScore
        format
        coverImage {
          large
        }
        bannerImage
      }
    }
  `;
  const variables = {
    search: nome
  };

  try {
    const response = await axios.post('https://graphql.anilist.co', {
      query: query,
      variables: variables
    });
    return response.data.data.Media;
  } catch (error) {
    console.error('Erro ao buscar no AniList:', error.message);
    return null;
  }
}
// --- FIM DA FUNÇÃO DA API ---


bot.start((ctx) => {
  ctx.reply('Olá! Eu sou o bot gerador de capas.\n\nEnvie /capa [nome do anime] para começar.');
});

// --- COMANDO /CAPA ATUALIZADO PARA GERAR IMAGEM ---
bot.command('capa', async (ctx) => {
  const nomeDoAnime = ctx.message.text.replace('/capa', '').trim();

  if (!nomeDoAnime) {
    return ctx.reply('Por favor, me diga o nome do anime. Ex: /capa To Your Eternity');
  }

  // Mudamos a mensagem para incluir "Gerando imagem"
  ctx.reply(`Buscando dados e gerando capa para: ${nomeDoAnime}... 🎨`);

  const anime = await buscarAnime(nomeDoAnime);

  if (!anime) {
    return ctx.reply(`Desculpe, não consegui encontrar o anime "${nomeDoAnime}".`);
  }

  // --- HORA DE DESENHAR (TESTE SIMPLES) ---
  try {
    // 1. Cria uma tela preta (largura: 800, altura: 400)
    const image = new Jimp(800, 400, '#000000');

    // 2. Carrega uma fonte branca (Jimp tem algumas fontes padrão)
    const font = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);

    // 3. Escreve na imagem (fonte, x, y, texto)
    image.print(font, 20, 20, `Anime: ${anime.title.romaji}`);
    
    // Pega o nome do estúdio
    const estudio = anime.studios.nodes.length > 0 ? anime.studios.nodes[0].name : 'Estúdio desconhecido';
    image.print(font, 20, 60, `Estúdio: ${estudio}`);

    // 4. Converte a imagem para um formato que o Telegram entende
    const buffer = await image.getBufferAsync(Jimp.MIME_PNG);

    // 5. Envia a IMAGEM!
    //    Usamos "source" para enviar o "buffer" (a imagem em memória)
    return ctx.replyWithPhoto({ source: buffer });

  } catch (err) {
    console.error('Erro ao gerar a imagem:', err);
    return ctx.reply('Desculpe, tive um problema ao tentar desenhar a capa.');
  }
  // --- FIM DO CÓDIGO DE DESENHO ---
});


bot.launch();
console.log('Bot iniciado e rodando na nuvem (com Jimp)...');
