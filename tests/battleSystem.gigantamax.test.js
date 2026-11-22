import { jest } from '@jest/globals';
import BattleSystem from '../src/battleSystem.js';
import * as mathEngine from '../src/mathEngine.js';

function createGmaxMon(id, name, types = ['Normal'], overrides = {}) {
    return {
        uuid: `mon-${id}`,
        id,
        name,
        types,
        level: 50,
        xp: 0,
        maxHp: 500,
        currentHp: 500,
        quality: 1.0,
        qualityName: 'Regular',
        ivs: { hp: 50, atk: 50, def: 50, spa: 50, spd: 50, spe: 50 },
        currentStats: { hp: 500, atk: 100, def: 100, spa: 100, spd: 100, spe: 100 },
        moves: [{ name: 'Hyper Beam', type: 'Normal', category: 'Special', power: 100 }],
        gmaxOriginalId: Number(String(id).split('.')[0]),
        gmaxExpiresAt: Date.now() + 300_000,
        ...overrides,
    };
}

function createState(leader) {
    return {
        currentRoute: 'Route 1 (Galar)',
        currentRegionName: 'Galar',
        trainer: { money: 0, badges: 0 },
        party: [leader],
        storage: [],
        backpack: {
            pokeballs: { Pokeball: 10 },
            potions: {},
            stones: {},
        },
        settings: {
            activeBallTier: 0,
            activePotionTier: 0,
            autoCatch: false,
            autoPotion: false,
            gameSpeed: 1,
        },
        stats: {
            caught: 0,
            seenSpecies: {},
            caughtSpecies: {},
            catchAttempts: {},
            shinyCatchAttempts: {},
            greenCandies: 0,
            whiteCandies: 0,
            bonusCandyDefeats: 0,
        },
        config: {
            balance: {
                baseAttackDelay: 2.0,
                baseSearchTime: 3.0,
                items: {
                    pokeballs: [{ name: 'Pokeball', multiplier: 1.0 }],
                    potions: [],
                },
            },
            types: {
                Normal: { Normal: 1 },
                Fire: { Water: 0.5, Grass: 2, Fire: 0.5 },
                Water: { Fire: 2, Water: 0.5 },
            },
            pokemonData: [],
            moves: {},
        },
    };
}

