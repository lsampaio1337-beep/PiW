import { state } from '../state.js';
import { showModal } from '../ui.js';

export const profTasks = {
    q: [
        { req: 50, stat: 'weakPlusCaptures', text: "Capture 50 Weak+ Pokemons", reward: "Low Quality Booster", effect: "+15% Quality Bonus" },
        { req: 100, stat: 'regularPlusCaptures', text: "Capture 100 Regular+ Pokemons", reward: "Regular Quality Booster", effect: "+30% Quality Bonus" },
        { req: 250, stat: 'uncommonPlusCaptures', text: "Capture 250 Uncommon+ Pokemons", reward: "Good Quality Booster", effect: "+45% Quality Bonus" },
        { req: 500, stat: 'rarePlusCaptures', text: "Capture 500 Rare+ Pokemons", reward: "Excellent Quality Booster", effect: "+70% Quality Bonus" },
        { req: 300, stat: 'epicPlusCaptures', text: "Capture 300 Epic+ Pokemons", reward: "Master Quality Booster", effect: "+100% Quality Bonus" }
    ],
    c: [
        { req: 100, text: "Capture 100 Pokemons", reward: "Low Catch Booster", effect: "+5% Catch Rate" },
        { req: 300, text: "Capture 300 Pokemons", reward: "Regular Catch Booster", effect: "+10% Catch Rate" },
        { req: 750, text: "Capture 750 Pokemons", reward: "Good Catch Booster", effect: "+15% Catch Rate" },
        { req: 1500, text: "Capture 1500 Pokemons", reward: "Excellent Catch Booster", effect: "+20% Catch Rate" },
        { req: 3000, text: "Capture 3000 Pokemons", reward: "Master Catch Booster", effect: "+25% Catch Rate" }
    ],
    level: [
        { req: 1000, stat: 'caughtLvl15', text: "Catch 1000 Pokemons with level >= 15", reward: "Low Level Booster", effect: "+50% XP for level < 15" },
        { req: 2500, stat: 'caughtLvl30', text: "Catch 2500 Pokemons with level >= 30", reward: "Regular Level Booster", effect: "+50% XP for level < 30" },
        { req: 5000, stat: 'caughtLvl45', text: "Catch 5000 Pokemons with level >= 45", reward: "Good Level Booster", effect: "+50% XP for level < 45" },
        { req: 10000, stat: 'caughtLvl60', text: "Catch 10000 Pokemons with level >= 60", reward: "Excellent Level Booster", effect: "+50% XP for level < 60" },
        { req: 25000, stat: 'caughtLvl75', text: "Catch 25000 Pokemons with level >= 75", reward: "Master Level Booster", effect: "+50% XP for level < 75" }
    ],
    shinySeen: [
        { req: 1, text: "See 1 Shiny Pokemon", reward: "Regular Shiny Booster", effect: "+1 Shiny Roll" },
        { req: 2, text: "See 2 Shiny Pokemons", reward: "Good Shiny Booster", effect: "+2 Shiny Rolls" },
        { req: 4, text: "See 4 Shiny Pokemons", reward: "Catch Shiny Booster", effect: "2x Catch Rate on Shinies" }
    ],
    shinyCaught: [
        { req: 1, text: "Catch 1 Shiny Pokemon", reward: "Shiny IV Booster", effect: "+25% IVs for Shinies" }
    ],
    iv: [
        { req: 50, stat: 'caughtIVUnder300', text: "Catch 50 Pokemons with IV < 300", reward: "Low IV Booster", effect: "+5% IVs" },
        { req: 200, stat: 'caughtIVUnder350', text: "Catch 200 Pokemons with IV < 350", reward: "Regular IV Booster", effect: "+10% IVs" },
        { req: 500, stat: 'caughtIVUnder400', text: "Catch 500 Pokemons with IV < 400", reward: "Good IV Booster", effect: "+15% IVs" },
        { req: 1000, stat: 'caughtIVUnder450', text: "Catch 1000 Pokemons with IV < 450", reward: "Excellent IV Booster", effect: "+20% IVs" },
        { req: 2000, stat: 'caughtIVUnder500', text: "Catch 2000 Pokemons with IV < 500", reward: "Master IV Booster", effect: "+25% IVs" }
    ],
    final: [
        { req: 151, text: "Capture 151 Pokemon species", reward: "Final Shiny Booster", effect: "12x Shiny Rolls" }
    ]
};

