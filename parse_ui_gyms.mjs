// The math for Johto offset in src/ui/gift.js:
// `gymIndex = (i < 8) ? i + 9 : i - 8;`
// WAIT, i + 9? If i=0, 0+9 = 9 (Johto 1). Wait, 9 is Johto 2 actually?
// Let's re-verify:
// 0: Kanto 1
// 1: Kanto 2
// ...
// 7: Kanto 8
// 8: Kanto League?
// In src/ui.js, we decided regionIndex = floor(i/8), badgeNum = (i%8)+1.
// So global gymIndex mathematically (without leagues) maps directly:
// 0-7 = Kanto
// 8-15 = Johto

for (let i = 0; i < 16; i++) {
    let gymIndex = i;
    if ('Johto' === 'Johto') {
        // We just need to swap the first 8 and second 8 badges
        if (i < 8) {
            gymIndex = i + 8; // So 0 becomes 8 (Johto 1)
        } else if (i < 16) {
            gymIndex = i - 8; // So 8 becomes 0 (Kanto 1)
        }
    }

    let regionIndex = Math.floor(gymIndex / 8);
    let badgeRegion = ['Kanto', 'Johto', 'Hoenn', 'Sinnoh', 'Unova2', 'Kalos', 'Alola', 'Galar', 'Hisui', 'Paldea'][regionIndex] || 'Kanto';
    let badgeNum = (gymIndex % 8) + 1;
    console.log(`Badge ${i+1} -> ${badgeRegion} ${badgeNum}`);
}
