const fs = require('fs-extra');

async function run() {
    const list = await fs.readJson('data/pokemon_full.json');
    const finalData = {};

    for (const p of list) {
        let key = `${p.num}_${p.name}`;
        if (p.extraName) {
            key += `_${p.extraName}`;
        }

        let normalSprite = key + ".png";
        let shinySprite = p.extraName && p.extraName !== 'Alolan' ? null : key + "_shiny.png";

        const bst = {
            Total: p.stats.Total,
            HP: p.stats.HP,
            Speed: p.stats.Speed,
            Attack: p.stats.Attack,
            SpAtk: p.stats.SpAtk,
            Def: p.stats.Defense, // fixed
            SpDef: p.stats.SpDef
        };

        finalData[key] = {
            "#": p.num,
            "Name": p.name,
            "Extra Name": p.extraName,
            "Type": p.types,
            "BST": bst,
            "Moves": p.moves,
            "Evolution": p.evolutions,
            "Sprites": shinySprite ? { Normal: normalSprite, Shiny: shinySprite } : { Normal: normalSprite }
        };
    }

    await fs.writeJson('data/pokemon.json', finalData, { spaces: 2 });
    console.log(`Saved ${Object.keys(finalData).length} entries to data/pokemon.json`);
}
run();