describe('BattleSystem Gigantamax Passive Effects', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('extra DoT damage triggers after hit and respects same-type immunity', () => {
        const charizard = createGmaxMon('0006.1', 'Charizard (Gigantamax)', ['Fire', 'Flying']);
        const bs = new BattleSystem(createState(charizard), jest.fn());

        const normalTarget = createGmaxMon(143, 'Snorlax', ['Normal'], { gmaxOriginalId: undefined, gmaxExpiresAt: undefined });
        normalTarget.currentHp = 500;
        const dot1 = bs._applyPostHitGmaxEffects(charizard, normalTarget, { damage: 100 });
        expect(dot1).toBe(20);
        expect(normalTarget.currentHp).toBe(480);

        const fireTarget = createGmaxMon(58, 'Growlithe', ['Fire'], { gmaxOriginalId: undefined, gmaxExpiresAt: undefined });
        fireTarget.currentHp = 500;
        const dot2 = bs._applyPostHitGmaxEffects(charizard, fireTarget, { damage: 100 });
        expect(dot2).toBe(0);
        expect(fireTarget.currentHp).toBe(500);
    });

    test('damage boost, defense ignore, max roll, and damage taken reduction apply in _computeAttackHit', () => {
        const randSpy = jest.spyOn(Math, 'random').mockReturnValue(0.10); // above 0.04 crit, low random roll (0.865)

        // Control: non-Gmax baseline
        const plain = createGmaxMon(812, 'Rillaboom', ['Grass'], { gmaxOriginalId: undefined, gmaxExpiresAt: undefined });
        const target = createGmaxMon(1, 'Dummy', ['Normal'], {
            gmaxOriginalId: undefined,
            gmaxExpiresAt: undefined,
            currentStats: { hp: 500, atk: 100, def: 100, spa: 100, spd: 100, spe: 100 },
        });
        const bs = new BattleSystem(createState(plain), jest.fn());
        const move = plain.moves[0];

        const baseHit = bs._computeAttackHit(plain, target, move).hit;

        // Rillaboom (+20% damage)
        const gmaxRilla = createGmaxMon('0812.1', 'Rillaboom (Gigantamax)', ['Grass']);
        bs.state.party[0] = gmaxRilla;
        const rillaHit = bs._computeAttackHit(gmaxRilla, target, move).hit;
        expect(rillaHit.damage).toBeGreaterThan(baseHit.damage);

        // Urshifu (ignores 25% Defense)
        const gmaxUrshifu = createGmaxMon('0892.4', 'Urshifu (Single Strike Gigantamax)', ['Fighting', 'Dark']);
        const urshifuHit = bs._computeAttackHit(gmaxUrshifu, target, move).hit;
        expect(urshifuHit.damage).toBeGreaterThan(baseHit.damage);

        // Orbeetle (always max roll + 10% bonus)
        const gmaxOrbeetle = createGmaxMon('0826.1', 'Orbeetle (Gigantamax)', ['Bug', 'Psychic']);
        const orbeetleHit = bs._computeAttackHit(gmaxOrbeetle, target, move).hit;
        expect(orbeetleHit.damage).toBeGreaterThan(baseHit.damage);

        // Lapras defending (takes 25% less damage)
        const gmaxLapras = createGmaxMon('0131.1', 'Lapras (Gigantamax)', ['Water', 'Ice']);
        const hitOnLapras = bs._computeAttackHit(plain, gmaxLapras, move).hit;
        expect(hitOnLapras.damage).toBeLessThan(baseHit.damage);

        randSpy.mockRestore();
    });

    test('Machamp 40% crit rate triggers crits when roll < 0.40', () => {
        jest.spyOn(Math, 'random').mockReturnValue(0.25);
        const machamp = createGmaxMon('0068.1', 'Machamp (Gigantamax)', ['Fighting']);
        const target = createGmaxMon(1, 'Dummy', ['Normal'], { gmaxOriginalId: undefined, gmaxExpiresAt: undefined });
        const bs = new BattleSystem(createState(machamp), jest.fn());
        const { hit } = bs._computeAttackHit(machamp, target, machamp.moves[0]);
        expect(hit.isCritical).toBe(true);
    });

    test('Pikachu slows enemy attack delay and Duraludon speeds up player attack delay', () => {
        const plain = createGmaxMon(25, 'Pikachu', ['Electric'], { gmaxOriginalId: undefined, gmaxExpiresAt: undefined });
        const bs = new BattleSystem(createState(plain), jest.fn());
        const baseDelays = bs.getAdjustedAttackDelays(100, 100);

        bs.state.party[0] = createGmaxMon('0025.2', 'Pikachu (Gigantamax)', ['Electric']);
        const pikaDelays = bs.getAdjustedAttackDelays(100, 100);
        expect(pikaDelays.enemyDelay).toBeCloseTo(baseDelays.enemyDelay * 1.25, 4);

        bs.state.party[0] = createGmaxMon('0884.1', 'Duraludon (Gigantamax)', ['Steel', 'Dragon']);
        const duraDelays = bs.getAdjustedAttackDelays(100, 100);
        expect(duraDelays.leaderDelay).toBeLessThan(baseDelays.leaderDelay);
    });

    test('Alcremie heals 3% Max HP on hit and Butterfree stuns enemy on roll < 0.20', () => {
        jest.spyOn(Math, 'random').mockReturnValue(0.10);
        const alcremie = createGmaxMon('0869.9', 'Alcremie (Gigantamax)', ['Fairy'], { maxHp: 1000, currentHp: 800 });
        const target = createGmaxMon(1, 'Dummy', ['Normal'], { gmaxOriginalId: undefined, gmaxExpiresAt: undefined });
        const bs = new BattleSystem(createState(alcremie), jest.fn());

        bs._applyPostHitGmaxEffects(alcremie, target, { damage: 50 });
        expect(alcremie.currentHp).toBe(830);

        const butterfree = createGmaxMon('0012.1', 'Butterfree (Gigantamax)', ['Bug', 'Flying']);
        bs._applyPostHitGmaxEffects(butterfree, target, { damage: 50 });
        expect(target._gmaxStunned).toBe(true);
        expect(bs._consumeGmaxStun(target)).toBe(true);
        expect(bs._consumeGmaxStun(target)).toBe(false);
    });

    test('Drednaw hits new enemies for 20% Max HP at start', () => {
        const drednaw = createGmaxMon('0834.1', 'Drednaw (Gigantamax)', ['Water', 'Rock']);
        const bs = new BattleSystem(createState(drednaw), jest.fn());
        const encounter = { maxHp: 500, currentHp: 500 };
        bs._applyOpeningGmaxEffect(encounter);
        expect(encounter.currentHp).toBe(400);
    });

    test('Gengar boosts catch chance by 20% and Meowth doubles money drops', () => {
        const plain = createGmaxMon(94, 'Gengar', ['Ghost', 'Poison'], { gmaxOriginalId: undefined, gmaxExpiresAt: undefined });
        const bs = new BattleSystem(createState(plain), jest.fn());
        bs.activeEncounter = {
            id: 19,
            name: 'Rattata',
            level: 25,
            bst: 400,
            quality: 1.0,
            qualityName: 'Regular',
            ivs: { hp: 50, atk: 50, def: 50, spa: 50, spd: 50, spe: 50 },
            types: ['Normal'],
            evxp: 50,
            evm: 100,
        };

        const baseChance = mathEngine.calculateCatchChance(400, 25, 1.0, 300, 1.0, bs.state.stats, false);
        const targetRollPct = baseChance * 1.10; // strictly between baseChance and baseChance * 1.20
        const cryptoSpy = jest.spyOn(globalThis.crypto, 'getRandomValues').mockImplementation((arr) => {
            arr[0] = Math.floor((targetRollPct / 100) * 0xFFFFFFFF);
            return arr;
        });

        const resPlain = bs.throwPokeball();
        expect(resPlain.used).toBe(true);
        expect(resPlain.caught).toBe(false);

        bs.state.party[0] = createGmaxMon('0094.1', 'Gengar (Gigantamax)', ['Ghost', 'Poison']);
        const resGengar = bs.throwPokeball();
        expect(resGengar.used).toBe(true);
        expect(resGengar.caught).toBe(true);
        cryptoSpy.mockRestore();

        // Meowth doubles money drops
        bs.state.party[0] = createGmaxMon('0052.3', 'Meowth (Gigantamax)', ['Normal']);
        bs.state.trainer.money = 0;
        bs.grantXP = jest.fn();
        bs.getLootTier = jest.fn(() => 0);
        bs.getEvolutionStage = jest.fn(() => 1);
        bs.generateEncounter = jest.fn();
        bs.handleEnemyDefeat();
        expect(bs.state.trainer.money).toBe(200);
    });
});
