"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { verifyPassword, isOldHashFormat } from "@/lib/password-utils"

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
                // Check credentials with password verification
                for (const user of allUsers) {
                  if (user.email === credentials.email) {
                    const storedPassword = user.password || ""
                    
                    // Check if password is in old format or new format
                    if (isOldHashFormat(storedPassword)) {
                      // Old format: plain text comparison
                      if (storedPassword === credentials.password) {
                        foundUser = user
                        break
                      }
                    } else {
                      // New format: verify password hash (async)
                      verifyPassword(credentials.password, storedPassword).then((match) => {
                        if (match) {
                          foundUser = user
                        }
                      })
                      // For auto-login, we'll use synchronous check if available
                      // Otherwise, the user will need to manually log in
                      if (storedPassword && storedPassword.includes(':')) {
                        // Hashed format exists, but async verification needed
                        // Skip auto-login for hashed passwords in auto-login flow
                        // User will need to manually log in
                        foundUser = null
                      }
                    }
                  }
                }
              } catch (error) {
                console.error("Error parsing allUsers:", error)
              }
            }
            
            // Fallback to old userData for backward compatibility
            if (!foundUser) {
              const storedData = localStorage.getItem("userData")
              if (storedData) {
                const userData = JSON.parse(storedData)
                if (userData.email === credentials.email) {
                  const storedPassword = userData.password || ""
                  
                  // Check if password is in old format or new format
                  if (isOldHashFormat(storedPassword)) {
                    // Old format: plain text comparison
                    if (storedPassword === credentials.password) {
                      foundUser = userData
                    }
                  } else {
                    // New format: skip auto-login (requires async verification)
                    // User will need to manually log in
                    foundUser = null
                  }
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
    // NOTE: localStorage is device-specific, so users can sign in on multiple devices simultaneously
    // Each device maintains its own independent session
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
    // NOTE: This only affects the current device. Other devices remain logged in independently
    if (typeof window !== 'undefined') {
      localStorage.removeItem("currentUser")
      localStorage.removeItem("isLoggedIn")
      localStorage.removeItem("userData")
      // CRITICAL: Clear savedCredentials to prevent auto-login on THIS device
      localStorage.removeItem("savedCredentials")
      // Set flag as extra protection (checked in multiple places)
      localStorage.setItem("explicitlyLoggedOut", "true")
      console.log("✅ Cleared: currentUser, isLoggedIn, userData, savedCredentials")
      console.log("✅ Set explicitlyLoggedOut flag")
      console.log("🔒 User will stay logged out on THIS device until they manually log in again")
      console.log("ℹ️ Note: Other devices remain logged in independently")
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
