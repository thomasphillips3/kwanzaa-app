// Moderation module for community board
// Handles local blocklist, reporting, and optional PoW

import { CommunityPost } from "./gunClient";

const BLOCKLIST_KEY = "kwanzaa_blocklist";
const REPORTS_KEY = "kwanzaa_reports";
const HIDDEN_POSTS_KEY = "kwanzaa_hidden_posts";

export interface Report {
    postId: string;
    authorPublicKey: string;
    reason: ReportReason;
    reportedAt: string;
}

export type ReportReason = 
    | "spam"
    | "harassment"
    | "inappropriate"
    | "misinformation"
    | "other";

export const REPORT_REASONS: { value: ReportReason; label: string }[] = [
    { value: "spam", label: "Spam or advertising" },
    { value: "harassment", label: "Harassment or bullying" },
    { value: "inappropriate", label: "Inappropriate content" },
    { value: "misinformation", label: "Misinformation" },
    { value: "other", label: "Other" }
];

// Get blocked authors (public keys)
function getBlocklist(): Set<string> {
    try {
        const stored = localStorage.getItem(BLOCKLIST_KEY);
        if (stored) {
            return new Set(JSON.parse(stored));
        }
    } catch (err) {
        console.warn("[moderation] Failed to load blocklist:", err);
    }
    return new Set();
}

// Save blocklist
function saveBlocklist(blocklist: Set<string>): void {
    try {
        localStorage.setItem(BLOCKLIST_KEY, JSON.stringify([...blocklist]));
    } catch (err) {
        console.warn("[moderation] Failed to save blocklist:", err);
    }
}

// Get hidden post IDs
function getHiddenPosts(): Set<string> {
    try {
        const stored = localStorage.getItem(HIDDEN_POSTS_KEY);
        if (stored) {
            return new Set(JSON.parse(stored));
        }
    } catch (err) {
        console.warn("[moderation] Failed to load hidden posts:", err);
    }
    return new Set();
}

// Save hidden posts
function saveHiddenPosts(hidden: Set<string>): void {
    try {
        localStorage.setItem(HIDDEN_POSTS_KEY, JSON.stringify([...hidden]));
    } catch (err) {
        console.warn("[moderation] Failed to save hidden posts:", err);
    }
}

// Get submitted reports
function getReports(): Report[] {
    try {
        const stored = localStorage.getItem(REPORTS_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (err) {
        console.warn("[moderation] Failed to load reports:", err);
    }
    return [];
}

// Save reports
function saveReports(reports: Report[]): void {
    try {
        localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
    } catch (err) {
        console.warn("[moderation] Failed to save reports:", err);
    }
}

// Block an author
export function blockAuthor(publicKey: string): void {
    const blocklist = getBlocklist();
    blocklist.add(publicKey);
    saveBlocklist(blocklist);
}

// Unblock an author
export function unblockAuthor(publicKey: string): void {
    const blocklist = getBlocklist();
    blocklist.delete(publicKey);
    saveBlocklist(blocklist);
}

// Check if author is blocked
export function isAuthorBlocked(publicKey: string): boolean {
    return getBlocklist().has(publicKey);
}

// Get all blocked authors
export function getBlockedAuthors(): string[] {
    return [...getBlocklist()];
}

// Hide a specific post
export function hidePost(postId: string): void {
    const hidden = getHiddenPosts();
    hidden.add(postId);
    saveHiddenPosts(hidden);
}

// Unhide a post
export function unhidePost(postId: string): void {
    const hidden = getHiddenPosts();
    hidden.delete(postId);
    saveHiddenPosts(hidden);
}

// Check if post is hidden
export function isPostHidden(postId: string): boolean {
    return getHiddenPosts().has(postId);
}

// Report a post
export function reportPost(post: CommunityPost, reason: ReportReason): Report {
    const report: Report = {
        postId: post.id,
        authorPublicKey: post.author.publicKey,
        reason,
        reportedAt: new Date().toISOString()
    };
    
    const reports = getReports();
    reports.push(report);
    saveReports(reports);
    
    // Auto-hide reported posts
    hidePost(post.id);
    
    console.log("[moderation] Reported post:", post.id, reason);
    return report;
}

// Get reports for a post
export function getReportsForPost(postId: string): Report[] {
    return getReports().filter(r => r.postId === postId);
}

// Filter posts based on moderation rules
export function filterPosts(posts: CommunityPost[]): CommunityPost[] {
    const blocklist = getBlocklist();
    const hidden = getHiddenPosts();
    
    return posts.filter(post => {
        // Exclude blocked authors
        if (blocklist.has(post.author.publicKey)) {
            return false;
        }
        // Exclude hidden posts
        if (hidden.has(post.id)) {
            return false;
        }
        return true;
    });
}

// Simple PoW for rate limiting (optional, client-side deterrent)
// Returns nonce that when appended to data creates hash with leading zeros
export async function computeProofOfWork(data: string, difficulty: number = 2): Promise<string> {
    let nonce = 0;
    const prefix = "0".repeat(difficulty);
    
    while (true) {
        const attempt = `${data}:${nonce}`;
        const hashBuffer = await crypto.subtle.digest(
            "SHA-256",
            new TextEncoder().encode(attempt)
        );
        const hashArray = new Uint8Array(hashBuffer);
        const hashHex = Array.from(hashArray)
            .map(b => b.toString(16).padStart(2, "0"))
            .join("");
        
        if (hashHex.startsWith(prefix)) {
            return nonce.toString();
        }
        
        nonce++;
        
        // Safety limit (prevent infinite loop)
        if (nonce > 10000000) {
            throw new Error("PoW computation exceeded limit");
        }
    }
}

// Verify PoW
export async function verifyProofOfWork(
    data: string,
    nonce: string,
    difficulty: number = 2
): Promise<boolean> {
    const attempt = `${data}:${nonce}`;
    const hashBuffer = await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(attempt)
    );
    const hashArray = new Uint8Array(hashBuffer);
    const hashHex = Array.from(hashArray)
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");
    
    const prefix = "0".repeat(difficulty);
    return hashHex.startsWith(prefix);
}

// Clear all moderation data (for testing/reset)
export function clearModerationData(): void {
    try {
        localStorage.removeItem(BLOCKLIST_KEY);
        localStorage.removeItem(REPORTS_KEY);
        localStorage.removeItem(HIDDEN_POSTS_KEY);
    } catch (err) {
        console.warn("[moderation] Failed to clear moderation data:", err);
    }
}
