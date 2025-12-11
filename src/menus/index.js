// Arquivo: src/menus/index.js

const sources = require('./sources.js');
const layout = require('./layout.js');
const editors = require('./editors.js');
const ratings = require('./ratings.js');

module.exports = {
  ...sources,
  ...layout,
  ...editors,
  ...ratings
};
