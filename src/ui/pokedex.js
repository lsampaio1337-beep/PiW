import { state } from '../state.js';
import { showModal, TYPE_COLORS } from '../ui.js';

export function formatType(typeStr) {
    if (!typeStr || !TYPE_COLORS[typeStr]) return typeStr;
    const color = TYPE_COLORS[typeStr];
    return `<span style="color: ${color}; display: inline-flex; align-items: center; gap: 4px;">
                <img src="Assets/Extra/Types/Type ${typeStr}.png" style="height: 14px;"> ${typeStr}
            </span>`;
}

export function formatTypes(obj) {
    return Object.keys(obj).length ? Object.keys(obj).map(t => formatType(t)).join(', ') : 'None';
}


function getPokemonById(id, state) {
    if (!state?.config) return undefined;
    if (state.config.pokemonMap) {
        return state.config.pokemonMap.get(id) || state.config.pokemonMap.get(Number(id));
    }
    return state.config.pokemonData?.find(p => p.id === id || p.canonId === id);
}

const VARIATION_SPECIES_IDS = new Set([201, 351, 386, 550, 555, 641, 642, 645, 646, 648]);

function getSpeciesVariations(baseId, state) {
    const padded = String(baseId).padStart(4, '0');
    const all = (state?.config?.pokemonData || []).filter(
        p => p && typeof p.canonId === 'string' && p.canonId.startsWith(`${padded}.`)
    );
    const regionName = state?.currentRegionName || 'Kanto';

    if (baseId === 201) {
        const filtered = regionName === 'Johto'
            ? all.filter(p => !Array.isArray(p._folders) || p._folders.includes(1))
            : all;

        const getFormLabel = (name) => {
            const m = /\(([^)]+)\)/.exec(name || '');
            return m ? m[1] : name || '';
        };
        return filtered.slice().sort((a, b) => {
            const la = getFormLabel(a.name);
            const lb = getFormLabel(b.name);
            const aIsSpecial = la === 'Em' || la === 'Qm';
            const bIsSpecial = lb === 'Em' || lb === 'Qm';
            if (aIsSpecial !== bIsSpecial) return aIsSpecial ? 1 : -1;
            return la.localeCompare(lb);
        });
    }

    if (baseId === 550 && !['Hisui', 'Paldea'].includes(regionName)) {
        return all.filter(p => p.canonId !== '0550.3');
    }

    if (baseId === 555 && !['Galar', 'Hisui', 'Paldea'].includes(regionName)) {
        return all.filter(p => p.canonId !== '0555.1' && p.canonId !== '0555.2');
    }

    if (baseId === 351 || baseId === 646) {
        const baseEntry = getPokemonById(baseId, state);
        return baseEntry ? [baseEntry, ...all] : all;
    }

    return all;
}

function getVariationAggregateStatus(baseId, state, ownedIds) {
    const variations = getSpeciesVariations(baseId, state);
    let isSeen = false;
    let isCaught = false;
    let hasSeenShiny = false;
    let hasCaughtShiny = false;
    let caughtVarCount = 0;

    const checkEntry = (entry) => {
        if (!entry) return { seen: false, caught: false, seenShiny: false, caughtShiny: false };
        const key = entry.canonId || entry.id;
        const seen = Boolean(state.stats.seenSpecies && state.stats.seenSpecies[entry.name]);
        const caught = Boolean(
            (state.stats.caughtSpecies && state.stats.caughtSpecies[entry.name]) ||
            ownedIds.has(entry.id) ||
            ownedIds.has(key)
        );
        const seenShiny = Boolean(state.stats.seenShiniesSpecies && state.stats.seenShiniesSpecies[entry.name]);
        const caughtShiny = Boolean(state.stats.caughtShiniesSpecies && state.stats.caughtShiniesSpecies[entry.name]);
        return { seen, caught, seenShiny, caughtShiny };
    };

    const baseEntry = getPokemonById(baseId, state);
    const baseSt = checkEntry(baseEntry);
    if (baseSt.seen) isSeen = true;
    if (baseSt.caught) isCaught = true;
    if (baseSt.seenShiny) hasSeenShiny = true;
    if (baseSt.caughtShiny) hasCaughtShiny = true;

    for (const v of variations) {
        const st = checkEntry(v);
        if (st.seen) isSeen = true;
        if (st.caught) {
            isCaught = true;
            caughtVarCount++;
        }
        if (st.seenShiny) hasSeenShiny = true;
        if (st.caughtShiny) hasCaughtShiny = true;
    }

    return {
        isSeen,
        isCaught,
        hasSeenShiny,
        hasCaughtShiny,
        caughtVarCount,
        totalVarCount: variations.length,
    };
}

function getOwnedSpeciesIds(state) {
    const ownedIds = new Set();
    const lists = [state.party, state.storage, state.safe, state.breeding, state.training];
    for (const list of lists) {
        if (list) {
            for (const p of list) {
                ownedIds.add(p.id);
            }
        }
    }
    return ownedIds;
}

export function hasEncounteredSpecies(id, state) {
    const pData = getPokemonById(id, state);
    if (!pData) return false;
    return (state.stats.seenSpecies && state.stats.seenSpecies[pData.name]) ||
           (state.stats.caughtSpecies && state.stats.caughtSpecies[pData.name]) ||
           state.party.some(p => p.id === id) ||
           state.storage.some(p => p.id === id) ||
           state.safe.some(p => p.id === id) ||
           state.breeding.some(p => p.id === id) ||
           state.training.some(p => p.id === id) ||
           false;
}

export function hasSeenSpecies(id, state) {
    const pData = getPokemonById(id, state);
    if (!pData) return false;
    return (state.stats.seenSpecies && state.stats.seenSpecies[pData.name]);
}

export function hasCaughtSpecies(id, state) {
    const pData = getPokemonById(id, state);
    if (!pData) return false;
    return (state.stats.caughtSpecies && state.stats.caughtSpecies[pData.name]) ||
           state.party.some(p => p.id === id) ||
           state.storage.some(p => p.id === id) ||
           state.safe.some(p => p.id === id) ||
           state.breeding.some(p => p.id === id) ||
           state.training.some(p => p.id === id) ||
           false;
}

let activePokedexFilter = 'all';
let activePokedexTypeFilter = 'all';
let activePokedexSort = 'num';

window.setPokedexFilter = function(filter) {
    activePokedexFilter = filter || 'all';
    const btns = document.querySelectorAll('#pokedex-filter-group .pokedex-filter-btn');
    btns.forEach(btn => {
        btn.classList.toggle('is-active', btn.dataset.filter === activePokedexFilter);
    });
    window.applyPokedexFilters();
};

window.setPokedexTypeFilter = function(type) {
    activePokedexTypeFilter = (type || 'all').toLowerCase();
    window.applyPokedexFilters();
};

window.setPokedexSort = function(sortBy) {
    activePokedexSort = sortBy || 'num';
    window.applyPokedexFilters();
};

