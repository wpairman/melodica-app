"use client"

import { useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

type CalendarEvent = {
  id: string
  title: string
  start: string // ISO date string
  notificationLeadMinutes?: number // minutes before start to notify (default 15)
}

/**
 * CalendarNotifications
 * Listens for upcoming events and shows toasts / browser notifications.
 * ✅ Invisible (renders nothing) – just mount it once (already imported in dashboard).
 */
export default function CalendarNotifications() {
  const { toast } = useToast()

  useEffect(() => {
    // Guard for browsers that don't have localStorage (e.g. SSR fall-back)
    if (typeof window === "undefined") return

    const stored = localStorage.getItem("calendarEvents")
    if (!stored) return

    let events: CalendarEvent[] = []
    try {
      events = JSON.parse(stored)
    } catch {
      // Ignore malformed data
      return
    }

    // Create a timeout for every eligible event
    const timers: ReturnType<typeof setTimeout>[] = []

    events.forEach((event) => {
      const startMs = new Date(event.start).getTime()
      const now = Date.now()

      const lead = (event.notificationLeadMinutes ?? 15) * 60 * 1000 // default 15 min
      const fireAt = startMs - lead
      if (fireAt <= now) return // Too late to notify

      timers.push(
        setTimeout(() => {
          // 1) In-app toast
          toast({
            title: "Upcoming event",
            description: `${event.title} starts in ${event.notificationLeadMinutes ?? 15} minute${
              (event.notificationLeadMinutes ?? 15) === 1 ? "" : "s"
            }.`,
          })

          // 2) Browser notification (if permission granted)
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification("Upcoming event", {
              body: `${event.title} starts soon.`,
            })
          }
        }, fireAt - now),
      )
    })

    // Clean up when component unmounts / deps change
    return () => timers.forEach(clearTimeout)
  }, [toast])

  // Nothing to render
  return null
}
