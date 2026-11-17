import { promptExitGame } from '../../ui.js';

export function setupSystemEventListeners() {
    const minimizeMainControlBtn = document.getElementById('btn-minimize-all-game');
    if (minimizeMainControlBtn) {
        let lastMouseDownTime = 0;
        window.addEventListener('mousedown', () => {
            lastMouseDownTime = Date.now();
        }, true);

        const restoreMainControl = () => {
            const mainControlWin = document.getElementById('main-control-window');
            if (!mainControlWin) return;
            mainControlWin.style.display = 'flex';
            delete mainControlWin.dataset.minimized;
            if (window.windowManager) {
                window.windowManager.focusWindow(mainControlWin);
            }
            if (window.electronAPI) {
                window.electronAPI.send('set-main-control-minimized', false);
            }
        };

        minimizeMainControlBtn.addEventListener('click', () => {
            const mainControlWin = document.getElementById('main-control-window');
            if (!mainControlWin) return;

            mainControlWin.style.display = 'none';
            mainControlWin.dataset.minimized = 'true';
            if (window.electronAPI) {
                window.electronAPI.send('set-main-control-minimized', true);
            }
        });

        if (window.electronAPI && typeof window.electronAPI.on === 'function') {
            window.electronAPI.on('restore-main-control', (payload = {}) => {
                const mainControlWin = document.getElementById('main-control-window');
                if (!mainControlWin || mainControlWin.dataset.minimized !== 'true') return;

                if (payload.fromMinimize) {
                    restoreMainControl();
                    return;
                }

                // When regaining focus from outside the app, wait briefly so a direct click
                // on another visible game window doesn't unexpectedly pop Main Control back up.
                const focusTime = Date.now();
                setTimeout(() => {
                    if (lastMouseDownTime >= focusTime - 50) return;
                    if (mainControlWin.dataset.minimized === 'true') {
                        restoreMainControl();
                    }
                }, 120);
            });
        }
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
