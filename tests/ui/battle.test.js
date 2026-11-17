import { jest } from '@jest/globals';

jest.mock('../../src/state.js', () => ({
    state: {
        currentRoute: 'Route 1',
        party: [],
        stats: { upgrades: { glassTier: 5, smartwatchTier: 1, boxTier: 1 } },
        settings: { gameSpeed: 1, activePotionTier: -1, activeBallTier: -1, autoPotionThreshold: 50 },
        backpack: { potions: {}, pokeballs: {} },
        config: {
            spriteSizes: {
                '0025': 131,
                '0006': 181,
                '0009': 194,
                '0201': 90
            },
            pokemonData: [],
            pokemonMap: new Map()
        }
    },
    globals: {
        battleSystem: null
    }
}));

jest.mock('../../src/ui.js', () => ({
    TYPE_COLORS: {
        Fire: '#F08030',
        Water: '#6890F0',
        Electric: '#F8D030',
        Flying: '#A890F0',
        Normal: '#A8A878'
    }
}));

jest.mock('../../src/utils/sprites.js', () => ({
    getTrimmedSpriteUrl: jest.fn((id, isShiny) => `mock-sprite/${id}${isShiny ? '_shiny' : ''}.png`),
    precacheRouteSprites: jest.fn()
}));

jest.mock('../../src/mathEngine.js', () => ({
    getCapacity: jest.fn(() => 100)
}));

import { state, globals } from '../../src/state.js';
import {
    getTargetSpriteHeight,
    updateBattleArena,
    showDamage,
    getDamageInfo,
    playCombatAnimations,
    triggerDefeatAnimation
} from '../../src/ui/battle.js';

function setupBattleDOM() {
    document.body.innerHTML = `
        <div id="main-view-window" style="width: 800px; height: 600px;">
            <div id="combat-arena">
                <div id="battle-sprites-container">
                    <div id="enemy-side" class="battle-actor battle-actor-enemy" style="position: absolute; bottom: 20%; left: 100%;">
                        <div id="enemy-sprite-wrapper" class="battle-sprite-stage">
                            <div class="battle-sprite-motion">
                                <div id="enemy-water-effect" class="battle-water-effect"></div>
                                <img id="enemy-pokemon-sprite" class="battle-pokemon-sprite" src="">
                            </div>
                            <div id="enemy-data-modals">
                                <div id="enemy-battle-level"></div>
                                <div id="enemy-battle-sumiv"></div>
                                <div id="enemy-battle-qtier"></div>
                            </div>
                            <div id="enemy-battle-hp-container">
                                <div id="enemy-battle-hp-bar"></div>
                                <div id="enemy-battle-hp-text"></div>
                                <div id="enemy-battle-hp-pct"></div>
                            </div>
                        </div>
                    </div>
                    <div id="player-side" class="battle-actor battle-actor-player" style="position: absolute; bottom: 20%; left: 26%; transform: translateX(-100%);">
                        <div id="player-sprite-wrapper" class="battle-sprite-stage">
                            <div class="battle-sprite-motion">
                                <div id="player-water-effect" class="battle-water-effect"></div>
                                <img id="player-pokemon-sprite" class="battle-pokemon-sprite is-player" src="">
                            </div>
                            <div id="player-battle-hp-container">
                                <div id="player-battle-hp-bar"></div>
                                <div id="player-battle-hp-text"></div>
                                <div id="player-battle-hp-pct"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    jest.spyOn(document, 'getElementById').mockImplementation((id) => document.querySelector(`#${id}`));
}

