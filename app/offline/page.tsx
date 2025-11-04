"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, WifiOff, RefreshCw, CheckCircle2, BookOpen, TrendingUp } from "lucide-react"

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false)
  const [cachedFeatures, setCachedFeatures] = useState<string[]>([])

  const handleViewMoodHistory = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/dashboard'
    }
  }

  const handleViewJournal = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/journal'
    }
  }

  const handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  useEffect(() => {
    // Check online status
    setIsOnline(navigator.onLine)

    // Check what features are available offline
    const features: string[] = []
    
    if (typeof window !== 'undefined') {
      // Check if mood history exists
      if (localStorage.getItem("moodHistory")) {
        features.push("Mood History")
      }
      
      // Check if journal entries exist
      if (localStorage.getItem("journalEntries")) {
        features.push("Journal Entries")
      }
      
      // Check if user data exists
      if (localStorage.getItem("userData")) {
        features.push("Profile & Settings")
      }
    }

    setCachedFeatures(features)

    // Listen for online status
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <WifiOff className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-2xl text-white">You're Offline</CardTitle>
          <CardDescription className="text-gray-300">
            {isOnline 
              ? "Connection restored! You can now use all features."
              : "Some features are still available offline"}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {cachedFeatures.length > 0 && (
            <div className="bg-gray-700/50 rounded-lg p-4 text-left">
              <p className="text-sm font-semibold text-white mb-2">Available Offline:</p>
              <ul className="space-y-2">
                {cachedFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm text-gray-300">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="space-y-2">
            <p className="text-sm text-gray-300 mb-4">
              {isOnline 
                ? "Your connection has been restored. Data will sync automatically."
                : "Continue using the app - your data will sync when you reconnect."}
            </p>

            {cachedFeatures.includes("Mood History") && (
              <Button 
                variant="outline" 
                className="w-full bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                onClick={handleViewMoodHistory}
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                View Mood History
              </Button>
            )}

            {cachedFeatures.includes("Journal Entries") && (
              <Button 
                variant="outline" 
                className="w-full bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                onClick={handleViewJournal}
              >
                <BookOpen className="mr-2 h-4 w-4" />
                View Journal
              </Button>
            )}
          </div>

          <div className="flex items-center justify-center pt-4">
            <Heart className="h-6 w-6 text-rose-500 mr-2" />
            <span className="font-semibold text-white">Melodica</span>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button 
            onClick={handleReload} 
            className="bg-teal-600 hover:bg-teal-700"
            disabled={!isOnline}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            {isOnline ? "Reload Page" : "Try Again"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
