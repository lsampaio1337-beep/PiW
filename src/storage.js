// src/storage.js

const BACKUP_SUFFIX = '__bak';

export default class Storage {
    constructor() {
        this.masterKey = "idle_pokemon_world_profiles";
        this.currentProfileId = null;
        this._saveTimer = null;
        this._lastKnownSeq = new Map();

        // Migrate old single save to new profile system if exists
        this.migrateOldSave();
        // Synchronize & self-heal profiles across all disk save places and localStorage
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

    _hasPokemon(data) {
        if (!data || typeof data !== 'object') return false;
        if (Array.isArray(data.party) && data.party.length > 0) return true;
        if (Array.isArray(data.storage) && data.storage.length > 0) return true;
        if (data.regions && typeof data.regions === 'object') {
            for (const region of Object.values(data.regions)) {
                if (!region || typeof region !== 'object') continue;
                if (Array.isArray(region.party) && region.party.length > 0) return true;
                if (Array.isArray(region.storage) && region.storage.length > 0) return true;
            }
        }
        return false;
    }

    _hasProgress(data) {
        if (!data || typeof data !== 'object') return false;
        if (this._hasPokemon(data)) return true;
        if (data.stats && data.stats.hasPickedStarter) return true;
        if (data.globalStats && data.globalStats.playtime > 0) return true;
        if (data.stats && data.stats.playtime > 0) return true;
        if (data.regions && typeof data.regions === 'object') {
            for (const region of Object.values(data.regions)) {
                if (region && typeof region === 'object' && region.stats && region.stats.hasPickedStarter) {
                    return true;
                }
            }
        }
        return false;
    }

    _getSaveTimestamp(data) {
        if (!data || typeof data !== 'object') return 0;
        const savedAt = typeof data.savedAt === 'number' && Number.isFinite(data.savedAt) ? data.savedAt : 0;
        const lastPlayed = typeof data.lastPlayed === 'number' && Number.isFinite(data.lastPlayed) ? data.lastPlayed : 0;
        return Math.max(savedAt, lastPlayed);
    }

    _getSaveSeq(data) {
        if (!data || typeof data !== 'object') return 0;
        return typeof data._saveSeq === 'number' && Number.isFinite(data._saveSeq) ? data._saveSeq : 0;
    }

    _getPlaytime(data) {
        if (!data || typeof data !== 'object') return 0;
        const globalPlaytime = data.globalStats && typeof data.globalStats.playtime === 'number' ? data.globalStats.playtime : 0;
        const regionalPlaytime = data.stats && typeof data.stats.playtime === 'number' ? data.stats.playtime : 0;
        return Math.max(globalPlaytime, regionalPlaytime);
    }

    _getPokemonCount(data) {
        if (!data || typeof data !== 'object') return 0;
        let count = 0;
        if (Array.isArray(data.party)) count += data.party.length;
        if (Array.isArray(data.storage)) count += data.storage.length;
        if (data.stats && data.stats.caughtSpecies && typeof data.stats.caughtSpecies === 'object') {
            count += Object.keys(data.stats.caughtSpecies).length;
        }
        if (data.regions && typeof data.regions === 'object') {
            for (const region of Object.values(data.regions)) {
                if (!region || typeof region !== 'object') continue;
                if (Array.isArray(region.party)) count += region.party.length;
                if (Array.isArray(region.storage)) count += region.storage.length;
                if (region.stats && region.stats.caughtSpecies && typeof region.stats.caughtSpecies === 'object') {
                    count += Object.keys(region.stats.caughtSpecies).length;
                }
            }
        }
        return count;
    }

    _compareSaves(a, b) {
        if (!a && !b) return 0;
        if (!a) return -1;
        if (!b) return 1;

        const aProg = this._hasProgress(a);
        const bProg = this._hasProgress(b);
        if (aProg !== bProg) return aProg ? 1 : -1;

        const tsDiff = this._getSaveTimestamp(a) - this._getSaveTimestamp(b);
        if (tsDiff !== 0) return tsDiff;

        const seqDiff = this._getSaveSeq(a) - this._getSaveSeq(b);
        if (seqDiff !== 0) return seqDiff;

        const ptDiff = this._getPlaytime(a) - this._getPlaytime(b);
        if (ptDiff !== 0) return ptDiff;

        return this._getPokemonCount(a) - this._getPokemonCount(b);
    }

    _pickNewerSave(a, b) {
        if (!a) return b || null;
        if (!b) return a;
        return this._compareSaves(b, a) > 0 ? b : a;
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

            // 3. Collect from all disk save places (which also self-heal from *.json files on disk)
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

            // 4. Reconcile each profile across all save places, keeping ONLY the single latest valid copy
            for (const profileId of mergedIds) {
                let lsPrimary = null;
                let lsBackup = null;
                if (ls) {
                    lsPrimary = this._parseValidObject(ls.getItem(profileId));
                    lsBackup = this._parseValidObject(ls.getItem(profileId + BACKUP_SUFFIX));
                }
                const lsData = this._pickNewerSave(lsPrimary, lsBackup);

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

                const latest = this._pickNewerSave(diskData, lsData);
                if (!latest) continue;

                this._lastKnownSeq.set(profileId, Math.max(this._lastKnownSeq.get(profileId) || 0, this._getSaveSeq(latest)));

                const serialized = JSON.stringify(latest);
                if (disk && (!diskData || this._compareSaves(latest, diskData) > 0)) {
                    try {
                        disk.writeProfile(profileId, serialized);
                    } catch {
                        // ignore
                    }
                }
                if (ls && (!lsPrimary || this._compareSaves(latest, lsPrimary) > 0)) {
                    this._writeLocalStorageSafe(profileId, serialized);
                    this._writeLocalStorageSafe(profileId + BACKUP_SUFFIX, serialized);
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
        const latest = this._pickNewerSave(diskData, bestLs);

        if (latest) {
            this._lastKnownSeq.set(profileId, Math.max(this._lastKnownSeq.get(profileId) || 0, this._getSaveSeq(latest)));
            const serialized = JSON.stringify(latest);

            // Self-heal stale/corrupted localStorage with ONLY the latest valid save
            if (ls && (!primaryLsData || this._compareSaves(latest, primaryLsData) > 0)) {
                this._writeLocalStorageSafe(profileId, serialized);
                this._writeLocalStorageSafe(profileId + BACKUP_SUFFIX, serialized);
            }
            // Self-heal stale disk save places if localStorage had a newer save
            if (disk && (!diskData || this._compareSaves(latest, diskData) > 0)) {
                try {
                    disk.writeProfile(profileId, serialized);
                } catch {
                    // ignore
                }
            }
        }

        return latest;
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

            this._lastKnownSeq.delete(profileId);
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
                this._lastKnownSeq.delete(pid);
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
        this._lastKnownSeq.set(newProfileId, 0);
        return newProfileId;
    }

    save(state) {
        if (this._saveTimer) {
            clearTimeout(this._saveTimer);
            this._saveTimer = null;
        }
        if (!this.currentProfileId) {
            console.error("Cannot save: No current profile selected.");
            return false;
        }
        if (!state || typeof state !== 'object') {
            console.error("Cannot save: Invalid state object.");
            return false;
        }

        try {
            const existing = this.getProfileData(this.currentProfileId);

            // Failsafe 1: never overwrite a progressed profile with an empty/uninitialized state
            if (!this._hasProgress(state) && this._hasProgress(existing)) {
                console.error(`Refused to overwrite progressed profile ${this.currentProfileId} with empty state.`);
                return false;
            }

            // Failsafe 2: never overwrite a profile that has Pokemon with a state that lost all Pokemon across all regions
            if (!this._hasPokemon(state) && this._hasPokemon(existing)) {
                console.error(`Refused to overwrite profile ${this.currentProfileId}: incoming state has no Pokemon while existing save does.`);
                return false;
            }

            // Inject monotonic save sequence and timestamps
            const prevSeq = Math.max(
                this._getSaveSeq(state),
                this._getSaveSeq(existing),
                this._lastKnownSeq.get(this.currentProfileId) || 0
            );
            const now = Date.now();
            state._saveSeq = prevSeq + 1;
            state.savedAt = now;
            state.lastPlayed = now;
            this._lastKnownSeq.set(this.currentProfileId, state._saveSeq);

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
        if (!this.currentProfileId || !state) return;
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
        const now = Date.now();
        data._saveSeq = Math.max(this._getSaveSeq(data), this._lastKnownSeq.get(profileId) || 0) + 1;
        data.savedAt = now;
        this._lastKnownSeq.set(profileId, data._saveSeq);

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
        if (!Array.isArray(state.party)) state.party = [];
        if (!Array.isArray(state.storage)) state.storage = [];

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
