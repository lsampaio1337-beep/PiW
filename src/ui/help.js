import { showModal } from '../ui.js';

const helpContent = {
    "Core Mechanics": {
        "Stats & Formulas": {
            "Stat Calculations": `
                <h3>HP Calculation</h3>
                <p>HP determines how much damage a Pokémon can take before fainting. It is calculated as:</p>
                <ul>
                    <li><strong>Formula</strong>: <code>Math.floor(0.01 * (2 * BaseHP + IV) * Level) + Level + 10</code></li>
                    <li>The result is then multiplied by the Pokémon's <strong>Quality Multiplier</strong>.</li>
                </ul>
                <h3>Other Stats (ATK, DEF, SPA, SPD, SPE)</h3>
                <p>These stats control damage dealt, damage mitigated, and combat delay.</p>
                <ul>
                    <li><strong>Formula</strong>: <code>Math.floor(0.01 * (2 * BaseStat + IV) * Level) + 5</code></li>
                    <li>The result is then multiplied by the <strong>Quality Multiplier</strong>.</li>
                </ul>
            `,
            "Combat Damage": `
                <h3>Damage Formula</h3>
                <p>Damage scaling depends on whether an attack is Physical (ATK vs DEF) or Special (SPA vs SPD).</p>
                <ul>
                    <li><strong>Level Factor</strong>: <code>(2 * Level / 5) + 2</code></li>
                    <li><strong>Base Damage</strong>: Level Factor * Move Power * (Attacker Stat / Defender Stat)</li>
                    <li><strong>Modifier</strong>: <code>(Base Damage / 50) + 2</code></li>
                    <li><strong>Final Damage</strong>: Modifier * Type Effectiveness * Random Variance (0.85 to 1.00)</li>
                </ul>
                <p><em>Critical Hits</em>: There is a base 4% chance to strike a critical hit, which multiplies final damage by 1.5x.</p>
            `,
            "Turn Speed": `
                <h3>Combat Delay Calculations</h3>
                <p>Actions operate on a cooldown timer governed by Speed (SPE).</p>
                <ul>
                    <li><strong>Attack Delay</strong>: Base 2.0 seconds. Reduced significantly by higher Speed stats.</li>
                    <li><strong>Encounter Transition Delay</strong>: Base 3.0 seconds. Reduced by the active Pokémon's Speed.</li>
                </ul>
                <p>Faster Pokémon attack more frequently and transition between wild encounters much faster, heavily increasing XP and item rates over time.</p>
            `
        },
        "Experience System": {
            "Gaining XP": `
                <h3>EVXP Calculation</h3>
                <p>Defeating a wild Pokémon grants EVXP (Effort Value Experience).</p>
                <ul>
                    <li><strong>Base Formula</strong>: <code>(Base Stat Total / 5) * (Level / 2)</code></li>
                    <li><strong>Multipliers</strong>: Multiplied by the defeated Pokémon's Quality and IV scaling.</li>
                    <li><strong>Boosts</strong>: Increased globally by your Professor Oak Task Tier and active Purple Candies.</li>
                </ul>
                <h3>Leveling Requirements</h3>
                <p>The required XP to reach the next level grows exponentially: <code>100 * (Next Level ^ 2)</code>.</p>
                <p>The maximum level cap for any Pokémon is 100.</p>
            `
        }
    },
    "Capturing & Generation": {
        "Catch System": {
            "Catch Rate Formula": `
                <h3>Base Catch Chance</h3>
                <p>The chance to capture a Pokémon starts by calculating a base probability:</p>
                <ul>
                    <li><strong>Formula</strong>: <code>74% - (BST / 14.6) - (Level / 4.0) - (Quality Penalty) - (IV Penalty)</code></li>
                    <li>High quality (e.g., Shiny, Epic) and high IV Pokémon heavily penalize the catch rate.</li>
                    <li>The absolute minimum Base Chance is always clamped to 1%.</li>
                </ul>
                <h3>Multipliers</h3>
                <p>Once the base chance is determined, it is modified by:</p>
                <ul>
                    <li><strong>Pokéball Type</strong>: Standard (1.0x), Greatball (1.5x), Ultraball (2.0x).</li>
                    <li><strong>Oak Tasks</strong>: Bonus catch rate unlocked via task tiers.</li>
                    <li><strong>Consumables</strong>: Active Black Yellow Candies grant a flat % increase.</li>
                    <li><strong>Shiny Grace</strong>: Shiny Pokémon receive an automatic catch rate multiplier to prevent accidental losses.</li>
                </ul>
            `,
            "Pokéballs": `
                <h3>Available Balls</h3>
                <ul>
                    <li><strong>Pokéball ($2)</strong>: Standard catching tool. 1.0x modifier.</li>
                    <li><strong>Greatball ($18)</strong>: Improved tool. 1.5x modifier.</li>
                    <li><strong>Ultraball ($75)</strong>: Professional tool. 2.0x modifier.</li>
                    <li><strong>Masterball ($1,000,000)</strong>: Flawless tool. Guarantees a 100% catch rate regardless of quality, level, or BST.</li>
                </ul>
            `
        },
        "Generation Engine": {
            "Quality Tiers": `
                <h3>Stat Multipliers & Rarities</h3>
                <p>Every spawned Pokémon rolls a Quality Tier which acts as a global multiplier for all of its stats:</p>
                <ul>
                    <li><strong>Weak</strong>: 0.8x Stats. Very common.</li>
                    <li><strong>Regular</strong>: 1.0x Stats. Standard spawn.</li>
                    <li><strong>Uncommon</strong>: 1.1x Stats. Blue glow.</li>
                    <li><strong>Rare</strong>: 1.25x Stats. Dark Blue glow.</li>
                    <li><strong>Epic</strong>: 1.5x Stats. Purple glow. Extremely tough.</li>
                    <li><strong>Shiny</strong>: 2.0x Stats. Rainbow animated glow. Incredibly rare.</li>
                </ul>
            `,
            "IVs (Individual Values)": `
                <h3>IV Distribution</h3>
                <p>In addition to Quality, each Pokémon receives randomly generated IVs.</p>
                <ul>
                    <li><strong>SumIV Roll</strong>: Total IV pool randomly generated between 6 and 595.</li>
                    <li><strong>Distribution</strong>: The pool is randomly divided across the 6 stats (HP, ATK, DEF, SPA, SPD, SPE).</li>
                    <li><strong>Maximums</strong>: No single stat can exceed 100 IVs.</li>
                </ul>
            `
        }
    },
    "Items & Economy": {
        "Currency & Wealth": {
            "EVM System": `
                <h3>Earning Money</h3>
                <p>EVM (Effort Value Money) is the primary currency. It is dropped by defeating wild Pokémon.</p>
                <ul>
                    <li><strong>Calculation</strong>: Scales linearly with the defeated Pokémon's Level, BST, Quality, and IVs.</li>
                    <li><strong>Boosts</strong>: Multiply your final EVM drops by using Green Candies.</li>
                </ul>
            `,
            "Market Economics": `
                <h3>Selling Pokémon</h3>
                <p>Selling Pokémon is a massive source of income in the mid-to-late game.</p>
                <ul>
                    <li>Prices are disproportionately weighted toward Quality and SumIV. A low-level Shiny will sell for astronomically more than a high-level Regular.</li>
                </ul>
                <h3>Selling Items</h3>
                <p>Any consumable item can be sold back to the Market for exactly 50% of its base purchase price.</p>
            `
        },
        "Consumables": {
            "Potions": `
                <h3>Healing</h3>
                <p>Potions restore missing HP to your active or benched Pokémon.</p>
                <ul>
                    <li><strong>Tiny Potion ($3)</strong>: Restores 25 HP.</li>
                    <li><strong>Small Potion ($25)</strong>: Restores 100 HP.</li>
                    <li><strong>Potion ($150)</strong>: Restores 500 HP.</li>
                    <li><strong>Medium Potion ($1,000)</strong>: Restores 2,500 HP.</li>
                    <li><strong>Large Potion ($12,000)</strong>: Restores 10,000 HP.</li>
                    <li><strong>Huge Potion ($80,000)</strong>: Restores 50,000 HP.</li>
                    <li><strong>Max Potion ($300,000)</strong>: Restores 100% of maximum HP.</li>
                </ul>
            `,
            "Candies": `
                <h3>Permanent Passive Boosts</h3>
                <p>Candies provide global, permanent account buffs when consumed.</p>
                <ul>
                    <li><strong>White Candy</strong>: A currency candy earned passively every 250 wild defeats. Can be traded to the Professor for other colored candies.</li>
                    <li><strong>Green Candy</strong>: Boosts Wealth/Loot Probability by +3% per candy.</li>
                    <li><strong>Purple Candy</strong>: Boosts EVXP gain by +2% per candy.</li>
                    <li><strong>Black Yellow Candy</strong>: Increases base Catch Chance by +4% per candy.</li>
                    <li><strong>Rainbow Candy</strong>: Grants +1 bonus Shiny Roll chance per candy.</li>
                </ul>
            `
        }
    },
    "World Progression": {
        "Routes & Gyms": {
            "Route Unlocking": `
                <h3>Progression Requirements</h3>
                <p>Routes are locked behind specific challenges visible in the Progress tab.</p>
                <ul>
                    <li><strong>Kill Count</strong>: Defeat X number of Pokémon on the current route.</li>
                    <li><strong>Capture Goals</strong>: Catch specific species.</li>
                    <li><strong>Gym Leaders</strong>: Defeat the local Gym Leader to acquire their badge.</li>
                </ul>
            `,
            "Gym Battles": `
                <h3>Dynamic Scaling</h3>
                <p>Gym Trainers and Elite 4 members do not have static stats. They scale dynamically based on your progression tier.</p>
                <ul>
                    <li><strong>Auto-Healing</strong>: Between individual Gym Trainer battles, your entire party is instantly healed to 100%.</li>
                    <li><strong>Items Locked</strong>: Auto-potions and manual item usage are disabled during Gym Battles.</li>
                </ul>
            `
        },
        "Special Hubs": {
            "Safari Zone": `
                <h3>Mechanics</h3>
                <p>The Safari Zone is a high-risk, high-reward catching hub.</p>
                <ul>
                    <li><strong>Entry Fee</strong>: $5,000 EVM per entry session.</li>
                    <li><strong>Infinite Balls</strong>: You are granted infinite Safari Balls while inside.</li>
                    <li><strong>Ejection</strong>: You are forcefully removed from the Safari Zone if your total funds drop below $0.</li>
                </ul>
            `,
            "Casino": `
                <h3>Gambling Hub</h3>
                <p>The Casino forces you to pay EVM per individual encounter for a chance at extreme quality.</p>
                <ul>
                    <li><strong>Standard Route</strong>: $5,000 per encounter.</li>
                    <li><strong>Double Shiny Route</strong>: $10,000 per encounter, but naturally doubles the base Shiny probability.</li>
                </ul>
            `
        }
    },
    "ZzZ Mode": {
        "Offline Mechanics": {
            "Idle Simulation": `
                <h3>How It Works</h3>
                <p>ZzZ Mode allows your game to play itself while the application is closed.</p>
                <ul>
                    <li><strong>Grains</strong>: Requires Jigglypuff Grains. 1 Grain = 1 Minute of offline time. Grains are earned passively by keeping the game open (1 per active minute).</li>
                    <li><strong>Simulation Integrity</strong>: The offline engine mathematically perfectly simulates the exact same combat formulas, speed delays, catch rates, and RNG rolls as the live game. It simply removes the visual rendering to process hours of gameplay in milliseconds.</li>
                </ul>
            `,
            "Stoppage Triggers": `
                <h3>When Does Simulation End?</h3>
                <p>The offline simulator will halt instantly and grant you your rewards up to that timestamp if any of the following occur:</p>
                <ul>
                    <li>You run out of Jigglypuff Grains (Maximum time reached).</li>
                    <li>Your entire active party faints due to lack of potions or tough enemies.</li>
                    <li>You run out of funds while simulating a fee-based zone like the Casino.</li>
                </ul>
            `
        }
    }
};

