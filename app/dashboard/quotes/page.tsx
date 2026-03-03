"use client"

import DashboardLayout from "@/components/layouts/dashboard-layout"
import { MenuButton } from "@/components/navigation-sidebar"
import { AuthGuard } from "@/components/auth-guard"
import QuotesSection from "@/components/quotes-section"

export default function QuotesPage() {
  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
          {/* Fixed header with menu button */}
          <div className="sticky top-0 z-50 bg-gray-900 border-b border-gray-700 px-6 py-4 flex items-center gap-4">
            <MenuButton />
            <h1 className="text-2xl font-bold tracking-tight text-white">Motivational Quotes</h1>
          </div>
          
          <div className="p-6">
            <div className="max-w-4xl mx-auto">
              <QuotesSection />
            </div>
          </div>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}




