import { state } from '../state.js';
import { updateTopbar } from './topbar.js';
import { showCalendar } from './calendar.js';

// Setup default state if missing
function initDailyChallengesState() {
    if (!state.stats.dailyChallenges) {
        state.stats.dailyChallenges = {
            lastDate: null,
            rotationIndex: 0,
            active: [],
            totalCompleted: 0,
            caughtSpecies: []
        };
    }
}

function getLocalDateString() {
    const now = new Date();
    return now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
}

function getRandomUnlockedBall() {
    let badges = state.trainer.badges || 0;
    let pool = ["Pokeball"];
    if (badges >= 3) pool.push("Greatball");
    if (badges >= 5) pool.push("Ultraball");
    if (badges >= 7) pool.push("Safariball");

    return pool[Math.floor(Math.random() * pool.length)];
}

function getRandomUnlockedType() {
    if (!state.stats.newRoutes || state.stats.newRoutes.length === 0) return "Normal";

    let possibleTypes = new Set();
    let unlockedRouteNames = state.stats.newRoutes.map(r => r.split(' (')[0]);

    if (state.config && state.config.routes && state.config.pokemonData) {
        for (let routeName of unlockedRouteNames) {
            let route = state.config.routes.find(r => r.name === routeName);
            if (route && route.spawns) {
                for (let spawn of route.spawns) {
                    let pData = state.config.pokemonData.find(p => p.id === spawn.pokemonId);
                    if (pData && pData.types) {
                        for (let type of pData.types) {
                            possibleTypes.add(type);
                        }
                    }
                }
            }
        }
    }

    let typeArray = Array.from(possibleTypes);
    if (typeArray.length === 0) return "Normal";
    return typeArray[Math.floor(Math.random() * typeArray.length)];
}

export function checkAndResetDailyChallenges() {
    initDailyChallengesState();
    const today = getLocalDateString();
    if (state.stats.dailyChallenges.lastDate !== today) {
        if (state.stats.dailyChallenges.lastDate !== null) {
            state.stats.dailyChallenges.rotationIndex++;
        }
        state.stats.dailyChallenges.lastDate = today;
        state.stats.dailyChallenges.caughtSpecies = [];
        generateActiveChallenges();
    }
}