export function getProfTaskAvailableCount() {
    let count = 0;

    // Quality
    let qTier = state.stats.qTaskTier || 0;
    if (qTier < profTasks.q.length) {
        if ((state.stats[profTasks.q[qTier].stat] || 0) >= profTasks.q[qTier].req) count++;
    }

    // Catch
    let cTier = state.stats.cTaskTier || 0;
    if (cTier < profTasks.c.length) {
        if ((state.stats.caught || 0) >= profTasks.c[cTier].req) count++;
    }

    // IV
    let ivTier = state.stats.ivTaskTier || 0;
    if (ivTier < profTasks.iv.length) {
        if ((state.stats[profTasks.iv[ivTier].stat] || 0) >= profTasks.iv[ivTier].req) count++;
    }

    // Level
    let levelTier = state.stats.levelTaskTier || 0;
    if (levelTier < profTasks.level.length) {
        if ((state.stats[profTasks.level[levelTier].stat] || 0) >= profTasks.level[levelTier].req) count++;
    }

    // Shiny Seen
    let seenTier = state.stats.shinySeenTaskTier || 0;
    if (seenTier < profTasks.shinySeen.length) {
        if ((state.stats.shiniesSeen || 0) >= profTasks.shinySeen[seenTier].req) count++;
    }

    // Shiny Caught
    let caughtTier = state.stats.shinyCaughtTaskTier || 0;
    if (caughtTier < profTasks.shinyCaught.length) {
        if ((state.stats.shiniesCaught || 0) >= profTasks.shinyCaught[caughtTier].req) count++;
    }

    // Final
    let finalTier = state.stats.finalTaskTier || 0;
    if (finalTier < profTasks.final.length) {
        let currentSpeciesCount = (state.stats.caughtSpeciesCount || 0);
        let totalSpecies = state.config.pokemonData.filter(p => Number.isInteger(p.id)).length;
        if (currentSpeciesCount >= totalSpecies) count++;
    }

    return count;
}

export function claimProfTaskReward(type) {
    if (type === 'q') state.stats.qTaskTier = (state.stats.qTaskTier || 0) + 1;
    if (type === 'c') state.stats.cTaskTier = (state.stats.cTaskTier || 0) + 1;
    if (type === 'level') state.stats.levelTaskTier = (state.stats.levelTaskTier || 0) + 1;
    if (type === 'shinySeen') state.stats.shinySeenTaskTier = (state.stats.shinySeenTaskTier || 0) + 1;
    if (type === 'shinyCaught') state.stats.shinyCaughtTaskTier = (state.stats.shinyCaughtTaskTier || 0) + 1;
    if (type === 'iv') state.stats.ivTaskTier = (state.stats.ivTaskTier || 0) + 1;
    if (type === 'final') state.stats.finalTaskTier = (state.stats.finalTaskTier || 0) + 1;
    showProfLabModal();
}

