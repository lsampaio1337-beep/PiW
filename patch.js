const fs = require('fs');
let code = fs.readFileSync('src/ui.js', 'utf8');

const search = `export function renderProfessorLab() {
    const labContent = document.getElementById("generic-lab-content");
    const labView = document.getElementById("view-professor-lab");
    if (!labContent || !labView) return;

    if (state.stats.showProfMarkerPulse) {
        state.stats.showProfMarkerPulse = false;
    }

    let currentRegion = window.currentMapRegion || 'Kanto';

    const labConfigs = {
        'Kanto': { sprite: "1_Kanto_Professor_Oak.png", position: { rel_x: 0.5861, rel_y: 0.016, px_width: 595, px_height: 1326 } },
        'Johto': { sprite: "2_Johto_Professor_Elm.png", position: { rel_x: 0.5628, rel_y: 0.037, px_width: 624, px_height: 1256 } },
        'Hoenn': { sprite: "3_Hoenn_Professor_Birch.png", position: { rel_x: 0.4272, rel_y: 0.0395, px_width: 1000, px_height: 948 } },
        'Sinnoh': { sprite: "4_Sinnoh_Professor_Rowan.png", position: { rel_x: 0.5881, rel_y: 0.0415, px_width: 452, px_height: 957 } },
        'Unova': { sprite: "5_Unova_Professor_Juniper.png", position: { rel_x: 0.6294, rel_y: 0.019, px_width: 526, px_height: 1280 } },
        'Kalos': { sprite: "6_Kalos_Professor_Sycamore.png", position: { rel_x: 0.4889, rel_y: 0.053, px_width: 873, px_height: 1371 } },
        'Alola': { sprite: "7_Alola_Professor_Kukui.png", position: { rel_x: 0.5853, rel_y: 0.046, px_width: 597, px_height: 1415 } },
        'Galar': { sprite: "8_Galar_Professor_Magnolia.png", position: { rel_x: 0.6311, rel_y: 0.035, px_width: 458, px_height: 1264 } },
        'Hisui': { sprite: "9_Hisui_Professor_Laventon.png", position: { rel_x: 0.5833, rel_y: 0.02, px_width: 612, px_height: 1367 } },
        'Paldea': { sprite: "10_Paldea_Turo.png", position: { rel_x: 0.5872, rel_y: 0.042, px_width: 475, px_height: 1184 } }
    };

    const config = labConfigs[currentRegion] || labConfigs['Kanto'];
    const profSprite = \`./Assets/Lab/\${config.sprite}\`;

    const profImg = document.getElementById("prof-generic-sprite");
    if (profImg) {
        profImg.src = profSprite;
        profImg.style.left = \`\${config.position.rel_x * 100}%\`;
        profImg.style.top = \`\${config.position.rel_y * 100}%\`;
        profImg.style.width = \`\${(config.position.px_width / 1800) * 100}%\`;
        profImg.style.height = \`\${(config.position.px_height / 1000) * 100}%\`;
    }

    if (!state.stats.hasPickedStarter) {
        // Show starter selection
        const regionStarters = {
            'Kanto': [1, 4, 7],
            'Johto': [152, 155, 158],
            'Hoenn': [252, 255, 258],
            'Sinnoh': [387, 390, 393],
            'Unova': [495, 498, 501]
        };
        const starterIds = regionStarters[currentRegion] || regionStarters['Kanto'];

        let containerDiv = document.createElement('div');
        containerDiv.style.backgroundColor = 'rgba(0,0,0,0.8)';
        containerDiv.style.position = 'absolute';
        containerDiv.style.left = '15%';
        containerDiv.style.top = '50%';
        containerDiv.style.transform = 'translateY(-50%)';
        containerDiv.style.padding = '30px';
        containerDiv.style.borderRadius = '8px';

        let h2 = document.createElement('h2');
        h2.textContent = 'Choose your Starter Pokémon';
        containerDiv.appendChild(h2);

        let starterChoices = document.createElement('div');
        starterChoices.className = 'starter-choices';

        starterIds.forEach(id => {
            const p = state.config.pokemonData.find(p => p.id === id);
            const name = p ? p.name : 'Unknown';
            const paddedId = id.toString().padStart(4, '0');
            const spriteSrc = \`Assets/Pokemon Sprites/Natural/Gen5/\${paddedId}_\${name}.png\`;

            const btn = document.createElement('button');
            btn.onclick = () => window.selectStarter(id);

            const img = document.createElement('img');
            img.src = spriteSrc;
            img.style.width = '80px';
            img.style.height = '80px';

            const br = document.createElement('br');

            const textNode = document.createTextNode(name);

            btn.appendChild(img);
            btn.appendChild(br);
            btn.appendChild(textNode);
            starterChoices.appendChild(btn);
        });

        containerDiv.appendChild(starterChoices);
        labContent.replaceChildren(containerDiv);
    } else {
        // Show assignments (identical to Kanto layout)
        let containerDiv = document.createElement('div');
        containerDiv.style.backgroundColor = 'rgba(0,0,0,0.85)';
        containerDiv.style.position = 'absolute';
        containerDiv.style.left = '15%';
        containerDiv.style.top = '50%';
        containerDiv.style.transform = 'translateY(-50%)';
        containerDiv.style.padding = '20px';
        containerDiv.style.borderRadius = '8px';
        containerDiv.style.width = '250px';
        containerDiv.style.color = 'white';
        containerDiv.style.textAlign = 'center';

        let h2 = document.createElement('h2');
        h2.style.marginTop = '0';
        h2.textContent = 'Professor Lab';
        containerDiv.appendChild(h2);

        let flexDiv = document.createElement('div');
        flexDiv.style.display = 'flex';
        flexDiv.style.flexDirection = 'column';
        flexDiv.style.gap = '10px';

        let innerDiv = document.createElement('div');
        innerDiv.style.position = 'relative';
        innerDiv.style.display = 'inline-block';
        innerDiv.style.width = '100%';

        let btn = document.createElement('button');
        btn.onclick = () => window.showProfLabModal();
        btn.className = 'action-btn action-btn-primary';
        btn.style.width = '100%';
        btn.textContent = 'Assignments and Boosters';
        innerDiv.appendChild(btn);

        if (state.stats.showProfLobbyNotification) {
            let img = document.createElement('img');
            img.src = 'Assets/Extra/Icons/ExclamationMark.png';
            img.style.position = 'absolute';
            img.style.top = '-5px';
            img.style.right = '-5px';
            img.style.width = '20px';
            img.style.height = 'auto';
            img.style.pointerEvents = 'none';
            img.style.zIndex = '10';
            innerDiv.appendChild(img);
        }

        flexDiv.appendChild(innerDiv);
        containerDiv.appendChild(flexDiv);

        labContent.replaceChildren(containerDiv);
    }
}`;

