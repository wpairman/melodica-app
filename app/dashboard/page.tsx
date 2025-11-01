"use client"

import { useState, useEffect } from "react"

// Force dynamic rendering to avoid SSR issues with event handlers
export const dynamic = 'force-dynamic'
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Heart, Activity, User, Settings, LogOut, Music, CreditCard, Calendar, Menu, TrendingUp, Cloud } from "lucide-react"
import MoodTracker from "@/components/mood-tracker"
import Recommendations from "@/components/recommendations"
import MoodAnalysis from "@/components/mood-analysis"
import PeriodTracker from "@/components/period-tracker"
import TherapistFinder from "@/components/therapist-finder"
import CalendarIntegration from "@/components/calendar-integration"
import CalendarNotifications from "@/components/calendar-notifications"
import DashboardLayout from "@/components/layouts/dashboard-layout"
import { useSafeToast } from "@/components/toast-provider"
import { DarkModeToggle } from "@/components/dark-mode-toggle"
import WeatherMoodDashboard from "@/components/weather-mood-dashboard"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { AuthGuard } from "@/components/auth-guard"

export default function Dashboard() {
  const { toast } = useSafeToast()
  const { logout } = useAuth()
  const router = useRouter()
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [hasMusicPreferences, setHasMusicPreferences] = useState(false)
  const [currentDate, setCurrentDate] = useState<string>("")

  useEffect(() => {
    // In a real app, you would fetch this from an API (client-side only)
    if (typeof window !== 'undefined') {
      const storedData = localStorage.getItem("userData")
      if (storedData) {
        try {
          setUserData(JSON.parse(storedData))
        } catch (error) {
          console.error("Error parsing user data:", error)
        }
      }

      // Check if user has completed music preferences quiz
      const storedPreferences = localStorage.getItem("musicPreferences")
      setHasMusicPreferences(!!storedPreferences)

      // Listen for quick mood logs from notification actions (service worker)
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data && event.data.type === 'QUICK_MOOD_LOG') {
            const moodEntry = event.data.mood
            
            // Load existing mood history
            const storedHistory = localStorage.getItem("moodHistory")
            let moodHistory = []
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
              notes: moodEntry.notes
            }
            
            // Check if this entry already exists
            const exists = moodHistory.some((entry: any) => 
              entry.timestamp.toISOString() === newEntry.timestamp.toISOString() && 
              entry.mood === newEntry.mood
            )
            
            if (!exists) {
              moodHistory.push(newEntry)
              localStorage.setItem("moodHistory", JSON.stringify(moodHistory))
              
              // Show confirmation toast
              try {
                toast({
                  title: "Mood Logged! 💚",
                  description: `Your mood (${moodEntry.mood}/10) has been saved.`,
                })
              } catch (error) {
                console.error('Error showing mood logged toast:', error)
              }
            }
          }
        })
      }
    }

    setLoading(false)

    // Set current date (client-side only to avoid hydration issues)
    setCurrentDate(new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }))
  }, [toast])

  // Separate useEffect for mood check reminders
  useEffect(() => {
    // Only set up timers after component is mounted and toast is ready
    if (typeof window === 'undefined') return

    // Set up hourly mood check reminder
    const moodCheckInterval = setInterval(() => {
      try {
        toast({
          title: "Time for a mood check-in",
          description: "How are you feeling right now?",
          action: (
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                Check in
              </Button>
            </Link>
          ),
        })
      } catch (error) {
        console.error('Error showing mood check toast:', error)
      }
    }, 3600000) // Every hour

    // For demo purposes, show a mood check prompt after 30 seconds
    const demoPrompt = setTimeout(() => {
      try {
        toast({
          title: "Time for a mood check-in",
          description: "How are you feeling right now?",
          action: (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  document.getElementById("mood-tracker")?.scrollIntoView({ behavior: "smooth" })
                }
              }}
            >
              Check in
            </Button>
          ),
        })
      } catch (error) {
        console.error('Error showing demo mood check toast:', error)
      }
    }, 30000)

    return () => {
      clearInterval(moodCheckInterval)
      clearTimeout(demoPrompt)
    }
  }, [toast]) // Add toast as dependency

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen text-white">Loading...</div>
  }

  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Not Logged In</CardTitle>
            <CardDescription className="text-gray-300">Please log in or create an account to continue</CardDescription>
          </CardHeader>
          <CardFooter>
            <Link href="/login" className="w-full">
              <Button className="w-full">Log In</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  const tabsConfig = [
    { value: "mood", label: "Home" },
    { value: "calendar", label: "Calendar" },
    { value: "analysis", label: "Mood Analysis" },
    { value: "recommendations", label: "Recommendations" },
    { value: "therapists", label: "Find Therapists" },
  ]

  // Add period tracking tab for female users
  if (userData.gender === "female") {
    tabsConfig.splice(4, 0, { value: "period", label: "Period Tracking" })
  }

  return (
    <AuthGuard>
      <DashboardLayout>
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
                  Music Preferences
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
              <Link href="/pricing">
                <Button variant="ghost" className="w-full justify-start text-white hover:bg-gray-800">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Subscription
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
                    <Music className="mr-2 h-4 w-4" />
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
              logout()
              toast({
                title: "Logged out",
                description: "You have been successfully logged out.",
              })
              router.push("/login")
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
            <Button 
              variant="ghost" 
              size="icon"
              className="text-white hover:bg-gray-800"
              onClick={() => {
                // Toggle mobile menu
                const sidebar = document.querySelector('[class*="fixed"]')
                if (sidebar) {
                  sidebar.classList.toggle('hidden')
                }
              }}
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </header>
        <main className="container mx-auto p-4 md:p-6">
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-white">Welcome, {userData.name}</h1>
                <p className="text-gray-300">Track your mood and get personalized recommendations</p>
              </div>
              <div className="text-right">
                {currentDate && (
                  <p className="text-white font-medium text-lg">
                    {currentDate}
                  </p>
                )}
              </div>
            </div>

            {!hasMusicPreferences && (
              <Card className="bg-teal-900/20 border-teal-800 mb-4">
                <CardHeader>
                  <CardTitle className="flex items-center text-white">
                    <Music className="h-5 w-5 mr-2 text-teal-400" />
                    Complete Your Music Profile
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    Take our detailed music preference quiz to get more personalized recommendations
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <Link href="/music-preferences" className="w-full">
                    <Button className="w-full bg-teal-600 hover:bg-teal-700">Take Music Quiz</Button>
                  </Link>
                </CardFooter>
              </Card>
            )}

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

              <TabsContent value="analysis" className="mt-6">
                <MoodAnalysis userData={userData} />
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
    </DashboardLayout>
    </AuthGuard>
  )
}
