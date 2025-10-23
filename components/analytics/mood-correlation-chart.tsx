"use client"

import { useState } from "react"
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface MoodCorrelationChartProps {
  data: any[]
}

export default function MoodCorrelationChart({ data }: MoodCorrelationChartProps) {
  const [correlationType, setCorrelationType] = useState<"activities" | "music">("activities")

  // Process data for activities correlation
  const processActivitiesData = () => {
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

    return Object.entries(activitiesMap)
      .map(([activity, stats]) => ({
        name: activity,
        avgMood: Number.parseFloat((stats.totalMood / stats.count).toFixed(1)),
        entries: stats.count,
      }))
      .sort((a, b) => b.avgMood - a.avgMood)
      .slice(0, 10) // Top 10 activities
  }

  // Process data for music correlation
  const processMusicData = () => {
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

    return Object.entries(musicMap)
      .map(([genre, stats]) => ({
        name: genre,
        avgMood: Number.parseFloat((stats.totalMood / stats.count).toFixed(1)),
        entries: stats.count,
      }))
      .sort((a, b) => b.avgMood - a.avgMood)
      .slice(0, 10) // Top 10 genres
  }

  const activitiesData = processActivitiesData()
  const musicData = processMusicData()

  const chartData = correlationType === "activities" ? activitiesData : musicData

  return (
    <div className="space-y-4">
      <Tabs value={correlationType} onValueChange={(value) => setCorrelationType(value as "activities" | "music")}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="activities">Activities</TabsTrigger>
          <TabsTrigger value="music">Music Genres</TabsTrigger>
        </TabsList>
      </Tabs>

      <ChartContainer
        config={{
          avgMood: {
            label: "Average Mood",
            color: correlationType === "activities" ? "hsl(var(--chart-3))" : "hsl(var(--chart-4))",
          },
        }}
        className="h-[320px]"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 20, right: 30, left: 100, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={100} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Legend />
            <Bar dataKey="avgMood" fill="var(--color-avgMood)" name="Average Mood" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  )
}
