
import { state, globals } from '../state.js';
import { startGame, returnToLab, loadConfigs, getCurrentUnlocks } from '../ui.js';

export function setupSaveManager(storage, startNewGame, splashScreen, saveManagerModal, profilesContainer) {
    const profiles = storage.getProfiles();
    // Filter corrupted/empty profiles and map them to their data
    let validProfiles = profiles
        .map(id => ({ id, data: storage.getProfileData(id) }))
        .filter(p => p.data !== null);

    // Sort descending by lastPlayed so newest is always on top
    validProfiles.sort((a, b) => {
        const timeA = a.data.lastPlayed || 0;
        const timeB = b.data.lastPlayed || 0;
        return timeB - timeA;
    });

    if (validProfiles.length > 0 && saveManagerModal && splashScreen) {
        splashScreen.style.display = 'flex';
        if (saveManagerModal) saveManagerModal.style.display = 'flex';

        profilesContainer.innerHTML = ''; // clear

        let profileAction = 'load';

        // Variables to hold pending rename state
        let pendingRenameId = null;
        let pendingRenameData = null;

        const renameModal = document.getElementById('rename-modal');
        const renameInput = document.getElementById('rename-input');
        const btnRenameSave = document.getElementById('btn-rename-save');
        const btnRenameCancel = document.getElementById('btn-rename-cancel');

        if (btnRenameSave) {
            btnRenameSave.onclick = () => {
                if (pendingRenameId && pendingRenameData && renameInput.value.trim() !== "") {
                    pendingRenameData.profileName = renameInput.value.trim();
                    window.localStorage.setItem(pendingRenameId, JSON.stringify(pendingRenameData));
                    window.location.reload();
                }
            };
        }

        if (btnRenameCancel) {
            btnRenameCancel.onclick = () => {
                if (renameModal) renameModal.style.display = 'none';
                pendingRenameId = null;
                pendingRenameData = null;
                profileAction = 'load';
                updateHeader();
            };
        }

        const updateHeader = () => {
            const h2 = document.getElementById('save-action-title');
            if (h2) {
                if (profileAction === 'rename') {
                    h2.innerHTML = "Select a game to <span style='color: #3498db;'>rename.</span>";
                    h2.style.display = 'block';
                } else if (profileAction === 'delete') {
                    h2.innerHTML = "Select a game to <span style='color: #f44336;'>delete.</span>";
                    h2.style.display = 'block';
                } else {
                    h2.innerHTML = "";
                    h2.style.display = 'none';
                }
            }
        };

        validProfiles.forEach((profileObj, index) => {
            const profileId = profileObj.id;
            const pData = profileObj.data;

            // Format playtime
            let playtimeStr = "0h 0m 0s";
            let totalSec = 0;
            if (pData.globalStats && pData.globalStats.playtime !== undefined) {
                totalSec = pData.globalStats.playtime;
            } else if (pData.stats && pData.stats.playtime !== undefined) {
                totalSec = pData.stats.playtime;
            }

            if (totalSec > 0) {
                const h = Math.floor(totalSec / 3600);
                const m = Math.floor((totalSec % 3600) / 60);
                const s = totalSec % 60;
                playtimeStr = `${h}h ${m}m ${s}s`;
            }

            // Format last played explicitly as dd/mm/yyyy hh:mm am/pm
            let lastPlayedStr = "Unknown";
            if (pData.lastPlayed) {
                const lpDate = new Date(pData.lastPlayed);
                const dd = String(lpDate.getDate()).padStart(2, '0');
                const mm = String(lpDate.getMonth() + 1).padStart(2, '0');
                const yyyy = lpDate.getFullYear();

                let hours = lpDate.getHours();
                const minutes = String(lpDate.getMinutes()).padStart(2, '0');
                const ampm = hours >= 12 ? 'pm' : 'am';
                hours = hours % 12;
                hours = hours ? hours : 12; // the hour '0' should be '12'
                const strTime = `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;

                lastPlayedStr = `${dd}/${mm}/${yyyy} ${strTime}`;
            }

            // Get profile name
            const profileName = pData.profileName || `Profile ${index + 1}`;

            // Get last route unlocked
            let lastRoute = "None";
            if (pData.stats && pData.stats.completedChallenges !== undefined && window.getCurrentUnlocks()) {
                const unlocksLength = window.getCurrentUnlocks().length;
                let cIndex = pData.stats.completedChallenges;
                // Cap to max
                if (cIndex > unlocksLength) cIndex = unlocksLength;

                // Get the reward from the LAST completed challenge
                if (cIndex > 0) {
                    let pUnlock = window.getCurrentUnlocks()[cIndex - 1];
                    lastRoute = pUnlock.unlocks ? pUnlock.unlocks.join(" + ") : "Next Area";
                }
            }

            let zzzText = pData.isZzZMode ? ` - ZzZ: ${pData.currentRoute || 'Unknown Route'}` : '';

            const btn = document.createElement('button');
            btn.style.padding = "10px";
            btn.style.fontSize = "16px";
            btn.style.cursor = "pointer";
            btn.style.backgroundColor = "#FFC107"; // Big Yellow Button
            btn.style.color = "black";
            btn.style.border = "4px solid black";
            btn.style.borderRadius = "5px";
            btn.style.textAlign = "left";
            btn.style.fontWeight = "bold";
            btn.style.width = "75%";
            btn.style.margin = "0 auto";
            btn.style.display = "flex";
            btn.style.justifyContent = "space-between";
            btn.style.alignItems = "center";

            const innerDiv = document.createElement('div');
            innerDiv.style.flexGrow = "1";
            innerDiv.style.display = "flex";
            innerDiv.style.flexDirection = "column";
            innerDiv.style.justifyContent = "center";

            const titleDiv = document.createElement('div');
            titleDiv.style.fontSize = "18px";
            titleDiv.style.marginBottom = "5px";
            titleDiv.style.fontWeight = "bold";
            titleDiv.style.display = "flex";
            titleDiv.style.alignItems = "center";
            titleDiv.textContent = `"${profileName}" - ${playtimeStr}`;

            const playedDiv = document.createElement('div');
            playedDiv.style.fontSize = "14px";
            playedDiv.style.fontWeight = "normal";
            playedDiv.textContent = `Last Played: ${lastPlayedStr}`;

            const progressDiv = document.createElement('div');
            progressDiv.style.fontSize = "14px";
            progressDiv.style.fontWeight = "normal";
            progressDiv.textContent = `Progress: ${lastRoute}${zzzText}`;

            innerDiv.appendChild(titleDiv);
            innerDiv.appendChild(playedDiv);
            innerDiv.appendChild(progressDiv);

            btn.appendChild(innerDiv);

            if (pData.isZzZMode) {
                const sleepImg = document.createElement('img');
                sleepImg.src = "Assets/Extra/Icons/IconSleep.png";
                sleepImg.style.height = "100%";
                sleepImg.style.maxHeight = "60px";
                sleepImg.style.marginLeft = "10px";
                sleepImg.title = "ZzZ Mode Active";
                btn.appendChild(sleepImg);
            }

            btn.onclick = async () => {
                if (profileAction === 'rename') {
                    if (renameModal && renameInput) {
                        pendingRenameId = profileId;
                        pendingRenameData = pData;
                        renameInput.value = profileName;
                        renameModal.style.display = 'flex';
                    }
                } else if (profileAction === 'delete') {
                    if (confirm(`Are you sure you want to delete "${profileName}"? This cannot be undone.`)) {
                        storage.deleteProfile(profileId);
                        window.location.reload();
                    }
                    profileAction = 'load';
                    updateHeader();
                } else {
                    // Load Action
                    splashScreen.style.display = 'none';
                    window.windowManager.toggleWindow('save-manager-modal', false);
                    window.windowManager.toggleWindow('main-control-window', true);
                    window.windowManager.toggleWindow('party-window', true);
                    window.windowManager.toggleWindow('main-view-window', true);

                    storage.setCurrentProfile(profileId);

                    // Perform a deep merge to preserve nested object structures (like stats, backpack)
                    const deepMerge = (target, source) => {
                        if (typeof source !== 'object' || source === null) return source;
                        if (Array.isArray(source)) return source;
                        for (const key of Object.keys(source)) {
                            if (key === '__proto__' || key === 'constructor' || key === 'prototype') continue;
                            if (source[key] instanceof Object && !Array.isArray(source[key])) {
                                if (!target[key]) target[key] = {};
                                deepMerge(target[key], source[key]);
                            } else {
                                target[key] = source[key];
                            }
                        }
                        return target;
                    };
                    deepMerge(state, pData);

                    // Initialize caughtSpeciesCount for older saves
                    if (state.stats && state.stats.caughtSpecies) {
                        state.stats.caughtSpeciesCount = Object.keys(state.stats.caughtSpecies).length;
                    } else if (state.stats) {
                        state.stats.caughtSpeciesCount = 0;
                    }

                    // Migrate old save data to new globalStats structure
                    if (pData.stats) {
                        if (pData.stats.playtime !== undefined) state.globalStats.playtime = pData.stats.playtime;
                        if (pData.stats.hasSeenProfTutorial !== undefined) state.globalStats.hasSeenProfTutorial = pData.stats.hasSeenProfTutorial;
                        if (pData.stats.hasSeenZzZTutorial !== undefined) state.globalStats.hasSeenZzZTutorial = pData.stats.hasSeenZzZTutorial;
                        if (pData.stats.hasSeenMultiplayerIcon !== undefined) state.globalStats.hasSeenMultiplayerIcon = pData.stats.hasSeenMultiplayerIcon;
                        if (pData.stats.hasSeenGiftIcon !== undefined) state.globalStats.hasSeenGiftIcon = pData.stats.hasSeenGiftIcon;
                        if (pData.stats.hasSeenJohtoMap !== undefined) state.globalStats.hasSeenJohtoMap = pData.stats.hasSeenJohtoMap;
                        if (pData.stats.hasSeenDaycare !== undefined) state.globalStats.hasSeenDaycare = pData.stats.hasSeenDaycare;
                        if (pData.stats.hasSeenBonusCandyModal !== undefined) state.globalStats.hasSeenBonusCandyModal = pData.stats.hasSeenBonusCandyModal;
                    }


                    if (!state.currentRegionName) {
                        state.currentRegionName = 'Kanto';
                    }
                    if (!state.regions) {
                        state.regions = {};
                    }

                    // Fallback for older saves
                    if (state.settings.autoPotionThreshold === undefined) {
                        state.settings.autoPotionThreshold = 25;
                    }

                    // Handle backwards compatibility for challenges
                    if (state.stats.completedChallenges !== undefined && (!state.stats.completedChallengeIds || state.stats.completedChallengeIds.length === 0)) {
                        state.stats.completedChallengeIds = [];
                        state.stats.activeChallenges = ["Route 1"];

                        // Wait for configs to be available to build the list
                        // We will do this right after loadConfigs
                    }

                    await loadConfigs();

                    // Complete challenge arrays mapping for older saves
                    if (state.stats.completedChallenges > 0 && state.stats.completedChallengeIds && state.stats.completedChallengeIds.length === 0) {
                        if (window.getCurrentUnlocks()) {
                            let maxIndex = Math.min(state.stats.completedChallenges, window.getCurrentUnlocks().length);
                            for (let i = 0; i < maxIndex; i++) {
                                let unlock = window.getCurrentUnlocks()[i];
                                state.stats.completedChallengeIds.push(unlock.areaId);

                                // Emulate the unlock logic to find the active challenges at that point
                                state.stats.activeChallenges = state.stats.activeChallenges.filter(id => id !== unlock.areaId);
                                if (unlock.unlocks) {
                                    for (let newRoute of unlock.unlocks) {
                                        if (!state.stats.activeChallenges.includes(newRoute)) {
                                            state.stats.activeChallenges.push(newRoute);
                                        }
                                    }
                                }
                            }
                        }
                    }
                    if (!state.stats.activeChallenges) state.stats.activeChallenges = ["Route 1"];
                    if (!state.stats.completedChallengeIds) state.stats.completedChallengeIds = [];

                    startGame();

                    if (state.isZzZMode) {
                        // For a clean load into sleep mode we don't start at lab. We just wait for wakeup.
                        if (globals.battleSystem) globals.battleSystem.stop();

                        window.updateZzZModeUI();

                        // Close existing windows except main-control, which should be updated.
                        if (window.windowManager) {
                            const winsToClose = [...window.windowManager.windows];
                            winsToClose.forEach(win => {
                                if (win.id !== 'main-control-window') {
                                    window.windowManager.closeDynamicWindow(win.id);
                                }
                            });
                        }

                        window.promptWakeUpRegion(state.currentRegionName);

                    } else {
                        // Saved profiles always start at Professor's lab and are free to explore
                        returnToLab();
                    }
                }
            };

            profilesContainer.appendChild(btn);
        });

        document.getElementById('btn-new-profile').onclick = startNewGame;

        document.getElementById('btn-rename-profile').onclick = () => {
            profileAction = profileAction === 'rename' ? 'load' : 'rename';
            updateHeader();
        };

        document.getElementById('btn-delete-profile').onclick = () => {
            profileAction = profileAction === 'delete' ? 'load' : 'delete';
            updateHeader();
        };

    } else {
        if (splashScreen) splashScreen.style.display = 'flex';
        if (saveManagerModal) saveManagerModal.style.display = 'flex';

        document.getElementById('btn-new-profile').onclick = startNewGame;
    }


}