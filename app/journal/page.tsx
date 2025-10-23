"use client"

import { useState, useEffect } from "react"

// Force dynamic rendering to avoid SSR issues with event handlers
export const dynamic = 'force-dynamic'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Plus, Music, Calendar, Edit, Trash2, MessageSquare, Sparkles } from "lucide-react"
import DashboardLayout from "@/components/layouts/dashboard-layout"
import JournalEntry from "@/components/journal/journal-entry"
import JournalAIInsights from "@/components/journal/journal-ai-insights"

export default function JournalPage() {
  const [entries, setEntries] = useState<any[]>([])
  const [isWriting, setIsWriting] = useState(false)
  const [newEntry, setNewEntry] = useState({
    title: "",
    content: "",
    mood: 0,
    music: "",
    date: new Date().toISOString(),
  })
  const [selectedEntry, setSelectedEntry] = useState<any>(null)

  useEffect(() => {
    // In a real app, you would fetch this from an API (client-side only)
    if (typeof window !== 'undefined') {
      const storedEntries = localStorage.getItem("journalEntries")

      if (storedEntries) {
        setEntries(JSON.parse(storedEntries))
      } else {
        // Generate sample entries for demo
        const sampleEntries = generateSampleEntries()
        setEntries(sampleEntries)
        localStorage.setItem("journalEntries", JSON.stringify(sampleEntries))
      }
    }
  }, [])

  const generateSampleEntries = () => {
    return [
      {
        id: "entry-1",
        title: "Finding balance",
        content:
          "Today was challenging but I managed to find moments of peace. The morning meditation helped center me before my busy workday. I'm learning that taking small breaks throughout the day makes a big difference in my overall mood.",
        mood: 7,
        music: "Ambient Piano",
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        aiInsights: [
          "You seem to be developing positive coping strategies",
          "Morning routines appear to have a positive impact on your day",
          "Consider scheduling regular short breaks throughout your workday",
        ],
      },
      {
        id: "entry-2",
        title: "Stress and music",
        content:
          "Work was overwhelming today. I felt anxious most of the afternoon, but listening to my favorite playlist during my commute home helped me decompress. I need to remember that music is a powerful tool for managing my emotions.",
        mood: 4,
        music: "Indie Rock",
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        aiInsights: [
          "Music appears to be an effective stress management tool for you",
          "Consider creating specific playlists for different emotional states",
          "Your awareness of emotional triggers is developing well",
        ],
      },
    ]
  }

  const handleNewEntryChange = (field: string, value: string | number) => {
    setNewEntry({
      ...newEntry,
      [field]: value,
    })
  }

  const saveEntry = () => {
    if (!newEntry.title || !newEntry.content) return

    // Get current mood from localStorage (client-side only)
    let currentMood = 5 // Default to neutral
    if (typeof window !== 'undefined') {
      const storedHistory = localStorage.getItem("moodHistory")
      if (storedHistory) {
        const history = JSON.parse(storedHistory)
        if (history.length > 0) {
          currentMood = history[history.length - 1].mood
        }
      }
    }

    const entry = {
      id: `entry-${Date.now()}`,
      title: newEntry.title,
      content: newEntry.content,
      mood: currentMood,
      music: newEntry.music || "Not specified",
      date: new Date().toISOString(),
      aiInsights: generateAIInsights(newEntry.content),
    }

    const updatedEntries = [entry, ...entries]
    setEntries(updatedEntries)
    // Save to localStorage (client-side only)
    if (typeof window !== 'undefined') {
      localStorage.setItem("journalEntries", JSON.stringify(updatedEntries))
    }

    setNewEntry({
      title: "",
      content: "",
      mood: 0,
      music: "",
      date: new Date().toISOString(),
    })

    setIsWriting(false)
  }

  const deleteEntry = (id: string) => {
    const updatedEntries = entries.filter((entry) => entry.id !== id)
    setEntries(updatedEntries)
    // Save to localStorage (client-side only)
    if (typeof window !== 'undefined') {
      localStorage.setItem("journalEntries", JSON.stringify(updatedEntries))
    }

    if (selectedEntry && selectedEntry.id === id) {
      setSelectedEntry(null)
    }
  }

  const generateAIInsights = (content: string) => {
    // In a real app, this would call an AI API
    // For demo purposes, we'll return some generic insights
    const insights = [
      "Your writing shows a thoughtful reflection on your experiences",
      "Consider how music might enhance your emotional awareness",
      "Regular journaling can help identify patterns in your mood over time",
    ]

    // Add some randomness
    const randomInsight = [
      "Try connecting your current feelings with past experiences",
      "Your emotional vocabulary is developing well",
      "Consider exploring how different activities affect your mood",
      "Noticing the connection between your thoughts and feelings is valuable",
      "Your self-awareness appears to be growing through journaling",
    ]

    return [...insights, randomInsight[Math.floor(Math.random() * randomInsight.length)]]
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Music Journal</h1>
            <p className="text-gray-500">Reflect on your feelings while listening to music</p>
          </div>

          {!isWriting && !selectedEntry && (
            <Button onClick={() => {
              if (typeof window !== 'undefined') {
                setIsWriting(true)
              }
            }}>
              <Plus className="h-4 w-4 mr-2" />
              New Entry
            </Button>
          )}
        </div>

        {isWriting ? (
          <Card>
            <CardHeader>
              <CardTitle>New Journal Entry</CardTitle>
              <CardDescription>
                Write about your thoughts, feelings, and the music that resonates with you today
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Input
                  placeholder="Entry title"
                  value={newEntry.title}
                  onChange={(e) => handleNewEntryChange("title", e.target.value)}
                  className="text-lg font-medium"
                />
              </div>
              <div>
                <Textarea
                  placeholder="What's on your mind today? How are you feeling? What music speaks to you right now?"
                  value={newEntry.content}
                  onChange={(e) => handleNewEntryChange("content", e.target.value)}
                  className="min-h-[200px]"
                />
              </div>
              <div>
                <Input
                  placeholder="What music are you listening to? (optional)"
                  value={newEntry.music}
                  onChange={(e) => handleNewEntryChange("music", e.target.value)}
                  className="text-sm"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => {
                if (typeof window !== 'undefined') {
                  setIsWriting(false)
                }
              }}>
                Cancel
              </Button>
              <Button onClick={() => {
                if (typeof window !== 'undefined') {
                  saveEntry()
                }
              }}>Save Entry</Button>
            </CardFooter>
          </Card>
        ) : selectedEntry ? (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => {
                if (typeof window !== 'undefined') {
                  setSelectedEntry(null)
                }
              }}>
                Back to all entries
              </Button>
              <div className="ml-auto flex gap-2">
                <Button variant="outline" size="sm" className="h-8">
                  <Edit className="h-3.5 w-3.5 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-red-500 hover:text-red-600"
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      deleteEntry(selectedEntry.id)
                    }
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                  Delete
                </Button>
              </div>
            </div>

            <JournalEntry entry={selectedEntry} />

            <JournalAIInsights insights={selectedEntry.aiInsights} />
          </div>
        ) : (
          <div className="space-y-6">
            <Tabs defaultValue="recent">
              <TabsList>
                <TabsTrigger value="recent">
                  <Calendar className="h-4 w-4 mr-2" />
                  Recent
                </TabsTrigger>
                <TabsTrigger value="insights">
                  <Sparkles className="h-4 w-4 mr-2" />
                  AI Insights
                </TabsTrigger>
              </TabsList>

              <TabsContent value="recent" className="mt-6">
                <div className="grid gap-4">
                  {entries.length > 0 ? (
                    entries.map((entry) => (
                      <Card
                        key={entry.id}
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => {
                          if (typeof window !== 'undefined') {
                            setSelectedEntry(entry)
                          }
                        }}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle>{entry.title}</CardTitle>
                            <Badge
                              variant={entry.mood >= 7 ? "default" : entry.mood >= 4 ? "secondary" : "destructive"}
                            >
                              Mood: {entry.mood}/10
                            </Badge>
                          </div>
                          <CardDescription>
                            {new Date(entry.date).toLocaleDateString()} • {entry.music}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="line-clamp-2 text-sm text-gray-500">{entry.content}</p>
                        </CardContent>
                        <CardFooter className="pt-0">
                          <div className="flex items-center text-xs text-gray-500">
                            <MessageSquare className="h-3 w-3 mr-1" />
                            {entry.content.split(" ").length} words
                            <Music className="h-3 w-3 ml-3 mr-1" />
                            {entry.music}
                          </div>
                        </CardFooter>
                      </Card>
                    ))
                  ) : (
                    <Card>
                      <CardHeader>
                        <CardTitle>No journal entries yet</CardTitle>
                        <CardDescription>Start writing to track your mood and thoughts alongside music</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button onClick={() => {
                          if (typeof window !== 'undefined') {
                            setIsWriting(true)
                          }
                        }}>
                          <BookOpen className="h-4 w-4 mr-2" />
                          Create your first entry
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="insights" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Journal Insights</CardTitle>
                    <CardDescription>AI-powered analysis of your journal entries and mood patterns</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded-lg bg-blue-50 p-4 border border-blue-100">
                      <h3 className="font-medium flex items-center text-blue-800">
                        <Sparkles className="h-4 w-4 mr-2 text-blue-800" />
                        Mood Trends
                      </h3>
                      <p className="text-sm text-gray-600">Analyze your mood patterns over time</p>
                    </div>
                    <div className="rounded-lg bg-green-50 p-4 border border-green-100">
                      <h3 className="font-medium flex items-center text-green-800">
                        <Calendar className="h-4 w-4 mr-2 text-green-800" />
                        Time of Day Analysis
                      </h3>
                      <p className="text-sm text-gray-600">Identify when you feel best/worst during the day</p>
                    </div>
                    <div className="rounded-lg bg-yellow-50 p-4 border border-yellow-100">
                      <h3 className="font-medium flex items-center text-yellow-800">
                        <Music className="h-4 w-4 mr-2 text-yellow-800" />
                        Music and Mood Correlation
                      </h3>
                      <p className="text-sm text-gray-600">Explore how different music affects your mood</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
