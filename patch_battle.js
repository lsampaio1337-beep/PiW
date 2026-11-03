const fs = require('fs');

const targetFile = 'src/ui/battle.js';
let content = fs.readFileSync(targetFile, 'utf8');

const search = `function updateGymBackground(combatArena, state, battleSystem) {
    const gym = battleSystem.gymState.gym;
    if (gym.name === "Kanto Pokemon League") {
        const trainerIndex = battleSystem.gymState.currentTrainerIndex;
        const trainerBGs = [
            'BG-Elite4-1Lorelei.png',
            'BG-Elite4-2Bruno.png',
            'BG-Elite4-3Agatha.png',
            'BG-Elite4-4Lance.png',
            'BG-Elite4-5Champion.png'
        ];
        const bgImage = trainerBGs[trainerIndex] || 'BattleMode/Test.png';
        combatArena.style.backgroundImage = \`url('./Assets/BG/\${bgImage}')\`;
    } else {
        // Remove previous dynamic gym bg if it exists
        const existingDynamic = document.getElementById('dynamic-gym-bg-arena');
        if (existingDynamic) {
            existingDynamic.remove();
        }

        if (state.config.gymAssets && state.config.gymAssets[gym.leader]) {
            const assetConfig = state.config.gymAssets[gym.leader];
            const spritePath = \`./Assets/Gym/GymLeaders/\${assetConfig.sprite}\`;
            const bgPath = \`./Assets/Gym/BG/\${assetConfig.background}\`;

            const dynamicBg = document.createElement('div');
            dynamicBg.id = 'dynamic-gym-bg-arena';
            dynamicBg.style.position = 'absolute';
            dynamicBg.style.top = '0';
            dynamicBg.style.left = '0';
            dynamicBg.style.width = '100%';
            dynamicBg.style.height = '100%';
            dynamicBg.style.zIndex = '0'; // Behind combat elements but above raw background
            dynamicBg.style.backgroundImage = \`url('\${bgPath}')\`;
            dynamicBg.style.backgroundSize = '100% 100%';
            dynamicBg.style.overflow = 'hidden';

            const imgNode = document.createElement('img');
            imgNode.src = spritePath;
            imgNode.style.position = 'absolute';
            imgNode.style.left = \`\${assetConfig.position.rel_x * 100}%\`;
            imgNode.style.top = \`\${assetConfig.position.rel_y * 100}%\`;
            imgNode.style.width = \`\${(assetConfig.size.px_width / 1800) * 100}%\`;
            imgNode.style.transform = \`rotate(\${assetConfig.tilt.angle_deg}deg)\`;
            imgNode.style.transformOrigin = assetConfig.tilt.origin;
            imgNode.style.pointerEvents = 'none';

            // Clear any existing children just in case, though it should be empty
            dynamicBg.replaceChildren(imgNode);

            combatArena.style.backgroundImage = 'none';
            combatArena.style.position = 'relative'; // Ensure relative positioning
            combatArena.insertBefore(dynamicBg, combatArena.firstChild);
        } else {
            const gymIndex = state.config.gyms.findIndex(g => g.name === gym.name);
            const gymBGs = [
                'BG-Gym-1-Pewter-Rock.png',
                'BG-Gym-2-Cerulean-Water.png',
                'BG-Gym-3-Vermilion-Electric.png',
                'BG-Gym-4-Celadon-Grass.png',
                'BG-Gym-5-Fuchsia-Poison.png',
                'BG-Gym-6-Saffron-Psychic.png',
                'BG-Gym-7-Cinnabar-Fire.png',
                'BG-Gym-8-Viridian-Ground.png',
                'IndigoPlateau.png',
                '../Gym/BG/BG_Gym_Flying.png',
                '../Gym/BG/BG_Gym_Bug.png',
                '../Gym/BG/BG_Gym_Normal.png',
                '../Gym/BG/BG_Gym_Ghost.png',
                '../Gym/BG/BG_Gym_Fighting.png',
                '../Gym/BG/BG_Gym_Steel.png',
                '../Gym/BG/BG_Gym_Ice.png',
                '../Gym/BG/BG_Gym_Dragon.png'
            ];
            const bgImage = gymBGs[gymIndex] || 'BattleMode/Test.png';
            combatArena.style.backgroundImage = \`url('./Assets/BG/\${bgImage}')\`;
        }
    }
}`;

