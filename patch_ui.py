import re

with open('src/ui.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove 150_challenge from completeChallenge
complete_search = """    if (targetAreaId === '150_challenge') {
        state.stats.completed150Challenge = true;
        if (!state.stats.newRoutes) state.stats.newRoutes = [];
        if (!state.stats.newRoutes.includes("Temporal Sanctuary Spot")) {
            state.stats.newRoutes.push("Temporal Sanctuary Spot");
        }
        state.stats.hasUnseenMap = true;
        updateUI();
        const challengeWin = document.getElementById('window-challenges');
        if (challengeWin && challengeWin.style.display !== 'none') {
            window.showChallengesModal(); // refresh modal
        }
        return;
    }"""
content = content.replace(complete_search, "")

# 2. Remove 150_challenge from cheatProgressChallenge
cheat_search = """    if (targetAreaId === '150_challenge') {
        if (!state.stats.caughtSpecies) state.stats.caughtSpecies = {};
        state.stats.caughtSpeciesCount = state.stats.caughtSpeciesCount || 0;
        for (let i = 0; i < state.config.pokemonData.length; i++) {
             if (state.stats.caughtSpeciesCount >= 150) break;
             let p = state.config.pokemonData[i];
             if (!state.stats.caughtSpecies[p.name]) {
                 state.stats.caughtSpeciesCount++;
                 state.stats.caughtSpecies[p.name] = 1;
             }
        }
        if (window.updateUI) window.updateUI();
        const challengeWinCheat = document.getElementById('window-challenges');
        if (challengeWinCheat && challengeWinCheat.style.display !== 'none') {
            window.showChallengesModal(); // refresh modal
        }
        setTimeout(() => {
            const modal = document.getElementById('window-challenges');
            if (modal) {
                const completeBtns = Array.from(modal.querySelectorAll('button')).filter(btn => btn.innerText.includes('Complete'));
                if (completeBtns.length > 0) {
                    const specificBtn = completeBtns.find(btn => btn.getAttribute('onclick') && btn.getAttribute('onclick').includes('150_challenge'));
                    if (specificBtn) specificBtn.click();
                }
            }
        }, 100);
        return;
    }"""
content = content.replace(cheat_search, "")

# 3. Add completeChallenges and catchSpeciesUniqueCount support to cheatProgressChallenge
cheat_add_search = """        if (req.defeatRed) {
            if (!state.stats.defeatedBosses) state.stats.defeatedBosses = {};
            state.stats.defeatedBosses["Red"] = true;
        }"""
cheat_add_replace = """        if (req.defeatRed) {
            if (!state.stats.defeatedBosses) state.stats.defeatedBosses = {};
            state.stats.defeatedBosses["Red"] = true;
        }
        if (req.completeChallenges) {
            if (!state.stats.completedChallengeIds) state.stats.completedChallengeIds = [];
            for (let c of req.completeChallenges) {
                let match = window.getCurrentUnlocks().find(u => u.challengeName === c || u.areaId === c);
                let idToPush = match ? match.areaId : c;
                if (!state.stats.completedChallengeIds.includes(idToPush)) {
                    state.stats.completedChallengeIds.push(idToPush);
                }
            }
        }
        if (req.catchSpeciesUniqueCount) {
             if (!state.stats.caughtSpecies) state.stats.caughtSpecies = {};
             state.stats.caughtSpeciesCount = state.stats.caughtSpeciesCount || 0;
             for (let i = 0; i < state.config.pokemonData.length; i++) {
                  if (state.stats.caughtSpeciesCount >= req.catchSpeciesUniqueCount) break;
                  let p = state.config.pokemonData[i];
                  if (!state.stats.caughtSpecies[p.name]) {
                      state.stats.caughtSpeciesCount++;
                      state.stats.caughtSpecies[p.name] = 1;
                  }
             }
        }"""
content = content.replace(cheat_add_search, cheat_add_replace)

# 4. Remove UI hardcoded 150_challenge rendering
ui_150_active_search = """    // The 150 Challenge should only appear if the Final Challenge (Pokemon League) has been completed
    let isFinalChallengeCompleted = checkFinalChallengeCompleted(state.currentRegionName);
    let isKanto = !state.currentRegionName || state.currentRegionName === 'Kanto';
    let hasActive150Challenge = isKanto && isFinalChallengeCompleted && !state.stats.completed150Challenge;

    if (activeChallengesCount === 0 && !hasActive150Challenge) {
        html += `<div style="text-align: center; font-size: 16px; color: #aaa;">No active Challenge</div>`;
    }

    if (hasActive150Challenge) {
        let uniqueSpeciesCaught = (state.stats.caughtSpeciesCount || 0);
        let isMet = uniqueSpeciesCaught >= 150;
        let displayName = "The 150 Challenge";
        let rewardsStr = "Mythical and Legendary Spot";
        let cData = {
            isMet: isMet,
            textParts: [`Capture 150 different Pokémons (${uniqueSpeciesCaught}/150)${isMet ? ' <span style="color: #4CAF50;">[Complete]</span>' : ''}`]
        };

        html += `<div style="border: 1px solid #333; padding: 10px; border-radius: 5px; background-color: rgba(255,255,255,0.05);">
                    <div style="color: #ff9800; font-weight: bold; margin-bottom: 5px;">${displayName}</div>`;

        html += `<div style="margin-bottom: 5px;"><b>Requirements:</b></div>
                 <ul style="margin-top: 0; padding-left: 20px;">`;

        for (let part of cData.textParts) {
            html += `<li>${part}</li>`;
        }

        html += `</ul>
                 <div style="margin-top: 10px; color: #4CAF50;"><b>Rewards:</b> Unlocks ${rewardsStr}</div>`;

        let safeAreaId = "150_challenge";

        html += `<div style="text-align: center; margin-top: 15px; display: flex; justify-content: center; gap: 10px;">
                     <button onclick="window.cheatProgressChallenge('${safeAreaId}')" style="padding: 10px 20px; font-size: 16px; font-weight: bold; background-color: orange; color: white; border: none; border-radius: 5px; cursor: pointer;">Cheat Progress</button>`;

        if (cData.isMet) {
             html += `<button onclick="window.completeChallenge('${safeAreaId}')" style="padding: 10px 20px; font-size: 16px; font-weight: bold; background-color: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer;">Complete ✔️</button>`;
        }
        html += `</div></div>`;
    }"""
ui_150_active_replace = """    if (activeChallengesCount === 0) {
        html += `<div style="text-align: center; font-size: 16px; color: #aaa;">No active Challenge</div>`;
    }"""
content = content.replace(ui_150_active_search, ui_150_active_replace)

ui_150_past_search = """    if (isKanto && state.stats.completed150Challenge) completedCount++;

    if (completedCount > 0) {
        let pastTitle = completedCount === 1 ? "Past Challenge" : "Past Challenges";
        html += `<div style="border: 1px solid #555; padding: 10px; border-radius: 5px; background-color: rgba(0,0,0,0.5);">
                    <h3 style="margin-top: 0; margin-bottom: 10px; border-bottom: 1px solid #444; padding-bottom: 5px; font-size: 16px;">${pastTitle}</h3>
                    <div style="display: flex; flex-direction: column; gap: 10px;">`;

        // Render 150 Challenge in Past Challenges if completed
        if (isKanto && state.stats.completed150Challenge) {
            html += `<div style="border: 1px solid #333; padding: 10px; border-radius: 5px; background-color: rgba(255,255,255,0.05);">
                          <div style="color: #ff9800; font-weight: bold; margin-bottom: 5px;">The 150 Challenge</div>
                          <ul style="margin-top: 0; margin-bottom: 5px; padding-left: 20px; font-size: 14px;">
                              <li>Capture 150 different Pokémons (150/150) <span style="color: green;">[Complete]</span></li>
                          </ul>
                          <div style="color: #4CAF50; font-size: 14px;"><b>Rewards:</b> Unlocks Mythical and Legendary Spot</div>
                      </div>`;
        }"""
ui_150_past_replace = """    if (completedCount > 0) {
        let pastTitle = completedCount === 1 ? "Past Challenge" : "Past Challenges";
        html += `<div style="border: 1px solid #555; padding: 10px; border-radius: 5px; background-color: rgba(0,0,0,0.5);">
                    <h3 style="margin-top: 0; margin-bottom: 10px; border-bottom: 1px solid #444; padding-bottom: 5px; font-size: 16px;">${pastTitle}</h3>
                    <div style="display: flex; flex-direction: column; gap: 10px;">`;"""
content = content.replace(ui_150_past_search, ui_150_past_replace)

with open('src/ui.js', 'w', encoding='utf-8') as f:
    f.write(content)
