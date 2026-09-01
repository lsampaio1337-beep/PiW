export const state = {
    trainer: {
        level: 1,
        xp: 0,
        money: 0,
        badges: 0
    },
    party: [],
    box: [],
    storage: [],
    safe: [],
    breeding: [],
    training: [],
    backpack: {
        pokeballs: { "Pokeball": 100, "Greatball": 0, "Ultraball": 0, "Safariball": 0, "Masterball": 0 },
        potions: { "Tiny Potion": 100, "Small Potion": 0, "Regular Potion": 0, "Big Potion": 0, "Hyper Potion": 0, "Ultra Potion": 0 },
        stones: {
            "Normal Stone": 0, "Fire Stone": 0, "Water Stone": 0, "Grass Stone": 0,
            "Electric Stone": 0, "Ice Stone": 0, "Fighting Stone": 0, "Poison Stone": 0,
            "Ground Stone": 0, "Flying Stone": 0, "Psychic Stone": 0, "Bug Stone": 0,
            "Rock Stone": 0, "Ghost Stone": 0, "Dragon Stone": 0, "Steel Stone": 0,
            "Dark Stone": 0, "Fairy Stone": 0
        }
    },
    stats: {
        battlesWon: 0,
        caught: 0,
        shiniesSeen: 0,
        shiniesCaught: 0,
        playtime: 0,
        completedChallenges: 0
    },
    settings: {
        gameSpeed: 1.0,
        autoPotion: true,
        activePotionTier: 0, // Tiny
        autoCatch: true,
        activeBallTier: 0 // Pokeball
    },
    currentRoute: "Route 1",
    config: {}
};

// Global reference for battle system
export let globals = {
    battleSystem: null
};

export function setBattleSystem(system) {
    globals.battleSystem = system;
}
