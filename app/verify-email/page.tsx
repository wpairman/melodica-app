"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, ArrowLeft, Mail, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { generateVerificationToken } from "@/lib/email-utils"
import { updateUserEmailVerificationInFirebase } from "@/lib/firebase-users"

export default function VerifyEmail() {
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isVerified, setIsVerified] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [email, setEmail] = useState("")

  useEffect(() => {
    // Get email and token from URL params
    const emailParam = searchParams?.get('email') || ''
    const tokenParam = searchParams?.get('token') || ''
    
    if (emailParam) {
      setEmail(emailParam)
    }

    // Auto-verify if token is present in URL
    if (tokenParam && emailParam) {
      verifyEmail(tokenParam, emailParam)
    }
  }, [searchParams])

  const verifyEmail = async (token: string, userEmail: string) => {
    setIsVerifying(true)
    
    try {
      // Check if token exists in localStorage
      const storedTokenData = localStorage.getItem(`verificationToken_${userEmail}`)
      
      if (!storedTokenData) {
        throw new Error('Verification token not found')
      }

      const tokenData = JSON.parse(storedTokenData)
      
      // Check if token matches
      if (tokenData.token !== token) {
        throw new Error('Invalid verification token')
      }

      // Check if token has expired
      const expiryDate = new Date(tokenData.expiry)
      if (expiryDate < new Date()) {
        throw new Error('Verification token has expired')
      }

      // Update user's emailVerified status in allUsers array
      const allUsersStr = localStorage.getItem("allUsers")
      if (allUsersStr) {
        const allUsers = JSON.parse(allUsersStr)
        const updatedUsers = allUsers.map((user: any) => {
          if (user.email === userEmail) {
            return {
              ...user,
              emailVerified: true,
              verificationToken: undefined,
              verificationTokenExpiry: undefined,
            }
          }
          return user
        })
        localStorage.setItem("allUsers", JSON.stringify(updatedUsers))
        
        // Also update userData if it's the current user
        const userDataStr = localStorage.getItem("userData")
        if (userDataStr) {
          const userData = JSON.parse(userDataStr)
          if (userData.email === userEmail) {
            const updatedUserData = {
              ...userData,
              emailVerified: true,
              verificationToken: undefined,
              verificationTokenExpiry: undefined,
            }
            localStorage.setItem("userData", JSON.stringify(updatedUserData))
          }
        }
      }

      // Update email verification status in Firebase
      try {
        await updateUserEmailVerificationInFirebase(userEmail, true)
      } catch (error) {
        console.error("Failed to update Firebase:", error)
        // Don't fail verification if Firebase update fails
      }

      // Remove verification token
      localStorage.removeItem(`verificationToken_${userEmail}`)

      setIsVerified(true)
      toast({
        title: "Email verified!",
        description: "Your email has been successfully verified. You can now access all features.",
      })

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)
    } catch (error: any) {
      console.error('Verification error:', error)
      toast({
        title: "Verification failed",
        description: error.message || "Invalid or expired verification token. Please request a new one.",
        variant: "destructive",
      })
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResendVerification = async () => {
    if (!email) {
      toast({
        title: "Email required",
        description: "Please provide your email address.",
        variant: "destructive",
      })
      return
    }

    setIsResending(true)

    try {
      // Get user data
      const allUsersStr = localStorage.getItem("allUsers")
      if (!allUsersStr) {
        throw new Error('User not found')
      }

      const allUsers = JSON.parse(allUsersStr)
      const user = allUsers.find((u: any) => u.email === email)

      if (!user) {
        throw new Error('User not found')
      }

      // Generate new token
      const newToken = generateVerificationToken()
      const tokenExpiry = new Date()
      tokenExpiry.setHours(tokenExpiry.getHours() + 24)

      // Update user with new token
      const updatedUsers = allUsers.map((u: any) => {
        if (u.email === email) {
          return {
            ...u,
            verificationToken: newToken,
            verificationTokenExpiry: tokenExpiry.toISOString(),
          }
        }
        return u
      })
      localStorage.setItem("allUsers", JSON.stringify(updatedUsers))

      // Store new token
      localStorage.setItem(`verificationToken_${email}`, JSON.stringify({
        token: newToken,
        expiry: tokenExpiry.toISOString(),
        email: email,
      }))

      // Send verification email
      // Get API URL - check both env var and window location
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 
        (typeof window !== 'undefined' && window.location.hostname === 'melodicaapp.com' 
          ? 'https://melodica-api.vercel.app' 
          : '')
      // Construct full API endpoint path
      const apiUrl = apiBaseUrl ? `${apiBaseUrl}/api/auth/send-verification` : '/api/auth/send-verification'
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          name: user.name,
          token: newToken,
        }),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to send verification email')
      }

      toast({
        title: "Verification email sent!",
        description: "Please check your email for the new verification link.",
      })
    } catch (error: any) {
      console.error('Resend error:', error)
      toast({
        title: "Failed to resend email",
        description: error.message || "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="m-auto w-full max-w-md p-4">
        <Card className="border-none shadow-lg bg-gray-800 border-gray-700">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2">
              <Link href="/login" className="inline-flex items-center text-white hover:text-gray-300">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Login
              </Link>
              <div className="ml-auto flex items-center">
                <Heart className="h-6 w-6 text-rose-500 mr-2" />
                <span className="font-semibold text-white">Melodica</span>
              </div>
            </div>
            <CardTitle className="text-2xl mt-4 text-white flex items-center gap-2">
              <Mail className="h-6 w-6 text-teal-400" />
              Verify Your Email
            </CardTitle>
            <CardDescription className="text-gray-300">
              {isVerified 
                ? "Your email has been verified" 
                : "Please verify your email address to complete your registration"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isVerified ? (
              <div className="space-y-4 text-center py-8">
                <div className="flex justify-center">
                  <div className="rounded-full bg-teal-900/20 p-4">
                    <CheckCircle className="h-12 w-12 text-teal-400" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Verification Complete!</h3>
                  <p className="text-gray-300 text-sm">
                    Your email has been successfully verified. You can now access all features.
                  </p>
                </div>
                <Link href="/dashboard" className="block">
                  <Button className="w-full bg-teal-600 hover:bg-teal-700">
                    Go to Dashboard
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4 py-8">
                <div className="flex justify-center">
                  <div className="rounded-full bg-yellow-900/20 p-4">
                    <AlertCircle className="h-12 w-12 text-yellow-400" />
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-white mb-2">Check Your Email</h3>
                  <p className="text-gray-300 text-sm mb-4">
                    We've sent a verification link to your email address. Click the link in the email to verify your account.
                  </p>
                  <p className="text-gray-400 text-xs">
                    Didn't receive the email? Check your spam folder or request a new verification email.
                  </p>
                </div>
                <div className="space-y-2">
                  {email && (
                    <div className="mb-4 p-3 bg-gray-700 rounded-lg">
                      <p className="text-sm text-gray-300">
                        <strong className="text-white">Email:</strong> {email}
                      </p>
                    </div>
                  )}
                  {!searchParams?.get('token') && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-400 mb-2">
                        Check your email for the verification link, or enter your email below to resend:
                      </p>
                      <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  )}
                  <Button 
                    onClick={handleResendVerification}
                    disabled={isResending || !email}
                    className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-50"
                  >
                    {isResending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      "Resend Verification Email"
                    )}
                  </Button>
                  {isVerifying && (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin text-teal-400" />
                      <span className="ml-2 text-gray-300">Verifying...</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <div className="text-sm text-center text-gray-300">
              Already verified?{" "}
              <Link href="/login" className="text-teal-400 hover:underline">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