export function showHelp() {
    let sidebarHTML = '<div id="help-sidebar" style="width: 300px; border-right: 2px solid #1abc9c; padding: 10px; box-sizing: border-box; overflow-y: auto; background-color: #2c3e50; height: 100%;">';
    let isFirst = true;

    for (const [majorTopic, subCategories] of Object.entries(helpContent)) {
        sidebarHTML += `<div style="font-weight: bold; color: #f1c40f; margin-top: 15px; margin-bottom: 5px; font-size: 16px; text-transform: uppercase;">${majorTopic}</div>`;

        for (const [subCategory, groups] of Object.entries(subCategories)) {
            sidebarHTML += `<div style="font-weight: bold; color: #bdc3c7; margin-top: 5px; margin-bottom: 3px; margin-left: 10px; font-size: 14px;">${subCategory}</div>`;

            for (const [groupName, content] of Object.entries(groups)) {
                const targetId = `help_content_${majorTopic.replace(/[^a-zA-Z0-9]/g, '_')}_${groupName.replace(/[^a-zA-Z0-9]/g, '_')}`;

                const btnBg = isFirst ? '#3498db' : 'transparent';
                sidebarHTML += `<div class="help-nav-btn" data-target="${targetId}" style="cursor: pointer; padding: 4px; margin-left: 20px; color: white; background-color: ${btnBg}; border-radius: 3px; font-size: 13px; margin-bottom: 2px;" onmouseover="this.style.backgroundColor='#2980b9'" onmouseout="if(!this.classList.contains('active-help-btn')) this.style.backgroundColor='transparent'">${groupName}</div>`;
                isFirst = false;
            }
        }
    }
    sidebarHTML += '</div>';

    let contentHTML = '<div id="help-content-area" style="flex: 1; padding: 20px; box-sizing: border-box; overflow-y: auto; background-color: #34495e; height: 100%;">';
    isFirst = true;

    for (const [majorTopic, subCategories] of Object.entries(helpContent)) {
        for (const [subCategory, groups] of Object.entries(subCategories)) {
            for (const [groupName, content] of Object.entries(groups)) {
                const targetId = `help_content_${majorTopic.replace(/[^a-zA-Z0-9]/g, '_')}_${groupName.replace(/[^a-zA-Z0-9]/g, '_')}`;

                const displayStyle = isFirst ? 'block' : 'none';
                contentHTML += `<div id="${targetId}" class="help-section" style="display: ${displayStyle}; color: white; line-height: 1.6;">
                    <h2 style="margin-top: 0; color: #1abc9c; border-bottom: 1px solid #7f8c8d; padding-bottom: 5px;">${majorTopic} &raquo; ${subCategory} &raquo; ${groupName}</h2>
                    <div style="font-size: 14px;">${content}</div>
                </div>`;
                isFirst = false;
            }
        }
    }
    contentHTML += '</div>';

    const helpHTML = `
        <div style="display: flex; flex-direction: row; height: 100%; width: 100%; overflow: hidden;">
            ${sidebarHTML}
            ${contentHTML}
        </div>
    `;

    // Inject into the DOM
    showModal("Help", helpHTML, "window-help", "1400px", "700px");

    // Manually attach event listeners after the modal has been injected to avoid innerHTML <script> execution blocks
    setTimeout(() => {
        const modalContainer = document.getElementById("window-help");
        if (!modalContainer) return;

        const btns = modalContainer.querySelectorAll('.help-nav-btn');
        const sections = modalContainer.querySelectorAll('.help-section');

        // Mark first as active purely for the class toggle state
        if(btns.length > 0) btns[0].classList.add('active-help-btn');

        btns.forEach(btn => {
            btn.addEventListener('click', function() {
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
            });
        });
    }, 100);
}
