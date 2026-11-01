
import { state, globals } from '../state.js';
import { getCapacity } from '../mathEngine.js';
import { TYPE_COLORS, showModal } from '../ui.js';
import { badgeMapping, getBadgeFileName } from '../utils/badges.js';
import { checkCombatLock } from '../ui.js';

export function showTrainerStats(tab = 'statistics', options = {}) {
        if(checkCombatLock()) return;

        let titleHtml = `
            <div style="display: flex; flex-direction: column; align-items: center; gap: 5px;">
                <div style="font-weight: bold; font-size: 18px; color: white;">Trainer</div>
                <div style="display: inline-flex; background: rgba(0, 0, 0, 0.2); border-radius: 20px; padding: 3px; gap: 5px;">
                    <button onclick="window.showTrainerStats('statistics')" style="${tab === 'statistics' ? 'background: linear-gradient(to bottom, #3498db, #2980b9); color: white; border: 1px solid #3498db; box-shadow: 0 2px 4px rgba(0,0,0,0.2);' : 'background: transparent; color: rgba(255, 255, 255, 0.7); border: 1px solid transparent;'} border-radius: 15px; padding: 5px 15px; font-weight: bold; cursor: pointer; font-size: 14px; transition: all 0.2s;" onmousedown="event.stopPropagation()">Statistics</button>
                    <button onclick="window.showTrainerStats('badges')" style="${tab === 'badges' ? 'background: linear-gradient(to bottom, #3498db, #2980b9); color: white; border: 1px solid #3498db; box-shadow: 0 2px 4px rgba(0,0,0,0.2);' : 'background: transparent; color: rgba(255, 255, 255, 0.7); border: 1px solid transparent;'} border-radius: 15px; padding: 5px 15px; font-weight: bold; cursor: pointer; font-size: 14px; transition: all 0.2s;" onmousedown="event.stopPropagation()">Badges</button>
                    <button onclick="window.showTrainerStats('catch-rate')" style="${tab === 'catch-rate' ? 'background: linear-gradient(to bottom, #3498db, #2980b9); color: white; border: 1px solid #3498db; box-shadow: 0 2px 4px rgba(0,0,0,0.2);' : 'background: transparent; color: rgba(255, 255, 255, 0.7); border: 1px solid transparent;'} border-radius: 15px; padding: 5px 15px; font-weight: bold; cursor: pointer; font-size: 14px; transition: all 0.2s;" onmousedown="event.stopPropagation()">Catch Rate</button>
                    <button onclick="window.showTrainerStats('upgrades')" style="${tab === 'upgrades' ? 'background: linear-gradient(to bottom, #3498db, #2980b9); color: white; border: 1px solid #3498db; box-shadow: 0 2px 4px rgba(0,0,0,0.2);' : 'background: transparent; color: rgba(255, 255, 255, 0.7); border: 1px solid transparent;'} border-radius: 15px; padding: 5px 15px; font-weight: bold; cursor: pointer; font-size: 14px; transition: all 0.2s;" onmousedown="event.stopPropagation()">Upgrades</button>
                    <button onclick="window.showTrainerStats('medals')" style="${tab === 'medals' ? 'background: linear-gradient(to bottom, #3498db, #2980b9); color: white; border: 1px solid #3498db; box-shadow: 0 2px 4px rgba(0,0,0,0.2);' : 'background: transparent; color: rgba(255, 255, 255, 0.7); border: 1px solid transparent;'} border-radius: 15px; padding: 5px 15px; font-weight: bold; cursor: pointer; font-size: 14px; transition: all 0.2s;" onmousedown="event.stopPropagation()">Medals</button>
                </div>
            </div>
        `;

        let contentHtml = '';

        if (tab === 'statistics') {
            let uniqueSpeciesCaught = 0;
            if (state.stats.caughtSpecies) {
                uniqueSpeciesCaught = (state.stats.caughtSpeciesCount || 0);
            }

            let playtimeStr = "0h 0m 0s";
            if (state.globalStats.playtime) {
                const totalSec = state.globalStats.playtime;
                const h = Math.floor(totalSec / 3600);
                const m = Math.floor((totalSec % 3600) / 60);
                const s = totalSec % 60;
                playtimeStr = `${h}h ${m}m ${s}s`;
            }

            let highestLevel = 0;
            let highestQuality = 0;
            let highestSumIV = 0;
            let backpackMons = [];
            if (state.party) backpackMons = backpackMons.concat(state.party);
            if (state.storage) backpackMons = backpackMons.concat(state.storage);
            if (state.safe) backpackMons = backpackMons.concat(state.safe);

            backpackMons.forEach(p => {
                if (!p) return;
                if (p.level > highestLevel) highestLevel = p.level;
                if (p.quality > highestQuality) highestQuality = p.quality;
                if (p.ivs) {
                    const sumIV = (p.ivs.hp || 0) + (p.ivs.atk || 0) + (p.ivs.def || 0) + (p.ivs.spa || 0) + (p.ivs.spd || 0) + (p.ivs.spe || 0);
                    if (sumIV > highestSumIV) highestSumIV = sumIV;
                }
            });

            const whiteCandiesClaimed = state.stats.whiteCandies || 0;

            let challengesCompleted = state.stats.completedChallengeIds ?
                (window.getCurrentUnlocks() ? state.stats.completedChallengeIds.filter(id => window.getCurrentUnlocks().some(u => u.areaId === id)).length : state.stats.completedChallengeIds.length)
                : 0;
            let maxChallenges = window.getCurrentUnlocks() ? window.getCurrentUnlocks().length : 45;

            let assignmentsCompleted = 0;
            assignmentsCompleted += (state.stats.qTaskTier || 0);
            assignmentsCompleted += (state.stats.cTaskTier || 0);
            assignmentsCompleted += (state.stats.levelTaskTier || 0);
            assignmentsCompleted += (state.stats.ivTaskTier || 0);
            assignmentsCompleted += (state.stats.shinySeenTaskTier || 0);
            assignmentsCompleted += (state.stats.shinyCaughtTaskTier || 0);
            assignmentsCompleted += (state.stats.finalTaskTier || 0);
            let maxAssignments = (profTasks.q ? profTasks.q.length : 0) +
                                 (profTasks.c ? profTasks.c.length : 0) +
                                 (profTasks.level ? profTasks.level.length : 0) +
                                 (profTasks.iv ? profTasks.iv.length : 0) +
                                 (profTasks.shinySeen ? profTasks.shinySeen.length : 0) +
                                 (profTasks.shinyCaught ? profTasks.shinyCaught.length : 0) +
                                 (profTasks.final ? profTasks.final.length : 0);

            let uniqueShinySpeciesCaught = 0;
            if (state.stats.caughtShiniesSpecies) {
                uniqueShinySpeciesCaught = Object.keys(state.stats.caughtShiniesSpecies).length;
            }

            contentHtml = `
                <div style="position: relative; height: 100%; display: flex; flex-direction: column;">
                    <div style="text-align: left; margin-bottom: 20px;">
                        <div style="display: flex; gap: 40px; justify-content: space-between;">
                            <div style="flex: 1;">
                                <p><b>Time played:</b> ${playtimeStr}</p>
                                <p><b>$</b> ${state.trainer.money.toLocaleString()}</p>
                            </div>
                            <div style="flex: 1;">
                                <p><b>Battles Won:</b> ${(state.stats.battlesWon || 0).toLocaleString()}</p>
                                <p><b>Faints:</b> ${(state.stats.faints || 0).toLocaleString()}</p>
                            </div>
                        </div>
                        <hr style="margin: 10px 0;">
                        <div style="display: flex; gap: 40px; justify-content: space-between;">
                            <div style="flex: 1;">
                                <p><b>Total Pokémon Captured:</b> ${(state.stats.caught || 0).toLocaleString()}</p>
                                <p><b>Species Caught:</b> ${uniqueSpeciesCaught} / ${state.config.pokemonData.filter(p => Number.isInteger(p.id)).length}</p>
                            </div>
                            <div style="flex: 1;">
                                <p><b>Shinies Caught:</b> ${(state.stats.shiniesCaught || 0).toLocaleString()}</p>
                                <p><b>Shiny Species Caught:</b> ${uniqueShinySpeciesCaught} / ${state.config.pokemonData.filter(p => Number.isInteger(p.id)).length}</p>
                            </div>
                        </div>
                        <hr style="margin: 10px 0;">
                        <div style="display: flex; gap: 40px; justify-content: space-between;">
                            <div style="flex: 1;">
                                <p><b>Jigglypuff Grains Used:</b> ${(state.stats.jigglypuffGrainsUsed || 0).toLocaleString()}</p>
                                <p><b>Daily Rewards Collected:</b> ${(state.stats.dailyRewards ? state.stats.dailyRewards.daysClaimed : 0).toLocaleString()}</p>
                                <p><b>Professor Lab Assignments Completed:</b> ${assignmentsCompleted}/${maxAssignments}</p>
                            </div>
                            <div style="flex: 1;">
                                <p><b>White Candies Claimed:</b> ${(whiteCandiesClaimed || 0).toLocaleString()}</p>
                                <p><b>Daily Tokens Earned:</b> ${(state.stats.tokensEarned || 0).toLocaleString()}</p>
                                <p><b>Progress Challenge Completed:</b> ${challengesCompleted}/${maxChallenges}</p>
                            </div>
                        </div>
                        <hr style="margin: 10px 0;">
                        <div style="display: flex; gap: 40px; justify-content: space-between;">
                            <div style="flex: 1;">
                                <p><b>Highest Level on Backpack:</b> ${highestLevel}</p>
                                <p><b>Highest Quality on Backpack:</b> ${highestQuality}</p>
                                <p><b>Highest IV Sum on Backpack:</b> ${highestSumIV}</p>
                            </div>
                            <div style="flex: 1;">
                                <p><b>Highest Level Captured:</b> ${state.stats.highestLevelCaptured || 0}</p>
                                <p><b>Highest Quality Captured:</b> ${state.stats.highestQualityCaptured || 0}</p>
                                <p><b>Highest IV Sum Captured:</b> ${state.stats.highestSumIVCaptured || 0}</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } else if (tab === 'badges') {
            let badgesHtml = '<div style="display: flex; gap: 10px; margin-top: 10px; justify-content: center; flex-wrap: wrap;">';

            // To be consistent with gift mapping, we dynamically map badge icons according to sequential gym unlocks
            for (let i = 0; i < state.trainer.badges; i++) {
                let badgeRegion = 'Kanto';
                let badgeNum = i + 1;

                if (state.config && state.config.gyms) {
                    let currentRegionGyms = 0;
                    for (let j = 0; j <= i; j++) {
                        if (state.config.gyms[j] && state.config.gyms[j].name.includes("Gym")) {
                            currentRegionGyms++;
                        }
                    }

                    let regionIndex = Math.floor((currentRegionGyms - 1) / 8);
                    const regions = ['Kanto', 'Johto', 'Hoenn', 'Sinnoh', 'Unova2', 'Kalos', 'Alola', 'Galar', 'Hisui', 'Paldea'];
                    badgeRegion = regions[regionIndex] || 'Kanto';
                    badgeNum = ((currentRegionGyms - 1) % 8) + 1;
                }

                const badgeFile = window.getBadgeFileName(badgeRegion, badgeNum);
                badgesHtml += `<img src="./Assets/Gym/Badges/${badgeFile}" style="width: 40px; height: 40px;" title="Badge ${i + 1}">`;
            }
            badgesHtml += '</div>';

            contentHtml = `
                <div style="text-align: center; margin-bottom: 20px;">
                    ${badgesHtml}
                </div>
            `;
        } else if (tab === 'catch-rate') {
            const showShiny = options.showShiny || false;
            contentHtml = generateCatchRateHtml(showShiny);
        } else if (tab === 'medals') {
            const regions = ['Kanto', 'Johto', 'Hoenn', 'Sinnoh', 'Unova', 'Kalos', 'Alola', 'Galar', 'Hisui', 'Paldea'];

            let medalsHtml = '<div style="display: grid; grid-template-columns: repeat(2, 1fr); grid-template-rows: repeat(5, 1fr); gap: 10px; padding: 10px; height: 100%; overflow: hidden; box-sizing: border-box;">';

            regions.forEach(region => {
                let caughtCount = 0;
                let shinyCount = 0;
                let totalInRegion = 0;

                // Get the regional stats object safely
                let regionalStats;
                if (region === 'Kanto' && state.currentRegionName === 'Kanto') {
                    // For Kanto, when it is the current region, stats are in state.stats
                    regionalStats = state.stats;
                } else if (region === 'Kanto' && state.regions && state.regions['Kanto']) {
                    regionalStats = state.regions['Kanto'].stats;
                } else {
                    regionalStats = state.regions && state.regions[region] ? state.regions[region].stats : null;
                }

                // fallback to state.stats if currentRegionName matches this region and we don't have it nested
                if (!regionalStats && state.currentRegionName === region) {
                    regionalStats = state.stats;
                }

                if (state.config && state.config.pokemonData) {
                    const regionKey = region.toLowerCase() + '_id';

                    state.config.pokemonData.forEach(p => {
                        if (p[regionKey]) {
                            totalInRegion++;
                            if (regionalStats) {
                                if (regionalStats.caughtSpecies && regionalStats.caughtSpecies[p.name]) {
                                    caughtCount++;
                                }
                                if (regionalStats.caughtShiniesSpecies && regionalStats.caughtShiniesSpecies[p.name]) {
                                    shinyCount++;
                                }
                            }
                        }
                    });
                }

                const hasFirst = caughtCount > 0;
                const hasSecond = totalInRegion > 0 && caughtCount >= totalInRegion;
                const hasThird = totalInRegion > 0 && shinyCount >= totalInRegion;

                medalsHtml += `
                    <div
                        class="medal-item"
                        style="background: rgba(0, 0, 0, 0.2); border-radius: 10px; padding: 10px 15px; border: 1px solid rgba(255, 255, 255, 0.1); display: flex; justify-content: space-around; align-items: center; box-sizing: border-box; transition: all 0.2s ease-in-out; min-height: 0;"
                    >
                        <div style="text-align: center; ${!hasFirst ? 'filter: grayscale(100%) opacity(0.5);' : 'filter: drop-shadow(0 0 5px rgba(255, 215, 0, 0.5));'}">
                            <img src="Assets/Extra/Medals/${region} First.png" alt="${region} First" style="width: 100%; max-width: 64px; max-height: 100%; object-fit: contain; image-rendering: pixelated;" onerror="this.src='Assets/Extra/Medals/Kanto First.png'">
                        </div>
                        <div style="text-align: center; ${!hasSecond ? 'filter: grayscale(100%) opacity(0.5);' : 'filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.8));'}">
                            <img src="Assets/Extra/Medals/${region} Second.png" alt="${region} Second" style="width: 100%; max-width: 64px; max-height: 100%; object-fit: contain; image-rendering: pixelated;" onerror="this.src='Assets/Extra/Medals/Kanto Second.png'">
                        </div>
                        <div style="text-align: center; ${!hasThird ? 'filter: grayscale(100%) opacity(0.5);' : 'filter: drop-shadow(0 0 10px rgba(255, 215, 0, 1));'}">
                            <img src="Assets/Extra/Medals/${region} Third.png" alt="${region} Third" style="width: 100%; max-width: 64px; max-height: 100%; object-fit: contain; image-rendering: pixelated;" onerror="this.src='Assets/Extra/Medals/Kanto Third.png'">
                        </div>
                    </div>
                `;
            });

            medalsHtml += '</div>';

            medalsHtml += `
                <style>
                    .medal-item:hover {
                        background: rgba(255, 255, 255, 0.1) !important;
                        border-color: rgba(255, 255, 255, 0.5) !important;
                        box-shadow: 0 0 15px rgba(255, 255, 255, 0.4);
                    }
                </style>
            `;

            contentHtml = medalsHtml;
        } else if (tab === 'upgrades') {
            contentHtml = '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px; padding: 15px;">';

            if (state.stats.upgrades) {
                const upgradeTypes = [
                    { key: 'ballsTier', configKey: 'ballPocket' },
                    { key: 'potionsTier', configKey: 'potionSatchel' },
                    { key: 'boxTier', configKey: 'pokemonBox' },
                    { key: 'glassTier', configKey: 'glass' },
                    { key: 'smartwatchTier', configKey: 'smartwatch' },
                    { key: 'speedTier', configKey: 'speed' },
                    { key: 'lootTier', configKey: 'loot' },
                    { key: 'daycareTier', configKey: 'daycare' }
                ];

                upgradeTypes.forEach(type => {
                    const tier = state.stats.upgrades[type.key] || 0;
                    if (tier > 0) {
                        // Show the currently purchased tier (index tier - 1)
                        const configItem = state.config.balance.expansions[type.configKey][tier - 1];
                        if (configItem) {
                            const displayName = configItem.displayName || configItem.name;
                            let description = configItem.description || '';
                            if (type.configKey === 'ballPocket') {
                                description = `Ball Stock Capacity: ${getCapacity(state, 'balls')}`;
                            } else if (type.configKey === 'potionSatchel') {
                                description = `Potion Stock Capacity: ${getCapacity(state, 'potions')}`;
                            } else if (type.configKey === 'pokemonBox') {
                                description = `Pokemon Capacity in Backpack: ${getCapacity(state, 'box')}`;
                            } else if (type.configKey === 'speed') {
                                if (tier === 1) description = "Encounter time decreased in 10%";
                                else if (tier === 2) description = "Encounter time decreased in 20%";
                                else if (tier === 3) description = "Encounter time decreased in 30%";
                                else if (tier === 4) description = "Encounter time decreased in 40%";
                                else if (tier >= 5) description = "Encounter time decreased in 50%";
                            } else if (type.configKey === 'glass') {
                                if (tier === 1) description = "Show Healthbar at Main View";
                                else if (tier === 2) description = "Show Healthbar and Damage at Main View";
                                else if (tier === 3) description = "Show Healthbar, Damage and Level at Main View";
                                else if (tier === 4) description = "Show Healthbar, Damage, Level and Quality at Main View";
                                else if (tier >= 5) description = "Show Healthbar, Damage, Level, Quality and SumIV at Main View";
                            } else if (type.configKey === 'loot') {
                                if (tier === 1) description = "Can loot Potion";
                                else if (tier === 2) description = "Can loot Potion and Ball";
                                else if (tier === 3) description = "Can loot Potion, Ball and Stone";
                                else if (tier === 4) description = "Can loot Potion, Ball, Stone and Vitamin";
                            } else if (type.configKey === 'smartwatch') {
                                if (tier === 1) description = "Can Select Ball at Main View";
                                else if (tier === 2) description = "Can Select Ball and potion at Main View";
                                else if (tier >= 3) description = "Can Select Ball and potion at Main View and use smart mode for capture";
                            }

                            contentHtml += `
                                <div style="background: #2c3e50; border: 2px solid #3498db; border-radius: 10px; padding: 15px; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; gap: 10px;">
                                    <div style="font-size: 14px; font-weight: bold; color: white;">${displayName}</div>
                                    <img src="./Assets/Items/Upgrades/${configItem.name}.png" style="width: 50px; height: 50px; object-fit: contain;" alt="${displayName}">
                                    <div style="font-size: 12px; color: #cbd5e1; line-height: 1.3;">${description}</div>
                                </div>
                            `;
                        }
                    }
                });
            }

            contentHtml += '</div>';

            if (contentHtml === '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px; padding: 15px;"></div>') {
                contentHtml = '<div style="text-align: center; padding: 20px; font-style: italic; color: #ccc;">No upgrades purchased yet.</div>';
            }
        }

        showModal(titleHtml, contentHtml, "window-trainer");

        if (tab === 'catch-rate') {
            const win = document.getElementById('window-trainer');
            if (win) {
                const innerContent = win.querySelector('.window-content-container');
                if (innerContent) {
                    innerContent.style.setProperty('padding', '0px', 'important');
                }
            }
        } else {
            const win = document.getElementById('window-trainer');
            if (win) {
                const innerContent = win.querySelector('.window-content-container');
                if (innerContent) {
                    innerContent.style.removeProperty('padding'); // Restore default padding if needed, although modal re-renders often reset it. Wait, if it resets, it's fine.
                }
            }
        }
    };
