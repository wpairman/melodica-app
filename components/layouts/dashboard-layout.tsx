"use client"

import type React from "react"
import { PermanentSidebar } from "@/components/permanent-sidebar"

interface DashboardLayoutProps {
  children: React.ReactNode
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'hsl(var(--background))' }}>
      <PermanentSidebar />
      <div className="lg:ml-80">
        {children}
      </div>
    </div>
  )
}

export default DashboardLayout
