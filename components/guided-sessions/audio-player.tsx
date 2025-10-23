"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react"

interface AudioPlayerProps {
  session: {
    title: string
    audioUrl: string
    duration: string
  }
}

export default function AudioPlayer({ session }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(80)
  const [isMuted, setIsMuted] = useState(false)

  const audioRef = useRef<HTMLAudioElement | null>(null)

  // For demo purposes, convert the duration string to seconds
  const getDurationInSeconds = (durationStr: string) => {
    const match = durationStr.match(/(\d+)\s*min/)
    if (match && match[1]) {
      return Number.parseInt(match[1]) * 60
    }
    return 300 // Default 5 minutes
  }

  useEffect(() => {
    // In a real app, this would be an actual audio element
    // For demo purposes, we'll simulate the audio duration
    setDuration(getDurationInSeconds(session.duration))

    // Create audio element for demo
    if (!audioRef.current) {
      audioRef.current = new Audio()
      audioRef.current.volume = volume / 100
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
      }
    }
  }, [session])

  // Simulate playback for demo purposes
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          const newTime = prev + 1
          if (newTime >= duration) {
            setIsPlaying(false)
            return 0
          }
          return newTime
        })
      }, 1000)
    } else if (interval) {
      clearInterval(interval)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isPlaying, duration])

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleTimeChange = (value: number[]) => {
    setCurrentTime(value[0])
  }

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0]
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100
    }
    if (newVolume === 0) {
      setIsMuted(true)
    } else {
      setIsMuted(false)
    }
  }

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false)
      if (audioRef.current) {
        audioRef.current.volume = volume / 100
      }
    } else {
      setIsMuted(true)
      if (audioRef.current) {
        audioRef.current.volume = 0
      }
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  const restart = () => {
    setCurrentTime(0)
  }

  const forward30 = () => {
    setCurrentTime((prev) => Math.min(prev + 30, duration))
  }

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500 w-12 text-right">{formatTime(currentTime)}</span>
        <Slider value={[currentTime]} max={duration} step={1} onValueChange={handleTimeChange} className="flex-1" />
        <span className="text-sm text-gray-500 w-12">{formatTime(duration)}</span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={toggleMute}>
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>
          <Slider
            value={[isMuted ? 0 : volume]}
            max={100}
            step={1}
            onValueChange={handleVolumeChange}
            className="w-24"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={restart}>
            <SkipBack className="h-4 w-4" />
          </Button>
          <Button size="lg" className="rounded-full" onClick={togglePlayPause}>
            {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
          </Button>
          <Button variant="outline" size="icon" onClick={forward30}>
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>
        <div className="w-[88px]"></div> {/* Spacer for alignment */}
      </div>
    </div>
  )
}
