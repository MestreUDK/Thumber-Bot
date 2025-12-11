// ARQUIVO: src/events/generation.js
const { gerarCapa } = require('../image.js');
const { formatarPost } = require('../templates/post.js');
const { gerarPasscode } = require('../passcode.js');

module.exports = (bot, checkPermission) => {
  
  bot.action('generate_final', checkPermission, async (ctx) => {
    if (!ctx.session || ctx.session.state !== 'main_edit') return ctx.answerCbQuery();
    try {
      await ctx.deleteMessage();
      const animeData = ctx.session.animeData;
      const isPostMode = ctx.session.isPostMode; 

      if (!animeData) return ctx.reply('Sessão expirada.');
      
      // --- *** NOVO: Salva o Modo no objeto para o Passcode *** ---
      // 'p' para Post, 'c' para Capa
      animeData.mode = isPostMode ? 'p' : 'c';
      // -----------------------------------------------------------

      if (isPostMode) {
        await ctx.reply('📝 Gerando post de texto...');
        const textoPost = formatarPost(animeData);
        // Tenta enviar com imagem se tiver
        if (animeData.coverImage && animeData.coverImage.large) {
             try {
                await ctx.replyWithPhoto(animeData.coverImage.large, { caption: textoPost, parse_mode: 'Markdown' });
             } catch(e) {
                await ctx.reply(textoPost, { parse_mode: 'Markdown' });
             }
        } else {
             await ctx.reply(textoPost, { parse_mode: 'Markdown' });
        }
        await ctx.reply("✅ Post gerado! Copie o Passcode abaixo.");
      } else {
        await ctx.reply('🎨 Gerando sua capa...');
        const resultadoImagem = await gerarCapa(animeData);
        if (!resultadoImagem.success) {
          return ctx.reply(`Erro ao gerar imagem: ${resultadoImagem.error}`);
        }
        await ctx.replyWithPhoto({ source: resultadoImagem.buffer });
      }

      // Gera passcode (agora inclui o .mode)
      const passcode = gerarPasscode(animeData);
      if (passcode) {
         await ctx.reply(
           `🔐 **Passcode**\nUse /passcode para restaurar:\n\n` +
           "```" + passcode + "```", 
           { parse_mode: 'Markdown' }
         );
      }
      ctx.session = null; 

    } catch (err) { console.error('ERRO NO BOTAO GERAR:', err); }
  });
};
