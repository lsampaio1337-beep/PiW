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

    const closeTopmostWindow = (promptExitOnRoot = true) => {
        const wm = window.windowManager;
        const topmost = wm ? wm.getTopmostVisibleWindow() : null;

        if (!topmost || topmost.id === 'main-control-window' || topmost.id === 'save-manager-modal') {
            if (promptExitOnRoot && typeof window.promptExitGame === 'function') {
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
                const closeInner = document.getElementById('btn-close-inner-modal');
                if (closeInner) {
                    closeInner.click();
                    return;
                }
            }
        }

        if (wm) wm.closeDynamicWindow(topmost.id);
    };

    window.addEventListener('keydown', (event) => {
        const key = (event.key || '').toLowerCase();

        if ((event.ctrlKey || event.metaKey) && !event.altKey && !event.shiftKey && key === 'w') {
            event.preventDefault();
            closeTopmostWindow(true);
            return;
        }

        // Ignore shortcuts while typing in inputs, textareas, selects, or editable fields
        const activeTag = document.activeElement && document.activeElement.tagName ? document.activeElement.tagName.toUpperCase() : '';
        if (activeTag === 'INPUT' || activeTag === 'TEXTAREA' || activeTag === 'SELECT' || document.activeElement?.isContentEditable) {
            return;
        }
        if (event.ctrlKey || event.metaKey || event.altKey) return;

        if (key === 'escape') {
            event.preventDefault();
            closeTopmostWindow(false);
            return;
        }

        // Only trigger navigation hotkeys when Main Control is visible (profile loaded)
        const mainCtrl = document.getElementById('main-control-window');
        if (!mainCtrl || mainCtrl.style.display === 'none') return;

        const shortcutMap = {
            m: 'btn-map',
            b: 'btn-backpack',
            p: 'btn-dex',
            c: 'btn-calendar',
            t: 'btn-toggle-party',
            h: 'btn-help'
        };
        const targetId = shortcutMap[key];
        if (targetId) {
            const btn = document.getElementById(targetId);
            if (btn && typeof btn.click === 'function' && btn.style.pointerEvents !== 'none') {
                btn.click();
            }
        }
    });
}
