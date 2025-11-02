// ARQUIVO: anilist.js
// (Responsavel por toda a logica da API)

const fs = require('fs');
const path = require('path');
const axios = require('axios');

// --- TENTATIVA DE CORRECAO DO ERRO 400 ---
// Lemos o arquivo e usamos .trim() para limpar qualquer
// caractere invisivel que possa estar quebrando a query
let ANILIST_QUERY;
try {
  const queryPath = path.join(__dirname, 'query.graphql');
  ANILIST_QUERY = fs.readFileSync(queryPath, 'utf-8').trim();
} catch (err) {
  console.error('ERRO FATAL: Nao foi possivel ler o arquivo query.graphql!', err);
  process.exit(1);
}
// --- FIM DA TENTATIVA DE CORRECAO ---

async function buscarAnime(nome) {
  const variables = {
    search: nome
  };

  try {
    const response = await axios.post('https://graphql.anilist.co', {
      query: ANILIST_QUERY,
      variables: variables
    }, {
      // Headers para garantir que estamos falando JSON
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json' 
      }
    });

    if (!response.data.data || !response.data.data.Media) {
      return { success: false, error: 'Anime nao encontrado pela API.' };
    }
    return { success: true, data: response.data.data.Media };

  } catch (error) {
    console.error(`Erro GERAL no axios:`, error.message);
    let errorMsg = error.message;
    
    // Se a API deu uma resposta de erro (como 400), vamos ver
    if (error.response && error.response.data) {
        console.error('Detalhes do Erro da API:', error.response.data);
        errorMsg = JSON.stringify(error.response.data);
    }
    return { success: false, error: errorMsg };
  }
}

module.exports = { buscarAnime };
