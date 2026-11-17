import { VITAMINS } from '../constants.js';

/**
 * ZzZ (Offline Hunt) configuration.
 * 1 Jigglypuff Grain = 1 minute of offline hunt, capped at available grains.
 */
export const ZZZ_CONFIG = {
    useGrainBased: true,
    fixedHuntDurationMs: 60 * 60 * 1000, // Fallback if useGrainBased is toggled off
    msPerGrain: 60 * 1000, // 1 minute per grain
};

const QUALITY_ORDER = ['Shiny', 'Epic', 'Rare', 'Uncommon', 'Regular', 'Weak'];

const QUALITY_COLORS = {
    Shiny: '#facc15',
    Epic: '#a855f7',
    Rare: '#3b82f6',
    Uncommon: '#00ffff',
    Regular: '#7affff',
    Weak: '#94a3b8',
};

/**
 * Compute simulation duration and grain bounds for a ZzZ wake-up.
 */
export function calculateZzZSimulationParams(state, now = Date.now(), config = ZZZ_CONFIG) {
    const availableGrains = state?.stats?.jigglypuffGrains || 0;
    if (config.useGrainBased) {
        const startTs = state?.zzzTimestamp ?? now;
        const rawElapsed = Math.max(0, now - startTs);
        const maxTimeMs = availableGrains * config.msPerGrain;
        return {
            timeElapsedMs: Math.min(rawElapsed, maxTimeMs),
            maxTimeMs,
            availableGrains,
            useGrainBased: true,
        };
    }

    return {
        timeElapsedMs: config.fixedHuntDurationMs,
        maxTimeMs: config.fixedHuntDurationMs,
        availableGrains,
        useGrainBased: false,
    };
}

/**
 * Deduct Jigglypuff Grains (when grain-based mode is enabled) and return sleep minutes.
 */
export function consumeZzZGrains(state, displayTimeMs, maxTimeMs, availableGrains, config = ZZZ_CONFIG) {
    if (!config.useGrainBased) {
        return {
            consumedGrains: 0,
            sleepMinutes: Math.floor(Math.max(0, displayTimeMs) / 60000),
        };
    }

    const actualTimeConsumedMs = Math.min(Math.max(0, displayTimeMs), Math.max(0, maxTimeMs));
    const consumedGrains = Math.ceil(actualTimeConsumedMs / config.msPerGrain);
    state.stats.jigglypuffGrains = Math.max(0, availableGrains - consumedGrains);
    state.stats.jigglypuffGrainsUsed = (state.stats.jigglypuffGrainsUsed || 0) + consumedGrains;

    return {
        consumedGrains,
        sleepMinutes: Math.floor(actualTimeConsumedMs / 60000),
    };
}

/**
 * Format milliseconds into a compact human-readable duration (e.g. "1h 0m 0s").
 */
export function formatZzZDuration(ms) {
    const totalSeconds = Math.max(0, Math.floor((ms || 0) / 1000));
    const d = Math.floor(totalSeconds / (3600 * 24));
    const h = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;

    const parts = [];
    if (d > 0) parts.push(`${d}d`);
    if (h > 0 || d > 0) parts.push(`${h}h`);
    if (m > 0 || h > 0 || d > 0) parts.push(`${m}m`);
    parts.push(`${s}s`);
    return parts.join(' ');
}

function resolveLootItemMeta(itemName, state) {
    const pokeballs = state?.config?.balance?.items?.pokeballs || [];
    const potions = state?.config?.balance?.items?.potions || [];

    if (pokeballs.some(b => b.name === itemName)) {
        return { displayName: itemName, category: 'ball', iconPath: `Assets/Items/Balls/${itemName}.png` };
    }
    if (potions.some(p => p.name === itemName || (p.name === 'Big' && itemName === 'Big Potion'))) {
        const displayName = itemName === 'Big' ? 'Big Potion' : itemName;
        return { displayName, category: 'potion', iconPath: `Assets/Items/Potions/${displayName}.png` };
    }
    if (VITAMINS.includes(itemName)) {
        return { displayName: itemName, category: 'vitamin', iconPath: `Assets/Items/Vitamins/${itemName}.png` };
    }
    return { displayName: itemName, category: 'stone', iconPath: `Assets/Items/Stones/${itemName}.png` };
}

function getSumIV(pokemon) {
    if (!pokemon?.ivs) return 0;
    const { hp = 0, atk = 0, def = 0, spa = 0, spd = 0, spe = 0 } = pokemon.ivs;
    return hp + atk + def + spa + spd + spe;
}

/**
 * Aggregate raw `runFastForward` results into a structured summary for the ZzZ modal.
 */
