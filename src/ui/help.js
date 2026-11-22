import { showModal } from '../ui.js';

const helpContent = {
    "Core Mechanics": {
        "Stats & Formulas": {
            "HP Calculation": `
                <h3>HP Calculation</h3>
                <p>HP determines how much damage a Pokémon can take before fainting. It is calculated as:</p>
                <ul>
                    <li><strong>Formula</strong>: <code>Math.floor(0.01 * (2 * BaseHP + IV) * Level) + Level + 10</code></li>
                    <li>The result is then multiplied by the Pokémon's <strong>Quality Multiplier</strong>.</li>
                </ul>
            `,
            "Other Stats (ATK, DEF, SPA, SPD, SPE)": `
                <h3>Other Stats</h3>
                <p>These stats control damage dealt, damage mitigated, and combat delay.</p>
                <ul>
                    <li><strong>Formula</strong>: <code>Math.floor(0.01 * (2 * BaseStat + IV) * Level) + 5</code></li>
                    <li>The result is then multiplied by the <strong>Quality Multiplier</strong>.</li>
                </ul>
            `,
            "Damage Formula": `
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
            "Combat Speed & Delay": `
                <h3>Combat Delay Calculations</h3>
                <p>Actions operate on a cooldown timer governed by Speed (SPE).</p>
                <ul>
                    <li><strong>Attack Delay</strong>: Base 2.0 seconds. Reduced significantly by higher Speed stats. Formula: <code>100 / (Speed + 50)</code></li>
                    <li><strong>Encounter Transition Delay</strong>: Base 3.0 seconds. Reduced by the active Pokémon's Speed. Formula: <code>2.0 * (100 / (Speed + 50))</code></li>
                </ul>
                <p>Faster Pokémon attack more frequently and transition between wild encounters much faster, heavily increasing XP and item rates over time.</p>
            `
        },
        "Experience System": {
            "EVXP Calculation": `
                <h3>EVXP Calculation</h3>
                <p>Defeating a wild Pokémon grants EVXP (Effort Value Experience).</p>
                <ul>
                    <li><strong>Base Formula</strong>: <code>(5 + 8 * Level) * (BST / 300)</code></li>
                    <li><strong>Quality Bonus</strong>: No impact below <code>1.40</code>; grants a bonus equal to Quality for Rare/Epic (<code>1.40–1.80</code>) and a <code>5x</code> super bonus for Shiny (<code>2.00+</code>).</li>
                    <li><strong>Boosts</strong>: Increased by your Region Prestige Bonus (+100% per region), Professor Oak Task Tier, and active Purple Candies.</li>
                </ul>
            `,
            "Leveling Requirements": `
                <h3>Leveling Requirements</h3>
                <p>Required XP uses the unified formula <code>floor((4 + 6 * Level^2 / (Level + 30)) * (5 + 8 * Level))</code> for every level.</p>
                <p>Each new region raises the level cap by +100 (Kanto: 100, Johto: 200, etc.) and grants +100% Bonus XP.</p>
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
            `,
            "Catch Multipliers": `
                <h3>Multipliers</h3>
                <p>Once the base chance is determined, it is modified by:</p>
                <ul>
                    <li><strong>Pokéball Type</strong>: Standard (1.0x), Greatball (1.5x), Ultraball (2.0x).</li>
                    <li><strong>Oak Tasks</strong>: Bonus catch rate unlocked via task tiers.</li>
                    <li><strong>Consumables</strong>: Active Black Yellow Candies grant a flat % increase.</li>
                    <li><strong>Shiny Grace</strong>: Shiny Pokémon receive an automatic catch rate multiplier to prevent accidental losses.</li>
                </ul>
            `,
            "Available Pokéballs": `
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
                    <li><strong>Legendary</strong>: 1.81x Stats. Orange glow.</li>
                    <li><strong>Shiny</strong>: 2.00 to 2.50x Stats. Rainbow animated glow. Incredibly rare.</li>
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
            "Earning EVM": `
                <h3>Earning Money</h3>
                <p>EVM (Effort Value Money) is the primary currency. It is dropped by defeating wild Pokémon.</p>
                <ul>
                    <li><strong>Calculation</strong>: Scales linearly with the defeated Pokémon's Level, BST, Quality, and IVs.</li>
                    <li><strong>Boosts</strong>: Multiply your final EVM drops by using Green Candies.</li>
                </ul>
            `,
            "Selling & Market": `
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
                <p>Potions restore missing HP to your active or benched Pokémon. They can be bought at the Market or found as loot.</p>
                <ul>
                    <li><strong>Tiny Potion ($3)</strong>: Restores 25 HP.</li>
                    <li><strong>Small Potion ($12)</strong>: Restores 50 HP.</li>
                    <li><strong>Regular Potion ($35)</strong>: Restores 100 HP.</li>
                    <li><strong>Big Potion ($90)</strong>: Restores 250 HP.</li>
                    <li><strong>Huge Potion ($220)</strong>: Restores 1,000 HP.</li>
                    <li><strong>Ultra Potion ($9,000)</strong>: Restores 5,000 HP.</li>
                    <li><strong>Max Potion ($300,000)</strong>: Restores full HP (999,999 HP).</li>
                </ul>
            `,
            "Candies": `
                <h3>Permanent Passive Boosts</h3>
                <p>Candies provide global, permanent account buffs when consumed. They are accessed via the Bonus Candy icon.</p>
                <ul>
                    <li><strong>White Candy</strong>: Earned passively every 100 wild defeats. Trade White Candies in Bonus Candy for permanent colored candies.</li>
                    <li><strong>Green Candy</strong>: Boosts Loot Probability by +0.25% and Money from battles by +1% per candy.</li>
                    <li><strong>Purple Candy</strong>: Boosts Experience Gain from battles by +2% per candy.</li>
                    <li><strong>Black Yellow Candy</strong>: Increases Catch Rate Bonus by +20% per candy.</li>
                    <li><strong>Rainbow Candy</strong>: Grants +1 Extra Shiny Roll per candy.</li>
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
                <p>Gym Trainers and Pokemon League members do not have static stats. They scale dynamically based on your progression tier.</p>
                <ul>
                    <li><strong>Auto-Healing</strong>: Between individual Gym Trainer battles, your entire party is instantly healed to 100%.</li>
                    <li><strong>Items Locked</strong>: Auto-potions and manual item usage are disabled during Gym Battles.</li>
                </ul>
            `
        },
        "Special Hubs": {
            "Safari Zone (Kanto/Johto)": `
                <h3>Mechanics</h3>
                <p>The Safari Zone (Kanto/Johto) is a high-risk, high-reward catching hub.</p>
                <ul>
                    <li><strong>Entry / Encounter Fee</strong>: $500 EVM per encounter/entry session.</li>
                    <li><strong>Infinite Balls</strong>: You are granted infinite Safari Balls while inside.</li>
                    <li><strong>Ejection</strong>: You are forcefully removed from the Safari Zone (Kanto/Johto) if your total funds drop below $0.</li>
                </ul>
            `,
            "Celadon Casino": `
                <h3>Gambling Hub</h3>
                <p>The Casino (and Johto's Goldenrod Game Corner) lets you pay EVM per encounter for a shot at rare Pokémon and higher Shiny odds.</p>
                <ul>
                    <li><strong>Standard Route</strong>: $75 per encounter.</li>
                    <li><strong>Double Shiny Route</strong>: $200 per encounter, doubling the Shiny roll bonus.</li>
                </ul>
            `,
            "Daycare (Training & Breeding)": `
                <h3>Passive Training &amp; Breeding</h3>
                <p>Drop Pokémon in the Daycare (accessible from the Team Window's Training / Breeding tab or regional Daycare hub) to strengthen them while you battle elsewhere.</p>
                <ul>
                    <li><strong>Training</strong>: Builds Quality and random IVs passively over battle cycles up to their caps (tracks cumulative IVs gained).</li>
                    <li><strong>Breeding</strong>: Pair compatible Pokémon to hatch new eggs that inherit potential IVs and Quality from their parents.</li>
                </ul>
            `
        }
    },
    "ZzZ Mode": {
        "Offline Mechanics": {
            "Idle Simulation": `
                <h3>How It Works</h3>
                <p>ZzZ Mode allows your game to play itself while the application is closed or while you step away.</p>
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
                    <li>You run out of funds while simulating a fee-based zone like the Celadon Casino.</li>
                </ul>
            `
        }
    },
    "UI Navigation Icons": {
        "Core Screens": {
            "Main View <img src='Assets/Extra/Icons/IconMainView.png' style='height: 20px; vertical-align: middle;'>": `
                <h3>Main View</h3>
                <p>The core gameplay screen where active combat and encounters take place.</p>
                <ul>
                    <li>Watch your active Pokémon battle wild spawns.</li>
                    <li>View real-time damage, health bars, and combat logs.</li>
                    <li>Access quick catch options and run mechanics.</li>
                </ul>
            `,
            "Team <img src='Assets/Extra/Icons/IconTeam.png' style='height: 20px; vertical-align: middle;'>": `
                <h3>Team (Party)</h3>
                <p>Manage your active party of up to 6 Pokémon.</p>
                <ul>
                    <li>View stats, moves, and held items.</li>
                    <li>Heal individual Pokémon or use max potions.</li>
                    <li>Rearrange party order. The first conscious Pokémon will be sent into battle.</li>
                </ul>
            `,
            "Map <img src='Assets/Extra/Icons/IconMap.png' style='height: 20px; vertical-align: middle;'>": `
                <h3>Map</h3>
                <p>Navigate the world of Pokémon.</p>
                <ul>
                    <li>Travel between Routes, Cities, and special zones (Safari, Casino).</li>
                    <li>View Gym locations and challenge Gym Leaders.</li>
                    <li>Areas are unlocked by completing Progress Challenges.</li>
                </ul>
            `,
            "Backpack <img src='Assets/Extra/Icons/IconBackpack.png' style='height: 20px; vertical-align: middle;'>": `
                <h3>Backpack (Inventory)</h3>
                <p>Store and manage your items and captured Pokémon.</p>
                <ul>
                    <li><strong>Items:</strong> View potions, Pokéballs, evolutionary stones, and key items.</li>
                    <li><strong>PC (Storage):</strong> Access all captured Pokémon not currently in your party. You can filter, sort, and transfer them.</li>
                </ul>
            `,
            "Pokedex <img src='Assets/Extra/Icons/IconPokedex.png' style='height: 20px; vertical-align: middle;'>": `
                <h3>Pokédex & Smart Capture</h3>
                <p>An encyclopedia of all Pokémon you've seen and caught.</p>
                <ul>
                    <li>View base stats, types, and encountered/caught metrics.</li>
                    <li><strong>Smart Capture:</strong> Configure auto-catch rules based on species, quality, and IVs. You can set it to automatically use specific balls or ignore certain encounters entirely to speed up farming.</li>
                </ul>
            `,
            "Trainer <img src='Assets/Extra/Icons/IconTrainer.png' style='height: 20px; vertical-align: middle;'>": `
                <h3>Trainer Profile</h3>
                <p>View your personal statistics and achievements.</p>
                <ul>
                    <li>Track total encounters, money earned, and overall playtime.</li>
                    <li>View your current Badge collection.</li>
                    <li>See your Professor Oak Task Tier and progress towards the next rank.</li>
                </ul>
            `
        },
        "Features & Progression": {
            "Bonus Candy <img src='Assets/Extra/Icons/BonusCandy.png' style='height: 20px; vertical-align: middle;'>": `
                <h3>Bonus Candy</h3>
                <p>The central hub for purchasing and managing your permanent passive buffs.</p>
                <ul>
                    <li>Trade in White Candies (earned passively) for Green, Purple, Black Yellow, or Rainbow Candies.</li>
                    <li>These candies provide global, permanent account buffs when consumed.</li>
                    <li>See the <strong>Consumables -> Candies</strong> help section for exact buff numbers.</li>
                </ul>
            `,
            "Gift <img src='Assets/Extra/Icons/IconGift.png' style='height: 20px; vertical-align: middle;'>": `
                <h3>Gift (Promocodes)</h3>
                <p>Claim special rewards and promotional items.</p>
                <ul>
                    <li>Enter secret codes provided by the developer or community events to receive free items, money, or rare Pokémon.</li>
                </ul>
            `,
            "Calendar <img src='Assets/Extra/Icons/IconCalendar.png' style='height: 20px; vertical-align: middle;'>": `
                <h3>Daily Calendar, Challenges &amp; Token Shop</h3>
                <p>Collect cumulative login rewards, complete Daily Challenges, and spend Tokens in the Token Shop.</p>
                <ul>
                    <li><strong>Cumulative Login Calendar</strong>: Progresses cumulatively by total days claimed (your count never resets if you miss a day) and awards 1 Token alongside daily cash/item bonuses.</li>
                    <li><strong>Daily Challenges</strong>: Complete rotating daily goals for extra Token rewards (rerollable via the reroll allowance).</li>
                    <li><strong>Token Shop</strong>: Spend Tokens on Masterballs, Vitamins, and Evolution Stones directly from the Calendar window.</li>
                </ul>
            `,
            "Progress Challenges <img src='Assets/Extra/Icons/ProgressChallange.png' style='height: 20px; vertical-align: middle;'>": `
                <h3>Progress Challenges</h3>
                <p>Track your current route objectives.</p>
                <ul>
                    <li>Displays exactly what you need to do to unlock the next Route or City.</li>
                    <li>Objectives include defeating X enemies, catching specific Pokémon, or beating a Gym Leader.</li>
                    <li>Once completed, the next area on the Map becomes accessible.</li>
                </ul>
            `,
            "ZzZ Mode <img src='Assets/Extra/Icons/IconSleep.png' style='height: 20px; vertical-align: middle;'>": `
                <h3>ZzZ Mode (Idle Simulation)</h3>
                <p>Configure and launch the offline gameplay simulator.</p>
                <ul>
                    <li>Spend Jigglypuff Grains to simulate hours of gameplay in seconds.</li>
                    <li>You must configure your target area and ensure you have enough Potions and Pokéballs before starting.</li>
                    <li>See the <strong>ZzZ Mode</strong> help section for deeper mechanics.</li>
                </ul>
            `
        },
        "System Options": {
            "Help <img src='Assets/Extra/Icons/IconHelp.png' style='height: 20px; vertical-align: middle;'>": `
                <h3>Help</h3>
                <p>You are here! This comprehensive guide explains all mechanics, formulas, and UI elements.</p>
            `,
            "Settings <img src='Assets/Extra/Icons/IconSettings.png' style='height: 20px; vertical-align: middle;'>": `
                <h3>Settings</h3>
                <p>Customize graphics, window layout, and profile save data.</p>
                <ul>
                    <li><strong>Legacy Sprites</strong>: Switch between modern and classic pixel sprites across battles and menus.</li>
                    <li><strong>Window Layout Reset</strong>: Restore saved floating window positions and sizes back to defaults.</li>
                    <li><strong>Save Management</strong>: Download encrypted profile backups or restore an exported save file.</li>
                    <li><strong>Cheat &amp; Debug Tools</strong>: Open developer controls for testing encounters, game speed, and offline simulation.</li>
                </ul>
            `,
            "Exit <img src='Assets/Extra/Icons/IconExit.png' style='height: 20px; vertical-align: middle;'>": `
                <h3>Exit</h3>
                <p>Safely save and close the game.</p>
                <ul>
                    <li>The game auto-saves frequently, but using the Exit button guarantees a final save is written to disk before closing the application.</li>
                </ul>
            `
        }
    }
};

