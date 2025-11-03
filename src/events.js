// ARQUIVO: src/events.js
// (Atualizado para lidar com botoes de layout)

const { gerarCapa } = require('./image.js');
const { enviarConfirmacao } = require('./confirmation.js');

function registerEvents(bot, checkPermission) {

  // Botao [Gerar Capa Agora!]
  bot.action('generate_final', checkPermission, async (ctx) => { /* ... (sem mudancas) ... */ });

  // Botao [Cancelar]
  bot.action('cancel_edit', checkPermission, async (ctx) => { /* ... (sem mudancas) ... */ });

  // Botoes de Edicao de Texto e Imagem
  bot.action(['edit_title', 'edit_studio', 'edit_tags', 'edit_rating', 'edit_poster', 'edit_fundo'], checkPermission, async (ctx) => { /* ... (sem mudancas) ... */ });

  
  // --- *** NOVO: BOTOES DE LAYOUT *** ---
  bot.action(['set_layout_TV', 'set_layout_FILME', 'set_layout_ONA'], checkPermission, async (ctx) => {
    if (!ctx.session.animeData) {
        return ctx.reply('Sessao expirada, use /capa novamente.');
    }
    
    const acao = ctx.match[0]; // ex: 'set_layout_TV'
    const novoLayout = acao.replace('set_layout_', ''); // ex: 'TV'
    
    ctx.session.animeData.layout = novoLayout;
    
    await ctx.reply(`Layout alterado para: ${novoLayout}`);
    await enviarConfirmacao(ctx); // Re-envia o menu
  });
  
  
  // OUVIR AS RESPOSTAS DE TEXTO (EDICAO)
  bot.on('text', checkPermission, async (ctx) => {
    try {
      if (ctx.message.text.startsWith('/')) {
        return;
      }
      if (!ctx.session || !ctx.session.awaitingInput || !ctx.session.animeData) {
        return ctx.reply('Nao entendi. Se quiser editar, clique em um botao primeiro.');
      }
      // ... (resto do codigo sem mudancas) ...
    } catch (err) { /* ... */ }
  });

  // OUVIR AS RESPOSTAS DE FOTO (UPLOAD)
  bot.on('photo', checkPermission, async (ctx) => {
    try {
      if (!ctx.session || !ctx.session.awaitingInput || !ctx.session.animeData) {
        return; 
      }
      // ... (resto do codigo sem mudancas) ...
    } catch (err) { /* ... */ }
  });
}

module.exports = { registerEvents };
