import { state } from '../state.js';
import { updateMainControl } from './mainControl.js';
import { showCalendar } from './calendar.js';

// Setup default state if missing
function initDailyChallengesState() {
    if (!state.stats.dailyChallenges) {
        state.stats.dailyChallenges = {
            lastDate: null,
            rotationIndex: 0,
            active: [],
            totalCompleted: 0,
            hasRerolled: false
        };
    } else if (state.stats.dailyChallenges.hasRerolled === undefined) {
        state.stats.dailyChallenges.hasRerolled = false;
    }
}

function getLocalDateString() {
    const now = new Date();
    return now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
}


function parseAreaNames(id) {
    let result = [];
    if (id.includes(",")) {
        let parts = id.split(",");
        let baseRoute = parts[0].replace(/[0-9]+$/, "").trim();
        result.push(parts[0].replace(/\s*\(.*?\)/, "").trim());
        for (let i = 1; i < parts.length; i++) {
            let num = parts[i].trim();
            if (!isNaN(num)) {
                result.push((baseRoute + " " + num).replace(/\s*\(.*?\)/, "").trim());
            } else {
                result.push(num.replace(/\s*\(.*?\)/, "").trim());
            }
        }
    } else {
        result.push(id.replace(/\s*\(.*?\)/, "").trim());
    }
    return result;
}




