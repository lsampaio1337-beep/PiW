import { jest } from '@jest/globals';

jest.mock('../../src/state.js', () => ({
    state: {
        currentRegionName: 'Johto',
        currentRoute: 'Route 29 (Johto)',
        party: [{ id: 152 }],
        storage: [],
        stats: {
            battleModeTimer: 65,
            activeChallenges: [],
            hasPickedStarter: true
        },
        globalStats: {
            playtime: 3661
        },
        config: {}
    },
    globals: {
        battleSystem: null
    },
    checkFinalChallengeCompleted: jest.fn(() => false)
}));

jest.mock('../../src/ui/calendar.js', () => ({
    checkDailyRewardAvailable: jest.fn(() => false),
    checkAnyDailyChallengeCompleted: jest.fn(() => false)
}));

import { state } from '../../src/state.js';
import { updateMainControl } from '../../src/ui/mainControl.js';

function setupMainControlDOM() {
    document.body.innerHTML = `
        <div id="main-control-window" style="display: flex;">
            <div id="main-control-header">
                <span id="main-control-title">Main Control</span>
                <span id="main-control-region-badge">Kanto</span>
            </div>
            <div id="main-control">
                <img id="btn-toggle-main" class="nav-icon" />
                <img id="btn-toggle-party" class="nav-icon" />
            </div>
        </div>
        <div id="party-window" style="display: flex;"></div>
        <div id="main-view-window" style="display: none;">
            <div id="main-view-header">
                <span id="main-view-timer-route"></span>
                <span id="main-view-route-badge" style="display: none;"></span>
                <span id="main-view-timer-total"></span>
            </div>
        </div>
    `;
    jest.spyOn(document, 'getElementById').mockImplementation((id) => document.querySelector(`#${id}`));
}

describe('Main Control UI', () => {
    beforeEach(() => {
        setupMainControlDOM();
        window.windowManager = {
            autoAdjustWidth: jest.fn()
        };
    });

    test('updates region badge, route badge, timers, and active window toggle states', () => {
        state.currentRegionName = 'Hoenn';
        state.currentRoute = 'Route 101 (Hoenn)';

        updateMainControl();

        expect(document.getElementById('main-control-title').textContent).toBe('Main Control');
        expect(document.getElementById('main-control-region-badge').textContent).toBe('Hoenn');
        expect(document.getElementById('main-view-route-badge').textContent).toBe('Route 101');
        expect(document.getElementById('main-view-route-badge').style.display).toBe('inline-flex');
        expect(document.getElementById('main-view-timer-route').innerText).toBe('00:01:05 (route)');
        expect(document.getElementById('main-view-timer-total').innerText).toBe('(total) 01:01:01');

        expect(document.getElementById('btn-toggle-party').classList.contains('is-window-active')).toBe(true);
        expect(document.getElementById('btn-toggle-main').classList.contains('is-window-active')).toBe(false);
    });
});
