// src/storage.js

export default class Storage {
    constructor() {
        this.masterKey = "idle_pokemon_world_profiles";
        this.currentProfileId = null;

        // Migrate old single save to new profile system if exists
        this.migrateOldSave();
    }

    migrateOldSave() {
        const oldData = window.localStorage.getItem("idle_pokemon_world_save");
        if (oldData) {
            const newProfileId = "profile_" + Date.now();
            window.localStorage.setItem(newProfileId, oldData);
            window.localStorage.removeItem("idle_pokemon_world_save");

            let profiles = this.getProfiles();
            profiles.push(newProfileId);
            window.localStorage.setItem(this.masterKey, JSON.stringify(profiles));
            console.log("Migrated old save to new profile system.");
        }
    }

    getProfiles() {
        try {
            const data = window.localStorage.getItem(this.masterKey);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    }


    migrateToRegions(profileData) {
        if (!profileData) return profileData;
        if (profileData.regions && profileData.activeRegion) {
            return profileData; // Already migrated
        }

        console.log("Migrating save file to support Regions...");

        // Start with a clone of the old data to pull global things
        let newData = JSON.parse(JSON.stringify(profileData));

        // Create the region structure
        newData.activeRegion = 'Kanto';
        newData.regions = {
            Kanto: {},
            Johto: {
                trainer: { money: 0, badges: 0, tokens: 0 },
                party: [], box: [], storage: [], safe: [], breeding: [], training: [],
                backpack: {
                    pokeballs: { "Pokeball": 0, "Greatball": 0, "Ultraball": 0, "Safariball": 0, "Masterball": 0 },
                    potions: { "Tiny Potion": 0, "Small Potion": 0, "Regular Potion": 0, "Big Potion": 0, "Huge Potion": 0, "Ultra Potion": 0 },
                    stones: { "Normal Stone": 0, "Fire Stone": 0, "Water Stone": 0, "Grass Stone": 0, "Electric Stone": 0, "Ice Stone": 0, "Fighting Stone": 0, "Poison Stone": 0, "Ground Stone": 0, "Flying Stone": 0, "Psychic Stone": 0, "Bug Stone": 0, "Rock Stone": 0, "Ghost Stone": 0, "Dragon Stone": 0, "Steel Stone": 0, "Dark Stone": 0, "Fairy Stone": 0 }
                },
                stats: {
                    battlesWon: 0, caught: 0, shiniesSeen: 0, shiniesCaught: 0, faints: 0, completedChallenges: 0,
                    activeChallenges: ["Route 1"], completedChallengeIds: [],
                    qTaskTier: 0, cTaskTier: 0, shinySeenTaskTier: 0, shinyCaughtTaskTier: 0, levelTaskTier: 0,
                    caughtLvl15: 0, caughtLvl30: 0, caughtLvl45: 0, caughtLvl60: 0, caughtLvl75: 0, ivTaskTier: 0,
                    bonusCandyDefeats: 0, whiteCandies: 0, greenCandies: 0, purpleCandies: 0, blackYellowCandies: 0, rainbowCandies: 0, candyPurchaseHistory: [],
                    dailyRewards: { daysClaimed: 0, lastClaimDate: null }, dailyChallenges: { lastDate: null, rotationIndex: 0, active: [], totalCompleted: 0 },
                    jigglypuffGrains: 0, jigglypuffGrainsUsed: 0, hasSeenOakTutorial: false, hasSeenZzZTutorial: false, newRoutes: [], hasPickedStarter: false,
                    upgrades: { ballsTier: 0, potionsTier: 0, boxTier: 0, glassTier: 0, smartwatchTier: 0, speedTier: 0, lootTier: 0 },
                    upgradesUnlocked: { balls: false, potions: false, box: false, glass: true, smartwatch: false, speed: false, loot: false }
                },
                currentRoute: "Route 1"
            }
        };

        // Move all root-level regional data into Kanto
        const regionKeys = ['trainer', 'party', 'box', 'storage', 'safe', 'breeding', 'training', 'backpack', 'currentRoute'];
        for (let key of regionKeys) {
            if (profileData[key] !== undefined) {
                newData.regions.Kanto[key] = profileData[key];
                // Keep it at root too so the game can access it directly
            }
        }

        // Migrate stats. Some go global, some stay in region (Kanto)
        if (profileData.stats) {
            newData.globalStats = {
                playtime: profileData.stats.playtime || 0,
                tokensEarned: profileData.stats.tokensEarned || 0,
                hasSeenMultiplayerIcon: profileData.stats.hasSeenMultiplayerIcon || false,
                hasUnseenMap: profileData.stats.hasUnseenMap || false,
                hasSeenJohtoMap: profileData.stats.hasSeenJohtoMap || false
            };

            // Clean global stats out of Kanto's stats
            let kantoStats = JSON.parse(JSON.stringify(profileData.stats));
            delete kantoStats.playtime;
            delete kantoStats.tokensEarned;
            delete kantoStats.hasSeenMultiplayerIcon;
            delete kantoStats.hasUnseenMap;
            delete kantoStats.hasSeenJohtoMap;
            kantoStats.hasPickedStarter = profileData.stats.hasPickedJohtoStarter || true; // they already played

            newData.regions.Kanto.stats = kantoStats;

            // Re-assign the cleaned Kanto stats to root so root reflects Kanto accurately
            newData.stats = kantoStats;
        }

        return newData;
    }

    getProfileData(profileId) {
        try {
            const data = window.localStorage.getItem(profileId);
            let parsed = data ? JSON.parse(data) : null;
            return this.migrateToRegions(parsed);
        } catch (e) {
            return null;
        }
    }


    deleteProfile(profileId) {
        try {
            window.localStorage.removeItem(profileId);
            let profiles = this.getProfiles();
            profiles = profiles.filter(id => id !== profileId);
            window.localStorage.setItem(this.masterKey, JSON.stringify(profiles));
            console.log(`Profile ${profileId} deleted.`);
        } catch (e) {
            console.error("Failed to delete profile:", e);
        }
    }

    clearAllProfiles() {
        try {
            let profiles = this.getProfiles();
            for (let pid of profiles) {
                window.localStorage.removeItem(pid);
            }
            window.localStorage.removeItem(this.masterKey);
            console.log("All profiles cleared.");
        } catch(e) {
            console.error("Failed to clear all profiles:", e);
        }
    }

    setCurrentProfile(profileId) {
        this.currentProfileId = profileId;
    }

    createNewProfile() {
        const newProfileId = "profile_" + Date.now();
        let profiles = this.getProfiles();
        profiles.push(newProfileId);
        window.localStorage.setItem(this.masterKey, JSON.stringify(profiles));
        this.currentProfileId = newProfileId;
        return newProfileId;
    }


    save(state) {
        if (!this.currentProfileId) {
            console.error("Cannot save: No current profile selected.");
            return;
        }
        try {
            // Before saving, ensure the active region's data in the root is synced back to its region slot
            if (state.activeRegion && state.regions && state.regions[state.activeRegion]) {
                const regionKeys = ['trainer', 'party', 'box', 'storage', 'safe', 'breeding', 'training', 'backpack', 'stats', 'currentRoute'];
                for (let key of regionKeys) {
                    if (state[key] !== undefined) {
                        state.regions[state.activeRegion][key] = JSON.parse(JSON.stringify(state[key]));
                    }
                }
            }

            // Simple replacer to avoid the specific dayCareRef circular issue and config without breaking legitimate duplicate objects

            const jsonString = JSON.stringify(state, (key, value) => {
                if (key === 'config') return undefined;
                if (key === 'dayCareRef') return undefined;
                return value;
            });
            const safeState = JSON.parse(jsonString);

            // Inject a last played timestamp for UI
            safeState.lastPlayed = Date.now();

            window.localStorage.setItem(this.currentProfileId, JSON.stringify(safeState));
            console.log(`Game Saved to localStorage profile ${this.currentProfileId}.`);
        } catch(e) {
            console.error("Save failed:", e);
        }
    }

    load() {
        if (!this.currentProfileId) return null;
        return this.getProfileData(this.currentProfileId);
    }

    reset() {
        if (!this.currentProfileId) return;
        try {
            // Keep the profile ID but clear the data inside it, so New Game starts fresh
            window.localStorage.removeItem(this.currentProfileId);
            console.log("Save data cleared for current profile.");
        } catch(e) {
            console.error("Failed to clear save:", e);
        }
    }

    exportLog(state) {
        try {
            const logContent = `
Stats:
Battles Won: ${state.stats.battlesWon}
Pokemon Caught: ${state.stats.caught}

Party:
${state.party.map((p, i) => `${i+1}. ${p.name} Lv.${p.level}`).join('\n')}
            `;
            // Browser-based download
            const blob = new Blob([logContent], { type: 'text/plain' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'export_log.txt';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            console.log("Log exported.");
        } catch(e) {
            console.error("Log export failed:", e);
        }
    }

    processCheat(command, state) {
        const parts = command.split(' ');
        if (parts.length === 0) return;
        const cmd = parts[0];

        if (cmd.startsWith("GS") && cmd.length > 2) {
            const speed = parseFloat(cmd.substring(2));
            if (!isNaN(speed)) {
                state.settings.gameSpeed = speed;
                console.log(`Game speed set to ${speed}x`);
            }
        } else if (cmd.startsWith("M") && cmd.length > 1) {
            const money = parseInt(cmd.substring(1));
            if (!isNaN(money)) {
                state.trainer.money += money;
                console.log(`Added $${money}`);
            }
        } else if (cmd.startsWith("XP") && cmd.length > 2) {
            const xp = parseInt(cmd.substring(2));
            if (!isNaN(xp)) {
                state.trainer.xp += xp;
                if (state.party.length > 0) state.party[0].xp += xp;
                console.log(`Added ${xp} XP to Trainer & Slot 1`);
            }
        }
    }
}