const CHALLENGE_DEFS = {
    combat: [
        { id: 1, text: "The Rival: Defeat $ Pokémon with the same (or higher) level as your Pokémon.", getTarget: () => 10, type: 'defeat_level' },
        { id: 2, text: "Type Master: Defeat $ {extra} Pokémon.", getTarget: () => 10 + ((state.stats.completedChallengeIds ? state.stats.completedChallengeIds.length : 0) * 2), type: 'defeat_type', getExtra: () => {
            let availableTypes = new Set();
            if (state.config && state.config.routes && state.stats.completedChallengeIds) {

                let unlockedAreas = new Set();
                state.stats.completedChallengeIds.forEach(id => {
                    parseAreaNames(id).forEach(area => unlockedAreas.add(area));
                });

                if (state.config.unlocks) {
                    for (let unlock of state.config.unlocks) {
                        if (state.stats.completedChallengeIds.includes(unlock.areaId)) {
                            unlock.unlocks.forEach(u => parseAreaNames(u).forEach(a => unlockedAreas.add(a)));
                        }
                    }
                }

                unlockedAreas.add('Route 1');

                for (let area of unlockedAreas) {
                    let route = state.config.routes.find(r => r.name === area);
                    if (route && route.spawns) {
                        for (let s of route.spawns) {
                            let pData = state.config.pokemonData.find(pd => pd.id === s.pokemonId);
                            if (pData && pData.types) pData.types.forEach(t => availableTypes.add(t));
                        }
                    }
                }
            }
            let typeArr = Array.from(availableTypes);
            if (typeArr.length === 0) return 'Normal';
            return typeArr[Math.floor(Math.random() * typeArr.length)];
        } },
        { id: 31, text: "Species Master: Defeat $ {extra}.", getTarget: () => 10 + ((state.stats.completedChallengeIds ? state.stats.completedChallengeIds.length : 0) * 2), type: 'defeat_species', getExtra: () => {
            let availableSpecies = new Set();
            if (state.config && state.config.routes && state.stats.completedChallengeIds) {
                let unlockedAreas = new Set();
                state.stats.completedChallengeIds.forEach(id => {
                    parseAreaNames(id).forEach(area => unlockedAreas.add(area));
                });

                if (state.config.unlocks) {
                    for (let unlock of state.config.unlocks) {
                        if (state.stats.completedChallengeIds.includes(unlock.areaId)) {
                            unlock.unlocks.forEach(u => parseAreaNames(u).forEach(a => unlockedAreas.add(a)));
                        }
                    }
                }

                unlockedAreas.add('Route 1');

                for (let area of unlockedAreas) {
                    let route = state.config.routes.find(r => r.name === area);
                    if (route && route.spawns) {
                        for (let s of route.spawns) {
                            availableSpecies.add(s.pokemonId);
                        }
                    }
                }
            }
            let speciesArr = Array.from(availableSpecies);
            if (speciesArr.length === 0) return 'Pidgey';
            let pid = speciesArr[Math.floor(Math.random() * speciesArr.length)];
            let pData = state.config.pokemonData.find(p => p.id === pid);
            return pData ? pData.name : pid;
        } },
        { id: 3, text: "Endurance: Defeat $ Pokémon without fainting, healing, or swaping.", getTarget: () => 10 + (state.trainer.badges * 5), type: 'defeat_endurance' },
        { id: 4, text: "Speedrunner: Defeat a Pokémon in 1 turn $ times.", getTarget: () => Math.max(5, Math.floor((state.stats.completedChallenges || 0) * 0.5)), type: 'defeat_1_turn', condition: () => state.trainer.badges >= 1 },
        { id: 5, text: "Underdog: Defeat $ Pokémon using a Pokémon that is at least 5 levels lower than the enemy.", getTarget: () => 5 + state.trainer.badges, type: 'defeat_underdog', condition: () => state.trainer.badges >= 1 },
        { id: 6, text: "Shiny Hunter's Warmup: Defeat $ Pokémon in a single route.", getTarget: () => 25 + ((state.stats.completedChallengeIds ? state.stats.completedChallengeIds.length : 0) * 5), type: 'defeat_single_route' },
        { id: 7, text: "The Gauntlet: Defeat $ Gym Leaders.", getTarget: () => Math.max(1, state.trainer.badges), type: 'defeat_gym_leader', condition: () => state.trainer.badges >= 1 }
    ],
    catching: [
        { id: 8, text: "Quality Hunter: Catch $ Pokémon with a SumIV greater than 480.", getTarget: () => 3 + Math.floor((state.stats.highestLevelCaptured || 0) / 10), type: 'catch_sum_iv' },
        { id: 9, text: "Ball Tycoon: Catch $ Pokémon using a {extra}.", getTarget: () => 5 * (state.stats.upgrades ? Math.max(1, state.stats.upgrades.ballsTier) : 1), type: 'catch_ball_tier', getExtra: () => {
            let pool = ['Pokeball'];
            if (state.trainer.badges >= 3) pool.push('Greatball');
            if (state.trainer.badges >= 5) pool.push('Ultraball');
            if (state.trainer.badges >= 7) pool.push('Safariball');
            return pool[Math.floor(Math.random() * pool.length)];
        } },
        { id: 10, text: "Gotta Catch 'Em All: Catch 2 different species of Pokémon today.", getTarget: () => 2, type: 'catch_different_species', condition: () => Object.keys(state.stats.caughtSpecies || {}).length < 148 },
        { id: 11, text: "Rare: Catch $ Rare Pokémon.", getTarget: () => 2 + state.trainer.badges, type: 'catch_rare' },
        { id: 12, text: "Weak: Catch $ Weak Pokémon.", getTarget: () => 2 + state.trainer.badges, type: 'catch_weak' },
        { id: 13, text: "Specific Species: Catch $ {extra}.", getTarget: () => Math.max(5, (state.stats.completedChallengeIds ? state.stats.completedChallengeIds.length : 1)), type: 'catch_species', getExtra: () => {
            let caught = Object.keys(state.stats.caughtSpecies || {});
            let casinoUnlocked = state.stats.completedChallengeIds && (state.stats.completedChallengeIds.includes('Casino') || state.stats.completedChallengeIds.includes('Casino - Starter Troupe'));
            if (!casinoUnlocked) {
                caught = caught.filter(species => !['Bulbasaur', 'Charmander', 'Squirtle'].includes(species));
            }
            if (caught.length === 0) return 'Pidgey';
            return caught[Math.floor(Math.random() * caught.length)];
        } },
        { id: 14, text: "Type Enthusiast: Catch $ {extra} Pokémon.", getTarget: () => 5 + (state.trainer.badges * 2), type: 'catch_type', getExtra: () => {
            let availableTypes = new Set();
            if (state.config && state.config.routes && state.stats.completedChallengeIds) {

                let unlockedAreas = new Set();
                state.stats.completedChallengeIds.forEach(id => {
                    parseAreaNames(id).forEach(area => unlockedAreas.add(area));
                });

                if (state.config.unlocks) {
                    for (let unlock of state.config.unlocks) {
                        if (state.stats.completedChallengeIds.includes(unlock.areaId)) {
                            unlock.unlocks.forEach(u => parseAreaNames(u).forEach(a => unlockedAreas.add(a)));
                        }
                    }
                }

                unlockedAreas.add('Route 1');

                for (let area of unlockedAreas) {
                    let route = state.config.routes.find(r => r.name === area);
                    if (route && route.spawns) {
                        for (let s of route.spawns) {
                            let pData = state.config.pokemonData.find(pd => pd.id === s.pokemonId);
                            if (pData && pData.types) pData.types.forEach(t => availableTypes.add(t));
                        }
                    }
                }
            }
            let typeArr = Array.from(availableTypes);
            if (typeArr.length === 0) return 'Normal';
            return typeArr[Math.floor(Math.random() * typeArr.length)];
        } },
        { id: 15, text: "Level Grinder: Catch $ Pokémon above level {extra}.", getTarget: () => 5, getExtra: () => Math.floor((state.stats.highestLevelCaptured || 1) * 0.9), type: 'catch_level' }
    ],
    economy: [
        { id: 16, text: "Market Mogul (Sell): Sell $ Pokémon to the PokeMarket.", getTarget: () => 5 * Math.max(1, state.stats.completedChallenges || 0), type: 'sell_pokemon' },
        { id: 17, text: "Big Spender (Balls): Spend $ in balls in the shop.", getTarget: () => 100 * Math.max(1, (state.stats.completedChallengeIds ? state.stats.completedChallengeIds.length : 0)), type: 'spend_balls' },
        { id: 18, text: "Big Spender (Potions): Spend $ in potions in the shop.", getTarget: () => 100 * Math.max(1, (state.stats.completedChallengeIds ? state.stats.completedChallengeIds.length : 0)), type: 'spend_potions' },
        { id: 19, text: "Heal in PokeCenter: Heal all team in PokeCenter.", getTarget: () => 1, type: 'heal_center' },
        { id: 20, text: "Capitalist: Earn $ from battles.", getTarget: () => 100 * Math.max(1, state.stats.highestLevelCaptured || 1), type: 'earn_money' }
    ],
    management: [
        { id: 21, text: "Level Up: Gain a total of $ levels across all your Pokémon.", getTarget: () => 4 + (state.trainer.badges * 2), type: 'gain_levels' },
        { id: 22, text: "Evolutionary: Evolve $ Pokémon.", getTarget: () => Math.random() < 0.5 ? 1 : 2, type: 'evolve_pokemon' },
        { id: 23, text: "The Grinder: Gain $ total EXP across your party.", getTarget: () => 1000 * Math.max(1, state.stats.highestLevelCaptured || 1), type: 'gain_exp' },
        { id: 24, text: "Team Builder: Complete 1 Progress Challenge.", getTarget: () => 1, type: 'complete_progress_challenge', condition: () => state.stats.activeChallenges && state.stats.activeChallenges.length > 0 },
        { id: 25, text: "ZzZ: Sleep $ minutes.", getTarget: () => Math.max(1, Math.floor(0.1 * (state.stats.jigglypuffGrains || 0))), type: 'sleep_minutes' }
    ],
    special: [
        { id: 26, text: "Daycare Manager: Gain $ IV in daycare.", getTarget: () => 10 + (state.stats.highestLevelCaptured || 0), type: 'daycare_iv', condition: () => state.globalStats.hasSeenDaycare },
        { id: 27, text: "Breeder: Hatch $ Eggs from the Daycare.", getTarget: () => Math.random() < 0.5 ? 1 : 2, type: 'hatch_eggs', condition: () => state.globalStats.hasSeenDaycare },
        { id: 28, text: "Safari Tourist: Catch $ Pokémon in the Safari Zone.", getTarget: () => 5 + ((state.stats.completedChallenges || 0) * 2), type: 'safari_catch', condition: () => state.stats.completedChallengeIds && state.stats.completedChallengeIds.includes("Fuchsia City") },
        { id: 29, text: "High Roller: Catch $ Pokémon in the Casino.", getTarget: () => 5 * Math.max(1, state.trainer.badges), type: 'casino_catch', condition: () => state.stats.completedChallengeIds && state.stats.completedChallengeIds.includes('Casino') },
        { id: 30, text: "Lucky Spinner: See 1 Shiny Pokémon in the Casino.", getTarget: () => 1, type: 'casino_shiny', condition: () => state.stats.completedChallengeIds && state.stats.completedChallengeIds.includes('Casino') }
    ]
};

