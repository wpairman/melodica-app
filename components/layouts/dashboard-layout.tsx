"use client"

import type React from "react"

interface DashboardLayoutProps {
  children: React.ReactNode
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-900">
      {children}
    </div>
  )
}

export default DashboardLayout
