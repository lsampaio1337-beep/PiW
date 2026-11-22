import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { PNG } = require('pngjs');

const DEFAULT_ROOT = path.resolve('Assets', 'Pokemon Sprites');
const WHITE_THRESHOLD = 250; // R, G, B >= 250 and A > 0

function walkPngs(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkPngs(full, out);
    } else if (entry.name.toLowerCase().endsWith('.png')) {
      out.push(full);
    }
  }
  return out;
}

function isWhite(data, idx, threshold = WHITE_THRESHOLD) {
  return (
    data[idx + 3] > 0 &&
    data[idx] >= threshold &&
    data[idx + 1] >= threshold &&
    data[idx + 2] >= threshold
  );
}

/**
 * Flood-fills from all 4 edges of the image, clearing connected white/near-white
 * background pixels (setting RGBA to 0,0,0,0) while preserving interior white pixels.
 * Returns the number of pixels cleared.
 */
function cutWhiteBackground(png, threshold = WHITE_THRESHOLD) {
  const { width, height, data } = png;
  const visited = new Uint8Array(width * height);
  const queue = [];

  const tryEnqueue = (x, y) => {
    if (x < 0 || x >= width || y < 0 || y >= height) return;
    const pos = y * width + x;
    if (visited[pos]) return;
    const idx = pos * 4;
    if (isWhite(data, idx, threshold)) {
      visited[pos] = 1;
      queue.push(pos);
    }
  };

  for (let x = 0; x < width; x++) {
    tryEnqueue(x, 0);
    tryEnqueue(x, height - 1);
  }
  for (let y = 1; y < height - 1; y++) {
    tryEnqueue(0, y);
    tryEnqueue(width - 1, y);
  }

  let cleared = 0;
  let head = 0;
  while (head < queue.length) {
    const pos = queue[head++];
    const idx = pos * 4;
    data[idx] = 0;
    data[idx + 1] = 0;
    data[idx + 2] = 0;
    data[idx + 3] = 0;
    cleared++;

    const x = pos % width;
    const y = (pos - x) / width;
    tryEnqueue(x + 1, y);
    tryEnqueue(x - 1, y);
    tryEnqueue(x, y + 1);
    tryEnqueue(x, y - 1);
  }

  return cleared;
}

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const rootDir = DEFAULT_ROOT;

const files = walkPngs(rootDir);
let affectedCount = 0;
let totalClearedPixels = 0;

for (const file of files) {
  const buf = fs.readFileSync(file);
  const png = PNG.sync.read(buf);
  const cleared = cutWhiteBackground(png);

  if (cleared > 0) {
    affectedCount++;
    totalClearedPixels += cleared;
    const rel = path.relative(rootDir, file);
    console.log(`${dryRun ? '[DRY-RUN] ' : ''}${rel}: ${cleared} white background pixels`);
    if (!dryRun) {
      fs.writeFileSync(file, PNG.sync.write(png));
    }
  }
}

console.log(
  `\nDone. Scanned ${files.length} PNGs. ${dryRun ? 'Found' : 'Cleaned'} ${affectedCount} sprites (${totalClearedPixels} pixels total).`
);
