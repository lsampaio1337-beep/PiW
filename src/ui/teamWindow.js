import { state } from '../state.js';
import { TYPE_COLORS } from '../constants.js';
import * as mathEngine from "../mathEngine.js";
import { escapeHTML } from '../utils/stringUtils.js';

let lastTeamCount = -1;

const QUALITY_META_MAP = {
    Shiny: { glowClass: 'glow-shiny', tierClass: 'is-qtier-shiny' },
    Legendary: { glowClass: 'glow-legendary', tierClass: 'is-qtier-legendary' },
    Epic: { glowClass: 'glow-epic', tierClass: 'is-qtier-epic' },
    Rare: { glowClass: 'glow-rare', tierClass: 'is-qtier-rare' },
    Uncommon: { glowClass: 'glow-uncommon', tierClass: 'is-qtier-uncommon' },
    Regular: { glowClass: 'glow-regular', tierClass: 'is-qtier-regular' },
};

function getQualityMeta(qualityName) {
    return QUALITY_META_MAP[qualityName] || { glowClass: 'glow-weak', tierClass: 'is-qtier-weak' };
}

function getHpFillStyle(hpPct) {
    if (hpPct <= 0) return 'linear-gradient(90deg, #1f2937, #111827)';
    if (hpPct < 25) return 'linear-gradient(90deg, #dc2626, #f87171)';
    if (hpPct < 50) return 'linear-gradient(90deg, #ea580c, #fb923c)';
    if (hpPct < 75) return 'linear-gradient(90deg, #ca8a04, #facc15)';
    if (hpPct < 100) return 'linear-gradient(90deg, #16a34a, #4ade80)';
    return 'linear-gradient(90deg, #0284c7, #38bdf8)';
}

function renderSanitizedHtml(html, targetElement) {
    if (window.windowManager && typeof window.windowManager._parseAndSanitizeToElement === 'function') {
        window.windowManager._parseAndSanitizeToElement(html, targetElement);
    } else {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        targetElement.replaceChildren(...doc.body.childNodes);
    }
}

function buildTypeDotsHtml(types) {
    if (!Array.isArray(types) || types.length === 0) return '';
    const dots = types
        .slice(0, 2)
        .map(t => {
            const safeType = escapeHTML(t);
            const color = TYPE_COLORS[t] || '#94a3b8';
            return `<span class="team-type-dot" style="background: ${color};" title="${safeType}"></span>`;
        })
        .join('');
    return `<span class="team-type-dots">${dots}</span>`;
}

function buildXpBarHtml(p) {
    if (p.level >= 100) {
        return `
            <div class="team-bar-track is-xp is-max">
                <div class="team-bar-fill is-xp-max" style="width: 100%;"></div>
                <div class="team-bar-gloss"></div>
                <div class="team-bar-overlay">
                    <span class="team-bar-center is-max-label">MAX LV</span>
                </div>
            </div>
        `;
    }

    const currentLevelXp = mathEngine.calculateTotalXP(p.level);
    const nextLevelXp = mathEngine.calculateTotalXP(p.level + 1);
    const xpProgress = Math.max(0, Math.floor(p.xp) - currentLevelXp);
    const xpRequired = Math.max(1, nextLevelXp - currentLevelXp);
    const xpPct = Math.min(100, Math.max(0, (xpProgress / xpRequired) * 100));

    return `
        <div class="team-bar-track is-xp">
            <div class="team-bar-fill is-xp" style="width: ${xpPct}%;"></div>
            <div class="team-bar-gloss"></div>
            <div class="team-bar-overlay">
                <div class="team-bar-cell">${xpProgress}/${xpRequired}</div>
                <div class="team-bar-label">XP</div>
                <div class="team-bar-cell">${Math.floor(xpPct)}%</div>
            </div>
        </div>
    `;
}

