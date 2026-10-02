
import { promptExitGame } from '../ui.js';

export function setupGlobalEventListeners() {
    // Top Bar & Save Manager Exits

    const minimizeAllBtn = document.getElementById('btn-minimize-all-game');
    if (minimizeAllBtn) {
        minimizeAllBtn.addEventListener('click', () => {
            if (window.require) {
                const { ipcRenderer } = window.require('electron');
                ipcRenderer.send('minimize-game');
            }
        });
    }

    const minimizeMainBtn = document.getElementById('btn-minimize-main-control');
    if (minimizeMainBtn) {
        minimizeMainBtn.addEventListener('click', () => {
            const topBarWindow = document.getElementById('main-control-window');
            const contentContainer = topBarWindow.querySelector('.window-content-container');
            if (!contentContainer || !topBarWindow) return;

            const isMinimized = contentContainer.style.display === 'none';

            if (isMinimized) {
                // Restore
                contentContainer.style.display = '';
                topBarWindow.style.width = topBarWindow.dataset.originalWidth || 'auto';
                topBarWindow.style.minHeight = '';
                if (topBarWindow.dataset.originalHeight) topBarWindow.style.height = topBarWindow.dataset.originalHeight;
                if (window.windowManager) window.windowManager._constrainAllWindows();
            } else {
                // Minimize
                topBarWindow.dataset.originalWidth = topBarWindow.style.width;
                topBarWindow.dataset.originalHeight = topBarWindow.style.height;
                contentContainer.style.display = 'none';
                topBarWindow.style.width = '300px'; // Minimal width for title + buttons
                topBarWindow.style.minHeight = '0';
                topBarWindow.style.height = 'auto'; // Only display title
            }
        });
    }

    const exitButtons = document.querySelectorAll('.btn-exit-game');
    exitButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            promptExitGame();
        });
    });

    // New Game Profile
    const newProfileBtn = document.getElementById('btn-new-profile');
    if (newProfileBtn) {
        newProfileBtn.addEventListener('click', () => {
            if (window.startNewGame) window.startNewGame();
        });
    }

    // Window Toggles
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

    // Safari Zone
    const safariBtn = document.getElementById('btn-enter-safari');
    if (safariBtn) {
        safariBtn.addEventListener('click', () => {
            if (window.enterSafariZone) window.enterSafariZone();
        });
    }

    // Oak Tutorial
    const oakTutorialSkipBtn = document.getElementById('btn-oak-tutorial-skip');
    if (oakTutorialSkipBtn) {
        oakTutorialSkipBtn.addEventListener('click', () => {
            if (window.skipOakTutorial) window.skipOakTutorial();
        });
    }
    const oakTutorialProceedBtn = document.getElementById('btn-oak-tutorial-proceed');
    if (oakTutorialProceedBtn) {
        oakTutorialProceedBtn.addEventListener('click', () => {
            if (window.proceedOakTutorial) window.proceedOakTutorial();
        });
    }
    const oakTutorialConcludeBtn = document.getElementById('btn-oak-tutorial-conclude');
    if (oakTutorialConcludeBtn) {
        oakTutorialConcludeBtn.addEventListener('click', () => {
            if (window.concludeOakTutorial) window.concludeOakTutorial();
        });
    }

    // Daycare
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

    // Modal overlay
    const modalOverlay = document.getElementById('modal-overlay');
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (event) => {
            if (event.target === modalOverlay && window.closeModal) {
                window.closeModal();
            }
        });
    }
}