export function summarizeZzZResults(results = {}, state = {}, maxTimeMs = 0, config = ZZZ_CONFIG) {
    const displayTimeMs = results.simulatedTimeMs !== undefined ? results.simulatedTimeMs : maxTimeMs;
    const hours = displayTimeMs / 3600000;
    const minutes = displayTimeMs / 60000;

    const rawMoney = results.money ?? results.moneyEarned ?? 0;
    const moneyEarned = Number.isFinite(rawMoney) ? Math.floor(rawMoney) : 0;
    const rawXp = results.xpEarned ?? 0;
    const xpEarned = Number.isFinite(rawXp) ? Math.floor(rawXp) : 0;
    const encounters = results.encounters || 0;
    const caught = results.caught || 0;
    const shinies = results.shinies || 0;
    const shinyEncounters = results.shinyEncounters || 0;
    const whiteCandiesEarned = results.whiteCandiesEarned || 0;
    const partyFaints = results.partyFaints || 0;

    const qualityBreakdown = {};
    let topCatch = null;
    let topScore = -1;

    for (const p of (results.caughtPokemonList || [])) {
        const qName = p.qualityName || 'Regular';
        qualityBreakdown[qName] = (qualityBreakdown[qName] || 0) + 1;

        const sumIV = getSumIV(p);
        const score = (qName === 'Shiny' ? 1e9 : 0) + ((p.quality || 1) * 1e5) + (sumIV * 100) + (p.level || 1);
        if (score > topScore) {
            topScore = score;
            topCatch = {
                name: p.name,
                level: p.level,
                qualityName: qName,
                sumIV,
            };
        }
    }

    const lootedItems = [];
    if (whiteCandiesEarned > 0) {
        lootedItems.push({
            name: 'White Candy',
            count: whiteCandiesEarned,
            category: 'candy',
            iconPath: 'Assets/Extra/Candies/WhiteCandy.png',
        });
    }
    for (const [itemName, count] of Object.entries(results.itemsLooted || {})) {
        if (count > 0) {
            const meta = resolveLootItemMeta(itemName, state);
            lootedItems.push({ name: meta.displayName, count, category: meta.category, iconPath: meta.iconPath });
        }
    }

    const missedItems = Object.entries(results.itemsMissed || {})
        .filter(([, count]) => count > 0)
        .map(([name, count]) => ({ name: name === 'Big' ? 'Big Potion' : name, count }));

    let status;
    if (results.fainted) {
        status = { type: 'error', icon: '❌', text: 'Farm Stopped: Party Fainted' };
    } else if (results.outOfMoney) {
        status = { type: 'error', icon: '❌', text: 'Farm Stopped: No money to buy more entries' };
    } else if (config.useGrainBased && results.simulatedTimeMs !== undefined && results.simulatedTimeMs >= maxTimeMs) {
        status = { type: 'warning', icon: '✨', text: 'Farm Stopped: Jigglypuff Dust ended' };
    } else if (!config.useGrainBased && results.simulatedTimeMs !== undefined && results.simulatedTimeMs >= maxTimeMs) {
        status = { type: 'success', icon: '🌙', text: '1h Offline Hunt Complete' };
    } else {
        status = { type: 'success', icon: '✅', text: 'Farm Stopped: Logged in a save' };
    }

    return {
        routeName: (state?.currentRoute || 'Unknown Route').replace(/\s*\([^)]+\)$/, ''),
        durationStr: formatZzZDuration(displayTimeMs),
        displayTimeMs,
        moneyEarned,
        moneyPerHour: hours > 0 ? Math.floor(moneyEarned / hours) : 0,
        xpEarned,
        xpPerHour: hours > 0 ? Math.floor(xpEarned / hours) : 0,
        encounters,
        encountersPerMin: minutes > 0 ? (encounters / minutes).toFixed(1) : '0.0',
        caught,
        catchRatePct: encounters > 0 ? Math.round((caught / encounters) * 100) : 0,
        shinies,
        shinyEncounters,
        ballsUsed: results.ballsUsed || 0,
        potionsUsed: results.potionsUsed || 0,
        whiteCandiesEarned,
        partyFaints,
        qualityBreakdown,
        topCatch,
        lootedItems,
        missedItems,
        status,
    };
}

/**
 * Build the HTML for the ZzZ Offline Hunt Results modal.
 */
