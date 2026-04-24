"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, ExternalLink, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface MusicRecommendation {
  title: string
  artist: string
  mood: string
  reasoning: string
  spotifyId?: string
  previewUrl?: string
}

interface AIRecommendationsProps {
  userData: {
    favoriteArtists?: string
    favoriteActivities?: string
    musicGenres?: string
    mentalIllnesses?: string
    medication?: string
    gender?: string
    musicPreferences?: any
  }
  currentMood: number
  moodHistory?: Array<{ mood: number; timestamp: Date }>
}

export default function AIMusicRecommendations({ userData, currentMood, moodHistory = [] }: AIRecommendationsProps) {
  const { toast } = useToast()
  const [recommendations, setRecommendations] = useState<MusicRecommendation[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem("aiMusicRecommendations")
      if (cached) {
        try {
          const parsed = JSON.parse(cached)
          if (parsed.timestamp && Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
            setRecommendations(parsed.recommendations || [])
          }
        } catch (e) {
          console.error("Error parsing cached recommendations:", e)
        }
      }
    }
  }, [])

  const generateAIRecommendations = async () => {
    setIsGenerating(true)

    try {
      const favoriteArtists = userData.favoriteArtists?.split(',').map(a => a.trim()).filter(Boolean) || []
      const musicGenres = (userData.musicGenres || "").split(',').map(g => g.trim().toLowerCase()).filter(Boolean)
      const hasMentalHealthConsideration = userData.mentalIllnesses && userData.mentalIllnesses !== "No"

      let moodCategory: "low" | "neutral" | "high"
      if (currentMood <= 3) {
        moodCategory = "low"
      } else if (currentMood <= 6) {
        moodCategory = "neutral"
      } else {
        moodCategory = "high"
      }

      const aiRecommendations: MusicRecommendation[] = []

      if (moodCategory === "low") {
        const upliftingSongs = [
          { title: "Here Comes The Sun", artist: "The Beatles", mood: "uplifting", reasoning: "Classic uplifting melody proven to boost mood" },
          { title: "Don't Stop Me Now", artist: "Queen", mood: "energetic", reasoning: "High-energy track to combat low mood" },
          { title: "Walking on Sunshine", artist: "Katrina & The Waves", mood: "happy", reasoning: "Upbeat rhythm stimulates dopamine release" },
          { title: "Happy", artist: "Pharrell Williams", mood: "joyful", reasoning: "Scientifically designed to trigger positive emotions" },
          { title: "Shake It Off", artist: "Taylor Swift", mood: "energetic", reasoning: "Empowering lyrics help shift perspective" },
        ]
        const genreMap: Record<string, string[]> = {
          classical: ["Erik Satie", "Claude Debussy", "Ludovico Einaudi", "Yiruma", "Chopin"],
          jazz: ["Louis Armstrong", "Bill Withers", "Marvin Gaye"],
          pop: ["Taylor Swift", "Pharrell Williams", "Justin Timberlake", "Katy Perry"],
          rock: ["Queen", "The Beatles", "Foo Fighters"],
        }
        let scored = upliftingSongs.map(song => {
          let score = 0
          if (favoriteArtists.some(a => song.artist.toLowerCase().includes(a.toLowerCase()))) score += 2
          for (const g of musicGenres) {
            if ((genreMap[g] || []).some(artist => song.artist.includes(artist))) { score += 1; break }
          }
          if (hasMentalHealthConsideration) {
            const gentle = ["Here Comes The Sun", "Walking on Sunshine", "Three Little Birds", "Weightless"]
            if (gentle.some(t => song.title.includes(t) || song.mood === "uplifting")) score += 1
          }
          return { ...song, _score: score }
        })
        scored.sort((a, b) => (b._score || 0) - (a._score || 0))
        aiRecommendations.push(...scored.slice(0, 5).map(({ _score, ...s }) => ({
          ...s,
          reasoning: _score > 0 ? `${s.reasoning} Personalized to your preferences.` : s.reasoning
        })))
      } else if (moodCategory === "neutral") {
        const calmingSongs = [
          { title: "Weightless", artist: "Marconi Union", mood: "calming", reasoning: "Scientifically proven to reduce anxiety by 65%" },
          { title: "Strawberry Swing", artist: "Coldplay", mood: "peaceful", reasoning: "Gentle melody promotes relaxation" },
          { title: "River Flows in You", artist: "Yiruma", mood: "tranquil", reasoning: "Piano composition aids mindfulness" },
          { title: "Clair de Lune", artist: "Claude Debussy", mood: "peaceful", reasoning: "Classical piece enhances focus and calm" },
          { title: "Nuvole Bianche", artist: "Ludovico Einaudi", mood: "calming", reasoning: "Ambient music regulates heart rate" },
        ]
        const genreMapNeutral: Record<string, string[]> = {
          classical: ["Debussy", "Einaudi", "Yiruma", "Satie"],
          ambient: ["Marconi", "Moby"],
          jazz: ["Armstrong", "Withers"],
        }
        let scored = calmingSongs.map(song => {
          let score = 0
          if (favoriteArtists.some(a => song.artist.toLowerCase().includes(a.toLowerCase()))) score += 2
          for (const g of musicGenres) {
            if ((genreMapNeutral[g] || []).some(artist => song.artist.includes(artist))) { score += 1; break }
          }
          return { ...song, _score: score }
        })
        scored.sort((a, b) => (b._score || 0) - (a._score || 0))
        aiRecommendations.push(...scored.slice(0, 5).map(({ _score, ...s }) => s))
      } else {
        const celebratorySongs = [
          { title: "What a Wonderful World", artist: "Louis Armstrong", mood: "content", reasoning: "Promotes gratitude and appreciation" },
          { title: "Three Little Birds", artist: "Bob Marley", mood: "carefree", reasoning: "Positive message reinforces good mood" },
          { title: "Beautiful Day", artist: "U2", mood: "grateful", reasoning: "Uplifting anthem amplifies positive feelings" },
          { title: "Lovely Day", artist: "Bill Withers", mood: "appreciative", reasoning: "Soulful track maintains positive energy" },
          { title: "Somewhere Over The Rainbow", artist: "Israel Kamakawiwo'ole", mood: "peaceful", reasoning: "Soothing melody preserves contentment" },
        ]
        const genreMapHigh: Record<string, string[]> = {
          jazz: ["Armstrong", "Withers", "Marley"],
          rock: ["U2"],
        }
        let scored = celebratorySongs.map(song => {
          let score = 0
          if (favoriteArtists.some(a => song.artist.toLowerCase().includes(a.toLowerCase()))) score += 2
          for (const g of musicGenres) {
            if ((genreMapHigh[g] || []).some(artist => song.artist.includes(artist))) { score += 1; break }
          }
          return { ...song, _score: score }
        })
        scored.sort((a, b) => (b._score || 0) - (a._score || 0))
        aiRecommendations.push(...scored.slice(0, 5).map(({ _score, ...s }) => s))
      }

      if (moodHistory.length >= 7) {
        const recentMoods = moodHistory.slice(-7).map(e => e.mood)
        const trend = recentMoods[recentMoods.length - 1] - recentMoods[0]
        if (trend < -1) {
          aiRecommendations.unshift({
            title: "Lean On Me",
            artist: "Bill Withers",
            mood: "supportive",
            reasoning: "Your mood has been declining. This supportive song can help provide emotional comfort."
          })
        }
      }

      localStorage.setItem("aiMusicRecommendations", JSON.stringify({
        recommendations: aiRecommendations,
        timestamp: Date.now()
      }))

      setRecommendations(aiRecommendations)

      toast({
        title: "AI Recommendations Generated!",
        description: `Created ${aiRecommendations.length} personalized recommendations based on your mood and preferences.`,
      })
    } catch (error) {
      console.error("Error generating AI recommendations:", error)
      toast({
        title: "Generation Failed",
        description: "Unable to generate AI recommendations. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-500" />
          AI-Powered Music Recommendations
        </CardTitle>
        <CardDescription className="text-gray-300">
          Intelligent music suggestions based on your mood and preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {recommendations.length === 0 ? (
          <div className="text-center py-8">
            <Sparkles className="h-12 w-12 mx-auto text-purple-500 mb-4" />
            <p className="text-gray-300 mb-4">
              Generate AI-powered music recommendations tailored to your current mood and preferences
            </p>
            <Button
              onClick={generateAIRecommendations}
              disabled={isGenerating}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing your mood...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate AI Recommendations
                </>
              )}
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-300">
                {recommendations.length} personalized recommendations
              </p>
              <Button
                onClick={generateAIRecommendations}
                disabled={isGenerating}
                variant="outline"
                size="sm"
                className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Regenerating...
                  </>
                ) : (
                  "Regenerate"
                )}
              </Button>
            </div>
            <div className="space-y-3">
              {recommendations.map((rec, index) => {
                const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(rec.artist + " " + rec.title)}`
                return (
                  <Card key={index} className="bg-gray-700/50 border-gray-600">
                    <CardHeader className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base text-white">{rec.title}</CardTitle>
                          <CardDescription className="text-gray-300">{rec.artist}</CardDescription>
                          <Badge className="mt-2 bg-purple-600 text-white">{rec.mood}</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p className="text-sm text-gray-400 mb-3">{rec.reasoning}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white"
                        onClick={() => {
                          if (typeof window !== 'undefined') {
                            window.open(youtubeSearchUrl, '_blank')
                          }
                        }}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Listen on YouTube
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
