"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/layouts/dashboard-layout"
import { MenuButton } from "@/components/navigation-sidebar"
import { AuthGuard } from "@/components/auth-guard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function JamaicaWellnessPage() {
  const [userData, setUserData] = useState<any>(null)

  useEffect(() => {
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
    <AuthGuard>
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
          {/* Fixed header with menu button */}
          <div className="sticky top-0 z-50 bg-gray-900 border-b border-gray-700 px-6 py-4 flex items-center gap-4">
            <MenuButton />
            <h1 className="text-2xl font-bold tracking-tight text-white">Jamaica Wellness Toolkit</h1>
          </div>
          
          <div className="p-6">
            <div className="max-w-6xl mx-auto space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column: Tuff it Out & Buil Coping Skills */}
                <Card className="bg-gradient-to-br from-green-900/30 to-yellow-900/30 border-green-700">
                  <CardHeader>
                    <CardTitle className="text-xl text-white">Tuff it Out & Buil Coping Skills</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-white">
                      <p className="font-medium">Check Yuh Self</p>
                    </div>
                    <div className="text-white">
                      <p className="font-medium">Use Weh Yuh Have and Tun It Up</p>
                    </div>
                    <div className="text-white">
                      <p className="font-medium">Hol A Medz</p>
                    </div>
                    <div className="text-white">
                      <p className="font-medium">Move Wid Di Vibez</p>
                    </div>
                    <div className="text-white">
                      <p className="font-medium">Duh Suppm</p>
                    </div>
                    <div className="text-white">
                      <p className="font-medium">Switch It Up</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Right Column: Feelins Chart */}
                <Card className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 border-blue-700">
                  <CardHeader>
                    <CardTitle className="text-xl text-white">Feelins Chart</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="text-white">
                      <p className="font-medium">Happy</p>
                      <p className="text-sm text-gray-300">Mi glad bag buss!</p>
                    </div>
                    <div className="text-white">
                      <p className="font-medium">Excited</p>
                      <p className="text-sm text-gray-300">Mi can't wait</p>
                    </div>
                    <div className="text-white">
                      <p className="font-medium">Proud</p>
                      <p className="text-sm text-gray-300">Mi feel good inna miself</p>
                    </div>
                    <div className="text-white">
                      <p className="font-medium">Calm</p>
                      <p className="text-sm text-gray-300">Mi cool an easy</p>
                    </div>
                    <div className="text-white">
                      <p className="font-medium">Sad</p>
                      <p className="text-sm text-gray-300">Mi spirit low</p>
                    </div>
                    <div className="text-white">
                      <p className="font-medium">Lonely</p>
                      <p className="text-sm text-gray-300">Mi lonely</p>
                    </div>
                    <div className="text-white">
                      <p className="font-medium">Hurt</p>
                      <p className="text-sm text-gray-300">Mi heart heavy</p>
                    </div>
                    <div className="text-white">
                      <p className="font-medium">Disappointed</p>
                      <p className="text-sm text-gray-300">Mi feet let dung</p>
                    </div>
                    <div className="text-white">
                      <p className="font-medium">Angry</p>
                      <p className="text-sm text-gray-300">Mi vex</p>
                    </div>
                    <div className="text-white">
                      <p className="font-medium">Frustrated</p>
                      <p className="text-sm text-gray-300">Mi cyah tek it nuh more</p>
                    </div>
                    <div className="text-white">
                      <p className="font-medium">Jealous</p>
                      <p className="text-sm text-gray-300">Mi wish a me</p>
                    </div>
                    <div className="text-white">
                      <p className="font-medium">Embarrased</p>
                      <p className="text-sm text-gray-300">Mi Shame Bad</p>
                    </div>
                    <div className="text-white">
                      <p className="font-medium">Brave</p>
                      <p className="text-sm text-gray-300">Mi bold like lion</p>
                    </div>
                    <div className="text-white">
                      <p className="font-medium">Loving</p>
                      <p className="text-sm text-gray-300">Mi full up a love</p>
                    </div>
                    <div className="text-white">
                      <p className="font-medium">Helpful</p>
                      <p className="text-sm text-gray-300">Mi deh deh fi yuh</p>
                    </div>
                    <div className="text-white">
                      <p className="font-medium">Worried</p>
                      <p className="text-sm text-gray-300">It a guh alright</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* YouTube Playlist Link - Centered at bottom */}
              <div className="flex justify-center mt-6">
                <Card className="bg-gradient-to-r from-red-900/30 to-orange-900/30 border-red-700">
                  <CardContent className="pt-6">
                    <a 
                      href="https://www.youtube.com/watch?v=hswg8Dd7fxY&list=PL6jOKq9i9ilTLLQHftJ3U-0lxSopJqlG1"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white hover:text-yellow-400 transition-colors font-medium text-lg"
                    >
                      Link to Tuff It Out & Buil' YouTube Playlist
                    </a>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}

