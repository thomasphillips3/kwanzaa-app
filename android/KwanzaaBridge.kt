package com.kwanzaaapp.bridge

import android.app.AlarmManager
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import java.util.Calendar
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

/**
 * Native bridge for Kwanzaa app - handles storage and notifications on Android
 */
class KwanzaaBridge(private val context: Context) {
    
    companion object {
        private const val PREFS_NAME = "kwanzaa_journal_entries"
        private const val CHANNEL_ID = "kwanzaa_notifications"
        private const val CHANNEL_NAME = "Kwanzaa Reminders"
    }
    
    private val sharedPreferences: SharedPreferences by lazy {
        context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    }
    
    init {
        createNotificationChannel()
    }
    
    // MARK: - Storage
    
    /**
     * Save a value to SharedPreferences
     */
    suspend fun saveToStorage(key: String, value: String) {
        withContext(Dispatchers.IO) {
            sharedPreferences.edit().putString(key, value).apply()
        }
    }
    
    /**
     * Load a value from SharedPreferences
     */
    suspend fun loadFromStorage(key: String): String? {
        return withContext(Dispatchers.IO) {
            sharedPreferences.getString(key, null)
        }
    }
    
    // MARK: - Notifications
    
    /**
     * Create the notification channel (required for Android 8.0+)
     */
    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val importance = NotificationManager.IMPORTANCE_DEFAULT
            val channel = NotificationChannel(CHANNEL_ID, CHANNEL_NAME, importance).apply {
                description = "Daily Kwanzaa principle reminders"
            }
            
            val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannel(channel)
        }
    }
    
    /**
     * Check if notification permission is granted (Android 13+)
     */
    fun hasNotificationPermission(): Boolean {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            NotificationManagerCompat.from(context).areNotificationsEnabled()
        } else {
            true
        }
    }
    
    /**
     * Schedule a local notification at a specific time
     */
    fun scheduleNotification(
        id: String,
        title: String,
        body: String,
        timestamp: Long
    ) {
        val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        
        val intent = Intent(context, KwanzaaNotificationReceiver::class.java).apply {
            putExtra("notification_id", id.hashCode())
            putExtra("title", title)
            putExtra("body", body)
        }
        
        val pendingIntent = PendingIntent.getBroadcast(
            context,
            id.hashCode(),
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        
        // Schedule the alarm
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            alarmManager.setExactAndAllowWhileIdle(
                AlarmManager.RTC_WAKEUP,
                timestamp,
                pendingIntent
            )
        } else {
            alarmManager.setExact(
                AlarmManager.RTC_WAKEUP,
                timestamp,
                pendingIntent
            )
        }
    }
    
    /**
     * Cancel a specific notification
     */
    fun cancelNotification(id: String) {
        val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        
        val intent = Intent(context, KwanzaaNotificationReceiver::class.java)
        val pendingIntent = PendingIntent.getBroadcast(
            context,
            id.hashCode(),
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        
        alarmManager.cancel(pendingIntent)
    }
    
    /**
     * Cancel all Kwanzaa notifications
     */
    fun cancelAllNotifications() {
        for (day in 1..7) {
            cancelNotification("kwanzaa-day-$day")
        }
    }
    
    /**
     * Schedule all Kwanzaa notifications for Dec 26 - Jan 1 at 7pm
     */
    fun scheduleKwanzaaNotifications(principles: List<Principle>) {
        if (!hasNotificationPermission()) {
            return
        }
        
        // Cancel existing notifications first
        cancelAllNotifications()
        
        val calendar = Calendar.getInstance()
        val currentYear = calendar.get(Calendar.YEAR)
        val now = System.currentTimeMillis()
        
        principles.forEachIndexed { index, principle ->
            val dayNumber = index + 1
            
            // Set up the notification time (7 PM)
            calendar.set(Calendar.HOUR_OF_DAY, 19)
            calendar.set(Calendar.MINUTE, 0)
            calendar.set(Calendar.SECOND, 0)
            calendar.set(Calendar.MILLISECOND, 0)
            
            // Calculate the date for this Kwanzaa day
            if (index < 6) {
                // Dec 26-31
                calendar.set(Calendar.YEAR, currentYear)
                calendar.set(Calendar.MONTH, Calendar.DECEMBER)
                calendar.set(Calendar.DAY_OF_MONTH, 26 + index)
            } else {
                // Jan 1
                calendar.set(Calendar.YEAR, currentYear + 1)
                calendar.set(Calendar.MONTH, Calendar.JANUARY)
                calendar.set(Calendar.DAY_OF_MONTH, 1)
            }
            
            val notificationTime = calendar.timeInMillis
            
            // Only schedule future notifications
            if (notificationTime > now) {
                scheduleNotification(
                    id = "kwanzaa-day-$dayNumber",
                    title = "Day $dayNumber of Kwanzaa: ${principle.name}",
                    body = principle.reflectionPrompt,
                    timestamp = notificationTime
                )
            }
        }
    }
}

/**
 * Data class for principle information
 */
data class Principle(
    val id: Int,
    val name: String,
    val description: String,
    val reflectionPrompt: String
)

/**
 * BroadcastReceiver to show notifications when alarms fire
 */
class KwanzaaNotificationReceiver : BroadcastReceiver() {
    
    override fun onReceive(context: Context, intent: Intent) {
        val notificationId = intent.getIntExtra("notification_id", 0)
        val title = intent.getStringExtra("title") ?: "Kwanzaa Reminder"
        val body = intent.getStringExtra("body") ?: ""
        
        val notification = NotificationCompat.Builder(context, "kwanzaa_notifications")
            .setSmallIcon(android.R.drawable.ic_dialog_info) // Replace with your app icon
            .setContentTitle(title)
            .setContentText(body)
            .setStyle(NotificationCompat.BigTextStyle().bigText(body))
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .setAutoCancel(true)
            .build()
        
        val notificationManager = NotificationManagerCompat.from(context)
        
        try {
            notificationManager.notify(notificationId, notification)
        } catch (e: SecurityException) {
            // Handle missing notification permission
            e.printStackTrace()
        }
    }
}

