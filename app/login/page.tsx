"use client"

import type React from "react"
import { useState, useEffect } from "react"
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
  const { login, loginWithGoogle, isAuthenticated } = useAuth()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard")
    }
  }, [isAuthenticated, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return
    setIsSubmitting(true)

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

    const result = await login(normalizedEmail, normalizedPassword, {
      rememberMe: formData.rememberMe,
    })

    if (result && "success" in result && result.success) {
      router.push("/dashboard")
      return
    }

    const message =
      result && "error" in result && typeof result.error === "string"
        ? result.error
        : "Invalid email or password"

    toast({
      title: "Couldn't sign in",
      description: message,
      variant: "destructive",
    })
    setIsSubmitting(false)
  }

  const handleGoogleLogin = async () => {
    if (isGoogleSubmitting) return
    setIsGoogleSubmitting(true)

    const result = await loginWithGoogle()

    if (result.success) {
      router.push("/dashboard")
    } else {
      toast({
        title: "Google sign-in failed",
        description: result.error || "Something went wrong. Please try again.",
        variant: "destructive",
      })
      setIsGoogleSubmitting(false)
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
            <CardDescription className="text-gray-300">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">

            {/* Google Sign In */}
            <Button
              type="button"
              variant="outline"
              className="w-full border-gray-600 bg-gray-700 text-white hover:bg-gray-600 flex items-center justify-center gap-3"
              onClick={handleGoogleLogin}
              disabled={isGoogleSubmitting || isSubmitting}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {isGoogleSubmitting ? "Signing in..." : "Continue with Google"}
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-600" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-gray-800 px-2 text-gray-400">Or continue with email</span>
              </div>
            </div>

            {/* Email/Password Form */}
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
                  checked={formData.rememberMe}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, rememberMe: checked as boolean }))
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
                disabled={isSubmitting || isGoogleSubmitting}
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