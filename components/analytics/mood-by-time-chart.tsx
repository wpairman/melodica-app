"use client"

import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface MoodByTimeChartProps {
  data: any[]
}

export default function MoodByTimeChart({ data }: MoodByTimeChartProps) {
  // Process data for the chart
  const processData = () => {
    // Define time blocks
    const timeBlocks = [
      { name: "Early Morning", start: 5, end: 8, count: 0, totalMood: 0 },
      { name: "Morning", start: 8, end: 12, count: 0, totalMood: 0 },
      { name: "Afternoon", start: 12, end: 17, count: 0, totalMood: 0 },
      { name: "Evening", start: 17, end: 21, count: 0, totalMood: 0 },
      { name: "Night", start: 21, end: 24, count: 0, totalMood: 0 },
      { name: "Late Night", start: 0, end: 5, count: 0, totalMood: 0 },
    ]

    // Group data by time blocks
    data.forEach((entry) => {
      const date = new Date(entry.timestamp)
      const hour = date.getHours()

      const timeBlock = timeBlocks.find(
        (block) =>
          (block.start <= hour && hour < block.end) ||
          (block.start > block.end && (hour >= block.start || hour < block.end)),
      )

      if (timeBlock) {
        timeBlock.count++
        timeBlock.totalMood += entry.mood
      }
    })

    // Calculate average mood for each time block
    return timeBlocks.map((block) => ({
      name: block.name,
      avgMood: block.count > 0 ? Number.parseFloat((block.totalMood / block.count).toFixed(1)) : 0,
      entries: block.count,
    }))
  }

  const chartData = processData()

  return (
    <ChartContainer
      config={{
        avgMood: {
          label: "Average Mood",
          color: "hsl(var(--chart-2))",
        },
      }}
      className="h-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis
            domain={[0, 10]}
            ticks={[0, 2, 4, 6, 8, 10]}
            tick={{ fontSize: 12 }}
            label={{ value: "Mood Score", angle: -90, position: "insideLeft", style: { textAnchor: "middle" } }}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Legend />
          <Bar dataKey="avgMood" fill="var(--color-avgMood)" name="Average Mood" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