window.applyPokedexFilters = function() {
    const searchEl = document.getElementById('pokedex-search-input');
    const query = (searchEl ? searchEl.value : '').trim().toLowerCase();
    const grid = document.getElementById('pokedex-grid');
    const cards = document.querySelectorAll('#pokedex-grid .pokedex-card');
    const cardList = Array.from(cards);

    if (grid && cardList.length > 0) {
        cardList.sort((a, b) => {
            if (activePokedexSort === 'name') {
                const nA = (a.dataset.name || 'zzz').toLowerCase();
                const nB = (b.dataset.name || 'zzz').toLowerCase();
                return nA.localeCompare(nB) || (Number(a.dataset.num) - Number(b.dataset.num));
            }
            if (activePokedexSort === 'bst') {
                const bA = a.dataset.status === 'caught' ? Number(a.dataset.bst || 0) : -1;
                const bB = b.dataset.status === 'caught' ? Number(b.dataset.bst || 0) : -1;
                return (bB - bA) || (Number(a.dataset.num) - Number(b.dataset.num));
            }
            return Number(a.dataset.num) - Number(b.dataset.num);
        });
        cardList.forEach(card => grid.appendChild(card));
    }

    cardList.forEach(card => {
        const name = (card.dataset.name || '').toLowerCase();
        const num = (card.dataset.num || '').toLowerCase();
        const status = card.dataset.status || 'unseen';
        const isShiny = card.dataset.shiny === '1';
        const types = (card.dataset.types || '').toLowerCase();

        const matchesQuery = !query || name.includes(query) || num.includes(query) || (`#${num}`).includes(query);
        let matchesFilter = true;
        if (activePokedexFilter === 'caught') matchesFilter = status === 'caught';
        else if (activePokedexFilter === 'seen') matchesFilter = status === 'seen' || status === 'caught';
        else if (activePokedexFilter === 'unseen') matchesFilter = status === 'unseen';
        else if (activePokedexFilter === 'shiny') matchesFilter = isShiny;

        const matchesType = activePokedexTypeFilter === 'all' || (types && types.split(',').includes(activePokedexTypeFilter));

        card.style.display = (matchesQuery && matchesFilter && matchesType) ? 'flex' : 'none';
    });
};

export function showPokedex() {
    activePokedexFilter = 'all';
    activePokedexTypeFilter = 'all';
    activePokedexSort = 'num';
    const regionName = state.currentRegionName || 'Kanto';
    let html = `<div class="pokedex-container">`;

    if (!state.config.pokemonData) {
        html += `<div style="padding: 20px; text-align: center;"><p>Loading Pokedex data...</p></div>`;
    } else {
        const regionIdField = regionName.toLowerCase() + '_id';
        const regionalDex = state.config.pokemonData.filter(p => p[regionIdField] !== undefined);
        regionalDex.sort((a, b) => a[regionIdField] - b[regionIdField]);
        const ownedIds = getOwnedSpeciesIds(state);

        let seenCount = 0;
        let caughtCount = 0;
        let shinyCount = 0;
        let cardsHtml = '';
        const typeSet = new Set();

        for (const pData of regionalDex) {
            let isSeen = Boolean(state.stats.seenSpecies && state.stats.seenSpecies[pData.name]);
            let isCaught = Boolean((state.stats.caughtSpecies && state.stats.caughtSpecies[pData.name]) || ownedIds.has(pData.id));
            let hasSeenShiny = Boolean(state.stats.seenShiniesSpecies && state.stats.seenShiniesSpecies[pData.name]);
            let hasCaughtShiny = Boolean(state.stats.caughtShiniesSpecies && state.stats.caughtShiniesSpecies[pData.name]);
            let variationMarkHtml = '';

            if (VARIATION_SPECIES_IDS.has(pData.id)) {
                const varAgg = getVariationAggregateStatus(pData.id, state, ownedIds);
                isSeen = varAgg.isSeen;
                isCaught = varAgg.isCaught;
                hasSeenShiny = varAgg.hasSeenShiny;
                hasCaughtShiny = varAgg.hasCaughtShiny;
                if (isCaught && varAgg.totalVarCount > 0) {
                    variationMarkHtml = `<button type="button" class="pokedex-variation-mark" title="${pData.name} Variations (${varAgg.caughtVarCount}/${varAgg.totalVarCount})" onclick="window.showVariationsModal(${pData.id}, event)">◆</button>`;
                }
            }

            if (isSeen || isCaught) seenCount++;
            if (isCaught) caughtCount++;
            if (hasCaughtShiny) shinyCount++;

            const isRevealed = isCaught || hasCaughtShiny;
            const filter = isRevealed ? "none" : "brightness(0)";
            const onClick = isRevealed ? `onclick="window.showDexEntry(${pData.id})"` : "";
            const displayName = isRevealed ? pData.name : "???";
            const status = isCaught ? 'caught' : (isSeen ? 'seen' : 'unseen');
            const pTypes = Array.isArray(pData.types) ? pData.types : [];
            if (isRevealed) pTypes.forEach(t => typeSet.add(t));
            const bst = (pData.hp || 0) + (pData.atk || 0) + (pData.def || 0) + (pData.spa || 0) + (pData.spd || 0) + (pData.spe || 0);

            let cardClass = "pokedex-card";
            if (isRevealed) cardClass += " is-clickable";
            if (!isSeen && !isCaught) {
                cardClass += " is-unseen";
            } else if (!isRevealed) {
                cardClass += " is-seen-only";
            }

            if (isSeen || isCaught) {
                if (hasSeenShiny || hasCaughtShiny) {
                    cardClass += " pokedex-card-shiny";
                }
                if (hasCaughtShiny) {
                    cardClass += " pokedex-card-shiny-rotate";
                }
            }

            cardsHtml += `<div class="${cardClass}" data-name="${isRevealed ? pData.name : ''}" data-num="${pData[regionIdField]}" data-status="${status}" data-shiny="${hasCaughtShiny ? '1' : '0'}" data-types="${isRevealed ? pTypes.join(',').toLowerCase() : ''}" data-bst="${bst}" ${onClick}>
                ${variationMarkHtml}
                <div class="pokedex-card-num">#${pData[regionIdField]}</div>
                <div class="pokedex-card-name" title="${displayName}">${displayName}</div>
                <img class="pokedex-card-img" src="${window.getSpriteUrl(pData.id, false)}" style="filter: ${filter};">
            </div>`;
        }

        const total = regionalDex.length;
        const pct = total > 0 ? Math.round((caughtCount / total) * 100) : 0;
        const typeOptions = Array.from(typeSet).sort().map(t => `<option value="${t.toLowerCase()}">${t}</option>`).join('');

        html += `
            <div class="pokedex-header">
                <div class="pokedex-stats-row">
                    <div class="pokedex-stats-pills">
                        <span class="pokedex-stat-pill is-caught">Caught: ${caughtCount}/${total} (${pct}%)</span>
                        <span class="pokedex-stat-pill">Seen: ${seenCount}/${total}</span>
                        <span class="pokedex-stat-pill is-shiny">Shiny: ${shinyCount}/${total}</span>
                    </div>
                    <div class="pokedex-progress-wrap" title="Pokedex Completion: ${pct}%">
                        <div class="pokedex-progress-bar" style="width: ${pct}%;"></div>
                    </div>
                </div>
                <div class="pokedex-controls-row">
                    <input id="pokedex-search-input" class="pokedex-search" type="text" placeholder="Search by name or #..." oninput="window.applyPokedexFilters()">
                    <select id="pokedex-type-select" class="piw-select" style="padding: 4px 8px; font-size: 11.5px;" onchange="window.setPokedexTypeFilter(this.value)">
                        <option value="all">All Types</option>
                        ${typeOptions}
                    </select>
                    <select id="pokedex-sort-select" class="piw-select" style="padding: 4px 8px; font-size: 11.5px;" onchange="window.setPokedexSort(this.value)">
                        <option value="num">Sort: #</option>
                        <option value="name">Sort: A-Z</option>
                        <option value="bst">Sort: BST</option>
                    </select>
                    <div id="pokedex-filter-group" class="pokedex-filter-group">
                        <button class="pokedex-filter-btn is-active" data-filter="all" onclick="window.setPokedexFilter('all')">All</button>
                        <button class="pokedex-filter-btn" data-filter="caught" onclick="window.setPokedexFilter('caught')">Caught</button>
                        <button class="pokedex-filter-btn" data-filter="seen" onclick="window.setPokedexFilter('seen')">Seen</button>
                        <button class="pokedex-filter-btn" data-filter="unseen" onclick="window.setPokedexFilter('unseen')">Unseen</button>
                        <button class="pokedex-filter-btn" data-filter="shiny" onclick="window.setPokedexFilter('shiny')">Shiny</button>
                    </div>
                </div>
            </div>
            <div id="pokedex-grid" class="pokedex-grid">
                ${cardsHtml}
            </div>
        `;
    }

    html += `
        <div id="pokedex-inner-modal-overlay" class="pokedex-inner-modal-overlay" style="display: none;" onclick="window.closePokedexInnerModal(event)">
            <div class="pokedex-inner-modal">
                <div class="pokedex-inner-modal-header">
                    <span id="pokedex-inner-modal-title">Unown Variations</span>
                    <button type="button" class="window-ctrl-btn is-close" onclick="window.closePokedexInnerModal()">X</button>
                </div>
                <div id="pokedex-inner-modal-content" class="pokedex-inner-modal-content"></div>
            </div>
        </div>
    </div>`;
    showModal(`${regionName} Pokedex`, html, "window-pokedex");

    const searchInput = document.getElementById('pokedex-search-input');
    if (searchInput && typeof searchInput.addEventListener === 'function') {
        searchInput.addEventListener('input', () => window.applyPokedexFilters());
    }
    const filterBtns = document.querySelectorAll('#pokedex-filter-group .pokedex-filter-btn');
    filterBtns.forEach(btn => {
        if (typeof btn.addEventListener === 'function') {
            btn.addEventListener('click', () => window.setPokedexFilter(btn.dataset.filter));
        }
    });
}

