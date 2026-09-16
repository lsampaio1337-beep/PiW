const fs = require('fs');
let code = fs.readFileSync('src/ui.js', 'utf8');

// Replace the bad string interpolation
const badStr = 'const resumeHtml = `\\n    <div style="display: flex; flex-direction: column; gap: 15px; width: 360px; padding: 20px; text-align: center;">\\n        <p style="color: white; margin: 0;">Do you want to collect the farm while Sleeping?</p>\\n        <div style="display: flex; gap: 10px; justify-content: center; margin-top: 10px;">\\n            <button id="btn-zzz-resume-yes" style="padding: 10px; font-size: 16px; font-weight: bold; cursor: pointer; background-color: #4CAF50; color: white; border: none; border-radius: 5px; flex: 1;">Yes</button>\\n            <button id="btn-zzz-resume-no" style="padding: 10px; font-size: 16px; font-weight: bold; cursor: pointer; background-color: #f44336; color: white; border: none; border-radius: 5px; flex: 1;">No</button>\\n        </div>\\n    </div>\\n`;\\nshowModal("Sleep Mode", resumeHtml, "window-zzz-resume");';

const goodStr = `const resumeHtml = \`
    <div style="display: flex; flex-direction: column; gap: 15px; width: 360px; padding: 20px; text-align: center;">
        <p style="color: white; margin: 0;">Do you want to collect the farm while Sleeping?</p>
        <div style="display: flex; gap: 10px; justify-content: center; margin-top: 10px;">
            <button id="btn-zzz-resume-yes" style="padding: 10px; font-size: 16px; font-weight: bold; cursor: pointer; background-color: #4CAF50; color: white; border: none; border-radius: 5px; flex: 1;">Yes</button>
            <button id="btn-zzz-resume-no" style="padding: 10px; font-size: 16px; font-weight: bold; cursor: pointer; background-color: #f44336; color: white; border: none; border-radius: 5px; flex: 1;">No</button>
        </div>
    </div>
\`;
showModal("Sleep Mode", resumeHtml, "window-zzz-resume");`;

code = code.replace(badStr, goodStr);

// Let's also check for btn-zzz-results-close
const closeBtnStart = code.indexOf(`document.getElementById('btn-zzz-results-close').onclick = () => {`);
if (closeBtnStart !== -1) {
    const closeBtnEnd = code.indexOf(`};`, closeBtnStart) + 2;
    code = code.substring(0, closeBtnStart) + code.substring(closeBtnEnd);
}

fs.writeFileSync('src/ui.js', code);
