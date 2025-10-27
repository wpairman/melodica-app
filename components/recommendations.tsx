"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Music, Activity, ExternalLink } from "lucide-react"
import Link from "next/link"

interface RecommendationsProps {
  userData: {
    name: string
    email: string
    favoriteArtists: string
    favoriteActivities: string
    musicPreferences?: any
  }
}

// Sample data - in a real app, this would come from a recommendation algorithm
const musicRecommendations = {
  low: [
    { title: "Here Comes The Sun", artist: "The Beatles", mood: "uplifting" },
    { title: "Don't Stop Me Now", artist: "Queen", mood: "energetic" },
    { title: "Walking on Sunshine", artist: "Katrina & The Waves", mood: "happy" },
    { title: "Happy", artist: "Pharrell Williams", mood: "joyful" },
    { title: "Good Vibrations", artist: "The Beach Boys", mood: "positive" },
  ],
  neutral: [
    { title: "Weightless", artist: "Marconi Union", mood: "calming" },
    { title: "Strawberry Swing", artist: "Coldplay", mood: "peaceful" },
    { title: "Breathe", artist: "Télépopmusik", mood: "relaxing" },
    { title: "Gymnopédie No.1", artist: "Erik Satie", mood: "tranquil" },
    { title: "Porcelain", artist: "Moby", mood: "ambient" },
  ],
  high: [
    { title: "What a Wonderful World", artist: "Louis Armstrong", mood: "content" },
    { title: "Lovely Day", artist: "Bill Withers", mood: "appreciative" },
    { title: "Three Little Birds", artist: "Bob Marley", mood: "carefree" },
    { title: "Somewhere Over The Rainbow", artist: "Israel Kamakawiwo'ole", mood: "peaceful" },
    { title: "Beautiful Day", artist: "U2", mood: "grateful" },
  ],
}

const activityRecommendations = {
  low: [
    { name: "Gentle yoga", description: "A 10-minute gentle yoga session to lift your mood", duration: "10 mins" },
    {
      name: "Mindful walk",
      description: "Take a short walk outside and focus on your surroundings",
      duration: "15 mins",
    },
    {
      name: "Gratitude journaling",
      description: "Write down three things you're grateful for today",
      duration: "5 mins",
    },
    { name: "Deep breathing", description: "Practice deep breathing exercises to reduce stress", duration: "5 mins" },
    { name: "Call a friend", description: "Reach out to someone who makes you feel good", duration: "Varies" },
  ],
  neutral: [
    { name: "Read a book", description: "Spend some time reading something you enjoy", duration: "20 mins" },
    {
      name: "Creative hobby",
      description: "Engage in a creative activity like drawing or writing",
      duration: "30 mins",
    },
    { name: "Meditation", description: "A short guided meditation to center yourself", duration: "10 mins" },
    { name: "Stretching", description: "Do some gentle stretching to release tension", duration: "10 mins" },
    {
      name: "Listen to a podcast",
      description: "Find an interesting podcast on a topic you enjoy",
      duration: "30 mins",
    },
  ],
  high: [
    { name: "Dance break", description: "Put on your favorite music and dance around", duration: "10 mins" },
    {
      name: "Share your joy",
      description: "Reach out to someone and share your positive feelings",
      duration: "Varies",
    },
    { name: "Random act of kindness", description: "Do something nice for someone else", duration: "Varies" },
    { name: "Nature appreciation", description: "Spend time in nature and savor the experience", duration: "30 mins" },
    { name: "Set a goal", description: "Use this positive energy to set a goal for yourself", duration: "15 mins" },
  ],
}