const CHALLENGE_DEFS = {
    combat: [
        { id: 1, text: "The Rival: Defeat $ Pokémon with the same (or higher) level as your Pokémon.", getTarget: () => 10, type: 'defeat_level' },
        { id: 2, text: "Type Master: Defeat $ # type Pokémon.", getTarget: () => 10 + ((state.stats.newRoutes ? state.stats.newRoutes.length : 0) * 2), type: 'defeat_type', getExtra: () => getRandomUnlockedType() },
        { id: 3, text: "Endurance: Defeat $ Pokémon without fainting, healing, or swaping.", getTarget: () => 10 + (state.trainer.badges * 5), type: 'defeat_endurance' },
        { id: 4, text: "Speedrunner: Defeat a Pokémon in 1 turn $ times.", getTarget: () => Math.max(5, Math.floor((state.stats.completedChallenges || 0) * 0.5)), type: 'defeat_1_turn', condition: () => state.trainer.badges >= 1 },
        { id: 5, text: "Underdog: Defeat $ Pokémon using a Pokémon that is at least 5 levels lower than the enemy.", getTarget: () => 5 + state.trainer.badges, type: 'defeat_underdog', condition: () => state.trainer.badges >= 1 },
        { id: 6, text: "Shiny Hunter's Warmup: Defeat $ Pokémon in a single route.", getTarget: () => 25 + ((state.stats.newRoutes ? state.stats.newRoutes.length : 0) * 5), type: 'defeat_single_route' },
        { id: 7, text: "The Gauntlet: Defeat $ Gym Leaders.", getTarget: () => Math.max(1, state.trainer.badges), type: 'defeat_gym_leader', condition: () => state.trainer.badges >= 1 }
    ],
    catching: [
        { id: 8, text: "Quality Hunter: Catch $ Pokémon with a SumIV greater than 480.", getTarget: () => 3 + Math.floor((state.stats.highestLevelCaptured || 0) / 10), type: 'catch_sum_iv' },
        { id: 9, text: "Ball Tycoon: Catch $ Pokémon using a #.", getTarget: () => 5 * (state.stats.upgrades ? Math.max(1, state.stats.upgrades.ballsTier) : 1), type: 'catch_ball_tier', getExtra: () => getRandomUnlockedBall() },
        { id: 10, text: "Gotta Catch 'Em All: Catch $ different species of Pokémon today.", getTarget: () => 2, type: 'catch_different_species', condition: () => Object.keys(state.stats.caughtSpecies || {}).length < 148 },
        { id: 11, text: "Rare: Catch $ Rare Pokémon.", getTarget: () => 2 + state.trainer.badges, type: 'catch_rare' },
        { id: 12, text: "Weak: Catch $ Weak Pokémon.", getTarget: () => 2 + state.trainer.badges, type: 'catch_weak' },
        { id: 13, text: "Specific Species: Catch $ #.", getTarget: () => Math.max(5, (state.stats.newRoutes ? state.stats.newRoutes.length : 1)), type: 'catch_species', getExtra: () => getRandomUnlockedSpecies() },
        { id: 14, text: "Type Enthusiast: Catch $ # type Pokémon.", getTarget: () => 5 + (state.trainer.badges * 2), type: 'catch_type', getExtra: () => getRandomUnlockedType() },
        { id: 15, text: "Level Grinder: Catch $ Pokémon above level #.", getTarget: () => 5, getExtra: () => Math.floor((state.stats.highestLevelCaptured || 1) * 0.9), type: 'catch_level' }
    ],
    economy: [
        { id: 16, text: "Market Mogul: Sell $ Pokémon to the PokeMarket.", getTarget: () => 5 * Math.max(1, state.stats.completedChallenges || 1), type: 'sell_pokemon' },
        { id: 17, text: "Big Spender (Balls): Spend $ in balls in the shop.", getTarget: () => 100 * Math.max(1, (state.stats.newRoutes ? state.stats.newRoutes.length : 1)), type: 'spend_balls' },
        { id: 18, text: "Big Spender (Potions): Spend $ in potions in the shop.", getTarget: () => 100 * Math.max(1, (state.stats.newRoutes ? state.stats.newRoutes.length : 1)), type: 'spend_potions' },
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
        { id: 26, text: "Daycare Manager: Gain $ IV in daycare.", getTarget: () => 10 + (state.stats.highestLevelCaptured || 0), type: 'daycare_iv' },
        { id: 27, text: "Breeder: Hatch $ Eggs from the Daycare.", getTarget: () => Math.random() < 0.5 ? 1 : 2, type: 'hatch_eggs' },
        { id: 28, text: "Safari Tourist: Catch $ Pokémon in the Safari Zone.", getTarget: () => 5 + ((state.stats.completedChallenges || 0) * 2), type: 'safari_catch', condition: () => state.stats.newRoutes && state.stats.newRoutes.includes('Safari Zone') },
        { id: 29, text: "High Roller: Catch $ Pokémon in the Casino.", getTarget: () => 5 * Math.max(1, state.trainer.badges), type: 'casino_catch', condition: () => state.stats.newRoutes && state.stats.newRoutes.includes('Casino') },
        { id: 30, text: "Lucky Spinner: See 1 Shiny Pokémon in the Casino.", getTarget: () => 1, type: 'casino_shiny', condition: () => state.stats.newRoutes && state.stats.newRoutes.includes('Casino') }
    ]
};


