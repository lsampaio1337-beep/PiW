const fs = require('fs');
const content = fs.readFileSync('config/hoennRoutes.js', 'utf8').replace('export const hoennRoutes = ', 'module.exports = ').replace('export const hoennUnlocks =', 'const hoennUnlocks =');
fs.writeFileSync('temp_hoenn.js', content);
const routes = require('./temp_hoenn.js');
routes.filter(r => r.requirements && r.requirements.some(req => req.earnBadge)).forEach(r => console.log(r.id, r.requirements.find(req => req.earnBadge).earnBadge));
