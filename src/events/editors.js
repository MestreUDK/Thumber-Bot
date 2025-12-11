// ARQUIVO: src/events/editors.js

const { enviarMenuClassificacao } = require('../menus/index.js');
const { lerPasscode } = require('../passcode.js');
const { irParaMenuEdicao } = require('./common.js');

module.exports = (bot, checkPermission) => {

  // --- LISTA DE BOTÕES DE EDIÇÃO (Texto e Imagem) ---
  const botoesEdicao = [
      // Capa
      'edit_title', 'edit_studio', 'edit_tags', 'edit_poster', 'edit_fundo', 'edit_info',
      // Post
      'edit_abrev', 'edit_audio', 'edit_synopsis', 
      'edit_season_num', 'edit_episodes', 'edit_part_num', 'edit_season_name',
      // Novos Manuais
      'edit_alt_name', 'edit_year', 'edit_season', 'edit_type', 'edit_status',
      'edit_season_url' // <-- O Novo botão de Link
  ];

  // --- HANDLER DOS BOTÕES ---
  bot.action(botoesEdicao, checkPermission, async (ctx) => {
    if (!ctx.session || ctx.session.state !== 'main_edit') return ctx.answerCbQuery();
    const acao = ctx.match[0];
    ctx.session.state = 'awaiting_input'; 
    ctx.session.awaitingInput = acao; 
    
    let pergunta = 'Digite o novo valor:';
    
    // --- Perguntas Personalizadas ---
    
    // Identificação
    if(acao === 'edit_title') pergunta = 'Digite o novo **Título**:';
    if(acao === 'edit_alt_name') pergunta = 'Digite o **Nome Alternativo** (Ex: Attack on Titan):';
    if(acao === 'edit_info') pergunta = 'Digite a nova **Info** (Topo):';
    if(acao === 'edit_abrev') pergunta = 'Digite a **Abreviação** (Ex: #Fumetsu):';
    
    // Dados Técnicos
    if(acao === 'edit_year') pergunta = 'Digite o **Ano** (Ex: 2024 ou 2023 à 2024):';
    if(acao === 'edit_season') pergunta = 'Digite a **Temporada** (Texto Visual, ex: Outono 2024):';
    if(acao === 'edit_season_url') pergunta = 'Envie o **Link (URL)** para a Temporada (Ex: https://t.me/...):';
    if(acao === 'edit_type') pergunta = 'Digite o **Tipo** (Ex: #TV ou #Filme):';
    if(acao === 'edit_status') pergunta = 'Digite o **Status** (Ex: Completo):';
    if(acao === 'edit_audio') pergunta = 'Digite o **Áudio** (Ex: #legendado | #dublado):';
    
    // Dados da Obra
    if(acao === 'edit_season_num') pergunta = 'Digite o **Número da Temporada** (Ex: 2):';
    if(acao === 'edit_episodes') pergunta = 'Digite a **Quantidade de Episódios**:';
    if(acao === 'edit_part_num') pergunta = 'Digite o **Número da Parte** (Ex: 1):';
    if(acao === 'edit_season_name') pergunta = 'Digite o **Nome da Temporada** (Ex: Arc de Shibuya):';
    if(acao === 'edit_synopsis') pergunta = 'Digite a **Sinopse**:';

    // Padrões
    if(acao === 'edit_studio') pergunta = 'Digite o novo **Estúdio**:';
    if(acao === 'edit_tags') pergunta = 'Digite as **Tags** (separadas por vírgula):';

    // Imagens
    if(acao === 'edit_poster') pergunta = 'Envie a imagem ou link do **Pôster**:';
    if(acao === 'edit_fundo') pergunta = 'Envie a imagem ou link do **Fundo**:';

    await ctx.reply(pergunta, { parse_mode: 'Markdown' });
  });

  // --- BOTÃO DE RATING ---
  bot.action('edit_rating', checkPermission, async (ctx) => {
    ctx.session.state = 'rating_select'; 
    await enviarMenuClassificacao(ctx);
  });

  // --- RECEBIMENTO DE TEXTO ---
  bot.on('text', checkPermission, async (ctx) => {
    if (ctx.message.text.startsWith('/')) return;

    // 1. RESTAURAR PASSCODE
    if (ctx.session.state === 'awaiting_passcode') {
        const codigo = ctx.message.text.trim();
        const dados = lerPasscode(codigo);
        if (!dados) return ctx.reply('❌ Código inválido.');
        
        ctx.session.animeData = dados;
        ctx.session.state = 'main_edit';
        
        // Detecção de modo (Post vs Capa)
        if (dados.mode === 'p') {
             ctx.session.isPostMode = true;
             await ctx.reply('✅ Dados de **POST** identificados e restaurados.');
        } else if (dados.mode === 'c') {
             ctx.session.isPostMode = false;
             await ctx.reply('✅ Dados de **CAPA** identificados e restaurados.');
        } else {
             // Fallback para códigos antigos
             if (dados.description || dados.abrev) {
                 ctx.session.isPostMode = true;
                 await ctx.reply('⚠️ Passcode antigo: Detectado como **POST**.');
             } else {
                 ctx.session.isPostMode = false;
                 await ctx.reply('⚠️ Passcode antigo: Detectado como **CAPA**.');
             }
        }
        return await irParaMenuEdicao(ctx);
    }

    // 2. EDIÇÃO DE CAMPOS
    if (ctx.session.state !== 'awaiting_input' || !ctx.session.animeData) return;
    const state = ctx.session.awaitingInput;
    const anime = ctx.session.animeData;
    const input = ctx.message.text.trim();

    // --- Mapeamento Geral ---
    if (state === 'edit_title') anime.title.romaji = input;
    if (state === 'edit_info') anime.infoManual = input;
    if (state === 'edit_studio') anime.studios.nodes = [{ name: input }];
    if (state === 'edit_tags') anime.genres = input.split(',').map(t => t.trim());
    
    // --- Campos Específicos do Post ---
    if (state === 'edit_abrev') anime.abrev = input;
    if (state === 'edit_audio') anime.audio = input;
    if (state === 'edit_synopsis') anime.description = input;
    if (state === 'edit_season_num') anime.seasonNum = input;
    if (state === 'edit_episodes') anime.episodes = input;
    if (state === 'edit_part_num') anime.partNum = input;
    if (state === 'edit_season_name') anime.seasonName = input;

    // --- Novos Campos Manuais ---
    if (state === 'edit_alt_name') anime.title.english = input;
    if (state === 'edit_year') anime.yearManual = input;
    if (state === 'edit_type') anime.typeManual = input;
    if (state === 'edit_status') anime.statusManual = input;
    if (state === 'edit_season') anime.seasonManual = input; // Texto da temporada
    if (state === 'edit_season_url') anime.seasonUrl = input; // Link da temporada

    // --- Imagens via Link ---
    if (state === 'edit_poster') {
        if (!anime.coverImage) anime.coverImage = {};
        anime.coverImage.large = input;
    }
    if (state === 'edit_fundo') anime.bannerImage = input;

    ctx.session.state = 'main_edit';
    ctx.session.awaitingInput = null;
    await ctx.reply('✅ Atualizado!');
    await irParaMenuEdicao(ctx);
  });

  // --- RECEBIMENTO DE FOTOS (UPLOAD) ---
  bot.on('photo', checkPermission, async (ctx) => {
      if (ctx.session.state !== 'awaiting_input') return;
      const state = ctx.session.awaitingInput;
      if (state !== 'edit_poster' && state !== 'edit_fundo') return;
      
      const fileLink = await ctx.telegram.getFileLink(ctx.message.photo.pop().file_id);
      const url = fileLink.href;
      
      if (state === 'edit_poster') {
          if (!ctx.session.animeData.coverImage) ctx.session.animeData.coverImage = {};
          ctx.session.animeData.coverImage.large = url;
      }
      if (state === 'edit_fundo') ctx.session.animeData.bannerImage = url;
      
      ctx.session.state = 'main_edit';
      ctx.session.awaitingInput = null;
      await ctx.reply('✅ Imagem recebida!');
      await irParaMenuEdicao(ctx);
  });
};
