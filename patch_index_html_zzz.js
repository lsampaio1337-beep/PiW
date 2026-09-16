const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

// Remove zzz-confirmation-modal
let start = code.indexOf('<div id="zzz-confirmation-modal"');
if (start !== -1) {
    let end = code.indexOf('</div>\n  </div>', start) + 15;
    code = code.substring(0, start) + code.substring(end);
}

// Remove zzz-resume-modal
start = code.indexOf('<div id="zzz-resume-modal"');
if (start !== -1) {
    let end = code.indexOf('</div>\n  </div>', start) + 15;
    code = code.substring(0, start) + code.substring(end);
}

// Remove zzz-results-modal
start = code.indexOf('<div id="zzz-results-modal"');
if (start !== -1) {
    let end = code.indexOf('</div>\n  </div>', start) + 15;
    code = code.substring(0, start) + code.substring(end);
}

fs.writeFileSync('index.html', code);
