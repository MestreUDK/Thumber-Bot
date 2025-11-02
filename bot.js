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

// --- Função da API ANILIST (com ageRating) ---
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
        ageRating // <-- Já estávamos pegando isso
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

// *** NOVA FUNÇÃO ***
// --- Pega o valor da API (ex: "16") e traduz para o nome do arquivo (ex: "A16.png") ---
function getRatingImageName(apiRating) {
  if (!apiRating) return null;
  
  const rating = String(apiRating).toUpperCase();

  // Mapeamento padrão BR (que você vai upar)
  if (rating === 'G' || rating === 'ALL') return 'L.png';
  if (rating === '10') return 'A10.png';
  if (rating === '12') return 'A12.png';
  if (rating === 'PG' || rating === 'PG-13') return 'A12.png'; // Mapeia PG/PG-13 para 12
  if (rating === '14') return 'A14.png';
  if (rating === '16') return 'A16.png'; // <-- O caso da sua referência
  if (rating === '18' || rating === 'R' || rating === 'R+') return 'A18.png'; // Mapeia R/R+ para 18

  // Se a API retornar só o número
  if (rating.match(/^[0-9]+$/)) { 
    return `A${rating}.png`; 
  }
  
  return null; // Não achou um mapeamento
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
    const padding = 40;
    const textoAreaLargura = largura * 0.6;

    const image = new Jimp(largura, altura, '#000000');
    
    if (anime.bannerImage) {
      const banner = await Jimp.read(anime.bannerImage);
      banner.cover(largura, altura);
      image.composite(banner, 0, 0);
    }

    const overlay = new Jimp(largura, altura, '#000000');
    overlay.opacity(0.6);
    image.composite(overlay, 0, 0);

    if (anime.coverImage && anime.coverImage.large) {
      const cover = await Jimp.read(anime.coverImage.large);
      const coverWidth = largura * 0.3;
      cover.resize(coverWidth, Jimp.AUTO); 
      image.composite(cover, largura - cover.bitmap.width - padding, padding);
    }

    const fontTitulo = await Jimp.loadFont(Jimp.FONT_SANS_64_WHITE);
    const fontInfo = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
    const fontTag = await Jimp.loadFont(Jimp.FONT_SANS_16_WHITE);

    let currentTextY = padding;

    const temporada = traduzirTemporada(anime.season);
    const infoTopo = `${temporada} ${anime.seasonYear} • ${anime.episodes} EPISÓDIOS`;
    image.print(fontInfo, padding, currentTextY, infoTopo, textoAreaLargura);
    currentTextY += Jimp.measureTextHeight(fontInfo, infoTopo, textoAreaLargura) + 10;

    const titulo = anime.title.romaji || anime.title.english;
    image.print(fontTitulo, padding, currentTextY, titulo, textoAreaLargura);
    currentTextY += Jimp.measureTextHeight(fontTitulo, titulo, textoAreaLargura) + 20;

    const estudio = anime.studios.nodes.length > 0 ? anime.studios.nodes[0].name : 'Estúdio desconhecido';
    image.print(fontInfo, padding, currentTextY, `Estúdio: ${estudio}`, textoAreaLargura);
    currentTextY += Jimp.measureTextHeight(fontInfo, `Estúdio: ${estudio}`, textoAreaLargura) + 20;

    let currentTagX = padding;
    let currentTagY = currentTextY;
    const tagHeight = 30;
    const tagPaddingHorizontal = 10;
    const tagPaddingVertical = 5;

    for (const genero of anime.genres.slice(0, 4)) {
      const genreText = genero.toUpperCase();
      const textWidth = Jimp.measureText(fontTag, genreText);
      const tagWidth = textWidth + (tagPaddingHorizontal * 2);

      if (currentTagX + tagWidth > textoAreaLargura + padding) {
        currentTagX = padding;
        currentTagY += tagHeight + 10;
      }

      const tagBg = new Jimp(tagWidth, tagHeight, '#FFA500');
      image.composite(tagBg, currentTagX, currentTagY);
      image.print(fontTag, currentTagX + tagPaddingHorizontal, currentTagY + tagPaddingVertical, genreText);

      currentTagX += tagWidth + 10;
    }

    image.print(fontInfo, padding, altura - padding - Jimp.measureTextHeight(fontInfo, '@AnimesUDK', largura), '@AnimesUDK');

    // *** CÓDIGO DE CLASSIFICAÇÃO ATUALIZADO ***
    // Em vez de desenhar, agora ele vai CARREGAR sua imagem
    const ratingFileName = getRatingImageName(anime.ageRating); // Ex: "A16.png"
    if (ratingFileName) {
      try {
        // Tenta carregar a imagem da pasta /classificacao/
        const ratingImagePath = `./classificacao/${ratingFileName}`;
        const ratingImage = await Jimp.read(ratingImagePath);

        // Redimensiona para uma altura padrão (ex: 60px)
        ratingImage.resize(Jimp.AUTO, 60); 
        
        const ratingX = largura - ratingImage.bitmap.width - padding;
        const ratingY = altura - ratingImage.bitmap.height - padding;

        // Cola a sua imagem na capa
        image.composite(ratingImage, ratingX, ratingY);
        
      } catch (err) {
        console.warn(`Aviso: Não foi possível carregar a imagem ${ratingFileName} da pasta /classificacao/`);
        // Se o arquivo não existir, ele não faz nada e não quebra o bot.
      }
    }
    // *** FIM DA ATUALIZAÇÃO ***


    const buffer = await image.getBufferAsync(Jimp.MIME_PNG);
    return ctx.replyWithPhoto({ source: buffer });

  } catch (err) {
    console.error('Erro ao gerar a imagem:', err);
    return ctx.reply('Desculpe, tive um problema ao tentar desenhar a capa.');
  }
});


bot.launch();
console.log('Bot iniciado e rodando na nuvem (com Imagens de Classificação)...');

