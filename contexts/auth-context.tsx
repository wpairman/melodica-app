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
        // Check if user explicitly logged out - don't auto-login if they did
        const explicitlyLoggedOut = localStorage.getItem("explicitlyLoggedOut")
        if (explicitlyLoggedOut === "true") {
          console.log("🚫 Auto-login blocked: User explicitly logged out")
          // Clear the flag after checking (it's only used to prevent immediate re-login)
          localStorage.removeItem("explicitlyLoggedOut")
          setIsLoading(false)
          setIsInitialized(true)
          return
        }
        
        // If not explicitly logged in, check for saved credentials and auto-login
        const savedCredentials = localStorage.getItem("savedCredentials")
        if (savedCredentials) {
          try {
            const credentials = JSON.parse(savedCredentials)
            
            // First check allUsers array (new system)
            const allUsersStr = localStorage.getItem("allUsers")
            let foundUser = null
            
            if (allUsersStr) {
              try {
                const allUsers = JSON.parse(allUsersStr)
                foundUser = allUsers.find((user: any) => 
                  user.email === credentials.email && user.password === credentials.password
                )
              } catch (error) {
                console.error("Error parsing allUsers:", error)
              }
            }
            
            // Fallback to old userData for backward compatibility
            if (!foundUser) {
              const storedData = localStorage.getItem("userData")
              if (storedData) {
                const userData = JSON.parse(storedData)
                if (userData.email === credentials.email && userData.password === credentials.password) {
                  foundUser = userData
                }
              }
            }
            
            if (foundUser) {
              // Auto-login the user
              setUser(foundUser)
              setIsAuthenticated(true)
              localStorage.setItem("currentUser", JSON.stringify(foundUser))
              localStorage.setItem("isLoggedIn", "true")
              // Update userData for backward compatibility
              localStorage.setItem("userData", JSON.stringify(foundUser))
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
      // Clear the explicitlyLoggedOut flag when user logs in (manually)
      localStorage.removeItem("explicitlyLoggedOut")
    }
  }

  const logout = () => {
    console.log("🚪 LOGOUT FUNCTION - Starting logout")
    setUser(null)
    setIsAuthenticated(false)
    // Clear ALL login-related data to ensure user stays logged out
    if (typeof window !== 'undefined') {
      localStorage.removeItem("currentUser")
      localStorage.removeItem("isLoggedIn")
      localStorage.removeItem("userData")
      // CRITICAL: Clear savedCredentials to prevent auto-login
      localStorage.removeItem("savedCredentials")
      // Set flag as extra protection (checked in multiple places)
      localStorage.setItem("explicitlyLoggedOut", "true")
      console.log("✅ Cleared: currentUser, isLoggedIn, userData, savedCredentials")
      console.log("✅ Set explicitlyLoggedOut flag")
      console.log("🔒 User will stay logged out until they manually log in again")
    }
    console.log("✅ LOGOUT FUNCTION - Complete")
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
