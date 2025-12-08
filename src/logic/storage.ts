// Storage module for journal entries
// Uses in-memory storage for development, with interface ready for native bridge

// In-memory storage for development/fallback
const journalStorage: Record<string, string> = {};

// Check if native bridge is available
declare const NativeBridge: {
    saveToStorage: (key: string, value: string) => Promise<void>;
    loadFromStorage: (key: string) => Promise<string | null>;
} | undefined;

function isNativeBridgeAvailable(): boolean {
    return typeof NativeBridge !== "undefined";
}

/**
 * Generate a storage key for a journal entry
 * Format: journal_{principleId}_{YYYY-MM-DD}
 */
export function getJournalKey(principleId: number, date: Date = new Date()): string {
    const dateStr = date.toISOString().split("T")[0];
    return `journal_${principleId}_${dateStr}`;
}

/**
 * Save a journal entry to storage
 */
export async function saveJournalEntry(key: string, text: string): Promise<void> {
    if (isNativeBridgeAvailable()) {
        await NativeBridge!.saveToStorage(key, text);
    } else {
        // Fallback to in-memory storage
    journalStorage[key] = text;
    }
}

/**
 * Load a journal entry from storage
 */
export async function loadJournalEntry(key: string): Promise<string | null> {
    if (isNativeBridgeAvailable()) {
        return await NativeBridge!.loadFromStorage(key);
    } else {
        // Fallback to in-memory storage
    return journalStorage[key] ?? null;
}
}

/**
 * Get all journal entries for a specific principle
 */
export async function loadAllEntriesForPrinciple(principleId: number): Promise<Record<string, string>> {
    const entries: Record<string, string> = {};
    const prefix = `journal_${principleId}_`;
    
    // In development, iterate through in-memory storage
    for (const key of Object.keys(journalStorage)) {
        if (key.startsWith(prefix)) {
            entries[key] = journalStorage[key];
        }
    }
    
    return entries;
}
