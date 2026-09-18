const fs = require('fs');
let code = fs.readFileSync('src/ui.js', 'utf8');

const search = `    // Create the OK button
    const okBtn = document.createElement("button");
    okBtn.innerText = "ok";
    okBtn.id = "btn-cheat-ok";`;

const replace = `    // Create the OK button
    const okBtn = document.createElement("button");
    okBtn.innerText = "ok";
    okBtn.id = "btn-cheat-ok";`;

// just verifying the button is actually created
if (code.includes(search)) {
    console.log('button logic found');
} else {
    console.log('button logic not found');
}
