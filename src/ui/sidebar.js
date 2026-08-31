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

        d.innerHTML = `
            <div onclick="window.setLeader(${idx})" style="position: absolute; top: 5px; right: 5px; cursor: pointer; color: ${crownColor}; font-size: 16px;" title="Set as Leader">👑</div>
            <div style="position: absolute; bottom: 2px; right: 5px; font-size: 10px; color: #ccc;" title="Quality and Sum of IVs">Q=${qVal} & ∑IV=${sumIV}</div>
            <img src="Assets/Pokemon Sprites/${p.qualityName === 'Shiny' ? p.id + '_shiny' : p.id}.png" onload="this.style.display='inline'" onerror="this.style.display='none'" style="width: 50px; height: 50px;">
            <div style="display: inline-block; vertical-align: top; width: calc(100% - 70px);">
                <b>${p.name}</b> Lv.${p.level}<br>
                HP: ${Math.floor(p.currentHp)}/${p.maxHp}
                <div style="width: 100%; height: 5px; background: #333; margin-top: 2px; margin-bottom: 4px;">
                    <div style="width: ${Math.min(100, (p.currentHp / p.maxHp) * 100)}%; height: 100%; background: #e74c3c;"></div>
                </div>
                XP: ${xpProgress}/${xpRequired}
                <div style="width: 100%; height: 5px; background: #333; margin-top: 2px;">
                    <div style="width: ${Math.min(100, (xpProgress / xpRequired) * 100)}%; height: 100%; background: #4caf50;"></div>
                </div>
            </div>
            <div onclick="event.stopPropagation(); window.showPokemonStats(${idx}, 'party')" style="position: absolute; bottom: 5px; right: 5px; cursor: pointer; background: #34495e; color: white; border-radius: 50%; width: 20px; height: 20px; text-align: center; line-height: 20px; font-weight: bold;" title="View Info">i</div>
        `;
        partyDiv.appendChild(d);
    });

    // Day Care UI updates
    if (state.dayCareRef) {
        const breedProg = document.getElementById('breed-prog');
        const trainProg = document.getElementById('train-prog');
        if (breedProg) breedProg.innerText = `${state.dayCareRef.slot1.battles}/${state.dayCareRef.slot1.requiredBattles}`;
        if (trainProg) trainProg.innerText = `${state.dayCareRef.slot2.battles}/${state.dayCareRef.slot2.requiredBattles}`;
    }
}
