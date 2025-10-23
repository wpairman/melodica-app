"use client"

// Force dynamic rendering to avoid SSR issues with event handlers
export const dynamic = 'force-dynamic'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, WifiOff, RefreshCw } from "lucide-react"

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen bg-gradient-to-b from-blue-50 to-green-50 items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <WifiOff className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-2xl">You're Offline</CardTitle>
          <CardDescription>Melodica needs an internet connection to work properly</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-4">
            Please check your internet connection and try again. Some features may be available offline, but for the
            best experience, please reconnect.
          </p>
          <div className="flex items-center justify-center">
            <Heart className="h-6 w-6 text-rose-500 mr-2" />
            <span className="font-semibold">Melodica</span>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={() => window.location.reload()} className="bg-teal-600 hover:bg-teal-700">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
