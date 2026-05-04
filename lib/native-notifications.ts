/**
 * Native local notifications via @capacitor/local-notifications.
 *
 * On web these calls are no-ops so the app behaves normally in a browser.
 */

function isNativePlatform(): boolean {
  if (typeof window === "undefined") return false
  try {
    // @ts-ignore
    return !!(window.Capacitor && window.Capacitor.isNativePlatform())
  } catch {
    return false
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!isNativePlatform()) return false
  try {
    const { LocalNotifications } = await import("@capacitor/local-notifications")
    const result = await LocalNotifications.requestPermissions()
    return result.display === "granted"
  } catch {
    return false
  }
}

export async function checkNotificationPermission(): Promise<boolean> {
  if (!isNativePlatform()) return false
  try {
    const { LocalNotifications } = await import("@capacitor/local-notifications")
    const result = await LocalNotifications.checkPermissions()
    return result.display === "granted"
  } catch {
    return false
  }
}

/**
 * Schedule a daily mood check-in notification at the given hour (0-23).
 * Cancels any previously scheduled mood reminders before re-scheduling.
 */
export async function scheduleDailyMoodReminder(hourOfDay: number): Promise<boolean> {
  if (!isNativePlatform()) return false
  try {
    const { LocalNotifications } = await import("@capacitor/local-notifications")

    // Cancel existing mood reminders (IDs 1000–1010)
    const pendingIds = Array.from({ length: 11 }, (_, i) => ({ id: 1000 + i }))
    await LocalNotifications.cancel({ notifications: pendingIds }).catch(() => {})

    // Schedule a repeating daily notification
    const now = new Date()
    const scheduledDate = new Date()
    scheduledDate.setHours(hourOfDay, 0, 0, 0)
    if (scheduledDate <= now) {
      scheduledDate.setDate(scheduledDate.getDate() + 1)
    }

    await LocalNotifications.schedule({
      notifications: [
        {
          id: 1001,
          title: "Melodica – Daily Check-in",
          body: "Take a moment to log your mood and see today's music recommendations.",
          schedule: {
            on: {
              hour: hourOfDay,
              minute: 0,
            },
            repeats: true,
          },
          sound: undefined,
          smallIcon: "ic_stat_icon_config_sample",
          iconColor: "#10b981",
          actionTypeId: "",
          extra: { url: "/dashboard" },
        },
      ],
    })
    return true
  } catch (err) {
    console.error("Failed to schedule native notification:", err)
    return false
  }
}

export async function cancelDailyMoodReminder(): Promise<void> {
  if (!isNativePlatform()) return
  try {
    const { LocalNotifications } = await import("@capacitor/local-notifications")
    const pendingIds = Array.from({ length: 11 }, (_, i) => ({ id: 1000 + i }))
    await LocalNotifications.cancel({ notifications: pendingIds })
  } catch {
    // Silently ignore
  }
}
