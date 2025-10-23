"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Play, ExternalLink, Activity, Music, Heart, Phone } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function GroundMe() {
  const [isOpen, setIsOpen] = useState(false)

  const calmingPlaylists = [
    {
      title: "Anxiety Relief",
      description: "Gentle instrumental music to help reduce anxiety",
      duration: "15 min",
      tracks: ["Weightless - Marconi Union", "Clair de Lune - Debussy", "Gymnopédie No.1 - Erik Satie"],
    },
    {
      title: "Panic Attack Recovery",
      description: "Slow, rhythmic music to help regulate breathing",
      duration: "10 min",
      tracks: ["Deep Calm - Max Richter", "On Earth as It Is in Heaven - Ólafur Arnalds", "Porcelain - Moby"],
    },
    {
      title: "Grounding Sounds",
      description: "Nature sounds and ambient music for grounding",
      duration: "20 min",
      tracks: ["Rain on Leaves", "Ocean Waves", "Forest Ambience"],
    },
  ]

  const breathingExercises = [
    {
      name: "4-7-8 Breathing",
      description: "Inhale for 4, hold for 7, exhale for 8",
      duration: "3-5 minutes",
      steps: [
        "Sit comfortably with your back straight",
        "Place tongue tip behind upper front teeth",
        "Exhale completely through your mouth",
        "Inhale through nose for 4 counts",
        "Hold breath for 7 counts",
        "Exhale through mouth for 8 counts",
        "Repeat 3-4 times",
      ],
    },
    {
      name: "Box Breathing",
      description: "Equal counts for inhale, hold, exhale, hold",
      duration: "5-10 minutes",
      steps: [
        "Sit in a comfortable position",
        "Inhale slowly for 4 counts",
        "Hold your breath for 4 counts",
        "Exhale slowly for 4 counts",
        "Hold empty for 4 counts",
        "Repeat the cycle",
      ],
    },
    {
      name: "5-4-3-2-1 Grounding",
      description: "Sensory grounding technique",
      duration: "2-3 minutes",
      steps: [
        "Name 5 things you can see",
        "Name 4 things you can touch",
        "Name 3 things you can hear",
        "Name 2 things you can smell",
        "Name 1 thing you can taste",
        "Take slow, deep breaths",
      ],
    },
  ]

  const activities = [
    {
      name: "Progressive Muscle Relaxation",
      description: "Tense and release muscle groups",
      duration: "10-15 minutes",
      icon: Activity,
    },
    {
      name: "Cold Water on Wrists",
      description: "Run cold water over your wrists and behind your ears",
      duration: "2-3 minutes",
      icon: Heart,
    },
    {
      name: "Gentle Movement",
      description: "Light stretching or slow walking",
      duration: "5-10 minutes",
      icon: Activity,
    },
    {
      name: "Mindful Observation",
      description: "Focus intently on a single object",
      duration: "3-5 minutes",
      icon: Heart,
    },
  ]

  const resources = [
    {
      name: "Crisis Text Line",
      contact: "Text HOME to 741741",
      description: "24/7 crisis support via text message",
      urgent: true,
    },
    {
      name: "National Suicide Prevention Lifeline",
      contact: "988",
      description: "24/7 free and confidential support",
      urgent: true,
    },
    {
      name: "SAMHSA National Helpline",
      contact: "1-800-662-4357",
      description: "Treatment referral and information service",
      urgent: false,
    },
    {
      name: "Crisis Chat",
      contact: "suicidepreventionlifeline.org/chat",
      description: "Online chat support",
      urgent: false,
    },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="fixed bottom-4 right-4 z-50 bg-red-500 hover:bg-red-600 text-white border-red-500 shadow-lg"
          size="lg"
        >
          <AlertTriangle className="h-5 w-5 mr-2" />
          Ground Me
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-6 w-6" />
            Ground Me - You're Not Alone
          </DialogTitle>
          <DialogDescription>
            If you're experiencing a panic attack, anxiety, or emotional crisis, these resources can help you right now.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Immediate Crisis Resources */}
          <Card className="border-red-200 bg-red-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-red-800 flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Immediate Help Available
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {resources
                .filter((resource) => resource.urgent)
                .map((resource, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                    <div>
                      <h4 className="font-medium text-red-800">{resource.name}</h4>
                      <p className="text-sm text-red-600">{resource.description}</p>
                    </div>
                    <Badge variant="destructive" className="font-mono">
                      {resource.contact}
                    </Badge>
                  </div>
                ))}
            </CardContent>
          </Card>

          <Tabs defaultValue="breathing" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="breathing">Breathing</TabsTrigger>
              <TabsTrigger value="music">Music</TabsTrigger>
              <TabsTrigger value="activities">Activities</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
            </TabsList>

            <TabsContent value="breathing" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Breathing Exercises</CardTitle>
                  <CardDescription>
                    These techniques can help regulate your breathing and calm your nervous system
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {breathingExercises.map((exercise, index) => (
                    <Card key={index} className="border-blue-200">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{exercise.name}</CardTitle>
                            <CardDescription>{exercise.description}</CardDescription>
                          </div>
                          <Badge variant="outline">{exercise.duration}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <ol className="list-decimal list-inside space-y-1 text-sm">
                          {exercise.steps.map((step, stepIndex) => (
                            <li key={stepIndex}>{step}</li>
                          ))}
                        </ol>
                      </CardContent>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="music" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Calming Playlists</CardTitle>
                  <CardDescription>Music specifically chosen to help reduce anxiety and promote calm</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {calmingPlaylists.map((playlist, index) => (
                    <Card key={index} className="border-green-200">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{playlist.title}</CardTitle>
                            <CardDescription>{playlist.description}</CardDescription>
                          </div>
                          <Badge variant="outline">{playlist.duration}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm">Featured tracks:</h4>
                          <ul className="text-sm space-y-1">
                            {playlist.tracks.map((track, trackIndex) => (
                              <li key={trackIndex} className="flex items-center gap-2">
                                <Music className="h-3 w-3 text-green-600" />
                                {track}
                              </li>
                            ))}
                          </ul>
                          <Button size="sm" className="mt-3 bg-green-600 hover:bg-green-700">
                            <Play className="h-4 w-4 mr-2" />
                            Play Now
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activities" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Grounding Activities</CardTitle>
                  <CardDescription>Physical activities to help you feel more present and calm</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  {activities.map((activity, index) => (
                    <Card key={index} className="border-purple-200">
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                          <activity.icon className="h-5 w-5 text-purple-600" />
                          <CardTitle className="text-lg">{activity.name}</CardTitle>
                        </div>
                        <CardDescription>{activity.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Badge variant="outline">{activity.duration}</Badge>
                      </CardContent>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="resources" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Mental Health Resources</CardTitle>
                  <CardDescription>Professional support and helplines available 24/7</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {resources.map((resource, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{resource.name}</h4>
                        <p className="text-sm text-gray-600">{resource.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={resource.urgent ? "destructive" : "outline"} className="font-mono">
                          {resource.contact}
                        </Badge>
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Remember:</strong> These feelings are temporary. You are stronger than you think, and help is
              always available. If you're in immediate danger, please call emergency services (911) right away.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
