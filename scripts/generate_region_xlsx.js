const fs = require('fs');
const path = require('path');
const vm = require('vm');
const xlsx = require('xlsx');

const COMMON_FRACTIONS = [
    { den: 3, val: 1 / 3 },
    { den: 6, val: 1 / 6 },
    { den: 7, val: 1 / 7 },
    { den: 8, val: 1 / 8 },
    { den: 9, val: 1 / 9 },
    { den: 11, val: 1 / 11 },
    { den: 12, val: 1 / 12 },
    { den: 13, val: 1 / 13 },
    { den: 14, val: 1 / 14 },
    { den: 15, val: 1 / 15 },
    { den: 16, val: 1 / 16 },
    { den: 17, val: 1 / 17 }
];

function normalizeSpawnChances(spawns) {
    if (!spawns || !Array.isArray(spawns) || spawns.length === 0) return spawns;
    if (spawns.length === 1) {
        if (spawns[0].chance !== undefined) spawns[0].chance = 1.0;
        if (spawns[0].probability !== undefined) spawns[0].probability = 1.0;
        return spawns;
    }

    const n = spawns.length;
    const isProbabilityProp = spawns[0].chance === undefined && spawns[0].probability !== undefined;
    const prop = isProbabilityProp ? 'probability' : 'chance';

    let sum = 0;
    for (let i = 0; i < n; i++) {
        sum += (Number(spawns[i][prop]) || 0);
    }
    if (sum <= 0 || Math.abs(sum - 1.0) <= 0.005) return spawns;

    const values = spawns.map(s => Number(s[prop]) || 0);
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const expectedEqual = 1.0 / n;

    if (maxVal - minVal <= 0.02 && Math.abs(minVal - expectedEqual) <= 0.02) {
        for (let i = 0; i < n; i++) {
            spawns[i][prop] = expectedEqual;
            if (spawns[i].chance !== undefined) spawns[i].chance = expectedEqual;
        }
        return spawns;
    }

    for (let i = 0; i < n; i++) {
        const val = Number(spawns[i][prop]) || 0;
        if (val === 0.5 || val === 0.25 || val === 0.75 || val === 0.2 || val === 0.4 || val === 0.6 || val === 0.8 ||
            val === 0.1 || val === 0.3 || val === 0.7 || val === 0.9 || val === 0.05 || val === 0.15 || val === 0.35 || val === 0.45) {
            continue;
        }
        for (const f of COMMON_FRACTIONS) {
            if (Math.abs(val - f.val) < 0.0071) {
                spawns[i][prop] = f.val;
                if (spawns[i].chance !== undefined) spawns[i].chance = f.val;
                break;
            }
        }
    }

    let newSum = 0;
    for (let i = 0; i < n; i++) {
        newSum += (Number(spawns[i][prop]) || 0);
    }
    if (newSum > 0 && Math.abs(newSum - 1.0) > 0.0000001) {
        for (let i = 0; i < n; i++) {
            const normalized = (Number(spawns[i][prop]) || 0) / newSum;
            spawns[i][prop] = normalized;
            if (spawns[i].chance !== undefined) spawns[i].chance = normalized;
        }
    }
    return spawns;
}

function loadDataFile(filename, varNames = null) {
    filename = path.resolve(__dirname, '..', filename);
    let code = fs.readFileSync(filename, 'utf8');
    code = code.replace(/^import\s+.*?;?\s*$/gm, '');
    code = code.replace(/export\s+const\s+/g, 'var ')
               .replace(/export\s+default\s+/g, 'var defaultExport = ')
               .replace(/export\s+\{.*\}\s*;/g, '');
    code = code.replace(/^const\s+([a-zA-Z0-9_]+)\s*=/gm, 'var $1 =');

    const context = {};
    vm.createContext(context);
    vm.runInContext(code, context);

    if (varNames) {
        const result = {};
        for (const name of varNames) {
            result[name] = context[name];
        }
        return result;
    }
    return context;
}


const _pokemonDataArr = require('../data/pokemon.json');
const pokemonData = {};
_pokemonDataArr.forEach((p) => { pokemonData[p.id] = p; });

const { pokedexIndexes } = loadDataFile('config/pokedexIndexes.js', ['pokedexIndexes']);
const { types } = loadDataFile('config/types.js', ['types']);
const { defaultExport: gymsList } = loadDataFile('config/gyms.js', ['defaultExport']);
const gymsByName = new Map();
if (Array.isArray(gymsList)) {
    gymsList.forEach(g => {
        if (g && g.name) gymsByName.set(g.name.toLowerCase(), g);
    });
}

const REGIONS = [
    { num: 1, name: 'Kanto', prefix: '', routesVar: 'routes', unlocksVar: 'unlocks', mapVar: 'mapCoordinates' },
    { num: 2, name: 'Johto', prefix: 'johto', routesVar: 'johtoRoutes', unlocksVar: 'johtoUnlocks', mapVar: 'johtoMapCoordinates' },
    { num: 3, name: 'Hoenn', prefix: 'hoenn', routesVar: 'hoennRoutes', unlocksVar: 'hoennUnlocks', mapVar: 'hoennMapCoordinates' },
    { num: 4, name: 'Sinnoh', prefix: 'sinnoh', routesVar: 'sinnohRoutes', unlocksVar: 'sinnohUnlocks', mapVar: 'sinnohMapCoordinates' },
    { num: 5, name: 'Unova', prefix: 'unova', routesVar: 'unovaRoutes', unlocksVar: 'unovaUnlocks', mapVar: 'unovaMapCoordinates' },
    { num: 6, name: 'Kalos', prefix: 'kalos', routesVar: 'kalosRoutes', unlocksVar: 'kalosUnlocks', mapVar: 'kalosMapCoordinates' },
    { num: 7, name: 'Alola', prefix: 'alola', routesVar: 'alolaRoutes', unlocksVar: 'alolaUnlocks', mapVar: 'alolaMapCoordinates' },
    { num: 8, name: 'Galar', prefix: 'galar', routesVar: 'galarRoutes', unlocksVar: 'galarUnlocks', mapVar: 'galarMapCoordinates' },
    { num: 9, name: 'Hisui', prefix: 'hisui', routesVar: 'hisuiRoutes', unlocksVar: 'hisuiUnlocks', mapVar: 'hisuiMapCoordinates' },
    { num: 10, name: 'Paldea', prefix: 'paldea', routesVar: 'paldeaRoutes', unlocksVar: 'paldeaUnlocks', mapVar: 'paldeaMapCoordinates' }
];


function formatChallengeName(name) {
    if (!name) return name;
    return name.replace(/(Challenge\s+([A-Z]\s+)?|Extra Challenge\s+([A-Z]\s+)?)(\d+)$/i, (match, p1, p2, p3, p4) => {
        let numStr = p4.length === 1 ? '0' + p4 : p4;
        let prefix = p1;
        return `${prefix}${numStr}`;
    });
}

function getBST(pk) {
    if (!pk) return 0;
    return pk.hp + pk.atk + pk.def + pk.spa + pk.spd + pk.spe;
}

const evosForward = {};
const evosBackward = {};

for (const id in pokemonData) {
    const pk = pokemonData[id];
    if (pk.evolutions) {
        pk.evolutions.forEach(evo => {
            if (!evosForward[id]) evosForward[id] = [];
            evosForward[id].push(evo.to);
            evosBackward[evo.to] = id;
        });
    }
}

function reqString(req) {
    if (!req) return '';
    return JSON.stringify(req);
}

function getEvoRoot(id) {
    let curr = String(id);
    const seen = new Set();
    while (evosBackward[curr] && !seen.has(curr)) {
        seen.add(curr);
        curr = String(evosBackward[curr]);
    }
    return curr;
}

function clamp(val, minVal, maxVal) {
    return Math.max(minVal, Math.min(maxVal, val));
}

function roundNice(val, minVal = 1, maxVal = 300) {
    let n = Math.round(val);
    if (n >= 16 && n < 100) {
        n = Math.round(n / 5) * 5;
    } else if (n >= 100) {
        n = Math.round(n / 25) * 25;
    } else if (n === 9 || n === 11) {
        n = 10;
    } else if (n === 14) {
        n = 15;
    }
    return clamp(n, minVal, maxVal);
}

const QUALITY_PROBS = {
    Weak: 1474 / 12000,
    UncommonPlus: (12000 - 6586) / 12000,
    RarePlus: (12000 - 9593) / 12000,
    Rare: (11097 - 9593) / 12000,
    Epic: (11999 - 11097) / 12000
};

