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

    // Load notification settings
    const settings = localStorage.getItem("appSettings")
    if (!settings) return

    const parsedSettings = JSON.parse(settings)
    if (!parsedSettings.notifications?.enabled) return

    // Set up notification scheduling
    const scheduleNotifications = () => {
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
          if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.ready.then((registration) => {
              // Type assertion: Service Worker ShowNotificationOptions supports actions
              registration.showNotification("Melodica - Mood Check-in", {
                body: "How are you feeling right now? Pull down to log your mood quickly!",
                icon: "/icons/icon-192x192.png",
                badge: "/icons/icon-192x192.png",
                tag: "mood-checkin",
                requireInteraction: false,
                actions: [
                  { action: "mood-1", title: "1 😢" },
                  { action: "mood-2", title: "2" },
                  { action: "mood-3", title: "3" },
                  { action: "mood-4", title: "4" },
                  { action: "mood-5", title: "5 😐" },
                ],
                data: {
                  url: "/dashboard"
                }
              } as any)
            })
          } else {
            // Fallback to regular notifications if service worker not available
            const notification = new Notification("Melodica - Mood Check-in", {
              body: "How are you feeling right now? Take a moment to track your mood.",
              icon: "/icons/icon-192x192.png",
              badge: "/icons/icon-192x192.png",
              tag: "mood-checkin",
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

      // Set up recurring notifications
      const interval = setInterval(showNotification, intervalMs)

      // Clean up on unmount
      return () => clearInterval(interval)
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
  }, [])

  return null // This component doesn't render anything
}