function buildSpritePedestalHtml(p, glowClass, isFainted, allowTransform, topBadgeHtml = '', bottomBadgeHtml = '') {
    const isShiny = p.qualityName === 'Shiny';
    const faintClass = isFainted ? 'is-fainted' : '';
    const spriteMarkup = (allowTransform && p.isTransformed && p.transformedIntoId)
        ? `<img src="${window.getSpriteUrl(132, isShiny)}" class="team-sprite-ghost ${glowClass}">
           <img src="${window.getSpriteUrl(p.transformedIntoId, isShiny)}" onload="this.style.display='inline'" onerror="this.style.display='none'" class="team-sprite-img ${glowClass} ${faintClass}">`
        : `<img src="${window.getSpriteUrl(p.id, isShiny)}" onload="this.style.display='inline'" onerror="this.style.display='none'" class="team-sprite-img ${glowClass} ${faintClass}">`;

    return `
        <div class="team-sprite-stage">
            <div class="team-sprite-pedestal"></div>
            ${spriteMarkup}
            ${topBadgeHtml}
            ${bottomBadgeHtml}
        </div>
    `;
}

export function updateTeamWindow() {
    const partyDiv = document.getElementById('party-list');
    if (!partyDiv) return;
    partyDiv.replaceChildren();

    const countPill = document.getElementById('party-count-pill');
    if (countPill) {
        countPill.textContent = `${state.party.length}/6`;
    }

    if (state.party.length === 0) {
        renderSanitizedHtml(`<div class="team-empty-state">No Pokémon in party</div>`, partyDiv);
    }

    state.party.forEach((p, idx) => {
        const d = document.createElement('div');
        const isLeader = idx === 0;
        const isFainted = p.currentHp <= 0;
        const { glowClass, tierClass } = getQualityMeta(p.qualityName);

        d.className = [
            'party-slot',
            'team-card',
            tierClass,
            isLeader ? 'is-leader' : '',
            isFainted ? 'is-fainted' : ''
        ].filter(Boolean).join(' ');

        const hpPct = p.maxHp > 0 ? Math.min(100, Math.max(0, (p.currentHp / p.maxHp) * 100)) : 0;
        const hpFill = getHpFillStyle(hpPct);
        const hpCriticalClass = (!isFainted && hpPct < 25) ? 'is-critical' : '';
        const crownClass = isLeader ? 'is-active' : '';
        const leadTag = isLeader ? `<span class="team-lead-badge team-stage-badge is-top-left">LEAD</span>` : '';
        const hpLabel = isFainted ? 'FAINT' : 'HP';

        renderSanitizedHtml(`
            <div class="team-card-accent"></div>
            <div class="team-card-body">
                ${buildSpritePedestalHtml(p, glowClass, isFainted, true, leadTag)}
                <div class="team-card-info">
                    <div class="team-card-top">
                        <div class="team-name-group">
                            <span class="team-poke-name" title="${escapeHTML(p.name)}">${escapeHTML(p.name)}</span>
                            <span class="team-lv-pill">Lv.${p.level}</span>
                            ${buildTypeDotsHtml(p.types)}
                        </div>
                        <div class="team-actions">
                            <div onclick="window.setLeader(${idx})" class="team-crown-btn ${crownClass}" title="Set as Leader">👑</div>
                            <div onclick="event.stopPropagation(); window.showPokemonStats(${idx}, 'party')" class="team-info-btn" title="View Info">i</div>
                        </div>
                    </div>

                    <div class="team-bar-track is-hp ${hpCriticalClass}">
                        <div class="team-bar-fill is-hp" style="width: ${hpPct}%; background: ${hpFill};"></div>
                        <div class="team-bar-gloss"></div>
                        <div class="team-bar-overlay">
                            <div class="team-bar-cell">${Math.floor(p.currentHp)}/${p.maxHp}</div>
                            <div class="team-bar-label">${hpLabel}</div>
                            <div class="team-bar-cell">${Math.floor(hpPct)}%</div>
                        </div>
                    </div>

                    ${buildXpBarHtml(p)}
                </div>
            </div>
        `, d);
        partyDiv.appendChild(d);
    });

    // Day Care UI updates
    const dayCareContainer = document.getElementById('day-care');
    let dayCareCount = 0;
    if (state.dayCareRef && dayCareContainer) {
        if (state.dayCareRef.slot1.pokemon) dayCareCount++;
        if (state.dayCareRef.slot2.pokemon) dayCareCount++;

        renderDayCareSlot(document.getElementById('dc-slot1'), state.dayCareRef.slot1.pokemon, state.dayCareRef.slot1.battles, state.dayCareRef.slot1.requiredBattles, 'breed');
        renderDayCareSlot(document.getElementById('dc-slot2'), state.dayCareRef.slot2.pokemon, state.dayCareRef.slot2.battles, state.dayCareRef.slot2.requiredBattles, 'train');

        dayCareContainer.style.display = dayCareCount === 0 ? 'none' : 'flex';
    }

    const currentTeamCount = state.party.length + dayCareCount;
    if (lastTeamCount === -1 || currentTeamCount !== lastTeamCount) {
        if (window.windowManager) {
            setTimeout(() => {
                const win = document.getElementById('party-window');
                if (win && win.style.display !== 'none' && typeof win.adjustHeightForNewContent === 'function') {
                    win.adjustHeightForNewContent();
                }
            }, 10);
        }
    }
    lastTeamCount = currentTeamCount;
}


