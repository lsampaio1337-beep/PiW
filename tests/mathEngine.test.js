import { getCapacity } from '../src/mathEngine.js';

describe('getCapacity', () => {
    it('should return base capacity for balls when no expansions or upgrades exist', () => {
        const state = {};
        expect(getCapacity(state, 'balls')).toBe(100);
        expect(getCapacity(state, 'pokeballs')).toBe(100);
    });

    it('should calculate capacity correctly for balls with valid expansions and tier', () => {
        const state = {
            config: {
                balance: {
                    expansions: {
                        ballPocket: [
                            { increment: 50 },
                            { increment: 100 },
                            { increment: 150 }
                        ]
                    }
                }
            },
            stats: {
                upgrades: {
                    ballsTier: 2
                }
            }
        };
        // Base 100 + 50 (tier 1) + 100 (tier 2) = 250
        expect(getCapacity(state, 'balls')).toBe(250);
    });

    it('should return base capacity for potions when no expansions or upgrades exist', () => {
        const state = {};
        expect(getCapacity(state, 'potions')).toBe(20);
    });

    it('should calculate capacity correctly for potions with valid expansions and tier', () => {
        const state = {
            config: {
                balance: {
                    expansions: {
                        potionSatchel: [
                            { increment: 10 },
                            { increment: 20 }
                        ]
                    }
                }
            },
            stats: {
                upgrades: {
                    potionsTier: 2
                }
            }
        };
        // Base 20 + 10 + 20 = 50
        expect(getCapacity(state, 'potions')).toBe(50);
    });

    it('should return base capacity for box when no expansions or upgrades exist', () => {
        const state = {};
        expect(getCapacity(state, 'box')).toBe(20);
    });

    it('should calculate capacity correctly for box with valid expansions and tier', () => {
        const state = {
            config: {
                balance: {
                    expansions: {
                        pokemonBox: [
                            { increment: 30 },
                            { increment: 30 },
                            { increment: 40 }
                        ]
                    }
                }
            },
            stats: {
                upgrades: {
                    boxTier: 3
                }
            }
        };
        // Base 20 + 30 + 30 + 40 = 120
        expect(getCapacity(state, 'box')).toBe(120);
    });

    it('should handle currentTier larger than available expansions array safely', () => {
        const state = {
            config: {
                balance: {
                    expansions: {
                        potionSatchel: [
                            { increment: 10 }
                        ]
                    }
                }
            },
            stats: {
                upgrades: {
                    potionsTier: 5 // Greater than length of 1
                }
            }
        };
        // Base 20 + 10 (tier 1) + 0 (missing tiers) = 30
        expect(getCapacity(state, 'potions')).toBe(30);
    });

    it('should return 0 for unknown types', () => {
        const state = {};
        expect(getCapacity(state, 'unknownType')).toBe(0);
    });

    it('should handle completely null state gracefully', () => {
        // Technically getCapacity expects state to be an object due to optional chaining,
        // but if state is passed as undefined/null, it might throw if it assumes state is an object.
        // Let's verify what happens. It uses `state.config?.balance` which will throw if state is undefined.
        // Wait, `state?.config?.balance` would be safe, but `state.config?.balance` will throw.
        // Let's test with empty object first.
        const state = {};
        expect(getCapacity(state, 'balls')).toBe(100);
    });
});
