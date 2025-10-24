"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/layouts/dashboard-layout"
import ActivityPreferences from "@/components/activity-preferences"

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
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold tracking-tight text-white mb-6">Activity Preferences</h1>
          {userData && <ActivityPreferences userData={userData} />}
        </div>
      </div>
    </DashboardLayout>
  )
}
