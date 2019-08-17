// Crypto-related functions.

// Serialized data are AES-encrypted in GCM mode with a key derived from
// a user-supplied password using PBKDF2 and SHA-256.

// Length of password salt in bytes.
const saltLen = 16;
// Length of IV size in bytes.
const ivLen = 12;
// Iteration count for PBKDF2 key derivation.
const pbkdf2Iter = 1024;

function getRandomBytes(n) {
    return crypto.getRandomValues(new Uint8Array(n));
}

function encodeText(text) {
    return new TextEncoder().encode(text);
}

function decodeText(buf) {
    return new TextDecoder("utf-8", {fatal: true}).decode(buf);
}

function hexEncode(bytes) {
    return Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("");
}

function hexDecode(hex) {
    return isHexEncoded(hex) &&
        Uint8Array.from(hex.matchAll(/../g), m => parseInt(m[0], 16));
}

function isHexEncoded(text) {
    return /^([0-9a-f]{2})+$/.test(text);
}

async function importKeyForDerivation(password) {
    return crypto.subtle.importKey(
        "raw",
        encodeText(password),
        {name: "PBKDF2"},
        false,
        ["deriveKey"]
    );
}

async function importKeyForSigning(secret) {
    return crypto.subtle.importKey(
        "raw",
        encodeText(secret),
        {name: "HMAC", hash: "SHA-256"},
        false,
        ["sign"]
    );
}

async function deriveSaltedKey(key, salt) {
    return crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            hash: "SHA-256",
            salt,
            iterations: pbkdf2Iter,
        },
        key,
        {
            name: "AES-GCM",
            length: 256,
        },
        true,
        ["encrypt", "decrypt"]
    );
}

async function encrypt(plaintext, key) {
    const salt = getRandomBytes(saltLen);
    const salted = await deriveSaltedKey(key, salt);
    const iv = getRandomBytes(ivLen);
    const ciphertext = await crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv
        },
        salted,
        encodeText(plaintext)
    );
    return hexEncode(salt) + hexEncode(iv) +
        hexEncode(new Uint8Array(ciphertext));
}

async function decrypt(hex, password) {
    const payload = hexDecode(hex);
    if (!payload || payload.length < saltLen + ivLen) {
        throw Error("Bad encoding");
    }
    const salt = payload.subarray(0, saltLen);
    const iv = payload.subarray(saltLen, saltLen + ivLen);
    const ciphertext = payload.subarray(saltLen + ivLen);
    try {
        const unsalted = await importKeyForDerivation(password);
        const salted = await deriveSaltedKey(unsalted, salt);
        const buf = await crypto.subtle.decrypt(
            {
                name: "AES-GCM",
                iv
            },
            salted,
            ciphertext
        );
        return [decodeText(buf), unsalted];
    } catch (_) {
        throw Error("Wrong password");
    }
}

// Key function to sign BitMEX API requests.
async function signHMAC(key, payload) {
    const sig = await crypto.subtle.sign("HMAC", key, encodeText(payload));
    return hexEncode(new Uint8Array(sig));
}