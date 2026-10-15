
import { promptExitGame } from '../ui.js';

export function setupGlobalEventListeners() {
    // Top Bar & Save Manager Exits

    const minimizeAllBtn = document.getElementById('btn-minimize-all-game');
    if (minimizeAllBtn) {
        minimizeAllBtn.addEventListener('click', () => {
            if (window.electronAPI) {
                window.electronAPI.send('minimize-game');
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

            const header = document.getElementById('main-control-header');

            const buttonContainer = header ? header.querySelector('div') : null;
            const titleSpan = header ? header.querySelector('#main-control-title') : null;

            if (isMinimized) {
                // Restore
                // Instead of clearing display, properly restore it to the original layout block type
                // We can fetch from a saved dataset or fallback to flex.
                contentContainer.style.display = contentContainer.dataset.originalDisplay || 'flex';
                topBarWindow.style.width = topBarWindow.dataset.originalWidth || 'auto';
                topBarWindow.style.minWidth = '0'; // Restore min-width
                topBarWindow.style.minHeight = '';
                if (topBarWindow.dataset.originalHeight) topBarWindow.style.height = topBarWindow.dataset.originalHeight;
                if (header) {
                    header.style.textAlign = ''; // Restore to default center
                    header.style.display = 'block'; // Restore default block display
                    header.style.justifyContent = '';
                    header.style.alignItems = '';
                }
                if (buttonContainer) {
                    buttonContainer.style.position = 'absolute';
                    buttonContainer.style.right = '5px';
                    buttonContainer.style.top = '5px';
                }
                if (titleSpan) {
                    titleSpan.style.whiteSpace = 'normal';
                    titleSpan.style.marginRight = '0';
                }
                if (window.windowManager) {
                    window.windowManager._constrainAllWindows();
                }

                // When restoring, we must make sure the explicit hardcoded inline width hasn't broken internal scaling trackers
                // Without resetting them, subsequent resizes will compound the math errors and make the window jump back to previous states or grow indefinitely.
                if (typeof topBarWindow.resetResizeDims === 'function') {
                    topBarWindow.resetResizeDims();
                    if (window.windowManager) window.windowManager.autoAdjustWidth('main-control-window');
                }
            } else {
                // Minimize
                topBarWindow.dataset.originalWidth = topBarWindow.style.width;
                topBarWindow.dataset.originalHeight = topBarWindow.style.height;
                contentContainer.dataset.originalDisplay = contentContainer.style.display;
                contentContainer.style.display = 'none';
                topBarWindow.style.width = 'max-content'; // Auto adjust to content
                topBarWindow.style.minWidth = 'max-content'; // Enforce minimum width
                topBarWindow.style.minHeight = '0';
                topBarWindow.style.height = 'auto'; // Only display title

                if (header) {
                    header.style.textAlign = 'left'; // Left align title
                    header.style.display = 'flex';
                    header.style.justifyContent = 'space-between';
                    header.style.alignItems = 'center';
                }
                if (buttonContainer) {
                    buttonContainer.style.position = 'static';
                }
                if (titleSpan) {
                    titleSpan.style.whiteSpace = 'nowrap';
                    titleSpan.style.marginRight = '10px';
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