function getBiomeMatchTypes(areaName) {
    const lower = (areaName || '').toLowerCase();
    const matched = new Set();
    if (/water|sea|ocean|lake|river|bay|shore|beach|fishing|surf|reef|tidepool|underwater|canal|stream|pond|spring/.test(lower)) matched.add('Water');
    if (/forest|woods|grove|meadow|garden|jungle|floral|flower|petal|moss|bush/.test(lower)) { matched.add('Bug'); matched.add('Grass'); }
    if (/cave|cavern|tunnel|mountain|mount|mt\.|peak|cliff|rock|ruin|quarry|crag|pass|canyon|diglett|digglett/.test(lower)) { matched.add('Rock'); matched.add('Ground'); }
    if (/ice|frost|snow|glacier|blizzard|frozen|cold/.test(lower)) matched.add('Ice');
    if (/tower|hotel|cemetery|crypt|pyre|haunted|ghost|spirit|ruin/.test(lower)) matched.add('Ghost');
    if (/volcano|fiery|lava|magma|ember|cinder|furnace|heat/.test(lower)) matched.add('Fire');
    if (/dragon|meteor|celestial|sky pillar/.test(lower)) matched.add('Dragon');
    if (/power plant|electric|thunder|volt|charge/.test(lower)) matched.add('Electric');
    if (/marsh|swamp|bog|toxic|sewer|sludge/.test(lower)) matched.add('Poison');
    if (/desert|sand|dunes/.test(lower)) matched.add('Ground');
    if (/dojo|martial|fighting/.test(lower)) matched.add('Fighting');
    return matched;
}

function collectChallengeSpawns(c, areaNames, routes, seenBeforeChallenge) {
    const merged = new Map();
    const sourceTables = [];

    if (c.spawns && Array.isArray(c.spawns) && c.spawns.length > 0) {
        sourceTables.push(c.spawns);
    } else {
        for (const aName of areaNames) {
            const r = routes.find(ro => ro.name === aName);
            if (r && r.spawns && r.spawns.length > 0) {
                sourceTables.push(r.spawns);
            }
        }
    }

    const tableCount = sourceTables.length || 1;
    for (const table of sourceTables) {
        let tableSum = 0;
        for (const s of table) tableSum += (Number(s.chance) || 0);
        const norm = tableSum > 0 ? tableSum : 1;

        for (const s of table) {
            const pk = pokemonData[s.pokemonId];
            if (!pk) continue;
            const p = ((Number(s.chance) || 0) / norm) / tableCount;
            if (!merged.has(s.pokemonId)) {
                merged.set(s.pokemonId, {
                    pokemonId: s.pokemonId,
                    pk,
                    name: pk.name,
                    types: pk.types || [],
                    bst: getBST(pk),
                    evoRoot: getEvoRoot(s.pokemonId),
                    chance: p,
                    isNew: !seenBeforeChallenge.has(s.pokemonId)
                });
            } else {
                merged.get(s.pokemonId).chance += p;
            }
        }
    }

    return Array.from(merged.values()).sort((a, b) => b.chance - a.chance);
}