export function closePokedexInnerModal(e) {
    const overlay = document.getElementById('pokedex-inner-modal-overlay');
    if (!overlay) return;
    if (e && e.target !== overlay) return;
    overlay.style.display = 'none';
}
window.closePokedexInnerModal = closePokedexInnerModal;

export function showVariationsModal(baseId, e) {
    if (e && typeof e.stopPropagation === 'function') {
        e.stopPropagation();
    }
    const baseEntry = getPokemonById(baseId, state);
    const speciesName = baseEntry ? baseEntry.name : `#${baseId}`;
    const modalTitle = `${speciesName} Variations`;
    const variations = getSpeciesVariations(baseId, state);
    const ownedIds = getOwnedSpeciesIds(state);
    let seenCount = 0;
    let caughtCount = 0;
    let shinyCount = 0;
    let cardsHtml = '';

    for (const v of variations) {
        const varId = v.canonId || v.id;
        const isSeen = Boolean(state.stats.seenSpecies && state.stats.seenSpecies[v.name]);
        const isCaught = Boolean(
            (state.stats.caughtSpecies && state.stats.caughtSpecies[v.name]) ||
            ownedIds.has(v.id) ||
            ownedIds.has(varId)
        );
        const hasSeenShiny = Boolean(state.stats.seenShiniesSpecies && state.stats.seenShiniesSpecies[v.name]);
        const hasCaughtShiny = Boolean(state.stats.caughtShiniesSpecies && state.stats.caughtShiniesSpecies[v.name]);

        if (isSeen || isCaught) seenCount++;
        if (isCaught) caughtCount++;
        if (hasCaughtShiny) shinyCount++;

        const isRevealed = isCaught || hasCaughtShiny;
        const filter = isRevealed ? 'none' : 'brightness(0)';
        const formMatch = /\(([^)]+)\)/.exec(v.name || '');
        const formLabel = formMatch ? formMatch[1] : 'Normal';
        const resolvedName = (baseId === 351 && v.id === 351) ? 'Castform (Normal Form)' : v.name;
        const displayName = isRevealed ? resolvedName : '???';
        const cardNumLabel = baseId === 201 ? `#201 ${formLabel}` : `#${baseId}`;
        const onClick = isRevealed ? `onclick="window.showDexEntry('${varId}')"` : '';

        let cardClass = 'pokedex-card';
        if (isRevealed) cardClass += ' is-clickable';
        if (!isSeen && !isCaught) {
            cardClass += ' is-unseen';
        } else if (!isRevealed) {
            cardClass += ' is-seen-only';
        }
        if (isSeen || isCaught) {
            if (hasSeenShiny || hasCaughtShiny) cardClass += ' pokedex-card-shiny';
            if (hasCaughtShiny) cardClass += ' pokedex-card-shiny-rotate';
        }

        cardsHtml += `<div class="${cardClass}" ${onClick}>
            <div class="pokedex-card-num">${cardNumLabel}</div>
            <div class="pokedex-card-name" title="${displayName}">${displayName}</div>
            <img class="pokedex-card-img" src="${window.getSpriteUrl(varId, false)}" style="filter: ${filter};">
        </div>`;
    }

    const total = variations.length;
    const pct = total > 0 ? Math.round((caughtCount / total) * 100) : 0;
    const html = `
        <div class="pokedex-container">
            <div class="pokedex-header">
                <div class="pokedex-stats-row">
                    <div class="pokedex-stats-pills">
                        <span class="pokedex-stat-pill is-caught">Caught: ${caughtCount}/${total} (${pct}%)</span>
                        <span class="pokedex-stat-pill">Seen: ${seenCount}/${total}</span>
                        <span class="pokedex-stat-pill is-shiny">Shiny: ${shinyCount}/${total}</span>
                    </div>
                    <div class="pokedex-progress-wrap" title="${modalTitle} Completion: ${pct}%">
                        <div class="pokedex-progress-bar" style="width: ${pct}%;"></div>
                    </div>
                </div>
            </div>
            <div class="pokedex-grid">
                ${cardsHtml}
            </div>
        </div>
    `;

    const overlay = document.getElementById('pokedex-inner-modal-overlay');
    const titleEl = document.getElementById('pokedex-inner-modal-title');
    const contentEl = document.getElementById('pokedex-inner-modal-content');
    if (overlay && contentEl && (
        (window.windowManager && typeof window.windowManager._parseAndSanitizeToElement === 'function') ||
        (typeof DOMParser !== 'undefined' && typeof contentEl.replaceChildren === 'function')
    )) {
        if (titleEl) titleEl.textContent = modalTitle;
        if (window.windowManager && typeof window.windowManager._parseAndSanitizeToElement === 'function') {
            window.windowManager._parseAndSanitizeToElement(html, contentEl);
        } else {
            const doc = new DOMParser().parseFromString(html, 'text/html');
            contentEl.replaceChildren(...doc.body.childNodes);
        }
        overlay.style.display = 'flex';
        return;
    }

    showModal(modalTitle, html, 'window-pokedex-unown-variations');
}
export function showUnownVariationsModal(e) {
    return showVariationsModal(201, e);
}
window.showVariationsModal = showVariationsModal;
window.showUnownVariationsModal = showUnownVariationsModal;

