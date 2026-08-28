const fs = require('fs');
const path = require('path');
const axios = require('axios');

const MAX_POKEMON = 151;
const ASSETS_DIR = path.join(__dirname, '..', 'assets', 'sprites');

// Ensure directory exists
if (!fs.existsSync(ASSETS_DIR)) {
  fs.mkdirSync(ASSETS_DIR, { recursive: true });
}

async function downloadImage(url, filename) {
  const filepath = path.join(ASSETS_DIR, filename);
  if (fs.existsSync(filepath)) {
    console.log(`Skipping ${filename}, already exists.`);
    return;
  }
  try {
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream',
    });
    const writer = fs.createWriteStream(filepath);
    response.data.pipe(writer);
    return new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  } catch (error) {
    console.error(`Failed to download ${url}: ${error.message}`);
  }
}

async function downloadSprites() {
  console.log('Downloading sprites from PokeAPI...');
  for (let i = 1; i <= MAX_POKEMON; i++) {
    // Normal sprite
    const normalUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${i}.png`;
    await downloadImage(normalUrl, `${i}.png`);

    // Shiny sprite
    const shinyUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${i}.png`;
    await downloadImage(shinyUrl, `${i}_shiny.png`);

    if (i % 10 === 0) console.log(`Downloaded ${i}/${MAX_POKEMON}`);
  }
  console.log('Done downloading sprites!');
}

downloadSprites();
