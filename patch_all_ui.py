import re
with open('src/ui.js', 'r') as f:
    content = f.read()

# 1. Trainer modal rename
content = content.replace('showModal("Statistics"', 'showModal("Trainer"')

# 2. ZzZ Mode modal refactor
new_logic = """
                            const resultsHtml = `
                                <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.3); padding: 8px 12px; border-radius: 8px; margin-bottom: 15px;">
                                    <div style="font-size: 14px; color: #cbd5e1;">📍 <b>Route:</b> ${state.currentRoute}</div>
                                    <div style="font-size: 14px; color: #cbd5e1;">⏳ <b>Time:</b> ${timeStr.trim()}</div>
                                </div>

                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">

                                    <!-- Money Earned -->
                                    <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid #10b981; border-radius: 8px; padding: 12px; text-align: center; display: flex; flex-direction: column; justify-content: center; align-items: center;">
                                        <div style="font-size: 11px; color: #6ee7b7; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px;">Money Earned</div>
                                        <div style="font-size: 18px; font-weight: bold; color: #10b981;">+$${Math.floor(results.moneyEarned).toLocaleString('pt-BR')}</div>
                                    </div>

                                    <!-- XP Earned -->
                                    <div style="background: rgba(59, 130, 246, 0.1); border: 1px solid #3b82f6; border-radius: 8px; padding: 12px; text-align: center; display: flex; flex-direction: column; justify-content: center; align-items: center;">
                                        <div style="font-size: 11px; color: #93c5fd; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px;">XP Earned</div>
                                        <div style="font-size: 18px; font-weight: bold; color: #3b82f6;">+${Math.floor(results.xpEarned).toLocaleString('pt-BR')} XP</div>
                                    </div>

                                    <!-- Caught Card -->
                                    <div style="background: rgba(255,255,255,0.05); border: 1px solid #475569; border-radius: 8px; padding: 12px; text-align: center; display: flex; flex-direction: column; justify-content: center; align-items: center;">
                                        <div style="font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px;">Pokémon Caught</div>
                                        <div style="font-size: 18px; font-weight: bold; color: #fff;">${results.caught}/${results.encounters}</div>
                                    </div>

                                    <!-- Shinies Card -->
                                    <div style="background: rgba(255,255,255,0.05); border: 1px solid #475569; border-radius: 8px; padding: 12px; text-align: center; display: flex; flex-direction: column; justify-content: center; align-items: center; position: relative; overflow: hidden;">
                                        ${results.shinies > 0 ? '<div style="position: absolute; top: -10px; left: -10px; width: 150%; height: 150%; background: radial-gradient(circle, rgba(168,85,247,0.2) 0%, transparent 70%); pointer-events: none;"></div>' : ''}
                                        <div style="font-size: 11px; color: #d8b4fe; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px; z-index: 1;">Shinies Caught</div>
                                        <div style="font-size: 18px; font-weight: bold; color: #fff; z-index: 1;">${results.shinies}/${results.shinyEncounters}</div>
                                    </div>

                                    <!-- Items Used Header -->
                                    <div style="grid-column: span 2; border-bottom: 1px solid #334155; padding-bottom: 5px; margin-top: 5px; color: #94a3b8; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; text-align: center;">Resources Used</div>

                                    <!-- Balls Used -->
                                    <div style="background: rgba(0,0,0,0.2); border: 1px dashed #475569; border-radius: 8px; padding: 10px; text-align: center; display: flex; flex-direction: column; justify-content: center; align-items: center;">
                                        ${ballIconStr}
                                        <div style="font-size: 12px; color: #cbd5e1;">${ballUsedStr}</div>
                                    </div>

                                    <!-- Potions Used -->
                                    <div style="background: rgba(0,0,0,0.2); border: 1px dashed #475569; border-radius: 8px; padding: 10px; text-align: center; display: flex; flex-direction: column; justify-content: center; align-items: center;">
                                        ${potionIconStr}
                                        <div style="font-size: 12px; color: #cbd5e1;">${potionUsedStr}</div>
                                    </div>

                                </div>
                                ${faintedBanner}
                            `;
                            showModal("ZzZ Mode", resultsHtml);

                            if (results.fainted) {
                                state.currentRoute = "PokeCenter & PokeMarket";
                                window.navigateToLocation("PokeCenter & PokeMarket");
                            } else if (results.outOfMoney) {
                                state.currentRoute = "Casino Lobby";
                                window.navigateToLocation("Casino Lobby");
                            }
                            updateUI();
"""

