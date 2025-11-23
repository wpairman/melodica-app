"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/layouts/dashboard-layout"
import { MenuButton } from "@/components/navigation-sidebar"
import { AuthGuard } from "@/components/auth-guard"
import JamaicaWellnessToolkit from "@/components/jamaica-wellness-toolkit"

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
          
          <div className="p-4 md:p-6">
            <div className="max-w-6xl mx-auto">
              <JamaicaWellnessToolkit showTitle={false} />
            </div>
          </div>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
