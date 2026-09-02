import { state, globals } from '../state.js';
import * as mathEngine from "../mathEngine.js";

// Ensure global functions that are referenced in HTML exist on window object
// However, since `window.setLeader` and `window.showPokemonStats` are referenced,
// they need to be defined elsewhere and attached to window, or attached here.
// Let's attach them in the main ui.js or where appropriate.

export function updateSidebar() {
    const partyDiv = document.getElementById('party-list');
    if (!partyDiv) return;
    partyDiv.innerHTML = '';
    state.party.forEach((p, idx) => {
        const d = document.createElement('div');
        d.className = 'party-slot';
        d.style.position = 'relative';

        // Calculate XP relative to current level
        const currentLevelXp = mathEngine.calculateTotalXP(p.level);
        const nextLevelXp = mathEngine.calculateTotalXP(p.level + 1);
        const xpProgress = Math.floor(p.xp) - currentLevelXp;
        const xpRequired = nextLevelXp - currentLevelXp;

        const crownColor = idx === 0 ? '#f1c40f' : '#7f8c8d'; // Yellow for leader, Grey for others
        const sumIV = p.ivs ? p.ivs.hp + p.ivs.atk + p.ivs.def + p.ivs.spa + p.ivs.spd + p.ivs.spe : 0;
        const qVal = p.quality ? p.quality.toFixed(2) : '1.00';

        const hpPct = Math.min(100, (p.currentHp / p.maxHp) * 100);
        let hpColor = '#3498db'; // Blue for 100%
        if (hpPct <= 0) hpColor = '#000000'; // Black
        else if (hpPct < 25) hpColor = '#e74c3c'; // Red
        else if (hpPct < 50) hpColor = '#e67e22'; // Orange
        else if (hpPct < 75) hpColor = '#f1c40f'; // Yellow
        else if (hpPct < 100) hpColor = '#2ecc71'; // Green

        let xpPct = Math.min(100, (xpProgress / xpRequired) * 100);

        let xpTextHtml = ``;
        if (p.level === 100) {
            xpPct = 100;
            xpTextHtml = ``; // No text for level 100
        } else {
            xpTextHtml = `
                <div style="flex: 1; text-align: center; z-index: 1; display: flex; align-items: center; justify-content: center;">${Math.floor(xpPct)}%</div>
                <div style="flex: 1; text-align: center; z-index: 1; display: flex; align-items: center; justify-content: center;">${xpProgress}/${xpRequired}</div>
            `;
        }

        let glowClass = "glow-weak";
        if (p.qualityName === "Shiny") glowClass = "glow-shiny";
        else if (p.qualityName === "Epic") glowClass = "glow-epic";
        else if (p.qualityName === "Rare") glowClass = "glow-rare";
        else if (p.qualityName === "Uncommon") glowClass = "glow-uncommon";
        else if (p.qualityName === "Regular") glowClass = "glow-regular";

        d.innerHTML = `
            <div style="display: flex; width: 100%; align-items: stretch; height: 100%; min-height: 70px;">
                <!-- Left Column: Sprite -->
                <div style="flex: 0 0 60px; display: flex; align-items: center; justify-content: center;">
                    <img src="Assets/Pokemon Sprites/${p.qualityName === 'Shiny' ? p.id + '_shiny' : p.id}.png" onload="this.style.display='inline'" onerror="this.style.display='none'" class="${glowClass}" style="max-width: 100%; max-height: 100%; object-fit: contain; pointer-events: none; opacity: 0.85;">
                </div>

                <!-- Right Column: 3 Floors -->
                <div style="flex: 1; display: flex; flex-direction: column; justify-content: space-between; padding-left: 5px; gap: 4px; min-width: 0;">
                    <!-- Top Floor: Name/Level and Buttons -->
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div style="line-height: 1.1; display: flex; align-items: baseline; gap: 4px;">
                            <span style="font-weight: bold; font-size: 13px; text-shadow: 1px 1px 1px rgba(0,0,0,0.8); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${p.name}</span>
                            <span style="font-size: 11px; text-shadow: 1px 1px 1px rgba(0,0,0,0.8);">Lv.${p.level}</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 4px;">
                            <div onclick="window.setLeader(${idx})" style="cursor: pointer; color: ${crownColor}; font-size: 16px; z-index: 2;" title="Set as Leader">👑</div>
                            <div onclick="event.stopPropagation(); window.showPokemonStats(${idx}, 'party')" style="cursor: pointer; background: #34495e; color: white; border-radius: 50%; width: 16px; height: 16px; text-align: center; line-height: 16px; font-size: 10px; font-weight: bold; z-index: 2;" title="View Info">i</div>
                        </div>
                    </div>

                    <!-- Middle Floor: HP Bar -->
                    <div style="width: 100%; height: 16px; background: #222; border: 1px solid #000; border-radius: 8px; position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: bold; color: white; text-shadow: 1px 1px 1px black, -1px -1px 1px black, 1px -1px 1px black, -1px 1px 1px black; box-shadow: inset 0px 1px 3px rgba(0,0,0,0.5);">
                        <div style="position: absolute; left: 0; top: 0; width: ${hpPct}%; height: 100%; background: ${hpColor}; z-index: 0; transition: width 0.3s, background 0.3s; border-radius: 8px;"></div>
                        <span style="z-index: 1;">HP ${Math.floor(p.currentHp)}/${p.maxHp}</span>
                    </div>

                    <!-- Base Floor: XP Bar -->
                    <div style="width: 100%; height: 16px; background: #222; border: 1px solid #000; border-radius: 8px; position: relative; overflow: hidden; display: flex; align-items: center; font-size: 10px; font-weight: bold; color: white; text-shadow: 1px 1px 1px black, -1px -1px 1px black, 1px -1px 1px black, -1px 1px 1px black; box-shadow: inset 0px 1px 3px rgba(0,0,0,0.5);">
                        <div style="position: absolute; left: 0; top: 0; width: ${xpPct}%; height: 100%; background: #9b59b6; z-index: 0; transition: width 0.3s; border-radius: 8px;"></div>
                        <div style="position: absolute; left: 0; top: 0; width: 100%; height: 100%; display: flex;">
                            ${xpTextHtml}
                        </div>
                    </div>
                </div>
            </div>
        `;
        partyDiv.appendChild(d);
    });

    // Day Care UI updates
    if (state.dayCareRef) {
        const breedProg = document.getElementById('breed-prog');
        const trainProg = document.getElementById('train-prog');
        if (breedProg) breedProg.innerText = `${state.dayCareRef.slot1.battles}/${state.dayCareRef.slot1.requiredBattles}`;
        if (trainProg) trainProg.innerText = `${state.dayCareRef.slot2.battles}/${state.dayCareRef.slot2.requiredBattles}`;

        const breedInfo = document.getElementById('breed-info');
        const trainInfo = document.getElementById('train-info');

        if (breedInfo) {
            if (state.dayCareRef.slot1.isBreeding && state.dayCareRef.slot1.pokemon) {
                breedInfo.innerText = `QValue = ${state.dayCareRef.slot1.pokemon.quality.toFixed(2)} + 0.01`;
            } else if (state.dayCareRef.slot1.isFinished && state.dayCareRef.slot1.pokemon) {
                breedInfo.innerText = `QValue = ${state.dayCareRef.slot1.pokemon.quality.toFixed(2)} (Finished)`;
            } else {
                breedInfo.innerText = '';
            }
        }

        if (trainInfo) {
            if (state.dayCareRef.slot2.pokemon) {
                const cycles = state.dayCareRef.slot2.pokemon.trainingCyclesCompleted || 0;
                const totalIV = state.dayCareRef.slot2.pokemon.ivs.hp + state.dayCareRef.slot2.pokemon.ivs.atk + state.dayCareRef.slot2.pokemon.ivs.def + state.dayCareRef.slot2.pokemon.ivs.spa + state.dayCareRef.slot2.pokemon.ivs.spd + state.dayCareRef.slot2.pokemon.ivs.spe;
                trainInfo.innerText = `SumIV = ${totalIV - cycles} + ${cycles}`;
            } else {
                trainInfo.innerText = '';
            }
        }
    }
}
