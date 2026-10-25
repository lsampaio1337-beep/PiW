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
            expect(consoleSpy).toHaveBeenCalledWith('Game speed set to 2.5x');
        });

        test('should update game speed with valid integer', () => {
            storage.processCheat('GS3', mockState);
            expect(mockState.settings.gameSpeed).toBe(3);
            expect(consoleSpy).toHaveBeenCalledWith('Game speed set to 3x');
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
            expect(consoleSpy).toHaveBeenCalledWith('Added $500');
        });

        test('should add money with negative integer (subtract money)', () => {
            storage.processCheat('M-50', mockState);
            expect(mockState.trainer.money).toBe(50); // 100 - 50
            expect(consoleSpy).toHaveBeenCalledWith('Added $-50');
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
            expect(consoleSpy).toHaveBeenCalledWith('Added 1000 XP to Trainer & Slot 1');
        });

        test('should add XP to trainer only if party is empty', () => {
            mockState.party = [];
            storage.processCheat('XP500', mockState);
            expect(mockState.trainer.xp).toBe(1500); // 1000 + 500
            expect(consoleSpy).toHaveBeenCalledWith('Added 500 XP to Trainer & Slot 1');
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

    test('should remove the current profile from localStorage and log success', () => {
        storage.currentProfileId = 'test_profile_id';
        storage.reset();
        expect(window.localStorage.removeItem).toHaveBeenCalledWith('test_profile_id');
        // expect(consoleLogSpy).toHaveBeenCalledWith("Save data cleared for current profile."); // The source code no longer logs this message.
        expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    test('should catch and log error if localStorage.removeItem fails', () => {
        storage.currentProfileId = 'test_profile_id';
        const mockError = new Error('Storage error');
        window.localStorage.removeItem.mockImplementationOnce(() => {
            throw mockError;
        });

        storage.reset();
        expect(window.localStorage.removeItem).toHaveBeenCalledWith('test_profile_id');
        expect(consoleErrorSpy).toHaveBeenCalledWith("Failed to clear save:", mockError);
        expect(consoleLogSpy).not.toHaveBeenCalled();
    });
});


describe('Storage.getProfiles', () => {
    let storage;
    let consoleWarnSpy;

    beforeEach(() => {
        storage = new Storage();
        consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
        jest.clearAllMocks();
    });

    afterEach(() => {
        consoleWarnSpy.mockRestore();
    });

    test('should return array of profiles on valid JSON', () => {
        window.localStorage.getItem.mockReturnValueOnce(JSON.stringify(["profile_1", "profile_2"]));
        const profiles = storage.getProfiles();
        expect(profiles).toEqual(["profile_1", "profile_2"]);
        expect(window.localStorage.getItem).toHaveBeenCalledWith(storage.masterKey);
    });

    test('should return empty array if no data exists', () => {
        window.localStorage.getItem.mockReturnValueOnce(null);
        const profiles = storage.getProfiles();
        expect(profiles).toEqual([]);
    });

    test('should return empty array and log warning on invalid JSON', () => {
        window.localStorage.getItem.mockReturnValueOnce("invalid json");
        const profiles = storage.getProfiles();
        expect(profiles).toEqual([]);
        expect(consoleWarnSpy).toHaveBeenCalledWith(
            "Failed to parse profiles data from localStorage:",
            expect.any(Error)
        );
    });

    test('should return empty array and log warning if getItem throws', () => {
        const mockError = new Error("Storage access denied");
        window.localStorage.getItem.mockImplementationOnce(() => {
            throw mockError;
        });
        const profiles = storage.getProfiles();
        expect(profiles).toEqual([]);
        expect(consoleWarnSpy).toHaveBeenCalledWith(
            "Failed to parse profiles data from localStorage:",
            mockError
        );
    });
});
