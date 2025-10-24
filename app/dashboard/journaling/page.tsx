"use client"

import DashboardLayout from "@/components/layouts/dashboard-layout"
import JournalingSection from "@/components/journaling-section"

export const dynamic = 'force-dynamic'

export default function JournalingPage() {
  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold tracking-tight text-white mb-6">Journaling</h1>
          <JournalingSection />
        </div>
      </div>
    </DashboardLayout>
  )
}
