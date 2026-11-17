import Storage from '../src/storage.js';

describe('Storage.processCheat', () => {
    let storage;
    let mockState;
    let consoleSpy;

    beforeAll(() => {
        // Mock localStorage
        Object.defineProperty(window, 'localStorage', {
            value: {
                getItem: jest.fn(() => null),
                setItem: jest.fn(),
                removeItem: jest.fn()
            },
            writable: true
        });
    });

    beforeEach(() => {
        storage = new Storage();
        mockState = {
            settings: {
                gameSpeed: 1
            },
            trainer: {
                money: 100,
                xp: 1000
            },
            party: [
                { name: 'Pikachu', xp: 500 }
            ]
        };
        consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
        consoleSpy.mockRestore();
        jest.clearAllMocks();
    });

    test('should return early if command is empty', () => {
        storage.processCheat('', mockState);
        expect(mockState.settings.gameSpeed).toBe(1);
        expect(consoleSpy).not.toHaveBeenCalled();
    });

    describe('GS (Game Speed) cheat', () => {
        test('should update game speed with valid float', () => {
            storage.processCheat('GS2.5', mockState);
            expect(mockState.settings.gameSpeed).toBe(2.5);
        });

        test('should update game speed with valid integer', () => {
            storage.processCheat('GS3', mockState);
            expect(mockState.settings.gameSpeed).toBe(3);
        });

        test('should ignore if speed is NaN', () => {
            storage.processCheat('GSabc', mockState);
            expect(mockState.settings.gameSpeed).toBe(1); // unchanged
            expect(consoleSpy).not.toHaveBeenCalled();
        });

        test('should ignore if length is not greater than 2', () => {
            storage.processCheat('GS', mockState);
            expect(mockState.settings.gameSpeed).toBe(1); // unchanged
            expect(consoleSpy).not.toHaveBeenCalled();
        });
    });

    describe('M (Money) cheat', () => {
        test('should add money with valid integer', () => {
            storage.processCheat('M500', mockState);
            expect(mockState.trainer.money).toBe(600); // 100 + 500
        });

        test('should add money with negative integer (subtract money)', () => {
            storage.processCheat('M-50', mockState);
            expect(mockState.trainer.money).toBe(50); // 100 - 50
        });

        test('should ignore if money is NaN', () => {
            storage.processCheat('Mabc', mockState);
            expect(mockState.trainer.money).toBe(100); // unchanged
            expect(consoleSpy).not.toHaveBeenCalled();
        });

        test('should ignore if length is not greater than 1', () => {
            storage.processCheat('M', mockState);
            expect(mockState.trainer.money).toBe(100); // unchanged
            expect(consoleSpy).not.toHaveBeenCalled();
        });
    });

    describe('XP (Experience) cheat', () => {
        test('should add XP to trainer and first party member with valid integer', () => {
            storage.processCheat('XP1000', mockState);
            expect(mockState.trainer.xp).toBe(2000); // 1000 + 1000
            expect(mockState.party[0].xp).toBe(1500); // 500 + 1000
        });

        test('should add XP to trainer only if party is empty', () => {
            mockState.party = [];
            storage.processCheat('XP500', mockState);
            expect(mockState.trainer.xp).toBe(1500); // 1000 + 500
        });

        test('should ignore if XP is NaN', () => {
            storage.processCheat('XPabc', mockState);
            expect(mockState.trainer.xp).toBe(1000); // unchanged
            expect(mockState.party[0].xp).toBe(500); // unchanged
            expect(consoleSpy).not.toHaveBeenCalled();
        });

        test('should ignore if length is not greater than 2', () => {
            storage.processCheat('XP', mockState);
            expect(mockState.trainer.xp).toBe(1000); // unchanged
            expect(mockState.party[0].xp).toBe(500); // unchanged
            expect(consoleSpy).not.toHaveBeenCalled();
        });
    });

    test('should ignore unknown commands', () => {
        storage.processCheat('UNKNOWN123', mockState);
        expect(mockState.settings.gameSpeed).toBe(1);
        expect(mockState.trainer.money).toBe(100);
        expect(mockState.trainer.xp).toBe(1000);
        expect(consoleSpy).not.toHaveBeenCalled();
    });
});

