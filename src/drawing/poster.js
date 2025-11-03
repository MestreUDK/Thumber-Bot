// ARQUIVO: src/drawing/poster.js
const Jimp = require('jimp');

async function drawPoster(image, posterUrl, width, height, padding) {
  if (!posterUrl) {
    return 0;
  }
  
  const cover = await Jimp.read(posterUrl);
  cover.resize(Jimp.AUTO, height); 
  
  const posterWidth = cover.bitmap.width; 
  const coverX = width - posterWidth;
  const coverY = 0; 
  
  image.composite(cover, coverX, coverY);
  return posterWidth; 
}

module.exports = { drawPoster };