function suggestRequirement({ region, c, areaNames, challengeIndex, totalInChain, isMain, quarter, spawns, tracker }) {
    const primaryArea = areaNames[0] || '';
    const areaLower = primaryArea.toLowerCase();
    const chalName = c.challengeName || '';
    const chalLower = chalName.toLowerCase();
    const req = c.requirements || {};

    // 1. Special / Non-Wild Challenges
    if (areaLower === 'red' || req.defeatRed) {
        return JSON.stringify({ defeatRed: true });
    }

    if (chalLower.startsWith('key ') || areaLower.startsWith('key ') || chalLower.includes('condition') ||
        (req.completeChallenges && spawns.length === 0 && !req.earnBadge)) {
        return JSON.stringify({ completeChallenges: req.completeChallenges || [] });
    }

    const isLeague = areaLower.includes('pokemon league') || areaLower.includes('pokémon league') ||
        (region.num === 8 && areaLower.includes('wyndon stadium')) ||
        Boolean(req.defeatEliteFourAndChampion) ||
        Object.keys(req).some(k => /^defeat.*Champion$/.test(k));
    if (isLeague) {
        if (region.num <= 2) return JSON.stringify({ defeatEliteFourAndChampion: true });
        return JSON.stringify({ [`defeat${region.name}Champion`]: true });
    }

    const matchedGym = gymsByName.get(areaLower);
    const isGymLike = Boolean(req.earnBadge) || (
        !areaLower.includes('high level') &&
        !areaLower.includes('battle tower') &&
        (areaLower.includes('gym') || areaLower.includes('stadium') || areaLower.includes('grand trial'))
    );
    if (isGymLike) {
        tracker.badgeCounter += 1;
        if (req.earnBadge) {
            return JSON.stringify({ earnBadge: req.earnBadge });
        }
        return JSON.stringify({
            earnBadge: {
                name: `${region.name} Badge ${tracker.badgeCounter}`,
                leader: matchedGym?.leader || 'Leader',
                badgeCount: tracker.badgeCounter
            }
        });
    }

    if (matchedGym && spawns.length === 0) {
        return `Defeat Boss: ${matchedGym.leader || primaryArea}`;
    }

    if (chalLower.includes('(roaming)')) {
        if (req.defeatMultipleSpecific) return JSON.stringify({ defeatMultipleSpecific: req.defeatMultipleSpecific });
        if (req.defeatSpecific) return JSON.stringify({ defeatSpecific: req.defeatSpecific });
        if (spawns.length > 1) {
            return JSON.stringify({ defeatMultipleSpecific: spawns.slice(0, 4).map(s => ({ name: s.name, count: 1 })) });
        }
        if (spawns.length === 1) {
            return JSON.stringify({ defeatSpecific: { name: spawns[0].name, count: 1 } });
        }
    }

    if (spawns.length >= 1 && spawns.length <= 4 && spawns.every(s => s.bst >= 580)) {
        return JSON.stringify({ catchSpecies: spawns.slice(0, 3).map(s => ({ species: s.name, count: 1 })) });
    }

    if (spawns.length === 0) {
        if (/battle|tower|frontier|dojo|hideout/.test(areaLower)) {
            const cnt = isMain ? (quarter <= 2 ? 75 : 125) : 150;
            return JSON.stringify({ defeatCountRoute: { route: primaryArea, count: cnt } });
        }
        return 'No wild spawns (Boss/Trainer/Story Req)';
    }

    // 2. Tutorial First Wild Route
    if (isMain && !tracker.firstWildRouteDone) {
        tracker.firstWildRouteDone = true;
        tracker.recentCategories.unshift('defeatCountRoute');
        tracker.categoryCounts.defeatCountRoute = (tracker.categoryCounts.defeatCountRoute || 0) + 1;
        tracker.routeDefeatStreak = 0;
        return JSON.stringify({ defeatCountRoute: { route: primaryArea, count: 25 } });
    }

    // 3. Encounter Budget
    const progress = totalInChain > 1 ? challengeIndex / (totalInChain - 1) : (isMain ? 0.5 : 1.0);
    let targetEnc, minEnc, maxEnc;
    if (isMain) {
        if (quarter === 1) {
            targetEnc = Math.round(28 + Math.min(1, progress * 4) * 22);
            minEnc = 15; maxEnc = 80;
        } else if (quarter === 2) {
            targetEnc = Math.round(50 + Math.min(1, Math.max(0, progress - 0.25) * 4) * 35);
            minEnc = 25; maxEnc = 120;
        } else if (quarter === 3) {
            targetEnc = Math.round(85 + Math.min(1, Math.max(0, progress - 0.50) * 4) * 45);
            minEnc = 40; maxEnc = 165;
        } else {
            targetEnc = Math.round(125 + Math.min(1, Math.max(0, progress - 0.75) * 4) * 50);
            minEnc = 55; maxEnc = 220;
        }
    } else {
        targetEnc = Math.round(120 + progress * 90);
        minEnc = 50; maxEnc = 280;
    }

    const candidates = [];
    const newSpawns = spawns.filter(s => s.isNew && s.chance > 0);
    const biomeTypes = getBiomeMatchTypes(primaryArea);

    // --- Candidate A: catchSpecies (New Pokemon Showcase) ---
    if (newSpawns.length > 0) {
        const sortedNew = [...newSpawns].sort((a, b) => {
            const aFlagship = (a.chance >= 0.03 && a.chance <= 0.15) ? 1 : 0;
            const bFlagship = (b.chance >= 0.03 && b.chance <= 0.15) ? 1 : 0;
            if (aFlagship !== bFlagship) return bFlagship - aFlagship;
            return b.bst - a.bst;
        });

        const picked = [];
        const usedRoots = new Set();
        let estEnc = 0;

        // Check for a rare new flagship (2.5% - 10%)
        const flagship = sortedNew.find(s => s.chance >= 0.025 && s.chance <= 0.10 && (1 / s.chance) <= maxEnc);
        if (flagship) {
            picked.push({ species: flagship.name, count: 1, chance: flagship.chance });
            usedRoots.add(flagship.evoRoot);
            estEnc += 1 / flagship.chance + 5;
        }

        for (const s of sortedNew) {
            if (picked.length >= 3) break;
            if (usedRoots.has(s.evoRoot)) continue;
            if (s.chance < 0.05) continue;
            const addEnc = 1 / s.chance + 5;
            if (estEnc + addEnc <= maxEnc && (picked.length === 0 || estEnc < targetEnc * 0.9)) {
                picked.push({ species: s.name, count: 1, chance: s.chance });
                usedRoots.add(s.evoRoot);
                estEnc += addEnc;
            }
        }

        // If only 1 common new spawn was picked and it's too quick, bump count to 2-3
        if (picked.length === 1 && estEnc < minEnc && picked[0].chance >= 0.18) {
            const desired = clamp(Math.round((targetEnc * 0.55) * picked[0].chance), 2, 4);
            const newEst = desired / picked[0].chance + 4 * desired;
            if (newEst <= maxEnc) {
                picked[0].count = desired;
                estEnc = newEst;
            }
        }

        if (picked.length > 0 && estEnc <= maxEnc) {
            const fitBonus = (picked.length >= 2 ? 15 : 0) + (flagship ? 10 : 0);
            candidates.push({
                category: 'catchSpecies',
                req: { catchSpecies: picked.map(p => ({ species: p.species, count: p.count })) },
                score: 62 + fitBonus,
                estEnc
            });
        }
    }

    // --- Candidate B: catchSpeciesOr / catchSpeciesAnyOf (Dual-Target Choice) ---
    const pairPool = newSpawns.length >= 2 ? newSpawns : spawns.filter(s => s.chance >= 0.05 && s.chance <= 0.25);
    if (pairPool.length >= 2) {
        let bestPair = null;
        let bestPairScore = -1;
        for (let a = 0; a < pairPool.length; a++) {
            for (let b = a + 1; b < pairPool.length; b++) {
                const pA = pairPool[a], pB = pairPool[b];
                if (pA.evoRoot === pB.evoRoot) continue;
                const sharedType = pA.types.some(t => pB.types.includes(t)) ? 10 : 0;
                const bothNew = (pA.isNew && pB.isNew) ? 15 : 0;
                const rateSim = 10 - Math.abs(pA.chance - pB.chance) * 30;
                const sc = sharedType + bothNew + rateSim;
                if (sc > bestPairScore) {
                    bestPairScore = sc;
                    bestPair = [pA, pB];
                }
            }
        }

        if (bestPair) {
            const [pA, pB] = bestPair;
            const pSum = pA.chance + pB.chance;
            const cOr = pSum <= 0.22 ? 1 : clamp(Math.round(targetEnc * pSum * 0.40), 1, 3);
            const estOr = cOr / pSum + 5 * cOr;
            if (estOr >= minEnc * 0.55 && estOr <= maxEnc) {
                candidates.push({
                    category: 'catchSpeciesOr',
                    req: { catchSpeciesOr: [{ species: pA.name, count: cOr }, { species: pB.name, count: cOr }] },
                    score: 58 + (pA.isNew && pB.isNew ? 12 : 0),
                    estEnc: estOr
                });
            }

            if (pA.chance >= 0.08 && pB.chance >= 0.08) {
                const totalAny = clamp(roundNice(targetEnc * pSum * 0.38, 2, 6), 2, 6);
                const estAny = totalAny / pSum + 4 * totalAny;
                if (estAny >= minEnc * 0.6 && estAny <= maxEnc) {
                    const sameType = pA.types.some(t => pB.types.includes(t));
                    candidates.push({
                        category: 'catchSpeciesAnyOf',
                        req: { catchSpeciesAnyOf: [[{ species: pA.name, count: totalAny }, { species: pB.name, count: totalAny }]] },
                        score: 54 + (sameType ? 10 : 0),
                        estEnc: estAny
                    });
                }
            }
        }
    }

    // --- Candidate C: defeatSpecific (Single-Species Hunt) ---
    const huntPool = spawns.filter(s => s.chance >= 0.04 && s.chance <= 0.35);
    if (huntPool.length > 0) {
        const sortedHunt = [...huntPool].sort((a, b) => {
            const aIdeal = (a.chance >= 0.06 && a.chance <= 0.20 ? 15 : 0) + (a.bst >= 400 ? 10 : 0) + (a.isNew ? 8 : 0);
            const bIdeal = (b.chance >= 0.06 && b.chance <= 0.20 ? 15 : 0) + (b.bst >= 400 ? 10 : 0) + (b.isNew ? 8 : 0);
            return bIdeal - aIdeal || b.bst - a.bst;
        });
        const target = sortedHunt[0];
        const cnt = target.chance <= 0.03 ? 1 : roundNice(targetEnc * target.chance, 2, 30);
        const estEnc = cnt / target.chance;
        if (estEnc >= minEnc * 0.65 && estEnc <= maxEnc) {
            candidates.push({
                category: 'defeatSpecific',
                req: { defeatSpecific: { name: target.name, count: cnt } },
                score: 60 + (target.bst >= 400 ? 8 : 0) + (newSpawns.length === 0 ? 10 : 0),
                estEnc
            });
        }
    }

    // --- Candidate D: defeatMultipleSpecific (Multi-Target Hunt) ---
    const multiPool = spawns.filter(s => s.chance >= 0.10);
    if (multiPool.length >= 2) {
        // Prefer an evolution family pair on the same route, else top 2 distinct families
        let chosen = null;
        for (let a = 0; a < multiPool.length && !chosen; a++) {
            for (let b = a + 1; b < multiPool.length; b++) {
                if (multiPool[a].evoRoot === multiPool[b].evoRoot) {
                    chosen = [multiPool[a], multiPool[b]];
                    break;
                }
            }
        }
        const isEvoPair = Boolean(chosen);
        if (!chosen) {
            const distinct = [];
            const roots = new Set();
            for (const s of multiPool) {
                if (!roots.has(s.evoRoot)) {
                    distinct.push(s);
                    roots.add(s.evoRoot);
                }
                if (distinct.length >= (quarter >= 3 ? 3 : 2)) break;
            }
            if (distinct.length >= 2) chosen = distinct;
        }

        if (chosen) {
            const splitFactor = chosen.length === 3 ? 0.35 : 0.45;
            const targets = chosen.map(s => ({
                name: s.name,
                count: roundNice(targetEnc * splitFactor * s.chance, 2, 15),
                chance: s.chance
            }));
            const estEnc = Math.max(...targets.map(t => t.count / t.chance)) * 1.15;
            if (estEnc >= minEnc * 0.65 && estEnc <= maxEnc) {
                candidates.push({
                    category: 'defeatMultipleSpecific',
                    req: { defeatMultipleSpecific: targets.map(t => ({ name: t.name, count: t.count })) },
                    score: 58 + (isEvoPair ? 14 : 0) + (newSpawns.length <= 1 ? 8 : 0),
                    estEnc
                });
            }
        }
    }

    // --- Candidate E: catchByType / catchByQualityAndType (Elemental Mastery) ---
    const typeTotals = new Map();
    for (const s of spawns) {
        for (const t of s.types) {
            if (!typeTotals.has(t)) typeTotals.set(t, { sumChance: 0, count: 0 });
            const entry = typeTotals.get(t);
            entry.sumChance += s.chance;
            entry.count += 1;
        }
    }
    const eligibleTypes = Array.from(typeTotals.entries())
        .filter(([t, info]) => (t !== 'Normal' || info.sumChance >= 0.65) && ((info.sumChance >= 0.40 && info.count >= 2) || info.sumChance >= 0.55))
        .sort((a, b) => {
            const aBiome = biomeTypes.has(a[0]) ? 1 : 0;
            const bBiome = biomeTypes.has(b[0]) ? 1 : 0;
            if (aBiome !== bBiome) return bBiome - aBiome;
            return b[1].sumChance - a[1].sumChance;
        });

    if (eligibleTypes.length > 0) {
        const [bestType, info] = eligibleTypes[0];
        const biomeBonus = biomeTypes.has(bestType) ? 18 : 0;

        const cntType = roundNice(targetEnc * info.sumChance * 0.35, 3, 15);
        const estType = cntType / info.sumChance + 3 * cntType;
        if (estType >= minEnc * 0.6 && estType <= maxEnc) {
            candidates.push({
                category: 'catchByType',
                req: { catchByType: { type: bestType, count: cntType } },
                score: 56 + biomeBonus,
                estEnc: estType
            });
        }

        let qual = 'Rare';
        let qProb = QUALITY_PROBS.Rare;
        if (isMain && quarter === 1) { qual = 'Uncommon'; qProb = QUALITY_PROBS.UncommonPlus * 0.55; }
        else if ((!isMain || quarter === 4) && info.sumChance >= 0.60) { qual = 'Epic'; qProb = QUALITY_PROBS.Epic; }

        const qCount = (qual === 'Rare' && (!isMain || quarter >= 3) && info.sumChance >= 0.70 && (2 / (info.sumChance * qProb)) <= maxEnc) ? 2 : 1;
        const estQType = qCount / (info.sumChance * qProb) + 5;
        if (estQType >= minEnc * 0.5 && estQType <= maxEnc) {
            candidates.push({
                category: 'catchByQualityAndType',
                req: { catchByQualityAndType: { type: bestType, quality: qual, count: qCount } },
                score: 60 + biomeBonus,
                estEnc: estQType
            });
        }
    }

    // --- Candidate F: Quality Hunts (Species-Specific or Route-Wide) ---
    const commonLowBst = spawns.find(s => s.chance >= 0.20 && s.bst <= 330);
    const commonAny = spawns.find(s => s.chance >= 0.20);
    if (isMain && quarter <= 2 && commonLowBst && (1 / (commonLowBst.chance * QUALITY_PROBS.Weak)) <= maxEnc) {
        const useWeak = quarter === 2 || commonLowBst.bst <= 260;
        if (useWeak) {
            candidates.push({
                category: 'catchSpeciesQuality',
                req: { catchSpeciesByQuality: [{ species: commonLowBst.name, quality: 'Weak', count: 1 }] },
                score: 64 + (commonLowBst.bst <= 260 ? 10 : 0),
                estEnc: 1 / (commonLowBst.chance * QUALITY_PROBS.Weak) + 4
            });
        }
    }
    if (commonAny) {
        let qual = 'Rare';
        let qProb = QUALITY_PROBS.RarePlus;
        if (isMain && quarter === 1) { qual = 'Uncommon'; qProb = QUALITY_PROBS.UncommonPlus; }
        else if ((!isMain || quarter === 4) && commonAny.chance >= 0.28 && (1 / (commonAny.chance * QUALITY_PROBS.Epic)) <= maxEnc) {
            qual = 'Epic'; qProb = QUALITY_PROBS.Epic;
        }
        const estQual = 1 / (commonAny.chance * qProb) + 5;
        if (estQual >= minEnc * 0.5 && estQual <= maxEnc) {
            candidates.push({
                category: 'catchSpeciesQuality',
                req: { catchSpeciesByQualityOrHigher: [{ species: commonAny.name, quality: qual, count: 1 }] },
                score: 60 + (commonAny.bst < 360 ? 8 : 0),
                estEnc: estQual
            });
        }
    }
    if (spawns.length >= 3) {
        let qualStr = 'Rare+';
        let qProb = QUALITY_PROBS.RarePlus;
        let qCount = 1;
        if (isMain && quarter === 1) { qualStr = 'Uncommon+'; qProb = QUALITY_PROBS.UncommonPlus; qCount = 2; }
        else if (isMain && quarter >= 3) { qualStr = 'Rare+'; qProb = QUALITY_PROBS.RarePlus; qCount = 2; }
        else if (!isMain) { qualStr = 'Epic'; qProb = QUALITY_PROBS.Epic; qCount = 1; }
        const estRouteQ = qCount / qProb + 5 * qCount;
        if (estRouteQ <= maxEnc) {
            candidates.push({
                category: 'catchByQuality',
                req: { catchByQuality: { quality: qualStr, count: qCount } },
                score: 52,
                estEnc: estRouteQ
            });
        }
    }

    // --- Candidate G: defeatCountRoute (Route Endurance Checkpoint) ---
    let defeatCount;
    if (isMain) {
        if (quarter === 1) defeatCount = roundNice(targetEnc, 30, 50);
        else if (quarter === 2) defeatCount = roundNice(targetEnc, 60, 100);
        else if (quarter === 3) defeatCount = roundNice(targetEnc, 100, 150);
        else defeatCount = areaLower.includes('victory road') ? roundNice(Math.max(targetEnc, 200), 200, 250) : roundNice(targetEnc, 150, 225);
    } else {
        defeatCount = roundNice(targetEnc, 150, 300);
    }
    const isEnduranceRoute = /victory road|safari|sea route|hideout|underwater/.test(areaLower);
    const streakBonus = tracker.routeDefeatStreak >= 4 ? 25 : 0;
    candidates.push({
        category: 'defeatCountRoute',
        req: { defeatCountRoute: { route: primaryArea, count: defeatCount } },
        score: 46 + (newSpawns.length === 0 ? 28 : 0) + (isEnduranceRoute ? 22 : 0) + streakBonus,
        estEnc: defeatCount
    });

    // --- Step 5: Pick Best Candidate with Anti-Repetition ---
    let best = candidates[0];
    let bestFinalScore = -Infinity;
    for (const cand of candidates) {
        let penalty = 0;
        if (tracker.recentCategories[0] === cand.category) penalty += 60;
        if (tracker.recentCategories[1] === cand.category) penalty += 30;
        if (tracker.recentCategories[2] === cand.category) penalty += 15;
        penalty += (tracker.categoryCounts[cand.category] || 0) * 6;

        const finalScore = cand.score - penalty;
        if (finalScore > bestFinalScore) {
            bestFinalScore = finalScore;
            best = cand;
        }
    }

    tracker.recentCategories.unshift(best.category);
    if (tracker.recentCategories.length > 5) tracker.recentCategories.pop();
    tracker.categoryCounts[best.category] = (tracker.categoryCounts[best.category] || 0) + 1;
    tracker.routeDefeatStreak = best.category === 'defeatCountRoute' ? 0 : tracker.routeDefeatStreak + 1;

    return JSON.stringify(best.req);
}

