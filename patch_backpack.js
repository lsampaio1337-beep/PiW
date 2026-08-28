const fs = require('fs');

let uiJs = fs.readFileSync('src/ui.js', 'utf8');

const formatQuantity = (q) => {
    if (q >= 1000000) return Math.floor(q / 1000000) + 'm';
    if (q >= 1000) return Math.floor(q / 1000) + 'k';
    return q;
};

const newBackpackLogic = `
window.showBackpack = function() {
    let rightCol = document.getElementById('right-col');
    let contentPanel = document.getElementById('content-panel');
    rightCol.style.display = 'block';

    const formatQuantity = (q) => {
        if (q >= 1000000) return Math.floor(q / 1000000) + 'm';
        if (q >= 1000) return Math.floor(q / 1000) + 'k';
        return q;
    };

    let html = \`
        <div style="background-image: url('./Assets/Extra/Backpack.png'); background-size: cover; background-position: center; padding: 20px; border-radius: 8px; min-height: 400px; color: white;">
            <h2 style="text-align: center; text-shadow: 1px 1px 2px black;">Backpack</h2>

            <div style="display: flex; justify-content: center; gap: 10px; margin-bottom: 20px;">
                <button onclick="renderBackpackTab('pokeballs')">Pokéballs</button>
                <button onclick="renderBackpackTab('potions')">Potions</button>
                <button onclick="renderBackpackTab('stones')">Stones</button>
                <button onclick="renderBackpackTab('pokemon')">Pokémon</button>
            </div>

            <div id="backpack-content-area" style="background: rgba(0,0,0,0.6); padding: 15px; border-radius: 5px; min-height: 300px;">
                <!-- Content gets rendered here -->
            </div>
            <br>
            <div style="text-align: center;">
                <button onclick="document.getElementById('right-col').style.display='none'">Close</button>
            </div>
        </div>
    \`;
    contentPanel.innerHTML = html;

    // Render default tab
    renderBackpackTab('pokeballs');
};

window.renderBackpackTab = function(tab) {
    const area = document.getElementById('backpack-content-area');
    if (!area) return;

    const formatQuantity = (q) => {
        if (q >= 1000000) return Math.floor(q / 1000000) + 'm';
        if (q >= 1000) return Math.floor(q / 1000) + 'k';
        return q;
    };

    let content = '';

    if (tab === 'pokeballs') {
        content += '<div style="display: flex; flex-wrap: wrap; gap: 20px; justify-content: center;">';
        for (const [name, qty] of Object.entries(state.backpack.pokeballs)) {
            content += \`
                <div style="text-align: center; width: 80px;">
                    <img src="./Assets/Items/Balls/\${name}.png" style="width: 50px; height: 50px;" onerror="this.src='data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='">
                    <br><span style="font-size: 12px;">\${name}</span>
                    <br><b>x\${formatQuantity(qty)}</b>
                </div>
            \`;
        }
        content += '</div>';
    } else if (tab === 'potions') {
        content += '<div style="display: flex; flex-wrap: wrap; gap: 20px; justify-content: center;">';
        for (const [name, qty] of Object.entries(state.backpack.potions)) {
            content += \`
                <div style="text-align: center; width: 80px;">
                    <img src="./Assets/Items/Potions/\${name}.png" style="width: 50px; height: 50px;" onerror="this.src='data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='">
                    <br><span style="font-size: 12px;">\${name}</span>
                    <br><b>x\${formatQuantity(qty)}</b>
                </div>
            \`;
        }
        content += '</div>';
    } else if (tab === 'stones') {
        content += '<div style="display: flex; flex-wrap: wrap; gap: 20px; justify-content: center;">';
        for (const [name, qty] of Object.entries(state.backpack.stones)) {
            content += \`
                <div style="text-align: center; width: 80px;">
                    <img src="./Assets/Items/Stones/\${name}.png" style="width: 50px; height: 50px;" onerror="this.src='data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='">
                    <br><span style="font-size: 12px;">\${name}</span>
                    <br><b>x\${formatQuantity(qty)}</b>
                </div>
            \`;
        }
        content += '</div>';
    } else if (tab === 'pokemon') {
        content += \`
            <div style="display: flex; gap: 10px; width: 100%;">
                <!-- Column 1: Party (6 max normally, but 4x2 slots requested means 8 total slots here for Party, Breeding, Training) -->
                <div style="flex: 1; border: 1px solid #555; padding: 5px; min-height: 200px;">
                    <h4 style="text-align: center; margin-top:0;">Active (Party/Breed/Train)</h4>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px;">
        \`;

        // Let's create an array of 8 slots for column 1
        const activePokemon = [];
        state.party.forEach(p => activePokemon.push({...p, _tag: 'Party'}));
        state.breeding.forEach(p => activePokemon.push({...p, _tag: 'Breeding'}));
        state.training.forEach(p => activePokemon.push({...p, _tag: 'Training'}));

        for (let i = 0; i < 8; i++) {
            if (i < activePokemon.length) {
                let p = activePokemon[i];
                let imgSrc = \`Assets/Pokemon Sprites/\${p.qualityName === 'Shiny' ? p.id + '_shiny' : p.id}.png\`;
                content += \`
                    <div style="border: 1px solid #777; height: 60px; text-align: center; cursor: pointer; position: relative;" onclick="movePokemon('\${p._tag}', \${i}, 'storage')">
                        <span style="position: absolute; top: 0; left: 0; font-size: 8px; background: black; padding: 1px;">\${p._tag}</span>
                        <img src="\${imgSrc}" style="max-height: 40px; max-width: 40px;" onerror="this.src='data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='">
                        <div style="font-size: 10px;">Lv.\${p.level}</div>
                    </div>
                \`;
            } else {
                content += \`<div style="border: 1px dashed #777; height: 60px;"></div>\`;
            }
        }

        content += \`
                    </div>
                </div>

                <!-- Column 2: Storage (6xn) -->
                <div style="flex: 1; border: 1px solid #555; padding: 5px; min-height: 200px;">
                    <h4 style="text-align: center; margin-top:0;">Storage</h4>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 5px; max-height: 250px; overflow-y: auto;">
        \`;

        // Show storage + 1 empty slot
        for (let i = 0; i <= state.storage.length; i++) {
            if (i < state.storage.length) {
                let p = state.storage[i];
                let imgSrc = \`Assets/Pokemon Sprites/\${p.qualityName === 'Shiny' ? p.id + '_shiny' : p.id}.png\`;
                content += \`
                    <div style="border: 1px solid #777; height: 60px; text-align: center; cursor: pointer;" onclick="movePokemon('storage', \${i}, 'safe')">
                        <img src="\${imgSrc}" style="max-height: 40px; max-width: 40px;" onerror="this.src='data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='">
                        <div style="font-size: 10px;">Lv.\${p.level}</div>
                    </div>
                \`;
            } else {
                content += \`<div style="border: 1px dashed #777; height: 60px; display: flex; align-items: center; justify-content: center; font-size: 20px; cursor: pointer;" title="Empty Slot">+</div>\`;
            }
        }

        content += \`
                    </div>
                </div>

                <!-- Column 3: Safe (6xn) -->
                <div style="flex: 1; border: 1px solid #555; padding: 5px; min-height: 200px;">
                    <h4 style="text-align: center; margin-top:0;">Safe</h4>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 5px; max-height: 250px; overflow-y: auto;">
        \`;

        // Show safe + 1 empty slot
        for (let i = 0; i <= state.safe.length; i++) {
            if (i < state.safe.length) {
                let p = state.safe[i];
                let imgSrc = \`Assets/Pokemon Sprites/\${p.qualityName === 'Shiny' ? p.id + '_shiny' : p.id}.png\`;
                content += \`
                    <div style="border: 1px solid #777; height: 60px; text-align: center; cursor: pointer;" onclick="movePokemon('safe', \${i}, 'storage')">
                        <img src="\${imgSrc}" style="max-height: 40px; max-width: 40px;" onerror="this.src='data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='">
                        <div style="font-size: 10px;">Lv.\${p.level}</div>
                    </div>
                \`;
            } else {
                content += \`<div style="border: 1px dashed #777; height: 60px; display: flex; align-items: center; justify-content: center; font-size: 20px; cursor: pointer;" title="Empty Slot">+</div>\`;
            }
        }

        content += \`
                    </div>
                </div>
            </div>
            <div style="font-size: 10px; text-align: center; margin-top: 5px; color: #ccc;">Click a Pokémon to move it.</div>
        \`;
    }

    area.innerHTML = content;
};

window.movePokemon = function(sourceList, index, targetListStr) {
    let sourceArr = [];
    if (sourceList === 'Party') sourceArr = state.party;
    else if (sourceList === 'Breeding') sourceArr = state.breeding;
    else if (sourceList === 'Training') sourceArr = state.training;
    else if (sourceList === 'storage') sourceArr = state.storage;
    else if (sourceList === 'safe') sourceArr = state.safe;

    if (index >= sourceArr.length) return;

    let p = sourceArr.splice(index, 1)[0];

    let targetArr = [];
    if (targetListStr === 'storage') targetArr = state.storage;
    else if (targetListStr === 'safe') targetArr = state.safe;
    else if (targetListStr === 'Party') targetArr = state.party;

    targetArr.push(p);

    updatePartyUI();
    renderBackpackTab('pokemon'); // refresh UI
};
`;

uiJs = uiJs.replace(
    /document\.getElementById\('btn-backpack'\)\.onclick = \(\) => showModal\("Backpack", `[\s\S]*?`\);/,
    "document.getElementById('btn-backpack').onclick = showBackpack;"
);

uiJs = uiJs.replace(
    /function switchView\(viewName\) \{/,
    `${newBackpackLogic}\n\nfunction switchView(viewName) {`
);

fs.writeFileSync('src/ui.js', uiJs);
