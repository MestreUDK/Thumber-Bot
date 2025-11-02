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

// --- Função da API ANILIST (MODIFICADA PARA REPORTAR ERRO) ---
async function buscarAnime(nome) {
  // Query em linha unica para evitar erros de encoding
  const query = 'query ($search: String) { Media (search: $search, type: ANIME) { title { romaji english } season seasonYear episodes studios(isMain: true) { nodes { name } } genres averageScore format coverImage { large } bannerImage ageRating } }';
  
  const variables = {
    search: nome
  };

  try {
    const response = await axios.post('https://graphql.anilist.co', {
      query: query,
      variables: variables
    });

    if (!response.data.data || !response.data.data.Media) {
      // Se a API respondeu, mas não achou o anime
      return { success: false, error: 'Anime nao encontrado pela API.' };
    }

    // Retorna sucesso
    return { success: true, data: response.data.data.Media };

  } catch (error) {
    console.error(`Erro GERAL no axios ao buscar no AniList por "${nome}":`, error.message);
    // Retorna falha E a mensagem de erro
    return { success: false, error: error.message };
  }
}

// --- FUNÇÃO PARA TRADUZIR (SEM ACENTOS) ---
function traduzirTemporada(season) {
  if (!season) return '';
  switch (season.toUpperCase()) {
    case 'SPRING': return 'PRIMAVERA';
    case 'SUMMER': return 'VERAO';
    case 'FALL': return 'OUTONO';
    case 'WINTER': return 'INVERNO';
    default: return season;
  }
}

// --- FUNÇÃO DE MAPEAMENTO DE CLASSIFICAÇÃO ---
function getRatingImageName(apiRating) {
  if (!apiRating) return null;
  const rating = String(apiRating).toUpperCase();
  if (rating === 'G' || rating === 'ALL') return 'L.png';
  if (rating === 'PG') return 'A12.png';
  if (rating === 'PG-13') return 'A14.png';
  if (rating === 'R+' || rating === 'R-17' || rating === 'R') return 'A16.png';
  if (rating === 'NC-17' || rating === 'RX') return 'A18.png';
  if (rating === '10') return 'A10.png';
  if (rating === '12') return 'A12.png';
  if (rating === '14') return 'A14.png';
  if (rating === '16') return 'A16.png';
  if (rating === '18') return 'A18.png';
  return null;
}

bot.start((ctx) => {
  ctx.reply('Ola! Eu sou o bot gerador de capas.\n\nEnvie /capa [nome do anime] para comecar.');
});

// *** COMANDO /CAPA ATUALIZADO PARA REPORTAR ERRO ***
bot.command('capa', async (ctx) => {
  try {
    const nomeDoAnime = ctx.message.text.replace('/capa', '').trim();

    if (!nomeDoAnime) {
      return ctx.reply('Por favor, me diga o nome do anime. Ex: /capa To Your Eternity');
    }

    ctx.reply(`Buscando dados para: ${nomeDoAnime}...`);

    // --- MUDANÇA AQUI ---
    const resultado = await buscarAnime(nomeDoAnime);

    // Se a busca falhou (success == false)
    if (!resultado.success) {
      // O bot vai te dizer QUAL foi o erro
      return ctx.reply(`Desculpe, falha ao buscar. A API retornou o erro: ${resultado.error}`);
    }
    
    // Se deu certo, continuamos
    const anime = resultado.data;
    // --- FIM DA MUDANÇA ---

    ctx.reply(`Anime encontrado! Gerando imagem...`);

    // --- O resto do código de gerar imagem (sem alterações) ---
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
    const episodios = anime.episodes || '??';
    const infoTopo = `${temporada} ${anime.seasonYear} - ${episodios} EPISODIOS`;
    image.print(fontInfo, padding, currentTextY, infoTopo, textoAreaLargura);
    currentTextY += Jimp.measureTextHeight(fontInfo, infoTopo, textoAreaLargura) + 10;

    const titulo = anime.title.romaji || anime.title.english || "Titulo Desconhecido";
    image.print(fontTitulo, padding, currentTextY, titulo, textoAreaLargura);
    currentTextY += Jimp.measureTextHeight(fontTitulo, titulo, textoAreaLargura) + 20;

    const estudio = anime.studios.nodes.length > 0 ? anime.studios.nodes[0].name : 'Estudio desconhecido';
    image.print(fontInfo, padding, currentTextY, `Estudio: ${estudio}`, textoAreaLargura);
    currentTextY += Jimp.measureTextHeight(fontInfo, `Estudio: ${estudio}`, textoAreaLargura) + 20;

    let currentTagX = padding;
    let currentTagY = currentTextY;
    const tagHeight = 30;
    const tagPaddingHorizontal = 10;
    const tagPaddingVertical = 5;
    const generos = anime.genres || [];
    for (const genero of generos.slice(0, 4)) {
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

    const ratingFileName = getRatingImageName(anime.ageRating);
    if (ratingFileName) {
      try {
        const ratingImagePath = `./classificacao/${ratingFileName}`;
        const ratingImage = await Jimp.read(ratingImagePath);
        ratingImage.resize(Jimp.AUTO, 60);
        const ratingX = largura - ratingImage.bitmap.width - padding;
        const ratingY = altura - ratingImage.bitmap.height - padding;
        image.composite(ratingImage, ratingX, ratingY);
      } catch (err) {
        console.warn(`Aviso: Nao foi possivel carregar a imagem ${ratingFileName} da pasta /classificacao/`);
      }
    }

    const buffer = await image.getBufferAsync(Jimp.MIME_PNG);
    return ctx.replyWithPhoto({ source: buffer });

  } catch (err) {
    console.error('ERRO GERAL NO COMANDO /CAPA:', err);
    return ctx.reply(`Ocorreu um erro critico ao gerar a imagem: ${err.message}`);
  }
});


bot.launch();
console.log('Bot iniciado e rodando na nuvem (Versao DEBUG ERRO API)...');