export function showDexEntry(id) {
    const pData = getPokemonById(id, state);
    if (!pData) return;

    const spriteId = (pData.canonId && pData.canonId.includes('.')) ? pData.canonId : pData.id;
    const domSafeId = String(spriteId).replace(/[^a-zA-Z0-9_-]/g, '-');
    const hasSeenShiny = state.stats.seenShiniesSpecies && state.stats.seenShiniesSpecies[pData.name];
    const buttonStyle = hasSeenShiny ? "display: inline-block;" : "display: none;";

    const speciesHtml = getSpeciesDataHtml(pData, state);
    const evoTreeHtml = buildEvolutionLineHtml(pData, state);

    const html = `
        <div class="content-panel" style="text-align:center; height: 100%; overflow-y: auto; padding: 14px; box-sizing: border-box;">
            <div class="pstats-card" style="margin-bottom: 12px; display: flex; flex-direction: column; align-items: center;">
                <h2 style="margin: 0 0 8px 0; color: var(--piw-text-primary);">#${pData.id} ${pData.name}</h2>
                <img id="dex-sprite-${domSafeId}" src="${window.getSpriteUrl(spriteId, false)}" style="width: 100px; height: 100px; object-fit: contain;">
                <div style="margin: 8px 0; display: flex; gap: 8px;">
                    <button class="piw-btn piw-btn-warning piw-btn-sm" style="${buttonStyle}" onclick="document.getElementById('dex-sprite-${domSafeId}').src = '${window.getSpriteUrl(spriteId, true)}'">Shiny</button>
                    <button class="piw-btn piw-btn-secondary piw-btn-sm" style="${buttonStyle}" onclick="document.getElementById('dex-sprite-${domSafeId}').src = '${window.getSpriteUrl(spriteId, false)}'">Normal</button>
                </div>
                <div style="font-size: 14px;"><b>Type:</b> ${pData.types.map(t => formatType(t)).join(' ')}</div>
            </div>

            ${speciesHtml}
            ${evoTreeHtml}
        </div>
    `;

    showModal(`Pokedex Entry - ${pData.name}`, html, `window-pokedex-entry-${domSafeId}`);

    const entryWin = document.getElementById(`window-pokedex-entry-${domSafeId}`);
    if (entryWin && typeof entryWin.querySelectorAll === 'function') {
        const spriteEl = entryWin.querySelector(`#dex-sprite-${domSafeId}`);
        entryWin.querySelectorAll('button').forEach(btn => {
            if (btn.textContent === 'Shiny') {
                btn.onclick = () => {
                    if (spriteEl) spriteEl.src = window.getSpriteUrl(spriteId, true);
                };
            } else if (btn.textContent === 'Normal') {
                btn.onclick = () => {
                    if (spriteEl) spriteEl.src = window.getSpriteUrl(spriteId, false);
                };
            }
        });
    }
}

function isPokemonInRegion(pd, state) {
    if (!pd) return false;
    const regionName = state.currentRegionName || 'Kanto';
    const regionIdField = regionName.toLowerCase() + '_id';
    return pd[regionIdField] !== undefined;
}

export function buildEvolutionLineHtml(pData, state) {
    let baseId = pData.id;
    const visitedParents = new Set([baseId]);
    while (state.config.evolutionParents && state.config.evolutionParents[baseId] !== undefined) {
        const parentId = state.config.evolutionParents[baseId];
        if (visitedParents.has(parentId) || !isPokemonInRegion(getPokemonById(parentId, state), state)) {
            break;
        }
        visitedParents.add(parentId);
        baseId = parentId;
    }

    const visitedNodes = new Set();

    function buildTree(currentId, allowFormChanges = true) {
        const pd = getPokemonById(currentId, state);
        if (!pd) return "";
        const nodeKey = pd.canonId || pd.id;
        if (visitedNodes.has(nodeKey)) return "";
        visitedNodes.add(nodeKey);

        const hasEncountered = hasEncounteredSpecies(currentId, state);
        const hasCaughtShiny = state.stats.caughtShiniesSpecies && state.stats.caughtShiniesSpecies[pd.name];
        const isRevealed = hasEncountered || hasCaughtShiny;
        let filter = isRevealed ? "none" : "brightness(0)";
        let cursor = isRevealed ? "pointer" : "default";
        let onClick = isRevealed ? `onclick="window.showDexEntry('${nodeKey}')"` : "";
        let displayName = isRevealed ? pd.name : "???";

        let html = `<div style="display: flex; flex-direction: column; align-items: center; margin: 5px;">
            <img src="${window.getSpriteUrl(nodeKey, false)}" style="width: 80px; height: 80px; filter: ${filter}; cursor: ${cursor};" ${onClick} title="${displayName}">
            <span style="font-size: 12px; cursor: ${cursor};" ${onClick}>${displayName}</span>
        </div>`;

        const validEvos = (pd.evolutions || []).filter(evo => {
            const targetPd = getPokemonById(evo.to, state);
            if (!targetPd) return false;
            const targetKey = targetPd.canonId || targetPd.id;
            if (visitedNodes.has(targetKey)) return false;
            const isFormChange = Math.trunc(Number(pd.id)) === Math.trunc(Number(targetPd.id));
            if (isFormChange) return allowFormChanges;
            return isPokemonInRegion(targetPd, state);
        });
        if (validEvos.length > 0) {
            html = `<div style="display: flex; align-items: center;">` + html;

            let evosHtml = `<div style="display: flex; flex-direction: column; justify-content: center; margin-left: 10px;">`;
            for (const evo of validEvos) {
                const targetPd = getPokemonById(evo.to, state);
                const isFormChange = targetPd && Math.trunc(Number(pd.id)) === Math.trunc(Number(targetPd.id));
                evosHtml += `<div style="display: flex; align-items: center; margin: 5px 0;">
                    <div style="font-size: 12px; color: #aaa; margin-right: 5px;">Lv.${evo.level} ➔</div>
                    ${buildTree(evo.to, !isFormChange)}
                </div>`;
            }
            evosHtml += `</div>`;
            html += evosHtml + `</div>`;
        }

        return html;
    }

    let treeHtml = buildTree(baseId);
    return `<div class="pstats-card" style="text-align: left; margin: 12px 0; font-size: 14px; overflow-x: auto; max-height: 220px; overflow-y: auto;">
        <h4 style="margin: 0 0 10px 0; color: var(--piw-accent-teal); text-transform: uppercase; font-size: 12.5px; letter-spacing: 0.4px;">Evolution Line</h4>
        <div style="display: flex; align-items: center; justify-content: center;">
            ${treeHtml}
        </div>
    </div>`;
}

