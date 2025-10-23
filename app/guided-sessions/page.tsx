"use client"

import { useState } from "react"

// Force dynamic rendering to avoid SSR issues with event handlers
export const dynamic = 'force-dynamic'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, SkipBack, Clock, Headphones, TreesIcon as Lungs, Brain } from "lucide-react"
import DashboardLayout from "@/components/layouts/dashboard-layout"
import AudioPlayer from "@/components/guided-sessions/audio-player"

export default function GuidedSessionsPage() {
  const [activeTab, setActiveTab] = useState("meditation")

  const sessions = {
    meditation: [
      {
        id: "med-1",
        title: "Mindful Awareness",
        description: "A gentle introduction to mindfulness meditation with calming background music",
        duration: "5 min",
        category: "Beginner",
        mood: "Calming",
        imageUrl: "/placeholder.svg?height=200&width=400",
        audioUrl: "#",
      },
      {
        id: "med-2",
        title: "Body Scan Relaxation",
        description: "Progressive relaxation technique to release tension throughout your body",
        duration: "10 min",
        category: "Intermediate",
        mood: "Relaxing",
        imageUrl: "/placeholder.svg?height=200&width=400",
        audioUrl: "#",
      },
      {
        id: "med-3",
        title: "Loving-Kindness Practice",
        description: "Cultivate compassion for yourself and others with this guided meditation",
        duration: "15 min",
        category: "Advanced",
        mood: "Uplifting",
        imageUrl: "/placeholder.svg?height=200&width=400",
        audioUrl: "#",
      },
    ],
    breathing: [
      {
        id: "breath-1",
        title: "4-7-8 Breathing",
        description: "A simple breathing technique to reduce anxiety and help with sleep",
        duration: "3 min",
        category: "Beginner",
        mood: "Calming",
        imageUrl: "/placeholder.svg?height=200&width=400",
        audioUrl: "#",
      },
      {
        id: "breath-2",
        title: "Box Breathing",
        description: "Equal duration breathing pattern used by Navy SEALs for stress management",
        duration: "5 min",
        category: "Beginner",
        mood: "Focusing",
        imageUrl: "/placeholder.svg?height=200&width=400",
        audioUrl: "#",
      },
      {
        id: "breath-3",
        title: "Diaphragmatic Breathing",
        description: "Deep belly breathing technique to activate the parasympathetic nervous system",
        duration: "7 min",
        category: "Intermediate",
        mood: "Grounding",
        imageUrl: "/placeholder.svg?height=200&width=400",
        audioUrl: "#",
      },
    ],
    sleep: [
      {
        id: "sleep-1",
        title: "Progressive Relaxation",
        description: "Systematically relax your body to prepare for restful sleep",
        duration: "20 min",
        category: "All Levels",
        mood: "Relaxing",
        imageUrl: "/placeholder.svg?height=200&width=400",
        audioUrl: "#",
      },
      {
        id: "sleep-2",
        title: "Bedtime Visualization",
        description: "Peaceful imagery journey to help quiet your mind before sleep",
        duration: "15 min",
        category: "All Levels",
        mood: "Dreamy",
        imageUrl: "/placeholder.svg?height=200&width=400",
        audioUrl: "#",
      },
      {
        id: "sleep-3",
        title: "Sleep Sound Bath",
        description: "Gentle ambient sounds and music designed to lull you to sleep",
        duration: "30 min",
        category: "All Levels",
        mood: "Soothing",
        imageUrl: "/placeholder.svg?height=200&width=400",
        audioUrl: "#",
      },
    ],
  }

  const [selectedSession, setSelectedSession] = useState<any>(null)

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Guided Audio Sessions</h1>
          <p className="text-gray-500">Meditation, breathing exercises, and sleep stories with music</p>
        </div>

        {selectedSession ? (
          <div className="space-y-6">
            <Button variant="ghost" className="flex items-center gap-2" onClick={() => {
              if (typeof window !== 'undefined') {
                setSelectedSession(null)
              }
            }}>
              <SkipBack className="h-4 w-4" />
              Back to sessions
            </Button>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">{selectedSession.title}</CardTitle>
                    <CardDescription className="mt-2">{selectedSession.description}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {selectedSession.duration}
                    </Badge>
                    <Badge variant="secondary">{selectedSession.category}</Badge>
                    <Badge>{selectedSession.mood}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="aspect-video w-full overflow-hidden rounded-md bg-gray-100">
                  <img
                    src={selectedSession.imageUrl || "/placeholder.svg"}
                    alt={selectedSession.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <AudioPlayer session={selectedSession} />
              </CardContent>
            </Card>
          </div>
        ) : (
          <Tabs defaultValue={activeTab} onValueChange={(value) => {
            if (typeof window !== 'undefined') {
              setActiveTab(value)
            }
          }} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="meditation">
                <Brain className="h-4 w-4 mr-2" />
                Meditation
              </TabsTrigger>
              <TabsTrigger value="breathing">
                <Lungs className="h-4 w-4 mr-2" />
                Breathing
              </TabsTrigger>
              <TabsTrigger value="sleep">
                <Headphones className="h-4 w-4 mr-2" />
                Sleep
              </TabsTrigger>
            </TabsList>

            {Object.entries(sessions).map(([key, sessionList]) => (
              <TabsContent key={key} value={key} className="mt-6">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {sessionList.map((session) => (
                    <Card key={session.id} className="overflow-hidden">
                      <div className="aspect-video w-full overflow-hidden">
                        <img
                          src={session.imageUrl || "/placeholder.svg"}
                          alt={session.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle>{session.title}</CardTitle>
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {session.duration}
                          </Badge>
                        </div>
                        <CardDescription>{session.description}</CardDescription>
                      </CardHeader>
                      <CardFooter className="flex justify-between">
                        <div className="flex gap-2">
                          <Badge variant="secondary">{session.category}</Badge>
                          <Badge>{session.mood}</Badge>
                        </div>
                        <Button onClick={() => {
                          if (typeof window !== 'undefined') {
                            setSelectedSession(session)
                          }
                        }}>
                          <Play className="h-4 w-4 mr-2" />
                          Play
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  )
}
