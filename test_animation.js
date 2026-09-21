import { JSDOM } from 'jsdom';
import fs from 'fs';
const html = fs.readFileSync('index.html', 'utf8');
const dom = new JSDOM(html);
global.document = dom.window.document;
global.window = dom.window;

// create mock battle sprites container
const container = document.getElementById('battle-sprites-container');

// Run dummy logic to verify syntax in battle.js isn't broken
try {
  const mod = await import('./src/ui/battle.js');
  console.log('Successfully loaded battle.js');
} catch (e) {
  console.error(e);
}
