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
      
      // --- *** MELHORIA: Salva o Modo no objeto para o Passcode *** ---
      // 'p' para Post, 'c' para Capa
      animeData.mode = isPostMode ? 'p' : 'c';
      // -----------------------------------------------------------

      if (isPostMode) {
        // --- MODO POST: Apenas Texto (Sem Imagem) ---
        await ctx.reply('📝 Gerando post de texto...');
        
        const textoPost = formatarPost(animeData);
        
        // Envia o texto formatado.
        // disable_web_page_preview: true -> Evita que o link da temporada gere aquela prévia gigante do site.
        await ctx.reply(textoPost, { 
            parse_mode: 'Markdown', 
            disable_web_page_preview: true 
        });
        
        await ctx.reply("✅ Post gerado! Copie o Passcode abaixo.");

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
      // Agora o passcode gerado incluirá o "mode" que definimos acima
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
