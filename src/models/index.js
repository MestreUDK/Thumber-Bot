// ARQUIVO: src/models/index.js
// (Apenas exporta todos os nossos modelos)

const modeloTV = require('./tv.js');
const modeloONA = require('./ona.js');
const modeloFilme = require('./filme.js');

module.exports = {
  TV: modeloTV.draw,
  ONA: modeloONA.draw,
  FILME: modeloFilme.draw,
};
