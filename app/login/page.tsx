"use client"

import type React from "react"

import { useState, useEffect } from "react"

// Force dynamic rendering to avoid SSR issues with event handlers
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Heart, ArrowLeft, AlertCircle, Info } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { verifyPassword, isOldHashFormat, migratePassword } from "@/lib/password-utils"
import { getUserByEmailFromFirebase } from "@/lib/firebase-users"
import { AccountImportButton } from "@/components/account-import-button"

export default function Login() {
  const router = useRouter()
  const { toast } = useToast()
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load saved credentials on component mount and auto-login if session exists
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // CRITICAL: Check if user explicitly logged out - DO NOT auto-login if they did
      const explicitlyLoggedOut = localStorage.getItem("explicitlyLoggedOut")
      if (explicitlyLoggedOut === "true") {
        console.log("🚫 LOGIN PAGE - Auto-login blocked: User explicitly logged out")
        // Clear the flag so it doesn't persist forever
        localStorage.removeItem("explicitlyLoggedOut")
        // Still load saved credentials for the form, but DON'T auto-login
        const savedCredentials = localStorage.getItem("savedCredentials")
        if (savedCredentials) {
          try {
            const credentials = JSON.parse(savedCredentials)
            setFormData(prev => ({
              ...prev,
              email: credentials.email || "",
              password: credentials.password || "",
              rememberMe: true,
            }))
          } catch (error) {
            console.error("Error parsing saved credentials:", error)
          }
        }
        return // Exit early - do NOT auto-login
      }
      
      // First, check if user is already logged in
      const isLoggedIn = localStorage.getItem("isLoggedIn")
      const currentUser = localStorage.getItem("currentUser")
      
      if (isLoggedIn === "true" && currentUser) {
        try {
          // User is already logged in, redirect to dashboard
          const userData = JSON.parse(currentUser)
          login(userData)
          router.push("/dashboard")
          return
        } catch (error) {
          console.error("Error parsing current user:", error)
        }
      }
      
      // Otherwise, load saved credentials for the form
      const savedCredentials = localStorage.getItem("savedCredentials")
      if (savedCredentials) {
        try {
          const credentials = JSON.parse(savedCredentials)
          setFormData(prev => ({
            ...prev,
            email: credentials.email || "",
            password: credentials.password || "",
            rememberMe: true,
          }))
          
          // Auto-login if credentials are saved (only if user didn't explicitly log out)
          const storedData = localStorage.getItem("userData")
          if (storedData) {
            try {
              const userData = JSON.parse(storedData)
              if (userData.email === credentials.email && userData.password === credentials.password) {
                // Auto-login the user
                login(userData)
                router.push("/dashboard")
              }
            } catch (error) {
              console.error("Error auto-logging in:", error)
            }
          }
        } catch (error) {
          console.error("Error parsing saved credentials:", error)
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Empty dependency array - only run once on mount. login/router are stable.

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({ 
      ...prev, 
      [name]: type === "checkbox" ? checked : value 
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Prevent duplicate submissions
    if (isSubmitting) {
      console.log("⏸️ Already submitting, ignoring duplicate submission")
      return
    }
    
    setIsSubmitting(true)

    try {
      // Normalize email and password (trim whitespace, lowercase email)
      const normalizedEmail = formData.email.trim().toLowerCase()
      const normalizedPassword = formData.password.trim()

      if (!normalizedEmail || !normalizedPassword) {
        toast({
          title: "Invalid input",
          description: "Please enter both email and password",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      console.log("=== LOGIN DEBUG START ===")
      console.log("Input - Email:", normalizedEmail, "Password length:", normalizedPassword.length)

      // Check credentials against all users in localStorage (client-side only)
      if (typeof window === 'undefined') {
        console.error("❌ window is undefined - cannot access localStorage")
        setIsSubmitting(false)
        return
      }

      // Check if localStorage is available (Safari private browsing mode disables it)
      try {
        const testKey = '__localStorage_test__'
        localStorage.setItem(testKey, 'test')
        localStorage.removeItem(testKey)
      } catch (error) {
        console.error("❌ localStorage is not available (possibly private browsing mode)")
        toast({
          title: "Storage unavailable",
          description: "Please disable private browsing mode to use this app",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }
      // First check allUsers array (new system)
      const allUsersStr = localStorage.getItem("allUsers")
      let foundUser: { email?: string; emailVerified?: boolean; password?: string; [key: string]: unknown } | null = null
      
      console.log("allUsers in localStorage:", allUsersStr ? "EXISTS" : "NOT FOUND")
      
      if (allUsersStr) {
        try {
          const allUsers = JSON.parse(allUsersStr)
          console.log("Total users in allUsers:", allUsers.length)
          
          // Check each user with password verification
          for (const user of allUsers) {
            const userEmail = (user.email || "").trim().toLowerCase()
            const emailMatch = userEmail === normalizedEmail
            
            if (emailMatch) {
              // Check if password is in old format (plain text) or new format (hashed)
              const storedPassword = user.password || ""
              
              if (isOldHashFormat(storedPassword)) {
                // Old format: plain text comparison (for backward compatibility)
                console.log("⚠️ Using old password format for user:", user.email)
                if (storedPassword === normalizedPassword) {
                  foundUser = user
                  console.log("✅ Password match (old format)")
                  // Migrate password to new format (don't await - do it in background)
                  migratePassword(user.email, normalizedPassword).then((hashedPassword) => {
                    user.password = hashedPassword
                    const updatedUsers = allUsers.map((u: any) => 
                      u.email === user.email ? { ...u, password: hashedPassword } : u
                    )
                    try {
                      localStorage.setItem("allUsers", JSON.stringify(updatedUsers))
                      localStorage.setItem("userData", JSON.stringify({ ...user, password: hashedPassword }))
                      console.log("✅ Migrated password to new format")
                    } catch (error) {
                      console.error("Error saving migrated password:", error)
                    }
                  }).catch((error) => {
                    console.error("Error migrating password:", error)
                  })
                  break
                } else {
                  console.log("❌ Password mismatch (old format)")
                }
              } else {
                // New format: verify password hash with timeout
                console.log("🔐 Verifying password hash...")
                try {
                  // Add timeout to password verification (5 seconds max)
                  const passwordVerificationPromise = verifyPassword(normalizedPassword, storedPassword)
                  const timeoutPromise = new Promise<boolean>((_, reject) => 
                    setTimeout(() => reject(new Error("Password verification timeout")), 5000)
                  )
                  
                  const passwordMatch = await Promise.race([passwordVerificationPromise, timeoutPromise])
                  if (passwordMatch) {
                    foundUser = user
                    console.log("✅ User found with password verification:", user.email)
                    break
                  } else {
                    console.log("❌ Password mismatch (hash verification)")
                  }
                } catch (error) {
                  console.error("Error verifying password:", error)
                  // If verification fails or times out, continue to next user
                }
              }
            }
          }
          
          if (foundUser) {
            console.log("✅ User found in allUsers array:", foundUser.email)
          } else {
            console.log("❌ User NOT found in allUsers array")
          }
        } catch (error) {
          console.error("Error parsing allUsers:", error)
          console.error("Raw allUsers string:", allUsersStr?.substring(0, 200))
        }
      }
      
      // Fallback to old userData for backward compatibility
      if (!foundUser) {
        const storedData = localStorage.getItem("userData")
        console.log("userData in localStorage:", storedData ? "EXISTS" : "NOT FOUND")
        
        if (storedData) {
          try {
            const userData = JSON.parse(storedData)
            const userEmail = (userData.email || "").trim().toLowerCase()
            const storedPassword = userData.password || ""
            
            if (userEmail === normalizedEmail) {
              // Check if password is in old format or new format
              if (isOldHashFormat(storedPassword)) {
                // Old format: plain text comparison
                if (storedPassword === normalizedPassword) {
                  foundUser = userData
                  // Migrate password
                  try {
                    const hashedPassword = await migratePassword(userData.email, normalizedPassword)
                    userData.password = hashedPassword
                    localStorage.setItem("userData", JSON.stringify(userData))
                    console.log("✅ Migrated password in userData to new format")
                  } catch (error) {
                    console.error("Error migrating password:", error)
                  }
                }
              } else {
                // New format: verify password hash with timeout
                console.log("🔐 Verifying password hash in userData...")
                try {
                  // Add timeout to password verification (5 seconds max)
                  const passwordVerificationPromise = verifyPassword(normalizedPassword, storedPassword)
                  const timeoutPromise = new Promise<boolean>((_, reject) => 
                    setTimeout(() => reject(new Error("Password verification timeout")), 5000)
                  )
                  
                  const passwordMatch = await Promise.race([passwordVerificationPromise, timeoutPromise])
                  if (passwordMatch) {
                    foundUser = userData
                    console.log("✅ User found in userData with password verification")
                  } else {
                    console.log("❌ Password mismatch (hash verification in userData)")
                  }
                } catch (error) {
                  console.error("Error verifying password:", error)
                }
              }
            }
          } catch (error) {
            console.error("Error parsing userData:", error)
          }
        }
      }

      if (foundUser) {
        console.log("✅ LOGIN SUCCESS - Proceeding with login")
        
        // Only require email verification for NEW users (first-time signups)
        // A new user is identified by having a verificationToken (from registration)
        // Existing users (already in system) should NOT need verification
        const hasVerificationToken = foundUser.verificationToken || 
                                     localStorage.getItem(`verificationToken_${foundUser.email}`)
        const isNewUser = foundUser.emailVerified === false && hasVerificationToken
        
        if (isNewUser) {
          // This is a new user who hasn't verified yet - require verification
          toast({
            title: "Email not verified",
            description: "Please verify your email address before logging in. Check your email for the verification link.",
            variant: "destructive",
          })
          // Redirect to verification page
          router.push(`/verify-email?email=${encodeURIComponent(foundUser.email ?? "")}`)
          setIsSubmitting(false)
          return
        }
        
        // For existing users: if they don't have a verificationToken, they're an existing user
        // Mark them as verified if not already set (backward compatibility)
        if (!hasVerificationToken && foundUser.emailVerified !== true) {
          // This is an existing user - mark as verified
          const allUsersStr = localStorage.getItem("allUsers")
          if (allUsersStr) {
            try {
              const allUsers = JSON.parse(allUsersStr)
              const userEmail = foundUser.email
              const updatedUsers = allUsers.map((user: any) => {
                if (user.email === userEmail) {
                  return { ...user, emailVerified: true }
                }
                return user
              })
              localStorage.setItem("allUsers", JSON.stringify(updatedUsers))
              foundUser.emailVerified = true
            } catch (error) {
              console.error("Error updating user verification status:", error)
            }
          }
        }
        
        // For existing users (emailVerified === true OR undefined), allow login without verification
        // If emailVerified is undefined (old users), mark as verified for consistency
        if (foundUser.emailVerified === undefined) {
          // Update user to mark as verified (grandfather existing users)
          const allUsersStr = localStorage.getItem("allUsers")
          if (allUsersStr) {
            try {
              const allUsers = JSON.parse(allUsersStr)
              const userEmail = foundUser.email
              const updatedUsers = allUsers.map((user: any) => {
                if (user.email === userEmail) {
                  return { ...user, emailVerified: true }
                }
                return user
              })
              localStorage.setItem("allUsers", JSON.stringify(updatedUsers))
              foundUser.emailVerified = true
            } catch (error) {
              console.error("Error updating user verification status:", error)
            }
          }
        }
        
        // Fetch latest user data from Firebase (preferences may have been updated elsewhere)
        try {
          const firebaseUser = await getUserByEmailFromFirebase(normalizedEmail)
          if (firebaseUser) {
            foundUser = { ...foundUser, ...firebaseUser, password: foundUser.password }
          }
        } catch (e) {
          console.warn("Could not fetch from Firebase, using local data:", e)
        }

        // IMPORTANT: Add user to this device's allUsers array if not already present
        const allUsersStr = localStorage.getItem("allUsers")
        let allUsers: any[] = []
        
        if (allUsersStr) {
          try {
            allUsers = JSON.parse(allUsersStr)
          } catch (error) {
            console.error("Error parsing allUsers:", error)
            allUsers = []
          }
        }
        
        const userExists = allUsers.some((user: any) => 
          (user.email || "").trim().toLowerCase() === normalizedEmail
        )
        
        if (!userExists) {
          allUsers.push(foundUser)
          try {
            localStorage.setItem("allUsers", JSON.stringify(allUsers))
          } catch (error) {
            console.error("Error saving allUsers:", error)
          }
        } else {
          const updated = allUsers.map((u: any) =>
            (u.email || "").trim().toLowerCase() === normalizedEmail ? foundUser : u
          )
          localStorage.setItem("allUsers", JSON.stringify(updated))
        }
        
        // Save credentials if "Remember me" is checked
        if (formData.rememberMe) {
          try {
            localStorage.setItem("savedCredentials", JSON.stringify({
              email: normalizedEmail,
              password: normalizedPassword,
            }))
          } catch (error) {
            console.error("Error saving credentials:", error)
          }
        } else {
          try {
            localStorage.removeItem("savedCredentials")
          } catch (error) {
            console.error("Error removing saved credentials:", error)
          }
        }

        // Update current userData for backward compatibility
        try {
          localStorage.setItem("userData", JSON.stringify(foundUser))
        } catch (error) {
          console.error("Error saving userData:", error)
        }

        // Use the auth context to log in the user
        console.log("🔐 Calling login function...")
        const userForAuth = {
          ...foundUser,
          name: String(foundUser.name ?? ""),
          email: String(foundUser.email ?? ""),
          gender: String(foundUser.gender ?? ""),
          favoriteArtists: String(foundUser.favoriteArtists ?? ""),
          favoriteActivities: String(foundUser.favoriteActivities ?? ""),
        }
        login(userForAuth as Parameters<typeof login>[0])
        console.log("✅ Login function called, navigating to dashboard...")
        
        // Use setTimeout to ensure state updates before navigation (helps on mobile/iPad)
        setTimeout(() => {
          console.log("🚀 Navigating to dashboard...")
          router.push("/dashboard")
        }, 100)
      } else {
        console.log("❌ LOGIN FAILED - No matching user found")
        console.log("=== LOGIN DEBUG END ===")
        
        // Check if this might be a multi-device issue
        let hasNoUsers = false
        try {
          const allUsersStr = localStorage.getItem("allUsers")
          if (!allUsersStr) {
            hasNoUsers = true
          } else {
            const allUsers = JSON.parse(allUsersStr)
            hasNoUsers = !Array.isArray(allUsers) || allUsers.length === 0
          }
        } catch (error) {
          // If parsing fails, assume no users
          hasNoUsers = true
        }
        
        toast({
          title: "Login failed",
          description: hasNoUsers 
            ? "Account not found on this device. If you registered on another device, use the 'Import Account' button above to import your account file."
            : "Invalid email or password. Please check your credentials and try again.",
          variant: "destructive",
        })
        setIsSubmitting(false)
      }
    } catch (error: any) {
      console.error("❌ LOGIN ERROR:", error)
      console.error("Error stack:", error.stack)
      toast({
        title: "Login error",
        description: error.message || "An error occurred during login. Please try again.",
        variant: "destructive",
      })
      setIsSubmitting(false)
    }
  }

  // Add direct onClick handler as fallback for mobile devices
  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    console.log("🔘 Button clicked directly - isSubmitting:", isSubmitting)
    
    if (!isSubmitting && formData.email && formData.password) {
      console.log("✅ Triggering form submission...")
      // Create a synthetic form event
      const syntheticEvent = {
        preventDefault: () => {},
        stopPropagation: () => {},
      } as React.FormEvent
      handleSubmit(syntheticEvent)
    } else {
      console.log("⏸️ Button click ignored - already submitting or missing credentials")
    }
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="m-auto w-full max-w-md p-4">
        <Card className="border-none shadow-lg bg-gray-800 border-gray-700">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2">
              <Link href="/" className="inline-flex items-center text-white hover:text-gray-300">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Link>
              <div className="ml-auto flex items-center">
                <Heart className="h-6 w-6 text-rose-500 mr-2" />
                <span className="font-semibold text-white">Melodica</span>
              </div>
            </div>
            <CardTitle className="text-2xl mt-4 text-white">Welcome back</CardTitle>
            <CardDescription className="text-gray-300">Enter your credentials to access your account</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Multi-device notice */}
            <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-blue-200 flex-1">
                  <p className="font-medium mb-1">Using a new device?</p>
                  <p className="text-blue-300/80 mb-2">
                    If you registered on another device, import your account file below to log in.
                  </p>
                  <AccountImportButton />
                </div>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-white">Password</Label>
                  <Link href="/forgot-password" className="text-xs text-teal-400 hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rememberMe"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, rememberMe: checked as boolean }))
                  }
                  className="border-gray-600"
                />
                <Label htmlFor="rememberMe" className="text-sm text-gray-300 cursor-pointer">
                  Remember me
                </Label>
              </div>
              <Button 
                type="submit" 
                className="w-full bg-teal-600 hover:bg-teal-700"
                disabled={isSubmitting}
                onClick={handleButtonClick}
              >
                {isSubmitting ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <div className="text-sm text-center text-gray-300">
              Don&apos;t have an account?{" "}
              <Link href="/pricing" className="text-teal-400 hover:underline">
                Sign up
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
