const fs = require('fs');

let bs = fs.readFileSync('src/battleSystem.js', 'utf8');

const ours = `<<<<<<< ours
        // Catch Rate Booster based on caps
        let caps = this.state.stats.caught;
        let catchBoost = 0;
        if (caps >= 25000) catchBoost = 0.25;
        else if (caps >= 10000) catchBoost = 0.20;
        else if (caps >= 5000) catchBoost = 0.15;
        else if (caps >= 2500) catchBoost = 0.10;
        else if (caps >= 1000) catchBoost = 0.05;

        multiplier *= (1 + catchBoost);

        // Shiny catch multiplier
        if (this.activeEncounter.qualityName === "Shiny" && this.state.stats.shiniesSeen >= 10) {
            multiplier *= 2.0;
        }

        const chance = mathEngine.calculateCatchChance(this.activeEncounter.bst, this.activeEncounter.level, multiplier);
        const caught = (Math.random() * 100) <= chance;
=======
        const chance = mathEngine.calculateCatchChance(this.activeEncounter.bst, this.activeEncounter.level, multiplier, this.state.stats, this.activeEncounter.qualityName === "Shiny");
>>>>>>> theirs`;

const resolution = `        const chance = mathEngine.calculateCatchChance(this.activeEncounter.bst, this.activeEncounter.level, multiplier, this.state.stats, this.activeEncounter.qualityName === "Shiny");
        const caught = (Math.random() * 100) <= chance;`;

bs = bs.replace(ours, resolution);

fs.writeFileSync('src/battleSystem.js', bs);
