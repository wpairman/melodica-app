"use client"

import type React from "react"

import { useState, useEffect } from "react"

// Force dynamic rendering to avoid SSR issues with event handlers
export const dynamic = 'force-dynamic'
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Heart, ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"

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
          
          // Auto-login if credentials are saved
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Prevent duplicate submissions
    if (isSubmitting) return
    
    setIsSubmitting(true)

    // Normalize email and password (trim whitespace, lowercase email)
    const normalizedEmail = formData.email.trim().toLowerCase()
    const normalizedPassword = formData.password.trim()

    console.log("=== LOGIN DEBUG START ===")
    console.log("Input - Email:", normalizedEmail, "Password length:", normalizedPassword.length)

    // Check credentials against all users in localStorage (client-side only)
    if (typeof window !== 'undefined') {
      // First check allUsers array (new system)
      const allUsersStr = localStorage.getItem("allUsers")
      let foundUser = null
      
      console.log("allUsers in localStorage:", allUsersStr ? "EXISTS" : "NOT FOUND")
      
      if (allUsersStr) {
        try {
          const allUsers = JSON.parse(allUsersStr)
          console.log("Total users in allUsers:", allUsers.length)
          
          // Log all stored emails for debugging
          allUsers.forEach((user: any, index: number) => {
            const userEmail = (user.email || "").trim().toLowerCase()
            const userPassword = (user.password || "").trim()
            console.log(`User ${index}:`, {
              storedEmail: user.email,
              normalizedEmail: userEmail,
              emailMatch: userEmail === normalizedEmail,
              passwordLength: userPassword.length,
              inputPasswordLength: normalizedPassword.length,
              passwordMatch: userPassword === normalizedPassword
            })
          })
          
          foundUser = allUsers.find((user: any) => {
            const userEmail = (user.email || "").trim().toLowerCase()
            const userPassword = (user.password || "").trim()
            const emailMatch = userEmail === normalizedEmail
            const passwordMatch = userPassword === normalizedPassword
            
            console.log(`Checking user ${user.email}:`, { emailMatch, passwordMatch })
            
            return emailMatch && passwordMatch
          })
          
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
            const userPassword = (userData.password || "").trim()
            
            console.log("Checking userData fallback:", {
              storedEmail: userData.email,
              normalizedEmail: userEmail,
              emailMatch: userEmail === normalizedEmail,
              passwordLength: userPassword.length,
              inputPasswordLength: normalizedPassword.length,
              passwordMatch: userPassword === normalizedPassword
            })
            
            if (userEmail === normalizedEmail && userPassword === normalizedPassword) {
              foundUser = userData
              console.log("✅ User found in userData (fallback):", userData.email)
            } else {
              console.log("❌ User NOT found in userData (fallback)")
            }
          } catch (error) {
            console.error("Error parsing userData:", error)
          }
        }
      }

      if (foundUser) {
        console.log("✅ LOGIN SUCCESS")
        // Save credentials if "Remember me" is checked
        if (formData.rememberMe) {
          localStorage.setItem("savedCredentials", JSON.stringify({
            email: normalizedEmail,
            password: normalizedPassword,
          }))
        } else {
          // Remove saved credentials if "Remember me" is unchecked
          localStorage.removeItem("savedCredentials")
        }

        // Update current userData for backward compatibility
        localStorage.setItem("userData", JSON.stringify(foundUser))

        // Use the auth context to log in the user
        login(foundUser)
        router.push("/dashboard")
      } else {
        console.log("❌ LOGIN FAILED - No matching user found")
        console.log("=== LOGIN DEBUG END ===")
        
        toast({
          title: "Login failed",
          description: "Invalid email or password. Check browser console (F12) for details.",
          variant: "destructive",
        })
        setIsSubmitting(false)
      }
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
              <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700">
                Sign In
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <div className="text-sm text-center text-gray-300">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-teal-400 hover:underline">
                Sign up
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
