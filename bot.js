require('dotenv').config();
const { Telegraf } = require('telegraf');
const axios = require('axios');
const Jimp = require('jimp');

const BOT_TOKEN = process.env.BOT_TOKEN;

if (!BOT_TOKEN) {
  console.error('ERRO: Token do bot (BOT_TOKEN) não foi encontrado!');
  process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);

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
        bannerImage # Precisamos desta para o fundo!
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

bot.start((ctx) => {
  ctx.reply('Olá! Eu sou o bot gerador de capas.\n\nEnvie /capa [nome do anime] para começar.');
});

bot.command('capa', async (ctx) => {
  const nomeDoAnime = ctx.message.text.replace('/capa', '').trim();

  if (!nomeDoAnime) {
    return ctx.reply('Por favor, me diga o nome do anime. Ex: /capa To Your Eternity');
  }

  ctx.reply(`Buscando dados e gerando capa para: ${nomeDoAnime}... 🎨`);

  const anime = await buscarAnime(nomeDoAnime);

  if (!anime) {
    return ctx.reply(`Desculpe, não consegui encontrar o anime "${nomeDoAnime}".`);
  }

  try {
    // === NOVAS DIMENSÕES DA IMAGEM FINAL ===
    // Largura padrão para posts de imagem no Telegram (ou redes sociais)
    const largura = 1280; 
    const altura = 720; // Proporção 16:9

    const image = new Jimp(largura, altura, '#000000'); // Fundo preto inicial

    // === 1. Baixar e adicionar a IMAGEM DE FUNDO (Banner) ===
    if (anime.bannerImage) {
      const banner = await Jimp.read(anime.bannerImage);
      // Redimensiona o banner para cobrir toda a largura, mantendo a proporção
      banner.resize(largura, Jimp.AUTO); 
      // Se a altura ainda for maior que a tela, corta o excesso
      if (banner.bitmap.height > altura) {
        banner.crop(0, (banner.bitmap.height - altura) / 2, largura, altura);
      }
      image.composite(banner, 0, 0); // Cola o banner na posição (0,0)
      
      // Opcional: Escurecer o fundo para o texto aparecer melhor
      image.color([{ apply: 'darken', params: [50] }]); // Escurece 50%
    }
    
    // === 2. Baixar e adicionar a IMAGEM DE CAPA (Cover) ===
    const coverLargura = largura * 0.3; // 30% da largura da tela
    const coverAltura = Jimp.AUTO;
    const coverX = largura - coverLargura - 30; // 30px da borda direita
    const coverY = 30; // 30px da borda superior

    if (anime.coverImage && anime.coverImage.large) {
      const cover = await Jimp.read(anime.coverImage.large);
      cover.resize(coverLargura, coverAltura);
      image.composite(cover, coverX, coverY); // Cola a capa
    }


    // === 3. Adicionar TEXTO BÁSICO (Por enquanto, um teste) ===
    // Carregamos a fonte uma vez e a usamos para todos os textos
    const fontTitulo = await Jimp.loadFont(Jimp.FONT_SANS_64_WHITE); // Fonte maior para título
    const fontNormal = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE); // Fonte normal para detalhes

    const tituloAnime = anime.title.romaji || anime.title.english;
    const estudio = anime.studios.nodes.length > 0 ? anime.studios.nodes[0].name : 'Estúdio desconhecido';

    // Posições aproximadas
    image.print(fontTitulo, 30, 30, tituloAnime); // Título no canto superior esquerdo
    image.print(fontNormal, 30, 120, `Estúdio: ${estudio}`); // Estúdio abaixo do título
    image.print(fontNormal, 30, 160, `Episódios: ${anime.episodes}`); // Episódios

    const buffer = await image.getBufferAsync(Jimp.MIME_PNG);
    return ctx.replyWithPhoto({ source: buffer });

  } catch (err) {
    console.error('Erro ao gerar a imagem:', err);
    return ctx.reply('Desculpe, tive um problema ao tentar desenhar a capa.');
  }
});


bot.launch();
console.log('Bot iniciado e rodando na nuvem (com Jimp e imagens)...');
