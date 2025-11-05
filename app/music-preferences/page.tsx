"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Music } from "lucide-react"
import ArtistSongsList from "@/components/music-quiz/artist-songs-list"
import DashboardLayout from "@/components/layouts/dashboard-layout"
import { MenuButton } from "@/components/navigation-sidebar"

export default function MusicPreferences() {
  const [userData, setUserData] = useState<any>(null)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
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
    }
  }, [])

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-green-50">
        {/* Fixed header with menu button */}
        <div className="sticky top-0 z-[100] bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4">
          <div className="relative z-[101]">
            <MenuButton />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Your Artist's Songs</h1>
        </div>
        
        <div className="container max-w-4xl mx-auto p-8">
          {!isMounted ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading...</p>
            </div>
          ) : (
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl text-black flex items-center gap-2">
                  <Music className="h-6 w-6" />
                  Songs from Your Artists
                </CardTitle>
                <CardDescription className="text-black">
                  Discover music from the artists you mentioned during signup
                </CardDescription>
              </CardHeader>
              <CardContent>
                {userData && userData.favoriteArtists ? (
                  <ArtistSongsList favoriteArtists={userData.favoriteArtists} />
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No favorite artists found. Please update your profile with your favorite artists.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
