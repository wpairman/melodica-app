"use client"

import DashboardLayout from "@/components/layouts/dashboard-layout"
import JournalingSection from "@/components/journaling-section"
import { MenuButton } from "@/components/navigation-sidebar"

export const dynamic = 'force-dynamic'

export default function JournalingPage() {
  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
        {/* Fixed header with menu button */}
        <div className="sticky top-0 z-50 bg-gray-900 border-b border-gray-700 px-6 py-4 flex items-center gap-4">
          <MenuButton />
          <h1 className="text-2xl font-bold tracking-tight text-white">Journaling</h1>
        </div>
        
        <div className="p-6">
          <div className="max-w-6xl mx-auto">
            <JournalingSection />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
