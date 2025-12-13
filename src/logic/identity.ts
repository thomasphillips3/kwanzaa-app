// Identity module for pseudonymous signing
// Uses WebCrypto API for key generation and signing

export interface Identity {
    publicKey: string;      // Base64-encoded public key
    displayName: string;    // User-chosen display name
    createdAt: string;      // ISO timestamp
}

interface StoredIdentity extends Identity {
    privateKey: string;     // Base64-encoded private key (never shared)
}

const STORAGE_KEY = "kwanzaa_identity";

// Convert ArrayBuffer to Base64
function toBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

// Convert Base64 to ArrayBuffer
function fromBase64(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
}

// Generate a new ECDSA P-256 keypair
async function generateKeyPair(): Promise<CryptoKeyPair> {
    return await crypto.subtle.generateKey(
        {
            name: "ECDSA",
            namedCurve: "P-256"
        },
        true, // extractable
        ["sign", "verify"]
    );
}

// Export public key to Base64
async function exportPublicKey(key: CryptoKey): Promise<string> {
    const exported = await crypto.subtle.exportKey("spki", key);
    return toBase64(exported);
}

// Export private key to Base64
async function exportPrivateKey(key: CryptoKey): Promise<string> {
    const exported = await crypto.subtle.exportKey("pkcs8", key);
    return toBase64(exported);
}

// Import public key from Base64
async function importPublicKey(base64: string): Promise<CryptoKey> {
    const keyData = fromBase64(base64);
    return await crypto.subtle.importKey(
        "spki",
        keyData,
        { name: "ECDSA", namedCurve: "P-256" },
        true,
        ["verify"]
    );
}

// Import private key from Base64
async function importPrivateKey(base64: string): Promise<CryptoKey> {
    const keyData = fromBase64(base64);
    return await crypto.subtle.importKey(
        "pkcs8",
        keyData,
        { name: "ECDSA", namedCurve: "P-256" },
        true,
        ["sign"]
    );
}

// Generate default display name from public key
function generateDefaultDisplayName(publicKey: string): string {
    // Use first 8 characters of public key hash for display name
    const shortId = publicKey.substring(0, 8).replace(/[^a-zA-Z0-9]/g, "");
    return `User_${shortId}`;
}

// Save identity to storage
function saveIdentity(identity: StoredIdentity): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(identity));
    } catch (err) {
        console.warn("[identity] Failed to save identity:", err);
    }
}

// Load identity from storage
function loadIdentity(): StoredIdentity | null {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored) as StoredIdentity;
        }
    } catch (err) {
        console.warn("[identity] Failed to load identity:", err);
    }
    return null;
}

// Generate a new identity
export async function generateIdentity(displayName?: string): Promise<Identity> {
    const keyPair = await generateKeyPair();
    const publicKey = await exportPublicKey(keyPair.publicKey);
    const privateKey = await exportPrivateKey(keyPair.privateKey);
    
    const identity: StoredIdentity = {
        publicKey,
        privateKey,
        displayName: displayName || generateDefaultDisplayName(publicKey),
        createdAt: new Date().toISOString()
    };
    
    saveIdentity(identity);
    
    // Return public-facing identity (without private key)
    return {
        publicKey: identity.publicKey,
        displayName: identity.displayName,
        createdAt: identity.createdAt
    };
}

// Get or create the current identity
export async function getOrCreateIdentity(): Promise<Identity> {
    const stored = loadIdentity();
    if (stored) {
        return {
            publicKey: stored.publicKey,
            displayName: stored.displayName,
            createdAt: stored.createdAt
        };
    }
    return await generateIdentity();
}

// Get public identity (safe to share)
export function getPublicIdentity(): Identity | null {
    const stored = loadIdentity();
    if (stored) {
        return {
            publicKey: stored.publicKey,
            displayName: stored.displayName,
            createdAt: stored.createdAt
        };
    }
    return null;
}

// Update display name
export function updateDisplayName(newName: string): Identity | null {
    const stored = loadIdentity();
    if (!stored) return null;
    
    stored.displayName = newName.trim() || generateDefaultDisplayName(stored.publicKey);
    saveIdentity(stored);
    
    return {
        publicKey: stored.publicKey,
        displayName: stored.displayName,
        createdAt: stored.createdAt
    };
}

// Canonicalize payload for signing
function canonicalize(payload: Record<string, unknown>): string {
    const sortedKeys = Object.keys(payload).sort();
    const sorted: Record<string, unknown> = {};
    for (const key of sortedKeys) {
        sorted[key] = payload[key];
    }
    return JSON.stringify(sorted);
}

// Sign a payload
export async function signPayload(payload: Record<string, unknown>): Promise<string | null> {
    const stored = loadIdentity();
    if (!stored) return null;
    
    try {
        const privateKey = await importPrivateKey(stored.privateKey);
        const data = new TextEncoder().encode(canonicalize(payload));
        const signature = await crypto.subtle.sign(
            { name: "ECDSA", hash: "SHA-256" },
            privateKey,
            data
        );
        return toBase64(signature);
    } catch (err) {
        console.error("[identity] Failed to sign payload:", err);
        return null;
    }
}

// Verify a payload signature
export async function verifyPayload(
    payload: Record<string, unknown>,
    signature: string,
    publicKeyBase64: string
): Promise<boolean> {
    try {
        const publicKey = await importPublicKey(publicKeyBase64);
        const data = new TextEncoder().encode(canonicalize(payload));
        const sig = fromBase64(signature);
        return await crypto.subtle.verify(
            { name: "ECDSA", hash: "SHA-256" },
            publicKey,
            sig,
            data
        );
    } catch (err) {
        console.error("[identity] Failed to verify signature:", err);
        return false;
    }
}

// Clear identity (for testing or reset)
export function clearIdentity(): void {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
        console.warn("[identity] Failed to clear identity:", err);
    }
}
