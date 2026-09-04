
import { state, globals } from '../state.js';
import { updateUI } from '../ui.js';
import { openMarketModal } from './market/marketModal.js';

export function setupMarket(vCenter) {
    vCenter.innerHTML = `
        <div style="position: relative; width: 100%; height: 100%;">
            <!-- Buttons container positioned 20% from the top -->
            <div style="position: absolute; top: 20%; width: 100%; display: flex; justify-content: space-between; padding: 0 15%; box-sizing: border-box;">
                <button id="btn-heal-all" style="padding: 15px 30px; font-size: 20px; font-weight: bold; cursor: pointer; background: rgba(255, 255, 255, 0.9); border: 3px solid #e74c3c; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.5);">PokeCenter (Heal)</button>
                <button id="btn-market-buy" style="padding: 15px 30px; font-size: 20px; font-weight: bold; cursor: pointer; background: rgba(255, 255, 255, 0.9); border: 3px solid #3498db; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.5);">PokeMarket (Buy)</button>
            </div>
            <div style="position: absolute; top: 30%; right: 15%; margin-top: 10px;">
                 <button id="btn-market-sell" style="padding: 10px 20px; font-size: 16px; font-weight: bold; cursor: not-allowed; opacity: 0.5; background: rgba(255, 255, 255, 0.9); border: 2px solid #95a5a6; border-radius: 8px;">Sell</button>
            </div>
        </div>
    `;
    vCenter.style.backgroundImage = "url('./Assets/BG/BG-PCPM.png')";
    vCenter.style.backgroundSize = "cover";
    vCenter.style.backgroundPosition = "center";
    vCenter.style.height = "100%";
    vCenter.style.textAlign = "center";

    document.getElementById('btn-heal-all').onclick = () => {
        state.party.forEach(p => p.currentHp = p.maxHp);
        alert("All Pokemon have been healed!");
        updateUI();
    };

    document.getElementById('btn-market-buy').onclick = () => {
        openMarketModal();
    };

    document.getElementById('btn-market-sell').onclick = () => {
        // Doing nothing, per requirements
    };
}
