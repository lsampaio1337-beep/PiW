import { state, globals } from '../state.js';
import * as mathEngine from '../mathEngine.js';
import { updateUI, showModal } from '../ui.js';
import { VITAMINS } from '../constants.js';

export function showCheatControlModal() {
    const html = `
        <div style="display: flex; flex-direction: column; gap: 10px;">
            <button onclick="window.cheatAction('Money')" style="padding: 10px; font-size: 14px; background: #2ecc71; color: white; border: none; border-radius: 5px; cursor: pointer;">Money</button>
            <button onclick="window.cheatAction('NoMoney')" style="padding: 10px; font-size: 14px; background: #e74c3c; color: white; border: none; border-radius: 5px; cursor: pointer;">NoMoney</button>
            <button onclick="window.cheatAction('XP')" style="padding: 10px; font-size: 14px; background: #3498db; color: white; border: none; border-radius: 5px; cursor: pointer;">XP</button>
            <button onclick="window.cheatAction('InfiniteItems')" id="cheat-infinite-items-btn" style="padding: 10px; font-size: 14px; background: ${state.settings.infiniteItems ? '#9b59b6' : '#95a5a6'}; color: white; border: none; border-radius: 5px; cursor: pointer;">Infinite items: ${state.settings.infiniteItems ? 'ON' : 'OFF'}</button>
            <button onclick="window.cheatAction('Upgrades')" style="padding: 10px; font-size: 14px; background: #f1c40f; color: black; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">Upgrades</button>
            <button onclick="window.cheatAction('Map')" style="padding: 10px; font-size: 14px; background: #e67e22; color: white; border: none; border-radius: 5px; cursor: pointer;">Map</button>
            <button onclick="window.cheatAction('Pokedex')" style="padding: 10px; font-size: 14px; background: #34495e; color: white; border: none; border-radius: 5px; cursor: pointer;">Pokedex</button>
            <button onclick="window.cheatAction('PokedexShiny')" style="padding: 10px; font-size: 14px; background: linear-gradient(45deg, #f39c12, #e74c3c, #8e44ad); color: white; border: none; border-radius: 5px; cursor: pointer;">PokedexShiny</button>
            <button onclick="window.cheatAction('JigglypuffDust')" style="padding: 10px; font-size: 14px; background: #ffb6c1; color: black; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">Jigglypuff Dust</button>
            <button onclick="window.cheatAction('BonusCandy')" style="padding: 10px; font-size: 14px; background: #ecf0f1; color: black; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">Bonus Candy</button>
            <button onclick="window.showTimeLapseModal()" style="padding: 10px; font-size: 14px; background: #8e44ad; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">TimeLapse</button>
            <button onclick="window.cheatAction('GameSpeed')" style="padding: 10px; font-size: 14px; background: #9b59b6; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">Game Speed</button>
            <button onclick="window.cheatAction('GodMode')" style="padding: 10px; font-size: 14px; background: linear-gradient(45deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3); color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; text-shadow: 1px 1px 2px black;">God Mode</button>
        </div>
    `;
    showModal("Cheat Control", html, "window-cheat-control", "400px");
}

