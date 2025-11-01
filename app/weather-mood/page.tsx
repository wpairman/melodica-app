"use client"

import { useEffect, useState } from "react"
import DashboardLayout from "@/components/layouts/dashboard-layout"
import { MenuButton } from "@/components/navigation-sidebar"
import { AuthGuard } from "@/components/auth-guard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
  AlertCircle,
  Droplets,
  Wind,
} from "lucide-react"
import type { JSX } from "react/jsx-runtime"

type WeatherState = {
  loading: boolean
  error?: string
  temperature?: number
  condition?: string
  city?: string
  weatherCode?: number
  humidity?: number
  windSpeed?: number
}

type ForecastHour = {
  time: string
  temp: number
  condition: string
  code: number
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
  if ([0].includes(code)) return { label: "Clear", icon: <Sun className="h-6 w-6 text-yellow-500" /> }
  if ([1, 2, 3].includes(code)) return { label: "Cloudy", icon: <Cloud className="h-6 w-6 text-gray-500" /> }
  if ([61, 63, 65, 80, 81, 82].includes(code))
    return { label: "Rainy", icon: <CloudRain className="h-6 w-6 text-blue-500" /> }
  if ([71, 73, 75, 85, 86].includes(code))
    return { label: "Snow", icon: <Snowflake className="h-6 w-6 text-cyan-400" /> }
  if ([95, 96, 99].includes(code)) return { label: "Thunderstorm", icon: <Zap className="h-6 w-6 text-purple-600" /> }
  return { label: "Unknown", icon: <Cloud className="h-6 w-6 text-gray-500" /> }
}

const getWeatherMoodImpact = (condition: string, temperature: number): {
  impact: string
  tips: string[]
  moodRisk: "low" | "medium" | "high"
} => {
  if (condition === "Clear" && temperature > 20) {
    return {
      impact: "Positive - Sunny weather boosts serotonin and vitamin D production",
      tips: [
        "Spend 15-30 minutes outdoors for natural mood enhancement",
        "Sunlight helps regulate circadian rhythms for better sleep",
        "Natural light exposure reduces stress and anxiety"
      ],
      moodRisk: "low"
    }
  } else if (condition === "Rainy") {
    return {
      impact: "Mixed - Rain can be calming but may trigger low energy",
      tips: [
        "Use rain sounds for relaxation and meditation",
        "Stay active indoors to prevent lethargy",
        "Rainy weather is perfect for cozy, mindful activities"
      ],
      moodRisk: "medium"
    }
  } else if (condition === "Cloudy") {
    return {
      impact: "Neutral - Reduced sunlight can affect energy levels",
      tips: [
        "Consider light therapy if cloudy weather persists",
        "Indoor exercise can boost endorphins",
        "Stay social to counteract weather-induced mood dips"
      ],
      moodRisk: "medium"
    }
  } else if (condition === "Thunderstorm") {
    return {
      impact: "Variable - Can cause anxiety in some, calm in others",
      tips: [
        "Practice grounding techniques if thunderstorms cause anxiety",
        "Create a safe, cozy indoor space",
        "Thunderstorm sounds can be therapeutic for some"
      ],
      moodRisk: "high"
    }
  } else {
    return {
      impact: "Stable - Current weather conditions are neutral",
      tips: [
        "Maintain regular routine and activities",
        "Focus on consistent self-care practices"
      ],
      moodRisk: "low"
    }
  }
}

