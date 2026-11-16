import { state } from '../state.js';

export function getSpriteUrl(id, isShiny = false) {
    if (!state || !state.config || (!state.config.pokemonMap && !state.config.pokemonData) || id === undefined || id === null) return '';
    const pData = state.config.pokemonMap
        ? (state.config.pokemonMap.get(Number(id)) || state.config.pokemonMap.get(id))
        : state.config.pokemonData.find(pd => pd.id == id);
    if (!pData) return '';
    const paddedId = id.toString().padStart(4, '0');
    return `Assets/Pokemon Sprites/Natural/Gen5/${paddedId}_${pData.name}${isShiny ? '_shiny' : ''}.png`;
};

const routeTrimCache = new Map();
const partyTrimCache = new Map();
const inFlightTrims = new Map();

function revokeBlobUrl(url) {
    if (typeof url === 'string' && url.startsWith('blob:') && typeof URL !== 'undefined' && typeof URL.revokeObjectURL === 'function') {
        try {
            URL.revokeObjectURL(url);
        } catch {
            // Ignore revoke errors
        }
    }
}

export function clearRouteSpriteCache() {
    for (const url of routeTrimCache.values()) {
        revokeBlobUrl(url);
    }
    routeTrimCache.clear();
}

function trimImageElement(img, naturalUrl) {
    try {
        if (typeof document === 'undefined') return Promise.resolve(naturalUrl);
        const w = img.naturalWidth || img.width;
        const h = img.naturalHeight || img.height;
        if (!w || !h) return Promise.resolve(naturalUrl);

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return Promise.resolve(naturalUrl);

        ctx.drawImage(img, 0, 0);
        const { data } = ctx.getImageData(0, 0, w, h);

        let minX = w, minY = h, maxX = -1, maxY = -1;
        for (let y = 0; y < h; y++) {
            const rowOffset = y * w * 4;
            for (let x = 0; x < w; x++) {
                if (data[rowOffset + x * 4 + 3] > 0) {
                    if (x < minX) minX = x;
                    if (x > maxX) maxX = x;
                    if (y < minY) minY = y;
                    if (y > maxY) maxY = y;
                }
            }
        }

        if (maxX < minX || maxY < minY) return Promise.resolve(naturalUrl);

        const trimW = maxX - minX + 1;
        const trimH = maxY - minY + 1;
        if (trimW === w && trimH === h) return Promise.resolve(naturalUrl);

        const outCanvas = document.createElement('canvas');
        outCanvas.width = trimW;
        outCanvas.height = trimH;
        const outCtx = outCanvas.getContext('2d');
        if (!outCtx) return Promise.resolve(naturalUrl);

        outCtx.drawImage(canvas, minX, minY, trimW, trimH, 0, 0, trimW, trimH);

        if (typeof outCanvas.toBlob === 'function' && typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function') {
            return new Promise((resolve) => {
                try {
                    outCanvas.toBlob((blob) => {
                        if (!blob) {
                            resolve(naturalUrl);
                            return;
                        }
                        try {
                            resolve(URL.createObjectURL(blob));
                        } catch {
                            resolve(naturalUrl);
                        }
                    }, 'image/png');
                } catch {
                    resolve(naturalUrl);
                }
            });
        }

        return Promise.resolve(outCanvas.toDataURL('image/png'));
    } catch {
        return Promise.resolve(naturalUrl);
    }
}

export function trimAndCacheSprite(naturalUrl, isParty = false) {
    if (!naturalUrl || typeof Image === 'undefined' || typeof document === 'undefined') {
        return Promise.resolve(naturalUrl || '');
    }

    const targetCache = isParty ? partyTrimCache : routeTrimCache;
    if (targetCache.has(naturalUrl)) {
        return Promise.resolve(targetCache.get(naturalUrl));
    }
    if (inFlightTrims.has(naturalUrl)) {
        return inFlightTrims.get(naturalUrl);
    }

    const promise = new Promise((resolve) => {
        try {
            const img = new Image();
            img.onload = async () => {
                const trimmedUrl = await trimImageElement(img, naturalUrl);
                targetCache.set(naturalUrl, trimmedUrl);
                inFlightTrims.delete(naturalUrl);
                resolve(trimmedUrl);
            };
            img.onerror = () => {
                inFlightTrims.delete(naturalUrl);
                resolve(naturalUrl);
            };
            img.src = naturalUrl;
        } catch {
            inFlightTrims.delete(naturalUrl);
            resolve(naturalUrl);
        }
    });

    inFlightTrims.set(naturalUrl, promise);
    return promise;
}

export function getTrimmedSpriteUrl(id, isShiny = false, isParty = false) {
    const naturalUrl = getSpriteUrl(id, isShiny);
    if (!naturalUrl) return '';

    const cached = (isParty ? partyTrimCache.get(naturalUrl) : null)
        || routeTrimCache.get(naturalUrl)
        || partyTrimCache.get(naturalUrl);

    if (cached) return cached;

    // Kick off background trim for next render; return naturalUrl safely now
    trimAndCacheSprite(naturalUrl, isParty);
    return naturalUrl;
}

export function precacheRouteSprites(routeName) {
    try {
        clearRouteSpriteCache();

        if (state && Array.isArray(state.party)) {
            for (const p of state.party) {
                if (p && p.id !== undefined && p.id !== null) {
                    const url = getSpriteUrl(p.id, p.qualityName === 'Shiny');
                    if (url) trimAndCacheSprite(url, true);
                }
            }
        }

        if (!routeName || !state || !state.config || !Array.isArray(state.config.routes)) return;
        const route = state.config.routes.find(r => r.name === routeName || r.areaId === routeName);
        if (!route || !Array.isArray(route.encounters)) return;

        const seenIds = new Set();
        for (const enc of route.encounters) {
            const id = enc?.pokemonId ?? enc?.id;
            if (id !== undefined && id !== null && !seenIds.has(id)) {
                seenIds.add(id);
                const url = getSpriteUrl(id, false);
                if (url) trimAndCacheSprite(url, false);
            }
        }
    } catch {
        // Never crash on precache
    }
}
