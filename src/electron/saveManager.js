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

function atomicWriteSync(targetPath, content) {
    const dir = path.dirname(targetPath);
    fs.mkdirSync(dir, { recursive: true });

    const tmpPath = `${targetPath}.tmp.${process.pid}.${Date.now()}`;
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

function createSaveManager(baseDir) {
    const backupsDir = path.join(baseDir, 'backups');
    const trashDir = path.join(baseDir, 'trash');
    const indexPath = path.join(baseDir, 'profiles.json');

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
            const merged = new Set(indexed);

            // Self-heal: scan baseDir for any profile JSON files missing from profiles.json
            const entries = fs.readdirSync(baseDir, { withFileTypes: true });
            for (const entry of entries) {
                if (!entry.isFile()) continue;
                if (!entry.name.endsWith('.json') || entry.name === 'profiles.json') continue;
                if (entry.name.includes('.tmp.')) continue;

                const candidateId = entry.name.slice(0, -5);
                if (!sanitizeProfileId(candidateId)) continue;

                try {
                    const raw = fs.readFileSync(path.join(baseDir, entry.name), 'utf8');
                    if (isValidSaveJson(raw).valid) {
                        merged.add(candidateId);
                    }
                } catch {
                    // ignore unreadable file
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
        if (!fs.existsSync(currentPath)) return;

        let currentRaw;
        try {
            currentRaw = fs.readFileSync(currentPath, 'utf8');
        } catch {
            return;
        }
        if (!isValidSaveJson(currentRaw).valid) return;

        // Shift bak2 -> bak3, bak1 -> bak2, current -> bak1
        for (let slot = MAX_BACKUPS; slot >= 2; slot--) {
            const src = getBackupPath(safeId, slot - 1);
            const dst = getBackupPath(safeId, slot);
            if (fs.existsSync(src)) {
                try {
                    fs.copyFileSync(src, dst);
                } catch {
                    // ignore individual backup shift failure
                }
            }
        }

        try {
            atomicWriteSync(getBackupPath(safeId, 1), currentRaw);
        } catch {
            // ignore backup write failure so primary save still proceeds
        }
    };

    const writeProfile = (profileId, jsonString) => {
        const safeId = sanitizeProfileId(profileId);
        if (!safeId) {
            return { ok: false, error: 'Invalid profileId' };
        }
        if (!isValidSaveJson(jsonString).valid) {
            return { ok: false, error: 'Invalid save JSON' };
        }

        try {
            ensureDirs();
            rotateBackups(safeId);
            atomicWriteSync(getProfilePath(safeId), jsonString);

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
        if (fs.existsSync(primaryPath)) {
            try {
                const raw = fs.readFileSync(primaryPath, 'utf8');
                const check = isValidSaveJson(raw);
                if (check.valid) {
                    return { ok: true, data: check.data, raw, source: 'primary' };
                }
            } catch {
                // fall through to backups
            }
        }

        // Attempt automatic recovery from rolling backups
        for (let slot = 1; slot <= MAX_BACKUPS; slot++) {
            const bakPath = getBackupPath(safeId, slot);
            if (!fs.existsSync(bakPath)) continue;
            try {
                const raw = fs.readFileSync(bakPath, 'utf8');
                const check = isValidSaveJson(raw);
                if (check.valid) {
                    // Restore primary from valid backup
                    try {
                        atomicWriteSync(primaryPath, raw);
                    } catch {
                        // ignore restore error, still return recovered data
                    }
                    return { ok: true, data: check.data, raw, source: `backup_${slot}` };
                }
            } catch {
                // try next backup slot
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
        deleteProfile
    };
}

module.exports = {
    createSaveManager,
    sanitizeProfileId,
    isValidSaveJson
};