export function cheatCompleteProfTask(type) {
    let tier = 0;
    let statName = "";
    if (type === 'q') {
        tier = state.stats.qTaskTier || 0;
        if (tier < profTasks.q.length) {
            statName = profTasks.q[tier].stat;
            state.stats[statName] = Math.max(state.stats[statName] || 0, profTasks.q[tier].req);
        }
    }
    if (type === 'c') {
        tier = state.stats.cTaskTier || 0;
        if (tier < profTasks.c.length) state.stats.caught = Math.max(state.stats.caught || 0, profTasks.c[tier].req);
    }
    if (type === 'shinySeen') {
        tier = state.stats.shinySeenTaskTier || 0;
        if (tier < profTasks.shinySeen.length) state.stats.shiniesSeen = Math.max(state.stats.shiniesSeen || 0, profTasks.shinySeen[tier].req);
    }
    if (type === 'shinyCaught') {
        tier = state.stats.shinyCaughtTaskTier || 0;
        if (tier < profTasks.shinyCaught.length) state.stats.shiniesCaught = Math.max(state.stats.shiniesCaught || 0, profTasks.shinyCaught[tier].req);
    }
    if (type === 'level') {
        tier = state.stats.levelTaskTier || 0;
        if (tier < profTasks.level.length) {
            statName = profTasks.level[tier].stat;
            state.stats[statName] = Math.max(state.stats[statName] || 0, profTasks.level[tier].req);
        }
    }
    if (type === 'iv') {
        tier = state.stats.ivTaskTier || 0;
        if (tier < profTasks.iv.length) {
            statName = profTasks.iv[tier].stat;
            state.stats[statName] = Math.max(state.stats[statName] || 0, profTasks.iv[tier].req);
        }
    }
    if (type === 'final') {
        if (!state.stats.caughtSpecies) state.stats.caughtSpecies = {};
        const caught = state.stats.caughtSpecies;
        const names = state.config.allPokemonNames || state.config.pokemonData.map(p => p.name);

        const caughtCount = Object.keys(caught).length;

        if (caughtCount < names.length) {
            for (let i = 0, len = names.length; i < len; i++) {
                const name = names[i];
                if (caught[name] === undefined) caught[name] = 1;
            }
        }
    }
    showProfLabModal();
}

