// ARQUIVO: src/events/editors.js
// ATUALIZADO (v1.5.0 - Roadmap Etapa 1: Mostrar valor atual ao editar)

const { enviarMenuClassificacao } = require('../menus/index.js');
const { lerPasscode } = require('../passcode.js');
const { irParaMenuEdicao } = require('./common.js');

module.exports = (bot, checkPermission) => {

  // --- LISTA DE BOTÕES DE EDIÇÃO (Texto e Imagem) ---
  const botoesEdicao = [
      // Capa (Campos Clássicos)
      'edit_title', 'edit_studio', 'edit_tags', 'edit_poster', 'edit_fundo', 'edit_info',
      // Post (Campos Específicos)
      'edit_abrev', 'edit_audio', 'edit_synopsis', 
      'edit_season_num', 'edit_episodes', 'edit_part_num', 'edit_season_name',
      // Novos Campos Manuais (v1.4.5+)
      'edit_alt_name', 'edit_year', 'edit_season', 'edit_type', 'edit_status',
      'edit_season_url'
  ];

  // --- HANDLER DOS BOTÕES (AGORA MOSTRA O VALOR ATUAL) ---
  bot.action(botoesEdicao, checkPermission, async (ctx) => {
    if (!ctx.session || ctx.session.state !== 'main_edit') return ctx.answerCbQuery();
    
    const acao = ctx.match[0];
    const dados = ctx.session.animeData; // Pega os dados salvos na sessão
    
    ctx.session.state = 'awaiting_input'; 
    ctx.session.awaitingInput = acao; 
    
    // 1. Lógica para descobrir qual valor mostrar baseado no botão clicado
    let valorAtual = "Vazio / Não definido";
    let nomeCampo = "Valor";

    // --- Mapeamento Inteligente ---
    // Identificação
    if(acao === 'edit_title') {
        nomeCampo = "Título Principal";
        valorAtual = dados.title.romaji;
    }
    else if(acao === 'edit_alt_name') {
        nomeCampo = "Nome Alternativo";
        valorAtual = dados.title.english;
    }
    else if(acao === 'edit_info') {
        nomeCampo = "Info (Topo)";
        valorAtual = dados.infoManual;
    }
    else if(acao === 'edit_abrev') {
        nomeCampo = "Abreviação";
        valorAtual = dados.abrev;
    }
    
    // Padrões (Estúdio e Tags precisam de tratamento especial pois são objetos/arrays)
    else if(acao === 'edit_studio') {
        nomeCampo = "Estúdio";
        valorAtual = (dados.studios && dados.studios.nodes[0]) ? dados.studios.nodes[0].name : null;
    }
    else if(acao === 'edit_tags') {
        nomeCampo = "Tags";
        valorAtual = (dados.genres) ? dados.genres.join(', ') : null;
    }
    
    // Dados Técnicos
    else if(acao === 'edit_year') { nomeCampo = "Ano"; valorAtual = dados.yearManual; }
    else if(acao === 'edit_season') { nomeCampo = "Temporada (Texto)"; valorAtual = dados.seasonManual; }
    else if(acao === 'edit_season_url') { nomeCampo = "Link da Temporada"; valorAtual = dados.seasonUrl; }
    else if(acao === 'edit_type') { nomeCampo = "Tipo"; valorAtual = dados.typeManual; }
    else if(acao === 'edit_status') { nomeCampo = "Status"; valorAtual = dados.statusManual; }
    else if(acao === 'edit_audio') { nomeCampo = "Áudio"; valorAtual = dados.audio; }
    
    // Dados da Obra
    else if(acao === 'edit_season_num') { nomeCampo = "Nº Temporada"; valorAtual = dados.seasonNum; }
    else if(acao === 'edit_episodes') { nomeCampo = "Qtd Episódios"; valorAtual = dados.episodes; }
    else if(acao === 'edit_part_num') { nomeCampo = "Nº Parte"; valorAtual = dados.partNum; }
    else if(acao === 'edit_season_name') { nomeCampo = "Nome da Temporada"; valorAtual = dados.seasonName; }
    else if(acao === 'edit_synopsis') { nomeCampo = "Sinopse"; valorAtual = dados.description; }

    // Imagens (Mostra a URL)
    else if(acao === 'edit_poster') { nomeCampo = "URL do Pôster"; valorAtual = dados.coverImage?.large; }
    else if(acao === 'edit_fundo') { nomeCampo = "URL do Banner"; valorAtual = dados.bannerImage; }

    // Tratamento estético para nulos
    if (!valorAtual) valorAtual = "_(Vazio)_";

    // 2. Monta a mensagem visual
    const mensagem = `
✏️ **Editando: ${nomeCampo}**

Valor Atual:
\`${valorAtual}\`

👇 **Digite o novo valor abaixo:**
_(Ou envie /cancelar para não alterar)_
`;

    // Se for Sinopse (texto grande), enviamos sem bloco de código para facilitar a leitura
    if (acao === 'edit_synopsis') {
         await ctx.reply(`✏️ **Editando Sinopse**\n\n**Atual:**\n${valorAtual}\n\n👇 Digite a nova sinopse:`, { parse_mode: 'Markdown' });
    } else {
         await ctx.reply(mensagem, { parse_mode: 'Markdown' });
    }
  });

  // --- BOTÃO DE RATING ---
  bot.action('edit_rating', checkPermission, async (ctx) => {
    ctx.session.state = 'rating_select'; 
    await enviarMenuClassificacao(ctx);
  });

  // --- RECEBIMENTO DE TEXTO ---
  bot.on('text', checkPermission, async (ctx) => {
    if (ctx.message.text.startsWith('/')) return;
    
    // Comando de cancelar edição
    if (ctx.session.state === 'awaiting_input' && ctx.message.text.trim().toLowerCase() === '/cancelar') {
        ctx.session.state = 'main_edit';
        ctx.session.awaitingInput = null;
        await ctx.reply('Operação cancelada.');
        return await irParaMenuEdicao(ctx);
    }

    // 1. RESTAURAR PASSCODE (Mantendo a limpeza do v1.4.9)
    if (ctx.session.state === 'awaiting_passcode') {
        const codigoRaw = ctx.message.text;
        // Limpeza de caracteres invisíveis/quebras de linha do Telegram
        const codigo = codigoRaw.replace(/[^a-zA-Z0-9\-_]/g, '');
        
        const dados = lerPasscode(codigo);
        if (!dados) return ctx.reply('❌ Código inválido ou corrompido.');
        
        ctx.session.animeData = dados;
        ctx.session.state = 'main_edit';
        
        if (dados.mode === 'p') {
             ctx.session.isPostMode = true;
             await ctx.reply('✅ Dados de **POST** restaurados.');
        } else if (dados.mode === 'c') {
             ctx.session.isPostMode = false;
             await ctx.reply('✅ Dados de **CAPA** restaurados.');
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

    // 2. EDIÇÃO DE CAMPOS (Salvar o novo valor)
    if (ctx.session.state !== 'awaiting_input' || !ctx.session.animeData) return;
    const state = ctx.session.awaitingInput;
    const anime = ctx.session.animeData;
    const input = ctx.message.text.trim();

    // Mapeamento Geral
    if (state === 'edit_title') anime.title.romaji = input;
    if (state === 'edit_info') anime.infoManual = input;
    if (state === 'edit_studio') anime.studios.nodes = [{ name: input }];
    if (state === 'edit_tags') anime.genres = input.split(',').map(t => t.trim());
    
    // Post
    if (state === 'edit_abrev') anime.abrev = input;
    if (state === 'edit_audio') anime.audio = input;
    if (state === 'edit_synopsis') anime.description = input;
    if (state === 'edit_season_num') anime.seasonNum = input;
    if (state === 'edit_episodes') anime.episodes = input;
    if (state === 'edit_part_num') anime.partNum = input;
    if (state === 'edit_season_name') anime.seasonName = input;

    // Manuais e Link
    if (state === 'edit_alt_name') anime.title.english = input;
    if (state === 'edit_year') anime.yearManual = input;
    if (state === 'edit_type') anime.typeManual = input;
    if (state === 'edit_status') anime.statusManual = input;
    if (state === 'edit_season') anime.seasonManual = input;
    if (state === 'edit_season_url') anime.seasonUrl = input;

    // Imagens
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

  // FOTOS (Mantido igual)
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