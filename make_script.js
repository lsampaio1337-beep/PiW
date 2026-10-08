const fs = require('fs');

const naturalDir = 'Assets/Pokemon Sprites/Natural';
const newNaturalDir = 'Assets/Pokemon Sprites/New Natural';
const cleanDir = 'Assets/Pokemon Sprites/Clean';
const newCleanDir = 'Assets/Pokemon Sprites/New Clean/Gen6';
const oldCleanDir = 'Assets/Pokemon Sprites/Clean';

let newNaturalFiles = fs.readdirSync(newNaturalDir);
const toRenameNatural = [];
for (let file of newNaturalFiles) {
  if (file.startsWith('Gen6_')) {
    const parts = file.replace('Gen6_', '').split('_');
    const id = parseInt(parts[0], 10);
    const isShiny = file.includes('_shiny');
    const newName = isShiny ? `${id}_shiny.png` : `${id}.png`;
    toRenameNatural.push({
      oldPath: `${newNaturalDir}/${file}`,
      newPath: `${naturalDir}/${newName}`
    });
  }
}

let newCleanFiles = fs.readdirSync(newCleanDir);
const toRenameClean = [];
for (let file of newCleanFiles) {
  const parts = file.split('_');
  const id = parseInt(parts[0], 10);
  const isShiny = file.includes('_shiny');
  const newName = isShiny ? `${id}_shiny_Clean.png` : `${id}_Clean.png`;
  toRenameClean.push({
    oldPath: `${newCleanDir}/${file}`,
    newPath: `${cleanDir}/${newName}`
  });
}

// Check missing Gen6
const gen6MappedClean = new Set(toRenameClean.map(x => x.newPath));
// Add fallback for missing files from existing clean
let oldCleanFiles = fs.readdirSync(oldCleanDir);
const fallbackClean = [];
for (let file of oldCleanFiles) {
   if (!gen6MappedClean.has(`${cleanDir}/${file}`)) {
       // Just keep the old file by doing nothing, but since we will rm -rf, we need to copy it from a backup
       fallbackClean.push(file);
   }
}

// Write a bash script to perform the updates
let sh = '#!/bin/bash\nset -e\n';
sh += `mkdir -p .backup_clean\n`;
sh += `cp -r "${cleanDir}"/* .backup_clean/\n`;

sh += `rm -rf "${naturalDir}"/*\n`;
sh += `rm -rf "${cleanDir}"/*\n`;

for (let r of toRenameNatural) {
  sh += `cp "${r.oldPath}" "${r.newPath}"\n`;
}
for (let r of toRenameClean) {
  sh += `cp "${r.oldPath}" "${r.newPath}"\n`;
}
for (let f of fallbackClean) {
  sh += `cp ".backup_clean/${f}" "${cleanDir}/${f}"\n`;
}

sh += `rm -rf .backup_clean\n`;

fs.writeFileSync('do_rename.sh', sh);
console.log('Created do_rename.sh');
