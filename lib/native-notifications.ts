/**
 * native-notifications.ts
 *
 * Schedules mood check-in reminders via @capacitor/local-notifications on iOS.
 * Falls back silently on web (the web path uses the service-worker approach in
 * the settings page instead).
 */

export async function scheduleNativeMoodReminder(frequencyHours: number = 2): Promise<void> {
  try {
    const { LocalNotifications } = await import("@capacitor/local-notifications")

    // Request permission first
    const permission = await LocalNotifications.requestPermissions()
    if (permission.display !== "granted") return

    // Cancel any existing mood reminders before scheduling new ones
    await cancelNativeMoodReminders()

    const now = new Date()
    const scheduleAt = new Date(now.getTime() + frequencyHours * 60 * 60 * 1000)

    await LocalNotifications.schedule({
      notifications: [
        {
          id: 1001,
          title: "Melodica – Mood Check-in",
          body: "How are you feeling right now? Take a moment to log your mood.",
          schedule: {
            at: scheduleAt,
            repeats: true,
            every: "hour",
            count: frequencyHours,
          },
          actionTypeId: "MOOD_CHECKIN",
          extra: { url: "/dashboard" },
          smallIcon: "ic_stat_icon_config_sample",
          iconColor: "#10b981",
        },
      ],
    })
  } catch {
    // Local notifications not available on web – ignore
  }
}

export async function cancelNativeMoodReminders(): Promise<void> {
  try {
    const { LocalNotifications } = await import("@capacitor/local-notifications")
    const pending = await LocalNotifications.getPending()
    const moodReminders = pending.notifications.filter((n) => n.id === 1001)
    if (moodReminders.length > 0) {
      await LocalNotifications.cancel({ notifications: moodReminders })
    }
  } catch {
    // Ignore on web
  }
}

export async function requestNativeNotificationPermission(): Promise<boolean> {
  try {
    const { LocalNotifications } = await import("@capacitor/local-notifications")
    const result = await LocalNotifications.requestPermissions()
    return result.display === "granted"
  } catch {
    return false
  }
}
