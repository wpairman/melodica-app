"use client"

import { useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

export default function MoodTrendNotifications() {
  const { toast } = useToast()

  useEffect(() => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') return
    
    // Check user subscription level
    const userData = localStorage.getItem("userData")
    if (!userData) return

    const user = JSON.parse(userData)
    const subscription = user.subscription

    // Only show trend notifications for Premium and Ultimate users
    if (!subscription || subscription.plan === "Free") return

    // Load mood history
    const moodHistory = localStorage.getItem("moodHistory")
    if (!moodHistory) return

    const history = JSON.parse(moodHistory)
    if (history.length < 3) return // Need at least 3 entries

    // Analyze recent mood trends
    const analyzeTrends = () => {
      const recentEntries = history.slice(-7) // Last 7 entries
      const avgMood = recentEntries.reduce((sum: number, entry: any) => sum + entry.mood, 0) / recentEntries.length

      // Check for concerning patterns
      const lowMoodDays = recentEntries.filter((entry: any) => entry.mood <= 4).length
      const consecutiveLowDays = getConsecutiveLowDays(recentEntries)

      // Trigger notifications based on patterns
      if (lowMoodDays >= 3) {
        showTrendNotification(
          "Mood Support",
          "You've had a few challenging days. Try an energizing playlist or uplifting activity.",
          "support",
        )
      } else if (consecutiveLowDays >= 2) {
        showTrendNotification(
          "Gentle Reminder",
          "Your mood has been lower lately. Consider some self-care activities or reaching out to someone.",
          "care",
        )
      } else if (avgMood >= 7) {
        showTrendNotification(
          "Great Job!",
          "Your mood has been consistently positive! Keep up the great work.",
          "positive",
        )
      }

      // Check for mood volatility
      const moodVariance = calculateVariance(recentEntries.map((entry: any) => entry.mood))
      if (moodVariance > 6) {
        showTrendNotification(
          "Mood Stability",
          "Your mood has been fluctuating. Try some grounding exercises or consistent routines.",
          "stability",
        )
      }
    }

    const getConsecutiveLowDays = (entries: any[]) => {
      let consecutive = 0
      let maxConsecutive = 0

      for (const entry of entries.reverse()) {
        if (entry.mood <= 4) {
          consecutive++
          maxConsecutive = Math.max(maxConsecutive, consecutive)
        } else {
          consecutive = 0
        }
      }

      return maxConsecutive
    }

    const calculateVariance = (moods: number[]) => {
      const mean = moods.reduce((sum, mood) => sum + mood, 0) / moods.length
      const squaredDiffs = moods.map((mood) => Math.pow(mood - mean, 2))
      return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / moods.length
    }

    const showTrendNotification = (title: string, message: string, type: string) => {
      // Check if we've already shown this type of notification recently
      const lastNotification = localStorage.getItem(`lastTrendNotification_${type}`)
      const now = Date.now()

      if (lastNotification && now - Number.parseInt(lastNotification) < 24 * 60 * 60 * 1000) {
        return // Don't spam notifications
      }

      localStorage.setItem(`lastTrendNotification_${type}`, now.toString())

      // Show browser notification if permission granted
      if ("Notification" in window && Notification.permission === "granted") {
        const notification = new Notification(title, {
          body: message,
          icon: "/icons/icon-192x192.png",
          badge: "/icons/icon-192x192.png",
          tag: `mood-trend-${type}`,
        })

        notification.onclick = () => {
          window.focus()
          window.location.href = "/dashboard"
          notification.close()
        }
      }

      // Also show in-app toast
      toast({
        title,
        description: message,
        duration: 8000,
      })
    }

    // Run analysis
    analyzeTrends()

    // Set up periodic checking (every 6 hours)
    const interval = setInterval(analyzeTrends, 6 * 60 * 60 * 1000)

    return () => clearInterval(interval)
  }, []) // Remove toast dependency to prevent infinite loops

  return null // This component doesn't render anything
}
