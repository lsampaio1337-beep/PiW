const fs = require('fs');
let code = fs.readFileSync('src/battleSystem.js', 'utf8');

const search = `        if (["Johto Safari Zone", "Kanto Safari Zone"].includes(this.state.currentRoute)) {
            const safariCost = this.state.config.balance.safariZonePrice || 500;
            if (this.state.trainer.money < safariCost) {
                this.stop();
                if (typeof window.switchView === 'function') {
                    window.switchView("SAFARI_HUB");
                }
                let msg = document.getElementById("safari-welcome-msg");
                if (msg) msg.innerText = "I am sorry, but you are all out of money. Try to sell some pokemons and come check us latter.";
                return;
            }
            this.state.trainer.money -= safariCost;
        }`;

const replace = `        if (["Johto Safari Zone", "Kanto Safari Zone"].includes(this.state.currentRoute)) {
            const safariCost = this.state.config.balance.safariZonePrice || 500;
            if (this.state.trainer.money < safariCost) {
                this.stop();
                if (typeof window.navigateToLocation === 'function') {
                    window.navigateToLocation(this.state.currentRoute);
                }
                let msg = document.getElementById("safari-welcome-msg");
                if (msg) msg.innerText = "I am sorry, but you are all out of money. Try to sell some pokemons and come check us latter.";
                return;
            }
            this.state.trainer.money -= safariCost;
        }`;

if (code.includes(search)) {
    code = code.replace(search, replace);
    fs.writeFileSync('src/battleSystem.js', code);
    console.log("Replaced successfully (Safari Battle System)!");
} else {
    console.log("Search string not found (Safari Battle System)!");
}
