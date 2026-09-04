// src/storage.js

export default class Storage {
    constructor() {
        this.saveKey = "idle_pokemon_world_save";
    }

    save(state) {
        try {
            const safeState = JSON.parse(JSON.stringify(state));
            delete safeState.config;
            window.localStorage.setItem(this.saveKey, JSON.stringify(safeState));
            console.log("Game Saved to localStorage.");
        } catch(e) {
            console.error("Save failed:", e);
        }
    }

    load() {
        try {
            const data = window.localStorage.getItem(this.saveKey);
            if (data) {
                console.log("Loading save data from localStorage.");
                return JSON.parse(data);
            }
        } catch(e) {
            console.error("Load failed or file corrupted:", e.message);
        }
        return null;
    }

    reset() {
        try {
            window.localStorage.removeItem(this.saveKey);
            console.log("Save data cleared.");
        } catch(e) {
            console.error("Failed to clear save:", e);
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
