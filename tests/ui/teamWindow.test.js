import { jest } from '@jest/globals';

jest.mock('../../src/state.js', () => ({
    state: {
        party: [],
        dayCareRef: null
    }
}));

jest.mock('../../src/mathEngine.js', () => ({
    calculateTotalXP: jest.fn((lvl) => (lvl - 1) * 100)
}));

import { state } from '../../src/state.js';
import { updateTeamWindow } from '../../src/ui/teamWindow.js';

function setupTeamDOM() {
    document.body.innerHTML = `
        <div id="party-window" style="display: flex;">
            <div id="party-header">
                <span id="party-count-pill">0/6</span>
            </div>
            <div id="party-list"></div>
            <div id="day-care" style="display: none;">
                <div id="dc-slot1"></div>
                <div id="dc-slot2"></div>
            </div>
        </div>
    `;
    jest.spyOn(document, 'getElementById').mockImplementation((id) => document.querySelector(`#${id}`));
    window.getSpriteUrl = jest.fn((id, isShiny) => `mock-sprite/${id}${isShiny ? '_shiny' : ''}.png`);
}

describe('Team Window UI', () => {
    beforeEach(() => {
        setupTeamDOM();
        state.party = [];
        state.dayCareRef = null;
    });

    test('renders empty state and 0/6 pill when party is empty', () => {
        updateTeamWindow();
        expect(document.getElementById('party-count-pill').textContent).toBe('0/6');
        expect(document.querySelector('#party-list .team-empty-state')).not.toBeNull();
    });

    test('renders leader badge, QTier accent class, type dots, fainted state, and max level bar', () => {
        state.party = [
            {
                id: 6,
                name: 'Charizard',
                level: 36,
                xp: 3550,
                currentHp: 100,
                maxHp: 100,
                qualityName: 'Shiny',
                types: ['Fire', 'Flying']
            },
            {
                id: 25,
                name: 'Pikachu',
                level: 100,
                xp: 9900,
                currentHp: 0,
                maxHp: 120,
                qualityName: 'Epic',
                types: ['Electric']
            }
        ];

        updateTeamWindow();

        expect(document.getElementById('party-count-pill').textContent).toBe('2/6');
        const cards = document.querySelectorAll('#party-list .party-slot');
        expect(cards.length).toBe(2);

        const leaderCard = cards[0];
        expect(leaderCard.classList.contains('is-leader')).toBe(true);
        expect(leaderCard.classList.contains('is-qtier-shiny')).toBe(true);
        expect(leaderCard.querySelector('.team-lead-badge').textContent).toBe('LEAD');
        expect(leaderCard.querySelectorAll('.team-type-dot').length).toBe(2);

        const faintedCard = cards[1];
        expect(faintedCard.classList.contains('is-fainted')).toBe(true);
        expect(faintedCard.classList.contains('is-qtier-epic')).toBe(true);
        expect(faintedCard.querySelector('.team-bar-label').textContent).toBe('FAINT');
        expect(faintedCard.querySelector('.is-max-label').textContent).toBe('MAX LV');
    });

    test('renders Day Care breed and train slots with ready state', () => {
        state.party = [
            { id: 1, name: 'Bulbasaur', level: 5, xp: 400, currentHp: 20, maxHp: 20, qualityName: 'Regular', types: ['Grass'] }
        ];
        state.dayCareRef = {
            slot1: {
                pokemon: {
                    id: 133,
                    name: 'Eevee',
                    level: 20,
                    xp: 1920,
                    quality: 1.5,
                    qualityName: 'Rare',
                    lastQBonus: 0.02,
                    uuid: 'eevee-1'
                },
                battles: 100,
                requiredBattles: 100,
                isFinished: true
            },
            slot2: {
                pokemon: {
                    id: 147,
                    name: 'Dratini',
                    level: 15,
                    xp: 1450,
                    qualityName: 'Uncommon',
                    ivs: { hp: 30, atk: 30, def: 30, spa: 30, spd: 30, spe: 30 },
                    trainingCyclesCompleted: 5,
                    uuid: 'dratini-1'
                },
                battles: 50,
                requiredBattles: 175
            }
        };

        updateTeamWindow();

        const dayCare = document.getElementById('day-care');
        expect(dayCare.style.display).toBe('flex');

        const breedCard = document.querySelector('#dc-slot1 .party-slot');
        expect(breedCard.classList.contains('is-daycare-breed')).toBe(true);
        expect(breedCard.classList.contains('is-ready')).toBe(true);
        expect(breedCard.querySelector('.team-ready-badge').textContent).toBe('READY');

        const trainCard = document.querySelector('#dc-slot2 .party-slot');
        expect(trainCard.classList.contains('is-daycare-train')).toBe(true);
        expect(trainCard.classList.contains('is-ready')).toBe(false);
    });
});
