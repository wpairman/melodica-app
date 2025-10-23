"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Music } from "lucide-react"

interface JournalEntryProps {
  entry: {
    id: string
    title: string
    content: string
    mood: number
    music: string
    date: string
  }
}

export default function JournalEntry({ entry }: JournalEntryProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">{entry.title}</CardTitle>
          <Badge variant={entry.mood >= 7 ? "default" : entry.mood >= 4 ? "secondary" : "destructive"}>
            Mood: {entry.mood}/10
          </Badge>
        </div>
        <CardDescription className="flex items-center gap-4">
          <span className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            {new Date(entry.date).toLocaleDateString()}
          </span>
          <span className="flex items-center">
            <Music className="h-4 w-4 mr-1" />
            {entry.music}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="prose max-w-none">
          {entry.content.split("\n").map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
