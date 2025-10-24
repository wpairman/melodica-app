"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, ArrowLeft, Mail, CheckCircle, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export const dynamic = 'force-dynamic'

export default function VerifyEmail() {
  const { toast } = useToast()
  const [isVerified, setIsVerified] = useState(false)

  const handleVerify = () => {
    // In a real app, this would verify the token from the URL
    toast({
      title: "Email verified!",
      description: "Your email has been successfully verified.",
    })
    setIsVerified(true)
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
                  <Button 
                    onClick={handleVerify} 
                    className="w-full bg-teal-600 hover:bg-teal-700"
                  >
                    Verify Email
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                  >
                    Resend Verification Email
                  </Button>
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
