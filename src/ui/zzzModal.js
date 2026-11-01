
import { state, globals } from '../state.js';
import { showModal } from '../ui.js';

export function showZzZConfirmationModal() {
            const grains = state.stats.jigglypuffGrains || 0;
            const showTutorial = !state.globalStats.hasSeenZzZTutorial;
            const htmlContent = `
                <div class="content-panel" style="display: flex; flex-direction: column; gap: 15px; width: 100%; box-sizing: border-box; position: relative;">
                    ${showTutorial ? `
                    <div id="zzz-tutorial-overlay-inner" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 1000; background: rgba(0, 0, 0, 0.7); display: flex; flex-direction: column; align-items: center; justify-content: center; border-radius: 8px;">
                        <div style="background: #34495e; padding: 20px; border-radius: 10px; border: 2px solid #00ffff; text-align: center; color: white; max-width: 80%;">
                            <div style="margin-top: 0; font-size: 16px;">
                                <p>Welcome to ZzZ Mode!</p>
                                <p>You will earn 1 grain of Jigglypuff Dust for every minute you play.</p>
                                <p>Each grain will grant 1 minute of offline farming.</p>
                                <p>Sleep well!</p>
                            </div>
                            <button id="btn-dismiss-zzz-inner" style="padding: 10px 20px; background: #2ecc71; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; margin-top: 10px; font-size: 16px;">Ok.</button>
                        </div>
                    </div>
                    ` : ''}
                    <div style="display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.2); border-radius: 8px; padding: 20px; border: 1px solid #334155; gap: 20px;">
                        <div style="flex: 1; display: flex; justify-content: flex-end;">
                            <img src="Assets/Extra/Jigglypuff Dust.png" style="width: 120px; height: auto; filter: drop-shadow(0 0 10px rgba(255, 192, 203, 0.4));">
                        </div>
                        <div style="flex: 1; display: flex; flex-direction: column; align-items: center; text-align: center;">
                            <div style="font-size: 14px; color: #94a3b8; text-transform: uppercase; letter-spacing: 2px;">Available Grains</div>
                            <div id="zzz-current-grains" style="font-size: 36px; font-weight: bold; color: #fbcfe8; text-shadow: 0 2px 4px rgba(0,0,0,0.8); margin: 5px 0;">${grains}</div>
                            <div id="zzz-max-offline-time" style="font-size: 12px; color: #cbd5e1;">(1 grain = 1min offline farm)</div>
                        </div>
                    </div>

                    <div style="display: flex; gap: 10px; justify-content: center; margin-top: 10px; padding-bottom: 5px;">
                        <button id="btn-zzz-yes" style="padding: 12px; font-size: 16px; font-weight: bold; cursor: pointer; background: linear-gradient(to right, #3b82f6, #2563eb); color: white; border: 1px solid #60a5fa; border-radius: 8px; flex: 1; box-shadow: 0 4px 6px rgba(0,0,0,0.3); text-transform: uppercase; letter-spacing: 1px;">Go to Sleep</button>
                        <button id="btn-zzz-no" style="padding: 12px; font-size: 16px; font-weight: bold; cursor: pointer; background: linear-gradient(to right, #ef4444, #dc2626); color: white; border: 1px solid #f87171; border-radius: 8px; flex: 1; box-shadow: 0 4px 6px rgba(0,0,0,0.3); text-transform: uppercase; letter-spacing: 1px;">Cancel</button>
                    </div>
                </div>
            `;

            showModal("ZzZ Mode", htmlContent, "window-zzz-confirmation", "460px");
            const winZzz = document.getElementById('window-zzz-confirmation');
            if (winZzz) {
                winZzz._sizeInitialized = false;
            }
            if (window.windowManager) window.windowManager.recalculateWindowSize('window-zzz-confirmation');

            if (showTutorial) {
                const dismissBtn = document.getElementById('btn-dismiss-zzz-inner');
                if (dismissBtn) {
                    dismissBtn.onclick = () => {
                        state.globalStats.hasSeenZzZTutorial = true;
                        window.storageRef.save(state);
                        const overlay = document.getElementById('zzz-tutorial-overlay-inner');
                        if (overlay) overlay.style.display = 'none';
                    };
                }
            }

            document.getElementById('btn-zzz-no').onclick = () => {
                if(window.windowManager) window.windowManager.closeDynamicWindow('window-zzz-confirmation');
            };

            document.getElementById('btn-zzz-yes').onclick = () => {
                state.isZzZMode = true;
                state.zzzTimestamp = Date.now();
                state.settings.isSleepModeActive = true;
                state.stats.lastSaveTime = Date.now();
                window.storageRef.save(state);

                if (window.windowManager) {
                    const winsToClose = [...window.windowManager.windows];
                    winsToClose.forEach(win => {
                        if (win.id !== 'main-control-window' && win.id !== 'window-zzz-confirmation') {
                            window.windowManager.closeDynamicWindow(win.id);
                        }
                    });
                    window.windowManager.closeDynamicWindow('window-zzz-confirmation');
                }

                if (globals.battleSystem) globals.battleSystem.stop();

                window.updateZzZModeUI();
            };
};
