import BattleSystem from '../src/battleSystem.js';

describe('BattleSystem cloneEncounter', () => {
    let battleSystem;

    beforeEach(() => {
        // Instantiate BattleSystem with dummy arguments
        battleSystem = new BattleSystem({}, () => {});
    });

    it('returns null if encounter is null or undefined', () => {
        expect(battleSystem.cloneEncounter(null)).toBeNull();
        expect(battleSystem.cloneEncounter(undefined)).toBeNull();
    });

    it('deeply clones a fully populated encounter object', () => {
        const encounter = {
            id: 25,
            name: 'Pikachu',
            level: 5,
            types: ['Electric'],
            ivs: { hp: 31, atk: 15, def: 20 },
            currentStats: { hp: 20, atk: 10, def: 10 },
            moves: [
                { name: 'Thundershock', power: 40 },
                { name: 'Growl', power: 0 }
            ]
        };

        const cloned = battleSystem.cloneEncounter(encounter);

        // Verify values are identical
        expect(cloned).toEqual(encounter);

        // Verify top-level reference is different
        expect(cloned).not.toBe(encounter);

        // Verify nested object references are different
        expect(cloned.types).not.toBe(encounter.types);
        expect(cloned.ivs).not.toBe(encounter.ivs);
        expect(cloned.currentStats).not.toBe(encounter.currentStats);
        expect(cloned.moves).not.toBe(encounter.moves);
        expect(cloned.moves[0]).not.toBe(encounter.moves[0]);
        expect(cloned.moves[1]).not.toBe(encounter.moves[1]);
    });

    it('gracefully handles missing nested properties', () => {
        const encounter = {
            id: 25,
            name: 'Pikachu',
            level: 5
        };

        const cloned = battleSystem.cloneEncounter(encounter);

        // Verify values are identical
        expect(cloned).toEqual({
            id: 25,
            name: 'Pikachu',
            level: 5,
            types: undefined,
            ivs: undefined,
            currentStats: undefined,
            moves: undefined
        });

        expect(cloned).not.toBe(encounter);
    });
});
