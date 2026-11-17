// src/utils/saveCrypto.js
// Synchronous authenticated encryption (SHA-256 CTR + HMAC-SHA-256) for save backups.

const SAVE_FILE_PREFIX = 'PIW_SAVE_V1';
const SAVE_CRYPTO_SECRET = 'PiW::SaveIntegrity::v1::9f3c7a2e8b1d4065';

const K = new Uint32Array([
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
]);

function utf8Encode(str) {
    if (typeof TextEncoder !== 'undefined') {
        return new TextEncoder().encode(str);
    }
    const encoded = unescape(encodeURIComponent(str));
    const bytes = new Uint8Array(encoded.length);
    for (let i = 0; i < encoded.length; i++) {
        bytes[i] = encoded.charCodeAt(i);
    }
    return bytes;
}

function utf8Decode(bytes) {
    if (typeof TextDecoder !== 'undefined') {
        return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    }
    let str = '';
    for (let i = 0; i < bytes.length; i++) {
        str += String.fromCharCode(bytes[i]);
    }
    return decodeURIComponent(escape(str));
}

function sha256Bytes(data) {
    const bitLen = data.length * 8;
    const padLen = ((data.length + 9 + 63) >> 6) << 6;
    const padded = new Uint8Array(padLen);
    padded.set(data);
    padded[data.length] = 0x80;

    const view = new DataView(padded.buffer);
    view.setUint32(padLen - 8, Math.floor(bitLen / 0x100000000), false);
    view.setUint32(padLen - 4, bitLen >>> 0, false);

    let h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a;
    let h4 = 0x510e527f, h5 = 0x9b05688c, h6 = 0x1f83d9ab, h7 = 0x5be0cd19;

    const w = new Uint32Array(64);
    for (let offset = 0; offset < padLen; offset += 64) {
        for (let i = 0; i < 16; i++) {
            w[i] = view.getUint32(offset + i * 4, false);
        }
        for (let i = 16; i < 64; i++) {
            const s0 = ((w[i - 15] >>> 7) | (w[i - 15] << 25)) ^ ((w[i - 15] >>> 18) | (w[i - 15] << 14)) ^ (w[i - 15] >>> 3);
            const s1 = ((w[i - 2] >>> 17) | (w[i - 2] << 15)) ^ ((w[i - 2] >>> 19) | (w[i - 2] << 13)) ^ (w[i - 2] >>> 10);
            w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
        }

        let a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;
        for (let i = 0; i < 64; i++) {
            const S1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
            const ch = (e & f) ^ (~e & g);
            const temp1 = (h + S1 + ch + K[i] + w[i]) >>> 0;
            const S0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
            const maj = (a & b) ^ (a & c) ^ (b & c);
            const temp2 = (S0 + maj) >>> 0;

            h = g; g = f; f = e; e = (d + temp1) >>> 0;
            d = c; c = b; b = a; a = (temp1 + temp2) >>> 0;
        }

        h0 = (h0 + a) >>> 0; h1 = (h1 + b) >>> 0; h2 = (h2 + c) >>> 0; h3 = (h3 + d) >>> 0;
        h4 = (h4 + e) >>> 0; h5 = (h5 + f) >>> 0; h6 = (h6 + g) >>> 0; h7 = (h7 + h) >>> 0;
    }

    const out = new Uint8Array(32);
    const outView = new DataView(out.buffer);
    [h0, h1, h2, h3, h4, h5, h6, h7].forEach((val, idx) => outView.setUint32(idx * 4, val, false));
    return out;
}

function hmacSha256Bytes(keyBytes, messageBytes) {
    const blockSize = 64;
    const key = keyBytes.length > blockSize ? sha256Bytes(keyBytes) : keyBytes;
    const oKeyPad = new Uint8Array(blockSize);
    const iKeyPad = new Uint8Array(blockSize);
    for (let i = 0; i < blockSize; i++) {
        const kb = i < key.length ? key[i] : 0;
        oKeyPad[i] = kb ^ 0x5c;
        iKeyPad[i] = kb ^ 0x36;
    }

    const inner = new Uint8Array(blockSize + messageBytes.length);
    inner.set(iKeyPad);
    inner.set(messageBytes, blockSize);
    const innerHash = sha256Bytes(inner);

    const outer = new Uint8Array(blockSize + innerHash.length);
    outer.set(oKeyPad);
    outer.set(innerHash, blockSize);
    return sha256Bytes(outer);
}