export function getSpeciesDataHtml(pData, state) {
    const bst = pData.hp + pData.atk + pData.def + pData.spa + pData.spd + pData.spe;

    // Calculate Type Effectiveness
    const tConfig = state.config.types;
    let defMatchups = {};
    let offMatchups = {};

    // Defending Matchups
    for (const atkType in tConfig) {
        let multiplier = 1;
        for (const defType of pData.types) {
            if (tConfig[atkType] && tConfig[atkType][defType] !== undefined) {
                multiplier *= tConfig[atkType][defType];
            }
        }
        if (multiplier !== 1) defMatchups[atkType] = multiplier;
    }

    // Attacking Matchups
    for (const defType in tConfig) {
        let maxMult = 0;
        for (const atkType of pData.types) {
            let m = 1;
            if (tConfig[atkType] && tConfig[atkType][defType] !== undefined) {
                m = tConfig[atkType][defType];
            }
            if (m > maxMult) maxMult = m;
        }
        if (maxMult !== 1) offMatchups[defType] = maxMult;
    }

    const def4x = {}, def2x = {}, def05x = {}, def025x = {}, def0x = {};
    for (const t in defMatchups) {
        if (defMatchups[t] === 4) def4x[t] = 4;
        else if (defMatchups[t] === 2) def2x[t] = 2;
        else if (defMatchups[t] === 0.5) def05x[t] = 0.5;
        else if (defMatchups[t] === 0.25) def025x[t] = 0.25;
        else if (defMatchups[t] === 0) def0x[t] = 0;
    }

    const off2x = {}, off05x = {}, off0x = {};
    for (const t in offMatchups) {
        if (offMatchups[t] === 2) off2x[t] = 2;
        else if (offMatchups[t] === 0.5) off05x[t] = 0.5;
        else if (offMatchups[t] === 0) off0x[t] = 0;
    }

    let movesHtml = `
        <div class="pstats-card" style="margin: 12px 0; text-align: left;">
            <h4 style="margin: 0 0 8px 0; border-bottom: var(--piw-border-subtle); padding-bottom: 6px; color: var(--piw-accent-teal); text-transform: uppercase; font-size: 12.5px; letter-spacing: 0.4px;">Moveset</h4>
            <div style="max-height: 240px; overflow-y: auto;">
                <table style="width: 100%; text-align: left; font-size: 13px; border-collapse: collapse;">
                    <thead>
                        <tr style="border-bottom: 1px solid rgba(255,255,255,0.2); color: var(--piw-text-muted);">
                            <th style="padding: 4px 6px;">Lvl</th>
                            <th style="padding: 4px 6px;">Move</th>
                            <th style="padding: 4px 6px;">Type</th>
                            <th style="padding: 4px 6px;">Pwr</th>
                            <th style="padding: 4px 6px;">Cat</th>
                        </tr>
                    </thead>
                    <tbody>
    `;
    if (pData.learnset) {
        pData.learnset.forEach((m, idx) => {
            let mData = state.config.moves[m.move];
            const rowBg = idx % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'transparent';
            movesHtml += `<tr style="border-bottom: 1px solid rgba(255,255,255,0.06); background: ${rowBg};">
                <td style="padding: 5px 6px;">${m.level}</td>
                <td style="padding: 5px 6px; font-weight: bold;">${m.move}</td>
                <td style="padding: 5px 6px;">${mData ? formatType(mData.type) : '?'}</td>
                <td style="padding: 5px 6px;">${mData ? mData.power : '?'}</td>
                <td style="padding: 5px 6px;">${mData ? mData.category : '?'}</td>
            </tr>`;
        });
    }
    movesHtml += `</tbody></table></div></div>`;

    const statBar = (label, val) => {
        const pct = Math.min(100, Math.round((val / 180) * 100));
        const fillColor = val >= 120 ? '#22c55e' : val >= 85 ? '#38bdf8' : val >= 55 ? '#f59e0b' : '#ef4444';
        return `
            <div style="background: rgba(15,23,42,0.55); padding: 7px 10px; border-radius: 7px; border: 1px solid rgba(255,255,255,0.07);">
                <div style="display: flex; justify-content: space-between; font-size: 11.5px; margin-bottom: 4px;">
                    <span style="color: var(--piw-text-muted); font-weight: 600;">${label}</span>
                    <span style="font-weight: 800; color: var(--piw-text-primary);">${val}</span>
                </div>
                <div class="pstats-stat-track"><div class="pstats-stat-fill" style="width: ${pct}%; background: ${fillColor};"></div></div>
            </div>
        `;
    };

    return `
        <div class="pstats-card" style="margin: 12px 0; text-align: left;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; border-bottom: var(--piw-border-subtle); padding-bottom: 6px;">
                <h4 style="margin: 0; color: var(--piw-accent-teal); text-transform: uppercase; font-size: 12.5px; letter-spacing: 0.4px;">Base Stats</h4>
                <span class="piw-badge is-blue">BST: ${bst}</span>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(95px, 1fr)); gap: 8px;">
                ${statBar('HP', pData.hp)}
                ${statBar('Speed', pData.spe)}
                ${statBar('Atk', pData.atk)}
                ${statBar('SpAtk', pData.spa)}
                ${statBar('Def', pData.def)}
                ${statBar('SpDef', pData.spd)}
            </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px; margin: 12px 0; text-align: left; font-size: 13px;">
            <div class="pstats-card">
                <h4 style="margin: 0 0 8px 0; border-bottom: var(--piw-border-subtle); padding-bottom: 6px; color: var(--piw-accent-teal); text-transform: uppercase; font-size: 12.5px; letter-spacing: 0.4px;">Defensive Effectiveness</h4>
                <div style="display: flex; flex-direction: column; gap: 4px;">
                    ${Object.keys(def4x).length ? `<div><b>Very Weak To (4x):</b> ${formatTypes(def4x)}</div>` : ''}
                    ${Object.keys(def2x).length ? `<div><b>Weak To (2x):</b> ${formatTypes(def2x)}</div>` : ''}
                    ${Object.keys(def05x).length ? `<div><b>Resists (0.5x):</b> ${formatTypes(def05x)}</div>` : ''}
                    ${Object.keys(def025x).length ? `<div><b>Strongly Resists (0.25x):</b> ${formatTypes(def025x)}</div>` : ''}
                    ${Object.keys(def0x).length ? `<div><b>Immune To (0x):</b> ${formatTypes(def0x)}</div>` : ''}
                </div>
            </div>

            <div class="pstats-card">
                <h4 style="margin: 0 0 8px 0; border-bottom: var(--piw-border-subtle); padding-bottom: 6px; color: var(--piw-accent-teal); text-transform: uppercase; font-size: 12.5px; letter-spacing: 0.4px;">Offensive Effectiveness</h4>
                <div style="display: flex; flex-direction: column; gap: 4px;">
                    ${Object.keys(off2x).length ? `<div><b>Super Effective (2x):</b> ${formatTypes(off2x)}</div>` : ''}
                    ${Object.keys(off05x).length ? `<div><b>Not Very Effective (0.5x):</b> ${formatTypes(off05x)}</div>` : ''}
                    ${Object.keys(off0x).length ? `<div><b>No Effect (0x):</b> ${formatTypes(off0x)}</div>` : ''}
                </div>
            </div>
        </div>

        ${movesHtml}
    `;
}

