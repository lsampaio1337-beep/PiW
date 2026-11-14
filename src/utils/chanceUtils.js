// Fraction definitions commonly used when rounding equal probabilities
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

/**
 * Normalizes an array of spawn objects so that:
 * 1. Rounded fractional values (e.g. 0.33 for 1/3, 0.17 for 1/6, 0.14 for 1/7, 0.11 for 1/9, 0.13 for 1/8) are recognized and restored.
 * 2. If all spawns (or spawns with rounding adjustments like 33%, 33%, 34%) represent an equal distribution, they receive exactly 1 / n.
 * 3. The sum of all spawn chances is normalized to sum to exactly 1.0.
 *
 * @param {Array<Object>} spawns - Array of spawn encounter objects (having a `chance` or `probability` property)
 * @returns {Array<Object>} The normalized spawns array
 */
export function normalizeSpawnChances(spawns) {
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
    let minVal = Infinity;
    let maxVal = -Infinity;
    for (let i = 0; i < n; i++) {
        const val = Number(spawns[i][prop]) || 0;
        sum += val;
        if (val < minVal) minVal = val;
        if (val > maxVal) maxVal = val;
    }
    if (sum <= 0) return spawns;

    // Check if entire route is an equal-split pattern with minor rounding differences (e.g. [33%, 33%, 34%] or [17%, 17%, 17%, 17%, 17%, 17%])
    const expectedEqual = 1.0 / n;

    if (maxVal - minVal <= 0.02 && Math.abs(minVal - expectedEqual) <= 0.02) {
        for (let i = 0; i < n; i++) {
            spawns[i][prop] = expectedEqual;
            if (spawns[i].chance !== undefined) spawns[i].chance = expectedEqual;
        }
        return spawns;
    }

    // Check individual spawns for rounded fractional values
    for (let i = 0; i < n; i++) {
        const val = Number(spawns[i][prop]) || 0;
        // Skip standard terminating round decimals (e.g. multiples of 0.05 or 0.25)
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

    // Normalize so total sum is exactly 1.0
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

/**
 * Normalizes all routes in a route collection (array or object map).
 *
 * @param {Array|Object} routes - The routes collection to normalize
 * @returns {Array|Object} The normalized routes
 */
export function normalizeRoutesData(routes) {
    if (!routes) return routes;

    if (Array.isArray(routes)) {
        for (let i = 0; i < routes.length; i++) {
            const r = routes[i];
            if (r && r.spawns) {
                normalizeSpawnChances(r.spawns);
            }
        }
    } else if (typeof routes === 'object') {
        const keys = Object.keys(routes);
        for (let i = 0; i < keys.length; i++) {
            const r = routes[keys[i]];
            if (r) {
                if (r.spawns) normalizeSpawnChances(r.spawns);
                if (r.pokes) normalizeSpawnChances(r.pokes);
            }
        }
    }

    return routes;
}
