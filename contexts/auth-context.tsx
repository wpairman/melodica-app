"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface User {
  name: string
  email: string
  gender: string
  favoriteArtists: string
  favoriteActivities: string
}

interface AuthContextType {
  user: User | null
  login: (userData: User) => void
  logout: () => void
  isAuthenticated: boolean
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // Check if user is already logged in on component mount (client-side only)
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem("currentUser")
      const isLoggedIn = localStorage.getItem("isLoggedIn")

      if (storedUser && isLoggedIn === "true") {
        try {
          const userData = JSON.parse(storedUser)
          setUser(userData)
          setIsAuthenticated(true)
        } catch (error) {
          console.error("Error parsing stored user data:", error)
          // Clear invalid data
          localStorage.removeItem("currentUser")
          localStorage.removeItem("isLoggedIn")
        }
      } else {
        // If not explicitly logged in, check for saved credentials and auto-login
        const savedCredentials = localStorage.getItem("savedCredentials")
        if (savedCredentials) {
          try {
            const credentials = JSON.parse(savedCredentials)
            const storedData = localStorage.getItem("userData")
            if (storedData) {
              const userData = JSON.parse(storedData)
              if (userData.email === credentials.email && userData.password === credentials.password) {
                // Auto-login the user
                setUser(userData)
                setIsAuthenticated(true)
                localStorage.setItem("currentUser", JSON.stringify(userData))
                localStorage.setItem("isLoggedIn", "true")
              }
            }
          } catch (error) {
            console.error("Error auto-logging in from saved credentials:", error)
          }
        }
      }
    }
    setIsLoading(false)
    setIsInitialized(true)
  }, [])

  const login = (userData: User) => {
    setUser(userData)
    setIsAuthenticated(true)
    // Save to localStorage (client-side only)
    if (typeof window !== 'undefined') {
      localStorage.setItem("currentUser", JSON.stringify(userData))
      localStorage.setItem("isLoggedIn", "true")
    }
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    // Clear login session but keep saved credentials if user wants to remember
    if (typeof window !== 'undefined') {
      localStorage.removeItem("currentUser")
      localStorage.removeItem("isLoggedIn")
      // Note: savedCredentials is kept so user can easily log back in
      // If they want to clear everything, they can use "Clear Saved Credentials" in profile
    }
  }

  // Show loading state until initialized
  if (!isInitialized) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-white">Loading...</p>
      </div>
    </div>
  }

  return <AuthContext.Provider value={{ user, login, logout, isAuthenticated, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
