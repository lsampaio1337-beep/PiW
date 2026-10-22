import Storage from '../src/storage.js';

describe('Storage', () => {
    let storage;
    let mockLocalStorage;
    let consoleWarnSpy;
    let consoleLogSpy;

    beforeEach(() => {
        // Clear all instances and calls to constructor and all methods:
        jest.clearAllMocks();

        // Setup mock for window.localStorage
        mockLocalStorage = {
            getItem: jest.fn(),
            setItem: jest.fn(),
            removeItem: jest.fn()
        };

        // Replace window.localStorage with our mock
        Object.defineProperty(window, 'localStorage', {
            value: mockLocalStorage,
            writable: true
        });

        // Spy on console.warn to verify error logging
        consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
        // Spy on console.log to suppress noise from migrateOldSave
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

        storage = new Storage();
    });

    afterEach(() => {
        consoleWarnSpy.mockRestore();
        consoleLogSpy.mockRestore();
    });

    describe('getProfiles', () => {
        it('should return an empty array if localStorage returns null', () => {
            mockLocalStorage.getItem.mockReturnValue(null);

            const profiles = storage.getProfiles();

            expect(profiles).toEqual([]);
            expect(mockLocalStorage.getItem).toHaveBeenCalledWith(storage.masterKey);
        });

        it('should return parsed profiles if valid JSON is found', () => {
            const expectedProfiles = ['profile_1', 'profile_2'];
            mockLocalStorage.getItem.mockReturnValue(JSON.stringify(expectedProfiles));

            const profiles = storage.getProfiles();

            expect(profiles).toEqual(expectedProfiles);
            expect(mockLocalStorage.getItem).toHaveBeenCalledWith(storage.masterKey);
        });

        it('should catch errors when JSON is invalid and return an empty array', () => {
            // Setup invalid JSON
            mockLocalStorage.getItem.mockReturnValue('{invalid_json');

            const profiles = storage.getProfiles();

            expect(profiles).toEqual([]);
            expect(consoleWarnSpy).toHaveBeenCalledWith(
                "Failed to parse profiles data from localStorage:",
                expect.any(SyntaxError)
            );
        });

        it('should catch errors when localStorage throws an exception and return an empty array', () => {
            // Setup localStorage to throw an error (e.g. quota exceeded or access denied)
            const mockError = new Error('Access Denied');
            mockLocalStorage.getItem.mockImplementation(() => {
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
});
