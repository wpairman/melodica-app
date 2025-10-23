"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Loader2,
  MapPin,
  Sun,
  CloudRain,
  Cloud,
  Snowflake,
  Zap,
  Music,
  Activity,
  TrendingUp,
  Minus,
} from "lucide-react"
import type { JSX } from "react/jsx-runtime"

type WeatherState = {
  loading: boolean
  error?: string
  temperature?: number
  condition?: string
  city?: string
  weatherCode?: number
}

type Recommendation = {
  type: "song" | "activity"
  title: string
  artist?: string
  description: string
  moodEffect: "improve" | "stabilize"
  reasoning: string
}

const codeToCondition = (code: number): { label: string; icon: JSX.Element } => {
  if ([0].includes(code)) return { label: "Clear", icon: <Sun className="h-8 w-8 text-yellow-500" /> }
  if ([1, 2, 3].includes(code)) return { label: "Cloudy", icon: <Cloud className="h-8 w-8 text-gray-500" /> }
  if ([61, 63, 65, 80, 81, 82].includes(code))
    return { label: "Rainy", icon: <CloudRain className="h-8 w-8 text-blue-500" /> }
  if ([71, 73, 75, 85, 86].includes(code))
    return { label: "Snow", icon: <Snowflake className="h-8 w-8 text-cyan-400" /> }
  if ([95, 96, 99].includes(code)) return { label: "Thunderstorm", icon: <Zap className="h-8 w-8 text-purple-600" /> }
  return { label: "Unknown", icon: <Cloud className="h-8 w-8 text-gray-500" /> }
}

const getWeatherRecommendations = (condition: string, temperature: number): Recommendation[] => {
  const recommendations: Recommendation[] = []

  // Song recommendations based on weather
  if (condition === "Clear" && temperature > 20) {
    recommendations.push({
      type: "song",
      title: "Good as Hell",
      artist: "Lizzo",
      description: "Upbeat, empowering anthem perfect for sunny days",
      moodEffect: "improve",
      reasoning:
        "Sunny weather naturally boosts serotonin levels. This high-energy song amplifies those positive feelings and encourages confidence.",
    })
  } else if (condition === "Rainy") {
    recommendations.push({
      type: "song",
      title: "Weightless",
      artist: "Marconi Union",
      description: "Scientifically designed to reduce anxiety by 65%",
      moodEffect: "stabilize",
      reasoning:
        "Rainy weather can trigger melancholy. This ambient track uses specific harmonies and rhythms to regulate heart rate and reduce cortisol.",
    })
  } else if (condition === "Cloudy") {
    recommendations.push({
      type: "song",
      title: "Three Little Birds",
      artist: "Bob Marley",
      description: "Gentle, reassuring reggae classic",
      moodEffect: "improve",
      reasoning:
        "Overcast skies can dampen mood. This song's positive message and steady rhythm help counteract weather-induced lethargy.",
    })
  } else if (condition === "Snow") {
    recommendations.push({
      type: "song",
      title: "Winter",
      artist: "Max Richter",
      description: "Beautiful, contemplative classical piece",
      moodEffect: "stabilize",
      reasoning:
        "Snowy weather creates a peaceful atmosphere. This composition matches that tranquility while preventing seasonal mood dips.",
    })
  }

  // Activity recommendations based on weather
  if (condition === "Clear" && temperature > 15) {
    recommendations.push({
      type: "activity",
      title: "Nature Walk",
      description: "15-minute walk in sunlight",
      moodEffect: "improve",
      reasoning:
        "Sunlight exposure increases vitamin D and serotonin production. Walking outdoors combines light therapy with gentle exercise for maximum mood benefit.",
    })
  } else if (condition === "Rainy") {
    recommendations.push({
      type: "activity",
      title: "Cozy Reading",
      description: "Read by a window with warm tea",
      moodEffect: "stabilize",
      reasoning:
        "Rain sounds naturally reduce stress hormones. Combining this with reading creates a mindful, comforting experience that prevents weather-related mood drops.",
    })
  } else if (condition === "Cloudy") {
    recommendations.push({
      type: "activity",
      title: "Indoor Yoga",
      description: "Gentle 10-minute yoga flow",
      moodEffect: "improve",
      reasoning:
        "Cloudy weather reduces natural light, affecting energy levels. Yoga increases circulation and releases endorphins to counteract this effect.",
    })
  } else if (condition === "Snow") {
    recommendations.push({
      type: "activity",
      title: "Warm Bath",
      description: "Relaxing bath with essential oils",
      moodEffect: "stabilize",
      reasoning:
        "Cold weather can increase stress and tension. Warm water therapy relaxes muscles and triggers the release of calming neurotransmitters.",
    })
  }

  return recommendations
}