let isSmartCaptureShinyMode = false;
let isSmartCaptureGlobalMode = false;
let activeSmartCaptureFilter = 'all';

window.setSmartCaptureFilter = function(filter) {
    activeSmartCaptureFilter = filter || 'all';
    if (typeof document.querySelectorAll === 'function') {
        document.querySelectorAll('#smart-capture-filter-group .pokedex-filter-btn').forEach(btn => {
            btn.classList.toggle('is-active', btn.dataset?.filter === activeSmartCaptureFilter);
        });
    }
    window.applySmartCaptureFilters();
};

window.applySmartCaptureFilters = function() {
    const searchEl = document.getElementById('smart-capture-search-input');
    const query = String(searchEl && searchEl.value ? searchEl.value : '').trim().toLowerCase();
    if (typeof document.querySelectorAll !== 'function') return;
    document.querySelectorAll('#smart-capture-grid .sc-poke-card').forEach(card => {
        const name = (card.dataset?.name || '').toLowerCase();
        const num = (card.dataset?.num || '').toLowerCase();
        const caught = card.dataset?.caught === '1';
        const custom = card.dataset?.custom === '1';

        const matchesQuery = !query || name.includes(query) || num.includes(query) || (`#${num}`).includes(query);
        let matchesFilter = true;
        if (activeSmartCaptureFilter === 'caught') matchesFilter = caught;
        else if (activeSmartCaptureFilter === 'uncaught') matchesFilter = !caught;
        else if (activeSmartCaptureFilter === 'custom') matchesFilter = custom;

        card.style.display = (matchesQuery && matchesFilter) ? 'flex' : 'none';
    });
};

