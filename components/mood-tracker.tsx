"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, ArrowUpDown } from "lucide-react"
import RewardsSystem from "./rewards-system"
import VirtualGarden from "./virtual-garden"

interface MoodTrackerProps {
  userData: {
    name: string
    email: string
    favoriteArtists: string
    favoriteActivities: string
  }
}

export default function MoodTracker({ userData }: MoodTrackerProps) {
  const { toast } = useToast()
  const [selectedMood, setSelectedMood] = useState<number | null>(null)
  const [showFollowUp, setShowFollowUp] = useState(false)
  const [followUpResponse, setFollowUpResponse] = useState("")
  const [moodHistory, setMoodHistory] = useState<Array<{ mood: number; timestamp: Date; notes?: string }>>([])
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest")

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedHistory = localStorage.getItem("moodHistory")
      if (storedHistory) {
        try {
          const parsedHistory = JSON.parse(storedHistory)
          const historyWithDates = parsedHistory.map((entry: any) => ({
            ...entry,
            timestamp: new Date(entry.timestamp)
          }))
          setMoodHistory(historyWithDates)
        } catch (error) {
          console.error("Error parsing mood history:", error)
          setMoodHistory([])
        }
      }
    }
  }, [])

  const handleMoodSelection = (mood: number) => {
    setSelectedMood(mood)
    if (mood < 4) {
      setShowFollowUp(true)
    } else {
      saveMoodEntry(mood)
    }
  }

  const handleFollowUpSubmit = () => {
    if (selectedMood !== null) {
      saveMoodEntry(selectedMood, followUpResponse)
    }
    setShowFollowUp(false)
    setFollowUpResponse("")
  }

  const saveMoodEntry = (mood: number, notes?: string) => {
    const newEntry = { mood, timestamp: new Date(), notes }
    const updatedHistory = [...moodHistory, newEntry]
    setMoodHistory(updatedHistory)

    if (typeof window !== 'undefined') {
      localStorage.setItem("moodHistory", JSON.stringify(updatedHistory))
    }

    if (updatedHistory.length === 1) {
      toast({ title: "🌱 First seed planted!", description: "Your emotional garden has begun to grow." })
    } else if (updatedHistory.length === 7) {
      toast({ title: "🌸 Your garden is blossoming!", description: "7 days of consistent care has made your garden bloom beautifully." })
    } else if (updatedHistory.length === 30) {
      toast({ title: "✨ Reflective sanctuary unlocked!", description: "Your garden has become a sacred space for reflection and growth." })
    } else {
      toast({ title: "🌿 New plant added!", description: "Your mood has been saved and your garden grows stronger." })
    }

    setSelectedMood(null)
  }

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "newest" ? "oldest" : "newest")
  }

  const getSortedMoodHistory = () => {
    return [...moodHistory].sort((a, b) => {
      const dateA = new Date(a.timestamp).getTime()
      const dateB = new Date(b.timestamp).getTime()
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB
    })
  }

  const formatDate = (dateString: Date) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(undefined, {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    })
  }

  const formatTime = (dateString: Date) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
  }

  const getMoodCategory = (mood: number) => {
    if (mood <= 3) return "Low mood"
    if (mood <= 6) return "Neutral mood"
    return "Positive mood"
  }

  const getMoodColor = (mood: number) => {
    if (mood <= 3) return "bg-red-900 text-red-300"
    if (mood <= 6) return "bg-yellow-900 text-yellow-300"
    return "bg-green-900 text-green-300"
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-white">How are you feeling right now?</CardTitle>
          <CardDescription className="text-gray-300">Rate your current mood on a scale from 1 to 10</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
              <Button
                key={num}
                variant={selectedMood === num ? "default" : "outline"}
                className={`h-12 w-full ${
                  num <= 3
                    ? "border-red-700 bg-red-900 text-red-300 hover:bg-red-800"
                    : num <= 6
                      ? "border-yellow-700 bg-yellow-900 text-yellow-300 hover:bg-yellow-800"
                      : "border-green-700 bg-green-900 text-green-300 hover:bg-green-800"
                } ${selectedMood === num ? "ring-2 ring-offset-2" : ""}`}
                onClick={() => handleMoodSelection(num)}
              >
                {num}
              </Button>
            ))}
          </div>
          <div className="mt-4 flex justify-between text-sm text-gray-400">
            <span>Very low</span>
            <span>Neutral</span>
            <span>Excellent</span>
          </div>
        </CardContent>
      </Card>

      {showFollowUp && (
        <Card>
          <CardHeader>
            <CardTitle className="text-white">Would you like to share what's bothering you?</CardTitle>
            <CardDescription className="text-gray-300">
              It can help to talk about what's on your mind. This information is private and only used to provide better recommendations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Share your thoughts here..."
              value={followUpResponse}
              onChange={(e) => setFollowUpResponse(e.target.value)}
              className="min-h-[100px] bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
            />
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button onClick={handleFollowUpSubmit} className="w-full bg-teal-600 hover:bg-teal-700 text-white">
              Submit
            </Button>
            <div className="text-center text-sm">
              <p className="text-gray-400">Consider talking to someone you trust about how you're feeling.</p>
              <p className="mt-2">
                <a href="https://www.988lifeline.org/" target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:underline">
                  988 Suicide & Crisis Lifeline
                </a>
                {" • "}
                <a href="https://www.crisistextline.org/" target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:underline">
                  Crisis Text Line: Text HOME to 741741
                </a>
              </p>
            </div>
          </CardFooter>
        </Card>
      )}

      <VirtualGarden moodHistory={moodHistory} />

      <RewardsSystem
        moodHistory={moodHistory}
        onAchievementEarned={(achievement) => {
          console.log("Achievement earned:", achievement)
        }}
      />

      {moodHistory.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-white">Your Complete Mood History</CardTitle>
                <CardDescription className="text-gray-300">All your mood entries since you started tracking</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleSortOrder}
                className="flex items-center gap-1 border-gray-600 bg-gray-700 text-gray-200 hover:bg-gray-600"
              >
                <ArrowUpDown className="h-4 w-4" />
                {sortOrder === "newest" ? "Newest first" : "Oldest first"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="chart">
              <TabsList className="grid w-full grid-cols-3 mb-4 bg-gray-700">
                <TabsTrigger
                  value="chart"
                  className="text-gray-300 data-[state=active]:bg-teal-600 data-[state=active]:text-white"
                >
                  Chart
                </TabsTrigger>
                <TabsTrigger
                  value="list"
                  className="text-gray-300 data-[state=active]:bg-teal-600 data-[state=active]:text-white"
                >
                  List View
                </TabsTrigger>
                <TabsTrigger
                  value="calendar"
                  className="text-gray-300 data-[state=active]:bg-teal-600 data-[state=active]:text-white"
                >
                  Calendar View
                </TabsTrigger>
              </TabsList>

              <TabsContent value="list" className="space-y-4">
                {getSortedMoodHistory().map((entry, index) => (
                  <div key={index} className="flex flex-col border border-gray-600 rounded-lg p-4 bg-gray-800">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${getMoodColor(entry.mood)}`}>
                          {entry.mood}
                        </div>
                        <div>
                          <span className="font-medium text-white">{getMoodCategory(entry.mood)}</span>
                          <div className="flex items-center text-sm text-gray-400">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDate(entry.timestamp)}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-400 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatTime(entry.timestamp)}
                      </div>
                    </div>
                    {entry.notes && (
                      <div className="mt-2 bg-gray-700 p-3 rounded-md text-sm">
                        <p className="text-gray-200">{entry.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="chart">
                <div className="space-y-4">
                  <div className="bg-gray-800 p-6 rounded-lg border border-gray-600">
                    <h3 className="text-lg font-semibold mb-4 text-white">Mood Trend Chart</h3>
                    <div className="relative h-64 flex items-end justify-between gap-1">
                      {moodHistory.slice(-30).map((entry, index) => {
                        const height = (entry.mood / 10) * 100
                        const getBarColor = () => {
                          if (entry.mood <= 3) return "bg-red-400"
                          if (entry.mood <= 6) return "bg-yellow-400"
                          return "bg-green-400"
                        }
                        return (
                          <div key={index} className="flex-1 flex flex-col items-center gap-1">
                            <div
                              className={`w-full ${getBarColor()} rounded-t transition-all hover:opacity-80`}
                              style={{ height: `${height}%` }}
                              title={`Mood: ${entry.mood}, ${formatDate(entry.timestamp)}`}
                            />
                            <span className="text-xs text-gray-400 rotate-45 origin-top-left">
                              {entry.mood}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                    <div className="mt-4 flex justify-between text-sm text-gray-400">
                      <span>Last 30 entries</span>
                      <div className="flex gap-4">
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-red-400 rounded" />
                          <span>Low (1-3)</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-yellow-400 rounded" />
                          <span>Neutral (4-6)</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-green-400 rounded" />
                          <span>High (7-10)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="calendar">
                <div className="bg-gray-700 p-4 rounded-lg text-center">
                  <p className="text-gray-300">Calendar view will be available in the next update.</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
