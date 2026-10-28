export const REGION_TEMPLATE = {
    trainer: {
        money: 0,
        badges: 0,
        tokens: 0
    },
    party: [],
    box: [],
    storage: [],
    safe: [],
    breeding: [],
    training: [],
    backpack: {
        pokeballs: { "Pokeball": 0, "Greatball": 0, "Ultraball": 0, "Safariball": 0, "Masterball": 0 },
        potions: { "Tiny Potion": 0, "Small Potion": 0, "Regular Potion": 0, "Big Potion": 0, "Huge Potion": 0, "Ultra Potion": 0 },
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
        faints: 0,
        tokensEarned: 0,
        completedChallenges: 0,
        activeChallenges: ["Route 1"],
        completedChallengeIds: [],
        qTaskTier: 0,
        cTaskTier: 0,
        shinySeenTaskTier: 0,
        shinyCaughtTaskTier: 0,
        levelTaskTier: 0,
        caughtLvl15: 0,
        caughtLvl30: 0,
        caughtLvl45: 0,
        caughtLvl60: 0,
        caughtLvl75: 0,
        ivTaskTier: 0,
        bonusCandyDefeats: 0,
        whiteCandies: 0,
        greenCandies: 0,
        purpleCandies: 0,
        blackYellowCandies: 0,
        rainbowCandies: 0,
        candyPurchaseHistory: [],
        dailyRewards: { daysClaimed: 0, lastClaimDate: null },
        dailyChallenges: { lastDate: null, rotationIndex: 0, active: [], totalCompleted: 0 },
        jigglypuffGrains: 0,
        jigglypuffGrainsUsed: 0,
        newRoutes: [],
        hasUnseenMap: false,
        hasPickedStarter: false,
        seenSpecies: {},
        caughtSpecies: {},
        caughtSpeciesCount: 0,
        seenShiniesSpecies: {},
        caughtShiniesSpecies: {},
        upgrades: {
            ballsTier: 0,
            potionsTier: 0,
            boxTier: 0,
            glassTier: 0,
            smartwatchTier: 0,
            speedTier: 0,
            lootTier: 0
        },
        upgradesUnlocked: {
            balls: false,
            potions: false,
            box: false,
            glass: true,
            smartwatch: false,
            speed: false,
            loot: false
        }
    },
    currentRoute: "Route 1",
    currentRegionName: "Kanto",
    isZzZMode: false,
    zzzTimestamp: null
};

export const state = {
    ...JSON.parse(JSON.stringify(REGION_TEMPLATE)),
    globalStats: {
        playtime: 0,
        hasSeenProfTutorial: false,
        hasSeenZzZTutorial: false,
        hasSeenMultiplayerIcon: false,
        hasSeenGiftIcon: false,
        hasSeenJohtoMap: false,
        hasSeenDaycare: false,
        hasSeenBonusCandyModal: false
    },
    settings: {
        gameSpeed: 1.0,
        autoPotion: true,
        autoPotionThreshold: 25,
        activePotionTier: 0, // Tiny
        autoCatch: true,
        activeBallTier: 0, // Pokeball
        windowSettings: {}, // Stores window positions and sizes
        smartCapture: {},
        smartCaptureShiny: {},
        globalSmartCaptureShiny: undefined
    },
    regions: {},
    config: {}
};


// Global reference for battle system
export let globals = {
    battleSystem: null
};

export function setBattleSystem(system) {
    globals.battleSystem = system;
}

export function checkFinalChallengeCompleted(regionName = 'Kanto') {
    let stats;
    if (state.currentRegionName === regionName || (!state.currentRegionName && regionName === 'Kanto')) {
        stats = state.stats;
    } else if (state.regions && state.regions[regionName] && state.regions[regionName].stats) {
        stats = state.regions[regionName].stats;
    }

    if (!stats || !stats.completedChallengeIds) return false;

    let routes = state.config && state.config.routes ? state.config.routes : [];
    if (regionName === 'Johto' && state.config && state.config.johtoRoutes) {
        routes = state.config.johtoRoutes;
    } else if (regionName === 'Hoenn' && state.config && state.config.hoennRoutes) {
        routes = state.config.hoennRoutes;
    } else if (regionName === 'Sinnoh' && state.config && state.config.sinnohRoutes) {
        routes = state.config.sinnohRoutes;
    } else if (regionName === 'Unova' && state.config && state.config.unovaRoutes) {
        routes = state.config.unovaRoutes;
    } else if (regionName === 'Kalos' && state.config && state.config.kalosRoutes) {
        routes = state.config.kalosRoutes;
    } else if (regionName === 'Alola' && state.config && state.config.alolaRoutes) {
        routes = state.config.alolaRoutes;
    } else if (regionName === 'Hisui' && state.config && state.config.hisuiRoutes) {
        routes = state.config.hisuiRoutes;
    } else if (regionName === 'Paldea' && state.config && state.config.paldeaRoutes) {
        routes = state.config.paldeaRoutes;
    }

    let finalChallenge = routes.find(r => r.challengeName === "Challenge 36" || r.challengeName === "Final Challenge" || r.challengeName === "Johto Final Challenge" || r.challengeName === "Hoenn Final Challenge" || r.challengeName === "Sinnoh Final Challenge" || r.challengeName === "Unova Final Challenge" || r.challengeName === "Challenge 48");
    let finalChallengeId = finalChallenge ? finalChallenge.areaId : (regionName === 'Kanto' ? 'Kanto Pokemon League' : (regionName === 'Johto' ? 'Mount Silver' : (regionName === 'Hoenn' ? 'Battle Frontier' : (regionName === 'Sinnoh' ? 'Spear Pillar' : (regionName === 'Unova' ? 'Giant Chasm' : (regionName === 'Hisui' ? 'Gym - Avalugg' : null))))));

    if (!finalChallengeId) return false;

    return stats.completedChallengeIds.includes(finalChallengeId);
}

