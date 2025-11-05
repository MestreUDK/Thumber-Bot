// ARQUIVO: src/drawing/classification.js
const Jimp = require('jimp');
const path = require('path');
const { getRatingImageName } = require('../utils.js'); // Sobe um nivel para 'src/utils.js'

async function drawClassification(image, anime, padding, height) {
  if (!anime.classificacaoManual) {
    return;
  }
  
  const ratingFileName = getRatingImageName(anime.classificacaoManual);
  if (ratingFileName) {
    try {
      // Sobe 2 niveis (de src/drawing para a raiz) e desce para assets/
      const ratingImagePath = path.join(__dirname, '..', '..', 'assets', 'classificacao', ratingFileName);
      const ratingImage = await Jimp.read(ratingImagePath);
      ratingImage.resize(Jimp.AUTO, 80);
      
      const ratingX = padding;
      const ratingY = height - ratingImage.bitmap.height - padding; 

      image.composite(ratingImage, ratingX, ratingY);
    } catch (err) {
      console.warn(`Aviso: Nao foi possivel carregar a imagem ${ratingFileName} da pasta /classificacao/`);
    }
  }
}

module.exports = { drawClassification };
