"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles } from "lucide-react"

interface JournalAIInsightsProps {
  insights: string[]
}

export default function JournalAIInsights({ insights }: JournalAIInsightsProps) {
  return (
    <Card className="bg-blue-50 border-blue-100">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-blue-800">
          <Sparkles className="h-5 w-5 mr-2 text-blue-600" />
          AI Insights
        </CardTitle>
        <CardDescription className="text-blue-700">
          Personalized observations based on your journal entry
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {insights.map((insight, index) => (
            <li key={index} className="flex items-start gap-2 text-blue-800">
              <div className="h-5 w-5 flex items-center justify-center rounded-full bg-blue-200 text-blue-700 flex-shrink-0 mt-0.5">
                {index + 1}
              </div>
              <span>{insight}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
