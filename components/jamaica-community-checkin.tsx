"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Users, MessageCircle, Shield, Radio, CheckCircle2, AlertCircle, Heart, MapPin } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface CheckIn {
  id: string
  name: string
  location: string
  message: string
  timestamp: Date
  status: "safe" | "need-help" | "want-to-talk"
  verified: boolean
}

export default function JamaicaCommunityCheckIn() {
  const { toast } = useToast()
  const [checkIns, setCheckIns] = useState<CheckIn[]>([])
  const [userCheckIn, setUserCheckIn] = useState({
    name: "",
    location: "",
    message: "",
    status: "safe" as "safe" | "need-help" | "want-to-talk",
  })
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Load check-ins from localStorage (client-side only)
    if (typeof window !== 'undefined') {
      const storedCheckIns = localStorage.getItem("jamaicaCheckIns")
      if (storedCheckIns) {
        try {
          const parsed = JSON.parse(storedCheckIns)
          const processedCheckIns = parsed.map((item: any) => ({
            ...item,
            timestamp: new Date(item.timestamp),
          }))
          setCheckIns(processedCheckIns)
        } catch (error) {
          console.error("Error loading check-ins:", error)
        }
      }
    }
  }, [])

  const handleSubmitCheckIn = () => {
    if (!userCheckIn.name || !userCheckIn.message) {
      toast({
        title: "Missing Information",
        description: "Please provide your name and a message.",
        variant: "destructive",
      })
      return
    }

    const newCheckIn: CheckIn = {
      id: Date.now().toString(),
      name: userCheckIn.name,
      location: userCheckIn.location || "Jamaica",
      message: userCheckIn.message,
      timestamp: new Date(),
      status: userCheckIn.status,
      verified: false, // In a real app, this would be verified by moderators
    }

    const updatedCheckIns = [newCheckIn, ...checkIns]
    setCheckIns(updatedCheckIns)

    // Save to localStorage (client-side only)
    if (typeof window !== 'undefined') {
      localStorage.setItem("jamaicaCheckIns", JSON.stringify(updatedCheckIns))
    }

    toast({
      title: "Check-In Posted",
      description: "Your message has been shared with the community. Big up! 💚",
    })

    // Reset form
    setUserCheckIn({
      name: "",
      location: "",
      message: "",
      status: "safe",
    })
    setIsOpen(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "safe":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case "need-help":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case "want-to-talk":
        return <MessageCircle className="h-5 w-5 text-blue-500" />
      default:
        return null
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "safe":
        return "I'm Safe"
      case "need-help":
        return "Need Help"
      case "want-to-talk":
        return "Want to Talk"
      default:
        return status
    }
  }

  return (
    <Card className="border-yellow-300 bg-yellow-50/10">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-yellow-600" />
          <CardTitle className="text-yellow-900">🇯🇲 Jamaica Community Check-In</CardTitle>
        </div>
        <CardDescription className="text-yellow-700">
          Connect with other Jamaica users during Hurricane Melissa. Share your status, offer support, or check if others are safe.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="bg-yellow-600 hover:bg-yellow-700 text-white">
                <Radio className="h-4 w-4 mr-2" />
                Post Check-In
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white">
              <DialogHeader>
                <DialogTitle>Post a Community Check-In</DialogTitle>
                <DialogDescription>
                  Let others in Jamaica know how you're doing
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Your Name (or nickname)</label>
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={userCheckIn.name}
                    onChange={(e) => setUserCheckIn({ ...userCheckIn, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Location (optional)</label>
                  <input
                    type="text"
                    placeholder="e.g., Kingston, Montego Bay"
                    value={userCheckIn.location}
                    onChange={(e) => setUserCheckIn({ ...userCheckIn, location: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <select
                    value={userCheckIn.status}
                    onChange={(e) => setUserCheckIn({ ...userCheckIn, status: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="safe">I'm Safe</option>
                    <option value="need-help">Need Help</option>
                    <option value="want-to-talk">Want to Talk</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Message</label>
                  <Textarea
                    placeholder="Share a message with the community (e.g., 'Holding strong in Kingston')"
                    value={userCheckIn.message}
                    onChange={(e) => setUserCheckIn({ ...userCheckIn, message: e.target.value })}
                    className="min-h-[100px]"
                  />
                </div>
                <Button onClick={handleSubmitCheckIn} className="w-full bg-yellow-600 hover:bg-yellow-700">
                  Post Check-In
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Button variant="outline" onClick={() => {
            if (typeof window !== 'undefined') {
              // Refresh check-ins
              const stored = localStorage.getItem("jamaicaCheckIns")
              if (stored) {
                const parsed = JSON.parse(stored)
                setCheckIns(parsed.map((item: any) => ({
                  ...item,
                  timestamp: new Date(item.timestamp),
                })))
              }
            }
          }}>
            <Users className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {checkIns.length === 0 ? (
            <div className="text-center py-8 text-yellow-700">
              <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No check-ins yet. Be the first to share!</p>
            </div>
          ) : (
            checkIns.map((checkIn) => (
              <Card key={checkIn.id} className="bg-white border-yellow-200">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10 border-2 border-yellow-300">
                      <AvatarFallback className="bg-yellow-100 text-yellow-700">
                        {checkIn.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-yellow-900">{checkIn.name}</span>
                          {checkIn.verified && (
                            <Badge variant="outline" className="border-green-500 text-green-600">
                              ✓ Verified
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(checkIn.status)}
                          <Badge variant={checkIn.status === "safe" ? "default" : "destructive"}>
                            {getStatusLabel(checkIn.status)}
                          </Badge>
                        </div>
                      </div>
                      {checkIn.location && (
                        <div className="flex items-center gap-1 text-sm text-yellow-700">
                          <MapPin className="h-3 w-3" />
                          {checkIn.location}
                        </div>
                      )}
                      <p className="text-sm text-gray-700">{checkIn.message}</p>
                      <div className="text-xs text-gray-500">
                        {checkIn.timestamp.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div className="p-3 bg-yellow-100 rounded-lg border border-yellow-300">
          <p className="text-xs text-yellow-800">
            <strong>Privacy & Safety:</strong> Messages are moderated for safety. If you need urgent help, contact emergency services (119) or the resources in Storm Response mode.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