function renderDayCareSlot(container, p, battles, maxBattles, type) {
    if (!container) return;
    if (!p) {
        container.replaceChildren();
        container.style.display = 'none';
        return;
    }

    if (!p.uuid) p.uuid = crypto.randomUUID();
    container.style.display = 'block';

    const { glowClass, tierClass } = getQualityMeta(p.qualityName);
    const progPct = maxBattles > 0 ? Math.min(100, (battles / maxBattles) * 100) : 0;

    let rightText = '';
    let centerLabel = '';
    let isReady = battles >= maxBattles;

    if (type === 'breed') {
        centerLabel = 'Q';
        if (state.dayCareRef && state.dayCareRef.slot1 && state.dayCareRef.slot1.isFinished) {
            isReady = true;
            const lastQBonus = p.lastQBonus !== undefined ? p.lastQBonus : 0.00;
            const baseQ = (p.quality - lastQBonus).toFixed(2);
            rightText = `${baseQ}+${lastQBonus.toFixed(2)}`;
        } else {
            const baseQ = p.quality.toFixed(2);
            rightText = `${baseQ}+0.00`;
        }
    } else if (type === 'train') {
        centerLabel = 'SumIV';
        const totalIV = p.ivs.hp + p.ivs.atk + p.ivs.def + p.ivs.spa + p.ivs.spd + p.ivs.spe;
        const cycles = p.trainingCyclesCompleted || 0;
        const initialIV = totalIV - cycles;
        rightText = `${initialIV}+${cycles}`;
    }

    const modeClass = type === 'breed' ? 'is-daycare-breed' : 'is-daycare-train';
    const modeTag = type === 'breed' ? 'BREED' : 'TRAIN';
    const modeBadge = `<span class="team-mode-badge team-stage-badge is-top-left ${modeClass}">${modeTag}</span>`;
    const readyTag = isReady ? `<span class="team-ready-badge team-stage-badge is-bottom-right">READY</span>` : '';

    renderSanitizedHtml(`
        <div class="party-slot team-card ${tierClass} ${modeClass} ${isReady ? 'is-ready' : ''}">
            <div class="team-card-accent"></div>
            <div class="team-card-body">
                ${buildSpritePedestalHtml(p, glowClass, false, false, modeBadge, readyTag)}
                <div class="team-card-info">
                    <div class="team-card-top">
                        <div class="team-name-group">
                            <span class="team-poke-name" title="${escapeHTML(p.name)}">${escapeHTML(p.name)}</span>
                            <span class="team-lv-pill">Lv.${p.level}</span>
                        </div>
                        <div class="team-actions">
                            <div onclick="event.stopPropagation(); window.showPokemonStatsByUuid('${escapeHTML(p.uuid)}')" class="team-info-btn" title="View Info">i</div>
                        </div>
                    </div>

                    <div class="team-bar-track is-daycare ${modeClass}">
                        <div class="team-bar-fill is-daycare ${modeClass}" style="width: ${progPct}%;"></div>
                        <div class="team-bar-gloss"></div>
                        <div class="team-bar-overlay">
                            <div class="team-bar-cell">${battles}/${maxBattles}</div>
                            <div class="team-bar-label">${centerLabel}</div>
                            <div class="team-bar-cell">${rightText}</div>
                        </div>
                    </div>

                    ${buildXpBarHtml(p)}
                </div>
            </div>
        </div>
    `, container);
}