function generateActiveChallenges() {
    initDailyChallengesState();

    let active = [];
    let group = [];
    let rotationIndex = state.stats.dailyChallenges.rotationIndex;

    const getChallengeById = (id) => {
        for (let cat in CHALLENGE_DEFS) {
            let found = CHALLENGE_DEFS[cat].find(c => c.id === id);
            if (found) return found;
        }
        return null;
    };

    if (rotationIndex === 0) {
        group.push(getChallengeById(1));  // The Rival
        group.push(getChallengeById(10)); // Gotta Catch 'Em All
        group.push(getChallengeById(19)); // Heal in PokeCenter
    } else if (rotationIndex === 1) {
        group.push(getChallengeById(24)); // Team Builder
        group.push(getChallengeById(16)); // Market Mogul
        group.push(getChallengeById(8));  // Quality Hunter
    } else {
        let validCategories = [];
        let categories = Object.keys(CHALLENGE_DEFS);
        for (let cat of categories) {
            let validChallenges = CHALLENGE_DEFS[cat].filter(c => !c.condition || c.condition());
            if (validChallenges.length > 0) {
                validCategories.push({ cat, challenges: validChallenges });
            }
        }
        for (let i = validCategories.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [validCategories[i], validCategories[j]] = [validCategories[j], validCategories[i]];
        }
        let selectedCategories = validCategories.slice(0, 3);
        for (let sc of selectedCategories) {
            let randomChallenge = sc.challenges[Math.floor(Math.random() * sc.challenges.length)];
            group.push(randomChallenge);
        }
    }

    for (let c of group) {
        if (!c) continue;
        let target = c.getTarget();
        let extra = c.getExtra ? c.getExtra() : null;
        let text = c.text.replace('$', target);
        if (extra !== null) {
            text = text.replace('{extra}', extra);
        }
        active.push({
            id: c.id,
            type: c.type,
            target: target,
            progress: 0,
            completed: false,
            claimed: false,
            text: text,
            extra: extra
        });
    }

    state.stats.dailyChallenges.active = active;
}