export default function Recommendations({ userData }: RecommendationsProps) {
  const [currentMood, setCurrentMood] = useState<"low" | "neutral" | "high">("neutral")
  const [moodHistory, setMoodHistory] = useState<Array<{ mood: number; timestamp: Date }>>([])
  const [hasMusicPreferences, setHasMusicPreferences] = useState(false)

  useEffect(() => {
    // In a real app, you would fetch this from an API (client-side only)
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

          // Determine current mood category based on most recent entry
          if (historyWithDates.length > 0) {
            const latestMood = historyWithDates[historyWithDates.length - 1].mood
            if (latestMood <= 3) {
              setCurrentMood("low")
            } else if (latestMood <= 6) {
              setCurrentMood("neutral")
            } else {
              setCurrentMood("high")
            }
          }
        } catch (error) {
          console.error("Error parsing mood history:", error)
          setMoodHistory([])
        }
      }

      // Check if user has completed music preferences quiz
      const storedPreferences = localStorage.getItem("musicPreferences")
      setHasMusicPreferences(!!storedPreferences)
    }
  }, [])

  // Get personalized recommendations based on user preferences and current mood
  const getPersonalizedMusic = () => {
    const baseRecommendations = musicRecommendations[currentMood]
    
    // Use user's favorite artists to personalize recommendations
    if (userData.favoriteArtists) {
      const favoriteArtists = userData.favoriteArtists.split(',').map(a => a.trim())
      const personalizedRecs = baseRecommendations.map(rec => {
        // Match artist names to user's favorites
        const matchesArtist = favoriteArtists.some(artist => 
          rec.artist.toLowerCase().includes(artist.toLowerCase()) ||
          artist.toLowerCase().includes(rec.artist.toLowerCase())
        )
        return matchesArtist ? { ...rec, personalized: true } : rec
      })
      // Put personalized recommendations first
      return personalizedRecs.sort((a, b) => (b as any).personalized ? 1 : -1)
    }
    
    return baseRecommendations
  }

  const getPersonalizedActivities = () => {
    const baseRecommendations = activityRecommendations[currentMood]
    
    // Use user's favorite activities to personalize recommendations
    if (userData.favoriteActivities) {
      const favoriteActivities = userData.favoriteActivities.split(',').map(a => a.trim())
      const personalizedRecs = baseRecommendations.map(rec => {
        // Match activity names to user's favorites
        const matchesActivity = favoriteActivities.some(activity => 
          rec.name.toLowerCase().includes(activity.toLowerCase()) ||
          activity.toLowerCase().includes(rec.name.toLowerCase())
        )
        return matchesActivity ? { ...rec, personalized: true } : rec
      })
      // Put personalized recommendations first
      return personalizedRecs.sort((a, b) => (b as any).personalized ? 1 : -1)
    }
    
    return baseRecommendations
  }

  return (
    <div className="space-y-6">
      {!hasMusicPreferences && (
        <Card className="bg-teal-50 border-teal-200">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Music className="h-5 w-5 mr-2 text-teal-600" />
              Enhance Your Music Recommendations
            </CardTitle>
            <CardDescription className="text-black">
              Take our detailed music preference quiz to get more personalized song recommendations based on your taste
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Link href="/music-preferences" className="w-full">
              <Button className="w-full bg-teal-600 hover:bg-teal-700">Take Music Quiz</Button>
            </Link>
          </CardFooter>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Your Personalized Recommendations</CardTitle>
          <CardDescription>
            Based on your current mood:{" "}
            <span
              className={
                currentMood === "low"
                  ? "text-red-600 font-medium"
                  : currentMood === "neutral"
                    ? "text-yellow-600 font-medium"
                    : "text-green-600 font-medium"
              }
            >
              {currentMood === "low" ? "Could use a boost" : currentMood === "neutral" ? "Balanced" : "Feeling great"}
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="music" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="music">
                <Music className="mr-2 h-4 w-4" />
                Music
              </TabsTrigger>
              <TabsTrigger value="activities">
                <Activity className="mr-2 h-4 w-4" />
                Activities
              </TabsTrigger>
            </TabsList>
            <TabsContent value="music" className="mt-4">
              <div className="space-y-4">
                {getPersonalizedMusic().map((item, index) => {
                  const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(item.artist + " " + item.title)}`
                  return (
                    <Card key={index}>
                      <CardHeader className="p-4">
                        <CardTitle className="text-base">{item.title}</CardTitle>
                        <CardDescription>{item.artist}</CardDescription>
                      </CardHeader>
                      <CardFooter className="p-4 pt-0 flex justify-between">
                        <span className="text-xs px-2 py-1 bg-teal-100 text-teal-800 rounded-full">{item.mood}</span>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8"
                          onClick={() => {
                            if (typeof window !== 'undefined') {
                              window.open(youtubeSearchUrl, '_blank')
                            }
                          }}
                        >
                          <ExternalLink className="mr-2 h-3 w-3" />
                          Listen
                        </Button>
                      </CardFooter>
                    </Card>
                  )
                })}
              </div>
            </TabsContent>
            <TabsContent value="activities" className="mt-4">
              <div className="space-y-4">
                {getPersonalizedActivities().map((item, index) => (
                  <Card key={index}>
                    <CardHeader className="p-4">
                      <CardTitle className="text-base">{item.name}</CardTitle>
                      <CardDescription>{item.description}</CardDescription>
                    </CardHeader>
                    <CardFooter className="p-4 pt-0 flex justify-between">
                      <span className="text-xs px-2 py-1 bg-teal-100 text-teal-800 rounded-full">{item.duration}</span>
                      <Button variant="outline" size="sm" className="h-8">
                        Try Now
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {currentMood === "low" && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle>Need someone to talk to?</CardTitle>
            <CardDescription>It's important to reach out when you're not feeling your best</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Talking about your feelings can help. Consider reaching out to a friend, family member, or professional.
            </p>
            <div className="mt-4 grid gap-2">
              <Button variant="outline" className="w-full justify-start">
                <ExternalLink className="mr-2 h-4 w-4" />
                988 Suicide & Crisis Lifeline
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <ExternalLink className="mr-2 h-4 w-4" />
                Crisis Text Line: Text HOME to 741741
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <ExternalLink className="mr-2 h-4 w-4" />
                Find a Therapist
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
