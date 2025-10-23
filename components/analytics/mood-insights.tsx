"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { TrendingUp, TrendingDown, Clock, Music, Activity, AlertCircle } from "lucide-react"

interface MoodInsightsProps {
  data: any[]
}

export default function MoodInsights({ data }: MoodInsightsProps) {
  // Generate insights based on the data
  const generateInsights = () => {
    if (data.length < 5) {
      return {
        hasEnoughData: false,
        insights: [],
      }
    }

    const insights = []

    // Calculate average mood
    const totalMood = data.reduce((sum, entry) => sum + entry.mood, 0)
    const avgMood = totalMood / data.length

    // Find best and worst times
    const timeMap: Record<string, { count: number; totalMood: number }> = {}
    data.forEach((entry) => {
      const date = new Date(entry.timestamp)
      const hour = date.getHours()
      const timeBlock = Math.floor(hour / 4) // 6 blocks of 4 hours

      if (!timeMap[timeBlock]) {
        timeMap[timeBlock] = { count: 0, totalMood: 0 }
      }
      timeMap[timeBlock].count++
      timeMap[timeBlock].totalMood += entry.mood
    })

    const timeBlocks = Object.entries(timeMap).map(([block, stats]) => ({
      block: Number.parseInt(block),
      avgMood: stats.totalMood / stats.count,
    }))

    const bestTimeBlock = timeBlocks.reduce((best, current) => (current.avgMood > best.avgMood ? current : best), {
      block: 0,
      avgMood: 0,
    })

    const worstTimeBlock = timeBlocks.reduce(
      (worst, current) => (current.avgMood < worst.avgMood || worst.avgMood === 0 ? current : worst),
      { block: 0, avgMood: 10 },
    )

    const getTimeBlockName = (block: number) => {
      const blockNames = [
        "Early morning (12AM-4AM)",
        "Morning (4AM-8AM)",
        "Late morning (8AM-12PM)",
        "Afternoon (12PM-4PM)",
        "Evening (4PM-8PM)",
        "Night (8PM-12AM)",
      ]
      return blockNames[block]
    }

    // Find mood trend
    const sortedData = [...data].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

    const firstHalf = sortedData.slice(0, Math.floor(sortedData.length / 2))
    const secondHalf = sortedData.slice(Math.floor(sortedData.length / 2))

    const firstHalfAvg = firstHalf.reduce((sum, entry) => sum + entry.mood, 0) / firstHalf.length
    const secondHalfAvg = secondHalf.reduce((sum, entry) => sum + entry.mood, 0) / secondHalf.length

    const moodTrend = secondHalfAvg - firstHalfAvg

    // Find best activity
    const activitiesMap: Record<string, { count: number; totalMood: number }> = {}
    data.forEach((entry) => {
      if (entry.activities && Array.isArray(entry.activities)) {
        entry.activities.forEach((activity: string) => {
          if (!activitiesMap[activity]) {
            activitiesMap[activity] = { count: 0, totalMood: 0 }
          }
          activitiesMap[activity].count++
          activitiesMap[activity].totalMood += entry.mood
        })
      }
    })

    const activities = Object.entries(activitiesMap)
      .filter(([_, stats]) => stats.count >= 3) // At least 3 entries
      .map(([activity, stats]) => ({
        name: activity,
        avgMood: stats.totalMood / stats.count,
        count: stats.count,
      }))

    const bestActivity =
      activities.length > 0
        ? activities.reduce((best, current) => (current.avgMood > best.avgMood ? current : best), {
            name: "",
            avgMood: 0,
            count: 0,
          })
        : null

    // Find best music genre
    const musicMap: Record<string, { count: number; totalMood: number }> = {}
    data.forEach((entry) => {
      if (entry.music) {
        if (!musicMap[entry.music]) {
          musicMap[entry.music] = { count: 0, totalMood: 0 }
        }
        musicMap[entry.music].count++
        musicMap[entry.music].totalMood += entry.mood
      }
    })

    const genres = Object.entries(musicMap)
      .filter(([_, stats]) => stats.count >= 3) // At least 3 entries
      .map(([genre, stats]) => ({
        name: genre,
        avgMood: stats.totalMood / stats.count,
        count: stats.count,
      }))

    const bestGenre =
      genres.length > 0
        ? genres.reduce((best, current) => (current.avgMood > best.avgMood ? current : best), {
            name: "",
            avgMood: 0,
            count: 0,
          })
        : null

    // Generate insight cards
    if (moodTrend > 0.5) {
      insights.push({
        title: "Your mood is improving!",
        description: `Your average mood has increased by ${moodTrend.toFixed(1)} points recently.`,
        icon: TrendingUp,
        color: "text-green-500",
      })
    } else if (moodTrend < -0.5) {
      insights.push({
        title: "Your mood has been declining",
        description: `Your average mood has decreased by ${Math.abs(moodTrend).toFixed(1)} points recently.`,
        icon: TrendingDown,
        color: "text-red-500",
      })
    }

    if (bestTimeBlock.avgMood > avgMood + 1) {
      insights.push({
        title: "Your best time of day",
        description: `You tend to feel best during ${getTimeBlockName(bestTimeBlock.block)} with an average mood of ${bestTimeBlock.avgMood.toFixed(1)}.`,
        icon: Clock,
        color: "text-blue-500",
      })
    }

    if (worstTimeBlock.avgMood < avgMood - 1) {
      insights.push({
        title: "Your challenging time of day",
        description: `You tend to feel lower during ${getTimeBlockName(worstTimeBlock.block)} with an average mood of ${worstTimeBlock.avgMood.toFixed(1)}.`,
        icon: Clock,
        color: "text-amber-500",
      })
    }

    if (bestActivity && bestActivity.avgMood > avgMood + 0.5) {
      insights.push({
        title: "Activity that boosts your mood",
        description: `${bestActivity.name} seems to improve your mood with an average rating of ${bestActivity.avgMood.toFixed(1)}.`,
        icon: Activity,
        color: "text-emerald-500",
      })
    }

    if (bestGenre && bestGenre.avgMood > avgMood + 0.5) {
      insights.push({
        title: "Music that elevates your mood",
        description: `${bestGenre.name} music correlates with your higher mood scores (${bestGenre.avgMood.toFixed(1)} average).`,
        icon: Music,
        color: "text-purple-500",
      })
    }

    return {
      hasEnoughData: true,
      insights,
    }
  }

  const { hasEnoughData, insights } = generateInsights()

  if (!hasEnoughData) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Not enough data</AlertTitle>
        <AlertDescription>Track your mood for a few more days to see personalized insights.</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {insights.length > 0 ? (
        insights.map((insight, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center gap-2">
              <div className={`${insight.color} p-2 rounded-full bg-opacity-10`}>
                <insight.icon className={`h-5 w-5 ${insight.color}`} />
              </div>
              <CardTitle className="text-lg">{insight.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm text-gray-700">{insight.description}</CardDescription>
            </CardContent>
          </Card>
        ))
      ) : (
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>No significant patterns yet</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>Continue tracking your mood to discover meaningful patterns and insights.</CardDescription>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
