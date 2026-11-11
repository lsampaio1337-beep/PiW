const fs = require('fs');

let content = fs.readFileSync('src/battleSystem.js', 'utf8');

// 1. Remove the automatic startNextGymBattle call and switch view to BATTLE_ARENA, apply background
const searchStr = `        // Immediately start the next battle upon entering
        if (window.battleEngine && window.battleEngine.startNextGymBattle) {
            window.battleEngine.startNextGymBattle();
        }`;

const replaceStr = `        // Switch view to BATTLE_ARENA to show pokemon in gym background
        if (typeof window.switchView === 'function') {
            window.switchView("BATTLE_ARENA");
        }

        const arenaView = document.getElementById("view-battle-arena");
        if (arenaView) {
            if (this.state.config && this.state.config.gymAssets && this.state.config.gymAssets[gym.leader]) {
                const assetConfig = this.state.config.gymAssets[gym.leader];
                const bgPath = \`./Assets/Gym/BG/\${assetConfig.background}\`;
                arenaView.style.backgroundImage = \`url('\${bgPath}')\`;
                arenaView.style.backgroundSize = "100% 100%";
                arenaView.style.backgroundPosition = "center";
                arenaView.style.backgroundRepeat = "no-repeat";
            } else {
                const gymBGs = [
                    'BG-Gym-1-Pewter-Rock.png', 'BG-Gym-2-Cerulean-Water.png', 'BG-Gym-3-Vermilion-Electric.png',
                    'BG-Gym-4-Celadon-Grass.png', 'BG-Gym-5-Fuchsia-Poison.png', 'BG-Gym-6-Saffron-Psychic.png',
                    'BG-Gym-7-Cinnabar-Fire.png', 'BG-Gym-8-Viridian-Ground.png', 'IndigoPlateau.png',
                    '../Gym/BG/BG_Gym_Flying.png', '../Gym/BG/BG_Gym_Bug.png', '../Gym/BG/BG_Gym_Normal.png',
                    '../Gym/BG/BG_Gym_Ghost.png', '../Gym/BG/BG_Gym_Fighting.png', '../Gym/BG/BG_Gym_Steel.png',
                    '../Gym/BG/BG_Gym_Ice.png', '../Gym/BG/BG_Gym_Dragon.png'
                ];
                const bgImage = gymBGs[this.gymState.gymIndex] || 'BattleMode/Test.png';
                arenaView.style.backgroundImage = \`url('./Assets/BG/\${bgImage}')\`;
                arenaView.style.backgroundSize = "cover";
                arenaView.style.backgroundPosition = "center";
                arenaView.style.backgroundRepeat = "no-repeat";
            }
        }`;

content = content.replace(searchStr, replaceStr);


// 2. Remove the leader sprite from the Map Inner Modal updateGymUI
const searchSpriteStr = `                const img = document.createElement('img');
                img.src = \`./Assets/Gym/GymLeaders/\${assetConfig.sprite}\`;
                img.style.position = 'absolute';
                img.style.left = \`\${assetConfig.position.rel_x * 100}%\`;
                img.style.top = \`\${assetConfig.position.rel_y * 100}%\`;
                img.style.width = \`\${(assetConfig.size.px_width / 1800) * 100}%\`;
                img.style.transform = \`rotate(\${assetConfig.tilt.angle_deg}deg)\`;
                img.style.transformOrigin = assetConfig.tilt.origin;
                img.style.pointerEvents = 'none';
                dynamicBg.appendChild(img);`;

const replaceSpriteStr = `                // Leader sprite intentionally removed here based on user requirement`;

content = content.replace(searchSpriteStr, replaceSpriteStr);

fs.writeFileSync('src/battleSystem.js', content, 'utf8');