export function cheatAction(action) {
    if (action === 'GodMode') {
        state.trainer.money += 100000000;

        // 10000 masterball
        if (!state.backpack.pokeballs) state.backpack.pokeballs = {};
        state.backpack.pokeballs['Masterball'] = (state.backpack.pokeballs['Masterball'] || 0) + 10000;

        // 1000 of each stone (Types + VITAMINS)
        if (!state.backpack.stones) state.backpack.stones = {};
        Object.keys(state.config.types).forEach(type => {
            const stoneName = `${type} Stone`;
            state.backpack.stones[stoneName] = (state.backpack.stones[stoneName] || 0) + 1000;
        });
        VITAMINS.forEach(vitamin => {
            state.backpack.stones[vitamin] = (state.backpack.stones[vitamin] || 0) + 1000;
        });

        // 1000 of each potion
        if (!state.backpack.potions) state.backpack.potions = {};
        if (state.config.balance && state.config.balance.items && state.config.balance.items.potions) {
            state.config.balance.items.potions.forEach(potion => {
                state.backpack.potions[potion.name] = (state.backpack.potions[potion.name] || 0) + 1000;
            });
        }

        // Mewtwo Q=2 SumIv=600 Lvl=200 in party as leader
        const mewtwoData = state.config.pokemonData[149]; // Mewtwo is ID 150, so index 149
        if (mewtwoData) {
            const level = 200;
            const qVal = 2.0;
            const ivs = { hp: 100, atk: 100, def: 100, spa: 100, spd: 100, spe: 100 };
            const bst = mewtwoData.hp + mewtwoData.atk + mewtwoData.def + mewtwoData.spa + mewtwoData.spd + mewtwoData.spe;
            const totalIV = 600;

            const stats = {
                hp: mathEngine.calculateHP(mewtwoData.hp, ivs.hp, level, qVal),
                atk: mathEngine.calculateStat(mewtwoData.atk, ivs.atk, level, qVal),
                def: mathEngine.calculateStat(mewtwoData.def, ivs.def, level, qVal),
                spa: mathEngine.calculateStat(mewtwoData.spa, ivs.spa, level, qVal),
                spd: mathEngine.calculateStat(mewtwoData.spd, ivs.spd, level, qVal),
                spe: mathEngine.calculateStat(mewtwoData.spe, ivs.spe, level, qVal)
            };

            let learned = [];
            if (mewtwoData.learnset) {
                for (const ls of mewtwoData.learnset) {
                    if (level >= ls.level && state.config.moves[ls.move]) {
                        const moveData = JSON.parse(JSON.stringify(state.config.moves[ls.move]));
                        moveData.name = ls.move;
                        learned.push(moveData);
                    }
                }
            }
            const moves = learned.slice(-4);
            const xp = mathEngine.calculateTotalXP(level);

            const godMewtwo = {
                id: mewtwoData.id,
                name: mewtwoData.name,
                types: mewtwoData.types,
                level: level,
                xp: xp,
                qualityName: "Shiny",
                quality: qVal,
                ivs: { ...ivs },
                currentStats: { ...stats },
                maxHp: stats.hp,
                currentHp: stats.hp,
                evxp: mathEngine.calculateEVXP(bst, level, qVal, totalIV),
                evm: mathEngine.calculateEVM(bst, level, qVal, totalIV),
                pp: mathEngine.calculatePP(bst, level, qVal, totalIV),
                bst: bst,
                moves: JSON.parse(JSON.stringify(moves)),
                uuid: crypto.randomUUID()
            };

            if (state.party.length >= 6) {
                const lastMon = state.party.pop();
                if (!state.storage) state.storage = [];
                state.storage.push(lastMon);
            }
            state.party.unshift(godMewtwo);

            // Give Pokedex credit
            if (!state.stats.caughtSpecies) state.stats.caughtSpecies = {};
            if (!state.stats.seenShiniesSpecies) state.stats.seenShiniesSpecies = {};
            if (!state.stats.caughtShiniesSpecies) state.stats.caughtShiniesSpecies = {};
            state.stats.caughtSpecies[mewtwoData.name] = (state.stats.caughtSpecies[mewtwoData.name] || 0) + 1;
            state.stats.seenShiniesSpecies[mewtwoData.name] = true;
            state.stats.caughtShiniesSpecies[mewtwoData.name] = (state.stats.caughtShiniesSpecies[mewtwoData.name] || 0) + 1;
        }

        updateUI();
    } else if (action === 'Money') {
        state.trainer.money += 1000000000;
        updateUI();
    } else if (action === 'NoMoney') {
        state.trainer.money = 0;
        updateUI();
    } else if (action === 'XP') {
        if (state.party.length > 0) {
            let p = state.party[0];
            p.level += 1;
            p.xp = mathEngine.calculateTotalXP(p.level);

            // Recalculate stats based on new level
            const data = state.config.pokemonData[p.id - 1];
            if (data) {
                const oldMaxHp = p.maxHp;
                const v = p.vitamins || {};
                p.maxHp = mathEngine.calculateHP(data.hp, p.ivs.hp, p.level, p.quality, v.hp || 0);
                p.currentStats = {
                    hp: p.maxHp,
                    atk: mathEngine.calculateStat(data.atk, p.ivs.atk, p.level, p.quality, v.atk || 0),
                    def: mathEngine.calculateStat(data.def, p.ivs.def, p.level, p.quality, v.def || 0),
                    spa: mathEngine.calculateStat(data.spa, p.ivs.spa, p.level, p.quality, v.spa || 0),
                    spd: mathEngine.calculateStat(data.spd, p.ivs.spd, p.level, p.quality, v.spd || 0),
                    spe: mathEngine.calculateStat(data.spe, p.ivs.spe, p.level, p.quality, v.spe || 0)
                };
                // Keep the HP proportional or add the max hp difference
                p.currentHp = Math.min(p.maxHp, p.currentHp + (p.maxHp - oldMaxHp));

                // Recalculate other metrics
                p.evxp = mathEngine.calculateEVXP(p.bst, p.level, p.quality, Object.values(p.ivs).reduce((a,b)=>a+b,0));
                p.evm = mathEngine.calculateEVM(p.bst, p.level, p.quality, Object.values(p.ivs).reduce((a,b)=>a+b,0));
                p.pp = mathEngine.calculatePP(p.bst, p.level, p.quality, Object.values(p.ivs).reduce((a,b)=>a+b,0));
            }
            updateUI();
        }
    } else if (action === 'InfiniteItems') {
        state.settings.infiniteItems = !state.settings.infiniteItems;
        const btn = document.getElementById('cheat-infinite-items-btn');
        if (btn) {
            btn.style.background = state.settings.infiniteItems ? '#9b59b6' : '#95a5a6';
            btn.innerText = `Infinite items: ${state.settings.infiniteItems ? 'ON' : 'OFF'}`;
        }
    } else if (action === 'Upgrades') {
        if (!state.stats.upgrades) state.stats.upgrades = {};

        // Find max tiers from balance config if available, otherwise set arbitrarily high
        const balance = state.config.balance.expansions || {};
        const maxBallsTier = (balance.ballPocket || []).length;
        const maxPotionsTier = (balance.potionSatchel || []).length;
        const maxBoxTier = (balance.pokemonBox || []).length;
        const maxGlassTier = (balance.glass || []).length;
        const maxSmartwatchTier = (balance.smartwatch || []).length;
        const maxSpeedTier = (balance.speed || []).length;
        const maxLootTier = (balance.loot || []).length;

        state.stats.upgrades.ballsTier = maxBallsTier;
        state.stats.upgrades.potionsTier = maxPotionsTier;
        state.stats.upgrades.boxTier = maxBoxTier;
        state.stats.upgrades.glassTier = maxGlassTier;
        state.stats.upgrades.smartwatchTier = maxSmartwatchTier;
        state.stats.upgrades.speedTier = maxSpeedTier;
        state.stats.upgrades.lootTier = maxLootTier;

        updateUI();
    } else if (action === 'Map') {
        if (!state.stats.completedChallengeIds) state.stats.completedChallengeIds = [];
        if (!state.stats.newRoutes) state.stats.newRoutes = [];

        // Unlock all maps from routes
        if (state.config.routes) {
            state.config.routes.forEach(route => {
                if (!state.stats.completedChallengeIds.includes(route.name)) {
                    state.stats.completedChallengeIds.push(route.name);
                }
                if (!state.stats.newRoutes.includes(route.name)) {
                    state.stats.newRoutes.push(route.name);
                }
            });
        }

        // Unlock all unlocks from config
        if (state.config.unlocks) {
            state.config.unlocks.forEach(unlock => {
                if (!state.stats.completedChallengeIds.includes(unlock.areaId)) {
                    state.stats.completedChallengeIds.push(unlock.areaId);
                }
                if (unlock.unlocks) {
                     unlock.unlocks.forEach(newRoute => {
                         if (!state.stats.newRoutes.includes(newRoute)) {
                             state.stats.newRoutes.push(newRoute);
                         }
                     });
                }
            });
        }

        // Ensure Casino spots and machines are unlocked
        if (!state.stats.completedChallengeIds.includes('Casino')) {
            state.stats.completedChallengeIds.push('Casino');
        }
        if (!state.stats.newRoutes.includes('Casino')) {
            state.stats.newRoutes.push('Casino');
        }

        // Ensure Daycare is unlocked
        if (!state.stats.completedChallengeIds.includes('Daycare')) {
            state.stats.completedChallengeIds.push('Daycare');
        }
        if (!state.stats.newRoutes.includes('Daycare')) {
            state.stats.newRoutes.push('Daycare');
        }

        // Complete all progress challenges.
        // This is primarily driven by activeChallenges and completedChallengeIds.
        state.stats.activeChallenges = [];
        state.stats.hasUnseenMap = true;
        updateUI();
    } else if (action === 'Pokedex') {
        generatePokedex(false);
    } else if (action === 'PokedexShiny') {
        generatePokedex(true);
    } else if (action === 'JigglypuffDust') {
        state.stats.jigglypuffGrains = (state.stats.jigglypuffGrains || 0) + 100;
        updateUI();
    } else if (action === 'BonusCandy') {
        state.stats.whiteCandies = (state.stats.whiteCandies || 0) + 100;
        updateUI();
    } else if (action === 'GameSpeed') {
        const speeds = [0.25, 0.5, 1, 2, 5, 10, 25, 50, 100, 500, 1000];
        const currentIndex = speeds.indexOf(state.settings.gameSpeed || 1);
        const startIndex = currentIndex !== -1 ? currentIndex : 2; // Default to index 2 (1x)

        let speedHtml = `
            <div style="display: flex; flex-direction: column; gap: 15px; text-align: center; color: white;">
                <div style="font-size: 14px; font-weight: bold;">Current Speed: <span id="game-speed-display" style="color: #4CAF50;">${speeds[startIndex]}x</span></div>
                <input type="range" id="game-speed-slider" min="0" max="${speeds.length - 1}" step="1" value="${startIndex}" style="width: 100%; cursor: pointer;" oninput="window.handleGameSpeedSlider(this.value)">
                <div style="display: flex; justify-content: space-between; font-size: 10px; color: #aaa;">
                    <span>0.25x</span>
                    <span>1000x</span>
                </div>
            </div>
        `;

        window.handleGameSpeedSlider = function(val) {
            const display = document.getElementById('game-speed-display');
            const allowedSpeeds = [0.25, 0.5, 1, 2, 5, 10, 25, 50, 100, 500, 1000];
            const newSpeed = allowedSpeeds[val];
            if (display) {
                display.innerText = newSpeed + 'x';
            }

            state.settings.gameSpeed = newSpeed;
            if (window.restartGameClock) window.restartGameClock();
            if (window.updateUI) window.updateUI();
        };

        showModal("Game Speed", speedHtml, "window-gamespeed", "300px");
    }
}

