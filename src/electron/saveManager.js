const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const PROFILE_ID_REGEX = /^[a-zA-Z0-9_-]{1,128}$/;
const MAX_BACKUPS = 3;

function sanitizeProfileId(profileId) {
    if (typeof profileId !== 'string' || !PROFILE_ID_REGEX.test(profileId)) {
        return null;
    }
    return profileId;
}

function isValidSaveJson(jsonString) {
    if (typeof jsonString !== 'string' || jsonString.trim().length < 2) {
        return { valid: false };
    }
    try {
        const parsed = JSON.parse(jsonString);
        if (parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)) {
            return { valid: true, data: parsed };
        }
    } catch {
        // invalid JSON
    }
    return { valid: false };
}

function computeSha256(content) {
    return crypto.createHash('sha256').update(content, 'utf8').digest('hex');
}

function hasProgress(data) {
    if (!data || typeof data !== 'object') return false;
    if (Array.isArray(data.party) && data.party.length > 0) return true;
    if (Array.isArray(data.storage) && data.storage.length > 0) return true;
    if (data.stats && data.stats.hasPickedStarter) return true;
    if (data.globalStats && data.globalStats.playtime > 0) return true;
    if (data.stats && data.stats.playtime > 0) return true;
    if (data.regions && typeof data.regions === 'object') {
        for (const region of Object.values(data.regions)) {
            if (!region || typeof region !== 'object') continue;
            if (Array.isArray(region.party) && region.party.length > 0) return true;
            if (Array.isArray(region.storage) && region.storage.length > 0) return true;
            if (region.stats && region.stats.hasPickedStarter) return true;
        }
    }
    return false;
}

function getSaveTimestamp(data) {
    if (!data || typeof data !== 'object') return 0;
    const savedAt = typeof data.savedAt === 'number' && Number.isFinite(data.savedAt) ? data.savedAt : 0;
    const lastPlayed = typeof data.lastPlayed === 'number' && Number.isFinite(data.lastPlayed) ? data.lastPlayed : 0;
    return Math.max(savedAt, lastPlayed);
}

function getSaveSeq(data) {
    if (!data || typeof data !== 'object') return 0;
    return typeof data._saveSeq === 'number' && Number.isFinite(data._saveSeq) ? data._saveSeq : 0;
}

function getPlaytime(data) {
    if (!data || typeof data !== 'object') return 0;
    const globalPlaytime = data.globalStats && typeof data.globalStats.playtime === 'number' ? data.globalStats.playtime : 0;
    const regionalPlaytime = data.stats && typeof data.stats.playtime === 'number' ? data.stats.playtime : 0;
    return Math.max(globalPlaytime, regionalPlaytime);
}