const replace = `function renderProfessorSprite(currentRegion) {
    const labConfigs = {
        'Kanto': { sprite: "1_Kanto_Professor_Oak.png", position: { rel_x: 0.5861, rel_y: 0.016, px_width: 595, px_height: 1326 } },
        'Johto': { sprite: "2_Johto_Professor_Elm.png", position: { rel_x: 0.5628, rel_y: 0.037, px_width: 624, px_height: 1256 } },
        'Hoenn': { sprite: "3_Hoenn_Professor_Birch.png", position: { rel_x: 0.4272, rel_y: 0.0395, px_width: 1000, px_height: 948 } },
        'Sinnoh': { sprite: "4_Sinnoh_Professor_Rowan.png", position: { rel_x: 0.5881, rel_y: 0.0415, px_width: 452, px_height: 957 } },
        'Unova': { sprite: "5_Unova_Professor_Juniper.png", position: { rel_x: 0.6294, rel_y: 0.019, px_width: 526, px_height: 1280 } },
        'Kalos': { sprite: "6_Kalos_Professor_Sycamore.png", position: { rel_x: 0.4889, rel_y: 0.053, px_width: 873, px_height: 1371 } },
        'Alola': { sprite: "7_Alola_Professor_Kukui.png", position: { rel_x: 0.5853, rel_y: 0.046, px_width: 597, px_height: 1415 } },
        'Galar': { sprite: "8_Galar_Professor_Magnolia.png", position: { rel_x: 0.6311, rel_y: 0.035, px_width: 458, px_height: 1264 } },
        'Hisui': { sprite: "9_Hisui_Professor_Laventon.png", position: { rel_x: 0.5833, rel_y: 0.02, px_width: 612, px_height: 1367 } },
        'Paldea': { sprite: "10_Paldea_Turo.png", position: { rel_x: 0.5872, rel_y: 0.042, px_width: 475, px_height: 1184 } }
    };

    const config = labConfigs[currentRegion] || labConfigs['Kanto'];
    const profSprite = \`./Assets/Lab/\${config.sprite}\`;

    const profImg = document.getElementById("prof-generic-sprite");
    if (profImg) {
        profImg.src = profSprite;
        profImg.style.left = \`\${config.position.rel_x * 100}%\`;
        profImg.style.top = \`\${config.position.rel_y * 100}%\`;
        profImg.style.width = \`\${(config.position.px_width / 1800) * 100}%\`;
        profImg.style.height = \`\${(config.position.px_height / 1000) * 100}%\`;
    }
}

function renderStarterSelection(currentRegion, labContent) {
    const regionStarters = {
        'Kanto': [1, 4, 7],
        'Johto': [152, 155, 158],
        'Hoenn': [252, 255, 258],
        'Sinnoh': [387, 390, 393],
        'Unova': [495, 498, 501]
    };
    const starterIds = regionStarters[currentRegion] || regionStarters['Kanto'];

    let containerDiv = document.createElement('div');
    containerDiv.style.backgroundColor = 'rgba(0,0,0,0.8)';
    containerDiv.style.position = 'absolute';
    containerDiv.style.left = '15%';
    containerDiv.style.top = '50%';
    containerDiv.style.transform = 'translateY(-50%)';
    containerDiv.style.padding = '30px';
    containerDiv.style.borderRadius = '8px';

    let h2 = document.createElement('h2');
    h2.textContent = 'Choose your Starter Pokémon';
    containerDiv.appendChild(h2);

    let starterChoices = document.createElement('div');
    starterChoices.className = 'starter-choices';

    starterIds.forEach(id => {
        const p = state.config.pokemonData.find(p => p.id === id);
        const name = p ? p.name : 'Unknown';
        const paddedId = id.toString().padStart(4, '0');
        const spriteSrc = \`Assets/Pokemon Sprites/Natural/Gen5/\${paddedId}_\${name}.png\`;

        const btn = document.createElement('button');
        btn.onclick = () => window.selectStarter(id);

        const img = document.createElement('img');
        img.src = spriteSrc;
        img.style.width = '80px';
        img.style.height = '80px';

        const br = document.createElement('br');

        const textNode = document.createTextNode(name);

        btn.appendChild(img);
        btn.appendChild(br);
        btn.appendChild(textNode);
        starterChoices.appendChild(btn);
    });

    containerDiv.appendChild(starterChoices);
    labContent.replaceChildren(containerDiv);
}

function renderAssignmentsAndBoosters(labContent) {
    let containerDiv = document.createElement('div');
    containerDiv.style.backgroundColor = 'rgba(0,0,0,0.85)';
    containerDiv.style.position = 'absolute';
    containerDiv.style.left = '15%';
    containerDiv.style.top = '50%';
    containerDiv.style.transform = 'translateY(-50%)';
    containerDiv.style.padding = '20px';
    containerDiv.style.borderRadius = '8px';
    containerDiv.style.width = '250px';
    containerDiv.style.color = 'white';
    containerDiv.style.textAlign = 'center';

    let h2 = document.createElement('h2');
    h2.style.marginTop = '0';
    h2.textContent = 'Professor Lab';
    containerDiv.appendChild(h2);

    let flexDiv = document.createElement('div');
    flexDiv.style.display = 'flex';
    flexDiv.style.flexDirection = 'column';
    flexDiv.style.gap = '10px';

    let innerDiv = document.createElement('div');
    innerDiv.style.position = 'relative';
    innerDiv.style.display = 'inline-block';
    innerDiv.style.width = '100%';

    let btn = document.createElement('button');
    btn.onclick = () => window.showProfLabModal();
    btn.className = 'action-btn action-btn-primary';
    btn.style.width = '100%';
    btn.textContent = 'Assignments and Boosters';
    innerDiv.appendChild(btn);

    if (state.stats.showProfLobbyNotification) {
        let img = document.createElement('img');
        img.src = 'Assets/Extra/Icons/ExclamationMark.png';
        img.style.position = 'absolute';
        img.style.top = '-5px';
        img.style.right = '-5px';
        img.style.width = '20px';
        img.style.height = 'auto';
        img.style.pointerEvents = 'none';
        img.style.zIndex = '10';
        innerDiv.appendChild(img);
    }

    flexDiv.appendChild(innerDiv);
    containerDiv.appendChild(flexDiv);

    labContent.replaceChildren(containerDiv);
}

export function renderProfessorLab() {
    const labContent = document.getElementById("generic-lab-content");
    const labView = document.getElementById("view-professor-lab");
    if (!labContent || !labView) return;

    if (state.stats.showProfMarkerPulse) {
        state.stats.showProfMarkerPulse = false;
    }

    let currentRegion = window.currentMapRegion || 'Kanto';

    renderProfessorSprite(currentRegion);

    if (!state.stats.hasPickedStarter) {
        renderStarterSelection(currentRegion, labContent);
    } else {
        renderAssignmentsAndBoosters(labContent);
    }
}`;

code = code.replace(search, replace);
fs.writeFileSync('src/ui.js', code);
