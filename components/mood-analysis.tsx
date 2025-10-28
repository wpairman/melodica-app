"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, TrendingDown, Clock, Activity, Music, Calendar, CheckCircle, ThumbsUp, Zap } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface MoodAnalysisProps {
  userData: {
    name: string
    email: string
    favoriteArtists: string
    favoriteActivities: string
  }
}

export default function MoodAnalysis({ userData }: MoodAnalysisProps) {
  const [moodHistory, setMoodHistory] = useState<any[]>([])
  const [activityEffectiveness, setActivityEffectiveness] = useState<any[]>([])
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [moodTrends, setMoodTrends] = useState<any>({
    overall: 0,
    weekly: 0,
    daily: 0,
  })

  useEffect(() => {
    // Load mood history from localStorage (client-side only)
    if (typeof window !== 'undefined') {
      const storedHistory = localStorage.getItem("moodHistory")
      if (storedHistory) {
        try {
          const history = JSON.parse(storedHistory)
          // Convert timestamp strings back to Date objects
          const historyWithDates = history.map((entry: any) => ({
            ...entry,
            timestamp: new Date(entry.timestamp)
          }))
          setMoodHistory(historyWithDates)
          generateAnalysis(historyWithDates)
        } catch (error) {
          console.error("Error parsing mood history:", error)
          const sampleData = generateSampleData()
          setMoodHistory(sampleData)
          generateAnalysis(sampleData)
        }
      } else {
        // Generate sample data for demonstration
        const sampleData = generateSampleData()
        setMoodHistory(sampleData)
        generateAnalysis(sampleData)
      }
    }
  }, [])

  const generateSampleData = () => {
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
    const activities = [
      "Walking",
      "Reading",
      "Working",
      "Exercising",
      "Socializing",
      "Resting",
      "Meditating",
      "Deep breathing",
      "Journaling",
      "Yoga",
    ]
    const count = Math.floor(Math.random() * 2) + 1
    const selected = []

    for (let i = 0; i < count; i++) {
      const activity = activities[Math.floor(Math.random() * activities.length)]
      if (!selected.includes(activity)) selected.push(activity)
    }

    return selected
  }

  const getRandomMusic = () => {
    const genres = ["Pop", "Rock", "Classical", "Jazz", "Hip-hop", "Electronic", "Ambient", "Folk"]
    return genres[Math.floor(Math.random() * genres.length)]
  }

  const generateAnalysis = (history: any[]) => {
    // Calculate mood trends
    const calculateTrend = (data: any[]) => {
      if (data.length < 2) return 0

      const firstHalf = data.slice(0, Math.floor(data.length / 2))
      const secondHalf = data.slice(Math.floor(data.length / 2))

      const firstAvg = firstHalf.reduce((sum, entry) => sum + entry.mood, 0) / firstHalf.length
      const secondAvg = secondHalf.reduce((sum, entry) => sum + entry.mood, 0) / secondHalf.length

      return Number((secondAvg - firstAvg).toFixed(1))
    }

    // Get recent data
    const now = new Date()
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    const weekData = history.filter((entry) => new Date(entry.timestamp) >= oneWeekAgo)
    const dayData = history.filter((entry) => new Date(entry.timestamp) >= oneDayAgo)

    setMoodTrends({
      overall: calculateTrend(history),
      weekly: calculateTrend(weekData),
      daily: calculateTrend(dayData),
    })

    // Analyze activity effectiveness
    const activityStats: Record<string, { count: number; totalMoodBefore: number; totalMoodAfter: number }> = {}

    // In a real app, you would have before/after mood data for activities
    // For demo, we'll simulate this
    history.forEach((entry, index) => {
      if (entry.activities && Array.isArray(entry.activities)) {
        entry.activities.forEach((activity: string) => {
          if (!activityStats[activity]) {
            activityStats[activity] = { count: 0, totalMoodBefore: 0, totalMoodAfter: 0 }
          }

          activityStats[activity].count++

          // Simulate before/after mood
          const moodBefore = Math.max(1, entry.mood - Math.random() * 2)
          activityStats[activity].totalMoodBefore += moodBefore
          activityStats[activity].totalMoodAfter += entry.mood
        })
      }
    })

    // Calculate effectiveness
    const effectiveness = Object.entries(activityStats)
      .filter(([_, stats]) => stats.count >= 3) // At least 3 data points
      .map(([activity, stats]) => {
        const avgBefore = stats.totalMoodBefore / stats.count
        const avgAfter = stats.totalMoodAfter / stats.count
        const improvement = avgAfter - avgBefore

        return {
          activity,
          count: stats.count,
          improvement: Number(improvement.toFixed(1)),
          effective: improvement > 0.5,
        }
      })
      .sort((a, b) => b.improvement - a.improvement)

    setActivityEffectiveness(effectiveness)

    // Generate recommendations
    const generateRecommendations = () => {
      const recs = []

      // Most effective activities
      const topActivities = effectiveness
        .filter((item) => item.effective)
        .slice(0, 3)
        .map((item) => item.activity)

      if (topActivities.length > 0) {
        recs.push({
          type: "continue",
          title: "Continue these effective activities",
          items: topActivities,
          icon: ThumbsUp,
        })
      }

      // Time-based recommendations
      const morningMoods = history.filter((entry) => {
        const hour = new Date(entry.timestamp).getHours()
        return hour >= 5 && hour < 12
      })

      const eveningMoods = history.filter((entry) => {
        const hour = new Date(entry.timestamp).getHours()
        return hour >= 18 && hour < 24
      })

      const avgMorningMood = morningMoods.reduce((sum, entry) => sum + entry.mood, 0) / (morningMoods.length || 1)
      const avgEveningMood = eveningMoods.reduce((sum, entry) => sum + entry.mood, 0) / (eveningMoods.length || 1)

      if (avgMorningMood < 5) {
        recs.push({
          type: "time",
          title: "Improve your morning routine",
          items: ["Morning meditation", "Energizing music", "Light exercise"],
          icon: Clock,
        })
      }

      if (avgEveningMood < 5) {
        recs.push({
          type: "time",
          title: "Enhance your evening wind-down",
          items: ["Reading before bed", "Calming music", "Gratitude journaling"],
          icon: Clock,
        })
      }

      // Add general recommendation
      recs.push({
        type: "general",
        title: "Try these mood-boosting activities",
        items: ["Regular exercise", "Nature walks", "Social connections", "Creative expression"],
        icon: Zap,
      })

      return recs
    }

    setRecommendations(generateRecommendations())
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Comprehensive Mood Analysis</CardTitle>
          <CardDescription>Insights and patterns based on your mood tracking history</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="trends">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="trends">Mood Trends</TabsTrigger>
              <TabsTrigger value="activities">Activity Impact</TabsTrigger>
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            </TabsList>

            <TabsContent value="trends">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Overall Trend</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold">
                          {moodTrends.overall > 0 ? "+" : ""}
                          {moodTrends.overall}
                        </div>
                        <div>
                          {moodTrends.overall > 0 ? (
                            <TrendingUp className="h-8 w-8 text-green-500" />
                          ) : moodTrends.overall < 0 ? (
                            <TrendingDown className="h-8 w-8 text-red-500" />
                          ) : (
                            <div className="h-8 w-8 rounded-full border-2 border-gray-300"></div>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        {moodTrends.overall > 0
                          ? "Your mood has been improving over time"
                          : moodTrends.overall < 0
                            ? "Your mood has been declining over time"
                            : "Your mood has been stable over time"}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Weekly Trend</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold">
                          {moodTrends.weekly > 0 ? "+" : ""}
                          {moodTrends.weekly}
                        </div>
                        <div>
                          {moodTrends.weekly > 0 ? (
                            <TrendingUp className="h-8 w-8 text-green-500" />
                          ) : moodTrends.weekly < 0 ? (
                            <TrendingDown className="h-8 w-8 text-red-500" />
                          ) : (
                            <div className="h-8 w-8 rounded-full border-2 border-gray-300"></div>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        {moodTrends.weekly > 0
                          ? "Your mood has improved this week"
                          : moodTrends.weekly < 0
                            ? "Your mood has declined this week"
                            : "Your mood has been stable this week"}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Daily Trend</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold">
                          {moodTrends.daily > 0 ? "+" : ""}
                          {moodTrends.daily}
                        </div>
                        <div>
                          {moodTrends.daily > 0 ? (
                            <TrendingUp className="h-8 w-8 text-green-500" />
                          ) : moodTrends.daily < 0 ? (
                            <TrendingDown className="h-8 w-8 text-red-500" />
                          ) : (
                            <div className="h-8 w-8 rounded-full border-2 border-gray-300"></div>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        {moodTrends.daily > 0
                          ? "Your mood has improved today"
                          : moodTrends.daily < 0
                            ? "Your mood has declined today"
                            : "Your mood has been stable today"}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Mood Trend Chart</CardTitle>
                    <CardDescription>Visual representation of your mood over the last 30 days</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={moodHistory.slice(-30).map(entry => ({
                          date: new Date(entry.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                          mood: entry.mood
                        }))}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis dataKey="date" stroke="#6b7280" />
                          <YAxis domain={[0, 10]} stroke="#6b7280" />
                          <Tooltip />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="mood" 
                            stroke="#10b981" 
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                            name="Mood Score"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Mood Patterns</CardTitle>
                    <CardDescription>Insights about when you feel your best and worst</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                        <h3 className="font-medium flex items-center text-blue-800 mb-2">
                          <Clock className="h-4 w-4 mr-2" />
                          Time of Day Impact
                        </h3>
                        <p className="text-sm text-blue-700">
                          You tend to feel best in the afternoon (12PM-5PM) with an average mood of 7.2/10. Mornings
                          (5AM-12PM) show an average mood of 5.8/10, while evenings (5PM-12AM) average 6.3/10.
                        </p>
                      </div>

                      <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                        <h3 className="font-medium flex items-center text-green-800 mb-2">
                          <Calendar className="h-4 w-4 mr-2" />
                          Day of Week Patterns
                        </h3>
                        <p className="text-sm text-green-700">
                          Your mood tends to be highest on Saturdays (7.5/10) and lowest on Mondays (5.4/10). Weekends
                          generally show a 1.8 point improvement over weekdays.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="activities">
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Activity Effectiveness</CardTitle>
                    <CardDescription>How different activities impact your mood</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {activityEffectiveness.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${item.effective ? "bg-green-100" : "bg-gray-100"}`}>
                              <Activity className={`h-5 w-5 ${item.effective ? "text-green-600" : "text-gray-500"}`} />
                            </div>
                            <div>
                              <div className="font-medium">{item.activity}</div>
                              <div className="text-sm text-gray-500">Used {item.count} times</div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            <Badge variant={item.effective ? "default" : "secondary"}>
                              {item.improvement > 0 ? "+" : ""}
                              {item.improvement} mood points
                            </Badge>
                            <span className="text-xs text-gray-500 mt-1">
                              {item.effective ? "Effective" : "Minimal impact"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Music Impact</CardTitle>
                    <CardDescription>How different music affects your mood</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                        <h3 className="font-medium flex items-center text-purple-800 mb-2">
                          <Music className="h-4 w-4 mr-2" />
                          Most Effective Genres
                        </h3>
                        <div className="grid grid-cols-2 gap-2 mt-3">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm">Classical (+1.8 points)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm">Jazz (+1.5 points)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm">Pop (+1.2 points)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm">Ambient (+1.0 points)</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="recommendations">
              <div className="space-y-4">
                {recommendations.map((rec, index) => (
                  <Card
                    key={index}
                    className={`
                    ${
                      rec.type === "continue"
                        ? "border-green-200 bg-green-50"
                        : rec.type === "time"
                          ? "border-blue-200 bg-blue-50"
                          : "border-purple-200 bg-purple-50"
                    }
                  `}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle
                        className={`text-lg flex items-center gap-2 
                        ${
                          rec.type === "continue"
                            ? "text-green-800"
                            : rec.type === "time"
                              ? "text-blue-800"
                              : "text-purple-800"
                        }
                      `}
                      >
                        <rec.icon
                          className={`h-5 w-5 
                          ${
                            rec.type === "continue"
                              ? "text-green-600"
                              : rec.type === "time"
                                ? "text-blue-600"
                                : "text-purple-600"
                          }
                        `}
                        />
                        {rec.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul
                        className={`space-y-2 
                        ${
                          rec.type === "continue"
                            ? "text-green-700"
                            : rec.type === "time"
                              ? "text-blue-700"
                              : "text-purple-700"
                        }
                      `}
                      >
                        {rec.items.map((item, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <CheckCircle
                              className={`h-4 w-4 
                              ${
                                rec.type === "continue"
                                  ? "text-green-600"
                                  : rec.type === "time"
                                    ? "text-blue-600"
                                    : "text-purple-600"
                              }
                            `}
                            />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}

                <div className="flex justify-center mt-4">
                  <Button className="bg-teal-600 hover:bg-teal-700">Generate Custom Plan</Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
