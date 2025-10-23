"use client"

import { Line, LineChart, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface MoodTrendsChartProps {
  data: any[]
  timeRange: string
}

export default function MoodTrendsChart({ data, timeRange }: MoodTrendsChartProps) {
  // Process data for the chart
  const processData = () => {
    // Group by date
    const groupedByDate = data.reduce((acc: any, entry: any) => {
      const date = new Date(entry.timestamp)
      const dateStr = date.toISOString().split("T")[0]

      if (!acc[dateStr]) {
        acc[dateStr] = {
          date: dateStr,
          moods: [],
          avgMood: 0,
        }
      }

      acc[dateStr].moods.push(entry.mood)
      return acc
    }, {})

    // Calculate average mood for each day
    const result = Object.values(groupedByDate).map((day: any) => {
      const sum = day.moods.reduce((a: number, b: number) => a + b, 0)
      day.avgMood = sum / day.moods.length
      return {
        date: day.date,
        avgMood: Number.parseFloat(day.avgMood.toFixed(1)),
        entries: day.moods.length,
      }
    })

    // Sort by date
    return result.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }

  const chartData = processData()

  // Format date based on time range
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    if (timeRange === "week") {
      return date.toLocaleDateString(undefined, { weekday: "short" })
    } else if (timeRange === "month") {
      return date.toLocaleDateString(undefined, { month: "short", day: "numeric" })
    } else {
      return date.toLocaleDateString(undefined, { month: "short", year: "2-digit" })
    }
  }

  return (
    <ChartContainer
      config={{
        avgMood: {
          label: "Average Mood",
          color: "hsl(var(--chart-1))",
        },
      }}
      className="h-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 12 }} />
          <YAxis
            domain={[0, 10]}
            ticks={[0, 2, 4, 6, 8, 10]}
            tick={{ fontSize: 12 }}
            label={{ value: "Mood Score", angle: -90, position: "insideLeft", style: { textAnchor: "middle" } }}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Legend />
          <Line
            type="monotone"
            dataKey="avgMood"
            stroke="var(--color-avgMood)"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
            name="Average Mood"
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
