"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { WifiOff, Wifi, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSafeToast } from "@/components/toast-provider"

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const { toast } = useSafeToast()

  useEffect(() => {
    // Set initial state
    setIsOnline(navigator.onLine)

    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true)
      toast({
        title: "Back Online",
        description: "Your connection has been restored. Syncing data...",
      })
      syncOfflineData()
    }

    const handleOffline = () => {
      setIsOnline(false)
      toast({
        title: "You're Offline",
        description: "Some features may be limited. Your data will sync when you reconnect.",
        variant: "default",
      })
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Check for pending sync on mount
    if (navigator.onLine) {
      syncOfflineData()
    }

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [toast])

  const syncOfflineData = async () => {
    if (typeof window === 'undefined') return
    
    setIsSyncing(true)
    try {
      // Get pending actions from localStorage
      const pendingMoods = localStorage.getItem("pendingMoods")
      const pendingJournal = localStorage.getItem("pendingJournal")
      const pendingSettings = localStorage.getItem("pendingSettings")

      let synced = 0

      // Sync mood entries
      if (pendingMoods) {
        try {
          const moods = JSON.parse(pendingMoods)
          const currentMoods = JSON.parse(localStorage.getItem("moodHistory") || "[]")
          
          // Merge pending moods with current (avoid duplicates)
          const mergedMoods = [...currentMoods]
          moods.forEach((pendingMood: any) => {
            const exists = mergedMoods.some((m: any) => 
              m.timestamp === pendingMood.timestamp && m.mood === pendingMood.mood
            )
            if (!exists) {
              mergedMoods.push(pendingMood)
              synced++
            }
          })
          
          localStorage.setItem("moodHistory", JSON.stringify(mergedMoods))
          localStorage.removeItem("pendingMoods")
        } catch (error) {
          console.error("Error syncing moods:", error)
        }
      }

      // Sync journal entries
      if (pendingJournal) {
        try {
          const journals = JSON.parse(pendingJournal)
          const currentJournals = JSON.parse(localStorage.getItem("journalEntries") || "[]")
          
          const mergedJournals = [...currentJournals]
          journals.forEach((pendingJournalEntry: any) => {
            const exists = mergedJournals.some((j: any) => j.id === pendingJournalEntry.id)
            if (!exists) {
              mergedJournals.push(pendingJournalEntry)
              synced++
            }
          })
          
          localStorage.setItem("journalEntries", JSON.stringify(mergedJournals))
          localStorage.removeItem("pendingJournal")
        } catch (error) {
          console.error("Error syncing journal:", error)
        }
      }

      // Sync settings
      if (pendingSettings) {
        try {
          const settings = JSON.parse(pendingSettings)
          localStorage.setItem("appSettings", JSON.stringify(settings))
          localStorage.removeItem("pendingSettings")
          synced++
        } catch (error) {
          console.error("Error syncing settings:", error)
        }
      }

      if (synced > 0) {
        toast({
          title: "Sync Complete",
          description: `Successfully synced ${synced} item(s)`,
        })
      }
    } catch (error) {
      console.error("Error during sync:", error)
    } finally {
      setIsSyncing(false)
    }
  }

  if (isOnline && !isSyncing) {
    return null // Don't show anything when online
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5">
      <Badge
        variant={isOnline ? "default" : "destructive"}
        className="flex items-center gap-2 px-3 py-2 shadow-lg"
      >
        {isSyncing ? (
          <>
            <RefreshCw className="h-3 w-3 animate-spin" />
            <span>Syncing...</span>
          </>
        ) : !isOnline ? (
          <>
            <WifiOff className="h-3 w-3" />
            <span>Offline</span>
          </>
        ) : null}
      </Badge>
    </div>
  )
}

