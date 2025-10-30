"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Heart, Activity, User, Settings, LogOut, Music, CreditCard, Calendar, Menu, TrendingUp, Cloud } from "lucide-react"
import { DarkModeToggle } from "@/components/dark-mode-toggle"

interface NavigationSidebarProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function NavigationSidebar({ isOpen, onOpenChange }: NavigationSidebarProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <span />
      </SheetTrigger>
      <SheetContent side="left" className="w-80 bg-gray-900 border-gray-700">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex h-14 items-center border-b border-gray-700 px-4 justify-between">
            <Link href="/" className="flex items-center gap-2 font-semibold text-white">
              <Heart className="h-6 w-6 text-rose-500" />
              <span>Melodica</span>
            </Link>
            <DarkModeToggle />
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-auto py-4">
            <div className="px-4 py-2">
              <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight text-white">Dashboard</h2>
              <div className="space-y-1">
                <Link href="/dashboard">
                  <Button variant="ghost" className="w-full justify-start text-white hover:bg-gray-800">
                    <Heart className="mr-2 h-4 w-4" />
                    Home
                  </Button>
                </Link>
                <Link href="/calendar">
                  <Button variant="ghost" className="w-full justify-start text-white hover:bg-gray-800">
                    <Calendar className="mr-2 h-4 w-4" />
                    Calendar
                  </Button>
                </Link>
                <Link href="/dashboard/mood-history">
                  <Button variant="ghost" className="w-full justify-start text-white hover:bg-gray-800">
                    <Activity className="mr-2 h-4 w-4" />
                    Mood History
                  </Button>
                </Link>
                <Link href="/analytics">
                  <Button variant="ghost" className="w-full justify-start text-white hover:bg-gray-800">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Mood Analytics
                  </Button>
                </Link>
                <Link href="/weather-mood">
                  <Button variant="ghost" className="w-full justify-start text-white hover:bg-gray-800">
                    <Cloud className="mr-2 h-4 w-4" />
                    Weather & Mood
                  </Button>
                </Link>
                <Link href="/dashboard/profile">
                  <Button variant="ghost" className="w-full justify-start text-white hover:bg-gray-800">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Button>
                </Link>
                <Link href="/music-preferences">
                  <Button variant="ghost" className="w-full justify-start text-white hover:bg-gray-800">
                    <Music className="mr-2 h-4 w-4" />
                    Music Preferences
                  </Button>
                </Link>
                <Link href="/dashboard/activities">
                  <Button variant="ghost" className="w-full justify-start text-white hover:bg-gray-800">
                    <Activity className="mr-2 h-4 w-4" />
                    Activities
                  </Button>
                </Link>
                <Link href="/dashboard/journaling">
                  <Button variant="ghost" className="w-full justify-start text-white hover:bg-gray-800">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Journaling
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button variant="ghost" className="w-full justify-start text-white hover:bg-gray-800">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Subscription
                  </Button>
                </Link>
                <Link href="/dashboard/settings">
                  <Button variant="ghost" className="w-full justify-start text-white hover:bg-gray-800">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Button>
                </Link>
              </div>
            </div>
          </nav>

          {/* Footer */}
          <div className="mt-auto p-4 border-t border-gray-700">
            <Button variant="outline" className="w-full justify-start text-white border-gray-600 hover:bg-gray-800">
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export function MenuButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-800"
        onClick={() => setIsOpen(true)}
      >
        <Menu className="h-6 w-6" />
      </Button>
      <NavigationSidebar isOpen={isOpen} onOpenChange={setIsOpen} />
    </>
  )
}
