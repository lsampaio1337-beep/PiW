import { showModal } from '../ui.js';

const helpContent = {
    "Core Mechanics": {
        "Stats & Experience": `
            <h3>Stat Calculation</h3>
            <ul>
                <li><strong>HP</strong>: Based on BaseHP, IV_HP, Level, and Quality.</li>
                <li><strong>Other Stats (ATK, DEF, SPA, SPD, SPE)</strong>: Based on BaseStat, IV_Stat, Level, and Quality.</li>
            </ul>
            <h3>Experience & Leveling</h3>
            <ul>
                <li><strong>ReqXP</strong>: Experience needed for the next level scales exponentially.</li>
                <li><strong>EVXP</strong>: Battle XP from defeating a Pokémon is based on Level, Base Stat Total (BST), Quality, and IVs.</li>
                <li><em>Note</em>: XP gains are boosted by Oak Task Level Tier and Purple Candies.</li>
            </ul>
        `,
        "Combat System": `
            <h3>Damage Calculation</h3>
            <ul>
                <li><strong>Base Damage</strong>: Scales with Level, Move Power, Attack vs Defense.</li>
                <li><strong>Final Damage</strong>: Modified by Type Effectiveness, Critical Hits (1.5x, 4% chance), and Random Variance (0.85x - 1.00x).</li>
            </ul>
            <h3>Turn Delays & Combat Speed</h3>
            <ul>
                <li><strong>Attack Delay</strong>: Base 2.0s, reduced by Pokémon Speed.</li>
                <li><strong>Encounter Delay</strong>: Base 3.0s, reduced by active Pokémon Speed.</li>
            </ul>
        `,
        "Capturing & Generation": `
            <h3>Catch Calculation</h3>
            <ul>
                <li><strong>Base Chance</strong>: 74% - (BST/14.6) - (Level/4.0) - (Quality Penalty) - (IV Penalty). Clamped to a minimum of 1%.</li>
                <li><strong>Final Chance</strong>: Modified by Pokéball multiplier, Catch Bonus (Oak Tasks, Black Yellow Candies), and Shiny Multiplier.</li>
                <li>Masterballs always have a 100% catch rate.</li>
            </ul>
            <h3>Quality Generation</h3>
            <ul>
                <li><strong>Tiers</strong>: Weak, Regular, Uncommon, Rare, Epic, Shiny.</li>
                <li><strong>Shiny Boosts</strong>: Rainbow Candies and Shiny Seen Tasks improve shiny rates.</li>
                <li>Oak Tasks can boost the internal Quality value up to +100%.</li>
            </ul>
            <h3>IV Generation</h3>
            <ul>
                <li>SumIV rolls between 6 and 595 (Cap: 600).</li>
                <li>Distributed randomly among the 6 stats (1-100 per stat).</li>
            </ul>
        `
    },
    "Items & Economy": {
        "Economy Basics": `
            <h3>Wealth Drops (EVM)</h3>
            <ul>
                <li>Money from defeating wild Pokémon scales with Level, BST, Quality, and IVs.</li>
                <li>Multiplied by Green Candy bonuses.</li>
            </ul>
            <h3>Selling Pokémon</h3>
            <ul>
                <li>Price heavily favors Quality and IVs over level or species.</li>
            </ul>
            <h3>Items Sell Value</h3>
            <ul>
                <li>Items always sell for 50% of their base buy price.</li>
            </ul>
        `,
        "Consumables & Upgrades": `
            <h3>Pokéballs</h3>
            <ul>
                <li><strong>Pokéball</strong>: $2, 1.0x Catch Multiplier</li>
                <li><strong>Greatball</strong>: $18, 1.5x Catch Multiplier</li>
                <li><strong>Ultraball</strong>: $75, 2.0x Catch Multiplier</li>
                <li><strong>Masterball</strong>: $1,000,000, 100% Catch Rate</li>
            </ul>
            <h3>Potions</h3>
            <ul>
                <li>Tiny Potion ($3, 25 HP) to Max Potion ($300k, Full HP).</li>
            </ul>
            <h3>Candies</h3>
            <ul>
                <li><strong>White Candy</strong>: Earned every 250 wild defeats. Used to buy other candies.</li>
                <li><strong>Green Candy</strong>: +3% Loot Probability.</li>
                <li><strong>Purple Candy</strong>: +2% XP Gain.</li>
                <li><strong>Black Yellow Candy</strong>: +4% Catch Chance.</li>
                <li><strong>Rainbow Candy</strong>: +1 Shiny Roll.</li>
            </ul>
        `
    },
    "World Progression": {
        "Gyms & Scaling": `
            <h3>Gyms & Elite 4 Scaling</h3>
            <ul>
                <li>Gym trainers dynamically scale based on progression.</li>
                <li>Quality and IVs increase as you progress further through the region.</li>
                <li>The party is fully healed automatically between Gym trainer battles. Auto-potions are disabled.</li>
            </ul>
        `,
        "Special Zones": `
            <h3>Safari Zone</h3>
            <ul>
                <li>Costs $5000 per entry.</li>
                <li>Infinite Safari Balls are provided. You are ejected if funds run out.</li>
            </ul>
            <h3>Casino Hub</h3>
            <ul>
                <li>Standard Route: $5000</li>
                <li>Double Shiny Route: $10,000</li>
                <li>Requires funds for each battle.</li>
            </ul>
            <h3>Route 1 Cap</h3>
            <ul>
                <li>Spawned Pokémon levels on Route 1 are capped to your active lead Pokémon's level.</li>
            </ul>
        `
    },
    "ZzZ Mode": {
        "Offline Play": `
            <h3>Mechanics</h3>
            <ul>
                <li>Activating ZzZ Mode saves the timestamp and closes the game.</li>
                <li><strong>Jigglypuff Grains</strong>: 1 Grain = 1 minute of offline simulation. Earned passively (1 per active minute).</li>
                <li>Uses the exact same mathematical formulas (Speed, Damage, Crits) as live play, bypassing visual renders.</li>
            </ul>
            <h3>Stopping Conditions</h3>
            <ul>
                <li>Runs out of Jigglypuff Grains (time cap).</li>
                <li>The entire party faints.</li>
                <li>Funds run out in special entry-fee areas (Safari/Casino).</li>
            </ul>
        `
    }
};