export function checkAndResetDailyChallenges() {
    initDailyChallengesState();
    let today = new Date().toDateString();
    if (state.stats.dailyChallenges.lastDate !== today) {
        state.stats.dailyChallenges.lastDate = today;
        state.stats.dailyChallenges.rotationIndex++;
        state.stats.dailyChallenges.uniqueCaught = [];
        state.stats.dailyChallenges.hasSeenNotification = true;
        state.stats.dailyChallenges.hasRerolled = false;
        generateActiveChallenges();
    }
}

export function getDailyChallengesHtml() {
    initDailyChallengesState();
    checkAndResetDailyChallenges();

    let active = state.stats.dailyChallenges.active;
    if (!active || active.length === 0) {
        generateActiveChallenges();
        active = state.stats.dailyChallenges.active;
    }

    let html = `
        <div style="margin-top: 20px; border-top: 1px solid #555; padding-top: 20px;">
            <h2 style="margin-top: 0; color: #fff;">Daily Challenges</h2>
            <div style="display: flex; flex-direction: column; gap: 10px;">
    `;

    for (let i = 0; i < active.length; i++) {
        let c = active[i];

        let progressText = c.completed ? "" : `${c.progress} / ${c.target}`;
        let color = c.claimed ? "#4CAF50" : "#ccc";
        let textDec = c.claimed ? "line-through" : "none";

        html += `
            <div style="background: rgba(0,0,0,0.4); border: 1px solid #444; border-radius: 5px; padding: 10px; display: flex; align-items: center; justify-content: space-between;">
                <div style="flex: 1; text-align: left; color: ${color}; text-decoration: ${textDec}; font-size: 14px; display: flex; align-items: center; gap: 5px;">
                    ${c.text}
                </div>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <div style="font-weight: bold; color: ${color}; white-space: nowrap; font-size: 14px;">
                        ${progressText}
                    </div>
                    ${c.completed && !c.claimed ? `<button onclick="window.claimDailyChallengeToken(${i})" style="display: flex; align-items: center; gap: 5px; padding: 5px 10px; font-size: 12px; background: #2ecc71; color: white; border: none; border-radius: 3px; cursor: pointer;">Claim <img src="Assets/Extra/Token.png" style="width: 16px; height: 16px;"></button>` : ''}
                    ${!c.completed ? `<button onclick="window.cheatCompleteDailyChallenge(${i})" style="padding: 5px 10px; font-size: 12px; background: #666; color: white; border: none; border-radius: 3px; cursor: pointer;">Cheat Complete</button>` : ''}
                    ${!c.completed ? `<button ${state.stats.dailyChallenges.hasRerolled ? 'disabled' : ''} onclick="window.rerollIndividualDailyChallenge(${i})" style="padding: 5px 10px; font-size: 12px; background: ${state.stats.dailyChallenges.hasRerolled ? '#999' : '#e74c3c'}; color: white; border: none; border-radius: 3px; cursor: ${state.stats.dailyChallenges.hasRerolled ? 'not-allowed' : 'pointer'};">Reroll</button>` : ''}
                </div>
            </div>
        `;
    }

    html += `
            </div>
        </div>
    `;

    return html;
}