async function processRegion(region, counter) {
    console.log(`Processing ${region.name}...`);

    let routesFile = 'config/routes.js';
    let mapFile = 'config/mapCoordinates.js';
    if (region.prefix !== '') {
        routesFile = `config/${region.prefix}Routes.js`;
        mapFile = `config/${region.prefix}MapCoordinates.js`;
    }

    let routes = [];
    let unlocks = [];

    if (fs.existsSync(routesFile)) {
        const varsToLoad = [];
        if (region.routesVar) varsToLoad.push(region.routesVar);
        if (region.unlocksVar) varsToLoad.push(region.unlocksVar);
        const loaded = loadDataFile(routesFile, varsToLoad);
        if (loaded[region.routesVar]) routes = loaded[region.routesVar];
        if (region.unlocksVar && loaded[region.unlocksVar]) unlocks = loaded[region.unlocksVar];
    } else {
        console.error(`Routes file not found: ${routesFile}`);
        return;
    }
if (!Array.isArray(routes)) {
        routes = Object.keys(routes).map(key => {
            const val = routes[key];
            return {
                name: key,
                ...val
            };
        });
    }

    // Normalize Hisui specific field names
    routes.forEach(r => {
        if (!r.spawns && r.pokes) {
            r.spawns = r.pokes.map(p => ({
                pokemonId: p.id,
                minLevel: p.minLevel,
                maxLevel: p.maxLevel,
                chance: p.probability || p.chance || 0
            }));
        }
        if (r.spawns) {
            normalizeSpawnChances(r.spawns);
        }
    });
    if (!Array.isArray(unlocks)) {
        unlocks = Object.values(unlocks);
    }

    for (const u of unlocks) {
        if (u.challengeName) u.challengeName = formatChallengeName(u.challengeName);
        if (u.unlocks && Array.isArray(u.unlocks)) {
            u.unlocks = u.unlocks.map(formatChallengeName);
        }
        if (u.requirements && u.requirements.challenge) {
            u.requirements.challenge = formatChallengeName(u.requirements.challenge);
        }
    }
    let mapCoords = {};
    if (fs.existsSync(mapFile)) {
        const loadedMap = loadDataFile(mapFile);
        mapCoords = loadedMap[region.mapVar] || loadedMap.mapCoordinates || loadedMap.defaultExport || {};
    }

    const nativeIds = pokedexIndexes.regional[region.prefix === '' ? 'kanto' : region.prefix] || [];


    const allSpawnsToFetch = new Set();
    const spawnNameToId = new Map();
    routes.forEach(r => {
        (r.spawns || []).forEach(s => {
            const pk = pokemonData[s.pokemonId];
            if (pk && pk.name) {
                const lower = pk.name.toLowerCase();
                allSpawnsToFetch.add(lower);
                if (!spawnNameToId.has(lower)) spawnNameToId.set(lower, s.pokemonId);
            }
        });
    });

    const encounterCache = {};
    for (const pkName of allSpawnsToFetch) {
        try {
            let res = await fetch(`https://pokeapi.co/api/v2/pokemon/${pkName}/encounters`);
            if (!res.ok && spawnNameToId.has(pkName)) {
                res = await fetch(`https://pokeapi.co/api/v2/pokemon/${spawnNameToId.get(pkName)}/encounters`);
            }
            if (res.ok) {
                const data = await res.json();
                encounterCache[pkName] = data.map(d => d.location_area.name);
            } else {
                encounterCache[pkName] = [];
            }
        } catch (e) {
            encounterCache[pkName] = [];
        }
    }

    const mainChallenges = [];
    const extraChallenges = {};
    const hChallenges = [];

    for (const u of unlocks) {
        if (!u.challengeName) continue;
        if (u.challengeName.endsWith(' H')) {
            hChallenges.push(u);
        } else if (u.challengeName.startsWith('Challenge ') || (!u.challengeName.startsWith('Extra') && !u.challengeName.startsWith('Key') && !u.challengeName.includes('League'))) {
             mainChallenges.push(u);
        } else if (u.challengeName.startsWith('Extra Challenge ')) {
            const parts = u.challengeName.split(' ');
            if (parts.length >= 4) {
                const letter = parts[2];
                if (!extraChallenges[letter]) extraChallenges[letter] = [];
                extraChallenges[letter].push(u);
            } else {
                extraChallenges['X'] = extraChallenges['X'] || [];
                extraChallenges['X'].push(u);
            }
        }
    }

    hChallenges.sort((a, b) => {
        const numA = parseInt((a.challengeName.match(/(\d+)\s+H$/) || [])[1]) || 0;
        const numB = parseInt((b.challengeName.match(/(\d+)\s+H$/) || [])[1]) || 0;
        return numA - numB;
    });

    for (const key in extraChallenges) {
        extraChallenges[key].sort((a,b) => {
            const numA = parseInt(a.challengeName.split(' ').pop()) || 0;
            const numB = parseInt(b.challengeName.split(' ').pop()) || 0;
            return numA - numB;
        });
    }

    const routesData = [];
    const challengesData = [];
    const routeSpawnedPokemon = new Set();
    const seenPokemon = new Map();



    const getEvolutionStage = (id) => {
        if (!id) return 1;
        let stage = 1;
        let currentId = id;
        while (evosBackward[currentId]) {
            stage++;
            currentId = evosBackward[currentId];
        }
        return stage;
    };
    const areaToChallenges = new Map();
    const prereqToChallenges = new Map();
    const addMapEntry = (map, key, val) => {
        if (!key || !val) return;
        if (!map.has(key)) map.set(key, []);
        const list = map.get(key);
        if (!list.includes(val)) list.push(val);
    };
    for (const u of unlocks) {
        const cLabel = u.challengeName || u.areaId || u.name;
        const primaryArea = u.areaId || u.name;
        addMapEntry(areaToChallenges, primaryArea, cLabel);
        const uReq = u.requirements || {};
        for (const depList of [uReq.completeChallenges, uReq.completeAnyOfChallenges]) {
            if (Array.isArray(depList)) {
                for (const dep of depList) {
                    addMapEntry(prereqToChallenges, formatChallengeName(dep), cLabel);
                    addMapEntry(prereqToChallenges, dep, cLabel);
                }
            }
        }
    }

    const formatGiftString = (c) => {
        if (Array.isArray(c.gifts) && c.gifts.length > 0) {
            return c.gifts
                .map(g => (typeof g === 'string' ? g : `${g.item} x${g.count || 1}`))
                .join(', ');
        }
        if (c.gift) {
            return typeof c.gift === 'string' ? c.gift : `${c.gift.item} x${c.gift.count || 1}`;
        }
        return '';
    };

    const resolveUnlockedChallenges = (c) => {
        const unlocked = [];
        const addUnlocked = (label) => {
            if (label && !unlocked.includes(label)) unlocked.push(label);
        };
        if (Array.isArray(c.unlocks)) {
            for (const area of c.unlocks) {
                for (const target of (areaToChallenges.get(area) || [])) {
                    addUnlocked(target);
                }
            }
        }
        for (const key of [c.challengeName, c.areaId, c.name]) {
            if (key && prereqToChallenges.has(key)) {
                for (const target of prereqToChallenges.get(key)) {
                    addUnlocked(target);
                }
            }
        }
        return unlocked.join(', ');
    };

const mainSeenSets = [];
    const processUnlocks = (challengeList, isMain, startChallengeIndex, initialSeenSet) => {
        let currentSeen = new Map(initialSeenSet);
        const reqTracker = { recentCategories: [], categoryCounts: {}, routeDefeatStreak: 0, badgeCounter: 0, firstWildRouteDone: false };
        for (let i = 0; i < challengeList.length; i++) {
            const c = challengeList[i];
            const areaNames = [c.areaId || c.name];
            if (c.secondaryAreas && Array.isArray(c.secondaryAreas)) {
                areaNames.push(...c.secondaryAreas);
            }
            const seenBeforeChallenge = new Set(currentSeen.keys());

            let primaryAdded = false;

            areaNames.forEach(areaName => {
                const r = routes.find(ro => ro.name === areaName) || {};
                const spawns = (c.spawns && Array.isArray(c.spawns)) ? c.spawns : (r.spawns || []);

                const req = c.requirements || {};
                let unlockStr = (c.unlocks || []).join(', ');
                let giftStr = formatGiftString(c);

                let avgBST = 0;
                if (spawns.length > 0) {
                    let sumBST = 0;
                    let uniqueIds = new Set();
                    spawns.forEach(s => {
                        uniqueIds.add(s.pokemonId);
                    });
                    uniqueIds.forEach(id => {
                        sumBST += getBST(pokemonData[id]);
                    });
                    avgBST = uniqueIds.size > 0 ? sumBST / uniqueIds.size : 0;
                }

                let baseMin = 1;
                if (isMain) {
                    let lastWildMainIdx = mainChallenges.length - 1;
                    const vrIdx = mainChallenges.findIndex(ch => (ch.areaId || ch.name || '').includes('Victory Road'));
                    if (vrIdx !== -1) {
                        lastWildMainIdx = vrIdx;
                    } else {
                        for (let idx = mainChallenges.length - 1; idx >= 0; idx--) {
                            const ch = mainChallenges[idx];
                            const rObj = routes.find(ro => ro.name === ch.areaId || ro.name === ch.name);
                            if ((ch.spawns && ch.spawns.length > 0) || (rObj && rObj.spawns && rObj.spawns.length > 0)) {
                                lastWildMainIdx = idx;
                                break;
                            }
                        }
                    }
                    if (lastWildMainIdx > 0) {
                        const progress = Math.min(1, i / lastWildMainIdx);
                        baseMin = Math.round(1 + (90 * progress));
                    }
                } else {
                     let startLvl = 91;
                     baseMin = startLvl + (2 * (i + 1));
                }

                let diff = 0;
                let baseMax = baseMin;
                const spreadPct = isMain ? 0.1 : 0.15;
                if (baseMin < 12) diff = 2;
                else if (baseMin < 30) diff = 3;
                else {
                    let tempDiff = baseMin * spreadPct;
                    let avg = (baseMin + baseMin + tempDiff) / 2;
                    diff = Math.floor(avg * spreadPct);
                    if (diff > 8) diff = 8;
                }
                baseMax = baseMin + diff;

                let quarter = 1;
                if (isMain && mainChallenges.length > 0) {
                    quarter = Math.ceil(((i + 1) / mainChallenges.length) * 4);
                    if (quarter > 4) quarter = 4;
                } else {
                    quarter = 4;
                }

                if (spawns.length === 0) {
                    routesData.push({
                        "Unlocked at": (i === 0 && isMain && !primaryAdded) ? "" : ((i > 0 && !primaryAdded) ? challengeList[i-1].challengeName : ""),
                        "Challenge": c.challengeName,
                        "Route": (r && r.primaryName) ? r.primaryName : areaName,
                        "Route (Secondary)": (r && r.secondaryName) ? r.secondaryName : (primaryAdded ? "Yes" : ""),
                        "Pokemon Name": "",
                        "First?": "",
                        "Type 1": "",
                        "Type 2": "",
                        "LvlMin": "",
                        "LvlMax": "",
                        "Sugest LvlMin": "",
                        "Sugest LvlMax": "",
                        "Peer to Peer": "",
                        "% Appearance": "",
                        "% Appearance Ok?": "",
                        "Pokemon/Type Ok?": "",
                        "BST": "",
                        "Pokemon/BST Ok?": "",
                        "Map Ok?": mapCoords[areaName] ? "Yes" : "No",
                        "Will Unlock": unlockStr,
                        "Requisite": reqString(req),
                        "Reward": giftStr
                    });
                } else {
                    let totalChance = 0;
                    const weights = [];
                    let totalWeight = 0;

                    spawns.forEach(s => {
                        totalChance += (s.chance || 0);
                        const pk = pokemonData[s.pokemonId];
                        const bst = getBST(pk);
                        const evoStage = getEvolutionStage(s.pokemonId);
                        const weight = 10000 / (bst * evoStage);
                        weights.push(weight);
                        totalWeight += weight;
                    });

                    let allOk = Math.abs(totalChance - 1) < 0.01;
                    spawns.forEach((s, idx) => {
                        let cPct = s.chance || 0;
                        let suggestedChance = weights[idx] / totalWeight;
                        if (Math.abs(cPct - suggestedChance) > 0.05) {
                            allOk = false;
                        }
                    });

                    spawns.forEach((s, idx) => {
                        const pk = pokemonData[s.pokemonId];
                        if (!pk) return;

                        const pkName = pk.name;
                        routeSpawnedPokemon.add(s.pokemonId);

                        let first = "";
                        if (currentSeen.has(s.pokemonId)) {
                            let count = currentSeen.get(s.pokemonId);
                            first = "NO " + count;
                            currentSeen.set(s.pokemonId, count + 1);
                            seenPokemon.set(s.pokemonId, count + 1);
                        } else {
                            currentSeen.set(s.pokemonId, 1);
                            seenPokemon.set(s.pokemonId, 1);
                        }

                        let bst = getBST(pk);
                        let diffBST = bst - avgBST;

                        let p2p = 0;
                        if (diffBST > 150) p2p = 4;
                        else if (diffBST >= 100) p2p = 2;
                        else if (diffBST >= 50) p2p = 1;
                        else if (diffBST > -50) p2p = 0;
                        else if (diffBST >= -100) p2p = -1;
                        else if (diffBST > -150) p2p = -2;
                        else p2p = -4;

                        let sugMin = baseMin + p2p;
                        let sugMax = baseMax + p2p;
                        if (sugMin < 1) sugMin = 1;
                        if (sugMax < 1) sugMax = 1;

                        let bstOk = "";
                        if (isMain) {
                            if (quarter === 1 && bst > 400) bstOk = "NONONO";
                            if (quarter === 2 && bst > 500) bstOk = "NONONO";
                            if (quarter === 3 && bst < 250) bstOk = "NONONO";
                            if (quarter === 4 && bst < 350) bstOk = "NONONO";
                        }

                        let chancePct = (s.chance || 0);
                        let appOk = !allOk ? (weights[idx] / totalWeight) : "";

                        let typeOk = "";
                        const routeNameLower = areaName.toLowerCase();
                        if ((routeNameLower.includes("sea") || routeNameLower.includes("water") || routeNameLower.includes("lake") || routeNameLower.includes("ocean")) && pk.types.includes("Fire")) {
                            typeOk = "NONONO";
                        }
                        if (routeNameLower.includes("volcano") && pk.types.includes("Water")) {
                            typeOk = "NONONO";
                        }

                        if (region.num === 9) { typeOk = "Legacy"; } else if (encounterCache[pkName.toLowerCase()]) {
                            const locations = encounterCache[pkName.toLowerCase()];

                        let matchableRouteName = routeNameLower;
                        if (region === 6) {
                            if (routeNameLower.includes("aquacorde outskirts")) matchableRouteName = "kalos-route-2";
                            else if (routeNameLower === "route 2") matchableRouteName = "kalos-route-2";
                            else if (routeNameLower === "route 3") matchableRouteName = "kalos-route-3";
                            else if (routeNameLower.includes("santalune outskirts")) matchableRouteName = "kalos-route-3";
                            else if (routeNameLower === "route 4") matchableRouteName = "kalos-route-4";
                            else if (routeNameLower === "route 5") matchableRouteName = "kalos-route-5";
                            else if (routeNameLower === "route 6") matchableRouteName = "kalos-route-6";
                            else if (routeNameLower === "route 7") matchableRouteName = "kalos-route-7";
                            else if (routeNameLower === "route 8") matchableRouteName = "kalos-route-8";
                            else if (routeNameLower === "route 9") matchableRouteName = "kalos-route-9";
                            else if (routeNameLower === "route 10") matchableRouteName = "kalos-route-10";
                            else if (routeNameLower === "route 11") matchableRouteName = "kalos-route-11";
                            else if (routeNameLower === "route 12") matchableRouteName = "kalos-route-12";
                            else if (routeNameLower === "route 13") matchableRouteName = "kalos-route-13";
                            else if (routeNameLower === "route 14") matchableRouteName = "kalos-route-14";
                            else if (routeNameLower === "route 15") matchableRouteName = "kalos-route-15";
                            else if (routeNameLower === "route 16") matchableRouteName = "kalos-route-16";
                            else if (routeNameLower === "route 17") matchableRouteName = "kalos-route-17";
                            else if (routeNameLower === "route 18") matchableRouteName = "kalos-route-18";
                            else if (routeNameLower === "route 19") matchableRouteName = "kalos-route-19";
                            else if (routeNameLower === "route 20") matchableRouteName = "kalos-route-20";
                            else if (routeNameLower === "route 21") matchableRouteName = "kalos-route-21";
                            else if (routeNameLower === "route 22") matchableRouteName = "kalos-route-22";
                            else if (routeNameLower.includes("santalune forest")) matchableRouteName = "santalune-forest";
                            else if (routeNameLower.includes("lumiose south")) matchableRouteName = "kalos-route-4";
                            else if (routeNameLower.includes("lumiose north")) matchableRouteName = "kalos-route-13";
                            else if (routeNameLower.includes("camphrier berry")) matchableRouteName = "kalos-route-5";
                            else if (routeNameLower.includes("connecting cave")) matchableRouteName = "connecting-cave";
                            else if (routeNameLower.includes("ambrette cliffs")) matchableRouteName = "kalos-route-8";
                            else if (routeNameLower.includes("glittering cave")) matchableRouteName = "glittering-cave";
                            else if (routeNameLower.includes("cyllage seaside")) matchableRouteName = "kalos-route-8";
                            else if (routeNameLower.includes("geosenge megalith")) matchableRouteName = "kalos-route-10";
                            else if (routeNameLower.includes("reflection cave")) matchableRouteName = "reflection-cave";
                            else if (routeNameLower.includes("shalour beachfront")) matchableRouteName = "kalos-route-11";
                            else if (routeNameLower.includes("azure deep")) matchableRouteName = "azure-bay";
                            else if (routeNameLower.includes("azure bay isles")) matchableRouteName = "azure-bay";
                            else if (routeNameLower.includes("coumarine seaside")) matchableRouteName = "kalos-route-12";
                            else if (routeNameLower.includes("coumarine docks")) matchableRouteName = "kalos-route-12";
                            else if (routeNameLower.includes("laverre mushroom")) matchableRouteName = "kalos-route-14";
                            else if (routeNameLower.includes("dendemille windmill")) matchableRouteName = "kalos-route-15";
                            else if (routeNameLower.includes("frost cavern")) matchableRouteName = "frost-cavern";
                            else if (routeNameLower.includes("anistar sundial")) matchableRouteName = "kalos-route-17";
                            else if (routeNameLower.includes("couriway cascades")) matchableRouteName = "kalos-route-18";
                            else if (routeNameLower.includes("vallee grande") || routeNameLower.includes("vallée grande")) matchableRouteName = "kalos-route-19";
                            else if (routeNameLower.includes("snowbelle frostwoods")) matchableRouteName = "kalos-route-19";
                            else if (routeNameLower.includes("hidden village")) matchableRouteName = "pokemon-village";
                            else if (routeNameLower.includes("victory road")) matchableRouteName = "kalos-victory-road";
                            else if (routeNameLower.includes("parfum palace")) matchableRouteName = "parfum-palace";
                            else if (routeNameLower.includes("ambrette reef")) matchableRouteName = "kalos-route-8";
                            else if (routeNameLower.includes("cyllage tidepools")) matchableRouteName = "kalos-route-8";
                            else if (routeNameLower.includes("tower of mastery")) matchableRouteName = "tower-of-mastery";
                            else if (routeNameLower.includes("lost hotel")) matchableRouteName = "lost-hotel";
                            else if (routeNameLower.includes("team flare")) matchableRouteName = "team-flare-secret-hq";
                            else if (routeNameLower.includes("terminus cave")) matchableRouteName = "terminus-cave";
                            else if (routeNameLower.includes("pokemon village") || routeNameLower.includes("pokémon village")) matchableRouteName = "pokemon-village";
                            else if (routeNameLower.includes("friend safari")) matchableRouteName = "friend-safari";
                            else if (routeNameLower.includes("sea spirit")) matchableRouteName = "sea-spirit-den";
                        }
                        const normalizedRoute = matchableRouteName.replace(/[^a-z0-9]/g, '');

                            if (r && r.pokeapiArea && locations.includes(r.pokeapiArea)) {
                                typeOk = "Legacy";
                            } else {
                                for (const loc of locations) {
                                    const normalizedLoc = loc.replace(/[^a-z0-9]/g, '');
                                    if (normalizedLoc.includes(normalizedRoute) || normalizedRoute.includes(normalizedLoc)) {
                                        typeOk = "Legacy";
                                        break;
                                    }
                                }
                            }
                        }

                        routesData.push({
                            "Unlocked at": (i === 0 && isMain && !primaryAdded) ? "" : ((i > 0 && !primaryAdded) ? challengeList[i-1].challengeName : ""),
                            "Challenge": c.challengeName,
                            "Route": (r && r.primaryName) ? r.primaryName : areaName,
                            "Route (Secondary)": (r && r.secondaryName) ? r.secondaryName : (primaryAdded ? "Yes" : ""),
                            "Pokemon Name": pkName,
                            "First?": first,
                            "Type 1": pk.types && pk.types.length > 0 ? pk.types[0] : "",
                            "Type 2": pk.types && pk.types.length > 1 ? pk.types[1] : (pk.types && pk.types.length > 0 ? pk.types[0] : ""),
                            "LvlMin": s.minLevel || 1,
                            "LvlMax": s.maxLevel || 80,
                            "Sugest LvlMin": sugMin,
                            "Sugest LvlMax": sugMax,
                            "Peer to Peer": p2p,
                            "% Appearance": chancePct,
                            "% Appearance Ok?": appOk,
                            "Pokemon/Type Ok?": typeOk,
                            "BST": bst,
                            "Pokemon/BST Ok?": bstOk,
                            "Map Ok?": mapCoords[areaName] ? "Yes" : "No",
                            "Will Unlock": unlockStr,
                            "Requisite": reqString(req),
                            "Reward": giftStr
                        });
                    });
                }

                if (!primaryAdded) {
                    const aggregatedSpawns = collectChallengeSpawns(c, areaNames, routes, seenBeforeChallenge);
                    const sugReq = suggestRequirement({
                        region,
                        c,
                        areaNames,
                        challengeIndex: i,
                        totalInChain: challengeList.length,
                        isMain,
                        quarter,
                        spawns: aggregatedSpawns,
                        tracker: reqTracker
                    });

                    challengesData.push({
                        "Challenge Name": c.challengeName,
                        "Requisite": reqString(req),
                        "Sugestion for Req": sugReq,
                        "Reward Map": unlockStr,
                        "Reward Challenge": resolveUnlockedChallenges(c),
                        "Reward Gift": giftStr
                    });
                    primaryAdded = true;
                }
            });
            if (isMain) {
                mainSeenSets[i] = new Map(currentSeen);
            }
        }

        if (isMain) {
            return currentSeen;
        }
    };

    const mainSeenSet = processUnlocks(mainChallenges, true, 0, new Map());
    Object.keys(extraChallenges).sort().forEach(k => {
        let splitSeenSet = new Map(mainSeenSet);
        if (extraChallenges[k].length > 0) {
            const firstExtraReq = extraChallenges[k][0].requirements;
            if (firstExtraReq && firstExtraReq.challenge) {
                const reqName = firstExtraReq.challenge;
                const match = reqName.match(/Challenge\s+(\d+)/);
                if (match) {
                    const idx = parseInt(match[1]) - 1;
                    if (idx >= 0 && idx < mainSeenSets.length) {
                        splitSeenSet = new Map(mainSeenSets[idx]);
                    }
                }
            }
        }
        processUnlocks(extraChallenges[k], false, mainChallenges.length, splitSeenSet);
    });

    if (typeof hChallenges !== 'undefined' && hChallenges.length > 0) {
        processUnlocks(hChallenges, false, mainChallenges.length, new Map(mainSeenSet));
    }

    // Add remaining maps that haven't been added yet
    const generatedRoutes = new Set(routesData.map(r => r["Route"]));
    const allMapNames = Object.values(mapCoords).map(m => m.name);

    // Also include any route explicitly defined in the routes file, even if it lacks mapCoords
    const allDefinedRoutes = routes.map(r => r.name).filter(Boolean);
    const spotsToProcess = new Set([...allMapNames, ...allDefinedRoutes]);

    spotsToProcess.forEach(mapName => {
        if (!generatedRoutes.has(mapName)) {
            const r = routes.find(ro => ro.name === mapName) || {};
            const spawns = r.spawns || [];

            // Re-check Map Ok because some fallback routes might not have mapCoords
            const mapOkStr = allMapNames.includes(mapName) ? "Yes" : "No";

            let avgBST = 0;
            if (spawns.length > 0) {
                let sumBST = 0;
                let uniqueIds = new Set();
                spawns.forEach(s => {
                    uniqueIds.add(s.pokemonId);
                });
                uniqueIds.forEach(id => {
                    sumBST += getBST(pokemonData[id]);
                });
                avgBST = uniqueIds.size > 0 ? sumBST / uniqueIds.size : 0;
            }

            if (spawns.length === 0) {
                routesData.push({
                    "Unlocked at": "",
                    "Challenge": "",
                    "Route": mapName,
                    "Route (Secondary)": "",
                    "Pokemon Name": "",
                    "First?": "",
                        "Type 1": "",
                        "Type 2": "",
                        "LvlMin": "",
                        "LvlMax": "",
                        "Sugest LvlMin": "",
                        "Sugest LvlMax": "",
                    "Peer to Peer": "",
                    "% Appearance": "",
                    "% Appearance Ok?": "",
                    "Pokemon/Type Ok?": "",
                    "BST": "",
                    "Pokemon/BST Ok?": "",
                    "Map Ok?": mapOkStr,
                    "Will Unlock": "",
                    "Requisite": "",
                    "Reward": ""
                });
            } else {
                let totalChance = 0;
                const weights = [];
                let totalWeight = 0;

                spawns.forEach(s => {
                    totalChance += (s.chance || 0);
                    const pk = pokemonData[s.pokemonId];
                    const bst = getBST(pk);
                    const evoStage = getEvolutionStage(s.pokemonId);
                    const weight = 10000 / (bst * evoStage);
                    weights.push(weight);
                    totalWeight += weight;
                });

                let allOk = Math.abs(totalChance - 1) < 0.01;
                spawns.forEach((s, idx) => {
                    let cPct = s.chance || 0;
                    let suggestedChance = weights[idx] / totalWeight;
                    if (Math.abs(cPct - suggestedChance) > 0.05) {
                        allOk = false;
                    }
                });

                spawns.forEach((s, idx) => {
                    const pk = pokemonData[s.pokemonId];
                    if (!pk) return;

                    const pkName = pk.name;
                    routeSpawnedPokemon.add(s.pokemonId);

                    let first = "";
                    if (seenPokemon.has(s.pokemonId)) {
                        let count = seenPokemon.get(s.pokemonId);
                        first = "NO " + count;
                        seenPokemon.set(s.pokemonId, count + 1);
                    } else {
                        seenPokemon.set(s.pokemonId, 1);
                    }

                    let bst = getBST(pk);
                    let diffBST = bst - avgBST;

                    let p2p = 0;
                    if (diffBST > 150) p2p = 4;
                    else if (diffBST >= 100) p2p = 2;
                    else if (diffBST >= 50) p2p = 1;
                    else if (diffBST > -50) p2p = 0;
                    else if (diffBST >= -100) p2p = -1;
                    else if (diffBST > -150) p2p = -2;
                    else p2p = -4;

                    let baseMin = s.minLevel || 1;
                    let baseMax = s.maxLevel || 100;
                    let sugMin = baseMin + p2p;
                    let sugMax = baseMax + p2p;
                    if (sugMin < 1) sugMin = 1;
                    if (sugMax < 1) sugMax = 1;

                    let bstOk = ""; // No quarter checking for fallback maps

                    let chancePct = (s.chance || 0);
                    let appOk = !allOk ? (weights[idx] / totalWeight) : "";

                    let typeOk = "";
                    const routeNameLower = mapName.toLowerCase();
                    if ((routeNameLower.includes("sea") || routeNameLower.includes("water") || routeNameLower.includes("lake") || routeNameLower.includes("ocean")) && pk.types.includes("Fire")) {
                        typeOk = "NONONO";
                    }
                    if (routeNameLower.includes("volcano") && pk.types.includes("Water")) {
                        typeOk = "NONONO";
                    }

                    if (region.num === 9) { typeOk = "Legacy"; } else if (encounterCache[pkName.toLowerCase()]) {
                        const locations = encounterCache[pkName.toLowerCase()];
                        const normalizedRoute = routeNameLower.replace(/[^a-z0-9]/g, '');
                        if (r && r.pokeapiArea && locations.includes(r.pokeapiArea)) {
                            typeOk = "Legacy";
                        } else {
                            for (const loc of locations) {
                                const normalizedLoc = loc.replace(/[^a-z0-9]/g, '');
                                if (normalizedLoc.includes(normalizedRoute) || normalizedRoute.includes(normalizedLoc)) {
                                    typeOk = "Legacy";
                                    break;
                                }
                            }
                        }
                    }

                    routesData.push({
                        "Unlocked at": "",
                        "Challenge": "",
                        "Route": (r && r.primaryName) ? r.primaryName : mapName,
                        "Route (Secondary)": (r && r.secondaryName) ? r.secondaryName : "",
                        "Pokemon Name": pkName,
                        "First?": first,
                        "Type 1": pk.types && pk.types.length > 0 ? pk.types[0] : "",
                            "Type 2": pk.types && pk.types.length > 1 ? pk.types[1] : (pk.types && pk.types.length > 0 ? pk.types[0] : ""),
                            "LvlMin": s.minLevel || 1,
                            "LvlMax": s.maxLevel || 80,
                            "Sugest LvlMin": sugMin,
                            "Sugest LvlMax": sugMax,
                        "Peer to Peer": p2p,
                        "% Appearance": chancePct,
                        "% Appearance Ok?": appOk,
                        "Pokemon/Type Ok?": typeOk,
                        "BST": bst,
                        "Pokemon/BST Ok?": bstOk,
                        "Map Ok?": mapOkStr,
                        "Will Unlock": "",
                        "Requisite": "",
                        "Reward": ""
                    });
                });
            }
        }
    });

const missingData = [];

    const getFamilyMissingCount = (id) => {
        let count = 0;
        let queue = [id];
        let visited = new Set();
        let familyIds = new Set();

        let root = id;
        while (evosBackward[root]) {
            root = evosBackward[root];
        }

        queue = [root];
        while (queue.length > 0) {
            let current = queue.shift();
            if (visited.has(current)) continue;
            visited.add(current);
            familyIds.add(parseInt(current));

            if (evosForward[current]) {
                evosForward[current].forEach(next => queue.push(next));
            }
        }

        familyIds.forEach(fid => {
            if (nativeIds.includes(fid) && !routeSpawnedPokemon.has(fid)) {
                count++;
            }
        });

        return count;
    };

    nativeIds.forEach(id => {
        if (!routeSpawnedPokemon.has(id)) {
            const pk = pokemonData[id];
            if (!pk) return;

            let obtainStr = "No";

            const prevId = evosBackward[id];
            if (prevId && routeSpawnedPokemon.has(parseInt(prevId))) {
                obtainStr = "Evolve";
            } else if (prevId) {
                const prevPrevId = evosBackward[prevId];
                if (prevPrevId && routeSpawnedPokemon.has(parseInt(prevPrevId))) {
                    obtainStr = "2xEvolution";
                }
            }

            if (obtainStr === "No") {
                const evos = evosForward[id];
                if (evos) {
                    for (const nextId of evos) {
                        if (routeSpawnedPokemon.has(parseInt(nextId))) {
                            obtainStr = "Breed";
                            break;
                        }
                        const nextNextEvos = evosForward[nextId];
                        if (nextNextEvos) {
                            for (const nn of nextNextEvos) {
                                if (routeSpawnedPokemon.has(parseInt(nn))) {
                                    obtainStr = "2xBreed";
                                    break;
                                }
                            }
                        }
                    }
                }
            }

            if (obtainStr === "No") {
                const count = getFamilyMissingCount(id);
                obtainStr = `No${count}`;
            }

            missingData.push({
                "Can Obtain?": obtainStr,
                "Pokemon Name": pk.name,
                "Type 1": pk.types && pk.types.length > 0 ? pk.types[0] : "",
                "Type 2": pk.types && pk.types.length > 1 ? pk.types[1] : (pk.types && pk.types.length > 0 ? pk.types[0] : ""),
                "BST": getBST(pk)
            });
        }
    });

    const mergedRoutesData = [];
    const seenRoutePoke = new Map();
    for (const row of routesData) {
        const route = row["Route"];
        const pkName = row["Pokemon Name"];
        if (route && pkName) {
            const key = `${route}|||${pkName}`;
            if (seenRoutePoke.has(key)) {
                const existing = seenRoutePoke.get(key);
                if (typeof existing["LvlMin"] === 'number' && typeof row["LvlMin"] === 'number') {
                    existing["LvlMin"] = Math.min(existing["LvlMin"], row["LvlMin"]);
                }
                if (typeof existing["LvlMax"] === 'number' && typeof row["LvlMax"] === 'number') {
                    existing["LvlMax"] = Math.max(existing["LvlMax"], row["LvlMax"]);
                }
                if (typeof existing["Sugest LvlMin"] === 'number' && typeof row["Sugest LvlMin"] === 'number') {
                    existing["Sugest LvlMin"] = Math.min(existing["Sugest LvlMin"], row["Sugest LvlMin"]);
                }
                if (typeof existing["Sugest LvlMax"] === 'number' && typeof row["Sugest LvlMax"] === 'number') {
                    existing["Sugest LvlMax"] = Math.max(existing["Sugest LvlMax"], row["Sugest LvlMax"]);
                }
                if (existing["Challenge"] === row["Challenge"] && typeof existing["% Appearance"] === 'number' && typeof row["% Appearance"] === 'number') {
                    existing["% Appearance"] += row["% Appearance"];
                }
                continue;
            }
            seenRoutePoke.set(key, row);
        }
        mergedRoutesData.push(row);
    }

    const routeSecondaryEmpty = mergedRoutesData.every(r => !r["Route (Secondary)"]);
    if (routeSecondaryEmpty) {
        mergedRoutesData.forEach(r => delete r["Route (Secondary)"]);
    }

    const regionSuffix = ` (${region.name})`;
    const stripRegionSuffix = (rows) => {
        for (const row of rows) {
            for (const key of Object.keys(row)) {
                if (typeof row[key] === 'string' && row[key].includes(regionSuffix)) {
                    row[key] = row[key].replaceAll(regionSuffix, '');
                }
            }
        }
    };
    stripRegionSuffix(mergedRoutesData);
    stripRegionSuffix(challengesData);

    const wb = xlsx.utils.book_new();
    const wsRoutes = xlsx.utils.json_to_sheet(mergedRoutesData);
    xlsx.utils.book_append_sheet(wb, wsRoutes, "Routes");
    const wsChallenges = xlsx.utils.json_to_sheet(challengesData);
    xlsx.utils.book_append_sheet(wb, wsChallenges, "Challenges");
    const wsMissing = xlsx.utils.json_to_sheet(missingData);
    xlsx.utils.book_append_sheet(wb, wsMissing, "Missing PK");

    const xdataDir = path.join(__dirname, '..', 'xdata');
    const exportDir = 'C:\\Users\\lsamp\\OneDrive\\Desktop\\PiW';
    const scanDir = fs.existsSync(exportDir) ? exportDir : xdataDir;
    const prefix = `${region.num}_${region.name}_Data_`;
    const counterRegex = new RegExp(`^${prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\d+)\\.xlsx$`);
    let maxCounter = 0;
    if (fs.existsSync(scanDir)) {
        for (const file of fs.readdirSync(scanDir)) {
            const match = file.match(counterRegex);
            if (match) {
                const num = parseInt(match[1], 10);
                if (num > maxCounter) maxCounter = num;
            }
        }
    }
    const nextCounter = maxCounter + 1;
    const outFile = path.join(xdataDir, `${prefix}${nextCounter}.xlsx`);

    // Formatting cols
    const colsRoutes = ["% Appearance", "% Appearance Ok?"];
    const rangeRoutes = xlsx.utils.decode_range(wsRoutes['!ref']);
    for (let c = rangeRoutes.s.c; c <= rangeRoutes.e.c; c++) {
        const header = wsRoutes[xlsx.utils.encode_cell({r: 0, c})];
        if (header && colsRoutes.includes(header.v)) {
            for (let r = 1; r <= rangeRoutes.e.r; r++) {
                const cell = wsRoutes[xlsx.utils.encode_cell({r, c})];
                if (cell && typeof cell.v === 'number') {
                    cell.z = '0%';
                }
            }
        }
    }

    xlsx.writeFile(wb, outFile);
    console.log(`Generated ${outFile}`);
}

(async () => {
    const args = process.argv.slice(2);



    if (args.length === 0) {
        console.log("Generating data for all regions...");
        for (const region of REGIONS) {
            await processRegion(region, 0); // counter unused
        }
    } else {
        const regionArg = args[0].toLowerCase();
        const regionToProcess = REGIONS.find(r => r.num.toString() === regionArg || r.name.toLowerCase() === regionArg);

        if (!regionToProcess) {
            console.error(`Error: Region '${args[0]}' not found.`);
            process.exit(1);
        }

        await processRegion(regionToProcess, 0); // counter unused
    }


})();
