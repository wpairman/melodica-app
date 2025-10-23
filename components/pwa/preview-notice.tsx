"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Info } from "lucide-react"

export function PWAPreviewNotice() {
  const [isPreview, setIsPreview] = useState(false)

  useEffect(() => {
    // Check if we're in a preview environment
    const hostname = window.location.hostname
    const isPreviewEnvironment = hostname.includes("vusercontent.net")

    setIsPreview(isPreviewEnvironment)
  }, [])

  if (!isPreview) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50">
      <Card className="border-blue-200 bg-blue-50 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Info className="h-5 w-5 text-blue-600 flex-shrink-0" />
            <p className="text-sm text-blue-800">
              PWA features (like "Add to Home Screen") will be available after deployment to production. They are
              disabled in this preview environment.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
