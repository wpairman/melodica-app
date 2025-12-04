"use client"

import { useState, useEffect } from "react"
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
import JamaicaCommunityCheckIn from "./jamaica-community-checkin"

export default function GroundMe() {
  const [isOpen, setIsOpen] = useState(false)
  const [userLocation, setUserLocation] = useState<{ country?: string; state?: string; city?: string } | null>(null)
  const [locationLoading, setLocationLoading] = useState(true)

  const calmingPlaylists = [
    {
      title: "Anxiety Relief",
      description: "Gentle instrumental music to help reduce anxiety",
      duration: "15 min",
      tracks: ["Weightless - Marconi Union", "Clair de Lune - Debussy", "Gymnopédie No.1 - Erik Satie"],
      url: "https://www.youtube.com/results?search_query=anxiety+relief+calming+instrumental+music",
    },
    {
      title: "Panic Attack Recovery",
      description: "Slow, rhythmic music to help regulate breathing",
      duration: "10 min",
      tracks: ["Deep Calm - Max Richter", "On Earth as It Is in Heaven - Ólafur Arnalds", "Porcelain - Moby"],
      url: "https://www.youtube.com/results?search_query=panic+attack+recovery+calming+music",
    },
    {
      title: "Grounding Sounds",
      description: "Nature sounds and ambient music for grounding",
      duration: "20 min",
      tracks: ["Rain on Leaves", "Ocean Waves", "Forest Ambience"],
      url: "https://www.youtube.com/results?search_query=nature+sounds+grounding+meditation",
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

  // USA General Resources (default)
  const usaResources = [
    {
      name: "Crisis Text Line",
      contact: "Text HOME to 741741",
      description: "24/7 crisis support via text message",
      urgent: true,
      url: "https://www.crisistextline.org/",
    },
    {
      name: "National Suicide Prevention Lifeline",
      contact: "988",
      description: "24/7 free and confidential support",
      urgent: true,
      url: "https://988lifeline.org/",
    },
    {
      name: "SAMHSA National Helpline",
      contact: "1-800-662-4357",
      description: "Treatment referral and information service",
      urgent: false,
      url: "https://www.samhsa.gov/find-help/national-helpline",
    },
    {
      name: "Crisis Chat",
      contact: "suicidepreventionlifeline.org/chat",
      description: "Online chat support",
      urgent: false,
      url: "https://suicidepreventionlifeline.org/chat/",
    },
  ]

  // Florida Specific Resources
  const floridaResources = [
    {
      name: "Crisis Text Line",
      contact: "Text HOME to 741741",
      description: "24/7 crisis support via text message",
      urgent: true,
      url: "https://www.crisistextline.org/",
    },
    {
      name: "988 Suicide & Crisis Lifeline",
      contact: "988",
      description: "24/7 free and confidential support",
      urgent: true,
      url: "https://988lifeline.org/",
    },
    {
      name: "Florida 211",
      contact: "211 or 1-866-762-8487",
      description: "24/7 health and human services helpline for Florida",
      urgent: true,
      url: "https://www.211.org/",
    },
    {
      name: "Florida Behavioral Health Services",
      contact: "1-800-662-4357",
      description: "Mental health and substance abuse services in Florida",
      urgent: false,
      url: "https://www.myflfamilies.com/service-programs/mental-health",
    },
    {
      name: "Florida Crisis Chat",
      contact: "suicidepreventionlifeline.org/chat",
      description: "Online chat support available 24/7",
      urgent: false,
      url: "https://suicidepreventionlifeline.org/chat/",
    },
  ]

  // Jamaica Specific Resources
  const jamaicaResourcesList = [
    {
      name: "Jamaica Mental Health Hotline",
      contact: "888-NEW-LIFE (639-5433)",
      description: "Jamaica mental health and crisis support",
      urgent: true,
      url: "https://www.moh.gov.jm/",
    },
    {
      name: "Office of Disaster Preparedness & Emergency Management (ODPEM)",
      contact: "888-SAFETY (723-3898)",
      description: "Emergency disaster response in Jamaica",
      urgent: true,
      url: "http://www.odpem.org.jm/",
    },
    {
      name: "Jamaica Red Cross",
      contact: "876-984-7860",
      description: "Disaster relief and support services",
      urgent: false,
      url: "https://www.redcross.org.jm/",
    },
    {
      name: "Ministry of Health and Wellness",
      contact: "888-ONE-LOVE (663-5683)",
      description: "Health and wellness information and support",
      urgent: false,
      url: "https://www.moh.gov.jm/",
    },
  ]

  // Detect user location
  useEffect(() => {
    if (typeof window === 'undefined') return

    const detectLocation = async () => {
      try {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              try {
                const { latitude, longitude } = position.coords
                const geo = await fetch(
                  `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
                ).then((r) => r.json())

                const locationData = {
                  country: geo.address?.country,
                  state: geo.address?.state || geo.address?.state_district,
                  city: geo.address?.city || geo.address?.town || geo.address?.village,
                }

                setUserLocation(locationData)
                setLocationLoading(false)
              } catch (error) {
                console.error("Error reverse geocoding:", error)
                setLocationLoading(false)
              }
            },
            (error) => {
              // Silently handle geolocation errors (permission denied, unavailable, timeout)
              // These are expected scenarios and don't need console logging
              setLocationLoading(false)
            },
            { timeout: 10000 }
          )
        } else {
          setLocationLoading(false)
        }
      } catch (error) {
        console.error("Location detection error:", error)
        setLocationLoading(false)
      }
    }

    detectLocation()
  }, [])

  // Determine which resources to show based on location
  const getResourcesForLocation = () => {
    if (!userLocation) return usaResources // Default to USA

    const country = userLocation.country?.toLowerCase() || ""
    const state = userLocation.state?.toLowerCase() || ""

    // Check for Jamaica
    if (country.includes("jamaica")) {
      return jamaicaResourcesList
    }

    // Check for Florida
    if (country.includes("united states") || country.includes("usa") || country.includes("america")) {
      if (state.includes("florida") || state.includes("fl")) {
        return floridaResources
      }
    }

    // Default to USA general resources
    return usaResources
  }

  const resources = getResourcesForLocation()


  const stormResponseMode = {
    title: "Storm Response Mode",
    description: "Short guided sessions (2-5 minutes) for grounding during disasters",
    affirmations: [
      { text: "I am safe for now", icon: "🛡️" },
      { text: "Mi gonna be alright, mi strong", icon: "💪" },
      { text: "My feelings are valid and real", icon: "💙" },
      { text: "Let's pause and breathe deeply", icon: "🌬️" },
      { text: "This feeling will pass, mi wah be okay", icon: "⏰" },
      { text: "I have survived before, mi can do it again", icon: "🌴" },
      { text: "One love, yuh not alone in this", icon: "💚" },
    ],
    quickActivities: [
      {
        name: "2-Minute Breathing Reset",
        steps: [
          "Close your eyes or soften your gaze",
          "Inhale slowly for 4 counts",
          "Hold for 4 counts",
          "Exhale slowly for 4 counts",
          "Repeat 4 times",
          "Notice how you feel",
        ],
      },
      {
        name: "Safety Check-In",
        steps: [
          "Right now, in this moment, am I physically safe?",
          "Am I in immediate danger?",
          "Can I take one more breath?",
          "Can I name one thing I'm grateful for?",
          "Breathe again",
        ],
      },
      {
        name: "5-4-3-2-1 Grounding",
        steps: [
          "Look around and name 5 things you can see",
          "Touch 4 different objects near you",
          "Listen and name 3 sounds you hear",
          "Notice 2 smells in the air",
          "Take 1 deep breath",
        ],
      },
    ],
  }

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
          <DialogTitle className="flex items-center gap-2 text-black">
            <AlertTriangle className="h-6 w-6" />
            Ground Me - You're Not Alone
          </DialogTitle>
          <DialogDescription className="text-black">
            If you're experiencing a panic attack, anxiety, or emotional crisis, these resources can help you right now. Mi gonna be alright, yuh strong.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Immediate Crisis Resources */}
          <Card className="border-red-200 bg-red-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-black flex items-center gap-2">
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
                      <h4 className="font-medium text-black">{resource.name}</h4>
                      <p className="text-sm text-black">{resource.description}</p>
                    </div>
                    <Badge variant="destructive" className="font-mono">
                      {resource.contact}
                    </Badge>
                  </div>
                ))}
            </CardContent>
          </Card>

          <Tabs defaultValue="storm" className="w-full">
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 mb-4">
              <TabsTrigger value="storm" className="!text-black font-semibold text-xs lg:text-base data-[state=active]:!text-black data-[state=inactive]:!text-black">🌪️ Storm</TabsTrigger>
              <TabsTrigger value="community" className="!text-black font-semibold text-xs lg:text-base data-[state=active]:!text-black data-[state=inactive]:!text-black">🇯🇲 Community</TabsTrigger>
              <TabsTrigger value="breathing" className="!text-black font-semibold text-xs lg:text-base data-[state=active]:!text-black data-[state=inactive]:!text-black">Breathing</TabsTrigger>
              <TabsTrigger value="music" className="!text-black font-semibold text-xs lg:text-base data-[state=active]:!text-black data-[state=inactive]:!text-black">Music</TabsTrigger>
              <TabsTrigger value="activities" className="!text-black font-semibold text-xs lg:text-base data-[state=active]:!text-black data-[state=inactive]:!text-black">Activities</TabsTrigger>
              <TabsTrigger value="resources" className="!text-black font-semibold text-xs lg:text-base data-[state=active]:!text-black data-[state=inactive]:!text-black">Resources</TabsTrigger>
            </TabsList>

            <TabsContent value="community" className="space-y-4">
              <JamaicaCommunityCheckIn />
            </TabsContent>

            <TabsContent value="storm" className="space-y-4">
              <Card className="border-orange-200 bg-orange-50">
                <CardHeader>
                  <CardTitle className="text-black">{stormResponseMode.title}</CardTitle>
                  <CardDescription className="text-black">{stormResponseMode.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Affirmations */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3 text-black">💬 Trauma-Informed Affirmations</h3>
                    <div className="grid gap-3">
                      {stormResponseMode.affirmations.map((affirmation, index) => (
                        <div key={index} className="p-4 bg-white rounded-lg border border-orange-200">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{affirmation.icon}</span>
                            <p className="text-lg font-medium text-black">{affirmation.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick Activities */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3 text-black">⚡ Quick Grounding Activities (2-5 mins)</h3>
                    <div className="space-y-4">
                      {stormResponseMode.quickActivities.map((activity, index) => (
                        <Card key={index} className="border-orange-200">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg text-black">{activity.name}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ol className="list-decimal list-inside space-y-2 text-sm">
                              {activity.steps.map((step, stepIndex) => (
                                <li key={stepIndex} className="text-black">{step}</li>
                              ))}
                            </ol>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-orange-100 rounded-lg border border-orange-300">
                    <p className="text-sm text-black">
                      <strong>🌴 For Jamaica Users:</strong> Everything here works offline. Mi gonna be alright. Big up yuhself! One love. 💚
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="breathing" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-black">Breathing Exercises</CardTitle>
                  <CardDescription className="text-black">
                    These techniques can help regulate your breathing and calm your nervous system
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {breathingExercises.map((exercise, index) => (
                    <Card key={index} className="border-blue-200">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg text-black">{exercise.name}</CardTitle>
                            <CardDescription className="text-black">{exercise.description}</CardDescription>
                          </div>
                          <Badge variant="outline">{exercise.duration}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <ol className="list-decimal list-inside space-y-1 text-sm text-black">
                          {exercise.steps.map((step, stepIndex) => (
                            <li key={stepIndex} className="text-black">{step}</li>
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
                  <CardTitle className="text-black">Calming Playlists</CardTitle>
                  <CardDescription className="text-black">Music specifically chosen to help reduce anxiety and promote calm</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {calmingPlaylists.map((playlist, index) => (
                    <Card key={index} className="border-green-200">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg text-black">{playlist.title}</CardTitle>
                            <CardDescription className="text-black">{playlist.description}</CardDescription>
                          </div>
                          <Badge variant="outline">{playlist.duration}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm text-black">Featured tracks:</h4>
                          <ul className="text-sm space-y-1 text-black">
                            {playlist.tracks.map((track, trackIndex) => (
                              <li key={trackIndex} className="flex items-center gap-2">
                                <Music className="h-3 w-3 text-black" />
                                {track}
                              </li>
                            ))}
                          </ul>
                          <Button 
                            size="sm" 
                            className="mt-3 bg-green-600 hover:bg-green-700"
                            onClick={() => {
                              if (playlist.url && typeof window !== 'undefined') {
                                window.open(playlist.url, '_blank', 'noopener,noreferrer')
                              }
                            }}
                          >
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
                  <CardTitle className="text-black">Grounding Activities</CardTitle>
                  <CardDescription className="text-black">Physical activities to help you feel more present and calm</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  {activities.map((activity, index) => (
                    <Card key={index} className="border-purple-200">
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                          <activity.icon className="h-5 w-5 text-black" />
                          <CardTitle className="text-lg text-black">{activity.name}</CardTitle>
                        </div>
                        <CardDescription className="text-black">{activity.description}</CardDescription>
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
                  <CardTitle className="text-black">Mental Health Resources</CardTitle>
                  <CardDescription className="text-black">
                    Professional support and helplines available 24/7
                    {userLocation && (
                      <span className="block mt-1 text-sm">
                        Showing resources for: {userLocation.city ? `${userLocation.city}, ` : ""}
                        {userLocation.state ? `${userLocation.state}, ` : ""}
                        {userLocation.country || "your location"}
                      </span>
                    )}
                    {locationLoading && (
                      <span className="block mt-1 text-sm text-gray-500">Detecting your location...</span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {resources.map((resource, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium text-black">{resource.name}</h4>
                        <p className="text-sm text-black">{resource.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={resource.urgent ? "destructive" : "outline"} className="font-mono">
                          {resource.contact}
                        </Badge>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            if (resource.url && typeof window !== 'undefined') {
                              window.open(resource.url, '_blank', 'noopener,noreferrer')
                            }
                          }}
                        >
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
            <p className="text-sm text-black">
              <strong>Remember:</strong> These feelings are temporary. You are stronger than you think, and help is
              always available. If you're in immediate danger, please call emergency services (911) right away.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
