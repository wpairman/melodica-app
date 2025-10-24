"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/layouts/dashboard-layout"
import ActivityPreferences from "@/components/activity-preferences"
import { MenuButton } from "@/components/navigation-sidebar"

export const dynamic = 'force-dynamic'

export default function ActivitiesPage() {
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
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
        {/* Fixed header with menu button */}
        <div className="sticky top-0 z-50 bg-gray-900 border-b border-gray-700 px-6 py-4 flex items-center gap-4">
          <MenuButton />
          <h1 className="text-2xl font-bold tracking-tight text-white">Activity Preferences</h1>
        </div>
        
        <div className="p-6">
          <div className="max-w-6xl mx-auto">
            {userData && <ActivityPreferences userData={userData} />}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