export function showHelp() {
    let sidebarItemsHTML = '';
    let isFirst = true;

    for (const [majorTopic, subCategories] of Object.entries(helpContent)) {
        sidebarItemsHTML += `<div class="help-major-topic">`;
        sidebarItemsHTML += `<div class="help-major-header"><span>${majorTopic}</span><span class="help-major-chevron">▾</span></div>`;
        sidebarItemsHTML += `<div class="help-major-items">`;

        for (const [subCategory, groups] of Object.entries(subCategories)) {
            sidebarItemsHTML += `<div class="help-sub-group">`;
            sidebarItemsHTML += `<div class="help-sub-category">${subCategory}</div>`;

            for (const [groupName, articleHtml] of Object.entries(groups)) {
                const targetId = `help_content_${majorTopic.replace(/[^a-zA-Z0-9]/g, '_')}_${subCategory.replace(/[^a-zA-Z0-9]/g, '_')}_${groupName.replace(/[^a-zA-Z0-9]/g, '_')}`;
                const activeClass = isFirst ? ' active-help-btn' : '';
                const plainText = `${majorTopic} ${subCategory} ${groupName} ${articleHtml.replace(/<[^>]+>/g, ' ')}`.replace(/\s+/g, ' ').replace(/"/g, '&quot;').trim().toLowerCase();
                sidebarItemsHTML += `<div class="help-nav-btn${activeClass}" data-target="${targetId}" data-search-text="${plainText}">${groupName}</div>`;
                isFirst = false;
            }
            sidebarItemsHTML += `</div>`;
        }
        sidebarItemsHTML += `</div></div>`;
    }

    const sidebarHTML = `
        <div id="help-sidebar">
            <div class="help-search-wrap">
                <input type="text" id="help-search-input" placeholder="Search help topics..." autocomplete="off">
            </div>
            <div class="help-nav-list">
                ${sidebarItemsHTML}
            </div>
        </div>
    `;

    let contentHTML = '<div id="help-content-area">';
    isFirst = true;

    for (const [majorTopic, subCategories] of Object.entries(helpContent)) {
        for (const [subCategory, groups] of Object.entries(subCategories)) {
            for (const [groupName, content] of Object.entries(groups)) {
                const targetId = `help_content_${majorTopic.replace(/[^a-zA-Z0-9]/g, '_')}_${subCategory.replace(/[^a-zA-Z0-9]/g, '_')}_${groupName.replace(/[^a-zA-Z0-9]/g, '_')}`;

                const displayStyle = isFirst ? 'block' : 'none';
                contentHTML += `<div id="${targetId}" class="help-section" style="display: ${displayStyle};">
                    <div class="help-breadcrumb">${majorTopic} &rsaquo; ${subCategory}</div>
                    <h2 class="help-section-title">${groupName}</h2>
                    <div class="help-article-body">${content}</div>
                </div>`;
                isFirst = false;
            }
        }
    }
    contentHTML += '</div>';

    const helpHTML = `
        <div class="help-container">
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
        const majorHeaders = modalContainer.querySelectorAll('.help-major-header');
        const searchInput = modalContainer.querySelector('#help-search-input');

        majorHeaders.forEach(header => {
            header.addEventListener('click', function() {
                this.parentElement.classList.toggle('collapsed');
            });
        });

        btns.forEach(btn => {
            btn.addEventListener('click', function() {
                btns.forEach(b => b.classList.remove('active-help-btn'));
                this.classList.add('active-help-btn');

                sections.forEach(s => { s.style.display = 'none'; });

                const targetId = this.getAttribute('data-target');
                const targetSection = document.getElementById(targetId);
                if (targetSection) targetSection.style.display = 'block';
            });
        });

        if (searchInput) {
            searchInput.addEventListener('input', function() {
                const query = this.value.trim().toLowerCase();
                const majorTopics = modalContainer.querySelectorAll('.help-major-topic');

                majorTopics.forEach(topic => {
                    let topicHasMatch = false;
                    if (query) topic.classList.remove('collapsed');

                    topic.querySelectorAll('.help-sub-group').forEach(subGroup => {
                        let subHasMatch = false;
                        subGroup.querySelectorAll('.help-nav-btn').forEach(btn => {
                            const searchText = (btn.getAttribute('data-search-text') || btn.textContent || '').toLowerCase();
                            const matches = !query || searchText.includes(query);
                            btn.style.display = matches ? '' : 'none';
                            if (matches) subHasMatch = true;
                        });
                        subGroup.style.display = subHasMatch ? '' : 'none';
                        if (subHasMatch) topicHasMatch = true;
                    });

                    topic.style.display = topicHasMatch ? '' : 'none';
                });

                const activeBtn = modalContainer.querySelector('.help-nav-btn.active-help-btn');
                if (!activeBtn || activeBtn.style.display === 'none') {
                    const firstVisible = Array.from(btns).find(b => b.style.display !== 'none');
                    if (firstVisible) {
                        firstVisible.click();
                    }
                }
            });
        }
    }, 100);
}
