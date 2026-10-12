const fs = require('fs-extra');

async function transform() {
    const list = await fs.readJson('data/pokemon_base.json');
    const newList = [];
    let addedCount = 0;

    for (const p of list) {
        // If num is between 0722 and 0807, and it has NO extra name originally (so it's the base Gen 7 form), we duplicate it.
        // Wait, some might already have extra names (like Zygarde 10%, Oricorio styles).
        // The instructions said: "For numbers 722-807 use Gen 7 sprites add extra name Alolan, also add another sprite gathering latest sprite possible that contain both normal and shiny and use no extra name."
        // We will duplicate the base forms (where extraName is empty or null). Or do we do it for ALL of them?
        // Usually, the base form is what they mean. Let's do it for all items in that range without an extraName.
        const numInt = parseInt(p.num, 10);

        if (numInt >= 722 && numInt <= 807 && !p.extraName) {
            // Keep the original (no extra name)
            newList.push({...p});

            // Create the Alolan extra name version
            const alolanCopy = JSON.parse(JSON.stringify(p));
            alolanCopy.extraName = "Alolan";
            alolanCopy.key = `${alolanCopy.num}_${alolanCopy.name}_Alolan`;
            newList.push(alolanCopy);

            addedCount++;
        } else {
            newList.push(p);
        }
    }

    await fs.writeJson('data/pokemon_transformed.json', newList, { spaces: 2 });
    console.log(`Transformed list. Added ${addedCount} Alolan duplicates for Gen 7. Total entries: ${newList.length}`);
}
transform();
