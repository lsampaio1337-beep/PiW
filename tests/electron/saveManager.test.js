const fs = require('fs');
const os = require('os');
const path = require('path');
const { createSaveManager, createMultiSaveManager } = require('../../src/electron/saveManager');

describe('Electron saveManager (single place)', () => {
    let tempDir;
    let manager;

    beforeEach(() => {
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'piw-save-test-'));
        manager = createSaveManager(tempDir);
    });

    afterEach(() => {
        fs.rmSync(tempDir, { recursive: true, force: true });
    });

    test('writes and reads a valid profile atomically with sha256 sidecar and registers it in profiles.json', () => {
        const payload = JSON.stringify({ profileName: 'Ash', party: [{ name: 'Pikachu', level: 5 }], lastPlayed: 100 });
        const writeRes = manager.writeProfile('profile_1', payload);
        expect(writeRes.ok).toBe(true);
        expect(fs.existsSync(path.join(tempDir, 'profile_1.json.sha256'))).toBe(true);

        const readRes = manager.readProfile('profile_1');
        expect(readRes.ok).toBe(true);
        expect(readRes.source).toBe('primary');
        expect(readRes.data.profileName).toBe('Ash');

        const listRes = manager.listProfiles();
        expect(listRes.ok).toBe(true);
        expect(listRes.profiles).toContain('profile_1');
    });

    test('rejects invalid profileId (path traversal) and invalid JSON without writing', () => {
        expect(manager.writeProfile('../evil', '{"a":1}').ok).toBe(false);
        expect(manager.writeProfile('profile_1', '{not-json').ok).toBe(false);
        expect(manager.writeProfile('profile_1', '[1,2,3]').ok).toBe(false);
        expect(fs.existsSync(path.join(tempDir, 'profile_1.json'))).toBe(false);
    });

    test('rotates up to 3 rolling backups and recovers automatically when primary is corrupted or checksum mismatches', () => {
        manager.writeProfile('profile_1', JSON.stringify({ step: 1, savedAt: 10 }));
        manager.writeProfile('profile_1', JSON.stringify({ step: 2, savedAt: 20 }));
        manager.writeProfile('profile_1', JSON.stringify({ step: 3, savedAt: 30 }));
        manager.writeProfile('profile_1', JSON.stringify({ step: 4, savedAt: 40 }));

        expect(fs.existsSync(path.join(tempDir, 'backups', 'profile_1.bak1.json'))).toBe(true);
        expect(fs.existsSync(path.join(tempDir, 'backups', 'profile_1.bak2.json'))).toBe(true);
        expect(fs.existsSync(path.join(tempDir, 'backups', 'profile_1.bak3.json'))).toBe(true);

        // Tamper with primary file while keeping valid JSON (checksum mismatch)
        fs.writeFileSync(path.join(tempDir, 'profile_1.json'), JSON.stringify({ step: 999 }), 'utf8');

        const recovered = manager.readProfile('profile_1');
        expect(recovered.ok).toBe(true);
        expect(recovered.source).toBe('backup_1');
        expect(recovered.data.step).toBe(3);

        // Verify primary was self-healed on disk with valid checksum
        const reread = manager.readProfile('profile_1');
        expect(reread.ok).toBe(true);
        expect(reread.source).toBe('primary');
        expect(reread.data.step).toBe(3);
    });

    test('self-heals profiles.json by scanning disk for orphaned profile files', () => {
        manager.writeProfile('profile_alpha', JSON.stringify({ profileName: 'Alpha', savedAt: 10 }));
        manager.writeProfile('profile_beta', JSON.stringify({ profileName: 'Beta', savedAt: 20 }));

        // Corrupt profiles.json
        fs.writeFileSync(path.join(tempDir, 'profiles.json'), 'corrupt', 'utf8');

        const listRes = manager.listProfiles();
        expect(listRes.ok).toBe(true);
        expect(listRes.profiles).toEqual(expect.arrayContaining(['profile_alpha', 'profile_beta']));
    });

    test('soft-deletes profile to trash directory instead of permanently destroying it', () => {
        manager.writeProfile('profile_del', JSON.stringify({ profileName: 'ToDelete', savedAt: 10 }));
        const delRes = manager.deleteProfile('profile_del');
        expect(delRes.ok).toBe(true);
        expect(fs.existsSync(path.join(tempDir, 'profile_del.json'))).toBe(false);

        const trashFiles = fs.readdirSync(path.join(tempDir, 'trash'));
        expect(trashFiles.some(f => f.startsWith('profile_del_'))).toBe(true);
    });
});

