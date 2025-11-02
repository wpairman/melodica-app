"use client"

import { useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

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

    let notificationInterval: NodeJS.Timeout | null = null

    // Set up notification scheduling
    const scheduleNotifications = () => {
      // Clear any existing interval first to prevent flooding
      if (notificationInterval) {
        clearInterval(notificationInterval)
        notificationInterval = null
      }

      // Load notification settings
      const settings = localStorage.getItem("appSettings")
      if (!settings) return

      const parsedSettings = JSON.parse(settings)
      if (!parsedSettings.notifications?.enabled) return

      const frequency = parsedSettings.notifications.frequency || 2 // Default 2 hours
      const intervalMs = frequency * 60 * 60 * 1000

      const showNotification = () => {
        // Check quiet hours
        if (parsedSettings.notifications.quietHours?.enabled) {
          const now = new Date()
          const currentHour = now.getHours()
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
            navigator.serviceWorker.ready.then((registration) => {
              // Use tag to replace previous notifications - prevents flooding
              // Type assertion: Service Worker ShowNotificationOptions supports actions
              registration.showNotification("Melodica - Mood Check-in", {
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
            })
          } else {
            // Fallback to regular notifications if service worker not available
            // Close any existing notifications with the same tag first
            // Note: This is a limitation - we can't close notifications directly
            // But using the same tag should replace them on most browsers
            
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

      // Set up recurring notifications - store interval for cleanup
      notificationInterval = setInterval(showNotification, intervalMs)
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
      if (notificationInterval) {
        clearInterval(notificationInterval)
        notificationInterval = null
      }
    }
  }, [])

  return null // This component doesn't render anything
}
