"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Music, Activity, ExternalLink } from "lucide-react"
import Link from "next/link"
import RatingDialog, { RatingTarget } from "@/components/rating-dialog"
import { saveInteraction } from "@/lib/interactions"
import { useToast } from "@/hooks/use-toast"
import { getUserPlan, getPlanLimits, type PlanType } from "@/lib/plan-features"
import { UpgradePrompt } from "@/components/upgrade-prompt"
import { useIsNative } from "@/hooks/use-is-native"

interface RecommendationsProps {
  userData: {
    name: string
    email: string
    favoriteArtists?: string
    favoriteActivities?: string
    musicGenres?: string
    mentalIllnesses?: string
    medication?: string
    gender?: string
    musicPreferences?: any
  }
}

// Extended recommendation pools - enough variety for daily rotation
const musicRecommendationsPool = {
  low: [
    { title: "Here Comes The Sun", artist: "The Beatles", mood: "uplifting" },
    { title: "Don't Stop Me Now", artist: "Queen", mood: "energetic" },
    { title: "Walking on Sunshine", artist: "Katrina & The Waves", mood: "happy" },
    { title: "Happy", artist: "Pharrell Williams", mood: "joyful" },
    { title: "Good Vibrations", artist: "The Beach Boys", mood: "positive" },
    { title: "Shake It Off", artist: "Taylor Swift", mood: "energetic" },
    { title: "Can't Stop The Feeling", artist: "Justin Timberlake", mood: "joyful" },
    { title: "Best Day of My Life", artist: "American Authors", mood: "happy" },
    { title: "I Gotta Feeling", artist: "The Black Eyed Peas", mood: "energetic" },
    { title: "Uptown Funk", artist: "Mark Ronson ft. Bruno Mars", mood: "uplifting" },
    { title: "September", artist: "Earth, Wind & Fire", mood: "joyful" },
    { title: "Dancing Queen", artist: "ABBA", mood: "happy" },
    { title: "Mr. Blue Sky", artist: "Electric Light Orchestra", mood: "uplifting" },
    { title: "On Top of the World", artist: "Imagine Dragons", mood: "energetic" },
    { title: "Roar", artist: "Katy Perry", mood: "uplifting" },
  ],
  neutral: [
    { title: "Weightless", artist: "Marconi Union", mood: "calming" },
    { title: "Strawberry Swing", artist: "Coldplay", mood: "peaceful" },
    { title: "Breathe", artist: "Télépopmusik", mood: "relaxing" },
    { title: "Gymnopédie No.1", artist: "Erik Satie", mood: "tranquil" },
    { title: "Porcelain", artist: "Moby", mood: "ambient" },
    { title: "River Flows in You", artist: "Yiruma", mood: "peaceful" },
    { title: "Nuvole Bianche", artist: "Ludovico Einaudi", mood: "calming" },
    { title: "Comptine d'un autre été", artist: "Yann Tiersen", mood: "tranquil" },
    { title: "Aurora", artist: "Björk", mood: "ambient" },
    { title: "Arrival of the Birds", artist: "The Cinematic Orchestra", mood: "peaceful" },
    { title: "Clair de Lune", artist: "Claude Debussy", mood: "tranquil" },
    { title: "Experience", artist: "Ludovico Einaudi", mood: "calming" },
    { title: "Merry Christmas Mr. Lawrence", artist: "Ryuichi Sakamoto", mood: "peaceful" },
    { title: "The Heart Asks Pleasure First", artist: "Michael Nyman", mood: "tranquil" },
    { title: "Prelude in E Minor", artist: "Frédéric Chopin", mood: "calming" },
  ],
  high: [
    { title: "What a Wonderful World", artist: "Louis Armstrong", mood: "content" },
    { title: "Lovely Day", artist: "Bill Withers", mood: "appreciative" },
    { title: "Three Little Birds", artist: "Bob Marley", mood: "carefree" },
    { title: "Somewhere Over The Rainbow", artist: "Israel Kamakawiwo'ole", mood: "peaceful" },
    { title: "Beautiful Day", artist: "U2", mood: "grateful" },
    { title: "Imagine", artist: "John Lennon", mood: "peaceful" },
    { title: "Ain't No Mountain High Enough", artist: "Marvin Gaye & Tammi Terrell", mood: "uplifting" },
    { title: "Lean On Me", artist: "Bill Withers", mood: "appreciative" },
    { title: "Stand By Me", artist: "Ben E. King", mood: "content" },
    { title: "You've Got a Friend", artist: "James Taylor", mood: "grateful" },
    { title: "Over the Rainbow", artist: "Judy Garland", mood: "peaceful" },
    { title: "Count on Me", artist: "Bruno Mars", mood: "appreciative" },
    { title: "You've Got a Friend in Me", artist: "Randy Newman", mood: "content" },
    { title: "We Are Family", artist: "Sister Sledge", mood: "grateful" },
    { title: "Best of You", artist: "Foo Fighters", mood: "uplifting" },
  ],
}

