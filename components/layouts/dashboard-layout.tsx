"use client"

import type React from "react"

interface DashboardLayoutProps {
  children: React.ReactNode
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'hsl(var(--background))' }}>
      {children}
    </div>
  )
}

export default DashboardLayout
