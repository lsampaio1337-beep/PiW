
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
            const topBarWindow = document.getElementById('top-bar-window');
            const contentContainer = topBarWindow.querySelector('.window-content-container');
            if (!contentContainer || !topBarWindow) return;

            const isMinimized = contentContainer.style.display === 'none';

            const headerElement = document.getElementById('top-bar-header');
            const titleElement = document.getElementById('top-bar-title');
            const buttonsElement = document.getElementById('top-bar-buttons');

            if (isMinimized) {
                // Restore
                contentContainer.style.display = '';
                topBarWindow.style.width = topBarWindow.dataset.originalWidth || '1100px';
                topBarWindow.style.minHeight = '';
                if (topBarWindow.dataset.originalHeight) topBarWindow.style.height = topBarWindow.dataset.originalHeight;

                // Restore centered layout
                if (titleElement) {
                    titleElement.style.flexGrow = '1';
                    titleElement.style.textAlign = 'center';
                    titleElement.style.paddingRight = '0';
                }
                if (buttonsElement) {
                    buttonsElement.style.position = 'absolute';
                    buttonsElement.style.right = '10px';
                }
                if (headerElement) {
                    headerElement.style.gap = '0';
                }

                if (window.windowManager) window.windowManager._constrainAllWindows();
            } else {
                // Minimize
                topBarWindow.dataset.originalWidth = topBarWindow.style.width;
                topBarWindow.dataset.originalHeight = topBarWindow.style.height;
                contentContainer.style.display = 'none';
                topBarWindow.style.width = 'fit-content'; // Minimal width for title + buttons
                topBarWindow.style.minHeight = '0';
                topBarWindow.style.height = 'auto'; // Only display title

                // Set left-aligned layout for fit-content
                if (titleElement) {
                    titleElement.style.flexGrow = '0';
                    titleElement.style.textAlign = 'left';
                    titleElement.style.paddingRight = '10px';
                }
                if (buttonsElement) {
                    buttonsElement.style.position = 'static';
                }
                if (headerElement) {
                    headerElement.style.gap = '10px';
                }
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