const getWeatherRecommendations = (condition: string, temperature: number): Recommendation[] => {
  const recommendations: Recommendation[] = []

  // Song recommendations
  if (condition === "Clear" && temperature > 20) {
    recommendations.push({
      type: "song",
      title: "Walking on Sunshine",
      artist: "Katrina & The Waves",
      description: "Upbeat anthem perfect for sunny days",
      moodEffect: "improve",
      reasoning: "Sunny weather naturally boosts serotonin. This high-energy song amplifies positive feelings."
    })
  } else if (condition === "Rainy") {
    recommendations.push({
      type: "song",
      title: "Weightless",
      artist: "Marconi Union",
      description: "Scientifically designed to reduce anxiety by 65%",
      moodEffect: "stabilize",
      reasoning: "Rainy weather can trigger melancholy. This ambient track helps regulate heart rate and reduce cortisol."
    })
  } else if (condition === "Cloudy") {
    recommendations.push({
      type: "song",
      title: "Three Little Birds",
      artist: "Bob Marley",
      description: "Gentle, reassuring reggae classic",
      moodEffect: "improve",
      reasoning: "Overcast skies can dampen mood. This song's positive message helps counteract weather-induced lethargy."
    })
  }

  // Activity recommendations
  if (condition === "Clear" && temperature > 15) {
    recommendations.push({
      type: "activity",
      title: "Nature Walk",
      description: "15-30 minute walk in sunlight",
      moodEffect: "improve",
      reasoning: "Sunlight exposure increases vitamin D and serotonin production. Walking combines light therapy with exercise."
    })
  } else if (condition === "Rainy") {
    recommendations.push({
      type: "activity",
      title: "Cozy Reading Session",
      description: "Read by a window with warm tea",
      moodEffect: "stabilize",
      reasoning: "Rain sounds naturally reduce stress hormones. Combining this with reading creates a mindful, comforting experience."
    })
  } else if (condition === "Cloudy") {
    recommendations.push({
      type: "activity",
      title: "Indoor Yoga Flow",
      description: "Gentle 10-15 minute yoga session",
      moodEffect: "improve",
      reasoning: "Cloudy weather reduces natural light, affecting energy. Yoga increases circulation and releases endorphins."
    })
  }

  return recommendations
}

