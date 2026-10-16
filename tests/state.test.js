import { describe, it, expect, beforeEach } from 'vitest';
import { setBattleSystem, globals } from '../src/state.js';

describe('state.js', () => {
    beforeEach(() => {
        globals.battleSystem = null;
    });

    describe('setBattleSystem', () => {
        it('should correctly set the battle system in globals', () => {
            const mockSystem = { mock: true };

            setBattleSystem(mockSystem);

            expect(globals.battleSystem).toBe(mockSystem);
        });

        it('should overwrite an existing battle system', () => {
            globals.battleSystem = { old: true };
            const newSystem = { new: true };

            setBattleSystem(newSystem);

            expect(globals.battleSystem).toBe(newSystem);
        });

        it('should handle null/undefined correctly', () => {
            setBattleSystem(null);
            expect(globals.battleSystem).toBeNull();

            setBattleSystem(undefined);
            expect(globals.battleSystem).toBeUndefined();
        });
    });
});
