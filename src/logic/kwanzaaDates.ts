export function isInKwanzaaRange(date: Date): boolean {
    const year = date.getFullYear();
    const start = new Date(year, 11, 26); // Dec 26
    const end = new Date(year + 1, 0, 1); // Jan 1 next year
    return date >= start && date <= end;
}

export function getKwanzaaDayIndex(date: Date): 1 | 2 | 3 | 4 | 5 | 6 | 7 | null {
    if (!isInKwanzaaRange(date)) return null;
    const start = new Date(date.getFullYear(), 11, 26);
    const diff = Math.floor((date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return (diff + 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7;
}

export function getNextKwanzaaStart(date: Date): Date {
    const year = date.getMonth() === 11 && date.getDate() > 25 ? date.getFullYear() + 1 : date.getFullYear();
    return new Date(year, 11, 26);
}