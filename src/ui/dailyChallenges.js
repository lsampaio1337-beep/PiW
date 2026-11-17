import { state } from '../state.js';
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

function parseAreaNames(id) {
    if (!id) return [];
    const region = state.currentRegionName || 'Kanto';
    const rawNames = [];
    if (id.includes(",")) {
        const parts = id.split(",");
        const baseRoute = parts[0].replace(/\s*\(.*?\)/, "").replace(/[0-9]+$/, "").trim();
        rawNames.push(parts[0].trim());
        for (let i = 1; i < parts.length; i++) {
            const num = parts[i].trim();
            if (num && !isNaN(num)) {
                rawNames.push(`${baseRoute} ${num}`.trim());
            } else if (num) {
                rawNames.push(num);
            }
        }
    } else {
        rawNames.push(id.trim());
    }

    const result = [];
    for (const raw of rawNames) {
        if (!raw) continue;
        result.push(raw);
        const stripped = raw.replace(/\s*\(.*?\)/, "").trim();
        if (stripped && stripped !== raw) {
            result.push(stripped);
        }
        if (stripped) {
            result.push(`${stripped} (${region})`);
        }
    }
    return result;
}

function lookupPokemon(pid) {
    if (state.config?.pokemonMap) {
        return state.config.pokemonMap.get(Number(pid)) || state.config.pokemonMap.get(pid);
    }
    return state.config?.pokemonData?.find(p => p && (p.id === pid || p.id === Number(pid)));
}

function getUnlockedRoutes() {
    const routes = window.getCurrentRoutes ? window.getCurrentRoutes() : [];
    if (!state.config || !routes) {
        return [];
    }

    const region = state.currentRegionName || 'Kanto';
    const unlockedAreas = new Set();

    if (Array.isArray(state.stats.completedChallengeIds)) {
        state.stats.completedChallengeIds.forEach(id => {
            parseAreaNames(id).forEach(area => unlockedAreas.add(area));
        });
    }

    if (Array.isArray(state.stats.activeChallenges)) {
        state.stats.activeChallenges.forEach(id => {
            parseAreaNames(id).forEach(area => unlockedAreas.add(area));
        });
    }

    const unlocks = window.getCurrentUnlocks ? window.getCurrentUnlocks() : null;
    if (unlocks && Array.isArray(state.stats.completedChallengeIds)) {
        for (const unlock of unlocks) {
            if (state.stats.completedChallengeIds.includes(unlock.areaId) && Array.isArray(unlock.unlocks)) {
                unlock.unlocks.forEach(u => parseAreaNames(u).forEach(a => unlockedAreas.add(a)));
            }
        }
    }

    unlockedAreas.add('Route 1');
    unlockedAreas.add(`Route 1 (${region})`);

    const routeMap = new Map();
    for (const r of routes) routeMap.set(r.name, r);

    const matchedRoutes = [];
    for (const area of unlockedAreas) {
        const route = routeMap.get(area);
        if (route && route.spawns) {
            matchedRoutes.push(route);
        }
    }
    return matchedRoutes;
}

function getAvailableTypesFromUnlockedRoutes() {
    const availableTypes = new Set();
    for (const route of getUnlockedRoutes()) {
        for (const s of route.spawns) {
            const pData = lookupPokemon(s.pokemonId);
            if (pData && pData.types) {
                pData.types.forEach(t => availableTypes.add(t));
            }
        }
    }
    const typeArr = Array.from(availableTypes);
    if (typeArr.length === 0) return 'Normal';
    return typeArr[Math.floor(Math.random() * typeArr.length)];
}