export default function WeatherMoodPage() {
  const [state, setState] = useState<WeatherState>({ loading: true })
  const [forecast, setForecast] = useState<ForecastHour[]>([])
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [currentDate, setCurrentDate] = useState<string>("")

  useEffect(() => {
    if (typeof window === 'undefined') return
    
    // Set current date (client-side only to avoid hydration issues)
    setCurrentDate(new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }))

    if (!navigator.geolocation) {
      setState({ loading: false, error: "Geolocation not supported." })
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords
          
          // Get current weather and hourly forecast
          const res = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relativehumidity_2m,weathercode,windspeed_10m&hourly=temperature_2m,weathercode&timezone=auto&forecast_days=1`
          )
          const data = await res.json()
          
          const temp = data.current.temperature_2m
          const code = data.current.weathercode
          const humidity = data.current.relativehumidity_2m
          const windSpeed = data.current.windspeed_10m
          const { label } = codeToCondition(code)

          // Get location name
          const geo = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          ).then((r) => r.json())

          // Process hourly forecast for today
          const hours: ForecastHour[] = []
          const now = new Date()
          const currentHour = now.getHours()
          
          for (let i = 0; i < 24; i++) {
            const hourIndex = currentHour + i
            if (hourIndex < data.hourly.temperature_2m.length && hourIndex < data.hourly.weathercode.length) {
              hours.push({
                time: `${hourIndex % 24}:00`,
                temp: data.hourly.temperature_2m[hourIndex],
                code: data.hourly.weathercode[hourIndex],
                condition: codeToCondition(data.hourly.weathercode[hourIndex]).label
              })
            }
          }

          setState({
            loading: false,
            temperature: temp,
            condition: label,
            city: geo.address?.city || geo.address?.town || geo.address?.village || "your area",
            weatherCode: code,
            humidity,
            windSpeed
          })
          
          setForecast(hours.slice(0, 12)) // Show next 12 hours
          
          // Generate recommendations
          const recs = getWeatherRecommendations(label, temp)
          setRecommendations(recs)
        } catch (err) {
          setState({ loading: false, error: "Unable to retrieve weather." })
        }
      },
      () => setState({ loading: false, error: "Location permission denied." })
    )
  }, [])

  const { impact, tips, moodRisk } = getWeatherMoodImpact(state.condition || "", state.temperature || 0)
  const { icon } = codeToCondition(state.weatherCode || 0)

  return (
    <AuthGuard>
      <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
        <div className="sticky top-0 z-50 bg-gray-900 border-b border-gray-700 px-6 py-4 flex items-center gap-4">
          <MenuButton />
          <h1 className="text-2xl font-bold tracking-tight text-white">Weather & Mood</h1>
        </div>

        <div className="p-6">
          {state.loading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <Loader2 className="animate-spin h-8 w-8" />
            </div>
          ) : state.error ? (
            <Card className="p-6 text-center bg-gray-800 border-gray-700">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
              <h3 className="text-lg font-semibold mb-2 text-white">Unable to Load Weather</h3>
              <p className="text-gray-300">{state.error}</p>
            </Card>
          ) : (
            <div className="max-w-6xl mx-auto space-y-6">
              {/* Current Weather Card */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {icon}
                      <div>
                        <CardTitle className="text-2xl text-white">Today's Weather</CardTitle>
                        {currentDate ? (
                          <p className="text-gray-300 text-base mt-1 mb-1 font-medium">{currentDate}</p>
                        ) : (
                          <p className="text-gray-300 text-base mt-1 mb-1 font-medium">
                            {typeof window !== 'undefined' && new Date().toLocaleDateString('en-US', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </p>
                        )}
                        <CardDescription className="flex items-center gap-1 mt-1 text-gray-300">
                          <MapPin className="h-4 w-4" /> {state.city}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-5xl font-bold text-white">{state.temperature?.toFixed(0)}°C</p>
                      <p className="text-lg text-gray-300">{state.condition}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <Droplets className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="text-sm text-gray-400">Humidity</p>
                        <p className="font-semibold text-white">{state.humidity}%</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Wind className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-400">Wind</p>
                        <p className="font-semibold text-white">{state.windSpeed?.toFixed(1)} km/h</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={moodRisk === "low" ? "default" : moodRisk === "medium" ? "secondary" : "destructive"}>
                        Mood Risk: {moodRisk}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Weather Forecast for Today */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Hourly Forecast</CardTitle>
                  <CardDescription className="text-gray-300">Weather outlook for the next 12 hours</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                    {forecast.map((hour, index) => {
                      const { icon: hourIcon } = codeToCondition(hour.code)
                      return (
                        <div key={index} className="text-center p-3 rounded-lg border border-gray-700 bg-gray-700/50">
                          <p className="text-sm font-medium text-white">{hour.time}</p>
                          <div className="my-2 flex justify-center">{hourIcon}</div>
                          <p className="text-lg font-bold text-white">{hour.temp.toFixed(0)}°C</p>
                          <p className="text-xs text-gray-400">{hour.condition}</p>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Mood Impact Analysis */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">How Today's Weather Affects Your Mood</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-lg border border-gray-700 bg-gray-700/50">
                    <p className="font-semibold mb-2 text-white">Impact Assessment:</p>
                    <p className="text-gray-300">{impact}</p>
                  </div>
                  <div>
                    <p className="font-semibold mb-2 text-white">Tips to Improve or Stabilize Your Mood:</p>
                    <ul className="space-y-2">
                      {tips.map((tip, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="mt-1 text-blue-400">•</span>
                          <span className="text-gray-300">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Recommendations */}
              {recommendations.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-white">Personalized Recommendations</h2>
                  <div className="grid gap-4 md:grid-cols-2">
                    {recommendations.map((rec, index) => (
                      <Card key={index} className="bg-gray-800 border-gray-700">
                        <CardHeader>
                          <div className="flex items-center gap-2">
                            {rec.type === "song" ? (
                              <Music className="h-5 w-5 text-purple-500" />
                            ) : (
                              <Activity className="h-5 w-5 text-green-500" />
                            )}
                            <CardTitle className="text-white">{rec.title}</CardTitle>
                            {rec.artist && <CardDescription className="text-gray-300">by {rec.artist}</CardDescription>}
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <p className="text-gray-300">{rec.description}</p>
                          <Badge variant={rec.moodEffect === "improve" ? "default" : "secondary"}>
                            Will {rec.moodEffect} your mood
                          </Badge>
                          <div className="p-3 rounded-lg border border-gray-700 bg-gray-700/50">
                            <p className="text-sm text-gray-300"><strong className="text-white">Why this works:</strong> <span>{rec.reasoning}</span></p>
                          </div>
                          <Button className="w-full">
                            {rec.type === "song" ? "Listen Now" : "Try This Activity"}
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
    </AuthGuard>
  )
}