export function showSmartCaptureMode() {
    // Preserve scroll position if window is already open
    const gridEl = document.getElementById('smart-capture-grid');
    const savedScrollTop = gridEl ? gridEl.scrollTop : 0;

    let titleHtml = `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 6px; width: 100%;">
            <div style="font-weight: 700; font-size: 18px; color: white; letter-spacing: 0.3px;">Smart Capture Mode</div>
            <div class="piw-tab-bar" onmousedown="event.stopPropagation()">
                <button class="piw-tab-btn ${!isSmartCaptureShinyMode && !isSmartCaptureGlobalMode ? 'is-active' : ''}" onclick="window.setSmartCaptureShinyMode(false)">Normal</button>
                <button class="piw-tab-btn ${isSmartCaptureGlobalMode ? 'is-active' : ''}" onclick="window.setSmartCaptureGlobalMode()">Global</button>
                <button class="piw-tab-btn ${isSmartCaptureShinyMode && !isSmartCaptureGlobalMode ? 'is-active' : ''}" onclick="window.setSmartCaptureShinyMode(true)">Shiny</button>
            </div>
        </div>
    `;

    const controlsHtml = isSmartCaptureGlobalMode ? '' : `
        <div class="pokedex-controls-row" style="margin-bottom: 10px;">
            <input id="smart-capture-search-input" class="pokedex-search" type="text" placeholder="Search species or #..." oninput="window.applySmartCaptureFilters()">
            <div id="smart-capture-filter-group" class="pokedex-filter-group">
                <button class="pokedex-filter-btn ${activeSmartCaptureFilter === 'all' ? 'is-active' : ''}" data-filter="all" onclick="window.setSmartCaptureFilter('all')">All</button>
                <button class="pokedex-filter-btn ${activeSmartCaptureFilter === 'caught' ? 'is-active' : ''}" data-filter="caught" onclick="window.setSmartCaptureFilter('caught')">Caught</button>
                <button class="pokedex-filter-btn ${activeSmartCaptureFilter === 'uncaught' ? 'is-active' : ''}" data-filter="uncaught" onclick="window.setSmartCaptureFilter('uncaught')">Uncaught</button>
                <button class="pokedex-filter-btn ${activeSmartCaptureFilter === 'custom' ? 'is-active' : ''}" data-filter="custom" onclick="window.setSmartCaptureFilter('custom')">Custom</button>
            </div>
        </div>
    `;

    let html = `${controlsHtml}<div id="smart-capture-grid" style="display:flex; flex-wrap:wrap; justify-content:center; max-height:400px; overflow-y:auto; gap:10px; margin-top: 6px;">`;

    if (isSmartCaptureGlobalMode) {
        const balls = state.config.balance.items.pokeballs;

        // Normal Global Section
        let normalHtml = `<div style="flex: 1; display: flex; flex-direction: column; align-items: center; border-bottom: 1px solid #555; padding-bottom: 10px; margin-bottom: 10px; width: 100%;">`;
        normalHtml += `<div style="font-weight: bold; font-size: 16px; color: white; margin-bottom: 10px;">Normal</div>`;
        normalHtml += `<div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; width: 100%;">`;

        // Ignore Option for Normal Global
        let activeNormalBorder = state.settings.activeBallTier === -1 ? '#2ecc71' : '#555';
        normalHtml += `
            <div onclick="window.selectGlobalSmartCaptureBall(false, -1)" style="width: 60px; height: 60px; background: rgba(0,0,0,0.6); border: 2px solid ${activeNormalBorder}; border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; padding: 5px; box-sizing: border-box;">
                <img src="Assets/Extra/No.png" style="width: 30px; height: 30px; object-fit: contain;">
                <span style="font-size: 10px; color: white; margin-top: 5px;">Ignore</span>
            </div>
        `;

        for (let idx = 0; idx < balls.length; idx++) {
            let b = balls[idx];
            const isActive = state.settings.activeBallTier === idx;
            const borderColor = isActive ? '#2ecc71' : '#555';

            normalHtml += `
                <div onclick="window.selectGlobalSmartCaptureBall(false, ${idx})" style="width: 60px; height: 60px; background: rgba(0, 0, 0, 0.6); border: 2px solid ${borderColor}; border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; padding: 5px; box-sizing: border-box;">
                    <img src="./Assets/Items/Balls/${b.name}.png" style="width: 30px; height: 30px; object-fit: contain;">
                    <span style="font-size: 9px; color: white; margin-top: 5px; text-align: center;">${b.name}</span>
                </div>
            `;
        }
        normalHtml += `</div></div>`;

        // Shiny Global Section
        let shinyHtml = `<div style="flex: 1; display: flex; flex-direction: column; align-items: center; width: 100%;">`;
        shinyHtml += `<div style="font-weight: bold; font-size: 16px; color: white; margin-bottom: 10px;">Shiny</div>`;
        shinyHtml += `<div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; width: 100%;">`;

        // Follow Global for Shiny
        let activeShinyFollow = state.settings.globalSmartCaptureShiny === undefined ? '#2ecc71' : '#555';
        shinyHtml += `
            <div onclick="window.selectGlobalSmartCaptureBall(true, undefined)" style="width: 60px; height: 60px; background: rgba(0,0,0,0.6); border: 2px solid ${activeShinyFollow}; border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; padding: 5px; box-sizing: border-box;">
                <span style="font-size: 10px; font-weight: bold; color: white; text-align: center;">Follow Global</span>
            </div>
        `;

        // Ignore Option for Shiny Global
        let activeShinyIgnore = state.settings.globalSmartCaptureShiny === -1 ? '#2ecc71' : '#555';
        shinyHtml += `
            <div onclick="window.selectGlobalSmartCaptureBall(true, -1)" style="width: 60px; height: 60px; background: rgba(0,0,0,0.6); border: 2px solid ${activeShinyIgnore}; border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; padding: 5px; box-sizing: border-box;">
                <img src="Assets/Extra/No.png" style="width: 30px; height: 30px; object-fit: contain;">
                <span style="font-size: 10px; color: white; margin-top: 5px;">Ignore</span>
            </div>
        `;

        for (let idx = 0; idx < balls.length; idx++) {
            let b = balls[idx];
            const isActive = state.settings.globalSmartCaptureShiny === idx;
            const borderColor = isActive ? '#2ecc71' : '#555';

            shinyHtml += `
                <div onclick="window.selectGlobalSmartCaptureBall(true, ${idx})" style="width: 60px; height: 60px; background: rgba(0, 0, 0, 0.6); border: 2px solid ${borderColor}; border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; padding: 5px; box-sizing: border-box;">
                    <img src="./Assets/Items/Balls/${b.name}.png" style="width: 30px; height: 30px; object-fit: contain;">
                    <span style="font-size: 9px; color: white; margin-top: 5px; text-align: center;">${b.name}</span>
                </div>
            `;
        }
        shinyHtml += `</div></div>`;

        html += `<div style="display: flex; flex-direction: column; width: 100%; max-width: 600px; margin: 0 auto;">${normalHtml}${shinyHtml}</div>`;
        html += `</div>`;
    } else {
        if (!state.config.pokemonData) {
            html += "<p>Loading Pokedex data...</p>";
        } else {
            const regionName = state.currentRegionName || 'Kanto';
            const regionIdField = regionName.toLowerCase() + '_id';

            const regionalDex = state.config.pokemonData.filter(p => p[regionIdField] !== undefined);
            regionalDex.sort((a, b) => a[regionIdField] - b[regionIdField]);
            const ownedIds = getOwnedSpeciesIds(state);

            for(const pData of regionalDex) {
                const isSeen = Boolean(state.stats.seenSpecies && state.stats.seenSpecies[pData.name]);
                const isCaught = Boolean((state.stats.caughtSpecies && state.stats.caughtSpecies[pData.name]) || ownedIds.has(pData.id));
                const hasSeenShiny = state.stats.seenShiniesSpecies && state.stats.seenShiniesSpecies[pData.name];
                const hasCaughtShiny = state.stats.caughtShiniesSpecies && state.stats.caughtShiniesSpecies[pData.name];

                let filter = (isCaught || hasCaughtShiny) ? "none" : "brightness(0)";
                let cursor = "pointer";
                let onClick = `onclick="window.showSmartCaptureBallSelection(${pData.id})"`;
                let displayName = (isSeen || hasSeenShiny || isCaught || hasCaughtShiny) ? pData.name : "???";

                let cardClass = "pokedex-card sc-poke-card";
                // Set width dynamically assuming a ~10px gap to fit exactly 9 items per row
                let cardStyle = "width: calc((100% / 9) - 10px); text-align: center; font-size: 10px; box-sizing: border-box; position: relative; cursor: pointer;";

                if (hasCaughtShiny) {
                    cardClass += " pokedex-card-shiny pokedex-card-shiny-rotate";
                } else if (hasSeenShiny) {
                    cardClass += " pokedex-card-shiny";
                } else if (isCaught) {
                    // Keep default border from 'pokedex-card'
                } else {
                    // Not captured -> dashed muted border
                    cardStyle += " border: 1px dashed rgba(255,255,255,0.12); background: rgba(255,255,255,0.025);";
                }

                // Which ball is selected?
                let selectedBallTier = isSmartCaptureShinyMode ? state.settings.smartCaptureShiny[pData.id] : state.settings.smartCapture[pData.id];
                let ballIconHtml = '';
                if (selectedBallTier !== undefined && selectedBallTier >= 0 && selectedBallTier < state.config.balance.items.pokeballs.length) {
                    let bName = state.config.balance.items.pokeballs[selectedBallTier].name;
                    ballIconHtml = `<img src="Assets/Items/Balls/${bName}.png" style="position: absolute; top: 2px; right: 2px; width: 16px; height: 16px; filter: drop-shadow(1px 1px 0 black); pointer-events: none;">`;
                } else if (selectedBallTier === -1) {
                    ballIconHtml = `<img src="Assets/Extra/No.png" style="position: absolute; top: 2px; right: 2px; width: 16px; height: 16px; filter: drop-shadow(1px 1px 0 black); pointer-events: none;" title="Ignore">`;
                }

                // Sprite based on shiny mode
                let spriteUrl = isSmartCaptureShinyMode ? window.getSpriteUrl(pData.id, true) : window.getSpriteUrl(pData.id, false);
                const isCustom = selectedBallTier !== undefined ? '1' : '0';

                html += `<div class="${cardClass}" data-name="${(isSeen || hasSeenShiny || isCaught || hasCaughtShiny) ? pData.name : ''}" data-num="${pData[regionIdField]}" data-caught="${isCaught ? '1' : '0'}" data-custom="${isCustom}" style="${cardStyle}" ${onClick}>
                    ${ballIconHtml}
                    <div style="font-weight:bold;">#${pData[regionIdField]}</div>
                    <div style="font-size: 9px; margin-bottom: 2px;">${displayName}</div>
                    <img src="${spriteUrl}" style="width: 50px; height: 50px; filter: ${filter}; cursor: ${cursor}; pointer-events: none;">
                </div>`;
            }
        }
        html += `</div>`;
    }

    // Add the inner modal structure for ball selections/global settings
    html += `
        <div id="smart-capture-inner-modal-overlay" class="piw-inner-overlay" onclick="if(event.target === this) { this.style.display = 'none'; }" style="display: none;">
            <div id="smart-capture-inner-modal" class="floating-window" style="width: 90%; height: auto; max-height: calc(100% - 40px); display: flex; flex-direction: column; overflow: hidden; pointer-events: auto;">
                <div class="window-header" style="position: relative; cursor: default;">
                    <span id="smart-capture-inner-modal-title">Modal</span>
                    <div class="window-header-actions">
                        <span id="btn-close-smart-capture-inner-modal" class="window-ctrl-btn is-close" onclick="document.getElementById('smart-capture-inner-modal-overlay').style.display = 'none';" title="Close">X</span>
                    </div>
                </div>
                <div class="window-content-container" style="flex: 1; display: flex;">
                    <div id="smart-capture-inner-modal-content" class="content-panel" style="width: 100%; height: auto; overflow-y: auto;">
                    </div>
                </div>
            </div>
        </div>
    `;

    showModal(titleHtml, html, "window-smart-capture");
    if (!isSmartCaptureGlobalMode) {
        window.applySmartCaptureFilters();
    }

    const innerOverlay = document.getElementById('smart-capture-inner-modal-overlay');
    if (innerOverlay) {
        innerOverlay.onclick = (event) => {
            if (event.target === innerOverlay) {
                innerOverlay.style.display = 'none';
            }
        };
    }

    // Restore scroll position
    setTimeout(() => {
        const grid = document.getElementById('smart-capture-grid');
        if (grid) {
            grid.scrollTop = savedScrollTop;
        }
    }, 10);
}