const CHALLENGE_DEFS = {
    combat: [
        { id: 1, text: "The Rival: Defeat $ Pokémon with the same (or higher) level as your Pokémon.", getTarget: () => 10, type: 'defeat_level' },
        { id: 2, text: "Type Master: Defeat $ {extra} Pokémon.", getTarget: () => 10 + ((state.stats.completedChallengeIds ? state.stats.completedChallengeIds.length : 0) * 2), type: 'defeat_type', getExtra: () => getAvailableTypesFromUnlockedRoutes() },
        { id: 31, text: "Species Master: Defeat $ {extra}.", getTarget: () => 10 + ((state.stats.completedChallengeIds ? state.stats.completedChallengeIds.length : 0) * 2), type: 'defeat_species', getExtra: () => {
            const availableSpecies = new Set();
            for (const route of getUnlockedRoutes()) {
                for (const s of route.spawns) {
                    availableSpecies.add(s.pokemonId);
                }
            }
            const speciesArr = Array.from(availableSpecies);
            if (speciesArr.length === 0) return 'Pidgey';
            const pid = speciesArr[Math.floor(Math.random() * speciesArr.length)];
            const pData = lookupPokemon(pid);
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
        { id: 10, text: "Gotta Catch 'Em All: Catch 2 different species of Pokémon today.", getTarget: () => 2, type: 'catch_different_species', condition: () => (state.stats.caughtSpeciesCount || 0) < 148 },
        { id: 11, text: "Rare: Catch $ Rare Pokémon.", getTarget: () => 2 + state.trainer.badges, type: 'catch_rare' },
        { id: 12, text: "Weak: Catch $ Weak Pokémon.", getTarget: () => 2 + state.trainer.badges, type: 'catch_weak' },
        { id: 13, text: "Specific Species: Catch $ {extra}.", getTarget: () => Math.max(5, (state.stats.completedChallengeIds ? state.stats.completedChallengeIds.length : 1)), type: 'catch_species', getExtra: () => {
            let caught = Object.keys(state.stats.caughtSpecies || {});
            let casinoUnlocked = state.stats.completedChallengeIds && (state.stats.completedChallengeIds.includes('Celadon Casino') || state.stats.completedChallengeIds.includes('Celadon Casino Starter Troupe'));
            if (!casinoUnlocked) {
                caught = caught.filter(species => !['Bulbasaur', 'Charmander', 'Squirtle'].includes(species));
            }
            if (caught.length === 0) return 'Pidgey';
            return caught[Math.floor(Math.random() * caught.length)];
        } },
        { id: 14, text: "Type Enthusiast: Catch $ {extra} Pokémon.", getTarget: () => 5 + (state.trainer.badges * 2), type: 'catch_type', getExtra: () => getAvailableTypesFromUnlockedRoutes() },
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
        { id: 26, text: "Daycare Manager: Gain $ IV in daycare.", getTarget: () => 10 + (state.stats.highestLevelCaptured || 0), type: 'daycare_iv', condition: () => state.stats.hasSeenDaycare },
        { id: 27, text: "Breeder: Hatch $ Eggs from the Daycare.", getTarget: () => Math.random() < 0.5 ? 1 : 2, type: 'hatch_eggs', condition: () => state.stats.hasSeenDaycare },
        { id: 28, text: "Safari Tourist: Catch $ Pokémon in the Safari Zone.", getTarget: () => 5 + ((state.stats.completedChallenges || 0) * 2), type: 'safari_catch', condition: () => state.stats.completedChallengeIds && state.stats.completedChallengeIds.includes("Fuchsia City") },
        { id: 29, text: "High Roller: Catch $ Pokémon in the Celadon Casino.", getTarget: () => 5 * Math.max(1, state.trainer.badges), type: 'casino_catch', condition: () => state.stats.completedChallengeIds && state.stats.completedChallengeIds.includes('Celadon Casino') },
        { id: 30, text: "Lucky Spinner: See 1 Shiny Pokémon in the Celadon Casino.", getTarget: () => 1, type: 'casino_shiny', condition: () => state.stats.completedChallengeIds && state.stats.completedChallengeIds.includes('Celadon Casino') }
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
        <div class="cal-challenges-section">
            <div class="cal-section-header">
                <h2 class="cal-section-title">Daily Challenges</h2>
            </div>
            <div class="cal-challenges-list">
    `;

    for (let i = 0; i < active.length; i++) {
        let c = active[i];
        let target = Math.max(1, c.target || 1);
        let pct = c.completed ? 100 : Math.min(100, Math.round(((c.progress || 0) / target) * 100));
        let progressText = c.completed ? `${target} / ${target}` : `${c.progress} / ${target}`;

        let cardClass = 'cal-challenge-card';
        if (c.claimed) {
            cardClass += ' cal-challenge-card--claimed';
        } else if (c.completed) {
            cardClass += ' cal-challenge-card--ready';
        }

        html += `
            <div class="${cardClass}">
                <div class="cal-challenge-info">
                    <div class="cal-challenge-text">
                        ${c.text}
                    </div>
                    <div class="cal-progress-track">
                        <div class="cal-progress-fill" style="width: ${pct}%;"></div>
                    </div>
                </div>
                <div class="cal-challenge-actions">
                    <div class="cal-progress-label">
                        ${progressText}
                    </div>
                    ${c.claimed ? `<span class="cal-completed-pill">&#10003; Claimed</span>` : ''}
                    ${c.completed && !c.claimed ? `<button class="cal-btn cal-btn--claim" onclick="window.claimDailyChallengeToken(${i})">Claim <img src="Assets/Extra/Token.png" style="width: 15px; height: 15px;"></button>` : ''}
                    ${!c.completed ? `<button class="cal-btn cal-btn--cheat" onclick="window.cheatCompleteDailyChallenge(${i})">Cheat</button>` : ''}
                    ${!c.completed ? `<button class="cal-btn cal-btn--reroll" ${state.stats.dailyChallenges.hasRerolled ? 'disabled' : ''} onclick="window.rerollIndividualDailyChallenge(${i})">Reroll</button>` : ''}
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

function refreshCalendarActivitiesIfOpen() {
    const calWin = document.getElementById('window-calendar');
    if (typeof showCalendar === 'function' && calWin && calWin.offsetParent !== null && window.currentCalendarTab !== 'shop') {
        showCalendar('activities');
    }
}

window.cheatCompleteDailyChallenge = function(index) {
    let active = state.stats.dailyChallenges.active;
    if (active && active[index] && !active[index].completed) {
        active[index].progress = active[index].target;
        active[index].completed = true;
        const calWin = document.getElementById('window-calendar');
        state.stats.dailyChallenges.hasSeenNotification = !!(calWin && calWin.offsetParent !== null);
        if (typeof window.updateMainControl === 'function') window.updateMainControl();
        refreshCalendarActivitiesIfOpen();
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
        refreshCalendarActivitiesIfOpen();
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

        let availableCategories = Object.keys(categoryLists).filter(key => !activeCategories.has(key) && categoryLists[key].length > 0);

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

    refreshCalendarActivitiesIfOpen();
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
        const calWin = document.getElementById('window-calendar');
        if (typeof showCalendar === 'function' && calWin && calWin.offsetParent !== null && window.currentCalendarTab !== 'shop') {
            showCalendar('activities');
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