describe('Battle Main View UI', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        setupBattleDOM();
        global.requestAnimationFrame = (cb) => { cb(); return 0; };
        state.party = [{
            id: 25,
            name: 'Pikachu',
            level: 10,
            currentHp: 35,
            maxHp: 35,
            types: ['Electric'],
            qualityName: 'Regular'
        }];
        globals.battleSystem = {
            isSearching: false,
            isSliding: false,
            slideDuration: 1000,
            activeEncounter: null,
            gymState: { isActive: false, inCombat: false },
            multiplayerState: { isActive: false }
        };
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    describe('getTargetSpriteHeight', () => {
        test('returns scaled height from spriteSizes config', () => {
            expect(getTargetSpriteHeight(25, state.config.spriteSizes)).toBe(56);
            expect(getTargetSpriteHeight('0006', state.config.spriteSizes)).toBe(78);
        });

        test('falls back to base ID for form variations like 201.1', () => {
            expect(getTargetSpriteHeight('201.1', state.config.spriteSizes)).toBe(39);
        });

        test('clamps minimum height and returns fallback when missing', () => {
            expect(getTargetSpriteHeight(48, { '0048': 48 })).toBe(29);
            expect(getTargetSpriteHeight(9999, state.config.spriteSizes)).toBe(52);
            expect(getTargetSpriteHeight(25, null)).toBe(52);
        });
    });

    describe('updateBattleArena sprite state, sizing, flying, and water effects', () => {
        test('sizes sprites from spriteSizes, applies flying elevation and water effect', () => {
            state.party[0] = {
                id: 9,
                name: 'Blastoise',
                level: 36,
                currentHp: 120,
                maxHp: 120,
                types: ['Water'],
                qualityName: 'Regular'
            };
            globals.battleSystem.activeEncounter = {
                id: 6,
                name: 'Charizard',
                level: 36,
                currentHp: 130,
                maxHp: 130,
                types: ['Fire', 'Flying'],
                qualityName: 'Regular',
                quality: 1.0,
                ivs: { hp: 10, atk: 10, def: 10, spa: 10, spd: 10, spe: 10 }
            };

            updateBattleArena();

            const playerSprite = document.getElementById('player-pokemon-sprite');
            const enemySprite = document.getElementById('enemy-pokemon-sprite');
            const playerMotion = document.querySelector('#player-sprite-wrapper .battle-sprite-motion');
            const enemyMotion = document.querySelector('#enemy-sprite-wrapper .battle-sprite-motion');
            const playerWater = document.getElementById('player-water-effect');
            const enemyWater = document.getElementById('enemy-water-effect');

            expect(playerSprite.style.height).toBe('83px');
            expect(enemySprite.style.height).toBe('78px');
            expect(playerSprite.classList.contains('is-player')).toBe(true);
            expect(enemySprite.classList.contains('is-player')).toBe(false);

            expect(playerWater.classList.contains('is-active')).toBe(true);
            expect(enemyWater.classList.contains('is-active')).toBe(false);

            expect(playerMotion.classList.contains('is-flying')).toBe(false);
            expect(enemyMotion.classList.contains('is-flying')).toBe(true);
        });

        test('mimics movement on player while searching and on both while enemy slides left', () => {
            globals.battleSystem.isSearching = true;
            updateBattleArena();

            const playerSprite = document.getElementById('player-pokemon-sprite');
            expect(playerSprite.classList.contains('sliding-idle-anim-flipped')).toBe(true);

            globals.battleSystem.isSearching = false;
            globals.battleSystem.isSliding = true;
            globals.battleSystem.activeEncounter = {
                id: 25,
                name: 'Pikachu',
                level: 5,
                currentHp: 20,
                maxHp: 20,
                types: ['Electric'],
                qualityName: 'Regular'
            };
            updateBattleArena();

            const enemySprite = document.getElementById('enemy-pokemon-sprite');
            const enemySide = document.getElementById('enemy-side');
            expect(playerSprite.classList.contains('sliding-idle-anim-flipped')).toBe(true);
            expect(enemySprite.classList.contains('sliding-idle-anim')).toBe(true);
            expect(enemySide.style.left).toBe('35%');
        });

        test('shows enemy healthbar, lvl, sumiv, and q immediately when sliding in even right after defeat', () => {
            triggerDefeatAnimation(
                { id: 25, name: 'Pikachu' },
                { used: false },
                () => {}
            );

            // Next wild Pokemon spawns immediately while sliding in
            globals.battleSystem.isSliding = true;
            globals.battleSystem.activeEncounter = {
                id: 6,
                name: 'Charizard',
                level: 36,
                currentHp: 130,
                maxHp: 130,
                types: ['Fire', 'Flying'],
                qualityName: 'Regular',
                quality: 1.25,
                ivs: { hp: 10, atk: 10, def: 10, spa: 10, spd: 10, spe: 10 }
            };

            updateBattleArena();

            const hpContainer = document.getElementById('enemy-battle-hp-container');
            const modals = document.getElementById('enemy-data-modals');
            expect(hpContainer.style.display).toBe('flex');
            expect(hpContainer.style.opacity).toBe('1');
            expect(modals.style.display).toBe('flex');
            expect(modals.style.opacity).toBe('1');
            expect(document.getElementById('enemy-battle-level').innerText).toBe('Lv. 36');
            expect(document.getElementById('enemy-battle-qtier').innerText).toBe('Q: 1.25');
            expect(document.getElementById('enemy-battle-sumiv').innerText).toBe('SumIV: 60');
        });
    });

    describe('playCombatAnimations projectile and splash', () => {
        test('spawns type-colored projectile and splash on impact without altering player-side transform', () => {
            globals.battleSystem.activeEncounter = {
                id: 6,
                name: 'Charizard',
                level: 36,
                currentHp: 130,
                maxHp: 130,
                types: ['Fire', 'Flying'],
                qualityName: 'Regular'
            };

            const playerSide = document.getElementById('player-side');
            const initialTransform = playerSide.style.transform;

            playCombatAnimations('enemy', 'Electric', 300);

            const container = document.getElementById('battle-sprites-container');
            // Projectile should exist immediately
            const proj = container.children[container.children.length - 1];
            expect(proj.style.background).toContain('#F8D030');

            // Advance to impact
            jest.advanceTimersByTime(300);

            // Projectile removed, splash host added with core, ring, and 8 droplets
            expect(proj.parentElement).toBeNull();
            const splashHost = container.children[container.children.length - 1];
            expect(splashHost.children.length).toBe(10); // core + ring + 8 droplets

            // Player side outer transform must remain untouched
            expect(playerSide.style.transform).toBe(initialTransform);
        });
    });

    describe('showDamage format', () => {
        test('keeps exact damage format and type color', () => {
            const info = getDamageInfo(42, true, 'Thunderbolt', 'Electric', 2);
            expect(info.typeColor).toBe('#F8D030');
            expect(info.critText).toBe(' Crit(1.5x)');
            expect(info.effText).toBe('2x');

            showDamage('enemy', 42, true, 'Thunderbolt', 'Electric', 2);
            const dmgNode = document.querySelector('#enemy-side .floating-damage');
            expect(dmgNode).not.toBeNull();
            expect(dmgNode.textContent).toContain('42');
            expect(dmgNode.textContent).toContain('Thunderbolt 2x Crit(1.5x)');
            expect(dmgNode.querySelector('img').getAttribute('src')).toBe('Assets/Extra/Types/Type Electric.png');
        });
    });

    describe('triggerDefeatAnimation', () => {
        test('slides left, shrinks/fades enemy sprite (not damage icon), shakes ball and resolves capture', () => {
            showDamage('enemy', 50, false, 'Surf', 'Water', 2);
            const callback = jest.fn();

            triggerDefeatAnimation(
                { id: 6, name: 'Charizard' },
                { used: true, ballName: 'Pokeball', caught: true },
                callback
            );

            const container = document.getElementById('battle-sprites-container');
            const defeatContainer = container.querySelector('.battle-actor-enemy:not(#enemy-side)');
            expect(defeatContainer).not.toBeNull();

            const clonedSprite = defeatContainer.querySelector('.battle-pokemon-sprite');
            expect(clonedSprite).not.toBeNull();
            expect(clonedSprite.style.opacity).toBe('0');
            expect(clonedSprite.style.transform).toBe('scale(0.25)');

            const ball = defeatContainer.querySelector('img[src*="Assets/Items/Balls/Pokeball.png"]');
            expect(ball).not.toBeNull();

            const pulledDmg = defeatContainer.querySelector('.battle-sprite-motion .floating-damage');
            expect(pulledDmg).not.toBeNull();
            jest.advanceTimersByTime(100);
            expect(pulledDmg.style.top).toBe('50%');
            expect(pulledDmg.style.left).toBe('50%');
            expect(pulledDmg.style.opacity).toBe('0');

            jest.advanceTimersByTime(2900);
            expect(callback).toHaveBeenCalledTimes(1);
            expect(ball.getAttribute('src')).toBe('Assets/Items/Balls/PokeballY.png');

            jest.advanceTimersByTime(2000);
            expect(defeatContainer.parentElement).toBeNull();
        });
    });
});
