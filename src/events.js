
// ARQUIVO: src/events.js
// (Atualizado para lidar com UPLOAD DE FOTOS)

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
      
      ctx.session = null;
      return ctx.replyWithPhoto({ source: resultadoImagem.buffer });

    } catch (err) {
      console.error('ERRO NO BOTAO GERAR:', err);
      return ctx.reply(`Ocorreu um erro critico: ${err.message}`);
    }
  });

  // Botao [Cancelar]
  bot.action('cancel_edit', async (ctx) => {
    ctx.session = null;
    await ctx.deleteMessage();
    await ctx.reply('Geracao cancelada.');
  });

  // Botoes de Edicao (Texto e Imagem)
  bot.action(['edit_title', 'edit_studio', 'edit_tags', 'edit_rating', 'edit_poster', 'edit_fundo'], async (ctx) => {
    try {
      const acao = ctx.match[0];
      ctx.session.awaitingInput = acao; 
      
      let pergunta = 'O que voce quer colocar?';
      if (acao === 'edit_title') pergunta = 'Digite o novo **Titulo**';
      if (acao === 'edit_studio') pergunta = 'Digite o novo **Estudio**';
      if (acao === 'edit_tags') pergunta = 'Digite as novas **Tags** (separadas por virgula)';
      if (acao === 'edit_rating') pergunta = 'Digite a **Classificacao** (ex: 16)';
      
      // --- *** MUDANCA: Mensagem para pedir link OU UPLOAD *** ---
      if (acao === 'edit_poster') pergunta = 'Envie o **link (URL)** OU faça o **UPLOAD** da nova imagem do Pôster';
      if (acao === 'edit_fundo') pergunta = 'Envie o **link (URL)** OU faça o **UPLOAD** da nova imagem de Fundo';
      
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

      // Se o usuario mandar texto para uma edicao de imagem (um link)
      if (state === 'edit_poster') {
        if (!animeData.coverImage) animeData.coverImage = {};
        animeData.coverImage.large = userInput;
      } else if (state === 'edit_fundo') {
        animeData.bannerImage = userInput;
      }
      // Edicao de texto normal
      else if (state === 'edit_title') {
        animeData.title.romaji = userInput;
      } else if (state === 'edit_studio') {
        animeData.studios.nodes = [{ name: userInput }]; 
      } else if (state === 'edit_tags') {
        animeData.genres = userInput.split(',').map(tag => tag.trim());
      } else if (state === 'edit_rating') {
        animeData.classificacaoManual = userInput;
      }

      ctx.session.awaitingInput = null;
      ctx.session.animeData = animeData;
      
      await ctx.reply('Dados atualizados!');
      await enviarConfirmacao(ctx);

    } catch (err) {
      console.error('ERRO AO PROCESSAR TEXTO:', err);
      return ctx.reply(`Ocorreu um erro critico: ${err.message}`);
    }
  });

  // --- *** NOVO: OUVIR AS RESPOSTAS DE FOTO (UPLOAD) *** ---
  bot.on('photo', async (ctx) => {
    try {
      // Verifica se o bot esta esperando uma foto
      if (!ctx.session || !ctx.session.awaitingInput || !ctx.session.animeData) {
        return; // Nao esta esperando, ignora a foto
      }
      
      const state = ctx.session.awaitingInput;
      const animeData = ctx.session.animeData;
      
      // Verifica se esta esperando um poster ou fundo
      if (state !== 'edit_poster' && state !== 'edit_fundo') {
        return; // Esta esperando texto, mas recebeu foto. Ignora.
      }
      
      // Pega a foto que o usuario enviou (a de melhor qualidade)
      const photo = ctx.message.photo.pop();
      // Pega o link interno do Telegram para essa foto
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
      
      ctx.session.awaitingInput = null;
      ctx.session.animeData = animeData;
      await enviarConfirmacao(ctx); // Mostra os botoes de novo
      
    } catch (err) {
      console.error('ERRO AO PROCESSAR FOTO:', err);
      return ctx.reply(`Ocorreu um erro critico ao processar a foto: ${err.message}`);
    }
  });
}

module.exports = { registerEvents };