const activityRecommendationsPool = {
  low: [
    { name: "Gentle yoga", description: "A 10-minute gentle yoga session to lift your mood", duration: "10 mins" },
    { name: "Mindful walk", description: "Take a short walk outside and focus on your surroundings", duration: "15 mins" },
    { name: "Gratitude journaling", description: "Write down three things you're grateful for today", duration: "5 mins" },
    { name: "Deep breathing", description: "Practice deep breathing exercises to reduce stress", duration: "5 mins" },
    { name: "Call a friend", description: "Reach out to someone who makes you feel good", duration: "Varies" },
    { name: "Listen to nature sounds", description: "Play calming nature sounds and just breathe", duration: "10 mins" },
    { name: "Light stretching", description: "Gentle stretches to release physical tension", duration: "10 mins" },
    { name: "Watch a comedy", description: "Laughter is great medicine - find something funny", duration: "20 mins" },
    { name: "Write a letter", description: "Write to someone you care about", duration: "15 mins" },
    { name: "Color or draw", description: "Creative expression without pressure", duration: "15 mins" },
    { name: "Take a warm bath", description: "Relax in warm water with calming scents", duration: "20 mins" },
    { name: "Practice mindfulness", description: "Focus on the present moment without judgment", duration: "10 mins" },
    { name: "Light exercise", description: "A short, gentle workout to boost endorphins", duration: "15 mins" },
    { name: "Listen to uplifting podcast", description: "Find an inspiring or motivational podcast", duration: "20 mins" },
    { name: "Organize a small space", description: "Decluttering can bring a sense of control", duration: "15 mins" },
  ],
  neutral: [
    { name: "Read a book", description: "Spend some time reading something you enjoy", duration: "20 mins" },
    { name: "Creative hobby", description: "Engage in a creative activity like drawing or writing", duration: "30 mins" },
    { name: "Meditation", description: "A short guided meditation to center yourself", duration: "10 mins" },
    { name: "Stretching", description: "Do some gentle stretching to release tension", duration: "10 mins" },
    { name: "Listen to a podcast", description: "Find an interesting podcast on a topic you enjoy", duration: "30 mins" },
    { name: "Cook something new", description: "Try a new recipe or make a favorite dish", duration: "30 mins" },
    { name: "Practice an instrument", description: "Play music if you have an instrument", duration: "20 mins" },
    { name: "Do a puzzle", description: "Work on a jigsaw puzzle or brain teaser", duration: "20 mins" },
    { name: "Watch a documentary", description: "Learn something new about a topic you're curious about", duration: "30 mins" },
    { name: "Go for a bike ride", description: "Enjoy the outdoors and get some exercise", duration: "30 mins" },
    { name: "Write in a journal", description: "Reflect on your day or write about your thoughts", duration: "15 mins" },
    { name: "Try a new skill", description: "Learn something new from a tutorial or class", duration: "30 mins" },
    { name: "Visit a museum", description: "Explore art, history, or science exhibits", duration: "1 hour" },
    { name: "Gardening", description: "Tend to plants or start a small garden", duration: "30 mins" },
    { name: "Photography walk", description: "Take photos of things that catch your eye", duration: "30 mins" },
  ],
  high: [
    { name: "Dance break", description: "Put on your favorite music and dance around", duration: "10 mins" },
    { name: "Share your joy", description: "Reach out to someone and share your positive feelings", duration: "Varies" },
    { name: "Random act of kindness", description: "Do something nice for someone else", duration: "Varies" },
    { name: "Nature appreciation", description: "Spend time in nature and savor the experience", duration: "30 mins" },
    { name: "Set a goal", description: "Use this positive energy to set a goal for yourself", duration: "15 mins" },
    { name: "Plan an adventure", description: "Research and plan a fun trip or activity", duration: "30 mins" },
    { name: "Express gratitude", description: "Write thank-you notes or messages to people you appreciate", duration: "15 mins" },
    { name: "Try something adventurous", description: "Do something slightly outside your comfort zone", duration: "Varies" },
    { name: "Help someone", description: "Offer assistance to someone who could use it", duration: "Varies" },
    { name: "Create something", description: "Make art, music, or write something creative", duration: "30 mins" },
    { name: "Exercise", description: "Get your heart rate up with your favorite workout", duration: "30 mins" },
    { name: "Connect with friends", description: "Reach out and make plans with people you enjoy", duration: "Varies" },
    { name: "Learn something new", description: "Take on a new challenge or skill", duration: "30 mins" },
    { name: "Celebrate wins", description: "Acknowledge and celebrate your recent accomplishments", duration: "15 mins" },
    { name: "Plan future fun", description: "Look forward to and plan upcoming enjoyable activities", duration: "20 mins" },
  ],
}