export function showProfLabModal() {
    if (state.stats.showProfLobbyNotification) {
        state.stats.showProfLobbyNotification = false;
        renderProfessorLab(); // Clear the notification from the lobby button
    }

    let html = `<div class="content-panel" style="display:flex; flex-direction:column; gap:15px; text-align:left; height: 100%; overflow-y: auto;">`;

    const renderActiveTask = (type, currentVal, tierIdx, taskList) => {
        if (tierIdx >= taskList.length) {
            return ``;
        }

        let task = taskList[tierIdx];
        let isComplete = currentVal >= task.req;

        let barHtml = "";
        if (isComplete) {
            barHtml = `
                <div onclick="window.claimProfTaskReward('${type}')" style="width: 100%; box-sizing: border-box; background-color: #4CAF50; border-radius: 4px; padding: 5px; text-align: center; cursor: pointer; color: white; font-weight: bold; margin-top: 5px;">
                    ${task.reward}
                </div>
            `;
        } else {
            let pct = Math.min(100, Math.floor((currentVal / task.req) * 100));
            barHtml = `
                <div style="width: 100%; background-color: #333; border-radius: 4px; overflow: hidden; height: 20px; border: 1px solid #555; position: relative; margin-top: 5px; display: flex; align-items: center;">
                    <div style="width: ${pct}%; background-color: #4CAF50; height: 100%;"></div>
                    <span style="position: absolute; width: 100%; text-align: center; color: white; font-size: 9px; font-weight: bold; line-height: 20px;">
                        ${currentVal} / ${task.req}
                    </span>
                </div>
            `;
        }

        return `
            <div style="margin-bottom: 10px; font-size: 12px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span>${task.text}</span>
                    <button onclick="window.cheatCompleteProfTask('${type}')" style="padding: 2px 5px; font-size: 8px; cursor: pointer; background: #d9534f; color: white; border: none; border-radius: 3px;">Cheat Complete</button>
                </div>
                ${barHtml}
            </div>
        `;
    };

    const renderCard = (title, type, currentVal, tierIdx, taskList, keepAllRewards) => {
        if (tierIdx >= taskList.length) {
            title = title.replace("Assignment", "Reward");
        }
        let taskHtml = renderActiveTask(type, currentVal, tierIdx, taskList);

        let rewardsHtml = "";
        if (tierIdx > 0) {
            if (keepAllRewards) {
                // Shiny style - keep all
                for (let i = 0; i < tierIdx; i++) {
                    rewardsHtml += `
                        <div style="font-size: 9px; margin-top: 5px; padding-left: 5px; border-left: 2px solid #4CAF50;">
                            <b>${taskList[i].reward}</b>: <span style="color: #4CAF50;">${taskList[i].effect}</span>
                        </div>
                    `;
                }
            } else {
                // Normal style - only show highest tier
                let topReward = taskList[tierIdx - 1];
                rewardsHtml += `
                    <div style="font-size: 9px; margin-top: 5px; padding-left: 5px; border-left: 2px solid #4CAF50;">
                        <b>${topReward.reward}</b>: <span style="color: #4CAF50;">${topReward.effect}</span>
                    </div>
                `;
            }
        }

        return `
            <div style="border: 1px solid #555; padding: 8px; border-radius: 5px; background-color: rgba(0,0,0,0.5);">
                <h3 style="margin-top: 0; margin-bottom: 10px; border-bottom: 1px solid #444; padding-bottom: 5px; font-size: 12px;">${title}</h3>
                ${taskHtml}
                ${rewardsHtml}
            </div>
        `;
    };

    // Quality Card
    let qTier = state.stats.qTaskTier || 0;
    let qCurrentVal = 0;
    if (qTier < profTasks.q.length) {
        qCurrentVal = state.stats[profTasks.q[qTier].stat] || 0;
    } else if (profTasks.q.length > 0) {
        qCurrentVal = state.stats[profTasks.q[profTasks.q.length - 1].stat] || 0;
    }
    html += renderCard("Quality Assignment", 'q', qCurrentVal, qTier, profTasks.q, false);

    // Catch Card
    html += renderCard("Catch Assignment", 'c', state.stats.caught || 0, state.stats.cTaskTier || 0, profTasks.c, false);

    // IV Card
    let ivTier = state.stats.ivTaskTier || 0;
    let ivCurrentVal = 0;
    if (ivTier < profTasks.iv.length) {
        ivCurrentVal = state.stats[profTasks.iv[ivTier].stat] || 0;
    } else if (profTasks.iv.length > 0) {
        ivCurrentVal = state.stats[profTasks.iv[profTasks.iv.length - 1].stat] || 0; // fallback if completed
    }
    html += renderCard("IV Assignment", 'iv', ivCurrentVal, ivTier, profTasks.iv, false);

    // Level Card
    let levelTier = state.stats.levelTaskTier || 0;
    let levelCurrentVal = 0;
    if (levelTier < profTasks.level.length) {
        levelCurrentVal = state.stats[profTasks.level[levelTier].stat] || 0;
    } else if (profTasks.level.length > 0) {
        levelCurrentVal = state.stats[profTasks.level[profTasks.level.length - 1].stat] || 0; // fallback if completed
    }
    html += renderCard("Level Assignment", 'level', levelCurrentVal, levelTier, profTasks.level, true);

    // Shiny Card (Combined seen and caught, keeps all rewards but obsolete regular seen shiny is removed by good shiny)
    let seenTier = state.stats.shinySeenTaskTier || 0;
    let caughtTier = state.stats.shinyCaughtTaskTier || 0;

    let shinySeenTaskHtml = renderActiveTask('shinySeen', state.stats.shiniesSeen || 0, seenTier, profTasks.shinySeen);
    let shinyCaughtTaskHtml = renderActiveTask('shinyCaught', state.stats.shiniesCaught || 0, caughtTier, profTasks.shinyCaught);

    let shinyTitle = "Shiny Assignment";

    // Only show "Assignment: Completed" once if both are done
    if (seenTier >= profTasks.shinySeen.length && caughtTier >= profTasks.shinyCaught.length) {
        shinyTitle = "Shiny Reward";
        shinySeenTaskHtml = "";
        shinyCaughtTaskHtml = "";
    } else {
        // If one is complete but not the other, we don't want duplicate "Assignment: Completed" texts
        // rendering their own individual completions. Since we only want a single "Completed" when BOTH are done,
        // we strip out the individual "Assignment: Completed" if it exists.
        if (seenTier >= profTasks.shinySeen.length) shinySeenTaskHtml = "";
        if (caughtTier >= profTasks.shinyCaught.length) shinyCaughtTaskHtml = "";
    }

    let shinyRewardsHtml = "";

    // Shiny Seen rewards logic (Good Shiny replaces Regular Shiny)
    for (let i = 0; i < seenTier; i++) {
        let rewardName = profTasks.shinySeen[i].reward;
        // If Good Shiny (tier index 1) is unlocked, we skip Regular Shiny (tier index 0)
        if (seenTier > 1 && i === 0) continue;

        shinyRewardsHtml += `
            <div style="font-size: 9px; margin-top: 5px; padding-left: 5px; border-left: 2px solid #4CAF50;">
                <b>${rewardName}</b>: <span style="color: #4CAF50;">${profTasks.shinySeen[i].effect}</span>
            </div>
        `;
    }

    // Shiny Caught rewards logic
    for (let i = 0; i < caughtTier; i++) {
        shinyRewardsHtml += `
            <div style="font-size: 9px; margin-top: 5px; padding-left: 5px; border-left: 2px solid #4CAF50;">
                <b>${profTasks.shinyCaught[i].reward}</b>: <span style="color: #4CAF50;">${profTasks.shinyCaught[i].effect}</span>
            </div>
        `;
    }

    html += `
        <div style="border: 1px solid #555; padding: 8px; border-radius: 5px; background-color: rgba(0,0,0,0.5);">
            <h3 style="margin-top: 0; margin-bottom: 10px; border-bottom: 1px solid #444; padding-bottom: 5px; font-size: 12px;">${shinyTitle}</h3>
            ${shinySeenTaskHtml}
            ${shinyCaughtTaskHtml}
            ${shinyRewardsHtml}
        </div>
    `;

    // Final Card
    let finalTier = state.stats.finalTaskTier || 0;
    let finalCurrentVal = (state.stats.caughtSpeciesCount || 0);
    if (finalTier >= profTasks.final.length && profTasks.final.length > 0) {
        finalCurrentVal = state.config.pokemonData.filter(p => Number.isInteger(p.id)).length;
    }
    // Update req dynamically if it differs (for example, if new Pokemon are added)
    if (profTasks.final.length > 0) {
        profTasks.final[0].req = state.config.pokemonData.filter(p => Number.isInteger(p.id)).length;
        profTasks.final[0].text = `Capture ${state.config.pokemonData.filter(p => Number.isInteger(p.id)).length} Pokemon species`;
    }
    html += renderCard("Final Assignment", 'final', finalCurrentVal, finalTier, profTasks.final, true);

    html += `</div>`;

    const overlay = document.getElementById('main-view-inner-modal-overlay');
    const title = document.getElementById('main-view-inner-modal-title');
    const content = document.getElementById('main-view-inner-modal-content');
    if (overlay && title && content) {
        title.innerText = "Assignments and Boosters";
        if (window.windowManager) {
            window.windowManager._parseAndSanitizeToElement(html, content);
        } else {
            content.innerHTML = html;
        }

        // Dynamically style the inner modal for Professor Lab to 70% width and proportional scale
        const innerModal = document.getElementById('main-view-inner-modal');
        if (innerModal) {
            innerModal.classList.add('prof-lab-inner-modal');
        }

        // Ensure cleanup when the modal is closed
        const cleanUp = () => {
            if (innerModal) {
                innerModal.classList.remove('prof-lab-inner-modal');
            }
            overlay.style.display = 'none';
        };

        const closeBtn = overlay.querySelector('.window-header span');
        if (closeBtn) {
            closeBtn.onclick = cleanUp;
        }
        overlay.onclick = (e) => {
            if (e.target === overlay) {
                cleanUp();
            }
        };

        overlay.style.display = 'flex';
    } else {
        showModal("Assignments and Boosters", html, "window-tasks");
        const winTasks = document.getElementById("window-tasks");
        if (winTasks) {
            winTasks.style.maxHeight = '800px';
        }
        if (window.windowManager) window.windowManager.recalculateWindowSize('window-tasks');
    }
}

