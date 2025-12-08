import Foundation
import UserNotifications

/// Native bridge for Kwanzaa app - handles storage and notifications on iOS
@objc class KwanzaaBridge: NSObject {
    
    // MARK: - Storage
    
    private let storageKey = "kwanzaa_journal_entries"
    
    /// Save a value to UserDefaults
    @objc func saveToStorage(key: String, value: String, completion: @escaping (Error?) -> Void) {
        DispatchQueue.main.async {
            var entries = UserDefaults.standard.dictionary(forKey: self.storageKey) as? [String: String] ?? [:]
            entries[key] = value
            UserDefaults.standard.set(entries, forKey: self.storageKey)
            UserDefaults.standard.synchronize()
            completion(nil)
        }
    }
    
    /// Load a value from UserDefaults
    @objc func loadFromStorage(key: String, completion: @escaping (String?, Error?) -> Void) {
        DispatchQueue.main.async {
            let entries = UserDefaults.standard.dictionary(forKey: self.storageKey) as? [String: String] ?? [:]
            completion(entries[key], nil)
        }
    }
    
    // MARK: - Notifications
    
    /// Request notification permissions
    @objc func requestNotificationPermission(completion: @escaping (Bool, Error?) -> Void) {
        let center = UNUserNotificationCenter.current()
        center.requestAuthorization(options: [.alert, .sound, .badge]) { granted, error in
            DispatchQueue.main.async {
                completion(granted, error)
            }
        }
    }
    
    /// Schedule a local notification
    @objc func scheduleNotification(
        id: String,
        title: String,
        body: String,
        timestamp: Double,
        completion: @escaping (Error?) -> Void
    ) {
        let content = UNMutableNotificationContent()
        content.title = title
        content.body = body
        content.sound = .default
        
        let date = Date(timeIntervalSince1970: timestamp / 1000) // Convert from milliseconds
        let components = Calendar.current.dateComponents([.year, .month, .day, .hour, .minute], from: date)
        let trigger = UNCalendarNotificationTrigger(dateMatching: components, repeats: false)
        
        let request = UNNotificationRequest(identifier: id, content: content, trigger: trigger)
        
        UNUserNotificationCenter.current().add(request) { error in
            DispatchQueue.main.async {
                completion(error)
            }
        }
    }
    
    /// Cancel a specific notification
    @objc func cancelNotification(id: String) {
        UNUserNotificationCenter.current().removePendingNotificationRequests(withIdentifiers: [id])
    }
    
    /// Cancel all notifications
    @objc func cancelAllNotifications() {
        UNUserNotificationCenter.current().removeAllPendingNotificationRequests()
    }
    
    // MARK: - Kwanzaa-specific helpers
    
    /// Schedule all Kwanzaa notifications for Dec 26 - Jan 1 at 7pm
    @objc func scheduleKwanzaaNotifications(
        principles: [[String: Any]],
        completion: @escaping (Error?) -> Void
    ) {
        requestNotificationPermission { [weak self] granted, error in
            guard let self = self else { return }
            
            if let error = error {
                completion(error)
                return
            }
            
            guard granted else {
                let permissionError = NSError(
                    domain: "KwanzaaBridge",
                    code: 1,
                    userInfo: [NSLocalizedDescriptionKey: "Notification permission denied"]
                )
                completion(permissionError)
                return
            }
            
            // Cancel existing notifications first
            self.cancelAllNotifications()
            
            // Get the current year
            let calendar = Calendar.current
            let now = Date()
            let year = calendar.component(.year, from: now)
            
            // Kwanzaa dates: Dec 26 - Dec 31 + Jan 1
            var components = DateComponents()
            components.hour = 19 // 7 PM
            components.minute = 0
            
            let group = DispatchGroup()
            var lastError: Error?
            
            for (index, principle) in principles.enumerated() {
                guard let name = principle["name"] as? String,
                      let prompt = principle["reflectionPrompt"] as? String else {
                    continue
                }
                
                let dayNumber = index + 1
                
                // Calculate the date for this Kwanzaa day
                if index < 6 {
                    // Dec 26-31
                    components.year = year
                    components.month = 12
                    components.day = 26 + index
                } else {
                    // Jan 1
                    components.year = year + 1
                    components.month = 1
                    components.day = 1
                }
                
                guard let notificationDate = calendar.date(from: components),
                      notificationDate > now else {
                    continue
                }
                
                group.enter()
                self.scheduleNotification(
                    id: "kwanzaa-day-\(dayNumber)",
                    title: "Day \(dayNumber) of Kwanzaa: \(name)",
                    body: prompt,
                    timestamp: notificationDate.timeIntervalSince1970 * 1000
                ) { error in
                    if let error = error {
                        lastError = error
                    }
                    group.leave()
                }
            }
            
            group.notify(queue: .main) {
                completion(lastError)
            }
        }
    }
}

