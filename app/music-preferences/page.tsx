"use client"

import { useState, useEffect } from "react"

// Force dynamic rendering to avoid SSR issues with event handlers
export const dynamic = 'force-dynamic'
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Music, ArrowLeft, ArrowRight } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import SimpleMusicQuiz from "@/components/music-quiz/simple-music-quiz"
import ArtistSongsList from "@/components/music-quiz/artist-songs-list"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import DashboardLayout from "@/components/layouts/dashboard-layout"

export default function MusicPreferences() {
  const router = useRouter()
  const { toast } = useToast()
  const [userData, setUserData] = useState<any>(null)
  const [quizData, setQuizData] = useState({
    answers: {} as Record<string, string>,
  })

  useEffect(() => {
    // Load user data if available (client-side only)
    if (typeof window !== 'undefined') {
      const storedData = localStorage.getItem("userData")
      if (storedData) {
        try {
          setUserData(JSON.parse(storedData))
        } catch (error) {
          console.error("Error parsing user data:", error)
        }
      }

      // Load existing music preferences if available
      const storedPreferences = localStorage.getItem("musicPreferences")
      if (storedPreferences) {
        try {
          setQuizData(JSON.parse(storedPreferences))
        } catch (error) {
          console.error("Error parsing music preferences:", error)
        }
      }
    }
  }, [])

  const updateQuizData = (answers: Record<string, string>) => {
    setQuizData({ answers })
  }

  const handleSubmit = () => {
    // Save music preferences (client-side only)
    if (typeof window !== 'undefined') {
      localStorage.setItem("musicPreferences", JSON.stringify(quizData))

      // Update user data with music preferences
      if (userData) {
        const updatedUserData = {
          ...userData,
          musicPreferences: quizData,
        }
        localStorage.setItem("userData", JSON.stringify(updatedUserData))
      }
    }

    toast({
      title: "Preferences saved!",
      description: "Your music preferences have been updated successfully.",
    })

    // Redirect to dashboard
    router.push("/dashboard")
  }

  return (
    <DashboardLayout>
      <div className="flex min-h-screen bg-gradient-to-b from-blue-50 to-green-50">
      <div className="container max-w-4xl mx-auto p-8">
        <div className="flex items-center mb-8">
          <Link href="/dashboard" className="inline-flex items-center text-sm">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Link>
          <div className="ml-auto flex items-center">
            <Music className="h-6 w-6 text-rose-500 mr-2" />
            <span className="font-semibold">Melodica</span>
          </div>
        </div>

        <Tabs defaultValue="quiz" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="quiz">Music Quiz</TabsTrigger>
            <TabsTrigger value="songs">Your Artists' Songs</TabsTrigger>
          </TabsList>

          <TabsContent value="quiz">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Music Preference Quiz</h1>
              <p className="text-lg text-gray-700">Help us understand your music taste to provide better recommendations</p>
            </div>
            <div className="space-y-8">
              <SimpleMusicQuiz initialAnswers={quizData.answers} onChange={updateQuizData} />
            </div>
            <div className="flex justify-center mt-8">
              <Button onClick={() => {
                if (typeof window !== 'undefined') {
                  handleSubmit()
                }
              }} className="bg-teal-600 hover:bg-teal-700 px-8 py-3 text-lg">
                Save Preferences
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="songs">
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl">Songs from Your Artists</CardTitle>
                <CardDescription>Discover music from the artists you mentioned during signup</CardDescription>
              </CardHeader>
              <CardContent>{userData && <ArtistSongsList favoriteArtists={userData.favoriteArtists} />}</CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </DashboardLayout>
  )
}
