"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, X } from "lucide-react"

export function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [dismissed, setDismissed] = useState(false)
  const [isProduction, setIsProduction] = useState(false)

  useEffect(() => {
    // Check if we're in a production environment (client-side only)
    if (typeof window === 'undefined') return
    
    const hostname = window.location.hostname
    const isProductionEnvironment =
      !hostname.includes("vusercontent.net") && !hostname.includes("localhost") && !hostname.includes("127.0.0.1")

    setIsProduction(isProductionEnvironment)

    // Only proceed with PWA prompt in production
    if (!isProductionEnvironment) return

    // Check if the user has already dismissed the prompt
    const hasPromptBeenDismissed = localStorage.getItem("pwaPromptDismissed")
    if (hasPromptBeenDismissed) {
      setDismissed(true)
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault()
      // Stash the event so it can be triggered later
      setDeferredPrompt(e)
      // Show our custom install prompt
      setShowPrompt(true)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = () => {
    // Hide the prompt
    setShowPrompt(false)

    // Show the browser install prompt
    deferredPrompt.prompt()

    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then((choiceResult: { outcome: string }) => {
      if (choiceResult.outcome === "accepted") {
        console.log("User accepted the install prompt")
      } else {
        console.log("User dismissed the install prompt")
      }
      // We no longer need the prompt
      setDeferredPrompt(null)
    })
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    setDismissed(true)
    localStorage.setItem("pwaPromptDismissed", "true")
  }

  if (!isProduction || !showPrompt || dismissed || !deferredPrompt) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50">
      <Card className="border-teal-200 shadow-lg">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Install Melodica App</CardTitle>
            <Button variant="ghost" size="sm" onClick={handleDismiss} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
              <span className="sr-only">Dismiss</span>
            </Button>
          </div>
          <CardDescription>Add Melodica to your home screen for quick access</CardDescription>
        </CardHeader>
        <CardContent className="pb-2">
          <p className="text-sm text-gray-500">
            Install this application on your device. It won't take up space and provides a better experience.
          </p>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleDismiss}>
            Not now
          </Button>
          <Button onClick={handleInstallClick} className="bg-teal-600 hover:bg-teal-700">
            <Download className="mr-2 h-4 w-4" />
            Install
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
