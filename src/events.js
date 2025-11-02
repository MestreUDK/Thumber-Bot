// ARQUIVO: src/events.js
// (Atualizado para lidar com edicao de imagens)

const { gerarCapa } = require('./image.js');
const { enviarConfirmacao } = require('./confirmation.js');

function registerEvents(bot) {

  // Botao [Gerar Capa Agora!]
  bot.action('generate_final', async (ctx) => {
    try {
      await ctx.deleteMessage(); 
      await ctx.reply('Gerando sua capa com os dados editados...');
      
      const animeData = ctx.session.animeData;
      if (!animeData) {
        return ctx.reply('Sessao expirada. Faca a busca novamente.');
      }

      const resultadoImagem = await gerarCapa(animeData);

      if (!resultadoImagem.success) {
        return ctx.reply(`Erro ao gerar imagem: ${resultadoImagem.error}`);
      }
      
      ctx.session = null; // Limpa a sessao
      return ctx.replyWithPhoto({ source: resultadoImagem.buffer });

    } catch (err) {
      console.error('ERRO NO BOTAO GERAR:', err);
      return ctx.reply(`Ocorreu um erro critico: ${err.message}`);
    }
  });

  // Botao [Cancelar]
  bot.action('cancel_edit', async (ctx) => {
    ctx.session = null; // Limpa a sessao
    await ctx.deleteMessage();
    await ctx.reply('Geracao cancelada.');
  });

  // --- *** MUDANCA: ADICIONADO 'edit_poster' e 'edit_fundo' *** ---
  bot.action(['edit_title', 'edit_studio', 'edit_tags', 'edit_rating', 'edit_poster', 'edit_fundo'], async (ctx) => {
    try {
      const acao = ctx.match[0];
      ctx.session.awaitingInput = acao; 
      
      let pergunta = 'O que voce quer colocar?';
      if (acao === 'edit_title') pergunta = 'Digite o novo **Titulo** (ex: Fumetsu no Anata e (3a TEMP))';
      if (acao === 'edit_studio') pergunta = 'Digite o novo **Estudio** (ex: Drive | Studio Massket)';
      if (acao === 'edit_tags') pergunta = 'Digite as novas **Tags** (separadas por virgula, ex: Aventura, Shounen, Drama)';
      if (acao === 'edit_rating') pergunta = 'Digite a **Classificacao** (ex: 16, 18, L)';
      if (acao === 'edit_poster') pergunta = 'Envie o **link (URL)** da nova imagem do Pôster (a imagem da direita)';
      if (acao === 'edit_fundo') pergunta = 'Envie o **link (URL)** da nova imagem de Fundo';
      
      await ctx.reply(pergunta);
    } catch (err) {
      console.error('ERRO NO BOTAO EDITAR:', err);
    }
  });


  // OUVIR AS RESPOSTAS DE TEXTO (EDICAO)
  bot.on('text', async (ctx) => {
    try {
      if (!ctx.session || !ctx.session.awaitingInput || !ctx.session.animeData) {
        return;
      }

      const state = ctx.session.awaitingInput;
      const animeData = ctx.session.animeData;
      const userInput = ctx.message.text.trim();

      if (state === 'edit_title') {
        animeData.title.romaji = userInput;
      }
      if (state === 'edit_studio') {
        animeData.studios.nodes = [{ name: userInput }]; 
      }
      if (state === 'edit_tags') {
        animeData.genres = userInput.split(',').map(tag => tag.trim());
      }
      if (state === 'edit_rating') {
        animeData.classificacaoManual = userInput;
      }
      // --- *** MUDANCA: Salva os links das imagens *** ---
      if (state === 'edit_poster') {
        // (O 'animeData.coverImage' pode nao existir, entao criamos)
        if (!animeData.coverImage) animeData.coverImage = {};
        animeData.coverImage.large = userInput;
      }
      if (state === 'edit_fundo') {
        animeData.bannerImage = userInput;
      }

      ctx.session.awaitingInput = null;
      ctx.session.animeData = animeData;
      
      await ctx.reply('Dados atualizados!');
      await enviarConfirmacao(ctx); // Mostra os botoes de novo

    } catch (err) {
      console.error('ERRO AO PROCESSAR TEXTO:', err);
      return ctx.reply(`Ocorreu um erro critico: ${err.message}`);
    }
  });
}

module.exports = { registerEvents };
