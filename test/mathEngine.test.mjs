import assert from 'assert';
import fs from 'fs';

// To avoid the module issue mentioned in memory:
// "Node utility scripts cannot natively import project configuration files ... using ES6 imports because the project's package.json lacks 'type': 'module'. Parsing the file contents as strings using Regex, eval(), or stripping exports for new Function() is a required workaround"
const fileContent = fs.readFileSync('./src/mathEngine.js', 'utf8');
const moduleContent = fileContent.replace(/export \{[\s\S]*?\};/, '') +
    '\nreturn { calculateDamage };';

const mathEngine = new Function(moduleContent)();
const calculateDamage = mathEngine.calculateDamage;

const originalMathRandom = Math.random;

describe('calculateDamage', () => {
    afterEach(() => {
        Math.random = originalMathRandom;
    });

    it('should correctly apply critical hit multiplier (1.5x) and ignore quality directly', () => {
        const level = 10;
        const power = 40;
        const attackStat = 20;
        const defenseStat = 10;
        const typeEffectiveness = 1.0;
        const quality = 1.0;

        let calls = 0;
        Math.random = () => {
            calls++;
            if (calls === 1) return 0.01;
            if (calls === 2) return 0.0;
            return 0;
        };

        const result = calculateDamage(level, power, attackStat, defenseStat, typeEffectiveness, quality);

        assert.strictEqual(result.damage, 14);
        assert.strictEqual(result.isCritical, true);
        assert.strictEqual(result.effectiveness, 1.0);
    });

    it('should correctly calculate normal hit (no critical)', () => {
        const level = 10;
        const power = 40;
        const attackStat = 20;
        const defenseStat = 10;
        const typeEffectiveness = 1.0;
        const quality = 1.0;

        let calls = 0;
        Math.random = () => {
            calls++;
            if (calls === 1) return 0.1;
            if (calls === 2) return 0.0;
            return 0;
        };

        const result = calculateDamage(level, power, attackStat, defenseStat, typeEffectiveness, quality);

        assert.strictEqual(result.damage, 9);
        assert.strictEqual(result.isCritical, false);
    });

    it('should combine critical hit and type effectiveness correctly', () => {
        const level = 10;
        const power = 40;
        const attackStat = 20;
        const defenseStat = 10;
        const typeEffectiveness = 2.0;
        const quality = 1.0;

        let calls = 0;
        Math.random = () => {
            calls++;
            if (calls === 1) return 0.01;
            if (calls === 2) return 1.0;
            return 0;
        };

        const result = calculateDamage(level, power, attackStat, defenseStat, typeEffectiveness, quality);

        assert.strictEqual(result.damage, 33);
        assert.strictEqual(result.isCritical, true);
        assert.strictEqual(result.effectiveness, 2.0);
    });

    it('should enforce minimum damage of 1', () => {
        const level = 1;
        const power = 10;
        const attackStat = 1;
        const defenseStat = 100;
        const typeEffectiveness = 0.25;
        const quality = 1.0;

        let calls = 0;
        Math.random = () => {
            calls++;
            if (calls === 1) return 0.1; // not critical
            if (calls === 2) return 0.0; // 0.85 mult
            return 0;
        };

        const result = calculateDamage(level, power, attackStat, defenseStat, typeEffectiveness, quality);

        assert.strictEqual(result.damage, 1);
        assert.strictEqual(result.isCritical, false);
    });
});
