const fs = require('fs');

let log = fs.readFileSync('serve.log', 'utf8');
log = log.replace(/<<<<<<< ours/g, '').replace(/=======/g, '').replace(/>>>>>>> theirs/g, '');
fs.writeFileSync('serve.log', log);