function getRandomUnlockedSpecies() {
    let speciesList = [];
    if (!state.stats.newRoutes || state.stats.newRoutes.length === 0) {
        let r0 = state.config.unlocks['Route 1'];
        if(r0 && r0.pokemon) speciesList.push(...r0.pokemon.map(p => p.name));
    } else {
        for (let route of state.stats.newRoutes) {
            let unlock = state.config.unlocks[route];
            if (unlock && unlock.pokemon) {
                speciesList.push(...unlock.pokemon.map(p => p.name));
            }
        }
    }
    if (speciesList.length === 0) return "Pidgey"; // fallback
    return speciesList[Math.floor(Math.random() * speciesList.length)];
}

function getValidChallenge(challengeList, rotationIndex) {
    let originalIdx = rotationIndex % challengeList.length;
    let idx = originalIdx;
    for (let i = 0; i < challengeList.length; i++) {
        let c = challengeList[idx];
        if (!c.condition || c.condition()) {
            return c;
        }
        idx = (idx + 1) % challengeList.length;
    }
    // If none are valid (should theoretically not happen with good defaults), return the first one anyway to avoid nulls
    return challengeList[originalIdx];
}

function generateActiveChallenges() {
    initDailyChallengesState();
    let r = state.stats.dailyChallenges.rotationIndex;

    let active = [];

    let combatChallenge = getValidChallenge(CHALLENGE_DEFS.combat, r);
    let catchingChallenge = getValidChallenge(CHALLENGE_DEFS.catching, r);
    let economyChallenge = getValidChallenge(CHALLENGE_DEFS.economy, r);
    let managementChallenge = getValidChallenge(CHALLENGE_DEFS.management, r);
    let specialChallenge = getValidChallenge(CHALLENGE_DEFS.special, r);

    let group = [combatChallenge, catchingChallenge, economyChallenge, managementChallenge, specialChallenge];

    for (let c of group) {
        let target = c.getTarget();
        let text = c.text.replace('$', target);
        let extraVal = c.getExtra ? c.getExtra() : null;
        if (extraVal !== null) {
            text = text.replace('#', extraVal);
        }
        active.push({
            id: c.id,
            type: c.type,
            target: target,
            progress: 0,
            completed: false,
            text: text,
            extra: extraVal
        });
    }

    state.stats.dailyChallenges.active = active;
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

        let progressText = c.completed ? "Completed" : `${c.progress} / ${c.target}`;
        let color = c.completed ? "#4CAF50" : "#ccc";
        let textDec = c.completed ? "line-through" : "none";

        html += `
            <div style="background: rgba(0,0,0,0.4); border: 1px solid #444; border-radius: 5px; padding: 10px; display: flex; align-items: center; justify-content: space-between;">
                <div style="flex: 1; text-align: left; color: ${color}; text-decoration: ${textDec}; font-size: 14px;">
                    ${c.text}
                </div>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <div style="font-weight: bold; color: ${color}; white-space: nowrap; font-size: 14px;">
                        ${progressText}
                    </div>
                    ${!c.completed ? `<button onclick="window.cheatCompleteDailyChallenge(${i})" style="padding: 5px 10px; font-size: 12px; background: #666; color: white; border: none; border-radius: 3px; cursor: pointer;">Cheat Complete</button>` : ''}
                </div>
            </div>
        `;
    }

    html += `
            </div>
            <div style="margin-top: 15px;">
                <button onclick="window.rerollDailyChallenges()" style="padding: 8px 15px; font-size: 14px; background: #2196F3; color: white; border: none; border-radius: 3px; cursor: pointer;">Reroll Challenges</button>
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
        state.stats.dailyChallenges.totalCompleted++;
        showCalendar(); // Refresh UI
    }
};

window.rerollDailyChallenges = function() {
    initDailyChallengesState();
    state.stats.dailyChallenges.rotationIndex++;
    generateActiveChallenges();
    showCalendar();
};

// Tracking Hook function for integration in other modules
window.trackDailyChallenge = function(type, data = {}) {
    if (!state.stats.dailyChallenges || !state.stats.dailyChallenges.active) return;

    let active = state.stats.dailyChallenges.active;
    let updated = false;

    for (let c of active) {
        if (!c.completed && c.type === type) {
            let increment = 1;

            // Custom check logic for specific types based on `data`
            if (type === 'defeat_level' && data.level !== undefined && data.playerLevel !== undefined) {
                if (data.level < data.playerLevel) continue; // Must be same or higher
            }
            if (type === 'defeat_type') {
                if (!data.types || c.extra === undefined || !data.types.includes(c.extra)) continue;
            }
            if (type === 'catch_type') {
                if (!data.types || c.extra === undefined || !data.types.includes(c.extra)) continue;
            }
            if (type === 'catch_ball_tier') {
                if (!data.ball || c.extra === undefined || data.ball !== c.extra) continue;
            }
            if (type === 'catch_sum_iv' && data.sumIv !== undefined) {
                if (data.sumIv <= 480) continue;
            }
            if (type === 'catch_level' && data.level !== undefined && c.extra !== undefined) {
                if (data.level <= c.extra) continue;
            }
            if (type === 'catch_different_species') {
                if (!data.species) continue;
                if (!state.stats.dailyChallenges.caughtSpecies) {
                    state.stats.dailyChallenges.caughtSpecies = [];
                }
                if (state.stats.dailyChallenges.caughtSpecies.includes(data.species)) {
                    continue; // Already caught this species today
                }
                state.stats.dailyChallenges.caughtSpecies.push(data.species);
            }

            // Missing checks addition
            if (type === 'defeat_underdog' && data.level !== undefined && data.playerLevel !== undefined) {
                if (data.playerLevel > data.level - 5) continue; // Player must be at least 5 levels lower
            }
            if (type === 'catch_species') {
                // Assuming c.extra holds the target species name, we only increment if it matches
                                if (!data.species || (c.extra && data.species !== c.extra)) continue;
            }

            // Value-based increments
            if (type === 'sell_pokemon' && data.count !== undefined) increment = data.count;
            if (type === 'earn_money' && data.amount !== undefined) increment = data.amount;
            if (type === 'spend_balls' && data.amount !== undefined) increment = data.amount;
            if (type === 'spend_potions' && data.amount !== undefined) increment = data.amount;
            if (type === 'gain_levels' && data.amount !== undefined) increment = data.amount;
            if (type === 'sleep_minutes' && data.amount !== undefined) increment = data.amount;
            if (type === 'gain_exp' && data.amount !== undefined) increment = data.amount;
            if (type === 'daycare_iv' && data.amount !== undefined) increment = data.amount;
            if (type === 'evolve_pokemon' && data.amount !== undefined) increment = data.amount;
            if (type === 'hatch_eggs' && data.amount !== undefined) increment = data.amount;
            if (type === 'heal_center' && data.amount !== undefined) increment = data.amount;
            if (type === 'safari_catch' && data.amount !== undefined) increment = data.amount;
            if (type === 'casino_catch' && data.amount !== undefined) increment = data.amount;
            if (type === 'catch_rare' && data.amount !== undefined) increment = data.amount;
            if (type === 'catch_weak' && data.amount !== undefined) increment = data.amount;

            c.progress += increment;
            if (c.progress >= c.target) {
                c.progress = c.target;
                c.completed = true;
                state.stats.dailyChallenges.totalCompleted++;
            }
            updated = true;
        }
    }
}
export function trackDailyChallenge(type, data = {}) {
    window.trackDailyChallenge(type, data);
}


window.resetDailyChallengeProgress = function(type) {
    if (!state.stats.dailyChallenges || !state.stats.dailyChallenges.active) return;
    let active = state.stats.dailyChallenges.active;
    for (let c of active) {
        if (!c.completed && c.type === type) {
            c.progress = 0;
            if (typeof window.showCalendar === 'function') window.showCalendar();
        }
    }
}
export function resetDailyChallengeProgress(type) {
    window.resetDailyChallengeProgress(type);
}