export function showHelp() {
    let sidebarHTML = '<div id="help-sidebar" style="width: 250px; border-right: 2px solid #1abc9c; padding: 10px; box-sizing: border-box; overflow-y: auto; background-color: #2c3e50;">';
    let isFirst = true;

    for (const [majorTopic, subTopics] of Object.entries(helpContent)) {
        sidebarHTML += `<div style="font-weight: bold; color: #f1c40f; margin-top: 10px; margin-bottom: 5px; font-size: 16px;">${majorTopic}</div>`;
        for (const [subTopic, content] of Object.entries(subTopics)) {
            const safeTopic = majorTopic.replace(/[^a-zA-Z0-9]/g, '_');
            const safeSub = subTopic.replace(/[^a-zA-Z0-9]/g, '_');
            const targetId = `help_content_${safeTopic}_${safeSub}`;

            const btnBg = isFirst ? '#3498db' : 'transparent';
            sidebarHTML += `<div class="help-nav-btn" data-target="${targetId}" style="cursor: pointer; padding: 5px; margin-left: 10px; color: white; background-color: ${btnBg}; border-radius: 3px; font-size: 14px;" onmouseover="this.style.backgroundColor='#2980b9'" onmouseout="if(!this.classList.contains('active-help-btn')) this.style.backgroundColor='transparent'">${subTopic}</div>`;
            isFirst = false;
        }
    }
    sidebarHTML += '</div>';

    let contentHTML = '<div id="help-content-area" style="flex: 1; padding: 20px; box-sizing: border-box; overflow-y: auto; background-color: #34495e;">';
    isFirst = true;

    for (const [majorTopic, subTopics] of Object.entries(helpContent)) {
        for (const [subTopic, content] of Object.entries(subTopics)) {
            const safeTopic = majorTopic.replace(/[^a-zA-Z0-9]/g, '_');
            const safeSub = subTopic.replace(/[^a-zA-Z0-9]/g, '_');
            const targetId = `help_content_${safeTopic}_${safeSub}`;

            const displayStyle = isFirst ? 'block' : 'none';
            contentHTML += `<div id="${targetId}" class="help-section" style="display: ${displayStyle}; color: white; line-height: 1.5;">
                <h2 style="margin-top: 0; color: #1abc9c; border-bottom: 1px solid #7f8c8d; padding-bottom: 5px;">${majorTopic} - ${subTopic}</h2>
                ${content}
            </div>`;
            isFirst = false;
        }
    }
    contentHTML += '</div>';

    const helpHTML = `
        <div style="display: flex; flex-direction: row; height: 100%; width: 100%;">
            ${sidebarHTML}
            ${contentHTML}
        </div>
        <script>
            // We attach the logic dynamically so it runs when inserted
            setTimeout(() => {
                const btns = document.querySelectorAll('.help-nav-btn');
                const sections = document.querySelectorAll('.help-section');

                // Mark first as active
                if(btns.length > 0) btns[0].classList.add('active-help-btn');

                btns.forEach(btn => {
                    btn.onclick = function() {
                        // Reset all buttons
                        btns.forEach(b => {
                            b.style.backgroundColor = 'transparent';
                            b.classList.remove('active-help-btn');
                        });
                        // Set clicked button
                        this.style.backgroundColor = '#3498db';
                        this.classList.add('active-help-btn');

                        // Hide all sections
                        sections.forEach(s => s.style.display = 'none');

                        // Show target section
                        const targetId = this.getAttribute('data-target');
                        const targetSection = document.getElementById(targetId);
                        if (targetSection) targetSection.style.display = 'block';
                    };

                    btn.onmouseout = function() {
                        if(!this.classList.contains('active-help-btn')) {
                            this.style.backgroundColor = 'transparent';
                        }
                    };
                });
            }, 50);
        </script>
    `;

    // showModal handles wrapper injecting
    showModal("Encyclopedia & Guide", helpHTML, "window-help", "800px", "600px");
}
