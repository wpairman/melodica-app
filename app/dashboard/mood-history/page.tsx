"use client"

import { useState, useEffect } from "react"

// Force dynamic rendering to avoid SSR issues with event handlers
export const dynamic = 'force-dynamic'
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import DashboardLayout from "@/components/layouts/dashboard-layout"
import { MenuButton } from "@/components/navigation-sidebar"

type MoodEntry = {
  mood: number
  timestamp: Date
  notes?: string
}

export default function MoodHistoryPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const today = new Date()
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  useEffect(() => {
    // Load mood history from localStorage (client-side only)
    if (typeof window !== 'undefined') {
      const storedHistory = localStorage.getItem("moodHistory")
      if (storedHistory) {
        const parsed = JSON.parse(storedHistory)
        const processedHistory = parsed.map((entry: any) => ({
          ...entry,
          timestamp: new Date(entry.timestamp),
        }))
        setMoodHistory(processedHistory)
      }
    }
  }, [])

  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const daysInMonth = lastDayOfMonth.getDate()
  const startingDayOfWeek = firstDayOfMonth.getDay()

  const navigateMonth = (direction: number) => {
    setCurrentDate(new Date(year, month + direction, 1))
  }

  const getMoodForDate = (date: Date) => {
    return moodHistory.find((entry) => entry.timestamp.toDateString() === date.toDateString())
  }

  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString()
  }

  const getMoodColor = (mood: number) => {
    if (mood <= 3) return "bg-red-400"
    if (mood <= 6) return "bg-yellow-400"
    return "bg-green-400"
  }

  const getMoodEmoji = (mood: number) => {
    if (mood <= 2) return "😢"
    if (mood <= 4) return "😔"
    if (mood <= 6) return "😐"
    if (mood <= 8) return "🙂"
    return "😊"
  }

  const getMoodTrend = () => {
    if (moodHistory.length < 2) return null

    const recent = moodHistory.slice(-7) // Last 7 entries
    const older = moodHistory.slice(-14, -7) // Previous 7 entries

    if (older.length === 0) return null

    const recentAvg = recent.reduce((sum, entry) => sum + entry.mood, 0) / recent.length
    const olderAvg = older.reduce((sum, entry) => sum + entry.mood, 0) / older.length

    const diff = recentAvg - olderAvg

    if (diff > 0.5) return { trend: "up", value: diff.toFixed(1) }
    if (diff < -0.5) return { trend: "down", value: Math.abs(diff).toFixed(1) }
    return { trend: "stable", value: "0" }
  }

  // Generate calendar days
  const calendarDays = []

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < startingDayOfWeek; i++) {
    const prevMonthDay = new Date(year, month, -startingDayOfWeek + i + 1)
    calendarDays.push({ date: prevMonthDay, isCurrentMonth: false })
  }

  // Add days of the current month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day)
    calendarDays.push({ date, isCurrentMonth: true })
  }

  // Add empty cells for days after the last day of the month
  const remainingCells = 42 - calendarDays.length
  for (let i = 1; i <= remainingCells; i++) {
    const nextMonthDay = new Date(year, month + 1, i)
    calendarDays.push({ date: nextMonthDay, isCurrentMonth: false })
  }

  const trend = getMoodTrend()

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
        {/* Fixed header with menu button */}
        <div className="sticky top-0 z-50 bg-gray-900 border-b border-gray-700 px-6 py-4 flex items-center gap-4">
          <MenuButton />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Mood History</h1>
            <p className="text-gray-300 text-sm">Calendar view of your mood journey</p>
          </div>
        </div>
        
        <div className="p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-end">
          {trend && (
            <Card className="p-4 bg-gray-800 border-gray-700">
              <div className="flex items-center gap-2">
                {trend.trend === "up" && <TrendingUp className="h-5 w-5 text-green-500" />}
                {trend.trend === "down" && <TrendingDown className="h-5 w-5 text-red-500" />}
                {trend.trend === "stable" && <Minus className="h-5 w-5 text-gray-500" />}
                <span className="text-sm font-medium text-white">
                  {trend.trend === "up" && `Improving by ${trend.value}`}
                  {trend.trend === "down" && `Declining by ${trend.value}`}
                  {trend.trend === "stable" && "Stable mood"}
                </span>
              </div>
            </Card>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          {/* Calendar */}
          <div className="lg:col-span-3">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Button variant="ghost" className="text-white hover:bg-gray-700" onClick={() => {
                    if (typeof window !== 'undefined') {
                      navigateMonth(-1)
                    }
                  }}>
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <CardTitle className="text-2xl text-white">
                    {monthNames[month]} {year}
                  </CardTitle>
                  <Button variant="ghost" className="text-white hover:bg-gray-700" onClick={() => {
                    if (typeof window !== 'undefined') {
                      navigateMonth(1)
                    }
                  }}>
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Days of week header */}
                <div className="grid grid-cols-7 gap-1 mb-4">
                  {daysOfWeek.map((day) => (
                    <div key={day} className="text-center text-sm font-semibold text-gray-300 p-3">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map(({ date, isCurrentMonth }, index) => {
                    const moodEntry = getMoodForDate(date)
                    const isSelected = selectedDate?.toDateString() === date.toDateString()
                    const isTodayDate = isToday(date)

                    return (
                      <div
                        key={index}
                        onClick={() => {
                          if (typeof window !== 'undefined') {
                            setSelectedDate(date)
                          }
                        }}
                        className={cn(
                          "min-h-[80px] p-2 border rounded-lg cursor-pointer transition-all hover:shadow-md relative",
                          isCurrentMonth ? "bg-gray-700 hover:bg-gray-600 border-gray-600" : "bg-gray-800 text-gray-500 border-gray-700",
                          isTodayDate && "ring-2 ring-blue-500",
                          isSelected && "ring-2 ring-purple-500 bg-purple-900",
                        )}
                      >
                        <div className={cn("text-sm font-medium mb-1 text-white", isTodayDate && "text-blue-400 font-bold")}>
                          {date.getDate()}
                        </div>

                        {/* Mood indicator */}
                        {moodEntry && (
                          <div className="flex flex-col items-center justify-center flex-1">
                            <div
                              className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold mb-1",
                                getMoodColor(moodEntry.mood),
                              )}
                            >
                              {moodEntry.mood}
                            </div>
                            <div className="text-lg">{getMoodEmoji(moodEntry.mood)}</div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Selected Date Details */}
            {selectedDate && (
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg text-white">
                    {selectedDate.toLocaleDateString([], {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const moodEntry = getMoodForDate(selectedDate)
                    if (moodEntry) {
                      return (
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                "w-12 h-12 rounded-full flex items-center justify-center text-white font-bold",
                                getMoodColor(moodEntry.mood),
                              )}
                            >
                              {moodEntry.mood}
                            </div>
                            <div>
                              <div className="text-2xl">{getMoodEmoji(moodEntry.mood)}</div>
                              <div className="text-sm text-gray-300">
                                {moodEntry.timestamp.toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </div>
                            </div>
                          </div>
                          {moodEntry.notes && (
                            <div className="bg-gray-700 p-3 rounded-lg">
                              <p className="text-sm text-gray-200">{moodEntry.notes}</p>
                            </div>
                          )}
                        </div>
                      )
                    } else {
                      return <p className="text-gray-300 text-sm">No mood entry for this date</p>
                    }
                  })()}
                </CardContent>
              </Card>
            )}

            {/* Mood Legend */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg text-white">Mood Scale</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-red-400"></div>
                    <span className="text-sm text-white">Low (1-3) 😢</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-yellow-400"></div>
                    <span className="text-sm text-white">Neutral (4-6) 😐</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-400"></div>
                    <span className="text-sm text-white">High (7-10) 😊</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Statistics */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg text-white">This Month</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(() => {
                    const thisMonthEntries = moodHistory.filter(
                      (entry) => entry.timestamp.getMonth() === month && entry.timestamp.getFullYear() === year,
                    )

                    if (thisMonthEntries.length === 0) {
                      return <p className="text-gray-300 text-sm">No entries this month</p>
                    }

                    const avgMood =
                      thisMonthEntries.reduce((sum, entry) => sum + entry.mood, 0) / thisMonthEntries.length
                    const highestMood = Math.max(...thisMonthEntries.map((e) => e.mood))
                    const lowestMood = Math.min(...thisMonthEntries.map((e) => e.mood))

                    return (
                      <>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-300">Entries:</span>
                          <Badge variant="outline" className="border-gray-600 text-white">{thisMonthEntries.length}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-300">Average:</span>
                          <Badge
                            className={getMoodColor(avgMood).replace("bg-", "bg-opacity-20 text-") + " border-current"}
                          >
                            {avgMood.toFixed(1)}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-300">Highest:</span>
                          <Badge className="bg-green-500 text-white">{highestMood}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-300">Lowest:</span>
                          <Badge className="bg-red-500 text-white">{lowestMood}</Badge>
                        </div>
                      </>
                    )
                  })()}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