function bytesToHex(bytes) {
    return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
}

function bytesToBase64(bytes) {
    if (typeof Buffer !== 'undefined') {
        return Buffer.from(bytes).toString('base64');
    }
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

function base64ToBytes(b64) {
    if (typeof Buffer !== 'undefined') {
        const buf = Buffer.from(b64, 'base64');
        if (buf.toString('base64') !== b64.replace(/=+$/, '') && b64 !== buf.toString('base64')) {
            throw new Error('Invalid base64 encoding');
        }
        return new Uint8Array(buf);
    }
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
}

function xorWithCtrKeystream(inputBytes, keyBytes, ivBytes) {
    const output = new Uint8Array(inputBytes.length);
    const blockInput = new Uint8Array(keyBytes.length + ivBytes.length + 4);
    blockInput.set(keyBytes, 0);
    blockInput.set(ivBytes, keyBytes.length);
    const counterView = new DataView(blockInput.buffer, keyBytes.length + ivBytes.length, 4);

    for (let offset = 0, counter = 0; offset < inputBytes.length; offset += 32, counter++) {
        counterView.setUint32(0, counter, false);
        const keystream = sha256Bytes(blockInput);
        const limit = Math.min(32, inputBytes.length - offset);
        for (let i = 0; i < limit; i++) {
            output[offset + i] = inputBytes[offset + i] ^ keystream[i];
        }
    }
    return output;
}

function randomBytes16() {
    const iv = new Uint8Array(16);
    if (typeof globalThis !== 'undefined' && globalThis.crypto && typeof globalThis.crypto.getRandomValues === 'function') {
        globalThis.crypto.getRandomValues(iv);
    } else {
        for (let i = 0; i < 16; i++) {
            iv[i] = Math.floor(Math.random() * 256);
        }
    }
    return iv;
}

function constantTimeEqual(a, b) {
    if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
    let diff = 0;
    for (let i = 0; i < a.length; i++) {
        diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return diff === 0;
}

/**
 * Encrypts a plain save JSON string into a tamper-evident .txt token.
 * @param {string} plainText
 * @returns {string}
 */
export function encryptSaveText(plainText) {
    const keyBytes = utf8Encode(SAVE_CRYPTO_SECRET);
    const iv = randomBytes16();
    const plainBytes = utf8Encode(plainText);
    const cipherBytes = xorWithCtrKeystream(plainBytes, keyBytes, iv);

    const headerAndBody = `${SAVE_FILE_PREFIX}.${bytesToBase64(iv)}.${bytesToBase64(cipherBytes)}`;
    const macHex = bytesToHex(hmacSha256Bytes(keyBytes, utf8Encode(headerAndBody)));
    return `${headerAndBody}.${macHex}`;
}

/**
 * Verifies integrity and decrypts a save .txt token. Throws if modified or invalid.
 * @param {string} encryptedText
 * @returns {string}
 */
export function decryptSaveText(encryptedText) {
    if (typeof encryptedText !== 'string') {
        throw new Error('Save data is invalid.');
    }
    const trimmed = encryptedText.trim();
    const parts = trimmed.split('.');
    if (parts.length !== 4 || parts[0] !== SAVE_FILE_PREFIX) {
        throw new Error('Save file format is invalid or has been modified.');
    }

    const [, ivB64, ctB64, providedMac] = parts;
    const keyBytes = utf8Encode(SAVE_CRYPTO_SECRET);
    const headerAndBody = `${SAVE_FILE_PREFIX}.${ivB64}.${ctB64}`;
    const expectedMac = bytesToHex(hmacSha256Bytes(keyBytes, utf8Encode(headerAndBody)));

    if (!constantTimeEqual(providedMac, expectedMac)) {
        throw new Error('Save file integrity check failed: data was modified or corrupted.');
    }

    const iv = base64ToBytes(ivB64);
    if (iv.length !== 16) {
        throw new Error('Save file IV is invalid.');
    }
    const cipherBytes = base64ToBytes(ctB64);
    const plainBytes = xorWithCtrKeystream(cipherBytes, keyBytes, iv);
    return utf8Decode(plainBytes);
}