function renderProfessorSprite(currentRegion) {
    const labConfigs = {
        'Kanto': { sprite: "1_Kanto_Professor_Oak.png", position: { rel_x: 0.5861, rel_y: 0.016, px_width: 595, px_height: 1326 } },
        'Johto': { sprite: "2_Johto_Professor_Elm.png", position: { rel_x: 0.5628, rel_y: 0.037, px_width: 624, px_height: 1256 } },
        'Hoenn': { sprite: "3_Hoenn_Professor_Birch.png", position: { rel_x: 0.4272, rel_y: 0.0395, px_width: 1000, px_height: 948 } },
        'Sinnoh': { sprite: "4_Sinnoh_Professor_Rowan.png", position: { rel_x: 0.5881, rel_y: 0.0415, px_width: 452, px_height: 957 } },
        'Unova': { sprite: "5_Unova_Professor_Juniper.png", position: { rel_x: 0.6294, rel_y: 0.019, px_width: 526, px_height: 1280 } },
        'Kalos': { sprite: "6_Kalos_Professor_Sycamore.png", position: { rel_x: 0.4889, rel_y: 0.053, px_width: 873, px_height: 1371 } },
        'Alola': { sprite: "7_Alola_Professor_Kukui.png", position: { rel_x: 0.5853, rel_y: 0.046, px_width: 597, px_height: 1415 } },
        'Galar': { sprite: "8_Galar_Professor_Magnolia.png", position: { rel_x: 0.6311, rel_y: 0.035, px_width: 458, px_height: 1264 } },
        'Hisui': { sprite: "9_Hisui_Professor_Laventon.png", position: { rel_x: 0.5833, rel_y: 0.02, px_width: 612, px_height: 1367 } },
        'Paldea': { sprite: "10_Paldea_Turo.png", position: { rel_x: 0.5872, rel_y: 0.042, px_width: 475, px_height: 1184 } }
    };

    const config = labConfigs[currentRegion] || labConfigs['Kanto'];
    const profSprite = `./Assets/Lab/${config.sprite}`;

    const profImg = document.getElementById("prof-generic-sprite");
    if (profImg) {
        profImg.src = profSprite;
        profImg.style.left = `${config.position.rel_x * 100}%`;
        profImg.style.top = `${config.position.rel_y * 100}%`;
        profImg.style.width = `${(config.position.px_width / 1800) * 100}%`;
        profImg.style.height = `${(config.position.px_height / 1000) * 100}%`;
    }
}

