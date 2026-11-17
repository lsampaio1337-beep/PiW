// src/storage.js

const BACKUP_SUFFIX = '__bak';

export default class Storage {
    constructor() {
        this.masterKey = "idle_pokemon_world_profiles";
        this.currentProfileId = null;
        this._saveTimer = null;

        // Migrate old single save to new profile system if exists
        this.migrateOldSave();
        // Synchronize & self-heal profiles between Electron disk storage and localStorage
        this.syncProfiles();
    }

    _getDiskStorage() {
        if (typeof window !== 'undefined' && window.electronAPI && window.electronAPI.saveStorage) {
            return window.electronAPI.saveStorage;
        }
        return null;
    }

    _getLocalStorage() {
        if (typeof window !== 'undefined' && window.localStorage) {
            return window.localStorage;
        }
        return null;
    }

    _parseValidObject(raw) {
        if (typeof raw !== 'string' || raw.trim().length < 2) return null;
        try {
            const parsed = JSON.parse(raw);
            if (parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)) {
                return parsed;
            }
        } catch {
            // corrupted JSON
        }
        return null;
    }

    _hasProgress(data) {
        if (!data || typeof data !== 'object') return false;
        if (Array.isArray(data.party) && data.party.length > 0) return true;
        if (Array.isArray(data.storage) && data.storage.length > 0) return true;
        if (data.stats && data.stats.hasPickedStarter) return true;
        if (data.globalStats && data.globalStats.playtime > 0) return true;
        if (data.stats && data.stats.playtime > 0) return true;
        return false;
    }

    _pickNewerSave(a, b) {
        if (!a) return b || null;
        if (!b) return a;
        const aHasProgress = this._hasProgress(a);
        const bHasProgress = this._hasProgress(b);
        if (aHasProgress && !bHasProgress) return a;
        if (bHasProgress && !aHasProgress) return b;
        const tsA = typeof a.lastPlayed === 'number' ? a.lastPlayed : 0;
        const tsB = typeof b.lastPlayed === 'number' ? b.lastPlayed : 0;
        return tsB > tsA ? b : a;
    }

    _scanLocalStorageProfileIds() {
        const ls = this._getLocalStorage();
        if (!ls || typeof ls.length !== 'number' || typeof ls.key !== 'function') {
            return [];
        }
        const ids = [];
        try {
            for (let i = 0; i < ls.length; i++) {
                const key = ls.key(i);
                if (typeof key === 'string' && key.startsWith('profile_') && !key.endsWith(BACKUP_SUFFIX)) {
                    ids.push(key);
                }
            }
        } catch {
            // ignore iteration errors
        }
        return ids;
    }

    _writeLocalStorageSafe(key, value) {
        const ls = this._getLocalStorage();
        if (!ls) return false;
        try {
            ls.setItem(key, value);
            return true;
        } catch (e) {
            console.warn(`localStorage.setItem failed for ${key}:`, e);
            return false;
        }
    }

    _persistMasterIndex(profiles) {
        const clean = [...new Set((profiles || []).filter(id => typeof id === 'string' && id.length > 0))];
        this._writeLocalStorageSafe(this.masterKey, JSON.stringify(clean));
        const disk = this._getDiskStorage();
        if (disk) {
            try {
                disk.writeMasterIndex(clean);
            } catch (e) {
                console.warn("Failed to write disk master profile index:", e);
            }
        }
        return clean;
    }

    migrateOldSave() {
        const ls = this._getLocalStorage();
        if (!ls) return;
        try {
            const oldData = ls.getItem("idle_pokemon_world_save");
            if (oldData) {
                const parsed = this._parseValidObject(oldData);
                if (!parsed) return;

                const newProfileId = "profile_" + Date.now();
                const wroteLs = this._writeLocalStorageSafe(newProfileId, oldData);
                const disk = this._getDiskStorage();
                let wroteDisk = false;
                if (disk) {
                    const res = disk.writeProfile(newProfileId, oldData);
                    wroteDisk = !!(res && res.ok);
                }

                if (wroteLs || wroteDisk) {
                    ls.removeItem("idle_pokemon_world_save");
                    const profiles = this.getProfiles();
                    if (!profiles.includes(newProfileId)) {
                        profiles.push(newProfileId);
                    }
                    this._persistMasterIndex(profiles);
                }
            }
        } catch (e) {
            console.warn("Failed to migrate old save:", e);
        }
    }

    syncProfiles() {
        try {
            const ls = this._getLocalStorage();
            const disk = this._getDiskStorage();
            if (!ls && !disk) return;

            const mergedIds = new Set();

            // 1. Collect from localStorage master index
            if (ls) {
                try {
                    const rawIdx = ls.getItem(this.masterKey);
                    const parsedIdx = rawIdx ? JSON.parse(rawIdx) : [];
                    if (Array.isArray(parsedIdx)) {
                        parsedIdx.forEach(id => typeof id === 'string' && mergedIds.add(id));
                    }
                } catch {
                    // ignore corrupted index
                }
                // 2. Self-heal from any orphaned profile_* keys in localStorage
                this._scanLocalStorageProfileIds().forEach(id => mergedIds.add(id));
            }

            // 3. Collect from disk (which also self-heals from *.json files on disk)
            if (disk) {
                try {
                    const diskList = disk.listProfiles();
                    if (diskList && Array.isArray(diskList.profiles)) {
                        diskList.profiles.forEach(id => typeof id === 'string' && mergedIds.add(id));
                    }
                } catch (e) {
                    console.warn("Failed to list profiles from disk:", e);
                }
            }

            if (mergedIds.size === 0) return;

            // 4. Reconcile each profile between disk and localStorage
            for (const profileId of mergedIds) {
                let lsData = null;
                if (ls) {
                    lsData = this._parseValidObject(ls.getItem(profileId)) ||
                             this._parseValidObject(ls.getItem(profileId + BACKUP_SUFFIX));
                }

                let diskData = null;
                if (disk) {
                    try {
                        const res = disk.readProfile(profileId);
                        if (res && res.ok && res.data) {
                            diskData = res.data;
                        }
                    } catch {
                        // ignore
                    }
                }

                const best = this._pickNewerSave(diskData, lsData);
                if (!best) continue;

                const serialized = JSON.stringify(best);
                if (disk && (!diskData || best !== diskData)) {
                    try {
                        disk.writeProfile(profileId, serialized);
                    } catch {
                        // ignore
                    }
                }
                if (ls && (!lsData || best !== lsData)) {
                    this._writeLocalStorageSafe(profileId, serialized);
                }
            }

            this._persistMasterIndex([...mergedIds]);
        } catch (e) {
            console.warn("Profile sync encountered an issue:", e);
        }
    }

    getProfiles() {
        const merged = new Set();
        const ls = this._getLocalStorage();
        if (ls) {
            try {
                const data = ls.getItem(this.masterKey);
                const parsed = data ? JSON.parse(data) : [];
                if (Array.isArray(parsed)) {
                    parsed.forEach(id => typeof id === 'string' && merged.add(id));
                }
            } catch (e) {
                console.warn("Failed to parse profiles data from localStorage:", e);
            }
            this._scanLocalStorageProfileIds().forEach(id => merged.add(id));
        }

        const disk = this._getDiskStorage();
        if (disk) {
            try {
                const diskRes = disk.listProfiles();
                if (diskRes && Array.isArray(diskRes.profiles)) {
                    diskRes.profiles.forEach(id => typeof id === 'string' && merged.add(id));
                }
            } catch (e) {
                console.warn("Failed to list profiles from disk:", e);
            }
        }

        return [...merged];
    }

    getProfileData(profileId) {
        if (!profileId || typeof profileId !== 'string') return null;

        let primaryLsData = null;
        let backupLsData = null;
        const ls = this._getLocalStorage();

        if (ls) {
            try {
                const raw = ls.getItem(profileId);
                if (raw) {
                    primaryLsData = this._parseValidObject(raw);
                    if (!primaryLsData) {
                        console.warn(`Failed to parse profile data for ${profileId}: corrupted JSON`);
                    }
                }
            } catch (e) {
                console.warn(`Failed to parse profile data for ${profileId}:`, e);
            }

            try {
                const rawBak = ls.getItem(profileId + BACKUP_SUFFIX);
                if (rawBak) {
                    backupLsData = this._parseValidObject(rawBak);
                }
            } catch {
                // ignore backup read error
            }
        }

        let diskData = null;
        const disk = this._getDiskStorage();
        if (disk) {
            try {
                const res = disk.readProfile(profileId);
                if (res && res.ok && res.data) {
                    diskData = res.data;
                }
            } catch (e) {
                console.warn(`Failed to read profile ${profileId} from disk:`, e);
            }
        }

        const bestLs = this._pickNewerSave(primaryLsData, backupLsData);
        const best = this._pickNewerSave(diskData, bestLs);

        // Self-heal primary localStorage if backup or disk had valid data while primary was missing/corrupted
        if (best && !primaryLsData && ls) {
            this._writeLocalStorageSafe(profileId, JSON.stringify(best));
        }

        return best;
    }

    deleteProfile(profileId) {
        try {
            const ls = this._getLocalStorage();
            if (ls) {
                ls.removeItem(profileId);
                try { ls.removeItem(profileId + BACKUP_SUFFIX); } catch {}
            }

            const disk = this._getDiskStorage();
            if (disk) {
                disk.deleteProfile(profileId);
            }

            let profiles = this.getProfiles().filter(id => id !== profileId);
            this._persistMasterIndex(profiles);
        } catch (e) {
            console.error("Failed to delete profile:", e);
        }
    }

    clearAllProfiles() {
        try {
            const profiles = this.getProfiles();
            const ls = this._getLocalStorage();
            const disk = this._getDiskStorage();
            for (const pid of profiles) {
                if (ls) {
                    ls.removeItem(pid);
                    try { ls.removeItem(pid + BACKUP_SUFFIX); } catch {}
                }
                if (disk) {
                    disk.deleteProfile(pid);
                }
            }
            if (ls) {
                ls.removeItem(this.masterKey);
            }
            if (disk) {
                disk.writeMasterIndex([]);
            }
        } catch (e) {
            console.error("Failed to clear all profiles:", e);
        }
    }

    setCurrentProfile(profileId) {
        this.currentProfileId = profileId;
    }

    createNewProfile() {
        const suffix = Math.random().toString(36).slice(2, 6);
        const newProfileId = `profile_${Date.now()}_${suffix}`;
        const profiles = this.getProfiles();
        profiles.push(newProfileId);
        this._persistMasterIndex(profiles);
        this.currentProfileId = newProfileId;
        return newProfileId;
    }

    save(state) {
        if (!this.currentProfileId) {
            console.error("Cannot save: No current profile selected.");
            return false;
        }
        if (!state || typeof state !== 'object') {
            console.error("Cannot save: Invalid state object.");
            return false;
        }

        try {
            // Failsafe: never overwrite a progressed profile with an empty/uninitialized state
            if (!this._hasProgress(state)) {
                const existing = this.getProfileData(this.currentProfileId);
                if (this._hasProgress(existing)) {
                    console.error(`Refused to overwrite progressed profile ${this.currentProfileId} with empty state.`);
                    return false;
                }
            }

            // Inject a last played timestamp for UI
            state.lastPlayed = Date.now();

            // Simple replacer to avoid the specific dayCareRef circular issue and config without breaking legitimate duplicate objects
            const jsonString = JSON.stringify(state, (key, value) => {
                if (key === 'config' || key === 'dayCareRef') return undefined;
                return value;
            });

            // Verify serialized JSON is valid before writing anywhere
            if (!this._parseValidObject(jsonString)) {
                console.error("Save aborted: serialized state failed validation.");
                return false;
            }

            let diskOk = false;
            const disk = this._getDiskStorage();
            if (disk) {
                const res = disk.writeProfile(this.currentProfileId, jsonString);
                diskOk = !!(res && res.ok);
                if (!diskOk) {
                    console.error("Disk save failed:", res && res.error);
                }
            }

            const lsOk = this._writeLocalStorageSafe(this.currentProfileId, jsonString);
            if (lsOk) {
                // Best-effort secondary localStorage backup; ignore quota failure on backup slot
                this._writeLocalStorageSafe(this.currentProfileId + BACKUP_SUFFIX, jsonString);
            }

            // Ensure profile ID is registered in master index
            const profiles = this.getProfiles();
            if (!profiles.includes(this.currentProfileId)) {
                profiles.push(this.currentProfileId);
                this._persistMasterIndex(profiles);
            }

            return diskOk || lsOk;
        } catch (e) {
            console.error("Save failed:", e);
            return false;
        }
    }

    requestSave(state, delayMs = 1500) {
        if (this._saveTimer) {
            clearTimeout(this._saveTimer);
        }
        this._saveTimer = setTimeout(() => {
            this._saveTimer = null;
            this.save(state);
        }, delayMs);
    }

    renameProfile(profileId, newName) {
        const trimmed = typeof newName === 'string' ? newName.trim() : '';
        if (!profileId || !trimmed) return false;
        const data = this.getProfileData(profileId);
        if (!data) return false;
        data.profileName = trimmed;
        try {
            const jsonString = JSON.stringify(data);
            let diskOk = false;
            const disk = this._getDiskStorage();
            if (disk) {
                const res = disk.writeProfile(profileId, jsonString);
                diskOk = !!(res && res.ok);
            }
            const lsOk = this._writeLocalStorageSafe(profileId, jsonString);
            if (lsOk) {
                this._writeLocalStorageSafe(profileId + BACKUP_SUFFIX, jsonString);
            }
            return diskOk || lsOk;
        } catch (e) {
            console.error("Failed to rename profile:", e);
            return false;
        }
    }

    load() {
        if (!this.currentProfileId) return null;
        return this.getProfileData(this.currentProfileId);
    }

    loadProfileIntoState(profileId, state) {
        if (!profileId || !state) {
            return { ok: false, error: "Invalid profileId or state" };
        }
        const pData = this.getProfileData(profileId);
        if (!pData || typeof pData !== "object") {
            return { ok: false, error: "Profile data missing or corrupted" };
        }

        const preservedConfig = state.config;

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

        if (preservedConfig !== undefined) {
            state.config = preservedConfig;
        }

        if (state.stats && state.stats.caughtSpecies) {
            state.stats.caughtSpeciesCount = Object.keys(state.stats.caughtSpecies).length;
        } else if (state.stats) {
            state.stats.caughtSpeciesCount = 0;
        }

        if (pData.stats && state.globalStats) {
            if (pData.stats.playtime !== undefined) state.globalStats.playtime = pData.stats.playtime;
            if (pData.stats.hasSeenProfTutorial !== undefined) state.globalStats.hasSeenProfTutorial = pData.stats.hasSeenProfTutorial;
            if (pData.stats.hasSeenZzZTutorial !== undefined) state.globalStats.hasSeenZzZTutorial = pData.stats.hasSeenZzZTutorial;
            if (pData.stats.hasSeenMultiplayerIcon !== undefined) state.globalStats.hasSeenMultiplayerIcon = pData.stats.hasSeenMultiplayerIcon;
            if (pData.stats.hasSeenGiftIcon !== undefined) state.globalStats.hasSeenGiftIcon = pData.stats.hasSeenGiftIcon;
            if (pData.stats.hasSeenJohtoMap !== undefined) state.globalStats.hasSeenJohtoMap = pData.stats.hasSeenJohtoMap;
            if (pData.stats.hasSeenDaycare !== undefined && state.stats) state.stats.hasSeenDaycare = pData.stats.hasSeenDaycare;
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

        this.setCurrentProfile(profileId);
        return { ok: true };
    }

    reset() {
        if (!this.currentProfileId) return;
        try {
            // Keep the profile ID but clear the data inside it, so New Game starts fresh
            window.localStorage.removeItem(this.currentProfileId);
            console.log("Save data cleared for current profile.");
        } catch (e) {
            console.error("Failed to clear save:", e);
        }
        try {
            window.localStorage.removeItem(this.currentProfileId + BACKUP_SUFFIX);
        } catch {
            // ignore backup cleanup failure
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
        } catch (e) {
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
