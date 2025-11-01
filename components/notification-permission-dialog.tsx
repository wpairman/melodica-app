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
import { Bell, Sparkles, Moon, Zap } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function NotificationPermissionDialog() {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Only show dialog to authenticated users after they've registered/logged in
    if (typeof window !== 'undefined') {
      const isLoggedIn = localStorage.getItem("isLoggedIn")
      const hasSeenNotificationPrompt = localStorage.getItem("notification_permission_shown_after_login")
      
      // Only show if user is logged in AND hasn't seen this prompt yet
      if (isLoggedIn === "true" && !hasSeenNotificationPrompt) {
        // Check if notifications are supported
        if ("Notification" in window) {
          // Check if permission hasn't been requested yet
          if (Notification.permission === "default") {
            // Check if user has already dismissed this dialog
            const dismissed = localStorage.getItem("notification_permission_dismissed")
            if (!dismissed) {
              setOpen(true)
              // Mark that we've shown this prompt after login
              localStorage.setItem("notification_permission_shown_after_login", "true")
            }
          }
        }
      }
    }
  }, [])

  const handleAllow = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission()
      if (permission === "granted") {
        toast({
          title: "Notifications enabled! 🔔",
          description: "You'll receive helpful mood check-in reminders.",
        })
      } else if (permission === "denied") {
        toast({
          title: "Notifications disabled",
          description: "You can enable notifications later in settings if you change your mind.",
        })
      }
    }
    setOpen(false)
  }

  const handleDeny = () => {
    localStorage.setItem("notification_permission_dismissed", "true")
    setOpen(false)
    toast({
      title: "Notifications disabled",
      description: "You can enable notifications later in settings if you change your mind.",
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="bg-white dark:bg-gray-900">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900">
              <Bell className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <DialogTitle className="text-2xl text-gray-900 dark:text-white">
              Enable Notifications?
            </DialogTitle>
          </div>
          <DialogDescription className="text-gray-600 dark:text-gray-300 text-base">
            Stay on track with your mental wellness with timely reminders:
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-start gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <Moon className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Mood Check-ins</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Get gentle reminders to log how you're feeling throughout the day
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Quick Mood Logging</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Pull down notifications to log your mood instantly without opening the app
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <Zap className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Personalized Insights</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Receive notifications when we detect patterns in your mood data
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleDeny}>
            Not Now
          </Button>
          <Button 
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
            onClick={handleAllow}
          >
            Enable Notifications
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

