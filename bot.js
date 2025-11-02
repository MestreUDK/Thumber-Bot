require('dotenv').config(); // Carrega o .env
const { Telegraf } = require('telegraf');
const axios = require('axios'); // Importamos o axios

const BOT_TOKEN = process.env.BOT_TOKEN;

if (!BOT_TOKEN) {
  console.error('ERRO: Token do bot (BOT_TOKEN) não foi encontrado!');
  process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);

// --- FUNÇÃO DA API ANILIST ---
// Esta função faz a busca na API
async function buscarAnime(nome) {
  // Esta é a "pergunta" em GraphQL que fazemos para a API
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

  // Aqui definimos o nome que estamos buscando
  const variables = {
    search: nome
  };

  try {
    // Fazemos a requisição (POST) para a API do AniList
    const response = await axios.post('https://graphql.anilist.co', {
      query: query,
      variables: variables
    });

    // Se der certo, retornamos os dados do anime
    return response.data.data.Media;
    
  } catch (error) {
    // Se der erro (ex: anime não encontrado)
    console.error('Erro ao buscar no AniList:', error.message);
    return null;
  }
}
// --- FIM DA FUNÇÃO DA API ---


bot.start((ctx) => {
  ctx.reply('Olá! Eu sou o bot gerador de capas.\n\nEnvie /capa [nome do anime] para começar.');
});

// --- COMANDO /CAPA ATUALIZADO ---
// Usamos "async" para poder esperar a API responder
bot.command('capa', async (ctx) => {
  const nomeDoAnime = ctx.message.text.replace('/capa', '').trim();

  if (!nomeDoAnime) {
    return ctx.reply('Por favor, me diga o nome do anime. Ex: /capa To Your Eternity');
  }

  // Avisa ao usuário que estamos trabalhando
  ctx.reply(`Buscando dados para: ${nomeDoAnime}... 🔎`);

  // Chama nossa nova função e espera a resposta
  const anime = await buscarAnime(nomeDoAnime);

  // Se o anime não for encontrado
  if (!anime) {
    return ctx.reply(`Desculpe, não consegui encontrar o anime "${nomeDoAnime}".`);
  }
  
  // --- A MÁGICA ACONTECEU ---
  // Por enquanto, vamos só responder com os dados que encontramos

  // Pegamos o nome do primeiro estúdio
  const estudio = anime.studios.nodes.length > 0 ? anime.studios.nodes[0].name : 'Estúdio desconhecido';

  // Criamos uma resposta de texto simples
  const resposta = `
Anime: ${anime.title.romaji}
Temporada: ${anime.season} ${anime.seasonYear}
Episódios: ${anime.episodes}
Estúdio: ${estudio}
Gêneros: ${anime.genres.join(', ')}

(Próximo passo: gerar a imagem!)
  `;

  // Enviamos a resposta
  // (replyWithPhoto é o próximo passo, por enquanto usamos reply)
  return ctx.reply(resposta);
});


bot.launch();
console.log('Bot iniciado e rodando na nuvem (com API)...');
