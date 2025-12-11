// Arquivo: src/events/generation.js

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

      if (isPostMode) {
        // --- MODO POST: Apenas Texto ---
        await ctx.reply('📝 Gerando post de texto...');
        const textoPost = formatarPost(animeData);
        await ctx.reply(textoPost, { parse_mode: 'Markdown' });
        await ctx.reply("✅ Post gerado! Se precisar corrigir, use o menu anterior ou o Passcode.");

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
      ctx.session = null; 

    } catch (err) { console.error('ERRO NO BOTAO GERAR:', err); }
  });
};
