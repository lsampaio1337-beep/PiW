export function setupWindowToggles() {
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
            const innerModal = document.getElementById('main-view-inner-modal');
            if (innerModal && innerModal.classList) innerModal.classList.remove('prof-lab-inner-modal');
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

    window.addEventListener('keydown', (event) => {
        if ((event.ctrlKey || event.metaKey) && !event.altKey && !event.shiftKey && event.key.toLowerCase() === 'w') {
            event.preventDefault();

            const wm = window.windowManager;
            const topmost = wm ? wm.getTopmostVisibleWindow() : null;

            if (!topmost || topmost.id === 'main-control-window' || topmost.id === 'save-manager-modal') {
                if (typeof window.promptExitGame === 'function') {
                    window.promptExitGame();
                }
                return;
            }

            if (topmost.id === 'modal-content-box') {
                if (typeof window.closeModal === 'function') {
                    window.closeModal();
                }
                return;
            }

            if (topmost.id === 'main-view-window') {
                const innerOverlay = document.getElementById('main-view-inner-modal-overlay');
                if (innerOverlay && innerOverlay.style.display !== 'none' && window.getComputedStyle(innerOverlay).display !== 'none') {
                    const closeInnerBtn = document.getElementById('btn-close-inner-modal');
                    if (closeInnerBtn) {
                        closeInnerBtn.click();
                        return;
                    }
                }
            }

            wm.closeDynamicWindow(topmost.id);
        }
    });
}
