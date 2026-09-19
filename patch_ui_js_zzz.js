const fs = require('fs');
let code = fs.readFileSync('src/ui.js', 'utf8');

// 1. Replace the ZzZ Mode Confirmation Logic (around line 1465)
const confirmationStart = code.indexOf(`bindBtn('btn-sleep', () => {`);
const confirmationEnd = code.indexOf(`    window.showBackpackAndFocus = (tab) => {`);
if (confirmationStart !== -1 && confirmationEnd !== -1) {
    const replacement = `    bindBtn('btn-sleep', () => {
        if(!checkCombatLock()) {
            state.stats.hasSeenZzZIcon = true;
            storage.save(state);
            updateTopbar();

            const grains = state.stats.jigglypuffGrains || 0;
            const tutorialDisplay = (!state.stats.hasSeenZzZTutorial) ? 'block' : 'none';
            if (!state.stats.hasSeenZzZTutorial) {
                state.stats.hasSeenZzZTutorial = true;
                storage.save(state);
            }

            const htmlContent = \`
                <div style="display: flex; flex-direction: column; gap: 15px; width: 440px; padding: 10px;">
                    <div id="zzz-tutorial-section" style="display: \${tutorialDisplay}; background: rgba(255,255,255,0.05); border: 1px dashed #475569; border-radius: 8px; padding: 15px; margin-bottom: 10px; text-align: left;">
                        <div style="color: #cbd5e1; font-size: 14px; margin-bottom: 8px;"><b>Welcome to ZzZ Mode!</b></div>
                        <div style="color: #94a3b8; font-size: 13px; line-height: 1.4;">Earn <b>Jigglypuff Dust</b> simply by playing the game (1 minute active = 1 grain). You can spend these grains to allow your Pokémon to farm offline when you close the game (1 grain = 1 minute of offline farming).</div>
                    </div>

                    <div style="display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.2); border-radius: 8px; padding: 20px; border: 1px solid #334155; gap: 20px;">
                        <div style="flex: 1; display: flex; justify-content: flex-end;">
                            <img src="Assets/Extra/Jigglypuff Dust.png" style="width: 120px; height: auto; filter: drop-shadow(0 0 10px rgba(255, 192, 203, 0.4));">
                        </div>
                        <div style="flex: 1; display: flex; flex-direction: column; align-items: center; text-align: center;">
                            <div style="font-size: 14px; color: #94a3b8; text-transform: uppercase; letter-spacing: 2px;">Available Grains</div>
                            <div id="zzz-current-grains" style="font-size: 36px; font-weight: bold; color: #fbcfe8; text-shadow: 0 2px 4px rgba(0,0,0,0.8); margin: 5px 0;">\${grains}</div>
                            <div id="zzz-max-offline-time" style="font-size: 12px; color: #cbd5e1;">(1 grain = 1min offline farm)</div>
                        </div>
                    </div>

                    <div style="display: flex; gap: 10px; justify-content: center; margin-top: 10px;">
                        <button id="btn-zzz-yes" style="padding: 12px; font-size: 16px; font-weight: bold; cursor: pointer; background: linear-gradient(to right, #3b82f6, #2563eb); color: white; border: 1px solid #60a5fa; border-radius: 8px; flex: 1; box-shadow: 0 4px 6px rgba(0,0,0,0.3); text-transform: uppercase; letter-spacing: 1px;">Go to Sleep</button>
                        <button id="btn-zzz-no" style="padding: 12px; font-size: 16px; font-weight: bold; cursor: pointer; background: linear-gradient(to right, #ef4444, #dc2626); color: white; border: 1px solid #f87171; border-radius: 8px; flex: 1; box-shadow: 0 4px 6px rgba(0,0,0,0.3); text-transform: uppercase; letter-spacing: 1px;">Cancel</button>
                    </div>

                    <button id="btn-zzz-cheat-grains" style="margin-top: 15px; padding: 5px 10px; font-size: 11px; cursor: pointer; background: transparent; color: #94a3b8; border: 1px dashed #475569; border-radius: 4px;">Add +10 grains</button>
                </div>
            \`;

            showModal("ZzZ Mode", htmlContent, "window-zzz-confirmation");

            document.getElementById('btn-zzz-no').onclick = () => {
                if(window.windowManager) window.windowManager.closeDynamicWindow('window-zzz-confirmation');
            };

            document.getElementById('btn-zzz-yes').onclick = () => {
                state.isZzZMode = true;
                state.zzzTimestamp = Date.now();
                state.settings.isSleepModeActive = true;
                state.stats.lastSaveTime = Date.now();
                storage.save(state);
                window.close();
            };

            document.getElementById('btn-zzz-cheat-grains').onclick = () => {
                state.stats.jigglypuffGrains = (state.stats.jigglypuffGrains || 0) + 10;
                storage.save(state);
                document.getElementById('zzz-current-grains').innerText = state.stats.jigglypuffGrains;
            };
        }
    });

`;
    code = code.substring(0, confirmationStart) + replacement + code.substring(confirmationEnd);
}

// 2. Replace Resume Logic (around line 1140)
const resumeHtmlStr = 'const resumeHtml = `\\n' +
    '    <div style="display: flex; flex-direction: column; gap: 15px; width: 360px; padding: 20px; text-align: center;">\\n' +
    '        <p style="color: white; margin: 0;">Do you want to collect the farm while Sleeping?</p>\\n' +
    '        <div style="display: flex; gap: 10px; justify-content: center; margin-top: 10px;">\\n' +
    '            <button id="btn-zzz-resume-yes" style="padding: 10px; font-size: 16px; font-weight: bold; cursor: pointer; background-color: #4CAF50; color: white; border: none; border-radius: 5px; flex: 1;">Yes</button>\\n' +
    '            <button id="btn-zzz-resume-no" style="padding: 10px; font-size: 16px; font-weight: bold; cursor: pointer; background-color: #f44336; color: white; border: none; border-radius: 5px; flex: 1;">No</button>\\n' +
    '        </div>\\n' +
    '    </div>\\n' +
    '`;\\n' +
    'showModal("Sleep Mode", resumeHtml, "window-zzz-resume");';


code = code.replace(/document\.getElementById\('zzz-resume-modal'\)\.style\.display = 'flex';/, resumeHtmlStr);
code = code.replace(/document\.getElementById\('zzz-resume-modal'\)\.style\.display = 'none';/g, "if(window.windowManager) window.windowManager.closeDynamicWindow('window-zzz-resume');");


// 3. Remove the old results innerHTML setting (lines 1231 to 1279ish), just rely on the showModal with resultsHtml
// Let's find: `document.getElementById('zzz-results-content').innerHTML = ` ... up to `// Show results modal` or the next backtick.

const resultsStart = code.indexOf(`document.getElementById('zzz-results-content').innerHTML = \``);
if (resultsStart !== -1) {
    const resultsEnd = code.indexOf('`;', resultsStart) + 2; // +2 for `;
    code = code.substring(0, resultsStart) + code.substring(resultsEnd);
}


fs.writeFileSync('src/ui.js', code);
