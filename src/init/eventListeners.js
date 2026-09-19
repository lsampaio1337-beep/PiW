
import { promptExitGame } from '../ui.js';

export function setupGlobalEventListeners() {
    // Top Bar & Save Manager Exits
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
        });
    }

    // Safari Zone
    const safariBtn = document.getElementById('btn-enter-safari');
    if (safariBtn) {
        safariBtn.addEventListener('click', () => {
            if (window.enterSafariZone) window.enterSafariZone();
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
