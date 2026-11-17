import { promptExitGame } from '../../ui.js';

export function setupSystemEventListeners() {
    const minimizeMainControlBtn = document.getElementById('btn-minimize-all-game');
    if (minimizeMainControlBtn) {
        minimizeMainControlBtn.addEventListener('click', () => {
            const mainControlWin = document.getElementById('main-control-window');
            if (!mainControlWin) return;

            const contentContainer = mainControlWin.querySelector('.window-content-container');
            const resizeHandle = mainControlWin.querySelector('.window-resize-handle');
            const isMinimized = mainControlWin.dataset.minimized === 'true';

            if (isMinimized) {
                if (contentContainer) contentContainer.style.display = 'flex';
                if (resizeHandle) resizeHandle.style.display = '';
                mainControlWin.style.height = mainControlWin.dataset.preMinimizeHeight || 'auto';
                mainControlWin.style.width = mainControlWin.dataset.preMinimizeWidth || 'auto';
                mainControlWin.style.minWidth = mainControlWin.dataset.preMinimizeMinWidth || '0';
                delete mainControlWin.dataset.minimized;
                minimizeMainControlBtn.textContent = '-';
                minimizeMainControlBtn.title = 'Minimize Main Control';
            } else {
                mainControlWin.dataset.preMinimizeHeight = mainControlWin.style.height || '';
                mainControlWin.dataset.preMinimizeWidth = mainControlWin.style.width || '';
                mainControlWin.dataset.preMinimizeMinWidth = mainControlWin.style.minWidth || '';
                if (contentContainer) contentContainer.style.display = 'none';
                if (resizeHandle) resizeHandle.style.display = 'none';
                mainControlWin.style.height = 'auto';
                mainControlWin.style.width = 'auto';
                mainControlWin.style.minWidth = '180px';
                mainControlWin.dataset.minimized = 'true';
                minimizeMainControlBtn.textContent = '+';
                minimizeMainControlBtn.title = 'Restore Main Control';
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