function getPokemonCount(data) {
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

/**
 * Compare two save data objects.
 * Returns > 0 if `a` is strictly newer/better than `b`, < 0 if `b` is newer/better, 0 if tied.
 */
function compareSaves(a, b) {
    if (!a && !b) return 0;
    if (!a) return -1;
    if (!b) return 1;

    const aProg = hasProgress(a);
    const bProg = hasProgress(b);
    if (aProg !== bProg) return aProg ? 1 : -1;

    const tsDiff = getSaveTimestamp(a) - getSaveTimestamp(b);
    if (tsDiff !== 0) return tsDiff;

    const seqDiff = getSaveSeq(a) - getSaveSeq(b);
    if (seqDiff !== 0) return seqDiff;

    const ptDiff = getPlaytime(a) - getPlaytime(b);
    if (ptDiff !== 0) return ptDiff;

    return getPokemonCount(a) - getPokemonCount(b);
}

function atomicWriteSync(targetPath, content) {
    const dir = path.dirname(targetPath);
    fs.mkdirSync(dir, { recursive: true });

    const tmpPath = `${targetPath}.tmp.${process.pid}.${Date.now()}.${Math.random().toString(36).slice(2, 6)}`;
    let fd = null;
    try {
        fd = fs.openSync(tmpPath, 'w');
        fs.writeFileSync(fd, content, 'utf8');
        try {
            fs.fsyncSync(fd);
        } catch {
            // fsync may not be supported on some virtual filesystems; ignore
        }
        fs.closeSync(fd);
        fd = null;

        // Replace target atomically (with brief retry for Windows file lock/AV scanners)
        let lastErr = null;
        for (let attempt = 0; attempt < 3; attempt++) {
            try {
                fs.renameSync(tmpPath, targetPath);
                lastErr = null;
                break;
            } catch (err) {
                lastErr = err;
            }
        }
        if (lastErr) {
            throw lastErr;
        }
    } finally {
        if (fd !== null) {
            try { fs.closeSync(fd); } catch {}
        }
        if (fs.existsSync(tmpPath)) {
            try { fs.unlinkSync(tmpPath); } catch {}
        }
    }
}

function readVerifiedJsonFile(filePath) {
    if (!fs.existsSync(filePath)) return null;
    try {
        const raw = fs.readFileSync(filePath, 'utf8');
        const check = isValidSaveJson(raw);
        if (!check.valid) return null;

        const hashPath = `${filePath}.sha256`;
        if (fs.existsSync(hashPath)) {
            const expectedHash = fs.readFileSync(hashPath, 'utf8').trim();
            if (expectedHash && computeSha256(raw) !== expectedHash) {
                return null;
            }
        }
        return { data: check.data, raw };
    } catch {
        return null;
    }
}

function createSaveManager(baseDir) {
    const backupsDir = path.join(baseDir, 'backups');
    const trashDir = path.join(baseDir, 'trash');
    const indexPath = path.join(baseDir, 'profiles.json');
    const tombstonesPath = path.join(baseDir, 'deleted_profiles.json');

    const ensureDirs = () => {
        fs.mkdirSync(baseDir, { recursive: true });
        fs.mkdirSync(backupsDir, { recursive: true });
        fs.mkdirSync(trashDir, { recursive: true });
    };

    ensureDirs();

    const getProfilePath = (safeId) => path.join(baseDir, `${safeId}.json`);
    const getBackupPath = (safeId, slot) => path.join(backupsDir, `${safeId}.bak${slot}.json`);

    const readIndexFile = () => {
        try {
            if (!fs.existsSync(indexPath)) return [];
            const raw = fs.readFileSync(indexPath, 'utf8');
            const parsed = JSON.parse(raw);
            if (!Array.isArray(parsed)) return [];
            return [...new Set(parsed.filter(id => sanitizeProfileId(id) !== null))];
        } catch {
            return [];
        }
    };

    const readTombstones = () => {
        try {
            if (!fs.existsSync(tombstonesPath)) return {};
            const raw = fs.readFileSync(tombstonesPath, 'utf8');
            const parsed = JSON.parse(raw);
            return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
        } catch {
            return {};
        }
    };

    const writeTombstones = (tombstones) => {
        try {
            ensureDirs();
            atomicWriteSync(tombstonesPath, JSON.stringify(tombstones));
        } catch {
            // ignore tombstone write failure
        }
    };

    const clearTombstone = (safeId) => {
        const tombstones = readTombstones();
        if (Object.prototype.hasOwnProperty.call(tombstones, safeId)) {
            delete tombstones[safeId];
            writeTombstones(tombstones);
        }
    };

    const writeMasterIndex = (profiles) => {
        try {
            ensureDirs();
            if (!Array.isArray(profiles)) {
                return { ok: false, error: 'Profiles must be an array' };
            }
            const clean = [...new Set(profiles.filter(id => sanitizeProfileId(id) !== null))];
            atomicWriteSync(indexPath, JSON.stringify(clean));
            return { ok: true, profiles: clean };
        } catch (err) {
            return { ok: false, error: err.message };
        }
    };

    const listProfiles = () => {
        try {
            ensureDirs();
            const indexed = readIndexFile();
            const tombstones = readTombstones();
            const merged = new Set(indexed);

            // Self-heal: scan baseDir for any profile JSON files missing from profiles.json
            const entries = fs.readdirSync(baseDir, { withFileTypes: true });
            for (const entry of entries) {
                if (!entry.isFile()) continue;
                if (!entry.name.endsWith('.json')) continue;
                if (entry.name === 'profiles.json' || entry.name === 'deleted_profiles.json') continue;
                if (entry.name.includes('.tmp.')) continue;

                const candidateId = entry.name.slice(0, -5);
                if (!sanitizeProfileId(candidateId)) continue;

                const verified = readVerifiedJsonFile(path.join(baseDir, entry.name));
                if (verified) {
                    const deletedAt = typeof tombstones[candidateId] === 'number' ? tombstones[candidateId] : 0;
                    const saveTs = getSaveTimestamp(verified.data);
                    if (deletedAt === 0 || saveTs > deletedAt) {
                        merged.add(candidateId);
                    }
                }
            }

            const result = [...merged];
            if (result.length !== indexed.length) {
                writeMasterIndex(result);
            }
            return { ok: true, profiles: result };
        } catch (err) {
            return { ok: false, profiles: [], error: err.message };
        }
    };

    const rotateBackups = (safeId) => {
        const currentPath = getProfilePath(safeId);
        const verified = readVerifiedJsonFile(currentPath);
        if (!verified) return;

        // Shift bak2 -> bak3, bak1 -> bak2, current -> bak1
        for (let slot = MAX_BACKUPS; slot >= 2; slot--) {
            const src = getBackupPath(safeId, slot - 1);
            const dst = getBackupPath(safeId, slot);
            if (fs.existsSync(src)) {
                try {
                    fs.copyFileSync(src, dst);
                    if (fs.existsSync(`${src}.sha256`)) {
                        fs.copyFileSync(`${src}.sha256`, `${dst}.sha256`);
                    }
                } catch {
                    // ignore individual backup shift failure
                }
            }
        }

        try {
            const bak1 = getBackupPath(safeId, 1);
            atomicWriteSync(bak1, verified.raw);
            atomicWriteSync(`${bak1}.sha256`, computeSha256(verified.raw));
        } catch {
            // ignore backup write failure so primary save still proceeds
        }
    };

    const writeProfile = (profileId, jsonString) => {
        const safeId = sanitizeProfileId(profileId);
        if (!safeId) {
            return { ok: false, error: 'Invalid profileId' };
        }
        const check = isValidSaveJson(jsonString);
        if (!check.valid) {
            return { ok: false, error: 'Invalid save JSON' };
        }

        try {
            ensureDirs();
            clearTombstone(safeId);
            rotateBackups(safeId);
            const profilePath = getProfilePath(safeId);
            atomicWriteSync(profilePath, jsonString);
            atomicWriteSync(`${profilePath}.sha256`, computeSha256(jsonString));

            const indexed = readIndexFile();
            if (!indexed.includes(safeId)) {
                indexed.push(safeId);
                writeMasterIndex(indexed);
            }
            return { ok: true };
        } catch (err) {
            return { ok: false, error: err.message };
        }
    };

    const readProfile = (profileId) => {
        const safeId = sanitizeProfileId(profileId);
        if (!safeId) {
            return { ok: false, error: 'Invalid profileId' };
        }

        const primaryPath = getProfilePath(safeId);
        const primaryVerified = readVerifiedJsonFile(primaryPath);
        if (primaryVerified) {
            return { ok: true, data: primaryVerified.data, raw: primaryVerified.raw, source: 'primary' };
        }

        // Attempt automatic recovery from rolling backups
        for (let slot = 1; slot <= MAX_BACKUPS; slot++) {
            const bakPath = getBackupPath(safeId, slot);
            const bakVerified = readVerifiedJsonFile(bakPath);
            if (bakVerified) {
                // Restore primary from valid backup
                try {
                    atomicWriteSync(primaryPath, bakVerified.raw);
                    atomicWriteSync(`${primaryPath}.sha256`, computeSha256(bakVerified.raw));
                } catch {
                    // ignore restore error, still return recovered data
                }
                return { ok: true, data: bakVerified.data, raw: bakVerified.raw, source: `backup_${slot}` };
            }
        }

        return { ok: false, error: 'Profile not found or corrupted' };
    };

    const deleteProfile = (profileId) => {
        const safeId = sanitizeProfileId(profileId);
        if (!safeId) {
            return { ok: false, error: 'Invalid profileId' };
        }

        try {
            ensureDirs();
            const primaryPath = getProfilePath(safeId);
            if (fs.existsSync(primaryPath)) {
                const trashPath = path.join(trashDir, `${safeId}_${Date.now()}.json`);
                fs.renameSync(primaryPath, trashPath);
            }
            if (fs.existsSync(`${primaryPath}.sha256`)) {
                try { fs.unlinkSync(`${primaryPath}.sha256`); } catch {}
            }

            const tombstones = readTombstones();
            tombstones[safeId] = Date.now();
            writeTombstones(tombstones);

            const indexed = readIndexFile().filter(id => id !== safeId);
            writeMasterIndex(indexed);
            return { ok: true };
        } catch (err) {
            return { ok: false, error: err.message };
        }
    };

    return {
        baseDir,
        backupsDir,
        trashDir,
        listProfiles,
        readProfile,
        writeProfile,
        writeMasterIndex,
        deleteProfile,
        readTombstones,
        clearTombstone
    };
}

function createMultiSaveManager(dirs) {
    const dirList = [...new Set((Array.isArray(dirs) ? dirs : [dirs]).filter(Boolean))];
    const managers = [];

    for (const dir of dirList) {
        try {
            managers.push(createSaveManager(dir));
        } catch (err) {
            console.warn(`Failed to initialize save directory ${dir}:`, err.message);
        }
    }

    if (managers.length === 0) {
        throw new Error('No writable save directories could be initialized');
    }

    const getMaxDeletedAt = (safeId) => {
        let maxDeletedAt = 0;
        for (const mgr of managers) {
            try {
                const tombstones = mgr.readTombstones();
                if (typeof tombstones[safeId] === 'number' && tombstones[safeId] > maxDeletedAt) {
                    maxDeletedAt = tombstones[safeId];
                }
            } catch {
                // ignore
            }
        }
        return maxDeletedAt;
    };

    const readProfile = (profileId) => {
        const safeId = sanitizeProfileId(profileId);
        if (!safeId) {
            return { ok: false, error: 'Invalid profileId' };
        }

        const candidates = [];
        const mgrResults = new Map();

        for (const mgr of managers) {
            try {
                const res = mgr.readProfile(safeId);
                mgrResults.set(mgr, res);
                if (res && res.ok && res.data) {
                    candidates.push({ ...res, mgr });
                }
            } catch {
                mgrResults.set(mgr, { ok: false });
            }
        }

        if (candidates.length === 0) {
            return { ok: false, error: 'Profile not found or corrupted across all save locations' };
        }

        // Pick ONLY the single latest valid save across all locations
        let best = candidates[0];
        for (let i = 1; i < candidates.length; i++) {
            if (compareSaves(candidates[i].data, best.data) > 0) {
                best = candidates[i];
            }
        }

        // Honor deletion tombstone if it is newer than (or equal to) the best available save
        const maxDeletedAt = getMaxDeletedAt(safeId);
        if (maxDeletedAt > 0 && getSaveTimestamp(best.data) <= maxDeletedAt) {
            return { ok: false, error: 'Profile was deleted' };
        }

        // Replicate/heal any stale, missing, or corrupted save locations with the latest save
        for (const mgr of managers) {
            const mgrRes = mgrResults.get(mgr);
            const needsSync = !mgrRes || !mgrRes.ok || !mgrRes.data || compareSaves(best.data, mgrRes.data) > 0;
            if (needsSync) {
                try {
                    mgr.writeProfile(safeId, best.raw);
                } catch {
                    // ignore individual sync failure
                }
            }
        }

        return {
            ok: true,
            data: best.data,
            raw: best.raw,
            source: best.source,
            locationsChecked: managers.length
        };
    };

    const writeProfile = (profileId, jsonString) => {
        const safeId = sanitizeProfileId(profileId);
        if (!safeId) {
            return { ok: false, error: 'Invalid profileId' };
        }
        if (!isValidSaveJson(jsonString).valid) {
            return { ok: false, error: 'Invalid save JSON' };
        }

        let succeeded = 0;
        let lastError = null;
        for (const mgr of managers) {
            try {
                mgr.clearTombstone(safeId);
                const res = mgr.writeProfile(safeId, jsonString);
                if (res && res.ok) {
                    succeeded++;
                } else if (res && res.error) {
                    lastError = res.error;
                }
            } catch (err) {
                lastError = err.message;
            }
        }

        if (succeeded === 0) {
            return { ok: false, error: lastError || 'All save locations failed' };
        }
        return { ok: true, locationsSucceeded: succeeded, locationsTotal: managers.length };
    };

    const listProfiles = () => {
        const union = new Set();
        const perMgrLists = [];

        for (const mgr of managers) {
            try {
                const res = mgr.listProfiles();
                const list = res && Array.isArray(res.profiles) ? res.profiles : [];
                perMgrLists.push({ mgr, list });
                list.forEach(id => union.add(id));
            } catch {
                perMgrLists.push({ mgr, list: [] });
            }
        }

        // Filter out tombstoned profiles unless a newer save exists
        const activeProfiles = [];
        for (const id of union) {
            const maxDeletedAt = getMaxDeletedAt(id);
            if (maxDeletedAt === 0) {
                activeProfiles.push(id);
                continue;
            }
            const res = readProfile(id);
            if (res && res.ok) {
                activeProfiles.push(id);
            }
        }

        for (const { mgr, list } of perMgrLists) {
            if (list.length !== activeProfiles.length || activeProfiles.some(id => !list.includes(id))) {
                try {
                    mgr.writeMasterIndex(activeProfiles);
                } catch {
                    // ignore
                }
            }
        }

        return { ok: true, profiles: activeProfiles };
    };

    const writeMasterIndex = (profiles) => {
        let succeeded = 0;
        let clean = [];
        for (const mgr of managers) {
            try {
                const res = mgr.writeMasterIndex(profiles);
                if (res && res.ok) {
                    succeeded++;
                    clean = res.profiles || clean;
                }
            } catch {
                // ignore
            }
        }
        return succeeded > 0
            ? { ok: true, profiles: clean }
            : { ok: false, error: 'Failed to write master index to any save location' };
    };

    const deleteProfile = (profileId) => {
        let succeeded = 0;
        for (const mgr of managers) {
            try {
                const res = mgr.deleteProfile(profileId);
                if (res && res.ok) succeeded++;
            } catch {
                // ignore
            }
        }
        return succeeded > 0
            ? { ok: true }
            : { ok: false, error: 'Failed to delete profile from save locations' };
    };

    return {
        baseDir: managers[0].baseDir,
        getSaveDirs: () => managers.map(m => m.baseDir),
        listProfiles,
        readProfile,
        writeProfile,
        writeMasterIndex,
        deleteProfile
    };
}

module.exports = {
    createSaveManager,
    createMultiSaveManager,
    sanitizeProfileId,
    isValidSaveJson,
    computeSha256,
    compareSaves,
    hasProgress,
    getSaveTimestamp
};