window.cheatCompleteDailyChallenge = function(index) {
    let active = state.stats.dailyChallenges.active;
    if (active && active[index] && !active[index].completed) {
        active[index].progress = active[index].target;
        active[index].completed = true;
        state.stats.dailyChallenges.hasSeenNotification = !!(document.getElementById('window-calendar') && document.getElementById('window-calendar').offsetParent !== null);
        if (typeof window.updateMainControl === 'function') window.updateMainControl();
        if (typeof showCalendar === 'function' && document.getElementById('window-calendar') && document.getElementById('window-calendar').offsetParent !== null) showCalendar(); // Refresh UI
    }
};

window.claimDailyChallengeToken = function(index) {
    let active = state.stats.dailyChallenges.active;
    if (active && active[index] && active[index].completed && !active[index].claimed) {
        active[index].claimed = true;
        if (!state.trainer.tokens) state.trainer.tokens = 0;
        state.trainer.tokens += 1;
        if (!state.stats.tokensEarned) state.stats.tokensEarned = 0;
        state.stats.tokensEarned += 1;
        state.stats.dailyChallenges.totalCompleted++;
        if (typeof window.updateMainControl === 'function') window.updateMainControl();
        if (typeof showCalendar === 'function' && document.getElementById('window-calendar') && document.getElementById('window-calendar').offsetParent !== null) showCalendar(); // Refresh UI
    }
};


window.rerollIndividualDailyChallenge = function(index) {
    if (state.stats.dailyChallenges.hasRerolled) return;

    let active = state.stats.dailyChallenges.active;
    if (!active || !active[index]) return;
    if (active[index].completed) return;

    let newC = null;
    let rotationIndex = state.stats.dailyChallenges.rotationIndex;

    const getChallengeById = (id) => {
        for (let cat in CHALLENGE_DEFS) {
            let found = CHALLENGE_DEFS[cat].find(c => c.id === id);
            if (found) return found;
        }
        return null;
    };

    if (rotationIndex === 0) {
        newC = getChallengeById(21); // Level Up
    } else if (rotationIndex === 1) {
        newC = getChallengeById(31); // Species Master
    }

    if (!newC) {
        let categoryLists = {
            combat: CHALLENGE_DEFS.combat.filter(c => !c.condition || c.condition()),
            catching: CHALLENGE_DEFS.catching.filter(c => !c.condition || c.condition()),
            economy: CHALLENGE_DEFS.economy.filter(c => !c.condition || c.condition()),
            management: CHALLENGE_DEFS.management.filter(c => !c.condition || c.condition()),
            special: CHALLENGE_DEFS.special.filter(c => !c.condition || c.condition())
        };

        let activeCategories = new Set();
        for (let c of active) {
            for (let key in categoryLists) {
                if (categoryLists[key].some(def => def.type === c.type)) {
                    activeCategories.add(key);
                    break;
                }
            }
        }

        let unusedCategories = Object.keys(categoryLists).filter(key => !activeCategories.has(key) && categoryLists[key].length > 0);
        let availableCategories = unusedCategories;

        if (availableCategories.length === 0) {
            availableCategories = Object.keys(categoryLists).filter(key => categoryLists[key].length > 0);
        }

        let rCat = availableCategories[Math.floor(Math.random() * availableCategories.length)];
        let possibleChallenges = categoryLists[rCat];

        newC = possibleChallenges[Math.floor(Math.random() * possibleChallenges.length)];
    }

    let target = newC.getTarget();
    let extra = newC.getExtra ? newC.getExtra() : null;
    let text = newC.text.replace('$', target);
    if (extra !== null) {
        text = text.replace('{extra}', extra);
    }

    active[index] = {
        id: newC.id,
        type: newC.type,
        target: target,
        progress: 0,
        completed: false,
        claimed: false,
        text: text,
        extra: extra
    };

    state.stats.dailyChallenges.hasRerolled = true;

    if (typeof showCalendar === 'function' && document.getElementById('window-calendar') && document.getElementById('window-calendar').offsetParent !== null) showCalendar();
};

