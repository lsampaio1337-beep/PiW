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
            totalCompleted: 0
        };
    }
}

function getLocalDateString() {
    const now = new Date();
    return now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
}



const CHALLENGE_DEFS = {
    combat: [
        { id: 1, text: "The Rival: Defeat $ Pokémon with the same (or higher) level as your Pokémon.", getTarget: () => 10, type: 'defeat_level' },
        { id: 2, text: "Type Master: Defeat $ {extra} Pokémon.", getTarget: () => 10 + ((state.stats.completedChallengeIds ? state.stats.completedChallengeIds.length : 0) * 2), type: 'defeat_type', getExtra: () => {
            let availableTypes = new Set();
            if (state.config && state.config.unlocks && state.stats.completedChallengeIds) {
                for (let unlock of state.config.unlocks) {
                    if (state.stats.completedChallengeIds.includes(unlock.areaId)) {
                        if (unlock.pokemon) {
                            for (let p of unlock.pokemon) {
                                let pData = state.config.pokemonData.find(pd => pd.name === p.name);
                                if (pData && pData.types) pData.types.forEach(t => availableTypes.add(t));
                            }
                        }
                    }
                }
            }
            let typeArr = Array.from(availableTypes);
            if (typeArr.length === 0) return 'Normal';
            return typeArr[Math.floor(Math.random() * typeArr.length)];
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
            if (caught.length === 0) return 'Pidgey';
            return caught[Math.floor(Math.random() * caught.length)];
        } },
        { id: 14, text: "Type Enthusiast: Catch $ {extra} Pokémon.", getTarget: () => 5 + (state.trainer.badges * 2), type: 'catch_type', getExtra: () => {
            let availableTypes = new Set();
            if (state.config && state.config.unlocks && state.stats.completedChallengeIds) {
                for (let unlock of state.config.unlocks) {
                    if (state.stats.completedChallengeIds.includes(unlock.areaId)) {
                        if (unlock.pokemon) {
                            for (let p of unlock.pokemon) {
                                let pData = state.config.pokemonData.find(pd => pd.name === p.name);
                                if (pData && pData.types) pData.types.forEach(t => availableTypes.add(t));
                            }
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
        { id: 26, text: "Daycare Manager: Gain $ IV in daycare.", getTarget: () => 10 + (state.stats.highestLevelCaptured || 0), type: 'daycare_iv' },
        { id: 27, text: "Breeder: Hatch $ Eggs from the Daycare.", getTarget: () => Math.random() < 0.5 ? 1 : 2, type: 'hatch_eggs' },
        { id: 28, text: "Safari Tourist: Catch $ Pokémon in the Safari Zone.", getTarget: () => 5 + ((state.stats.completedChallenges || 0) * 2), type: 'safari_catch', condition: () => state.stats.completedChallengeIds && state.stats.completedChallengeIds.includes("Fuchsia City") },
        { id: 29, text: "High Roller: Catch $ Pokémon in the Casino.", getTarget: () => 5 * Math.max(1, state.trainer.badges), type: 'casino_catch', condition: () => state.stats.completedChallengeIds && state.stats.completedChallengeIds.includes('Casino') },
        { id: 30, text: "Lucky Spinner: See 1 Shiny Pokémon in the Casino.", getTarget: () => 1, type: 'casino_shiny', condition: () => state.stats.completedChallengeIds && state.stats.completedChallengeIds.includes('Casino') }
    ]
};

function generateActiveChallenges() {
    initDailyChallengesState();
    let r = state.stats.dailyChallenges.rotationIndex;

    let active = [];

    let group = [];
    if (CHALLENGE_DEFS.combat.filter(c => !c.condition || c.condition()).length > 0) group.push(CHALLENGE_DEFS.combat.filter(c => !c.condition || c.condition())[r % CHALLENGE_DEFS.combat.filter(c => !c.condition || c.condition()).length]);
    if (CHALLENGE_DEFS.catching.filter(c => !c.condition || c.condition()).length > 0) group.push(CHALLENGE_DEFS.catching.filter(c => !c.condition || c.condition())[r % CHALLENGE_DEFS.catching.filter(c => !c.condition || c.condition()).length]);
    if (CHALLENGE_DEFS.economy.filter(c => !c.condition || c.condition()).length > 0) group.push(CHALLENGE_DEFS.economy.filter(c => !c.condition || c.condition())[r % CHALLENGE_DEFS.economy.filter(c => !c.condition || c.condition()).length]);
    if (CHALLENGE_DEFS.management.filter(c => !c.condition || c.condition()).length > 0) group.push(CHALLENGE_DEFS.management.filter(c => !c.condition || c.condition())[r % CHALLENGE_DEFS.management.filter(c => !c.condition || c.condition()).length]);
    if (CHALLENGE_DEFS.special.filter(c => !c.condition || c.condition()).length > 0) group.push(CHALLENGE_DEFS.special.filter(c => !c.condition || c.condition())[r % CHALLENGE_DEFS.special.filter(c => !c.condition || c.condition()).length]);

    for (let c of group) {
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
        state.stats.dailyChallenges.hasSeenNotification = false;
        if (typeof window.updateTopbar === 'function') window.updateTopbar();
        if (typeof showCalendar === 'function') showCalendar(); // Refresh UI
    }
};

window.rerollDailyChallenges = function() {
    initDailyChallengesState();
    state.stats.dailyChallenges.rotationIndex++;
    generateActiveChallenges();
    if (typeof showCalendar === 'function') showCalendar();
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

            if (type === 'catch_ball_tier' && data.ball && c.extra) {
                if (data.ball !== c.extra) continue;
            }

            c.progress += increment;
            if (c.progress >= c.target) {
                c.progress = c.target;
                c.completed = true;
                state.stats.dailyChallenges.hasSeenNotification = false;
                state.stats.dailyChallenges.totalCompleted++;
                if (typeof window.updateTopbar === 'function') window.updateTopbar();
            }
            updated = true;
        }
    }
    if (updated) {
        if (document.getElementById('window-calendar')) {
            if (typeof showCalendar === 'function') showCalendar();
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
        if (c.completed) return true;
    }
    return false;
}