const replace = `function updateKantoLeagueBackground(combatArena, battleSystem) {
    const trainerIndex = battleSystem.gymState.currentTrainerIndex;
    const trainerBGs = [
        'BG-Elite4-1Lorelei.png',
        'BG-Elite4-2Bruno.png',
        'BG-Elite4-3Agatha.png',
        'BG-Elite4-4Lance.png',
        'BG-Elite4-5Champion.png'
    ];
    const bgImage = trainerBGs[trainerIndex] || 'BattleMode/Test.png';
    combatArena.style.backgroundImage = \`url('./Assets/BG/\${bgImage}')\`;
}

function updateDynamicGymBackground(combatArena, assetConfig) {
    const spritePath = \`./Assets/Gym/GymLeaders/\${assetConfig.sprite}\`;
    const bgPath = \`./Assets/Gym/BG/\${assetConfig.background}\`;

    const dynamicBg = document.createElement('div');
    dynamicBg.id = 'dynamic-gym-bg-arena';
    dynamicBg.style.position = 'absolute';
    dynamicBg.style.top = '0';
    dynamicBg.style.left = '0';
    dynamicBg.style.width = '100%';
    dynamicBg.style.height = '100%';
    dynamicBg.style.zIndex = '0'; // Behind combat elements but above raw background
    dynamicBg.style.backgroundImage = \`url('\${bgPath}')\`;
    dynamicBg.style.backgroundSize = '100% 100%';
    dynamicBg.style.overflow = 'hidden';

    const imgNode = document.createElement('img');
    imgNode.src = spritePath;
    imgNode.style.position = 'absolute';
    imgNode.style.left = \`\${assetConfig.position.rel_x * 100}%\`;
    imgNode.style.top = \`\${assetConfig.position.rel_y * 100}%\`;
    imgNode.style.width = \`\${(assetConfig.size.px_width / 1800) * 100}%\`;
    imgNode.style.transform = \`rotate(\${assetConfig.tilt.angle_deg}deg)\`;
    imgNode.style.transformOrigin = assetConfig.tilt.origin;
    imgNode.style.pointerEvents = 'none';

    // Clear any existing children just in case, though it should be empty
    dynamicBg.replaceChildren(imgNode);

    combatArena.style.backgroundImage = 'none';
    combatArena.style.position = 'relative'; // Ensure relative positioning
    combatArena.insertBefore(dynamicBg, combatArena.firstChild);
}

function updateFallbackGymBackground(combatArena, state, gym) {
    const gymIndex = state.config.gyms.findIndex(g => g.name === gym.name);
    const gymBGs = [
        'BG-Gym-1-Pewter-Rock.png',
        'BG-Gym-2-Cerulean-Water.png',
        'BG-Gym-3-Vermilion-Electric.png',
        'BG-Gym-4-Celadon-Grass.png',
        'BG-Gym-5-Fuchsia-Poison.png',
        'BG-Gym-6-Saffron-Psychic.png',
        'BG-Gym-7-Cinnabar-Fire.png',
        'BG-Gym-8-Viridian-Ground.png',
        'IndigoPlateau.png',
        '../Gym/BG/BG_Gym_Flying.png',
        '../Gym/BG/BG_Gym_Bug.png',
        '../Gym/BG/BG_Gym_Normal.png',
        '../Gym/BG/BG_Gym_Ghost.png',
        '../Gym/BG/BG_Gym_Fighting.png',
        '../Gym/BG/BG_Gym_Steel.png',
        '../Gym/BG/BG_Gym_Ice.png',
        '../Gym/BG/BG_Gym_Dragon.png'
    ];
    const bgImage = gymBGs[gymIndex] || 'BattleMode/Test.png';
    combatArena.style.backgroundImage = \`url('./Assets/BG/\${bgImage}')\`;
}

function updateGymBackground(combatArena, state, battleSystem) {
    const gym = battleSystem.gymState.gym;
    if (gym.name === "Kanto Pokemon League") {
        updateKantoLeagueBackground(combatArena, battleSystem);
    } else {
        // Remove previous dynamic gym bg if it exists
        const existingDynamic = document.getElementById('dynamic-gym-bg-arena');
        if (existingDynamic) {
            existingDynamic.remove();
        }

        if (state.config.gymAssets && state.config.gymAssets[gym.leader]) {
            updateDynamicGymBackground(combatArena, state.config.gymAssets[gym.leader]);
        } else {
            updateFallbackGymBackground(combatArena, state, gym);
        }
    }
}`;

if (content.includes(search)) {
    content = content.replace(search, replace);
    fs.writeFileSync(targetFile, content, 'utf8');
    console.log("Successfully replaced block.");
} else {
    console.log("Could not find block to replace.");
}