// Tracking Hook function for integration in other modules
window.trackDailyChallenge = function(type, data = {}) {
    if (!state.stats.dailyChallenges || !state.stats.dailyChallenges.active) return;

    let active = state.stats.dailyChallenges.active;
    let updated = false;

    for (let c of active) {
        if (!c.completed && c.type === type) {
            let increment = 1;

            if (type === 'defeat_level' && data.level !== undefined && data.playerLevel !== undefined) {
                if (data.level < data.playerLevel) continue;
            }
            if (type === 'defeat_underdog' && data.level !== undefined && data.playerLevel !== undefined) {
                if (data.playerLevel > data.level - 5) continue;
            }
            if (type === 'catch_sum_iv' && data.sumIv !== undefined) {
                if (data.sumIv <= 480) continue;
            }
            if (type === 'catch_level' && data.level !== undefined && c.extra !== undefined) {
                if (data.level <= c.extra) continue;
            }
            if (type === 'sell_pokemon' && data.count !== undefined) {
                increment = data.count;
            }
            if (type === 'earn_money' && data.amount !== undefined) {
                increment = data.amount;
            }
            if (type === 'spend_balls' && data.amount !== undefined) {
                increment = data.amount;
            }
            if (type === 'spend_potions' && data.amount !== undefined) {
                increment = data.amount;
            }
            if (type === 'gain_levels' && data.amount !== undefined) {
                increment = data.amount;
            }
            if (type === 'gain_exp' && data.amount !== undefined) {
                increment = data.amount;
            }
            if (type === 'sleep_minutes' && data.amount !== undefined) {
                increment = data.amount;
            }
            if (type === 'daycare_iv' && data.amount !== undefined) {
                increment = data.amount;
            }

            if (type === 'defeat_endurance') {
                if (data.streak === 0) {
                    c.progress = 0;
                    updated = true;
                    continue;
                }
                increment = 1;
            }

            if (type === 'defeat_single_route') {
                if (data.streak === 1) {
                    c.progress = 1;
                    updated = true;
                    continue;
                }
                increment = 1;
            }

            if (type === 'catch_rare' && data.quality !== undefined) {
                if (!['Rare', 'Epic', 'Legendary', 'Boss'].includes(data.quality)) continue;
            }

            if (type === 'catch_weak' && data.quality !== undefined) {
                if (data.quality !== 'Weak') continue;
            }

            if (type === 'catch_different_species' && data.species !== undefined) {
                if (!state.stats.dailyChallenges.uniqueCaught) state.stats.dailyChallenges.uniqueCaught = [];
                if (state.stats.dailyChallenges.uniqueCaught.includes(data.species)) continue;
                state.stats.dailyChallenges.uniqueCaught.push(data.species);
            }

            if ((type === 'catch_type' || type === 'defeat_type') && data.types && c.extra) {
                let found = false;
                for (let t of data.types) {
                    if (t.toLowerCase() === c.extra.toLowerCase()) found = true;
                }
                if (!found) continue;
            }

            if (type === 'catch_species' && data.species && c.extra) {
                if (data.species !== c.extra) continue;
            }

            if (type === 'defeat_species' && data.species && c.extra) {
                if (data.species !== c.extra) continue;
            }

            if (type === 'catch_ball_tier' && data.ball && c.extra) {
                if (data.ball !== c.extra) continue;
            }

            c.progress += increment;
            if (c.progress >= c.target) {
                c.progress = c.target;
                c.completed = true;
                state.stats.dailyChallenges.hasSeenNotification = !!(document.getElementById('window-calendar') && document.getElementById('window-calendar').offsetParent !== null);
                if (typeof window.updateMainControl === 'function') window.updateMainControl();
            }
            updated = true;
        }
    }
    if (updated) {
        if (document.getElementById('window-calendar')) {
            if (typeof showCalendar === 'function' && document.getElementById('window-calendar') && document.getElementById('window-calendar').offsetParent !== null) showCalendar();
        }
    }
};

export function trackDailyChallenge(type, data = {}) {
    window.trackDailyChallenge(type, data);
}

export function checkAnyDailyChallengeCompleted() {
    if (!state.stats.dailyChallenges || !state.stats.dailyChallenges.active) return false;
    if (state.stats.dailyChallenges.hasSeenNotification) return false;
    for (let c of state.stats.dailyChallenges.active) {
        if (c.completed && !c.claimed) return true;
    }
    return false;
}
