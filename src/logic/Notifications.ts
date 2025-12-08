// Notifications module for Kwanzaa reminders
// Schedules local notifications for Dec 26 – Jan 1 at 7pm local time

import { principles } from "../data/principles";

// Check if native notification bridge is available
declare const NativeNotifications: {
    scheduleNotification: (id: string, title: string, body: string, timestamp: number) => Promise<void>;
    cancelNotification: (id: string) => Promise<void>;
    cancelAllNotifications: () => Promise<void>;
    requestPermission: () => Promise<boolean>;
} | undefined;

function isNativeNotificationsAvailable(): boolean {
    return typeof NativeNotifications !== "undefined";
}

/**
 * Get the notification time (7pm) for a given date
 */
function getNotificationTime(date: Date): Date {
    const notificationDate = new Date(date);
    notificationDate.setHours(19, 0, 0, 0); // 7:00 PM
    return notificationDate;
}

/**
 * Get all Kwanzaa dates for a given year
 * Kwanzaa runs from Dec 26 to Jan 1 (7 days)
 */
function getKwanzaaDates(year: number): Date[] {
    const dates: Date[] = [];
    
    // Dec 26-31 of the given year
    for (let day = 26; day <= 31; day++) {
        dates.push(new Date(year, 11, day)); // Month 11 = December
    }
    
    // Jan 1 of the next year
    dates.push(new Date(year + 1, 0, 1)); // Month 0 = January
    
    return dates;
}

/**
 * Schedule notifications for all 7 days of Kwanzaa
 * Each notification fires at 7pm local time
 */
export async function scheduleKwanzaaNotifications(): Promise<void> {
    if (!isNativeNotificationsAvailable()) {
        console.log("Native notifications not available - running in development mode");
        console.log("Would schedule notifications for Kwanzaa (Dec 26 - Jan 1)");
        return;
    }

    // Request permission first
    const hasPermission = await NativeNotifications!.requestPermission();
    if (!hasPermission) {
        console.log("Notification permission denied");
        return;
    }

    const now = new Date();
    const year = now.getMonth() === 0 && now.getDate() === 1 
        ? now.getFullYear() - 1 // If it's Jan 1, use last year's Kwanzaa
        : now.getFullYear();
    
    const kwanzaaDates = getKwanzaaDates(year);

    for (let i = 0; i < kwanzaaDates.length; i++) {
        const date = kwanzaaDates[i];
        const notificationTime = getNotificationTime(date);
        
        // Only schedule future notifications
        if (notificationTime > now) {
            const principle = principles[i];
            const dayNumber = i + 1;
            
            await NativeNotifications!.scheduleNotification(
                `kwanzaa-day-${dayNumber}`,
                `Day ${dayNumber} of Kwanzaa: ${principle.name}`,
                principle.reflectionPrompt,
                notificationTime.getTime()
            );
        }
    }

    console.log("Kwanzaa notifications scheduled");
}

/**
 * Cancel all scheduled Kwanzaa notifications
 */
export async function cancelKwanzaaNotifications(): Promise<void> {
    if (!isNativeNotificationsAvailable()) {
        console.log("Native notifications not available - running in development mode");
        console.log("Would cancel all Kwanzaa notifications");
        return;
    }

    await NativeNotifications!.cancelAllNotifications();
    console.log("Kwanzaa notifications cancelled");
}

/**
 * Check if notifications are available and have permission
 */
export async function checkNotificationStatus(): Promise<{
    available: boolean;
    hasPermission: boolean;
}> {
    if (!isNativeNotificationsAvailable()) {
        return { available: false, hasPermission: false };
    }

    const hasPermission = await NativeNotifications!.requestPermission();
    return { available: true, hasPermission };
}
