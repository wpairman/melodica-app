"use client"

import { useState, useEffect } from "react"

// Force dynamic rendering to avoid SSR issues with event handlers
export const dynamic = 'force-dynamic'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Heart, Activity, Clock, Calendar, TrendingUp } from "lucide-react"
import DashboardLayout from "@/components/layouts/dashboard-layout"
import MoodTrendsChart from "@/components/analytics/mood-trends-chart"
import MoodByTimeChart from "@/components/analytics/mood-by-time-chart"
import MoodCorrelationChart from "@/components/analytics/mood-correlation-chart"
import MoodInsights from "@/components/analytics/mood-insights"
import { MenuButton } from "@/components/navigation-sidebar"

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("week")
  const [moodData, setMoodData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In a real app, you would fetch this from an API (client-side only)
    if (typeof window !== 'undefined') {
      const storedHistory = localStorage.getItem("moodHistory")

      if (storedHistory) {
        const history = JSON.parse(storedHistory)
        setMoodData(history)
      } else {
        // Generate sample data if none exists
        const sampleData = generateSampleMoodData()
        setMoodData(sampleData)
        localStorage.setItem("moodHistory", JSON.stringify(sampleData))
      }
    }

    setLoading(false)
  }, [])

  // Generate sample mood data for demonstration
  const generateSampleMoodData = () => {
    const data = []
    const now = new Date()

    // Generate 30 days of data
    for (let i = 30; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)

      // Generate 1-3 entries per day
      const entriesCount = Math.floor(Math.random() * 3) + 1

      for (let j = 0; j < entriesCount; j++) {
        const hours = Math.floor(Math.random() * 24)
        const minutes = Math.floor(Math.random() * 60)
        date.setHours(hours, minutes)

        // Generate mood score with some patterns
        // Morning moods tend to be medium
        // Afternoon moods tend to be higher
        // Evening moods vary more
        let baseMood
        if (hours < 10) baseMood = 5 + Math.floor(Math.random() * 3) - 1
        else if (hours < 17) baseMood = 7 + Math.floor(Math.random() * 3) - 1
        else baseMood = 4 + Math.floor(Math.random() * 6)

        // Clamp between 1-10
        const mood = Math.max(1, Math.min(10, baseMood))

        data.push({
          mood,
          timestamp: date.toISOString(),
          activities: getRandomActivities(),
          music: getRandomMusic(),
        })
      }
    }

    return data
  }

  const getRandomActivities = () => {
    const activities = ["Walking", "Reading", "Working", "Exercising", "Socializing", "Resting", "Meditating"]
    const count = Math.floor(Math.random() * 2) + 1
    const selected: string[] = []

    for (let i = 0; i < count; i++) {
      const activity = activities[Math.floor(Math.random() * activities.length)]
      if (!selected.includes(activity)) selected.push(activity)
    }

    return selected
  }

  const getRandomMusic = () => {
    const genres = ["Pop", "Rock", "Classical", "Jazz", "Hip-hop", "Electronic", "Ambient"]
    return genres[Math.floor(Math.random() * genres.length)]
  }

  const filterDataByTimeRange = (data: any[]) => {
    const now = new Date()
    const cutoff = new Date()

    switch (timeRange) {
      case "week":
        cutoff.setDate(now.getDate() - 7)
        break
      case "month":
        cutoff.setMonth(now.getMonth() - 1)
        break
      case "year":
        cutoff.setFullYear(now.getFullYear() - 1)
        break
      default:
        cutoff.setDate(now.getDate() - 7)
    }

    return data.filter((entry) => new Date(entry.timestamp) >= cutoff)
  }

  const filteredData = filterDataByTimeRange(moodData)

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p>Loading analytics...</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
        {/* Fixed header with menu button */}
        <div className="sticky top-0 z-50 bg-gray-900 border-b border-gray-700 px-6 py-4 flex items-center gap-4">
          <MenuButton />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Mood Analytics</h1>
            <p className="text-gray-300 text-sm">Visualize your mood patterns and gain insights</p>
          </div>
        </div>

        <div className="p-6">
          <div className="flex flex-col gap-6">

        <div className="flex justify-between items-center">
          <Tabs defaultValue="trends" className="w-full">
            <TabsList className="bg-gray-800">
              <TabsTrigger value="trends" className="text-white data-[state=active]:bg-gray-700 data-[state=active]:text-white">
                <TrendingUp className="h-4 w-4 mr-2" />
                Trends
              </TabsTrigger>
              <TabsTrigger value="patterns" className="text-white data-[state=active]:bg-gray-700 data-[state=active]:text-white">
                <Clock className="h-4 w-4 mr-2" />
                Patterns
              </TabsTrigger>
              <TabsTrigger value="correlations" className="text-white data-[state=active]:bg-gray-700 data-[state=active]:text-white">
                <Activity className="h-4 w-4 mr-2" />
                Correlations
              </TabsTrigger>
              <TabsTrigger value="insights" className="text-white data-[state=active]:bg-gray-700 data-[state=active]:text-white">
                <Heart className="h-4 w-4 mr-2" />
                Insights
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="ml-auto">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px] bg-gray-700 border-gray-600 text-white">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 shadow-lg" position="popper" side="bottom">
                <SelectItem value="week" className="text-white hover:bg-gray-700">Past Week</SelectItem>
                <SelectItem value="month" className="text-white hover:bg-gray-700">Past Month</SelectItem>
                <SelectItem value="year" className="text-white hover:bg-gray-700">Past Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs defaultValue="trends" className="w-full">
          <TabsContent value="trends" className="mt-0">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Mood Trends</CardTitle>
                <CardDescription className="text-gray-300">Track how your mood has changed over time</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <MoodTrendsChart data={filteredData} timeRange={timeRange} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="patterns" className="mt-0">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Mood by Time of Day</CardTitle>
                <CardDescription className="text-gray-300">Discover when you typically feel your best</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <MoodByTimeChart data={filteredData} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="correlations" className="mt-0">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Activity & Music Correlations</CardTitle>
                <CardDescription className="text-gray-300">See how activities and music affect your mood</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <MoodCorrelationChart data={filteredData} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="mt-0">
            <MoodInsights data={filteredData} />
          </TabsContent>
        </Tabs>
        </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
