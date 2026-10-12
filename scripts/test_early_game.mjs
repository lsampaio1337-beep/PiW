import { chromium } from 'playwright';
import { spawn } from 'child_process';
import balance from '../config/balance.js';

const PORT = 8099;

async function runTest() {
    console.log("Starting local server...");
    const serverProcess = spawn('python3', ['-m', 'http.server', PORT.toString()]);

    await new Promise(resolve => setTimeout(resolve, 2000));

    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto(`http://localhost:${PORT}/index.html`);
    await page.waitForTimeout(2000);

    await page.evaluate(() => {
        let event = new MouseEvent('click', { bubbles: true, cancelable: true, view: window });
        document.getElementById('btn-new-profile').dispatchEvent(event);
    });

    await page.waitForTimeout(2000);

    await page.evaluate(() => {
        let event = new MouseEvent('click', { bubbles: true, cancelable: true, view: window });
        document.getElementById('choose-bulbasaur').dispatchEvent(event);
    });

    await page.waitForTimeout(2000);

    console.log("Extracting math module directly...");
    let result = await page.evaluate(async () => {
        const mathEngine = await import('./src/mathEngine.js');

        let leader = window.state.party[0];
        // Starters begin at Level 1, not 5.

        let timeTaken = 0;
        let bst = 253; // Pidgey

        while (leader.level < 10) {
            let wildLevel = Math.min(2, leader.level);
            wildLevel = 1;

            let myAtk = window.globals.battleSystem.state.party[0].currentStats.atk;
            let mySpeed = window.globals.battleSystem.state.party[0].currentStats.spe;

            let wildDef = 6;
            let wildHp = 12;

            let damage = mathEngine.calculateDamage(leader.level, 40, myAtk, wildDef, 1.0, 1.4).damage;
            let hits = Math.ceil(wildHp / Math.max(1, damage));

            let attackDelay = Math.max(250, 2.0 * 1000 * (100 / (100 + mySpeed))) / 1000;
            let searchTime = Math.max(300, 3.0 * 1000 * (100 / (100 + mySpeed))) / 1000;

            let encounterTime = searchTime + (hits * attackDelay) + 2.0;
            timeTaken += encounterTime;

            let xp = mathEngine.calculateEVXP(bst, wildLevel, 1.0, 300);
            leader.xp += xp;

            let nextLevelXP = mathEngine.calculateTotalXP(leader.level + 1);
            if (leader.xp >= nextLevelXP) {
                leader.level++;
                leader.currentStats.atk += 2;
                leader.currentStats.spe += 2;
            }
        }

        return timeTaken;
    });

    console.log(`Simulated exact math to level 10 based on actual Lv1 start: ${result / 60} minutes`);

    await browser.close();
    serverProcess.kill();
    process.exit(0);
}

runTest().catch((err) => {
    console.error(err);
    process.exit(1);
});
