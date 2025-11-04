"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Home, ArrowLeft } from "lucide-react"

export default function NotFound() {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleGoHome = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/'
    }
  }

  const handleGoBack = () => {
    if (typeof window !== 'undefined') {
      window.history.back()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">😵</span>
          </div>
          <CardTitle className="text-2xl">Page Not Found</CardTitle>
          <CardDescription>
            Sorry, we couldn't find the page you're looking for.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-gray-600">
            <p>The page you requested doesn't exist or has been moved.</p>
          </div>
          <div className="flex flex-col gap-2">
            {isMounted && (
              <>
                <Button className="w-full" onClick={handleGoHome}>
                  <Home className="h-4 w-4 mr-2" />
                  Go Home
                </Button>
                <Button variant="outline" onClick={handleGoBack} className="w-full">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Go Back
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