export function buildZzZResultsModalHtml(summary, state) {
    const activeBallTier = state?.settings?.activeBallTier ?? -1;
    const activePotionTier = state?.settings?.activePotionTier ?? -1;

    let ballUsedStr = 'None';
    let ballIconHtml = '<span class="zzz-supply-none">—</span>';
    if (activeBallTier >= 0 && state?.config?.balance?.items?.pokeballs?.[activeBallTier]) {
        const ballName = state.config.balance.items.pokeballs[activeBallTier].name;
        ballUsedStr = `${summary.ballsUsed.toLocaleString('pt-BR')}× ${ballName}`;
        ballIconHtml = `<img src="Assets/Items/Balls/${ballName}.png" class="zzz-supply-icon" alt="${ballName}">`;
    }

    let potionUsedStr = 'None';
    let potionIconHtml = '<span class="zzz-supply-none">—</span>';
    if (activePotionTier >= 0 && state?.config?.balance?.items?.potions?.[activePotionTier]) {
        const rawPotionName = state.config.balance.items.potions[activePotionTier].name;
        const potionName = rawPotionName === 'Big' ? 'Big Potion' : rawPotionName;
        potionUsedStr = `${summary.potionsUsed.toLocaleString('pt-BR')}× ${potionName}`;
        potionIconHtml = `<img src="Assets/Items/Potions/${potionName}.png" class="zzz-supply-icon" alt="${potionName}">`;
    }

    const qualityBadgesHtml = QUALITY_ORDER
        .filter(q => (summary.qualityBreakdown[q] || 0) > 0)
        .map(q => {
            const color = QUALITY_COLORS[q] || '#cbd5e1';
            const cls = q === 'Shiny' ? 'zzz-q-badge zzz-q-shiny' : 'zzz-q-badge';
            return `<span class="${cls}" style="--q-color: ${color};">${q} <b>${summary.qualityBreakdown[q]}</b></span>`;
        })
        .join('');

    const topCatchHtml = summary.topCatch
        ? `<div class="zzz-top-catch">
                <span class="zzz-top-catch-label">Best Catch</span>
                <span class="zzz-top-catch-val" style="color: ${QUALITY_COLORS[summary.topCatch.qualityName] || '#fff'};">
                    ${summary.topCatch.qualityName === 'Shiny' ? '✨ ' : ''}${summary.topCatch.name}
                    <small>Lv.${summary.topCatch.level} • ${summary.topCatch.qualityName} • ${summary.topCatch.sumIV} IV</small>
                </span>
           </div>`
        : '';

    const catchesSectionHtml = (qualityBadgesHtml || topCatchHtml)
        ? `<div class="zzz-section-card">
                <div class="zzz-section-title">Catch Breakdown</div>
                ${qualityBadgesHtml ? `<div class="zzz-quality-row">${qualityBadgesHtml}</div>` : ''}
                ${topCatchHtml}
           </div>`
        : '';

    const lootChipsHtml = summary.lootedItems.length > 0
        ? summary.lootedItems.map(item => `
            <div class="zzz-loot-chip" title="${item.name}">
                <img src="${item.iconPath}" class="zzz-loot-icon" alt="${item.name}">
                <span>${item.count}× ${item.name}</span>
            </div>`).join('')
        : '<div class="zzz-empty-note">No bonus loot dropped this session</div>';

    const missedHtml = summary.missedItems.length > 0
        ? `<div class="zzz-missed-banner">
                ⚠️ Backpack full — missed: ${summary.missedItems.map(m => `${m.count}× ${m.name}`).join(', ')}
           </div>`
        : '';

    const shinyCardClass = summary.shinies > 0 ? 'zzz-kpi-card zzz-kpi-shiny zzz-kpi-shiny-hit' : 'zzz-kpi-card zzz-kpi-shiny';

    return `
        <div class="content-panel zzz-panel zzz-results-panel">
            <div class="zzz-results-header">
                <div class="zzz-status-pill zzz-status-${summary.status.type}">
                    <span>${summary.status.icon}</span>
                    <span>${summary.status.text}</span>
                </div>
                <div class="zzz-meta-row">
                    <span>📍 <b>${summary.routeName}</b></span>
                    <span>⏳ <b>${summary.durationStr}</b></span>
                    <span>⚡ <b>${summary.encountersPerMin}</b> enc/min</span>
                </div>
            </div>

            <div class="zzz-kpi-grid">
                <div class="zzz-kpi-card zzz-kpi-money">
                    <div class="zzz-kpi-label">Money Earned</div>
                    <div class="zzz-kpi-value">+$${summary.moneyEarned.toLocaleString('pt-BR')}</div>
                    <div class="zzz-kpi-sub">+$${summary.moneyPerHour.toLocaleString('pt-BR')}/hr</div>
                </div>
                <div class="zzz-kpi-card zzz-kpi-xp">
                    <div class="zzz-kpi-label">XP Earned</div>
                    <div class="zzz-kpi-value">+${summary.xpEarned.toLocaleString('pt-BR')}</div>
                    <div class="zzz-kpi-sub">+${summary.xpPerHour.toLocaleString('pt-BR')}/hr</div>
                </div>
                <div class="zzz-kpi-card zzz-kpi-caught">
                    <div class="zzz-kpi-label">Pokémon Caught</div>
                    <div class="zzz-kpi-value">${summary.caught}/${summary.encounters}</div>
                    <div class="zzz-kpi-sub">${summary.catchRatePct}% catch rate</div>
                </div>
                <div class="${shinyCardClass}">
                    <div class="zzz-kpi-label">Shinies</div>
                    <div class="zzz-kpi-value">${summary.shinies}/${summary.shinyEncounters}</div>
                    <div class="zzz-kpi-sub">${summary.shinies > 0 ? 'Shiny caught!' : 'Seen vs Caught'}</div>
                </div>
            </div>

            ${catchesSectionHtml}

            <div class="zzz-section-card">
                <div class="zzz-section-title">Loot &amp; Drops</div>
                <div class="zzz-loot-grid">${lootChipsHtml}</div>
                ${missedHtml}
            </div>

            <div class="zzz-supplies-row">
                <div class="zzz-supply-item">
                    ${ballIconHtml}
                    <div>
                        <div class="zzz-supply-label">Balls Used</div>
                        <div class="zzz-supply-val">${ballUsedStr}</div>
                    </div>
                </div>
                <div class="zzz-supply-item">
                    ${potionIconHtml}
                    <div>
                        <div class="zzz-supply-label">Potions Used</div>
                        <div class="zzz-supply-val">${potionUsedStr}</div>
                    </div>
                </div>
                ${summary.partyFaints > 0 ? `
                <div class="zzz-supply-item zzz-supply-faint">
                    <span class="zzz-supply-none">💀</span>
                    <div>
                        <div class="zzz-supply-label">Faints</div>
                        <div class="zzz-supply-val">${summary.partyFaints}</div>
                    </div>
                </div>` : ''}
            </div>

            <button id="btn-zzz-results-close-dynamic" class="zzz-btn zzz-btn-claim">Claim Rewards</button>
        </div>
    `;
}

