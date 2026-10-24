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

    describe('Storage.getProfileData', () => {
        let storage;
        let warnSpy;

        beforeEach(() => {
            storage = new Storage();
            warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
        });

        afterEach(() => {
            warnSpy.mockRestore();
        });

        test('should return parsed data when valid JSON is retrieved', () => {
            const profileData = { name: 'Player1', level: 10 };
            window.localStorage.getItem.mockReturnValueOnce(JSON.stringify(profileData));

            const result = storage.getProfileData('test_profile');
            expect(window.localStorage.getItem).toHaveBeenCalledWith('test_profile');
            expect(result).toEqual(profileData);
            expect(warnSpy).not.toHaveBeenCalled();
        });

        test('should return null when localStorage returns null', () => {
            window.localStorage.getItem.mockReturnValueOnce(null);

            const result = storage.getProfileData('empty_profile');
            expect(window.localStorage.getItem).toHaveBeenCalledWith('empty_profile');
            expect(result).toBeNull();
            expect(warnSpy).not.toHaveBeenCalled();
        });

        test('should return null and log warning when JSON is malformed', () => {
            window.localStorage.getItem.mockReturnValueOnce('{invalid_json}');

            const result = storage.getProfileData('bad_json_profile');
            expect(window.localStorage.getItem).toHaveBeenCalledWith('bad_json_profile');
            expect(result).toBeNull();
            expect(warnSpy).toHaveBeenCalledWith(
                'Failed to parse profile data for bad_json_profile:',
                expect.any(SyntaxError)
            );
        });

        test('should return null and log warning when localStorage.getItem throws an error', () => {
            const mockError = new Error('Access Denied');
            window.localStorage.getItem.mockImplementationOnce(() => {
                throw mockError;
            });

            const result = storage.getProfileData('error_profile');
            expect(window.localStorage.getItem).toHaveBeenCalledWith('error_profile');
            expect(result).toBeNull();
            expect(warnSpy).toHaveBeenCalledWith(
                'Failed to parse profile data for error_profile:',
                mockError
            );
        });
    });
