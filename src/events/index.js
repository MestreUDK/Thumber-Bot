// ARQUIVO: src/events/index.js
// Este arquivo carrega todos os submódulos de eventos

const registerSources = require('./sources.js');
const registerLayout = require('./navigation.js');
const registerEditors = require('./editors.js');
const registerRating = require('./rating.js');
const registerGeneration = require('./generation.js');

function registerEvents(bot, checkPermission) {
    registerSources(bot, checkPermission);
    registerLayout(bot, checkPermission);
    registerEditors(bot, checkPermission);
    registerRating(bot, checkPermission);
    registerGeneration(bot, checkPermission);
    
    console.log('Todos os módulos de eventos foram carregados.');
}

module.exports = { registerEvents };