function renderStarterSelection(currentRegion, labContent) {
    const regionStarters = {
        'Kanto': [1, 4, 7],
        'Johto': [152, 155, 158],
        'Hoenn': [252, 255, 258],
        'Sinnoh': [387, 390, 393],
        'Unova': [495, 498, 501]
    };
    const starterIds = regionStarters[currentRegion] || regionStarters['Kanto'];

    let containerDiv = document.createElement('div');
    containerDiv.style.backgroundColor = 'rgba(0,0,0,0.8)';
    containerDiv.style.position = 'absolute';
    containerDiv.style.left = '15%';
    containerDiv.style.top = '50%';
    containerDiv.style.transform = 'translateY(-50%)';
    containerDiv.style.padding = '30px';
    containerDiv.style.borderRadius = '8px';

    let h2 = document.createElement('h2');
    h2.textContent = 'Choose your Starter Pokémon';
    containerDiv.appendChild(h2);

    let starterChoices = document.createElement('div');
    starterChoices.className = 'starter-choices';

    starterIds.forEach(id => {
        const p = state.config.pokemonData.find(p => p.id === id);
        const name = p ? p.name : 'Unknown';
        const paddedId = id.toString().padStart(4, '0');
        const spriteSrc = `Assets/Pokemon Sprites/Natural/Gen5/${paddedId}_${name}.png`;

        const btn = document.createElement('button');
        btn.onclick = () => window.selectStarter(id);

        const img = document.createElement('img');
        img.src = spriteSrc;
        img.style.width = '80px';
        img.style.height = '80px';

        const br = document.createElement('br');

        const textNode = document.createTextNode(name);

        btn.appendChild(img);
        btn.appendChild(br);
        btn.appendChild(textNode);
        starterChoices.appendChild(btn);
    });

    containerDiv.appendChild(starterChoices);
    labContent.replaceChildren(containerDiv);
}

