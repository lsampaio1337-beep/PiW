import { state, globals } from '../state.js';
import * as mathEngine from '../mathEngine.js';
import { updateUI, showModal } from '../ui.js';

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
        </div>
    `;
    showModal("Cheat Control", html, "window-cheat-control", "400px");
}

export function cheatAction(action) {
    if (action === 'Money') {
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
        const maxBallsTier = (balance.balls || []).length;
        const maxPotionsTier = (balance.potions || []).length;
        const maxBoxTier = (balance.box || []).length;
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