// Helper function to shuffle array
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// Get today's recommendations (rotated daily)
function getDailyRecommendations(mood: "low" | "neutral" | "high") {
  if (typeof window === 'undefined') {
    // SSR fallback
    return {
      music: musicRecommendationsPool[mood].slice(0, 5),
      activities: activityRecommendationsPool[mood].slice(0, 5),
    }
  }

  const today = new Date().toDateString()
  const lastRefreshKey = `recommendationsLastRefresh_${mood}`
  const cachedRecommendationsKey = `cachedRecommendations_${mood}`
  
  const lastRefresh = localStorage.getItem(lastRefreshKey)
  const cachedData = localStorage.getItem(cachedRecommendationsKey)

  // If we have cached recommendations from today, return them
  if (lastRefresh === today && cachedData) {
    try {
      return JSON.parse(cachedData)
    } catch (e) {
      console.error("Error parsing cached recommendations:", e)
    }
  }

  // Generate new recommendations for today
  const shuffledMusic = shuffleArray(musicRecommendationsPool[mood])
  const shuffledActivities = shuffleArray(activityRecommendationsPool[mood])

  const dailyRecommendations = {
    music: shuffledMusic.slice(0, 5),
    activities: shuffledActivities.slice(0, 5),
  }

  // Cache for today
  localStorage.setItem(lastRefreshKey, today)
  localStorage.setItem(cachedRecommendationsKey, JSON.stringify(dailyRecommendations))

  return dailyRecommendations
}

