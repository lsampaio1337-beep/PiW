const { test, expect } = require('@playwright/test');

// Setup window.localStorage mock for Node environment
class LocalStorageMock {
  constructor() {
    this.store = {};
  }

  clear() {
    this.store = {};
  }

  getItem(key) {
    return this.store[key] || null;
  }

  setItem(key, value) {
    this.store[key] = String(value);
  }

  removeItem(key) {
    delete this.store[key];
  }
}

test.describe('Storage Class Tests', () => {
  let Storage;

  test.beforeAll(async () => {
    // Mock window and localStorage globally
    global.window = {
      localStorage: new LocalStorageMock()
    };

    const module = require('../../src/storage.js');
    Storage = module.default ? module.default : module;
  });

  test.beforeEach(() => {
    // Clear mock storage before each test
    global.window.localStorage.clear();
  });

  test('migrateOldSave: should migrate an old single save to a new profile', () => {
    // Setup old save
    global.window.localStorage.setItem('idle_pokemon_world_save', JSON.stringify({ old: 'data' }));

    const storage = new Storage();

    // Verify old save is deleted
    expect(global.window.localStorage.getItem('idle_pokemon_world_save')).toBeNull();

    // Verify a new profile was created in master list
    const profiles = JSON.parse(global.window.localStorage.getItem('idle_pokemon_world_profiles'));
    expect(profiles).toHaveLength(1);

    const profileId = profiles[0];
    expect(profileId.startsWith('profile_')).toBeTruthy();

    // Verify data was migrated
    const profileData = JSON.parse(global.window.localStorage.getItem(profileId));
    expect(profileData).toEqual({ old: 'data' });
  });

  test('migrateOldSave: should do nothing if no old save exists', () => {
    const storage = new Storage();

    // Should not create profiles or crash
    expect(global.window.localStorage.getItem('idle_pokemon_world_profiles')).toBeNull();
    const profiles = storage.getProfiles();
    expect(profiles).toHaveLength(0);
  });

  test('createNewProfile: creates and sets current profile', () => {
    const storage = new Storage();
    const p1 = storage.createNewProfile();

    expect(p1.startsWith('profile_')).toBeTruthy();
    expect(storage.currentProfileId).toBe(p1);

    const profiles = storage.getProfiles();
    expect(profiles).toContain(p1);
  });

  test('save and load: saves state to current profile and loads it', () => {
    const storage = new Storage();
    const p1 = storage.createNewProfile();

    const testState = {
      party: [{ name: 'Pikachu' }],
      trainer: { money: 100 }
    };

    storage.save(testState);

    const loadedData = storage.load();
    // Storage injects a lastPlayed timestamp
    expect(loadedData.party).toEqual(testState.party);
    expect(loadedData.trainer).toEqual(testState.trainer);
    expect(loadedData.lastPlayed).toBeDefined();
  });

  test('save: handles circular references or config by ignoring them', () => {
    const storage = new Storage();
    storage.createNewProfile();

    const testState = {
      config: { shouldBeIgnored: true },
      dayCareRef: { circular: true },
      keepMe: "hello"
    };

    storage.save(testState);
    const loaded = storage.load();

    expect(loaded.config).toBeUndefined();
    expect(loaded.dayCareRef).toBeUndefined();
    expect(loaded.keepMe).toBe("hello");
  });

  test('save: should not save if no profile selected', () => {
    const storage = new Storage();
    const testState = { test: 123 };

    // Attempt save without current profile
    storage.save(testState);

    // There shouldn't be anything in local storage besides master list (empty)
    expect(Object.keys(global.window.localStorage.store).length).toBe(0);
  });

  test('getProfileData: returns parsed profile data or null if invalid', () => {
    const storage = new Storage();
    global.window.localStorage.setItem('my_custom_profile', '{"foo":"bar"}');

    const data = storage.getProfileData('my_custom_profile');
    expect(data).toEqual({ foo: 'bar' });

    // Invalid JSON
    global.window.localStorage.setItem('bad_profile', '{bad');
    const badData = storage.getProfileData('bad_profile');
    expect(badData).toBeNull();

    // Non-existent
    expect(storage.getProfileData('non_existent')).toBeNull();
  });

  test('deleteProfile: removes profile from master list and deletes data', () => {
    const storage = new Storage();

    // Because createNewProfile uses Date.now(), creating two instantly in the same ms
    // might result in the same ID. Let's mock a short delay or force different IDs if needed.
    // However, they append Date.now(), so they could collide.
    // To ensure different IDs, we'll manually add one and use createNewProfile for the other.
    const p1 = "profile_111111";
    global.window.localStorage.setItem(storage.masterKey, JSON.stringify([p1]));
    global.window.localStorage.setItem(p1, '{"data":1}');

    // Need to use internal array, so wait a bit before calling createNewProfile, or just manually do it.
    const p2 = storage.createNewProfile();

    expect(storage.getProfiles()).toHaveLength(2);

    storage.deleteProfile(p1);

    expect(storage.getProfiles()).toHaveLength(1);
    expect(storage.getProfiles()).not.toContain(p1);
    expect(storage.getProfiles()).toContain(p2);
    expect(global.window.localStorage.getItem(p1)).toBeNull();
  });

  test('clearAllProfiles: wipes everything', () => {
    const storage = new Storage();
    const p1 = storage.createNewProfile();
    storage.setCurrentProfile(p1);
    storage.save({ data: 1 });

    storage.clearAllProfiles();

    expect(storage.getProfiles()).toHaveLength(0);
    expect(global.window.localStorage.getItem(p1)).toBeNull();
    expect(global.window.localStorage.getItem(storage.masterKey)).toBeNull();
  });

  test('reset: clears current profile data but keeps ID in master list', () => {
    const storage = new Storage();
    const p1 = storage.createNewProfile();
    storage.save({ someData: true });

    storage.reset(); // Should clear data, not ID

    expect(storage.getProfiles()).toContain(p1);
    expect(global.window.localStorage.getItem(p1)).toBeNull();
  });
});
