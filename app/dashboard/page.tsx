"use client"

import { useState, useEffect } from "react"

// Force dynamic rendering to avoid SSR issues with event handlers
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Heart, Activity, User, Settings, LogOut, Music, Calendar, TrendingUp, Cloud, ListMusic, Sparkles, Quote, Droplets } from "lucide-react"
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
import AIMusicRecommendations from "@/components/ai-music-recommendations"
import CustomActivityPrograms from "@/components/custom-activity-programs"
import PersonalizedPlaylists from "@/components/personalized-playlists"

export default function Dashboard() {
  const { toast } = useToast()
  const { logout } = useAuth()
  const router = useRouter()
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)
  const [moodHistory, setMoodHistory] = useState<any[]>([])

  // Load initial data
  useEffect(() => {
    setIsMounted(true)
    if (typeof window !== 'undefined') {
      const storedData = localStorage.getItem("userData")
      console.log("storedData", storedData)
      if (storedData) {
        console.log("parsed user data", JSON.parse(storedData))
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

  // Load mood history from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = localStorage.getItem("moodHistory")
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setMoodHistory(Array.isArray(parsed) ? parsed : [])
      } catch {
        setMoodHistory([])
      }
    }
  }, [])

  // Set up service worker listener and sync IndexedDB moods
  useEffect(() => {
    if (typeof window === 'undefined') return

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
              
              indexedDBMoods.forEach((entry: any) => {
                const newEntry = {
                  mood: entry.mood,
                  timestamp: new Date(entry.timestamp),
                  notes: entry.notes || ""
                }
                
                const exists = moodHistory.some((existing: any) => {
                  const existingDate = new Date(existing.timestamp).toISOString()
                  const newDate = newEntry.timestamp.toISOString()
                  return existingDate === newDate && existing.mood === newEntry.mood
                })
                
                if (!exists) {
                  moodHistory.push(newEntry)
                }
              })
              
              localStorage.setItem("moodHistory", JSON.stringify(moodHistory))
              
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

    syncMoodsFromIndexedDB()

    if ('serviceWorker' in navigator) {
      const messageHandler = (event: MessageEvent) => {
        if (event.data && event.data.type === 'QUICK_MOOD_LOG') {
          const moodEntry = event.data.mood
          
          const storedHistory = localStorage.getItem("moodHistory")
          let moodHistory: any[] = []
          if (storedHistory) {
            try {
              moodHistory = JSON.parse(storedHistory)
            } catch (e) {
              console.error("Error parsing mood history:", e)
            }
          }
          
          const newEntry = {
            mood: moodEntry.mood,
            timestamp: new Date(moodEntry.timestamp),
            notes: moodEntry.notes || ""
          }
          
          const exists = moodHistory.some((entry: any) => {
            const entryDate = new Date(entry.timestamp).toISOString()
            const newDate = newEntry.timestamp.toISOString()
            return entryDate === newDate && entry.mood === newEntry.mood
          })
          
          if (!exists) {
            moodHistory.push(newEntry)
            localStorage.setItem("moodHistory", JSON.stringify(moodHistory))
            setMoodHistory(moodHistory)
            
            toast({
              title: "Mood logged! 💚",
              description: `Your ${moodEntry.mood}-star mood has been saved.`,
            })
          }
        }
      }

      navigator.serviceWorker.addEventListener('message', messageHandler)
      
      return () => {
        navigator.serviceWorker.removeEventListener('message', messageHandler)
      }
    }
  }, [toast])

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
        { value: "activities", label: "Activities" },
        { value: "period", label: "Period Tracking" },
        { value: "therapists", label: "Find Therapists" },
      ]
    : [
        { value: "mood", label: "Home" },
        { value: "calendar", label: "Calendar" },
        { value: "recommendations", label: "Recommendations" },
        { value: "activities", label: "Activities" },
        { value: "therapists", label: "Find Therapists" },
      ]

  return (
    <AuthGuard>
      <DashboardLayout>
        <>
          <div className="flex min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
            <CalendarNotifications />
            <div className="hidden md:flex w-64 flex-col fixed inset-y-0 z-50 border-r bg-gray-900 border-gray-700">
              <div className="flex h-14 items-center border-b border-gray-700 px-4 justify-between">
                <Link href="/" className="flex items-center gap-2 font-semibold text-white">
                  <Heart className="h-6 w-6 text-rose-500" />
                  <span>Melodica</span>
                </Link>
                <DarkModeToggle />
              </div>
              <nav className="flex-1 overflow-auto py-4">
                <div className="px-4 py-2">
                  <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight text-white">Dashboard</h2>
                  <div className="space-y-1">
                    <Link href="/dashboard">
                      <Button variant="ghost" className="w-full justify-start text-white hover:bg-gray-800">
                        <Heart className="mr-2 h-4 w-4" />
                        Home
                      </Button>
                    </Link>
                    <Link href="/dashboard/quotes">
                      <Button variant="ghost" className="w-full justify-start text-white hover:bg-purple-600/20 border-l-2 border-purple-500">
                        <Quote className="mr-2 h-4 w-4 text-purple-400" />
                        <span className="font-semibold">Quotes</span>
                      </Button>
                    </Link>
                    <Link href="/calendar">
                      <Button variant="ghost" className="w-full justify-start text-white hover:bg-gray-800">
                        <Calendar className="mr-2 h-4 w-4" />
                        Calendar
                      </Button>
                    </Link>
                    <Link href="/dashboard/mood-history">
                      <Button variant="ghost" className="w-full justify-start text-white hover:bg-gray-800">
                        <Activity className="mr-2 h-4 w-4" />
                        Mood History
                      </Button>
                    </Link>
                    <Link href="/analytics">
                      <Button variant="ghost" className="w-full justify-start text-white hover:bg-gray-800">
                        <TrendingUp className="mr-2 h-4 w-4" />
                        Mood Analytics
                      </Button>
                    </Link>
                    <Link href="/weather-mood">
                      <Button variant="ghost" className="w-full justify-start text-white hover:bg-gray-800">
                        <Cloud className="mr-2 h-4 w-4" />
                        Weather & Mood
                      </Button>
                    </Link>
                    <Link href="/dashboard/profile">
                      <Button variant="ghost" className="w-full justify-start text-white hover:bg-gray-800">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Button>
                    </Link>
                    <Link href="/music-preferences">
                      <Button variant="ghost" className="w-full justify-start text-white hover:bg-gray-800">
                        <Music className="mr-2 h-4 w-4" />
                        Your Artist's Songs
                      </Button>
                    </Link>
                    <Link href="/dashboard/playlists">
                      <Button variant="ghost" className="w-full justify-start text-white hover:bg-gray-800">
                        <ListMusic className="mr-2 h-4 w-4" />
                        Playlists
                      </Button>
                    </Link>
                    <Link href="/dashboard/activities">
                      <Button variant="ghost" className="w-full justify-start text-white hover:bg-gray-800">
                        <Activity className="mr-2 h-4 w-4" />
                        Activities
                      </Button>
                    </Link>
                    <Link href="/dashboard/journaling">
                      <Button variant="ghost" className="w-full justify-start text-white hover:bg-gray-800">
                        <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Journaling
                      </Button>
                    </Link>
                    <Link href="/dashboard/jamaica-wellness">
                      <Button variant="ghost" className="w-full justify-start text-white hover:bg-gray-800">
                        <Sparkles className="mr-2 h-4 w-4" />
                        Jamaica Wellness Toolkit
                      </Button>
                    </Link>
                    <Link href="/dashboard/settings">
                      <Button variant="ghost" className="w-full justify-start text-white hover:bg-gray-800">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Button>
                    </Link>
                    {userData.gender === "female" && (
                      <Link href="/period-tracker">
                        <Button variant="ghost" className="w-full justify-start text-white hover:bg-gray-800">
                          <Droplets className="mr-2 h-4 w-4" />
                          Period Tracking
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </nav>
              <div className="mt-auto p-4">
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-white border-gray-600 hover:bg-gray-800"
                  onClick={() => {
                    console.log("🚪 DASHBOARD LOGOUT - Button clicked")
                    logout()
                    console.log("✅ logout() called")
                    toast({
                      title: "Logged out",
                      description: "You have been successfully logged out.",
                    })
                    router.push("/login")
                    console.log("✅ Redirected to /login")
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </Button>
              </div>
            </div>
            <div className="flex-1 md:ml-64">
              <header className="sticky top-0 z-40 border-b bg-gray-900 border-gray-700 md:hidden">
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
                    {/* ✅ FIXED: Horizontally scrollable tabs instead of wrapping */}
                    <TabsList className="flex w-full overflow-x-auto no-scrollbar bg-gray-800 gap-1 rounded-lg p-1">
                      {tabsConfig.map((tab) => (
                        <TabsTrigger
                          key={tab.value}
                          value={tab.value}
                          className="flex-shrink-0 px-4 py-2 text-xs sm:text-sm text-gray-300 data-[state=active]:bg-teal-600 data-[state=active]:text-white whitespace-nowrap rounded-md"
                        >
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
                      <div className="space-y-6">
                        <AIMusicRecommendations 
                          userData={userData} 
                          currentMood={moodHistory.length > 0 ? moodHistory[moodHistory.length - 1].mood : 5}
                          moodHistory={moodHistory}
                        />
                        <PersonalizedPlaylists 
                          userData={userData}
                          currentMood={moodHistory.length > 0 ? moodHistory[moodHistory.length - 1].mood : 5}
                        />
                        <Recommendations userData={userData} />
                      </div>
                    </TabsContent>

                    <TabsContent value="activities" className="mt-6">
                      <CustomActivityPrograms />
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
