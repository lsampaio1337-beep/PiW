import { promptExitGame } from '../ui.js';

function setupSystemEventListeners() {
    const minimizeAllBtn = document.getElementById('btn-minimize-all-game');
    if (minimizeAllBtn) {
        minimizeAllBtn.addEventListener('click', () => {
            if (window.electronAPI) {
                window.electronAPI.send('minimize-game');
            }
        });
    }

    const exitButtons = document.querySelectorAll('.btn-exit-game');
    exitButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            promptExitGame();
        });
    });

    const newProfileBtn = document.getElementById('btn-new-profile');
    if (newProfileBtn) {
        newProfileBtn.addEventListener('click', () => {
            if (window.startNewGame) window.startNewGame();
        });
    }
}

function setupWindowToggles() {
    const closePartyBtn = document.getElementById('btn-close-party-window');
    if (closePartyBtn) {
        closePartyBtn.addEventListener('click', () => {
            if (window.windowManager) window.windowManager.toggleWindow('party-window', false);
        });
    }

    const closeMainBtn = document.getElementById('btn-close-main-view-window');
    if (closeMainBtn) {
        closeMainBtn.addEventListener('click', () => {
            if (window.windowManager) window.windowManager.toggleWindow('main-view-window', false);
        });
    }

    const closeInnerBtn = document.getElementById('btn-close-inner-modal');
    if (closeInnerBtn) {
        closeInnerBtn.addEventListener('click', () => {
            const overlay = document.getElementById('main-view-inner-modal-overlay');
            if (overlay) overlay.style.display = 'none';
            const moneyDisplay = document.getElementById('inner-modal-money-display');
            if (moneyDisplay) moneyDisplay.style.display = 'none';
        });
    }

    const modalOverlay = document.getElementById('modal-overlay');
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (event) => {
            if (event.target === modalOverlay && window.closeModal) {
                window.closeModal();
            }
        });
    }
}

function setupSafariZoneListeners() {
    const safariBtn = document.getElementById('btn-enter-safari');
    if (safariBtn) {
        safariBtn.addEventListener('click', () => {
            if (window.enterSafariZone) window.enterSafariZone();
        });
    }
}

function setupTutorialListeners() {
    const profTutorialSkipBtn = document.getElementById('btn-prof-tutorial-skip');
    if (profTutorialSkipBtn) {
        profTutorialSkipBtn.addEventListener('click', () => {
            if (window.skipProfTutorial) window.skipProfTutorial();
        });
    }
    const profTutorialProceedBtn = document.getElementById('btn-prof-tutorial-proceed');
    if (profTutorialProceedBtn) {
        profTutorialProceedBtn.addEventListener('click', () => {
            if (window.proceedProfTutorial) window.proceedProfTutorial();
        });
    }
    const profTutorialConcludeBtn = document.getElementById('btn-prof-tutorial-conclude');
    if (profTutorialConcludeBtn) {
        profTutorialConcludeBtn.addEventListener('click', () => {
            if (window.concludeProfTutorial) window.concludeProfTutorial();
        });
    }
}

function setupDaycareListeners() {
    const dismissDaycareBtn = document.getElementById('btn-dismiss-daycare');
    if (dismissDaycareBtn) {
        dismissDaycareBtn.addEventListener('click', () => {
            if (window.dismissDaycareMessage) window.dismissDaycareMessage();
        });
    }

    const daycareTrainBtn = document.getElementById('btn-daycare-train');
    if (daycareTrainBtn) {
        daycareTrainBtn.addEventListener('click', () => {
            if (window.showBackpackAndFocus) window.showBackpackAndFocus('pokemon');
        });
    }

    const daycareBreedBtn = document.getElementById('btn-daycare-breed');
    if (daycareBreedBtn) {
        daycareBreedBtn.addEventListener('click', () => {
            if (window.showBackpackAndFocus) window.showBackpackAndFocus('pokemon');
        });
    }
}

export function setupGlobalEventListeners() {
    setupSystemEventListeners();
    setupWindowToggles();
    setupSafariZoneListeners();
    setupTutorialListeners();
    setupDaycareListeners();
}