export default function WeatherMoodTracker() {
  const [state, setState] = useState<WeatherState>({ loading: true })
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])

  useEffect(() => {
    if (!navigator.geolocation) {
      setState({ loading: false, error: "Geolocation not supported." })
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords
          const res = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weathercode&timezone=auto`,
          )
          const data = await res.json()
          const temp = data.current.temperature_2m
          const code = data.current.weathercode
          const { label } = codeToCondition(code)

          const geo = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
          ).then((r) => r.json())

          const weatherState = {
            loading: false,
            temperature: temp,
            condition: label,
            city: geo.address?.city || geo.address?.town || geo.address?.village || "your area",
            weatherCode: code,
          }

          setState(weatherState)

          // Generate recommendations based on weather
          const recs = getWeatherRecommendations(label, temp)
          setRecommendations(recs)
        } catch (err) {
          setState({ loading: false, error: "Unable to retrieve weather." })
        }
      },
      () => setState({ loading: false, error: "Location permission denied." }),
    )
  }, [])

  if (state.loading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">WEATHER IMPACTS YOUR MOOD</h1>
          <p className="text-gray-600">Loading weather data and personalized recommendations...</p>
        </div>
        <Card className="flex items-center justify-center h-40">
          <Loader2 className="animate-spin" />
        </Card>
      </div>
    )
  }

  if (state.error) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">WEATHER IMPACTS YOUR MOOD</h1>
          <p className="text-gray-600">Enable location services to get personalized recommendations</p>
        </div>
        <Card className="p-6 text-center text-red-600">
          <p>{state.error}</p>
        </Card>
      </div>
    )
  }

  const { icon } = codeToCondition(state.weatherCode || 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          WEATHER IMPACTS YOUR MOOD
        </h1>
        <p className="text-gray-600">AI-powered recommendations based on current weather conditions</p>
      </div>

      {/* Current Weather */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader className="flex flex-row items-center gap-3">
          {icon}
          <div>
            <CardTitle className="text-2xl">Current Weather</CardTitle>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <MapPin className="h-4 w-4" /> {state.city}
            </p>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-5xl font-bold">{state.temperature?.toFixed(0)}°C</p>
              <p className="text-xl text-muted-foreground mt-1">{state.condition}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Weather affects your:</p>
              <div className="flex flex-col gap-1 mt-1">
                <Badge variant="outline">Energy Levels</Badge>
                <Badge variant="outline">Mood Stability</Badge>
                <Badge variant="outline">Sleep Quality</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Recommendations */}
      <div className="grid gap-6 md:grid-cols-2">
        {recommendations.map((rec, index) => (
          <Card key={index} className="relative overflow-hidden">
            <div
              className={`absolute top-0 right-0 w-20 h-20 ${
                rec.moodEffect === "improve" ? "bg-green-100" : "bg-blue-100"
              } rounded-bl-full flex items-start justify-end p-2`}
            >
              {rec.moodEffect === "improve" ? (
                <TrendingUp className="h-5 w-5 text-green-600" />
              ) : (
                <Minus className="h-5 w-5 text-blue-600" />
              )}
            </div>

            <CardHeader>
              <div className="flex items-center gap-3">
                {rec.type === "song" ? (
                  <Music className="h-6 w-6 text-purple-500" />
                ) : (
                  <Activity className="h-6 w-6 text-green-500" />
                )}
                <div>
                  <CardTitle className="text-lg">{rec.title}</CardTitle>
                  {rec.artist && <p className="text-sm text-gray-600">by {rec.artist}</p>}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-gray-700">{rec.description}</p>

              <div
                className={`p-3 rounded-lg ${
                  rec.moodEffect === "improve"
                    ? "bg-green-50 border border-green-200"
                    : "bg-blue-50 border border-blue-200"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Badge
                    className={
                      rec.moodEffect === "improve" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                    }
                  >
                    Will {rec.moodEffect} your mood
                  </Badge>
                </div>
                <p className="text-sm text-gray-700">
                  <strong>Why this works:</strong> {rec.reasoning}
                </p>
              </div>

              <Button className="w-full" variant={rec.moodEffect === "improve" ? "default" : "outline"}>
                {rec.type === "song" ? "Listen Now" : "Try This Activity"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Weather Science */}
      <Card className="bg-gradient-to-r from-indigo-50 to-cyan-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sun className="h-5 w-5 text-yellow-500" />
            How Weather Affects Your Mood
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Sunlight & Serotonin</h4>
              <p className="text-sm text-gray-600">
                Bright light increases serotonin production, boosting mood and energy levels naturally.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Barometric Pressure</h4>
              <p className="text-sm text-gray-600">
                Changes in air pressure can affect neurotransmitter levels and trigger mood changes.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Temperature Effects</h4>
              <p className="text-sm text-gray-600">
                Extreme temperatures can increase stress hormones and affect sleep quality.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Seasonal Patterns</h4>
              <p className="text-sm text-gray-600">
                Reduced daylight in winter can trigger Seasonal Affective Disorder (SAD).
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
