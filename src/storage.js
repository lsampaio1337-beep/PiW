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
        }
    }

    getProfiles() {
        try {
            const data = window.localStorage.getItem(this.masterKey);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.warn("Failed to parse profiles data from localStorage:", e);
            return [];
        }
    }

    getProfileData(profileId) {
        try {
            const data = window.localStorage.getItem(profileId);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.warn(`Failed to parse profile data for ${profileId}:`, e);
            return null;
        }
    }

    deleteProfile(profileId) {
        try {
            window.localStorage.removeItem(profileId);
            let profiles = this.getProfiles();
            profiles = profiles.filter(id => id !== profileId);
            window.localStorage.setItem(this.masterKey, JSON.stringify(profiles));
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
            // Inject a last played timestamp for UI
            state.lastPlayed = Date.now();

            // Simple replacer to avoid the specific dayCareRef circular issue and config without breaking legitimate duplicate objects
            const jsonString = JSON.stringify(state, (key, value) => {
                if (key === 'config' || key === 'dayCareRef') return undefined;
                return value;
            });

            window.localStorage.setItem(this.currentProfileId, jsonString);
            return true;
        } catch(e) {
            console.error("Save failed:", e);
            return false;
        }
    }

    renameProfile(profileId, newName) {
        const trimmed = typeof newName === 'string' ? newName.trim() : '';
        if (!profileId || !trimmed) return false;
        const data = this.getProfileData(profileId);
        if (!data) return false;
        data.profileName = trimmed;
        try {
            window.localStorage.setItem(profileId, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error("Failed to rename profile:", e);
            return false;
        }
    }

    loadProfileIntoState(profileId, state) {
        const pData = this.getProfileData(profileId);
        if (!pData) return { ok: false, error: 'corrupted' };

        this.setCurrentProfile(profileId);

        const isPlainObject = (val) =>
            val !== null && typeof val === 'object' && !Array.isArray(val) && Object.getPrototypeOf(val) === Object.prototype;

        const deepMerge = (target, source) => {
            if (!isPlainObject(source)) return source;
            for (const key of Object.keys(source)) {
                if (key === '__proto__' || key === 'constructor' || key === 'prototype') continue;
                if (isPlainObject(source[key])) {
                    if (!isPlainObject(target[key])) target[key] = {};
                    deepMerge(target[key], source[key]);
                } else {
                    target[key] = source[key];
                }
            }
            return target;
        };

        deepMerge(state, pData);

        if (state.stats && state.stats.caughtSpecies) {
            state.stats.caughtSpeciesCount = Object.keys(state.stats.caughtSpecies).length;
        } else if (state.stats) {
            state.stats.caughtSpeciesCount = 0;
        }

        if (pData.stats) {
            if (pData.stats.playtime !== undefined) state.globalStats.playtime = pData.stats.playtime;
            if (pData.stats.hasSeenProfTutorial !== undefined) state.globalStats.hasSeenProfTutorial = pData.stats.hasSeenProfTutorial;
            if (pData.stats.hasSeenZzZTutorial !== undefined) state.globalStats.hasSeenZzZTutorial = pData.stats.hasSeenZzZTutorial;
            if (pData.stats.hasSeenMultiplayerIcon !== undefined) state.globalStats.hasSeenMultiplayerIcon = pData.stats.hasSeenMultiplayerIcon;
            if (pData.stats.hasSeenGiftIcon !== undefined) state.globalStats.hasSeenGiftIcon = pData.stats.hasSeenGiftIcon;
            if (pData.stats.hasSeenJohtoMap !== undefined) state.globalStats.hasSeenJohtoMap = pData.stats.hasSeenJohtoMap;
            if (pData.stats.hasSeenDaycare !== undefined) state.stats.hasSeenDaycare = pData.stats.hasSeenDaycare;
            if (pData.stats.hasSeenBonusCandyModal !== undefined) state.globalStats.hasSeenBonusCandyModal = pData.stats.hasSeenBonusCandyModal;
        }

        if (!state.currentRegionName) {
            state.currentRegionName = 'Kanto';
        }
        if (!state.regions) {
            state.regions = {};
        }
        if (state.settings && state.settings.autoPotionThreshold === undefined) {
            state.settings.autoPotionThreshold = 25;
        }

        return { ok: true, data: pData };
    }

    load() {
        if (!this.currentProfileId) return null;
        return this.getProfileData(this.currentProfileId);
    }

    loadProfileIntoState(profileId, state) {
        if (!profileId || !state) {
            return { ok: false, error: "Invalid profileId or state" };
        }
        const data = this.getProfileData(profileId);
        if (!data || typeof data !== "object") {
            return { ok: false, error: "Profile data missing or corrupted" };
        }

        const preservedConfig = state.config;
        Object.assign(state, data);
        if (preservedConfig !== undefined) {
            state.config = preservedConfig;
        }
        this.setCurrentProfile(profileId);
        return { ok: true };
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
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'export_log.txt';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
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
            if (!isNaN(speed) && speed > 0) {
                state.settings.gameSpeed = speed;
            }
        } else if (cmd.startsWith("M") && cmd.length > 1) {
            const money = parseInt(cmd.substring(1));
            if (!isNaN(money)) {
                state.trainer.money += money;
            }
        } else if (cmd.startsWith("XP") && cmd.length > 2) {
            const xp = parseInt(cmd.substring(2));
            if (!isNaN(xp)) {
                state.trainer.xp += xp;
                if (state.party.length > 0) state.party[0].xp += xp;
            }
        }
    }
}
