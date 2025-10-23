"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useSafeToast } from "@/components/toast-provider"
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
  const { toast } = useSafeToast()
  const [selectedMood, setSelectedMood] = useState<number | null>(null)
  const [showFollowUp, setShowFollowUp] = useState(false)
  const [followUpResponse, setFollowUpResponse] = useState("")
  const [moodHistory, setMoodHistory] = useState<Array<{ mood: number; timestamp: Date; notes?: string }>>([])
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest")

  useEffect(() => {
    // Load mood history from localStorage (client-side only)
    if (typeof window !== 'undefined') {
      const storedHistory = localStorage.getItem("moodHistory")
      if (storedHistory) {
        try {
          const parsedHistory = JSON.parse(storedHistory)
          // Convert timestamp strings back to Date objects
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

    // If mood is below 4, show follow-up question
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
    // In a real app, you would save this to a database
    const newEntry = { mood, timestamp: new Date(), notes }
    const updatedHistory = [...moodHistory, newEntry]
    setMoodHistory(updatedHistory)

    // Store in localStorage for demo purposes (client-side only)
    if (typeof window !== 'undefined') {
      localStorage.setItem("moodHistory", JSON.stringify(updatedHistory))
    }

    // Special garden notifications
    if (updatedHistory.length === 1) {
      try {
        toast({
          title: "🌱 First seed planted!",
          description: "Your emotional garden has begun to grow.",
        })
      } catch (error) {
        console.error('Error showing first seed toast:', error)
      }
    } else if (updatedHistory.length === 7) {
      try {
        toast({
          title: "🌸 Your garden is blossoming!",
          description: "7 days of consistent care has made your garden bloom beautifully.",
        })
      } catch (error) {
        console.error('Error showing garden blossoming toast:', error)
      }
    } else if (updatedHistory.length === 30) {
      try {
        toast({
          title: "✨ Reflective sanctuary unlocked!",
          description: "Your garden has become a sacred space for reflection and growth.",
        })
      } catch (error) {
        console.error('Error showing sanctuary unlocked toast:', error)
      }
    } else {
      try {
        toast({
          title: "🌿 New plant added!",
          description: "Your mood has been saved and your garden grows stronger.",
        })
      } catch (error) {
        console.error('Error showing new plant toast:', error)
      }
    }

    // Reset selection
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
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatTime = (dateString: Date) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getMoodCategory = (mood: number) => {
    if (mood <= 3) return "Low mood"
    if (mood <= 6) return "Neutral mood"
    return "Positive mood"
  }

  const getMoodColor = (mood: number) => {
    if (mood <= 3) return "bg-red-100 text-red-700"
    if (mood <= 6) return "bg-yellow-100 text-yellow-700"
    return "bg-green-100 text-green-700"
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>How are you feeling right now?</CardTitle>
          <CardDescription>Rate your current mood on a scale from 1 to 10</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
              <Button
                key={num}
                variant={selectedMood === num ? "default" : "outline"}
                className={`h-12 w-full ${
                  num <= 3
                    ? "bg-opacity-80 hover:bg-opacity-70 border-red-200 bg-red-100 text-red-700 hover:bg-red-200"
                    : num <= 6
                      ? "bg-opacity-80 hover:bg-opacity-70 border-yellow-200 bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                      : "bg-opacity-80 hover:bg-opacity-70 border-green-200 bg-green-100 text-green-700 hover:bg-green-200"
                } ${selectedMood === num ? "ring-2 ring-offset-2" : ""}`}
                onClick={() => handleMoodSelection(num)}
              >
                {num}
              </Button>
            ))}
          </div>
          <div className="mt-4 flex justify-between text-sm text-gray-500">
            <span>Very low</span>
            <span>Neutral</span>
            <span>Excellent</span>
          </div>
        </CardContent>
      </Card>

      {showFollowUp && (
        <Card>
          <CardHeader>
            <CardTitle>Would you like to share what's bothering you?</CardTitle>
            <CardDescription>
              It can help to talk about what's on your mind. This information is private and only used to provide better
              recommendations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Share your thoughts here..."
              value={followUpResponse}
              onChange={(e) => setFollowUpResponse(e.target.value)}
              className="min-h-[100px]"
            />
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button onClick={handleFollowUpSubmit} className="w-full">
              Submit
            </Button>
            <div className="text-center text-sm">
              <p className="text-gray-500">Consider talking to someone you trust about how you're feeling.</p>
              <p className="mt-2">
                <a
                  href="https://www.988lifeline.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal-600 hover:underline"
                >
                  988 Suicide & Crisis Lifeline
                </a>
                {" • "}
                <a
                  href="https://www.crisistextline.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal-600 hover:underline"
                >
                  Crisis Text Line: Text HOME to 741741
                </a>
              </p>
            </div>
          </CardFooter>
        </Card>
      )}

      {/* Virtual Garden */}
      <VirtualGarden moodHistory={moodHistory} />

      {/* Rewards System */}
      <RewardsSystem
        moodHistory={moodHistory}
        onAchievementEarned={(achievement) => {
          // Additional celebration logic can go here
          console.log("Achievement earned:", achievement)
        }}
      />

      {moodHistory.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Your Complete Mood History</CardTitle>
                <CardDescription>All your mood entries since you started tracking</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={toggleSortOrder} className="flex items-center gap-1">
                <ArrowUpDown className="h-4 w-4" />
                {sortOrder === "newest" ? "Newest first" : "Oldest first"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="list">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="list">List View</TabsTrigger>
                <TabsTrigger value="calendar">Calendar View</TabsTrigger>
              </TabsList>

              <TabsContent value="list" className="space-y-4">
                {getSortedMoodHistory().map((entry, index) => (
                  <div key={index} className="flex flex-col border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-10 w-10 rounded-full flex items-center justify-center ${getMoodColor(entry.mood)}`}
                        >
                          {entry.mood}
                        </div>
                        <div>
                          <span className="font-medium">{getMoodCategory(entry.mood)}</span>
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDate(entry.timestamp)}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatTime(entry.timestamp)}
                      </div>
                    </div>
                    {entry.notes && (
                      <div className="mt-2 bg-gray-50 p-3 rounded-md text-sm">
                        <p className="text-gray-700">{entry.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="calendar">
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <p>Calendar view will be available in the next update.</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