export default function Recommendations({ userData }: RecommendationsProps) {
  const [currentMood, setCurrentMood] = useState<"low" | "neutral" | "high">("neutral")
  const [moodHistory, setMoodHistory] = useState<Array<{ mood: number; timestamp: Date }>>([])
  const { toast } = useToast()
  const { isNative } = useIsNative()
  const [ratingOpen, setRatingOpen] = useState(false)
  const [ratingTarget, setRatingTarget] = useState<RatingTarget | null>(null)
  const [userPlan, setUserPlan] = useState<PlanType>("free")
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [upgradeFeature, setUpgradeFeature] = useState("")
  const [requiredPlan, setRequiredPlan] = useState<PlanType>("premium")

  useEffect(() => {
    // In a real app, you would fetch this from an API (client-side only)
    if (typeof window !== 'undefined') {
      // Get user's plan
      const plan = getUserPlan()
      setUserPlan(plan)

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
    }
  }, [])

  // Get personalized recommendations based on user preferences and current mood
  // Returns daily rotated recommendations
  const getPersonalizedMusic = () => {
    const dailyRecs = getDailyRecommendations(currentMood)
    const baseRecommendations = dailyRecs.music
    const limits = getPlanLimits(userPlan)

    // For free plans, limit recommendations (skip limit on native iOS)
    const recommendations = (userPlan === 'free' && !isNative)
      ? baseRecommendations.slice(0, limits.maxMusicRecommendations)
      : baseRecommendations

    let personalizedRecs = recommendations
    if (userPlan !== 'free' || isNative) {
      const favoriteArtists = (userData.favoriteArtists || "").split(',').map((a: string) => a.trim()).filter(Boolean)
      const musicGenres = (userData.musicGenres || "").split(',').map((g: string) => g.trim().toLowerCase()).filter(Boolean)
      const hasMentalHealthConsideration = userData.mentalIllnesses && userData.mentalIllnesses !== "No"

      personalizedRecs = recommendations.map((rec: { title: string; artist: string; mood: string }) => {
        let score = 0
        if (favoriteArtists.length > 0) {
          const matchesArtist = favoriteArtists.some((artist: string) => 
            rec.artist.toLowerCase().includes(artist.toLowerCase()) ||
            artist.toLowerCase().includes(rec.artist.toLowerCase())
          )
          if (matchesArtist) score += 2
        }
        if (musicGenres.length > 0) {
          const genreMap: Record<string, string[]> = {
            classical: ["Satie", "Debussy", "Chopin", "Einaudi", "Yiruma", "Tiersen", "Nyman", "Sakamoto"],
            jazz: ["Armstrong", "Withers", "Marley", "Taylor", "King", "Gaye"],
            pop: ["Swift", "Williams", "Timberlake", "Perry", "Mars"],
            rock: ["Queen", "Beatles", "U2", "Foo Fighters", "Imagine Dragons"],
            ambient: ["Marconi", "Moby", "Björk", "Télépopmusik"],
          }
          for (const g of musicGenres) {
            const artists = genreMap[g] || []
            if (artists.some(a => rec.artist.includes(a))) { score += 1; break }
          }
        }
        if (hasMentalHealthConsideration && currentMood === "low") {
          const calmingMoods = ["calming", "peaceful", "tranquil", "relaxing", "ambient"]
          if (calmingMoods.includes(rec.mood)) score += 1
        }
        return { ...rec, personalized: score > 0, _score: score }
      })
      personalizedRecs.sort((a: any, b: any) => (b._score || 0) - (a._score || 0))
    }
    
    return personalizedRecs
  }

  const getPersonalizedActivities = () => {
    const dailyRecs = getDailyRecommendations(currentMood)
    const baseRecommendations = dailyRecs.activities
    const favoriteActivities = (userData.favoriteActivities || "").split(',').map((a: string) => a.trim()).filter(Boolean)
    const hasMentalHealthConsideration = userData.mentalIllnesses && userData.mentalIllnesses !== "No"
    const calmingActivities = ["yoga", "meditation", "deep breathing", "mindfulness", "stretching", "gratitude journaling", "light stretching"]

    if (userPlan !== 'free' || isNative) {
      const personalizedRecs = baseRecommendations.map((rec: { name: string; description: string; duration: string }) => {
        let score = 0
        if (favoriteActivities.length > 0) {
          const matches = favoriteActivities.some((a: string) => 
            rec.name.toLowerCase().includes(a.toLowerCase()) || a.toLowerCase().includes(rec.name.toLowerCase())
          )
          if (matches) score += 2
        }
        if (hasMentalHealthConsideration && currentMood === "low") {
          if (calmingActivities.some(c => rec.name.toLowerCase().includes(c))) score += 1
        }
        return { ...rec, personalized: score > 0, _score: score }
      })
      personalizedRecs.sort((a: any, b: any) => (b._score || 0) - (a._score || 0))
      return personalizedRecs
    }
    
    return baseRecommendations
  }

  const handleFeatureAccess = (featureName: string, requiredPlanType: PlanType) => {
    if (!isNative && userPlan === 'free' && requiredPlanType !== 'free') {
      setUpgradeFeature(featureName)
      setRequiredPlan(requiredPlanType)
      setShowUpgrade(true)
      return false
    }
    return true
  }

  return (
    <div className="space-y-6">
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
                {getPersonalizedMusic().map((item: { title: string; artist: string; mood: string; personalized?: boolean }, index: number) => {
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
                            setRatingTarget({ kind: "song", title: `${item.title} – ${item.artist}`, meta: { mood: item.mood, source: "recommendations" } })
                            setRatingOpen(true)
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
                {getPersonalizedActivities().map((item: { name: string; description: string; duration: string; personalized?: boolean }, index: number) => (
                  <Card key={index}>
                    <CardHeader className="p-4">
                      <CardTitle className="text-base">{item.name}</CardTitle>
                      <CardDescription>{item.description}</CardDescription>
                    </CardHeader>
                    <CardFooter className="p-4 pt-0 flex justify-between">
                      <span className="text-xs px-2 py-1 bg-teal-100 text-teal-800 rounded-full">{item.duration}</span>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8"
                        onClick={() => {
                          setRatingTarget({ kind: "activity", title: item.name, meta: { duration: item.duration, source: "recommendations" } })
                          setRatingOpen(true)
                        }}
                      >
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
      {showUpgrade && (
        <UpgradePrompt
          feature={upgradeFeature}
          requiredPlan={requiredPlan}
          currentPlan={userPlan}
          onClose={() => setShowUpgrade(false)}
        />
      )}
      <RatingDialog
        open={ratingOpen}
        onOpenChange={setRatingOpen}
        target={ratingTarget}
        onSubmit={(rating) => {
          if (!ratingTarget) return
          saveInteraction({
            kind: ratingTarget.kind,
            title: ratingTarget.title,
            rating,
            meta: ratingTarget.meta,
            source: "recommendations",
          } as any)
          toast({ title: "Thanks!", description: `Saved your ${ratingTarget.kind} rating (${rating} ${rating === 1 ? 'star' : 'stars'}).` })
        }}
      />
    </div>
  )
}