function renderAssignmentsAndBoosters(labContent) {
    let containerDiv = document.createElement('div');
    containerDiv.style.backgroundColor = 'rgba(0,0,0,0.85)';
    containerDiv.style.position = 'absolute';
    containerDiv.style.left = '15%';
    containerDiv.style.top = '50%';
    containerDiv.style.transform = 'translateY(-50%)';
    containerDiv.style.padding = '20px';
    containerDiv.style.borderRadius = '8px';
    containerDiv.style.width = '250px';
    containerDiv.style.color = 'white';
    containerDiv.style.textAlign = 'center';

    let h2 = document.createElement('h2');
    h2.style.marginTop = '0';
    h2.textContent = 'Professor Lab';
    containerDiv.appendChild(h2);

    let flexDiv = document.createElement('div');
    flexDiv.style.display = 'flex';
    flexDiv.style.flexDirection = 'column';
    flexDiv.style.gap = '10px';

    let innerDiv = document.createElement('div');
    innerDiv.style.position = 'relative';
    innerDiv.style.display = 'inline-block';
    innerDiv.style.width = '100%';

    let btn = document.createElement('button');
    btn.onclick = () => window.showProfLabModal();
    btn.className = 'action-btn action-btn-primary';
    btn.style.width = '100%';
    btn.textContent = 'Assignments and Boosters';
    innerDiv.appendChild(btn);

    if (state.stats.showProfLobbyNotification) {
        let img = document.createElement('img');
        img.src = 'Assets/Extra/Icons/ExclamationMark.png';
        img.style.position = 'absolute';
        img.style.top = '-5px';
        img.style.right = '-5px';
        img.style.width = '20px';
        img.style.height = 'auto';
        img.style.pointerEvents = 'none';
        img.style.zIndex = '10';
        innerDiv.appendChild(img);
    }

    flexDiv.appendChild(innerDiv);
    containerDiv.appendChild(flexDiv);

    labContent.replaceChildren(containerDiv);
}

export function renderProfessorLab() {
    const labContent = document.getElementById("generic-lab-content");
    const labView = document.getElementById("view-professor-lab");
    if (!labContent || !labView) return;

    if (state.stats.showProfMarkerPulse) {
        state.stats.showProfMarkerPulse = false;
    }

    let currentRegion = window.currentMapRegion || 'Kanto';

    renderProfessorSprite(currentRegion);

    if (!state.stats.hasPickedStarter) {
        renderStarterSelection(currentRegion, labContent);
    } else {
        renderAssignmentsAndBoosters(labContent);
    }
}
