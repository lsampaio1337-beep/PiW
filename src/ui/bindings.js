
import { state, globals } from '../state.js';
import { showMap } from './map.js';
import { showBackpack, renderBackpackTab } from './backpack/index.js';
import { showPokedex } from './pokedex.js';
import { showBonusCandyModal } from './bonusCandy.js';
import { showCalendar } from './calendar.js';
import { showGiftModal } from './gift.js';
import { showSettings } from './settings.js';
import { showHelp } from './help.js';
import { updateMainControl } from './mainControl.js';
import { checkCombatLock, showChallengesModal } from '../ui.js';

export function setupUIBindings() {
    const bindBtn = (id, fn) => {
        const el = document.getElementById(id);
        if (el) el.onclick = fn;
    };


    bindBtn('btn-toggle-party', () => { window.windowManager.toggleWindow('party-window'); });
    bindBtn('btn-toggle-main', () => { window.windowManager.toggleWindow('main-view-window'); });
    bindBtn('btn-map', () => {
        if(!checkCombatLock()) {
            showMap();
            if (!state.isZzZMode) {
                window.windowManager.toggleWindow('main-view-window', true);
            }
        }
    });
    bindBtn('btn-backpack', () => {
        if(!checkCombatLock()) {
            showBackpack();

        }
    });
    bindBtn('btn-dex', () => {
        if(!checkCombatLock()) {
            showPokedex();

        }
    });
    bindBtn('btn-bonus-candy', () => {
        if(!checkCombatLock()) {
            state.stats.hasSeenBonusCandyIcon = true;
            window.storageRef.save(state);
            updateMainControl();
            showBonusCandyModal();

        }
    });
    bindBtn('btn-challenges', () => {
        if(!checkCombatLock()) {
            window.showChallengesModal();

        }
    });
    bindBtn('btn-calendar', () => {
        if(!checkCombatLock()) {
            showCalendar();
            if (state.stats.dailyChallenges) {
                state.stats.dailyChallenges.hasSeenNotification = true;
                updateMainControl();
            }
        }
    });
    bindBtn('btn-gift', () => {
        if(!checkCombatLock()) {
            state.globalStats.hasSeenGiftIcon = true;
            window.storageRef.save(state);
            updateMainControl();
            showGiftModal();

        }
    });


        bindBtn('btn-sleep', () => {
        if(!checkCombatLock()) {
            if (state.isZzZMode) {
                window.showWakeUpModal();
            } else {
                state.stats.hasSeenZzZIcon = true;
                window.storageRef.save(state);
                updateMainControl();
                window.showZzZConfirmationModal();
            }
        }
    });

    window.showBackpackAndFocus = (tab) => {
        if(!checkCombatLock()) {
            showBackpack();
            renderBackpackTab(tab);
        }
    };

    window.updateMainControl = updateMainControl;


    bindBtn('btn-stats', () => {
        window.showTrainerStats();
    });

    bindBtn('btn-settings', () => {
        if(!checkCombatLock()) showSettings();
    });

    bindBtn('btn-help', () => {
        if(!checkCombatLock()) showHelp();
    });

    bindBtn('btn-exit', () => {
        window.promptExitGame();
    });
}
