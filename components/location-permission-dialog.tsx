"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { MapPin, Shield, Cloud } from "lucide-react"
import { useLocationPermission } from "@/hooks/use-location-permission"
import { useToast } from "@/hooks/use-toast"

export function LocationPermissionDialog() {
  const [open, setOpen] = useState(false)
  const { permission, requestPermission } = useLocationPermission()
  const { toast } = useToast()

  useEffect(() => {
    // Only show dialog to authenticated users after they've registered/logged in
    if (typeof window !== 'undefined') {
      const isLoggedIn = localStorage.getItem("isLoggedIn")
      const hasSeenLocationPrompt = localStorage.getItem("location_permission_shown_after_login")
      
      // Only show if user is logged in AND hasn't seen this prompt yet
      if (isLoggedIn === "true" && !hasSeenLocationPrompt) {
        // Show dialog if permission hasn't been requested yet
        if (permission === "unknown" || permission === "prompt") {
          // Check if user has already dismissed this dialog
          const dismissed = localStorage.getItem("location_permission_dismissed")
          if (!dismissed) {
            setOpen(true)
            // Mark that we've shown this prompt after login
            localStorage.setItem("location_permission_shown_after_login", "true")
          }
        }
      }
    }
  }, [permission])

  const handleAllow = async () => {
    const granted = await requestPermission()
    if (granted) {
      toast({
        title: "Location access granted",
        description: "Weather tracking and therapist finder are now enabled.",
      })
    } else {
      toast({
        title: "Location access denied",
        description: "You can enable location services later in settings.",
        variant: "default",
      })
    }
    setOpen(false)
  }

  const handleDeny = () => {
    localStorage.setItem("location_permission_dismissed", "true")
    setOpen(false)
    toast({
      title: "Location services disabled",
      description: "You can enable location services later in settings if you change your mind.",
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="bg-white dark:bg-gray-900">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900">
              <MapPin className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <DialogTitle className="text-2xl text-gray-900 dark:text-white">
              Enable Location Services?
            </DialogTitle>
          </div>
          <DialogDescription className="text-gray-600 dark:text-gray-300 text-base">
            Melodica would like to access your location to provide better features:
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <Cloud className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Weather & Mood Tracking</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Get personalized weather-based mood insights and recommendations
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <MapPin className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Therapist Finder</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Discover nearby mental health professionals in your area
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <Shield className="h-5 w-5 text-gray-600 dark:text-gray-400 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Privacy First</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Your location is only used for these features and never shared with third parties
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleDeny}>
            Not Now
          </Button>
          <Button 
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            onClick={handleAllow}
          >
            Allow Location Access
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

