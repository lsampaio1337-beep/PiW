import { state } from './state.js';

export const CHALLENGE_TYPES = {
    DEFEAT_LEVEL: 'DEFEAT_LEVEL', // Defeat $ Pokemon with the same (or higher) level as your highest level Pokemon
    DEFEAT_TYPE: 'DEFEAT_TYPE', // Defeat $ Pokemon of a specific type
    CATCH_IV: 'CATCH_IV', // Catch $ Pokemon with a SumIV greater than #
    SELL_POKEMON: 'SELL_POKEMON', // Sell $ Pokemon to the PokeMarket
    BUY_VITAMIN: 'BUY_VITAMIN' // Buy $ Vitamins from the shop
};

// Generates 2 random challenges for the day
export function generateDailyChallenges() {
    const highestLevel = state.stats.highestLevelCaptured || 1;
    const routesUnlocked = state.config.unlocks ? state.config.unlocks.length : 1;
    const completedChallenges = state.stats.completedChallenges || 0;
    const highestSumIV = state.stats.highestSumIV || 30;

    const possibleChallenges = [
        {
            type: CHALLENGE_TYPES.DEFEAT_LEVEL,
            target: Math.max(5, Math.floor(highestLevel * 0.10)),
            current: 0,
            description: `Defeat {target} Pokémon with same or higher level than your highest captured (Lv. ${highestLevel})`
        },
        {
            type: CHALLENGE_TYPES.DEFEAT_TYPE,
            target: 10 + (routesUnlocked * 2),
            current: 0,
            typeTarget: getRandomType(),
            description: `Defeat {target} {typeTarget}-type Pokémon`
        },
        {
            type: CHALLENGE_TYPES.CATCH_IV,
            target: 3 + Math.floor(highestLevel / 10),
            ivTarget: Math.floor(highestSumIV * 0.8),
            current: 0,
            description: `Catch {target} Pokémon with SumIV > {ivTarget}`
        },
        {
            type: CHALLENGE_TYPES.SELL_POKEMON,
            target: Math.max(5, 10 * completedChallenges),
            current: 0,
            description: `Sell {target} Pokémon to the PokeMarket`
        },
        {
            type: CHALLENGE_TYPES.BUY_VITAMIN,
            target: 1 + Math.floor(completedChallenges / 10),
            current: 0,
            description: `Buy {target} Vitamins`
        }
    ];

    // Pick 2 random unique challenges
    const list = [];
    while (list.length < 2 && possibleChallenges.length > 0) {
        const idx = Math.floor(Math.random() * possibleChallenges.length);
        list.push(possibleChallenges.splice(idx, 1)[0]);
    }

    return list;
}

function getRandomType() {
    const types = ["Normal", "Fire", "Water", "Grass", "Electric", "Ice", "Fighting", "Poison", "Ground", "Flying", "Psychic", "Bug", "Rock", "Ghost", "Dragon"];
    return types[Math.floor(Math.random() * types.length)];
}

function getLocalDateString() {
    const now = new Date();
    return now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
}

export function checkAndInitializeDailyChallenges() {
    if (!state.stats.dailyChallenges) {
        state.stats.dailyChallenges = { date: null, list: [], claimed: false };
    }

    const today = getLocalDateString();
    if (state.stats.dailyChallenges.date !== today) {
        state.stats.dailyChallenges.date = today;
        state.stats.dailyChallenges.list = generateDailyChallenges();
        state.stats.dailyChallenges.claimed = false;
    }
}

export function updateChallengeProgress(type, amount = 1, metadata = {}) {
    if (!state.stats.dailyChallenges || !state.stats.dailyChallenges.list) return;

    // First ensure they are initialized for today
    checkAndInitializeDailyChallenges();

    let updated = false;
    state.stats.dailyChallenges.list.forEach(c => {
        if (c.type === type && c.current < c.target) {
            let matches = true;

            if (type === CHALLENGE_TYPES.DEFEAT_LEVEL) {
                if (metadata.level < (state.stats.highestLevelCaptured || 1)) matches = false;
            } else if (type === CHALLENGE_TYPES.DEFEAT_TYPE) {
                if (!metadata.types || !metadata.types.includes(c.typeTarget)) matches = false;
            } else if (type === CHALLENGE_TYPES.CATCH_IV) {
                if (metadata.sumIV <= c.ivTarget) matches = false;
            }

            if (matches) {
                c.current = Math.min(c.target, c.current + amount);
                updated = true;
            }
        }
    });

    if (updated) {
        // If we want a notification, we can trigger it here, but UI updating in battle loop is sufficient
        if (window.updateTopbar) window.updateTopbar();
    }
}

export function claimDailyChallengeReward() {
    checkAndInitializeDailyChallenges();
    const dc = state.stats.dailyChallenges;

    if (dc.claimed) return;

    const allCompleted = dc.list.every(c => c.current >= c.target);
    if (allCompleted) {
        if (!state.backpack.tokens) state.backpack.tokens = { "Daily Token": 0 };
        state.backpack.tokens["Daily Token"] = (state.backpack.tokens["Daily Token"] || 0) + 1;
        dc.claimed = true;

        if (window.showCalendar) window.showCalendar();
        if (window.updateTopbar) window.updateTopbar();
        if (window.showGameAlert) window.showGameAlert("Claimed 1x Daily Token!");
    }
}

// Attach to window for UI
if (typeof window !== 'undefined') window.claimDailyChallengeReward = claimDailyChallengeReward;
