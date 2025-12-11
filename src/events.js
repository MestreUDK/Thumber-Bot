// ARQUIVO: src/events.js
// (ATUALIZADO: Suporte Híbrido para /capa e /post)

const { gerarCapa } = require('./image.js');
// --- *** NOVO IMPORT *** ---
const { formatarPost } = require('./templates/post.js'); 
// ---------------------------
const { 
  enviarMenuLayout, 
  enviarMenuEdicao, 
  enviarMenuEdicaoFilme, 
  enviarMenuClassificacao,
  enviarMenuFonteDados 
} = require('./confirmation.js');
const { traduzirTemporada } = require('./utils.js');
const { buscarAnime } = require('./anilist.js'); 
const { gerarPasscode, lerPasscode } = require('./passcode.js');

async function irParaMenuEdicao(ctx) {
  const layout = ctx.session.animeData.layout || 'TV';

  if (layout === 'FILME') {
    await enviarMenuEdicaoFilme(ctx);
  } else {
    await enviarMenuEdicao(ctx);
  }
}


function registerEvents(bot, checkPermission) {

  // --- ETAPA 0: FONTE DE DADOS ---

  bot.action('source_anilist', checkPermission, async (ctx) => {
    try {
      if (!ctx.session || ctx.session.state !== 'source_select') return ctx.answerCbQuery('Sessão expirada. Use /capa novamente.');

      const nomeDoAnime = ctx.session.searchTitle;
      if (!nomeDoAnime) return ctx.answerCbQuery('Nome do anime não encontrado na sessão.');

      await ctx.deleteMessage();
      await ctx.reply(`Buscando dados no AniList para: ${nomeDoAnime}...`);

      const resultadoApi = await buscarAnime(nomeDoAnime);

      if (!resultadoApi.success) {
        await ctx.reply(`Falha ao buscar: ${resultadoApi.error}\n\nTente buscar manualmente.`);
        return await enviarMenuFonteDados(ctx);
      }

      const anime = resultadoApi.data;
      // Inicializa campos básicos
      anime.classificacaoManual = null; 
      anime.infoManual = null; 
      
      // --- Inicializa campos do POST para evitar undefined ---
      anime.abrev = null;
      anime.audio = null;
      anime.seasonNum = null;
      anime.partNum = null;
      anime.seasonName = null;
      // ------------------------------------------------------

      const formato = anime.format ? String(anime.format).toUpperCase() : 'TV';
      if (formato === 'MOVIE') {
          anime.layout = 'FILME';
      } else if (formato === 'ONA') {
          anime.layout = 'ONA';
      } else {
          anime.layout = 'TV';
      }

      ctx.session.animeData = anime; 
      ctx.session.state = 'layout_select';
      await enviarMenuLayout(ctx);

    } catch (err) { console.error('ERRO EM source_anilist:', err); }
  });

  bot.action('source_manual', checkPermission, async (ctx) => {
    try {
      if (!ctx.session || ctx.session.state !== 'source_select') return ctx.answerCbQuery('Sessão expirada. Use /capa novamente.');

      const nomeDoAnime = ctx.session.searchTitle || "Anime Sem Título";

      const anime = {
        title: { romaji: nomeDoAnime, english: null },
        season: null,
        seasonYear: null,
        episodes: null,
        studios: { nodes: [] }, 
        genres: [], 
        averageScore: null,
        format: 'TV',
        // Campos extras para o Post Manual
        status: null, 
        description: null,
        startDate: { year: null }, 
        endDate: { year: null },
        // Imagens
        coverImage: { large: null },
        bannerImage: null,
        // Nossos campos
        classificacaoManual: null,
        infoManual: null,
        layout: 'TV',
        // Campos extras do Post
        abrev: null, audio: null, seasonNum: null, partNum: null, seasonName: null
      };

      ctx.session.animeData = anime;
      ctx.session.state = 'layout_select'; 

      await ctx.deleteMessage();
      await ctx.reply('Modo de preenchimento manual ativado. Escolha o layout.');
      await enviarMenuLayout(ctx);

    } catch (err) { console.error('ERRO EM source_manual:', err); }
  });

  // --- ETAPA 1: LAYOUT ---

  bot.action(['set_layout_TV', 'set_layout_FILME', 'set_layout_ONA'], checkPermission, async (ctx) => {
    if (ctx.session.state !== 'layout_select' || !ctx.session.animeData) {
        return ctx.answerCbQuery('Comando invalido. Use /capa primeiro.');
    }
    const acao = ctx.match[0];
    const novoLayout = acao.replace('set_layout_', '');
    ctx.session.animeData.layout = novoLayout;
    await enviarMenuLayout(ctx);
  });

  bot.action('ir_para_edicao', checkPermission, async (ctx) => {
    if (!ctx.session || ctx.session.state !== 'layout_select') return ctx.answerCbQuery();
    ctx.session.state = 'main_edit';
    await irParaMenuEdicao(ctx); 
  });

  bot.action('voltar_source_select', checkPermission, async (ctx) => {
    if (!ctx.session || ctx.session.state !== 'layout_select') return ctx.answerCbQuery();
    ctx.session.state = 'source_select'; 
    ctx.session.animeData = null; 
    await enviarMenuFonteDados(ctx); 
  });

  // --- ETAPA 2: EDICAO ---

  bot.action('voltar_layout', checkPermission, async (ctx) => {
    if (!ctx.session || (ctx.session.state !== 'main_edit' && ctx.session.state !== 'awaiting_input' && ctx.session.state !== 'rating_select')) return ctx.answerCbQuery();
    ctx.session.state = 'layout_select';
    ctx.session.awaitingInput = null;
    await enviarMenuLayout(ctx);
  });

  // --- *** GERAÇÃO FINAL HÍBRIDA (/post e /capa) *** ---
  bot.action('generate_final', checkPermission, async (ctx) => {
    if (!ctx.session || ctx.session.state !== 'main_edit') return ctx.answerCbQuery();
    try {
      await ctx.deleteMessage(); 
      
      const animeData = ctx.session.animeData;
      const isPostMode = ctx.session.isPostMode; // Verificamos o modo

      if (!animeData) { return ctx.reply('Sessao expirada.'); }

      if (isPostMode) {
        // --- MODO POST: Gera Texto ---
        await ctx.reply('📝 Gerando post de texto...');
        const textoPost = formatarPost(animeData);
        
        // Tenta enviar com imagem (poster) se existir
        if (animeData.coverImage && animeData.coverImage.large) {
             try {
                await ctx.replyWithPhoto(animeData.coverImage.large, { caption: textoPost, parse_mode: 'Markdown' });
             } catch(e) {
                // Se falhar a imagem (link quebrado), envia só texto
                await ctx.reply(textoPost, { parse_mode: 'Markdown' });
             }
        } else {
             // Sem imagem
             await ctx.reply(textoPost, { parse_mode: 'Markdown' });
        }

      } else {
        // --- MODO CAPA: Gera Imagem (Original) ---
        await ctx.reply('🎨 Gerando sua capa com os dados editados...');
        const resultadoImagem = await gerarCapa(animeData);
        if (!resultadoImagem.success) {
          return ctx.reply(`Erro ao gerar imagem: ${resultadoImagem.error}`);
        }
        await ctx.replyWithPhoto({ source: resultadoImagem.buffer });
      }

      // --- GERA PASSCODE (AGORA OTIMIZADO) ---
      const passcode = gerarPasscode(animeData);
      if (passcode) {
         await ctx.reply(
           `🔐 **Passcode**\n\nGuarde este código para restaurar este conteúdo no futuro:\n\n` +
           "```" + passcode + "```", 
           { parse_mode: 'Markdown' }
         );
      }

      ctx.session = null;
    } catch (err) { console.error('ERRO NO BOTAO GERAR:', err); }
  });

  bot.action('cancel_edit', checkPermission, async (ctx) => {
    ctx.session = null; 
    await ctx.deleteMessage();
    await ctx.reply('Operação cancelada.');
  });

  bot.action(['edit_title', 'edit_studio', 'edit_tags', 'edit_poster', 'edit_fundo', 'edit_info'], checkPermission, async (ctx) => {
    if (!ctx.session || ctx.session.state !== 'main_edit') return ctx.answerCbQuery();
    try {
      const acao = ctx.match[0];
      const animeData = ctx.session.animeData; 

      ctx.session.state = 'awaiting_input'; 
      ctx.session.awaitingInput = acao; 

      let pergunta = 'O que voce quer colocar?';
      let valorAtual = ''; 

      if (acao === 'edit_title') {
        valorAtual = (animeData.title && animeData.title.romaji) || "N/A";
        pergunta = `Digite o novo **Titulo** (Atual: \`${valorAtual}\`)`;
      } else if (acao === 'edit_info') {
        const temporada = animeData.season ? `${traduzirTemporada(animeData.season)} ${animeData.seasonYear}` : "N/A";
        const episodios = animeData.episodes || '??';
        valorAtual = (animeData.infoManual !== null && animeData.infoManual !== undefined) 
            ? animeData.infoManual 
            : `${temporada} • ${episodios} EPISÓDIOS`;
        pergunta = `Digite a nova **Info** (Atual: \`${valorAtual}\`)`;
      } else if (acao === 'edit_studio') {
        valorAtual = (animeData.studios && animeData.studios.nodes.length > 0) ? animeData.studios.nodes[0].name : 'N/A';
        pergunta = `Digite o novo **Estudio** (Atual: \`${valorAtual}\`)`;
      } else if (acao === 'edit_tags') {
        valorAtual = (animeData.genres && animeData.genres.length > 0) ? animeData.genres.join(', ') : 'N/A';
        pergunta = `Digite as novas **Tags** (separadas por vírgula)\n(Atuais: \`${valorAtual}\`)`;
      } else if (acao === 'edit_poster') {
        pergunta = 'Envie o **link (URL)** OU faça o **UPLOAD** da nova imagem do Pôster';
      } else if (acao === 'edit_fundo') {
        pergunta = 'Envie o **link (URL)** OU faça o **UPLOAD** da nova imagem de Fundo';
      }

      await ctx.reply(pergunta, { parse_mode: 'Markdown' });

    } catch (err) { console.error('ERRO NO BOTAO EDITAR:', err); }
  });

  bot.action('edit_rating', checkPermission, async (ctx) => {
    if (!ctx.session || ctx.session.state !== 'main_edit') return ctx.answerCbQuery('Estado invalido.');
    ctx.session.state = 'rating_select'; 
    await enviarMenuClassificacao(ctx);
  });


  // --- ETAPA 3: OUVIR RESPOSTAS ---
  bot.on('text', checkPermission, async (ctx) => {
    try {
      if (ctx.message.text.startsWith('/')) return; 

      // --- CHECK DE PASSCODE ---
      if (ctx.session.state === 'awaiting_passcode') {
          const codigo = ctx.message.text.trim();
          const dadosRestaurados = lerPasscode(codigo);

          if (!dadosRestaurados) {
              return ctx.reply('❌ Código inválido ou corrompido. Tente novamente ou use /capa para reiniciar.');
          }

          ctx.session.animeData = dadosRestaurados;
          ctx.session.state = 'main_edit'; 
          
          // --- DETECÇÃO DE MODO INTELIGENTE ---
          // Se o passcode tiver campos que só o /post tem (ex: description), ativamos o modo Post.
          if (dadosRestaurados.description || dadosRestaurados.abrev) {
             ctx.session.isPostMode = true;
             await ctx.reply('✅ Passcode aceito! Dados de **POST** restaurados.');
          } else {
             ctx.session.isPostMode = false;
             await ctx.reply('✅ Passcode aceito! Dados de **CAPA** restaurados.');
          }
          // ------------------------------------

          return await irParaMenuEdicao(ctx); 
      }

      if (ctx.session.state !== 'awaiting_input' || !ctx.session.animeData) { return; }

      const state = ctx.session.awaitingInput;
      const animeData = ctx.session.animeData;
      const userInput = ctx.message.text.trim();

      if (state === 'edit_title') { animeData.title.romaji = userInput; }
      if (state === 'edit_info') { animeData.infoManual = userInput; }
      if (state === 'edit_studio') { animeData.studios.nodes = [{ name: userInput }]; }
      if (state === 'edit_tags') { animeData.genres = userInput.split(',').map(tag => tag.trim()); }
      if (state === 'edit_poster') {
        if (!animeData.coverImage) animeData.coverImage = {};
        animeData.coverImage.large = userInput;
      }
      if (state === 'edit_fundo') { animeData.bannerImage = userInput; }

      ctx.session.state = 'main_edit'; 
      ctx.session.awaitingInput = null;
      ctx.session.animeData = animeData;

      await ctx.reply('Dados atualizados!');
      await irParaMenuEdicao(ctx); 

    } catch (err) { console.error('ERRO AO PROCESSAR TEXTO:', err); }
  });

  // --- (Sem alteracao no handler de fotos) ---
  bot.on('photo', checkPermission, async (ctx) => {
    try {
      if (ctx.session.state !== 'awaiting_input' || !ctx.session.animeData) { return; }
      const state = ctx.session.awaitingInput;
      const animeData = ctx.session.animeData;
      if (state !== 'edit_poster' && state !== 'edit_fundo') { return; }

      const photo = ctx.message.photo.pop();
      const fileLink = await ctx.telegram.getFileLink(photo.file_id);
      const imageUrl = fileLink.href;

      if (state === 'edit_poster') {
        if (!animeData.coverImage) animeData.coverImage = {};
        animeData.coverImage.large = imageUrl;
        await ctx.reply('Pôster atualizado com a imagem enviada!');
      } 
      if (state === 'edit_fundo') {
        animeData.bannerImage = imageUrl;
        await ctx.reply('Fundo atualizado com a imagem enviada!');
      }

      ctx.session.state = 'main_edit'; 
      ctx.session.awaitingInput = null;
      ctx.session.animeData = animeData;
      await irParaMenuEdicao(ctx);

    } catch (err) { console.error('ERRO AO PROCESSAR FOTO:', err); }
  });

  // --- ETAPA 4: HANDLERS DE CLASSIFICACAO (Sem alteracao) ---
  bot.action(
    [
      'set_rating_L', 'set_rating_10', 'set_rating_12', 
      'set_rating_14', 'set_rating_16', 'set_rating_18', 'set_rating_NONE'
    ], 
    checkPermission, 
    async (ctx) => {
      if (!ctx.session || ctx.session.state !== 'rating_select') return ctx.answerCbQuery();

      const acao = ctx.match[0];
      let novaClassificacao = null;

      if (acao === 'set_rating_L') novaClassificacao = 'L';
      if (acao === 'set_rating_10') novaClassificacao = '10';
      if (acao === 'set_rating_12') novaClassificacao = '12';
      if (acao === 'set_rating_14') novaClassificacao = '14';
      if (acao === 'set_rating_16') novaClassificacao = '16';
      if (acao === 'set_rating_18') novaClassificacao = '18';
      if (acao === 'set_rating_NONE') novaClassificacao = null;

      ctx.session.animeData.classificacaoManual = novaClassificacao;
      ctx.session.state = 'main_edit'; 

      await ctx.answerCbQuery(`Classificação definida como: ${novaClassificacao || 'Nenhuma'}`);

      await irParaMenuEdicao(ctx); 
    }
  );

  bot.action('voltar_edicao_principal', checkPermission, async (ctx) => {
    if (!ctx.session || ctx.session.state !== 'rating_select') return ctx.answerCbQuery();

    ctx.session.state = 'main_edit';
    await irParaMenuEdicao(ctx);
  });
}

module.exports = { registerEvents };
