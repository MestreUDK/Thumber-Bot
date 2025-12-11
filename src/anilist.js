// ARQUIVO: src/anilist.js
const fs = require('fs');
const path = require('path');
const axios = require('axios');

let ANILIST_QUERY;
try {
  const queryPath = path.join(__dirname, '..', 'query.graphql');
  ANILIST_QUERY = fs.readFileSync(queryPath, 'utf-8').trim();
} catch (err) {
  console.error('ERRO FATAL: Nao foi possivel ler o arquivo query.graphql!', err);
  process.exit(1);
}

async function buscarAnime(nome) {
  const variables = { search: nome };

  try {
    const response = await axios.post('https://graphql.anilist.co', {
      query: ANILIST_QUERY,
      variables: variables
    }, {
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
    // --- CORREÇÃO DO ERRO 404 ---
    if (error.response && error.response.status === 404) {
        return { success: false, error: 'Anime não encontrado (404).' };
    }
    console.error(`Erro GERAL no axios:`, error.message);
    let errorMsg = error.message;
    if (error.response && error.response.data) {
        errorMsg = JSON.stringify(error.response.data);
    }
    return { success: false, error: errorMsg };
  }
}

module.exports = { buscarAnime };
