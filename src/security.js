// ARQUIVO: src/security.js
// (Nosso modulo de seguranca com Admin e Whitelist)

// Le os IDs do arquivo .env
const ADMIN_ID = process.env.ADMIN_ID;
const WHITELIST = process.env.WHITELIST || ''; // Default para string vazia

// Cria um 'Set' (uma lista de alta performance) para checagem rapida
const allowedIds = new Set();
if (ADMIN_ID) {
    allowedIds.add(String(ADMIN_ID));
}

// Adiciona todos os IDs da whitelist ao Set
WHITELIST.split(',') // Transforma "1,2,3" em ["1", "2", "3"]
    .filter(id => id) // Remove itens vazios
    .forEach(id => allowedIds.add(id.trim()));

console.log(`[Seguranca] Admin ID: ${ADMIN_ID}`);
console.log(`[Seguranca] IDs com permissao: ${Array.from(allowedIds).join(', ')}`);

// --- O Middleware de "Porteiro" ---
const checkPermission = (ctx, next) => {
  const userId = String(ctx.from.id);

  if (allowedIds.has(userId)) {
    // Se o ID esta na lista (Admin ou Whitelist), deixa passar
    return next(); 
  }

  // Se for um estranho
  const username = ctx.from.username || 'N/A';
  console.log(`[Seguranca] Acesso BLOQUEADO: ID=${userId}, Nome=${username}`);
  return ctx.reply('Desculpe, voce nao tem permissao para usar este bot.');
};

module.exports = { 
  checkPermission, // O "Porteiro"
  allowedIds // A lista de quem pode entrar (para o /start)
};
