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

// --- FUNÇÃO PARA TRADUZIR NOME DA TEMPORADA ---
function traduzirTemporada(season) {
  if (!season) return '';
  switch (season.toUpperCase()) {
    case 'SPRING': return 'PRIMAVERA';
    case 'SUMMER': return 'VERÃO';
    case 'FALL': return 'OUTONO';
    case 'WINTER': return 'INVERNO';
    default: return season;
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
    const largura = 1280;
    const altura = 720;
    const padding = 40; // Espaçamento das bordas

    // === 1. IMAGEM DE FUNDO (Banner) ===
    // Cria uma imagem base. Se o banner não existir, fica preta.
    const image = new Jimp(largura, altura, '#000000');
    
    if (anime.bannerImage) {
      const banner = await Jimp.read(anime.bannerImage);
      // *** MUDANÇA IMPORTANTE ***
      // .cover() faz a imagem preencher a tela (1280x720), cortando o excesso
      banner.cover(largura, altura);
      image.composite(banner, 0, 0); // Cola o banner na base
    }

    // Adiciona uma camada escura por cima para o texto ficar legível
    const overlay = new Jimp(largura, altura, '#000000');
    overlay.opacity(0.6); // 60% de opacidade (preto semi-transparente)
    image.composite(overlay, 0, 0);

    // === 2. IMAGEM DE CAPA (Cover/Pôster) ===
    if (anime.coverImage && anime.coverImage.large) {
      const cover = await Jimp.read(anime.coverImage.large);
      // Redimensiona a capa para 30% da largura da tela
      cover.resize(largura * 0.3, Jimp.AUTO); 
      // Posição: 40px da borda direita, 40px da borda de cima
      image.composite(cover, largura - cover.bitmap.width - padding, padding);
    }

    // === 3. FONTES ===
    // Vamos carregar as fontes que vamos usar
    const fontTitulo = await Jimp.loadFont(Jimp.FONT_SANS_64_WHITE);
    const fontInfo = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
    const fontTag = await Jimp.loadFont(Jimp.FONT_SANS_16_WHITE); // Fonte pequena para as tags

    // === 4. TEXTOS PRINCIPAIS ===
    const temporada = traduzirTemporada(anime.season);
    const infoTopo = `${temporada} ${anime.seasonYear} • ${anime.episodes} EPISÓDIOS`;
    
    // Info (ex: OUTONO 2025 • 22 EPISÓDIOS)
    image.print(fontInfo, padding, padding, infoTopo);
    
    // Título do Anime
    const titulo = anime.title.romaji || anime.title.english;
    // (Jimp não quebra linha automático, então limitamos o espaço)
    image.print(fontTitulo, padding, padding + 40, titulo, largura * 0.6); // Título abaixo da info

    // === 5. DESENHAR AS TAGS DE GÊNERO ===
    let currentX = padding;
    let currentY = padding + 150; // Posição Y inicial das tags
    const tagHeight = 30; // Altura da tag
    const tagPadding = 10; // Espaçamento dentro da tag

    // Para cada gênero na lista...
    for (const genero of anime.genres.slice(0, 4)) { // Pega só os 4 primeiros
      const genreText = genero.toUpperCase();
      const textWidth = Jimp.measureText(fontTag, genreText); // Mede o texto
      const tagWidth = textWidth + (tagPadding * 2); // Largura total da tag

      // Desenha o fundo da tag (um retângulo laranja)
      const tagBg = new Jimp(tagWidth, tagHeight, '#FFA500'); // Cor laranja (similar ao Shounen)
      image.composite(tagBg, currentX, currentY);

      // Escreve o texto do gênero em cima do retângulo
      image.print(fontTag, currentX + tagPadding, currentY + (tagHeight / 4), genreText);

      // Move o X para a próxima tag
      currentX += tagWidth + 10; // 10px de espaço entre tags
    }
    
    // === 6. ADICIONAR SEU WATERMARK (ex: @AnimesUDK) ===
    // (Igual da sua referência)
    image.print(fontInfo, padding, altura - padding - 32, '@AnimesUDK');


    // === 7. ENVIAR A IMAGEM ===
    const buffer = await image.getBufferAsync(Jimp.MIME_PNG);
    return ctx.replyWithPhoto({ source: buffer });

  } catch (err) {
    console.error('Erro ao gerar a imagem:', err);
    return ctx.reply('Desculpe, tive um problema ao tentar desenhar a capa.');
  }
});

bot.launch();
console.log('Bot iniciado e rodando na nuvem (com Fundo e Tags)...');
