"use client"

import { useCallback } from "react"

export interface QueuedAction {
  type: "mood" | "journal" | "settings"
  data: any
  timestamp: string
}

export function useOfflineQueue() {
  const queueAction = useCallback((type: QueuedAction["type"], data: any) => {
    if (typeof window === 'undefined') return

    const action: QueuedAction = {
      type,
      data,
      timestamp: new Date().toISOString(),
    }

    // Get existing queue
    const queueKey = `pending${type.charAt(0).toUpperCase() + type.slice(1)}s`
    const existing = localStorage.getItem(queueKey)
    let queue: QueuedAction[] = []

    if (existing) {
      try {
        queue = JSON.parse(existing)
      } catch (error) {
        console.error(`Error parsing ${queueKey}:`, error)
      }
    }

    // Add new action
    queue.push(action)
    localStorage.setItem(queueKey, JSON.stringify(queue))

    // If online, try to sync immediately
    if (navigator.onLine) {
      // Trigger sync event
      window.dispatchEvent(new Event("online"))
    }
  }, [])

  const saveMoodOffline = useCallback((mood: number, notes?: string) => {
    const moodEntry = {
      mood,
      timestamp: new Date().toISOString(),
      notes,
    }

    // Save to main storage immediately for offline viewing
    const currentMoods = JSON.parse(localStorage.getItem("moodHistory") || "[]")
    currentMoods.push(moodEntry)
    localStorage.setItem("moodHistory", JSON.stringify(currentMoods))

    // Also queue for sync if offline
    if (!navigator.onLine) {
      queueAction("mood", moodEntry)
    }
  }, [queueAction])

  const saveJournalOffline = useCallback((entry: any) => {
    // Save to main storage immediately
    const currentEntries = JSON.parse(localStorage.getItem("journalEntries") || "[]")
    currentEntries.push(entry)
    localStorage.setItem("journalEntries", JSON.stringify(currentEntries))

    // Queue for sync if offline
    if (!navigator.onLine) {
      queueAction("journal", entry)
    }
  }, [queueAction])

  return {
    queueAction,
    saveMoodOffline,
    saveJournalOffline,
  }
}