/**
 * Build the HTML for the "Wake Up <Region>?" confirmation modal.
 */
export function buildZzZWakeUpModalHtml(regionName, state = {}, config = ZZZ_CONFIG) {
    const regionState = state?.currentRegionName === regionName
        ? state
        : (state?.regions?.[regionName] || {});
    const routeRaw = regionState.currentRoute || state?.currentRoute || 'Unknown Route';
    const routeName = routeRaw.replace(/\s*\([^)]+\)$/, '');

    let huntInfo = '1h 0m 0s Offline Hunt';
    if (config.useGrainBased) {
        const startTs = regionState.zzzTimestamp ?? Date.now();
        const grains = regionState?.stats?.jigglypuffGrains || 0;
        const elapsed = Math.min(Math.max(0, Date.now() - startTs), grains * config.msPerGrain);
        huntInfo = `${formatZzZDuration(elapsed)} elapsed`;
    }

    return `
        <div class="content-panel zzz-panel zzz-wakeup-panel">
            <div class="zzz-hero-card zzz-wakeup-hero">
                <span class="zzz-star s1"></span>
                <span class="zzz-star s2"></span>
                <span class="zzz-star s3"></span>
                <span class="zzz-star s4"></span>
                <div class="zzz-dust-wrap zzz-wakeup-icon-wrap">
                    <div class="zzz-dust-aura zzz-wakeup-aura"></div>
                    <img src="Assets/Extra/Icons/IconSleep.png" class="zzz-dust-img zzz-wakeup-icon" alt="ZzZ Mode">
                </div>
                <div class="zzz-stats-col">
                    <div class="zzz-badge">🌙 Sleeping in ${regionName}</div>
                    <div class="zzz-wakeup-title">Ready to wake up?</div>
                    <div class="zzz-wakeup-sub">End ZzZ Mode and collect your offline hunt rewards.</div>
                    <div class="zzz-wakeup-meta">
                        <span>📍 ${routeName}</span>
                        <span>⏳ ${huntInfo}</span>
                    </div>
                </div>
            </div>

            <div class="zzz-actions">
                <button id="btn-zzz-wakeup-yes" class="zzz-btn zzz-btn-claim">Wake Up &amp; Collect</button>
                <button id="btn-zzz-wakeup-no" class="zzz-btn zzz-btn-cancel">Keep Sleeping</button>
            </div>
        </div>
    `;
}
