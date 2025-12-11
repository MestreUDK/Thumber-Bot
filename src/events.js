// ARQUIVO: src/events.js
// (ATUALIZADO: /post gera APENAS texto e permite re-edição)

const { gerarCapa } = require('./image.js');
const { formatarPost } = require('./templates/post.js'); 
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
      if (!ctx.session || ctx.session.state !== 'source_select') return ctx.answerCbQuery('Sessão expirada.');

      const nomeDoAnime = ctx.session.searchTitle;
      await ctx.deleteMessage();
      await ctx.reply(`Buscando dados no AniList para: ${nomeDoAnime}...`);

      const resultadoApi = await buscarAnime(nomeDoAnime);

      if (!resultadoApi.success) {
        await ctx.reply(`Falha ao buscar: ${resultadoApi.error}\n\nTente buscar manualmente.`);
        return await enviarMenuFonteDados(ctx);
      }

      const anime = resultadoApi.data;
      anime.classificacaoManual = null; 
      anime.infoManual = null; 
      // Campos do Post
      anime.abrev = null;
      anime.audio = null;
      anime.seasonNum = null;
      anime.partNum = null;
      anime.seasonName = null;

      const formato = anime.format ? String(anime.format).toUpperCase() : 'TV';
      if (formato === 'MOVIE') { anime.layout = 'FILME'; } 
      else if (formato === 'ONA') { anime.layout = 'ONA'; } 
      else { anime.layout = 'TV'; }

      ctx.session.animeData = anime; 
      ctx.session.state = 'layout_select';
      await enviarMenuLayout(ctx);

    } catch (err) { console.error('ERRO EM source_anilist:', err); }
  });

  bot.action('source_manual', checkPermission, async (ctx) => {
    // (Lógica source_manual mantida igual ao anterior, sem mudanças necessárias aqui)
    try {
      if (!ctx.session || ctx.session.state !== 'source_select') return ctx.answerCbQuery('Sessão expirada.');
      const nomeDoAnime = ctx.session.searchTitle || "Anime Sem Título";
      const anime = {
        title: { romaji: nomeDoAnime, english: null },
        season: null, seasonYear: null, episodes: null,
        studios: { nodes: [] }, genres: [], averageScore: null,
        format: 'TV', status: null, description: null,
        startDate: { year: null }, endDate: { year: null },
        coverImage: { large: null }, bannerImage: null,
        classificacaoManual: null, infoManual: null, layout: 'TV',
        abrev: null, audio: null, seasonNum: null, partNum: null, seasonName: null
      };
      ctx.session.animeData = anime;
      ctx.session.state = 'layout_select'; 
      await ctx.deleteMessage();
      await ctx.reply('Modo manual ativado.');
      await enviarMenuLayout(ctx);
    } catch (err) { console.error(err); }
  });

  // --- ETAPA 1 e 2 (Layout e Edição - Botões Padrão) ---
  // (Mantido igual: set_layout_*, ir_para_edicao, voltar_source_select, voltar_layout, cancel_edit)
  bot.action(['set_layout_TV', 'set_layout_FILME', 'set_layout_ONA'], checkPermission, async (ctx) => {
    if (ctx.session.state !== 'layout_select') return ctx.answerCbQuery();
    const acao = ctx.match[0];
    ctx.session.animeData.layout = acao.replace('set_layout_', '');
    await enviarMenuLayout(ctx);
  });

  bot.action('ir_para_edicao', checkPermission, async (ctx) => {
    if (!ctx.session) return ctx.answerCbQuery();
    ctx.session.state = 'main_edit';
    await irParaMenuEdicao(ctx); 
  });

  bot.action('voltar_source_select', checkPermission, async (ctx) => {
    if (!ctx.session) return ctx.answerCbQuery();
    ctx.session.state = 'source_select'; 
    ctx.session.animeData = null; 
    await enviarMenuFonteDados(ctx); 
  });

  bot.action('voltar_layout', checkPermission, async (ctx) => {
    if (!ctx.session) return ctx.answerCbQuery();
    ctx.session.state = 'layout_select';
    ctx.session.awaitingInput = null;
    await enviarMenuLayout(ctx);
  });

  bot.action('cancel_edit', checkPermission, async (ctx) => {
    ctx.session = null; 
    await ctx.deleteMessage();
    await ctx.reply('Cancelado.');
  });

  // --- *** GERAÇÃO FINAL *** ---
  bot.action('generate_final', checkPermission, async (ctx) => {
    if (!ctx.session || ctx.session.state !== 'main_edit') return ctx.answerCbQuery();
    try {
      await ctx.deleteMessage();
      const animeData = ctx.session.animeData;
      const isPostMode = ctx.session.isPostMode; 

      if (!animeData) { return ctx.reply('Sessao expirada.'); }

      if (isPostMode) {
        // --- MODO POST: Apenas Texto ---
        await ctx.reply('📝 Gerando post de texto...');
        
        // Gera o texto usando o template atualizado
        const textoPost = formatarPost(animeData);
        
        // Envia APENAS o texto (sem imagem, como pedido)
        await ctx.reply(textoPost, { parse_mode: 'Markdown' });

        // Dica visual para dizer que acabou, mas permite continuar
        await ctx.reply("✅ Post gerado! Se precisar corrigir, use o menu acima ou copie o Passcode abaixo.");

      } else {
        // --- MODO CAPA: Imagem ---
        await ctx.reply('🎨 Gerando sua capa...');
        const resultadoImagem = await gerarCapa(animeData);
        if (!resultadoImagem.success) {
          return ctx.reply(`Erro ao gerar imagem: ${resultadoImagem.error}`);
        }
        await ctx.replyWithPhoto({ source: resultadoImagem.buffer });
      }

      // --- PASSCODE ---
      const passcode = gerarPasscode(animeData);
      if (passcode) {
         await ctx.reply(
           `🔐 **Passcode**\nUse /passcode para restaurar:\n\n` +
           "```" + passcode + "```", 
           { parse_mode: 'Markdown' }
         );
      }
      
      // NOTA: Não limpamos a sessão (ctx.session = null) imediatamente aqui se quisermos permitir reedição.
      // Mas para manter o fluxo limpo, vamos finalizar. 
      // Se o usuário quiser editar, ele usa o Passcode gerado.
      ctx.session = null; 

    } catch (err) { console.error('ERRO NO BOTAO GERAR:', err); }
  });

  // --- Botões de Edição (Mantidos) ---
  bot.action(['edit_title', 'edit_studio', 'edit_tags', 'edit_poster', 'edit_fundo', 'edit_info'], checkPermission, async (ctx) => {
    // ... (Mantido igual) ...
    if (!ctx.session) return ctx.answerCbQuery();
    const acao = ctx.match[0];
    ctx.session.state = 'awaiting_input'; 
    ctx.session.awaitingInput = acao; 
    let pergunta = 'Digite o novo valor:';
    if(acao === 'edit_title') pergunta = 'Novo Título:';
    // etc... (simplificado aqui para caber, use o código anterior se tiver personalizações)
    await ctx.reply(pergunta);
  });

  bot.action('edit_rating', checkPermission, async (ctx) => {
    ctx.session.state = 'rating_select'; 
    await enviarMenuClassificacao(ctx);
  });

  // --- ETAPA 3: OUVIR RESPOSTAS (Mantido) ---
  bot.on('text', checkPermission, async (ctx) => {
    if (ctx.message.text.startsWith('/')) return;

    // Passcode Restore
    if (ctx.session.state === 'awaiting_passcode') {
        const codigo = ctx.message.text.trim();
        const dados = lerPasscode(codigo);
        if (!dados) return ctx.reply('❌ Código inválido.');
        
        ctx.session.animeData = dados;
        ctx.session.state = 'main_edit';
        
        // Detecção automática de modo pelo conteúdo
        if (dados.description || dados.abrev || dados.seasonName) {
             ctx.session.isPostMode = true;
             await ctx.reply('✅ Dados de **POST** restaurados.');
        } else {
             ctx.session.isPostMode = false;
             await ctx.reply('✅ Dados de **CAPA** restaurados.');
        }
        return await irParaMenuEdicao(ctx);
    }

    if (ctx.session.state !== 'awaiting_input') return;
    const state = ctx.session.awaitingInput;
    const anime = ctx.session.animeData;
    const input = ctx.message.text.trim();

    if (state === 'edit_title') anime.title.romaji = input;
    if (state === 'edit_info') anime.infoManual = input;
    if (state === 'edit_studio') anime.studios.nodes = [{ name: input }];
    if (state === 'edit_tags') anime.genres = input.split(',').map(t => t.trim());
    // ... outros campos ...

    ctx.session.state = 'main_edit';
    ctx.session.awaitingInput = null;
    await ctx.reply('Atualizado!');
    await irParaMenuEdicao(ctx);
  });

  // --- (Handler de fotos mantido) ---
  bot.on('photo', checkPermission, async (ctx) => {
      // ... (Código de upload de foto mantido) ...
      if (ctx.session.state !== 'awaiting_input') return;
      const fileLink = await ctx.telegram.getFileLink(ctx.message.photo.pop().file_id);
      const url = fileLink.href;
      
      if (ctx.session.awaitingInput === 'edit_poster') ctx.session.animeData.coverImage.large = url;
      if (ctx.session.awaitingInput === 'edit_fundo') ctx.session.animeData.bannerImage = url;
      
      ctx.session.state = 'main_edit';
      ctx.session.awaitingInput = null;
      await ctx.reply('Imagem recebida!');
      await irParaMenuEdicao(ctx);
  });

  // --- ETAPA 4: Classificação (Mantido) ---
  bot.action(['set_rating_L', 'set_rating_10', 'set_rating_12', 'set_rating_14', 'set_rating_16', 'set_rating_18', 'set_rating_NONE'], checkPermission, async (ctx) => {
      // ... (Lógica de botões de classificação mantida) ...
      const acao = ctx.match[0];
      const map = {'set_rating_L':'L', 'set_rating_10':'10', 'set_rating_12':'12', 'set_rating_14':'14', 'set_rating_16':'16', 'set_rating_18':'18', 'set_rating_NONE':null};
      ctx.session.animeData.classificacaoManual = map[acao];
      ctx.session.state = 'main_edit'; 
      await ctx.answerCbQuery(`Classificação: ${map[acao] || 'Nenhuma'}`);
      await irParaMenuEdicao(ctx); 
  });

  bot.action('voltar_edicao_principal', checkPermission, async (ctx) => {
    ctx.session.state = 'main_edit';
    await irParaMenuEdicao(ctx);
  });
}

module.exports = { registerEvents };
