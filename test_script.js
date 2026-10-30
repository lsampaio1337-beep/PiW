const unlocks = require('./config/paldeaRoutes.js').paldeaUnlocks;
console.log(unlocks.find(u => u.challengeName === 'Final Extra Challenge 1'));