export function setSmartCaptureShinyMode(isShiny) {
    isSmartCaptureShinyMode = isShiny;
    isSmartCaptureGlobalMode = false;
    showSmartCaptureMode();
}

window.setSmartCaptureGlobalMode = function() {
    isSmartCaptureGlobalMode = true;
    showSmartCaptureMode();
};

export function showSmartCaptureBallSelection(id) {
    const pData = getPokemonById(id, state);
    if (!pData) return;

    let html = `<div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">`;

    // Default option (follow global active ball)
    let selectedTier = isSmartCaptureShinyMode ? state.settings.smartCaptureShiny[id] : state.settings.smartCapture[id];
    let defaultBorder = (selectedTier === undefined) ? '#2ecc71' : '#555';
    html += `
        <div onclick="window.selectSmartCaptureBall(${id}, undefined)" style="width: 60px; height: 60px; background: rgba(0,0,0,0.6); border: 2px solid ${defaultBorder}; border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; padding: 5px; box-sizing: border-box;">
            <span style="font-size: 10px; font-weight: bold; color: white; text-align: center;">Follow Global</span>
        </div>
    `;

    // None option (ignore / don't throw)
    let noneBorder = (selectedTier === -1) ? '#2ecc71' : '#555';
    html += `
        <div onclick="window.selectSmartCaptureBall(${id}, -1)" style="width: 60px; height: 60px; background: rgba(0,0,0,0.6); border: 2px solid ${noneBorder}; border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; padding: 5px; box-sizing: border-box;">
            <img src="Assets/Extra/No.png" style="width: 30px; height: 30px; object-fit: contain;">
            <span style="font-size: 10px; color: white; margin-top: 5px;">Ignore</span>
        </div>
    `;


    const balls = state.config.balance.items.pokeballs;
    for (let idx = 0; idx < balls.length; idx++) {
        let b = balls[idx];
        const isActive = selectedTier === idx;
        const borderColor = isActive ? '#2ecc71' : '#555';

        html += `
            <div onclick="window.selectSmartCaptureBall(${id}, ${idx})" style="width: 60px; height: 60px; background: rgba(0, 0, 0, 0.6); border: 2px solid ${borderColor}; border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; padding: 5px; box-sizing: border-box;">
                <img src="./Assets/Items/Balls/${b.name}.png" style="width: 30px; height: 30px; object-fit: contain;">
                <span style="font-size: 9px; color: white; margin-top: 5px; text-align: center;">${b.name}</span>
            </div>
        `;
    }

    html += `</div>`;

    const titleHtml = `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 5px;">
            <div style="font-weight: bold; font-size: 18px; color: white;">Select ball to ${isSmartCaptureShinyMode ? 'Shiny ' : ''}${pData.name}</div>
        </div>
    `;

    const overlay = document.getElementById('smart-capture-inner-modal-overlay');
    const title = document.getElementById('smart-capture-inner-modal-title');
    const content = document.getElementById('smart-capture-inner-modal-content');

    if (overlay && title && content) {
        if (window.windowManager && typeof window.windowManager._parseAndSanitizeToElement === 'function') {
            window.windowManager._parseAndSanitizeToElement(titleHtml, title);
            window.windowManager._parseAndSanitizeToElement(html, content);
        } else {
            const parser = new DOMParser();
            const titleDoc = parser.parseFromString(titleHtml, 'text/html');
            if (typeof title.replaceChildren === 'function') title.replaceChildren(...titleDoc.body.childNodes);
            const contentDoc = parser.parseFromString(html, 'text/html');
            if (typeof content.replaceChildren === 'function') content.replaceChildren(...contentDoc.body.childNodes);
        }
        overlay.style.display = 'flex';
    } else {
        // Fallback just in case
        showModal(titleHtml, html, "window-smart-capture-ball");
    }
}

export function selectSmartCaptureBall(id, tier) {
    if (isSmartCaptureShinyMode) {
        if (tier === undefined) {
            delete state.settings.smartCaptureShiny[id];
        } else {
            state.settings.smartCaptureShiny[id] = tier;
        }
    } else {
        if (tier === undefined) {
            delete state.settings.smartCapture[id];
        } else {
            state.settings.smartCapture[id] = tier;
        }
    }

    if (window.storageRef) {
        window.storageRef.save(state);
    }

    showSmartCaptureMode();
    showSmartCaptureBallSelection(id);
}

window.selectGlobalSmartCaptureBall = selectGlobalSmartCaptureBall;
export function selectGlobalSmartCaptureBall(isShiny, tier) {
    if (isShiny) {
        state.settings.globalSmartCaptureShiny = tier;
    } else {
        state.settings.activeBallTier = tier;
        if (typeof window.setActiveItem === 'function') {
            window.setActiveItem('ball', tier); // also update battle UI visually if we are in it
        } else {
            // trigger custom event or simple check just in case
            if (document.getElementById('smartwatch-ball-img') && tier >= 0) {
                 const bName = state.config.balance.items.pokeballs[tier].name;
                 document.getElementById('smartwatch-ball-img').src = 'Assets/Items/Balls/' + bName + '.png';
            } else if (document.getElementById('smartwatch-ball-img') && tier === -1) {
                 document.getElementById('smartwatch-ball-img').src = 'Assets/Extra/No.png';
            }
        }
    }

    if (window.storageRef) {
        window.storageRef.save(state);
    }

    // Refresh the view
    showSmartCaptureMode();
}
