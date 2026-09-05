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

    getProfileData(profileId) {
        try {
            const data = window.localStorage.getItem(profileId);
            return data ? JSON.parse(data) : null;
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
        if (state && state.stats) {
            state.stats.lastSaveTime = Date.now();
        }
        try {
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
