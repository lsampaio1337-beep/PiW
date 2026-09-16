const fs = require('fs');
let code = fs.readFileSync('src/ui.js', 'utf8');

// I should add a close button or a claim button so the user can close the modal, or maybe it's not needed since the modal has an 'X' button already (WindowManager).
// But standard is standard, the user may still want a claim button. Let's add it at the bottom.

const appendBtnStr = `
                                </div>
                                \${faintedBanner}
                                <button id="btn-zzz-results-close-dynamic" style="padding: 12px; font-size: 16px; font-weight: bold; cursor: pointer; background: linear-gradient(to right, #10b981, #059669); color: white; border: 1px solid #34d399; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.3); margin-top: 15px; width: 100%; text-transform: uppercase; letter-spacing: 1px;">Claim Rewards</button>
                            \`;`;

const searchStr = `
                                </div>
                                \${faintedBanner}
                            \`;`;

code = code.replace(searchStr, appendBtnStr);


// Now we add the event listener right after showModal

const afterShowModalStr = `showModal("ZzZ Mode", resultsHtml, "window-zzz-rewards");

                            document.getElementById('btn-zzz-results-close-dynamic').onclick = () => {
                                if(window.windowManager) window.windowManager.closeDynamicWindow('window-zzz-rewards');
                            };`;

code = code.replace(`showModal("ZzZ Mode", resultsHtml, "window-zzz-rewards");`, afterShowModalStr);

fs.writeFileSync('src/ui.js', code);
