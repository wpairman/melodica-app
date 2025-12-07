"use client"

import { useState, useEffect } from "react"

// Force dynamic rendering to avoid SSR issues with event handlers
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Heart, Activity, User, Settings, LogOut, Music, CreditCard, Calendar, TrendingUp, Cloud, ListMusic, Sparkles } from "lucide-react"
import { MenuButton } from "@/components/navigation-sidebar"
import MoodTracker from "@/components/mood-tracker"
import Recommendations from "@/components/recommendations"
import MoodAnalysis from "@/components/mood-analysis"
import PeriodTracker from "@/components/period-tracker"
import TherapistFinder from "@/components/therapist-finder"
import CalendarIntegration from "@/components/calendar-integration"
import CalendarNotifications from "@/components/calendar-notifications"
import DashboardLayout from "@/components/layouts/dashboard-layout"
import { useToast } from "@/hooks/use-toast"
import { DarkModeToggle } from "@/components/dark-mode-toggle"
import WeatherMoodDashboard from "@/components/weather-mood-dashboard"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { AuthGuard } from "@/components/auth-guard"

export default function Dashboard() {
  const { toast } = useToast()
  const { logout } = useAuth()
  const router = useRouter()
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)

  // Load initial data
  useEffect(() => {
    setIsMounted(true)
    // In a real app, you would fetch this from an API (client-side only)
    if (typeof window !== 'undefined') {
      const storedData = localStorage.getItem("userData")
      if (storedData) {
        try {
          const parsed = JSON.parse(storedData)
          setUserData(parsed)
        } catch (error) {
          console.error("Error parsing user data:", error)
        }
      }
    }

    setLoading(false)
  }, [])

  // Set up service worker listener and sync IndexedDB moods
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Sync moods from IndexedDB to localStorage (for moods saved while app was closed)
    const syncMoodsFromIndexedDB = async () => {
      try {
        const request = indexedDB.open('melodica-moods', 1)
        
        request.onupgradeneeded = (event: any) => {
          const db = event.target.result
          if (!db.objectStoreNames.contains('moods')) {
            const objectStore = db.createObjectStore('moods', { keyPath: 'id', autoIncrement: true })
            objectStore.createIndex('timestamp', 'timestamp', { unique: false })
          }
        }
        
        request.onsuccess = () => {
          const db = request.result
          const transaction = db.transaction(['moods'], 'readonly')
          const store = transaction.objectStore('moods')
          const getAllRequest = store.getAll()
          
          getAllRequest.onsuccess = () => {
            const indexedDBMoods = getAllRequest.result
            
            if (indexedDBMoods.length > 0) {
              // Load existing localStorage mood history
              const storedHistory = localStorage.getItem("moodHistory")
              let moodHistory: any[] = []
              if (storedHistory) {
                try {
                  moodHistory = JSON.parse(storedHistory)
                } catch (e) {
                  console.error("Error parsing mood history:", e)
                  moodHistory = []
                }
              }
              
              // Convert IndexedDB moods to localStorage format and merge
              indexedDBMoods.forEach((entry: any) => {
                const newEntry = {
                  mood: entry.mood,
                  timestamp: new Date(entry.timestamp),
                  notes: entry.notes || ""
                }
                
                // Check if entry already exists
                const exists = moodHistory.some((existing: any) => {
                  const existingDate = new Date(existing.timestamp).toISOString()
                  const newDate = newEntry.timestamp.toISOString()
                  return existingDate === newDate && existing.mood === newEntry.mood
                })
                
                if (!exists) {
                  moodHistory.push(newEntry)
                }
              })
              
              // Save merged history
              localStorage.setItem("moodHistory", JSON.stringify(moodHistory))
              
              // Clear IndexedDB after syncing
              const clearTransaction = db.transaction(['moods'], 'readwrite')
              const clearStore = clearTransaction.objectStore('moods')
              clearStore.clear()
            }
          }
        }
      } catch (error) {
        console.error("Error syncing moods from IndexedDB:", error)
      }
    }

    // Sync on mount
    syncMoodsFromIndexedDB()

    // Set up service worker message listener
    if ('serviceWorker' in navigator) {
      const messageHandler = (event: MessageEvent) => {
        if (event.data && event.data.type === 'QUICK_MOOD_LOG') {
          const moodEntry = event.data.mood
          
          // Load existing mood history
          const storedHistory = localStorage.getItem("moodHistory")
          let moodHistory: any[] = []
          if (storedHistory) {
            try {
              moodHistory = JSON.parse(storedHistory)
            } catch (e) {
              console.error("Error parsing mood history:", e)
            }
          }
          
          // Add the new entry (avoid duplicates)
          const newEntry = {
            mood: moodEntry.mood,
            timestamp: new Date(moodEntry.timestamp),
            notes: moodEntry.notes || ""
          }
          
          // Check if this entry already exists
          const exists = moodHistory.some((entry: any) => {
            const entryDate = new Date(entry.timestamp).toISOString()
            const newDate = newEntry.timestamp.toISOString()
            return entryDate === newDate && entry.mood === newEntry.mood
          })
          
          if (!exists) {
            moodHistory.push(newEntry)
            localStorage.setItem("moodHistory", JSON.stringify(moodHistory))
            
            // Show toast notification
            toast({
              title: "Mood logged! 💚",
              description: `Your ${moodEntry.mood}-star mood has been saved.`,
            })
          }
        }
      }

      // Listen for quick mood logs from notification actions (service worker)
      navigator.serviceWorker.addEventListener('message', messageHandler)
      
      // Return cleanup function for service worker listener
      return () => {
        navigator.serviceWorker.removeEventListener('message', messageHandler)
      }
    }
  }, [toast])

  // Separate useEffect for mood check reminders - disabled to prevent infinite loops
  // useEffect(() => {
  //   // Only set up timers after component is mounted and toast is ready
  //   if (typeof window === 'undefined') return
  //
  //   // Set up hourly mood check reminder
  //   const moodCheckInterval = setInterval(() => {
  //     try {
  //       toast({
  //         title: "Time for a mood check-in",
  //         description: "How are you feeling right now?",
  //         action: (
  //           <Link href="/dashboard">
  //             <Button variant="outline" size="sm">
  //               Check in
  //             </Button>
  //           </Link>
  //         ),
  //       })
  //     } catch (error) {
  //       console.error('Error showing mood check toast:', error)
  //     }
  //   }, 3600000) // Every hour
  //
  //   // For demo purposes, show a mood check prompt after 30 seconds
  //   const demoPrompt = setTimeout(() => {
  //     try {
  //       toast({
  //         title: "Time for a mood check-in",
  //         description: "How are you feeling right now?",
  //         action: (
  //           <Button
  //             variant="outline"
  //             size="sm"
  //             onClick={() => {
  //               if (typeof window !== 'undefined') {
  //                 document.getElementById("mood-tracker")?.scrollIntoView({ behavior: "smooth" })
  //               }
  //             }}
  //           >
  //             Check in
  //           </Button>
  //         ),
  //       })
  //     } catch (error) {
  //       console.error('Error showing demo mood check toast:', error)
  //     }
  //   }, 30000)
  //
  //   return () => {
  //     clearInterval(moodCheckInterval)
  //     clearTimeout(demoPrompt)
  //   }
  // }, []) // Removed toast dependency

  if (loading || !isMounted) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white">
        Loading...
      </div>
    )
  }

  if (!userData) {
    return (
      <AuthGuard>
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-screen">
            <Card className="w-full max-w-md bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Not Logged In</CardTitle>
                <CardDescription className="text-gray-300">
                  Please log in or create an account to continue
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Link href="/login" className="w-full">
                  <Button className="w-full">Log In</Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </DashboardLayout>
      </AuthGuard>
    )
  }

  const tabsConfig = userData.gender === "female"
    ? [
        { value: "mood", label: "Home" },
        { value: "calendar", label: "Calendar" },
        { value: "recommendations", label: "Recommendations" },
        { value: "period", label: "Period Tracking" },
        { value: "therapists", label: "Find Therapists" },
      ]
    : [
        { value: "mood", label: "Home" },
        { value: "calendar", label: "Calendar" },
        { value: "recommendations", label: "Recommendations" },
        { value: "therapists", label: "Find Therapists" },
      ]

  return (
    <AuthGuard>
      <DashboardLayout>
        <>
          <div className="flex min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
            <CalendarNotifications />
            <div className="flex-1">
              <header className="sticky top-0 z-40 border-b bg-gray-900 border-gray-700 lg:hidden">
                <div className="flex h-14 items-center px-4 justify-between">
                  <Link href="/" className="flex items-center gap-2 font-semibold text-white">
                    <Heart className="h-6 w-6 text-rose-500" />
                    <span>Melodica</span>
                  </Link>
                  <MenuButton />
                </div>
              </header>
              <main className="container mx-auto p-4 md:p-6">
                <div className="flex flex-col gap-6">
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">Welcome, {userData.name}</h1>
                    <p className="text-gray-300">Track your mood and get personalized recommendations</p>
                  </div>

                  <Tabs defaultValue="mood" className="w-full">
                    <TabsList className="flex w-full flex-wrap bg-gray-800 gap-1">
                      {tabsConfig.map((tab) => (
                        <TabsTrigger key={tab.value} value={tab.value} className="flex-1 min-w-[120px] text-xs sm:text-sm text-white data-[state=active]:bg-gray-700 data-[state=active]:text-white whitespace-nowrap">
                          {tab.label}
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    <TabsContent value="mood" className="mt-6">
                      <div className="space-y-6">
                        <WeatherMoodDashboard />
                        <div id="mood-tracker">
                          <MoodTracker userData={userData} />
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="calendar" className="mt-6">
                      <div className="space-y-4">
                        <CalendarIntegration />
                        <Card className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-800">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-white">
                              <Calendar className="h-5 w-5 text-blue-400" />
                              Full Calendar View
                            </CardTitle>
                            <CardDescription className="text-gray-300">
                              View and manage all your events, appointments, and mood check-ins in a comprehensive calendar
                            </CardDescription>
                          </CardHeader>
                          <CardFooter>
                            <Link href="/calendar" className="w-full">
                              <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                                Open Full Calendar
                              </Button>
                            </Link>
                          </CardFooter>
                        </Card>
                      </div>
                    </TabsContent>

                    <TabsContent value="recommendations" className="mt-6">
                      <Recommendations userData={userData} />
                    </TabsContent>

                    <TabsContent value="therapists" className="mt-6">
                      <TherapistFinder />
                    </TabsContent>

                    {userData.gender === "female" && (
                      <TabsContent value="period" className="mt-6">
                        <PeriodTracker />
                      </TabsContent>
                    )}
                  </Tabs>
                </div>
              </main>
            </div>
          </div>
        </>
      </DashboardLayout>
    </AuthGuard>
  )
}
