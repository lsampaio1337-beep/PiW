const fs = require('fs');
const os = require('os');
const path = require('path');
const { createSaveManager } = require('../../src/electron/saveManager');

describe('Electron saveManager', () => {
    let tempDir;
    let manager;

    beforeEach(() => {
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'piw-save-test-'));
        manager = createSaveManager(tempDir);
    });

    afterEach(() => {
        fs.rmSync(tempDir, { recursive: true, force: true });
    });

    test('writes and reads a valid profile atomically and registers it in profiles.json', () => {
        const payload = JSON.stringify({ profileName: 'Ash', party: [{ name: 'Pikachu', level: 5 }], lastPlayed: 100 });
        const writeRes = manager.writeProfile('profile_1', payload);
        expect(writeRes.ok).toBe(true);

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

    test('rotates up to 3 rolling backups and recovers automatically when primary is corrupted', () => {
        manager.writeProfile('profile_1', JSON.stringify({ step: 1 }));
        manager.writeProfile('profile_1', JSON.stringify({ step: 2 }));
        manager.writeProfile('profile_1', JSON.stringify({ step: 3 }));
        manager.writeProfile('profile_1', JSON.stringify({ step: 4 }));

        expect(fs.existsSync(path.join(tempDir, 'backups', 'profile_1.bak1.json'))).toBe(true);
        expect(fs.existsSync(path.join(tempDir, 'backups', 'profile_1.bak2.json'))).toBe(true);
        expect(fs.existsSync(path.join(tempDir, 'backups', 'profile_1.bak3.json'))).toBe(true);

        // Corrupt primary file
        fs.writeFileSync(path.join(tempDir, 'profile_1.json'), '{corrupted', 'utf8');

        const recovered = manager.readProfile('profile_1');
        expect(recovered.ok).toBe(true);
        expect(recovered.source).toBe('backup_1');
        expect(recovered.data.step).toBe(3);

        // Verify primary was self-healed on disk
        const reread = manager.readProfile('profile_1');
        expect(reread.ok).toBe(true);
        expect(reread.source).toBe('primary');
        expect(reread.data.step).toBe(3);
    });

    test('self-heals profiles.json by scanning disk for orphaned profile files', () => {
        manager.writeProfile('profile_alpha', JSON.stringify({ profileName: 'Alpha' }));
        manager.writeProfile('profile_beta', JSON.stringify({ profileName: 'Beta' }));

        // Corrupt/delete profiles.json
        fs.writeFileSync(path.join(tempDir, 'profiles.json'), 'corrupt', 'utf8');

        const listRes = manager.listProfiles();
        expect(listRes.ok).toBe(true);
        expect(listRes.profiles).toEqual(expect.arrayContaining(['profile_alpha', 'profile_beta']));
    });

    test('soft-deletes profile to trash directory instead of permanently destroying it', () => {
        manager.writeProfile('profile_del', JSON.stringify({ profileName: 'ToDelete' }));
        const delRes = manager.deleteProfile('profile_del');
        expect(delRes.ok).toBe(true);
        expect(fs.existsSync(path.join(tempDir, 'profile_del.json'))).toBe(false);

        const trashFiles = fs.readdirSync(path.join(tempDir, 'trash'));
        expect(trashFiles.some(f => f.startsWith('profile_del_'))).toBe(true);
    });
});