# Let's replace precisely
old_zzz = """                            // Show results modal
                            document.getElementById('zzz-results-content').innerHTML = `
                                <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.3); padding: 8px 12px; border-radius: 8px; margin-bottom: 15px;">
                                    <div style="font-size: 14px; color: #cbd5e1;">📍 <b>Route:</b> ${state.currentRoute}</div>
                                    <div style="font-size: 14px; color: #cbd5e1;">⏳ <b>Time:</b> ${timeStr.trim()}</div>
                                </div>

                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">

                                    <!-- Money Earned -->
                                    <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid #10b981; border-radius: 8px; padding: 12px; text-align: center; display: flex; flex-direction: column; justify-content: center; align-items: center;">
                                        <div style="font-size: 11px; color: #6ee7b7; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px;">Money Earned</div>
                                        <div style="font-size: 18px; font-weight: bold; color: #10b981;">+$${Math.floor(results.moneyEarned).toLocaleString('pt-BR')}</div>
                                    </div>

                                    <!-- XP Earned -->
                                    <div style="background: rgba(59, 130, 246, 0.1); border: 1px solid #3b82f6; border-radius: 8px; padding: 12px; text-align: center; display: flex; flex-direction: column; justify-content: center; align-items: center;">
                                        <div style="font-size: 11px; color: #93c5fd; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px;">XP Earned</div>
                                        <div style="font-size: 18px; font-weight: bold; color: #3b82f6;">+${Math.floor(results.xpEarned).toLocaleString('pt-BR')} XP</div>
                                    </div>

                                    <!-- Caught Card -->
                                    <div style="background: rgba(255,255,255,0.05); border: 1px solid #475569; border-radius: 8px; padding: 12px; text-align: center; display: flex; flex-direction: column; justify-content: center; align-items: center;">
                                        <div style="font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px;">Pokémon Caught</div>
                                        <div style="font-size: 18px; font-weight: bold; color: #fff;">${results.caught}/${results.encounters}</div>
                                    </div>

                                    <!-- Shinies Card -->
                                    <div style="background: rgba(255,255,255,0.05); border: 1px solid #475569; border-radius: 8px; padding: 12px; text-align: center; display: flex; flex-direction: column; justify-content: center; align-items: center; position: relative; overflow: hidden;">
                                        ${results.shinies > 0 ? '<div style="position: absolute; top: -10px; left: -10px; width: 150%; height: 150%; background: radial-gradient(circle, rgba(168,85,247,0.2) 0%, transparent 70%); pointer-events: none;"></div>' : ''}
                                        <div style="font-size: 11px; color: #d8b4fe; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px; z-index: 1;">Shinies Caught</div>
                                        <div style="font-size: 18px; font-weight: bold; color: #fff; z-index: 1;">${results.shinies}/${results.shinyEncounters}</div>
                                    </div>

                                    <!-- Items Used Header -->
                                    <div style="grid-column: span 2; border-bottom: 1px solid #334155; padding-bottom: 5px; margin-top: 5px; color: #94a3b8; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; text-align: center;">Resources Used</div>

                                    <!-- Balls Used -->
                                    <div style="background: rgba(0,0,0,0.2); border: 1px dashed #475569; border-radius: 8px; padding: 10px; text-align: center; display: flex; flex-direction: column; justify-content: center; align-items: center;">
                                        ${ballIconStr}
                                        <div style="font-size: 12px; color: #cbd5e1;">${ballUsedStr}</div>
                                    </div>

                                    <!-- Potions Used -->
                                    <div style="background: rgba(0,0,0,0.2); border: 1px dashed #475569; border-radius: 8px; padding: 10px; text-align: center; display: flex; flex-direction: column; justify-content: center; align-items: center;">
                                        ${potionIconStr}
                                        <div style="font-size: 12px; color: #cbd5e1;">${potionUsedStr}</div>
                                    </div>

                                </div>
                                ${faintedBanner}
                            `;
                            document.getElementById('zzz-results-modal').style.display = 'flex';
                            document.getElementById('btn-zzz-results-close').onclick = () => {
                                document.getElementById('zzz-results-modal').style.display = 'none';
                                updateUI();
                            };

                            if (results.fainted) {
                                state.currentRoute = "PokeCenter & PokeMarket";
                                window.navigateToLocation("PokeCenter & PokeMarket");
                            } else if (results.outOfMoney) {
                                state.currentRoute = "Casino Lobby";
                                window.navigateToLocation("Casino Lobby");
                            }
                            updateUI();"""

content = content.replace(old_zzz, new_logic)

with open('src/ui.js', 'w') as f:
    f.write(content)
