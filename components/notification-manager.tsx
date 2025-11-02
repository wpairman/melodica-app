"use client"

import { useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

// Global variables to prevent multiple notification intervals
let globalNotificationInterval: NodeJS.Timeout | null = null
let isNotificationSchedulerActive = false
let lastNotificationTime = 0
const MIN_NOTIFICATION_INTERVAL = 5000 // Minimum 5 seconds between notifications

// Shared function to close all existing mood check-in notifications
export async function closeAllMoodNotifications() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return
  
  try {
    const registration = await navigator.serviceWorker.ready
    const existingNotifications = await registration.getNotifications({ tag: 'mood-checkin' })
    existingNotifications.forEach(notification => notification.close())
  } catch (error) {
    console.error('Error closing notifications:', error)
  }
}

export default function NotificationManager() {
  const { toast } = useToast()

  useEffect(() => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') return

    // Register service worker for PWA notifications
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration)
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error)
        })
    }
    
    // Check if notifications are supported
    if (!("Notification" in window)) {
      return
    }

    // Set up notification scheduling
    const scheduleNotifications = async () => {
      // CRITICAL: Clear any existing interval FIRST to prevent flooding
      if (globalNotificationInterval) {
        clearInterval(globalNotificationInterval)
        globalNotificationInterval = null
      }
      
      // Close any existing notifications before creating new ones
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.ready
          // Get all notifications and close the one with our tag
          const notifications = await registration.getNotifications({ tag: 'mood-checkin' })
          notifications.forEach(notification => notification.close())
        } catch (error) {
          console.error('Error closing existing notifications:', error)
        }
      }

      // Check if scheduler is already active - if so, don't create another one
      // But first, let's reset it if settings changed
      const currentSettings = localStorage.getItem("appSettings")
      if (currentSettings) {
        try {
          const current = JSON.parse(currentSettings)
          // Only skip if notifications are still enabled and scheduler is active
          if (isNotificationSchedulerActive && current.notifications?.enabled) {
            console.log('Notification scheduler already active, skipping...')
            return
          }
        } catch (e) {
          // If we can't parse settings, continue
        }
      }

      // Load notification settings
      const settings = localStorage.getItem("appSettings")
      if (!settings) return

      const parsedSettings = JSON.parse(settings)
      if (!parsedSettings.notifications?.enabled) {
        isNotificationSchedulerActive = false
        return
      }

      const frequency = parsedSettings.notifications.frequency || 2 // Default 2 hours
      const intervalMs = frequency * 60 * 60 * 1000

      const showNotification = async () => {
        // Prevent notifications from firing too close together
        const now = Date.now()
        if (now - lastNotificationTime < MIN_NOTIFICATION_INTERVAL) {
          console.log('Notification throttled - too soon since last notification')
          return
        }
        lastNotificationTime = now
        
        // Check quiet hours
        if (parsedSettings.notifications.quietHours?.enabled) {
          const currentDate = new Date()
          const currentHour = currentDate.getHours()
          const startHour = Number.parseInt(parsedSettings.notifications.quietHours.start.split(":")[0])
          const endHour = Number.parseInt(parsedSettings.notifications.quietHours.end.split(":")[0])

          const isQuietTime =
            startHour > endHour
              ? currentHour >= startHour || currentHour < endHour
              : currentHour >= startHour && currentHour < endHour

          if (isQuietTime) {
            return // Skip notification during quiet hours
          }
        }

        // Show notification (prefer service worker for actions on mobile)
        if (Notification.permission === "granted") {
          // Check if service worker is available (better for mobile with actions)
          if ('serviceWorker' in navigator) {
            try {
              const registration = await navigator.serviceWorker.ready
              
              // CRITICAL: Close any existing notifications with the same tag FIRST
              const existingNotifications = await registration.getNotifications({ tag: 'mood-checkin' })
              if (existingNotifications.length > 0) {
                console.log(`Closing ${existingNotifications.length} existing notifications before showing new one`)
                existingNotifications.forEach(notification => notification.close())
                // Wait a bit longer to ensure closes complete
                await new Promise(resolve => setTimeout(resolve, 200))
              }
              
              // Now show the new notification (same tag will prevent duplicates)
              // Type assertion: Service Worker ShowNotificationOptions supports actions
              await registration.showNotification("Melodica - Mood Check-in", {
                body: "How are you feeling right now? Pull down to log your mood quickly!",
                icon: "/icons/icon-192x192.png",
                badge: "/icons/icon-192x192.png",
                tag: "mood-checkin", // Same tag = replaces previous notification
                requireInteraction: true, // Set to true so iOS shows actions on pull-down
                actions: [
                  { action: "mood-1", title: "⭐ 1 Star" },
                  { action: "mood-2", title: "⭐⭐ 2 Stars" },
                  { action: "mood-3", title: "⭐⭐⭐ 3 Stars" },
                  { action: "mood-4", title: "⭐⭐⭐⭐ 4 Stars" },
                  { action: "mood-5", title: "⭐⭐⭐⭐⭐ 5 Stars" },
                ],
                data: {
                  url: "/dashboard"
                },
                silent: false, // Ensure notification makes sound/alert
              } as any)
            } catch (error) {
              console.error('Error showing notification:', error)
            }
          } else {
            // Fallback to regular notifications if service worker not available
            const notification = new Notification("Melodica - Mood Check-in", {
              body: "How are you feeling right now? Pull down to log your mood quickly!",
              icon: "/icons/icon-192x192.png",
              badge: "/icons/icon-192x192.png",
              tag: "mood-checkin", // Same tag = replaces previous notification
              requireInteraction: true,
            })

            notification.onclick = () => {
              window.focus()
              window.location.href = "/dashboard"
              notification.close()
            }

            // Auto-close after 10 seconds
            setTimeout(() => {
              notification.close()
            }, 10000)
          }
        }
      }

      // Mark scheduler as active
      isNotificationSchedulerActive = true
      
      // Set up recurring notifications - store interval globally
      globalNotificationInterval = setInterval(showNotification, intervalMs)
    }

    // Request permission if needed
    if (Notification.permission === "default") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          scheduleNotifications()
        }
      })
    } else if (Notification.permission === "granted") {
      scheduleNotifications()
    }

    // Clean up on unmount
    return () => {
      // Don't clear the global interval on unmount - let it persist
      // Only clear if component is being completely destroyed
      // The global flag prevents multiple schedulers
    }
  }, [])

  return null // This component doesn't render anything
}
