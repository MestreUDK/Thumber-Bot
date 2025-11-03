// ARQUIVO: src/drawing/background.js
const Jimp = require('jimp');

async function drawBackground(image, bannerUrl, width, height) {
  if (bannerUrl) {
    const banner = await Jimp.read(bannerUrl);
    banner.cover(width, height);
    image.composite(banner, 0, 0);
  }
  
  const overlay = new Jimp(width, height, '#000000');
  overlay.opacity(0.6);
  image.composite(overlay, 0, 0);
}

module.exports = { drawBackground };