describe('Electron createMultiSaveManager (multi-place replication & latest-only reload)', () => {
    let dir1;
    let dir2;
    let dir3;
    let multi;

    beforeEach(() => {
        dir1 = fs.mkdtempSync(path.join(os.tmpdir(), 'piw-multi-1-'));
        dir2 = fs.mkdtempSync(path.join(os.tmpdir(), 'piw-multi-2-'));
        dir3 = fs.mkdtempSync(path.join(os.tmpdir(), 'piw-multi-3-'));
        multi = createMultiSaveManager([dir1, dir2, dir3]);
    });

    afterEach(() => {
        fs.rmSync(dir1, { recursive: true, force: true });
        fs.rmSync(dir2, { recursive: true, force: true });
        fs.rmSync(dir3, { recursive: true, force: true });
    });

    test('replicates every save to all save places', () => {
        const payload = JSON.stringify({
            profileName: 'Red',
            party: [{ name: 'Charizard', level: 36 }],
            savedAt: 1000,
            _saveSeq: 1
        });
        const res = multi.writeProfile('profile_red', payload);
        expect(res.ok).toBe(true);
        expect(res.locationsSucceeded).toBe(3);
        expect(res.locationsTotal).toBe(3);

        expect(fs.existsSync(path.join(dir1, 'profile_red.json'))).toBe(true);
        expect(fs.existsSync(path.join(dir2, 'profile_red.json'))).toBe(true);
        expect(fs.existsSync(path.join(dir3, 'profile_red.json'))).toBe(true);
    });

    test('reloads ONLY the latest save across all places and auto-repairs stale/corrupted places', () => {
        const mgr1 = createSaveManager(dir1);
        const mgr2 = createSaveManager(dir2);
        const mgr3 = createSaveManager(dir3);

        // Place 1 has an older save (t=1000)
        mgr1.writeProfile('profile_hero', JSON.stringify({
            profileName: 'Hero',
            party: [{ name: 'Bulbasaur', level: 5 }],
            savedAt: 1000,
            _saveSeq: 1
        }));

        // Place 2 is completely corrupted
        fs.writeFileSync(path.join(dir2, 'profile_hero.json'), '{broken', 'utf8');

        // Place 3 has the newest save (t=5000)
        mgr3.writeProfile('profile_hero', JSON.stringify({
            profileName: 'Hero',
            party: [{ name: 'Venusaur', level: 42 }],
            savedAt: 5000,
            _saveSeq: 8
        }));

        const loaded = multi.readProfile('profile_hero');
        expect(loaded.ok).toBe(true);
        expect(loaded.data.party[0].name).toBe('Venusaur');
        expect(loaded.data.savedAt).toBe(5000);

        // Stale Place 1 and corrupted Place 2 must now be repaired to the latest save
        expect(mgr1.readProfile('profile_hero').data.party[0].name).toBe('Venusaur');
        expect(mgr2.readProfile('profile_hero').data.party[0].name).toBe('Venusaur');
    });

    test('uses _saveSeq tie-breaker when timestamps are identical', () => {
        const mgr1 = createSaveManager(dir1);
        const mgr2 = createSaveManager(dir2);

        mgr1.writeProfile('profile_tie', JSON.stringify({
            party: [{ name: 'Pidgey', level: 3 }],
            savedAt: 2000,
            _saveSeq: 4
        }));
        mgr2.writeProfile('profile_tie', JSON.stringify({
            party: [{ name: 'Pidgeot', level: 38 }],
            savedAt: 2000,
            _saveSeq: 5
        }));

        const loaded = multi.readProfile('profile_tie');
        expect(loaded.ok).toBe(true);
        expect(loaded.data.party[0].name).toBe('Pidgeot');
    });

    test('tombstone prevents stale copy in another save place from resurrecting a deleted profile', () => {
        multi.writeProfile('profile_del', JSON.stringify({
            party: [{ name: 'Eevee', level: 5 }],
            savedAt: 1000
        }));

        expect(multi.deleteProfile('profile_del').ok).toBe(true);

        // Simulate a stale older copy left behind in Place 2
        const mgr2 = createSaveManager(dir2);
        mgr2.writeProfile('profile_del', JSON.stringify({
            party: [{ name: 'Eevee', level: 5 }],
            savedAt: 900
        }));

        expect(multi.listProfiles().profiles).not.toContain('profile_del');
        expect(multi.readProfile('profile_del').ok).toBe(false);
    });
});
