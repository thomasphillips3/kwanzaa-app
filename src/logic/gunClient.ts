// Gun.js client wrapper for community board sync
// Provides connect, subscribe, and publish functionality

import { getOrCreateIdentity, signPayload, verifyPayload, Identity } from "./identity";

// Gun.js type declarations
declare const Gun: any;

export interface CommunityPost {
    id: string;
    text: string;
    author: Identity;
    signature: string;
    createdAt: string;
    verified?: boolean;
}

export interface ConnectionStatus {
    connected: boolean;
    peersConnected: number;
    lastSync: string | null;
}

// Configuration
const DEFAULT_PEERS = [
    "https://gun-manhattan.herokuapp.com/gun"
];

// Private Gun instance
let gunInstance: any = null;
let connectionStatus: ConnectionStatus = {
    connected: false,
    peersConnected: 0,
    lastSync: null
};

// Subscription callbacks
type PostCallback = (post: CommunityPost) => void;
const postCallbacks: Set<PostCallback> = new Set();
type StatusCallback = (status: ConnectionStatus) => void;
const statusCallbacks: Set<StatusCallback> = new Set();

// Check if Gun.js is available
function isGunAvailable(): boolean {
    return typeof Gun !== "undefined";
}

// Update and broadcast connection status
function updateStatus(updates: Partial<ConnectionStatus>): void {
    connectionStatus = { ...connectionStatus, ...updates };
    for (const callback of statusCallbacks) {
        try {
            callback(connectionStatus);
        } catch (err) {
            console.error("[gunClient] Status callback error:", err);
        }
    }
}

// Initialize Gun with peers
export function connect(peers?: string[]): boolean {
    if (!isGunAvailable()) {
        console.warn("[gunClient] Gun.js is not loaded");
        updateStatus({ connected: false, peersConnected: 0 });
        return false;
    }
    
    const activePeers = peers && peers.length > 0 ? peers : DEFAULT_PEERS;
    
    try {
        gunInstance = Gun({
            peers: activePeers,
            localStorage: false,
            radisk: false
        });
        
        updateStatus({
            connected: true,
            peersConnected: activePeers.length,
            lastSync: new Date().toISOString()
        });
        
        console.log("[gunClient] Connected to peers:", activePeers);
        return true;
    } catch (err) {
        console.error("[gunClient] Failed to connect:", err);
        updateStatus({ connected: false, peersConnected: 0 });
        return false;
    }
}

// Disconnect from Gun
export function disconnect(): void {
    if (gunInstance) {
        // Gun doesn't have a formal disconnect, but we can null the instance
        gunInstance = null;
        updateStatus({ connected: false, peersConnected: 0 });
    }
}

// Get current Gun instance (auto-connect if needed)
function getGun(): any {
    if (!gunInstance) {
        connect();
    }
    return gunInstance;
}

// Get the community board node
function getCommunityNode(): any {
    const gun = getGun();
    if (!gun) return null;
    return gun.get("kwanzaa").get("community");
}

// Subscribe to community posts
export function subscribeToPosts(callback: PostCallback): () => void {
    postCallbacks.add(callback);
    
    const community = getCommunityNode();
    if (community) {
        community.map().on(async (data: any, key: string) => {
            if (!data || !data.text) return;
            
            try {
                const post: CommunityPost = {
                    id: data.id || key,
                    text: data.text,
                    author: {
                        publicKey: data.authorPublicKey || "",
                        displayName: data.authorName || "Anonymous",
                        createdAt: data.authorCreatedAt || ""
                    },
                    signature: data.signature || "",
                    createdAt: data.createdAt || new Date().toISOString()
                };
                
                // Verify signature if present
                if (post.signature && post.author.publicKey) {
                    const payload = {
                        id: post.id,
                        text: post.text,
                        authorPublicKey: post.author.publicKey,
                        createdAt: post.createdAt
                    };
                    post.verified = await verifyPayload(
                        payload,
                        post.signature,
                        post.author.publicKey
                    );
                } else {
                    post.verified = false;
                }
                
                // Notify all subscribers
                for (const cb of postCallbacks) {
                    try {
                        cb(post);
                    } catch (err) {
                        console.error("[gunClient] Post callback error:", err);
                    }
                }
            } catch (err) {
                console.error("[gunClient] Failed to process post:", err);
            }
        });
    }
    
    // Return unsubscribe function
    return () => {
        postCallbacks.delete(callback);
    };
}

// Publish a new post
export async function publishPost(text: string): Promise<CommunityPost | null> {
    const community = getCommunityNode();
    if (!community) {
        console.error("[gunClient] Not connected");
        return null;
    }
    
    if (!text.trim()) {
        console.warn("[gunClient] Empty post text");
        return null;
    }
    
    try {
        const identity = await getOrCreateIdentity();
        const id = `${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
        const createdAt = new Date().toISOString();
        
        // Create payload for signing
        const payload = {
            id,
            text: text.trim(),
            authorPublicKey: identity.publicKey,
            createdAt
        };
        
        // Sign the payload
        const signature = await signPayload(payload);
        if (!signature) {
            console.error("[gunClient] Failed to sign post");
            return null;
        }
        
        // Create Gun record
        const record = {
            id,
            text: text.trim(),
            authorPublicKey: identity.publicKey,
            authorName: identity.displayName,
            authorCreatedAt: identity.createdAt,
            signature,
            createdAt
        };
        
        // Publish to Gun
        community.set(record);
        
        updateStatus({ lastSync: new Date().toISOString() });
        
        const post: CommunityPost = {
            id,
            text: text.trim(),
            author: identity,
            signature,
            createdAt,
            verified: true
        };
        
        console.log("[gunClient] Published post:", id);
        return post;
    } catch (err) {
        console.error("[gunClient] Failed to publish post:", err);
        return null;
    }
}

// Subscribe to connection status changes
export function subscribeToStatus(callback: StatusCallback): () => void {
    statusCallbacks.add(callback);
    // Immediately notify with current status
    callback(connectionStatus);
    
    return () => {
        statusCallbacks.delete(callback);
    };
}

// Get current connection status
export function getConnectionStatus(): ConnectionStatus {
    return { ...connectionStatus };
}

// Get configured peers
export function getPeers(): string[] {
    return [...DEFAULT_PEERS];
}

// Set custom peers (reconnects)
export function setPeers(peers: string[]): boolean {
    disconnect();
    return connect(peers);
}
