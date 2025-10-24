"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Play, Pause, Volume2, Sparkles, Flower, TreePine } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface MoodEntry {
  mood: number
  timestamp: Date
  notes?: string
}

interface VirtualGardenProps {
  moodHistory: MoodEntry[]
}

interface Plant {
  id: string
  type: "flower" | "tree" | "bush"
  mood: number
  stage: "seed" | "sprout" | "growing" | "bloomed" | "flourishing"
  position: { x: number; y: number }
  timestamp: Date
}

export default function VirtualGarden({ moodHistory }: VirtualGardenProps) {
  const { toast } = useToast()
  const [plants, setPlants] = useState<Plant[]>([])
  const [gardenStage, setGardenStage] = useState<"empty" | "growing" | "blossoming" | "reflective">("empty")
  const [showReflectiveSpace, setShowReflectiveSpace] = useState(false)
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const [currentAudio, setCurrentAudio] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const reflectiveAudios = [
    { name: "Forest Sounds", description: "Gentle forest ambiance for reflection", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
    { name: "Ocean Waves", description: "Calming ocean waves", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
    { name: "Rain Meditation", description: "Soft rain for mindfulness", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
    { name: "Wind Chimes", description: "Peaceful wind chimes", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3" },
  ]

  useEffect(() => {
    generateGarden()
  }, [moodHistory])

  const generateGarden = () => {
    if (moodHistory.length === 0) {
      setGardenStage("empty")
      setPlants([])
      return
    }

    const newPlants: Plant[] = moodHistory.map((entry, index) => {
      const plantType = entry.mood <= 3 ? "bush" : entry.mood <= 6 ? "flower" : "tree"
      const stage = getPlantStage(index, moodHistory.length)

      return {
        id: `plant-${index}`,
        type: plantType,
        mood: entry.mood,
        stage,
        position: generatePosition(index, moodHistory.length),
        timestamp: entry.timestamp,
      }
    })

    setPlants(newPlants)

    // Determine garden stage
    if (moodHistory.length >= 30) {
      setGardenStage("reflective")
    } else if (moodHistory.length >= 7) {
      setGardenStage("blossoming")
    } else {
      setGardenStage("growing")
    }
  }

  const getPlantStage = (index: number, totalPlants: number): Plant["stage"] => {
    if (totalPlants >= 30) return "flourishing"
    if (totalPlants >= 7) return "bloomed"
    if (index < totalPlants - 3) return "growing"
    if (index < totalPlants - 1) return "sprout"
    return "seed"
  }

  const generatePosition = (index: number, total: number) => {
    const cols = Math.ceil(Math.sqrt(total))
    const row = Math.floor(index / cols)
    const col = index % cols

    // Add some randomness for natural look
    const baseX = (col / (cols - 1 || 1)) * 80 + 10
    const baseY = (row / (Math.ceil(total / cols) - 1 || 1)) * 70 + 15

    return {
      x: baseX + (Math.random() - 0.5) * 10,
      y: baseY + (Math.random() - 0.5) * 10,
    }
  }

  const getPlantEmoji = (plant: Plant) => {
    const { type, stage, mood } = plant

    if (stage === "seed") return "🌱"
    if (stage === "sprout") return "🌿"

    if (type === "flower") {
      if (stage === "growing") return "🌸"
      if (stage === "bloomed") return mood >= 8 ? "🌺" : "🌼"
      if (stage === "flourishing") return "🌻"
    }

    if (type === "tree") {
      if (stage === "growing") return "🌳"
      if (stage === "bloomed") return "🌲"
      if (stage === "flourishing") return "🌴"
    }

    if (type === "bush") {
      if (stage === "growing") return "🌿"
      if (stage === "bloomed") return "🍀"
      if (stage === "flourishing") return "🌾"
    }

    return "🌱"
  }

  const getPlantSize = (stage: Plant["stage"]) => {
    switch (stage) {
      case "seed":
        return "text-sm"
      case "sprout":
        return "text-base"
      case "growing":
        return "text-lg"
      case "bloomed":
        return "text-xl"
      case "flourishing":
        return "text-2xl"
      default:
        return "text-base"
    }
  }

  const playAudio = (audioUrl: string, audioName: string) => {
    if (audioRef.current) {
      audioRef.current.pause()
    }

    // Actually play the audio
    if (audioRef.current) {
      audioRef.current.src = audioUrl
      audioRef.current.play().catch((error) => {
        console.error("Error playing audio:", error)
        toast({
          title: "Audio Error",
          description: "Could not play audio. Please try again.",
          variant: "destructive",
        })
      })
    }

    setCurrentAudio(audioName)
    setIsPlayingAudio(true)

    toast({
      title: "🎵 Now Playing",
      description: `${audioName} - Perfect for reflection`,
    })
  }

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setIsPlayingAudio(false)
    setCurrentAudio(null)
  }

  const getGardenBackground = () => {
    switch (gardenStage) {
      case "empty":
        return "bg-gradient-to-b from-amber-50 to-yellow-100"
      case "growing":
        return "bg-gradient-to-b from-green-50 to-emerald-100"
      case "blossoming":
        return "bg-gradient-to-b from-pink-50 via-purple-50 to-blue-100"
      case "reflective":
        return "bg-gradient-to-b from-indigo-100 via-purple-100 to-pink-100"
      default:
        return "bg-gradient-to-b from-green-50 to-emerald-100"
    }
  }

  const getGardenTitle = () => {
    switch (gardenStage) {
      case "empty":
        return "Your Garden Awaits"
      case "growing":
        return "Your Growing Garden"
      case "blossoming":
        return "🌸 Your Blossoming Garden 🌸"
      case "reflective":
        return "✨ Your Reflective Sanctuary ✨"
      default:
        return "Your Garden"
    }
  }

  const getGardenDescription = () => {
    switch (gardenStage) {
      case "empty":
        return "Start logging your moods to plant your first seeds"
      case "growing":
        return `${plants.length} plants growing strong! Keep nurturing your emotional garden.`
      case "blossoming":
        return "Congratulations! Your consistent care has made your garden bloom beautifully."
      case "reflective":
        return "Your garden has become a sacred space for reflection and growth. Enjoy the peaceful ambiance."
      default:
        return "Track your emotional journey through your personal garden"
    }
  }

  return (
    <div className="space-y-6">
      <Card className={`${getGardenBackground()} border-2`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {gardenStage === "reflective" ? (
                  <Sparkles className="h-5 w-5 text-purple-500" />
                ) : gardenStage === "blossoming" ? (
                  <Flower className="h-5 w-5 text-pink-500" />
                ) : (
                  <TreePine className="h-5 w-5 text-green-500" />
                )}
                {getGardenTitle()}
              </CardTitle>
              <CardDescription className={gardenStage === "reflective" ? "text-blue-400" : ""}>{getGardenDescription()}</CardDescription>
            </div>
            {gardenStage === "reflective" && (
              <Button onClick={() => setShowReflectiveSpace(true)} className="bg-purple-600 hover:bg-purple-700">
                <Volume2 className="h-4 w-4 mr-2" />
                Enter Reflective Space
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {gardenStage === "empty" ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="text-6xl mb-4">🌱</div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">Plant Your First Seed</h3>
              <p className="text-gray-500">Log your first mood to start growing your emotional garden</p>
            </div>
          ) : (
            <div className="relative min-h-[300px] rounded-lg overflow-hidden">
              {/* Garden Background Elements */}
              <div className="absolute inset-0">
                {gardenStage === "blossoming" && (
                  <div className="absolute inset-0 opacity-20">
                    <div className="animate-pulse">🌸 🌺 🌼 🌻 🌷</div>
                  </div>
                )}
                {gardenStage === "reflective" && (
                  <div className="absolute inset-0 opacity-30">
                    <div className="animate-pulse">✨ 🌟 💫 ⭐ 🌙</div>
                  </div>
                )}
              </div>

              {/* Plants */}
              {plants.map((plant) => (
                <div
                  key={plant.id}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500 hover:scale-110 cursor-pointer ${getPlantSize(plant.stage)}`}
                  style={{
                    left: `${plant.position.x}%`,
                    top: `${plant.position.y}%`,
                  }}
                  title={`Mood: ${plant.mood}/10 - ${new Date(plant.timestamp).toLocaleDateString()}`}
                >
                  <div className="relative">
                    <span className="drop-shadow-sm">{getPlantEmoji(plant)}</span>
                    {plant.stage === "flourishing" && <div className="absolute -top-1 -right-1 text-xs">✨</div>}
                  </div>
                </div>
              ))}

              {/* Garden Stats */}
              <div className="absolute bottom-4 left-4 flex gap-2">
                <Badge variant="secondary" className="bg-white/80">
                  {plants.length} Plants
                </Badge>
                {gardenStage === "blossoming" && (
                  <Badge variant="secondary" className="bg-pink-100 text-pink-700">
                    🌸 Blossoming
                  </Badge>
                )}
                {gardenStage === "reflective" && (
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                    ✨ Reflective
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reflective Space Dialog */}
      <Dialog open={showReflectiveSpace} onOpenChange={setShowReflectiveSpace}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">✨ Your Reflective Sanctuary ✨</DialogTitle>
            <DialogDescription className="text-center">
              You've cultivated 30 days of emotional growth. This sacred space is yours for reflection and peace.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="text-center">
              <div className="text-4xl mb-4">🌸 🌺 🌻 🌷 🌼</div>
              <p className="text-gray-600">
                Your consistent emotional care has transformed your garden into a sanctuary of growth and wisdom.
              </p>
            </div>

            <Tabs defaultValue="audio" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="audio">Ambient Sounds</TabsTrigger>
                <TabsTrigger value="reflection">Reflection Prompts</TabsTrigger>
              </TabsList>

              <TabsContent value="audio" className="space-y-4">
                <div className="grid gap-3">
                  {reflectiveAudios.map((audio, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium">{audio.name}</h4>
                        <p className="text-sm text-gray-600">{audio.description}</p>
                      </div>
                      <Button
                        size="sm"
                        variant={currentAudio === audio.name ? "secondary" : "outline"}
                        onClick={() => (currentAudio === audio.name ? stopAudio() : playAudio(audio.url, audio.name))}
                      >
                        {currentAudio === audio.name ? (
                          <>
                            <Pause className="h-4 w-4 mr-1" />
                            Stop
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-1" />
                            Play
                          </>
                        )}
                      </Button>
                    </div>
                  ))}
                </div>

                {isPlayingAudio && (
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="flex items-center justify-center gap-2 text-purple-700">
                      <Volume2 className="h-4 w-4" />
                      <span>Now playing: {currentAudio}</span>
                    </div>
                    <p className="text-sm text-purple-600 mt-1">Let the sounds guide your reflection and inner peace</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="reflection" className="space-y-4">
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-2">🌱 Growth Reflection</h4>
                    <p className="text-blue-700 text-sm">
                      "Looking at your garden, what growth do you see in yourself over these 30 days?"
                    </p>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-800 mb-2">🌸 Gratitude Moment</h4>
                    <p className="text-green-700 text-sm">
                      "What are three things you're grateful for in your emotional journey?"
                    </p>
                  </div>

                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-medium text-purple-800 mb-2">✨ Future Intentions</h4>
                    <p className="text-purple-700 text-sm">
                      "How do you want to continue nurturing your emotional well-being?"
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>

      <audio ref={audioRef} />
    </div>
  )
}