export function swapRegion(newRegionName) {
    if (state.currentRegionName === newRegionName) return;

    // Pack current region
    const currentRegion = state.currentRegionName;
    state.regions[currentRegion] = {};
    for (let key in REGION_TEMPLATE) {
        state.regions[currentRegion][key] = JSON.parse(JSON.stringify(state[key]));
    }

    // Initialize or unpack new region
    if (!state.regions[newRegionName]) {
        state.regions[newRegionName] = JSON.parse(JSON.stringify(REGION_TEMPLATE));
        state.regions[newRegionName].currentRegionName = newRegionName;
        // set starting route
        if (newRegionName === 'Johto') {
            state.regions[newRegionName].currentRoute = 'Route 29';
            state.regions[newRegionName].stats.activeChallenges = ['Route 29'];
        } else if (newRegionName === 'Hoenn') {
            state.regions[newRegionName].currentRoute = 'Route 101';
            state.regions[newRegionName].stats.activeChallenges = ['Route 101'];
        } else if (newRegionName === 'Sinnoh') {
            state.regions[newRegionName].currentRoute = 'Route 201';
            state.regions[newRegionName].stats.activeChallenges = ['Route 201'];
        } else if (newRegionName === 'Unova') {
            state.regions[newRegionName].currentRoute = 'Aspertia City';
            state.regions[newRegionName].stats.activeChallenges = ['Aspertia City'];
        } else if (newRegionName === 'Kalos') {
            state.regions[newRegionName].currentRoute = 'Aquacorde Town';
            state.regions[newRegionName].stats.activeChallenges = ['Aquacorde Town'];
        } else if (newRegionName === 'Alola') {
            state.regions[newRegionName].currentRoute = 'Route 1 East';
            state.regions[newRegionName].stats.activeChallenges = ['Route 1 East'];
        } else if (newRegionName === 'Hisui') {
            state.regions[newRegionName].currentRoute = 'Aspiration Hill';
            state.regions[newRegionName].stats.activeChallenges = ['Aspiration Hill'];
        } else if (newRegionName === 'Paldea') {
            state.regions[newRegionName].currentRoute = 'Cabo Poco';
            state.regions[newRegionName].stats.activeChallenges = ['Cabo Poco'];
        }
    }

    // Mount new region to root state
    for (let key in REGION_TEMPLATE) {
        state[key] = state.regions[newRegionName][key];
    }

    state.currentRegionName = newRegionName;
}

window.getCurrentRoutes = function() {
    if (!state.config) return [];
    if (state.currentRegionName === 'Johto' && state.config.johtoRoutes) {
        return state.config.johtoRoutes;
    }
    if (state.currentRegionName === 'Hoenn' && state.config.hoennRoutes) {
        return state.config.hoennRoutes;
    }
    if (state.currentRegionName === 'Sinnoh' && state.config.sinnohRoutes) {
        return state.config.sinnohRoutes;
    }
    if (state.currentRegionName === 'Unova' && state.config.unovaRoutes) {
        return state.config.unovaRoutes;
    }
    if (state.currentRegionName === 'Kalos' && state.config.kalosRoutes) {
        return state.config.kalosRoutes;
    }
    if (state.currentRegionName === 'Alola' && state.config.alolaRoutes) {
        return state.config.alolaRoutes;
    }
    if (state.currentRegionName === 'Hisui' && state.config.hisuiRoutes) {
        return state.config.hisuiRoutes;
    }
    if (state.currentRegionName === 'Paldea' && state.config.paldeaRoutes) {
        return state.config.paldeaRoutes;
    }
    return state.config.routes || [];
};

window.getCurrentUnlocks = function() {
    if (!state.config) return [];
    if (state.currentRegionName === 'Johto' && state.config.johtoUnlocks) {
        return state.config.johtoUnlocks;
    }
    if (state.currentRegionName === 'Hoenn' && state.config.hoennUnlocks) {
        return state.config.hoennUnlocks;
    }
    if (state.currentRegionName === 'Sinnoh' && state.config.sinnohUnlocks) {
        return state.config.sinnohUnlocks;
    }
    if (state.currentRegionName === 'Unova' && state.config.unovaUnlocks) {
        return state.config.unovaUnlocks;
    }
    if (state.currentRegionName === 'Kalos' && state.config.kalosUnlocks) {
        return state.config.kalosUnlocks;
    }
    if (state.currentRegionName === 'Alola' && state.config.alolaUnlocks) {
        return state.config.alolaUnlocks;
    }
    if (state.currentRegionName === 'Hisui' && state.config.hisuiUnlocks) {
        return state.config.hisuiUnlocks;
    }
    if (state.currentRegionName === 'Paldea' && state.config.paldeaUnlocks) {
        return state.config.paldeaUnlocks;
    if (state.currentRegionName === 'Galar' && state.config.galarUnlocks) {
        return state.config.galarUnlocks;
    }
    return state.config.unlocks || [];
};