function generatePokedex(isShiny) {
    if (!state.storage) state.storage = [];
    if (!state.stats.caughtSpecies) state.stats.caughtSpecies = {};
    if (!state.stats.seenShiniesSpecies) state.stats.seenShiniesSpecies = {};
    if (!state.stats.caughtShiniesSpecies) state.stats.caughtShiniesSpecies = {};

    for (let id = 1; id <= 151; id++) {
        const data = state.config.pokemonData[id - 1];
        if (!data) continue;

        const level = isShiny ? 100 : 1;
        const qVal = isShiny ? 2.0 : (Math.random() * 0.99 + 0.01);
        const qName = isShiny ? "Shiny" : "Random";
        const ivVal = isShiny ? 100 : Math.floor(Math.random() * 32); // 0-31

        const ivs = isShiny
            ? { hp: 100, atk: 100, def: 100, spa: 100, spd: 100, spe: 100 }
            : { hp: ivVal, atk: ivVal, def: ivVal, spa: ivVal, spd: ivVal, spe: ivVal }; // Random logic asks for random IV, let's just make it all same for simplicity or random each

        const stats = {
            hp: mathEngine.calculateHP(data.hp, ivs.hp, level, qVal),
            atk: mathEngine.calculateStat(data.atk, ivs.atk, level, qVal),
            def: mathEngine.calculateStat(data.def, ivs.def, level, qVal),
            spa: mathEngine.calculateStat(data.spa, ivs.spa, level, qVal),
            spd: mathEngine.calculateStat(data.spd, ivs.spd, level, qVal),
            spe: mathEngine.calculateStat(data.spe, ivs.spe, level, qVal)
        };

        const bst = data.hp + data.atk + data.def + data.spa + data.spd + data.spe;
        const totalIV = ivs.hp + ivs.atk + ivs.def + ivs.spa + ivs.spd + ivs.spe;

        let learned = [];
        if (data.learnset) {
            for (const ls of data.learnset) {
                if (level >= ls.level) {
                    if (state.config.moves[ls.move]) {
                        const moveData = JSON.parse(JSON.stringify(state.config.moves[ls.move]));
                        moveData.name = ls.move;
                        learned.push(moveData);
                    }
                }
            }
        }
        const moves = learned.slice(-4);
        const xp = mathEngine.calculateTotalXP(level);

        const newMon = {
            id: data.id,
            name: data.name,
            types: data.types,
            level: level,
            xp: xp,
            qualityName: qName,
            quality: qVal,
            ivs: { ...ivs },
            currentStats: { ...stats },
            maxHp: stats.hp,
            currentHp: stats.hp,
            evxp: mathEngine.calculateEVXP(bst, level, qVal, totalIV),
            evm: mathEngine.calculateEVM(bst, level, qVal, totalIV),
            pp: mathEngine.calculatePP(bst, level, qVal, totalIV),
            bst: bst,
            moves: JSON.parse(JSON.stringify(moves)),
            uuid: crypto.randomUUID()
        };

        state.storage.push(newMon);

        // Update Pokedex Collection counts
        state.stats.caughtSpecies[data.name] = (state.stats.caughtSpecies[data.name] || 0) + 1;
        if (isShiny) {
            state.stats.seenShiniesSpecies[data.name] = true;
            state.stats.caughtShiniesSpecies[data.name] = (state.stats.caughtShiniesSpecies[data.name] || 0) + 1;
        }
    }

    if (state.storageRef) {
        state.storageRef.updateBoxUI();
    }
    updateUI();
}
