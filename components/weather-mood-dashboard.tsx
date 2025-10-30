"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Loader2,
  MapPin,
  Sun,
  CloudRain,
  Snowflake,
  Zap,
  AlertCircle,
  Droplets,
  Wind,
  Cloud,
  TrendingUp,
} from "lucide-react"
import Link from "next/link"
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

const codeToCondition = (code: number): { label: string; icon: JSX.Element } => {
  if ([0].includes(code)) return { label: "Clear", icon: <Sun className="h-5 w-5 text-yellow-500" /> }
  if ([1, 2, 3].includes(code)) return { label: "Cloudy", icon: <Cloud className="h-5 w-5 text-gray-500" /> }
  if ([61, 63, 65, 80, 81, 82].includes(code))
    return { label: "Rainy", icon: <CloudRain className="h-5 w-5 text-blue-500" /> }
  if ([71, 73, 75, 85, 86].includes(code))
    return { label: "Snow", icon: <Snowflake className="h-5 w-5 text-cyan-400" /> }
  if ([95, 96, 99].includes(code)) return { label: "Thunderstorm", icon: <Zap className="h-5 w-5 text-purple-600" /> }
  return { label: "Unknown", icon: <Cloud className="h-5 w-5 text-gray-500" /> }
}

const getWeatherMoodImpact = (condition: string, temperature: number): {
  impact: string
  moodRisk: "low" | "medium" | "high"
  quickTip: string
} => {
  if (condition === "Clear" && temperature > 20) {
    return {
      impact: "Positive - Great for mood",
      moodRisk: "low",
      quickTip: "Spend 15-30 minutes outdoors for natural mood enhancement"
    }
  } else if (condition === "Rainy") {
    return {
      impact: "Mixed - May affect energy",
      moodRisk: "medium",
      quickTip: "Stay active indoors to prevent lethargy"
    }
  } else if (condition === "Cloudy") {
    return {
      impact: "Neutral - Reduced sunlight",
      moodRisk: "medium",
      quickTip: "Indoor exercise can boost endorphins"
    }
  } else if (condition === "Thunderstorm") {
    return {
      impact: "Variable - Can cause anxiety",
      moodRisk: "high",
      quickTip: "Practice grounding techniques if anxious"
    }
  } else {
    return {
      impact: "Stable",
      moodRisk: "low",
      quickTip: "Maintain regular routine"
    }
  }
}

export default function WeatherMoodDashboard() {
  const [state, setState] = useState<WeatherState>({ loading: true })

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
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relativehumidity_2m,weathercode,windspeed_10m&timezone=auto`
          )
          const data = await res.json()
          
          const temp = data.current.temperature_2m
          const code = data.current.weathercode
          const humidity = data.current.relativehumidity_2m
          const windSpeed = data.current.windspeed_10m

          const geo = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          ).then((r) => r.json())

          setState({
            loading: false,
            temperature: temp,
            condition: codeToCondition(code).label,
            city: geo.address?.city || geo.address?.town || geo.address?.village || "your area",
            weatherCode: code,
            humidity,
            windSpeed
          })
        } catch (err) {
          setState({ loading: false, error: "Unable to retrieve weather." })
        }
      },
      () => setState({ loading: false, error: "Location permission denied." })
    )
  }, [])

  const { icon } = codeToCondition(state.weatherCode || 0)
  const { impact, moodRisk, quickTip } = getWeatherMoodImpact(state.condition || "", state.temperature || 0)

  if (state.loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Weather & Mood
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-32">
          <Loader2 className="animate-spin h-6 w-6" />
        </CardContent>
      </Card>
    )
  }

  if (state.error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Weather & Mood
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            <span>{state.error}</span>
          </div>
          <Link href="/weather-mood" className="mt-3 block">
            <Button variant="outline" size="sm" className="w-full">View Full Forecast</Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {icon}
            Weather & Mood
          </CardTitle>
          <Link href="/weather-mood">
            <Button variant="ghost" size="sm">View Details</Button>
          </Link>
        </div>
        <CardDescription className="flex items-center gap-1 mt-1">
          <MapPin className="h-3 w-3" /> {state.city}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-3xl font-bold">{state.temperature?.toFixed(0)}°C</p>
            <p className="text-sm text-muted-foreground">{state.condition}</p>
          </div>
          <div className="text-right space-y-1">
            <Badge variant={moodRisk === "low" ? "default" : moodRisk === "medium" ? "secondary" : "destructive"}>
              {moodRisk.toUpperCase()} Risk
            </Badge>
            <p className="text-xs text-muted-foreground">{impact}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Droplets className="h-4 w-4 text-blue-500" />
            <span className="text-muted-foreground">Humidity:</span>
            <span className="font-semibold">{state.humidity}%</span>
          </div>
          <div className="flex items-center gap-2">
            <Wind className="h-4 w-4 text-gray-500" />
            <span className="text-muted-foreground">Wind:</span>
            <span className="font-semibold">{state.windSpeed?.toFixed(1)} km/h</span>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
          <div className="flex items-start gap-2">
            <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-blue-900 mb-1">Quick Tip:</p>
              <p className="text-xs text-blue-800">{quickTip}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

