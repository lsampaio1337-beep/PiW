import { promptExitGame } from '../ui.js';

export function setupSystemEventListeners() {
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
