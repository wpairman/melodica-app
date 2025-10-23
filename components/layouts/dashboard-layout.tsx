"use client"

import type React from "react"

import {
  LogOut,
  Menu,
  Settings,
  User,
  Home,
  Heart,
  Calendar,
  Cloud,
  Brain,
  Users,
  Activity,
  BarChart3,
  Music,
} from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface DashboardLayoutProps {
  children: React.ReactNode
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  return (
    <div className="h-screen bg-gray-900">
      <header className="flex items-center justify-between p-4 border-b bg-gray-900 border-gray-700">
        <div className="flex items-center">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="text-white hover:bg-gray-800">
                <Menu className="h-4 w-4 mr-2" />
                Menu
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 bg-gray-800 border-gray-700">
              <SheetHeader>
                <SheetTitle className="text-white">Navigation Menu</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                {/* Quick Access Section */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">Quick Access</h3>
                  <Link href="/dashboard" className="flex items-center space-x-3 text-white p-2 rounded-lg hover:bg-gray-700 transition-colors">
                    <Home className="h-5 w-5" />
                    <span>Back to Dashboard</span>
                  </Link>
                </div>

                {/* Dashboard Section */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">Dashboard</h3>
                  <Link
                    href="/dashboard"
                    className="flex items-center space-x-3 text-white p-2 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <Heart className="h-5 w-5" />
                    <span>Mood Tracking</span>
                  </Link>
                  <Link
                    href="/calendar"
                    className="flex items-center space-x-3 text-white p-2 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <Calendar className="h-5 w-5" />
                    <span>Calendar</span>
                  </Link>
                  <Link
                    href="/dashboard"
                    className="flex items-center space-x-3 text-white p-2 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <Cloud className="h-5 w-5" />
                    <span>Weather & Mood</span>
                  </Link>
                  <Link
                    href="/dashboard"
                    className="flex items-center space-x-3 text-white p-2 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <Brain className="h-5 w-5" />
                    <span>Mood Analysis</span>
                  </Link>
                  <Link
                    href="/dashboard"
                    className="flex items-center space-x-3 text-white p-2 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <Music className="h-5 w-5" />
                    <span>Recommendations</span>
                  </Link>
                  <Link
                    href="/dashboard"
                    className="flex items-center space-x-3 text-white p-2 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <Users className="h-5 w-5" />
                    <span>Therapist Finder</span>
                  </Link>
                  <Link
                    href="/period-tracker"
                    className="flex items-center space-x-3 text-white p-2 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <Activity className="h-5 w-5" />
                    <span>Period Tracker</span>
                  </Link>
                  <Link
                    href="/analytics"
                    className="flex items-center space-x-3 text-white p-2 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <BarChart3 className="h-5 w-5" />
                    <span>Analytics</span>
                  </Link>
                </div>

                {/* Other Sections */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">Other</h3>
                  <Link
                    href="/music-preferences"
                    className="flex items-center space-x-3 text-white p-2 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <Music className="h-5 w-5" />
                    <span>Music Preferences</span>
                  </Link>
                  <Link
                    href="/journal"
                    className="flex items-center space-x-3 text-white p-2 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <Activity className="h-5 w-5" />
                    <span>Journal</span>
                  </Link>
                  <Link
                    href="/guided-sessions"
                    className="flex items-center space-x-3 text-white p-2 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <Brain className="h-5 w-5" />
                    <span>Guided Sessions</span>
                  </Link>
                  <Link
                    href="/dashboard/settings"
                    className="flex items-center space-x-3 text-white p-2 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <Settings className="h-5 w-5" />
                    <span>Settings</span>
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <h1 className="text-lg font-semibold ml-4 text-white">Dashboard</h1>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-gray-800">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/avatars/01.png" alt="Avatar" />
                <AvatarFallback className="bg-gray-700 text-white">CN</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
            <DropdownMenuItem className="text-white hover:bg-gray-700 focus:bg-gray-700">
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
              <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-white hover:bg-gray-700 focus:bg-gray-700">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
              <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-gray-700" />
            <DropdownMenuItem onClick={() => {
              if (typeof window !== 'undefined') {
                handleLogout()
              }
            }} className="text-white hover:bg-gray-700 focus:bg-gray-700">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>
      <main className="p-4 bg-gray-900">{children}</main>
    </div>
  )
}

export default DashboardLayout