describe('Storage.reset', () => {
    let storage;
    let consoleLogSpy;
    let consoleErrorSpy;

    beforeEach(() => {
        storage = new Storage();
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        // Clear all mocks to ensure clean state for window.localStorage from previous tests
        jest.clearAllMocks();
    });

    afterEach(() => {
        consoleLogSpy.mockRestore();
        consoleErrorSpy.mockRestore();
    });

    test('should return early if currentProfileId is not set', () => {
        storage.currentProfileId = null;
        storage.reset();
        expect(window.localStorage.removeItem).not.toHaveBeenCalled();
        expect(consoleLogSpy).not.toHaveBeenCalled();
        expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    test('should remove the current profile from localStorage', () => {
        storage.currentProfileId = 'test_profile_id';
        storage.reset();
        expect(window.localStorage.removeItem).toHaveBeenCalledWith('test_profile_id');
        expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    test('should catch and log error if localStorage.removeItem fails', () => {
        // Setup state
        storage.currentProfileId = 'test_profile_id';
        const mockError = new Error('Storage error');

        // Mock localStorage.removeItem to throw an error
        window.localStorage.removeItem.mockImplementationOnce(() => {
            throw mockError;
        });

        // Execute reset
        storage.reset();

        // Verify it was called correctly
        expect(window.localStorage.removeItem).toHaveBeenCalledWith('test_profile_id');
        // Verify error was caught and logged
        expect(consoleErrorSpy).toHaveBeenCalledWith("Failed to clear save:", mockError);
        // Verify success log was not called
        expect(consoleLogSpy).not.toHaveBeenCalled();
    });
});

describe('Storage.loadProfileIntoState', () => {
    let storage;

    beforeEach(() => {
        storage = new Storage();
        jest.clearAllMocks();
    });

    test('should load valid profile data into state, preserve config, and set currentProfileId', () => {
        const savedData = {
            trainer: { money: 500, badges: 2 },
            party: [{ name: 'Bulbasaur', level: 10 }]
        };
        window.localStorage.getItem.mockReturnValueOnce(JSON.stringify(savedData));

        const state = {
            trainer: { money: 0, badges: 0 },
            party: [],
            config: { pokemonData: ['Bulbasaur'] }
        };

        const result = storage.loadProfileIntoState('profile_123', state);

        expect(result).toEqual({ ok: true });
        expect(storage.currentProfileId).toBe('profile_123');
        expect(state.trainer).toEqual({ money: 500, badges: 2 });
        expect(state.party).toEqual([{ name: 'Bulbasaur', level: 10 }]);
        expect(state.config).toEqual({ pokemonData: ['Bulbasaur'] });
    });

    test('should return ok: false when profile data is missing', () => {
        window.localStorage.getItem.mockReturnValueOnce(null);
        const state = { trainer: { money: 0 } };

        const result = storage.loadProfileIntoState('profile_missing', state);

        expect(result.ok).toBe(false);
        expect(storage.currentProfileId).toBeNull();
    });

    test('should return ok: false when profile data is corrupted JSON', () => {
        const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
        window.localStorage.getItem.mockReturnValueOnce('{invalid-json');
        const state = { trainer: { money: 0 } };

        const result = storage.loadProfileIntoState('profile_corrupt', state);

        expect(result.ok).toBe(false);
        expect(storage.currentProfileId).toBeNull();
        warnSpy.mockRestore();
    });

    test('should return ok: false when profileId or state is missing', () => {
        expect(storage.loadProfileIntoState(null, {}).ok).toBe(false);
        expect(storage.loadProfileIntoState('profile_123', null).ok).toBe(false);
    });
});

describe('Storage failsafes & recovery', () => {
    let storage;
    let mockDisk;
    let store;

    beforeEach(() => {
        store = new Map();
        Object.defineProperty(window, 'localStorage', {
            value: {
                get length() { return store.size; },
                key: jest.fn((i) => Array.from(store.keys())[i] ?? null),
                getItem: jest.fn((k) => (store.has(k) ? store.get(k) : null)),
                setItem: jest.fn((k, v) => { store.set(k, String(v)); }),
                removeItem: jest.fn((k) => { store.delete(k); })
            },
            writable: true
        });

        const diskFiles = new Map();
        let diskIndex = [];
        mockDisk = {
            listProfiles: jest.fn(() => ({ ok: true, profiles: [...diskIndex] })),
            readProfile: jest.fn((id) => diskFiles.has(id)
                ? { ok: true, data: JSON.parse(diskFiles.get(id)), raw: diskFiles.get(id), source: 'primary' }
                : { ok: false }),
            writeProfile: jest.fn((id, json) => {
                diskFiles.set(id, json);
                if (!diskIndex.includes(id)) diskIndex.push(id);
                return { ok: true };
            }),
            writeMasterIndex: jest.fn((arr) => {
                diskIndex = [...arr];
                return { ok: true };
            }),
            deleteProfile: jest.fn((id) => {
                diskFiles.delete(id);
                diskIndex = diskIndex.filter(x => x !== id);
                return { ok: true };
            })
        };

        window.electronAPI = { saveStorage: mockDisk };
        storage = new Storage();
    });

    afterEach(() => {
        delete window.electronAPI;
        jest.restoreAllMocks();
    });

    test('refuses to overwrite a progressed profile with an empty state', () => {
        const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        const pid = storage.createNewProfile();
        const goodState = {
            party: [{ name: 'Charmander', level: 12 }],
            storage: [],
            stats: { hasPickedStarter: true },
            globalStats: { playtime: 120 }
        };
        expect(storage.save(goodState)).toBe(true);

        const emptyState = {
            party: [],
            storage: [],
            stats: { hasPickedStarter: false },
            globalStats: { playtime: 0 }
        };
        expect(storage.save(emptyState)).toBe(false);
        expect(errorSpy).toHaveBeenCalled();

        const loaded = storage.getProfileData(pid);
        expect(loaded.party).toHaveLength(1);
        expect(loaded.party[0].name).toBe('Charmander');
    });

    test('succeeds via disk storage even when localStorage throws QuotaExceededError', () => {
        const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
        const pid = storage.createNewProfile();
        window.localStorage.setItem.mockImplementation(() => {
            throw new Error('QuotaExceededError');
        });

        const state = {
            party: [{ name: 'Squirtle', level: 8 }],
            storage: [],
            stats: { hasPickedStarter: true }
        };
        expect(storage.save(state)).toBe(true);
        expect(mockDisk.writeProfile).toHaveBeenCalledWith(pid, expect.any(String));
        expect(storage.getProfileData(pid).party[0].name).toBe('Squirtle');
        warnSpy.mockRestore();
    });

    test('recovers corrupted primary localStorage from backup slot or disk', () => {
        const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
        const pid = storage.createNewProfile();
        storage.save({
            party: [{ name: 'Bulbasaur', level: 10 }],
            storage: [],
            stats: { hasPickedStarter: true }
        });

        // Corrupt primary localStorage entry
        store.set(pid, '{broken-json');

        const recovered = storage.getProfileData(pid);
        expect(recovered).not.toBeNull();
        expect(recovered.party[0].name).toBe('Bulbasaur');
        // Primary localStorage should be self-healed
        expect(() => JSON.parse(store.get(pid))).not.toThrow();
        warnSpy.mockRestore();
    });

    test('syncProfiles recovers orphaned localStorage profiles when master index is lost', () => {
        store.set('profile_orphan_99', JSON.stringify({
            profileName: 'Orphan',
            party: [{ name: 'Eevee', level: 15 }],
            lastPlayed: 5000
        }));

        const syncedStorage = new Storage();
        const profiles = syncedStorage.getProfiles();
        expect(profiles).toContain('profile_orphan_99');
        expect(mockDisk.writeProfile).toHaveBeenCalledWith('profile_orphan_99', expect.any(String));
    });
});
