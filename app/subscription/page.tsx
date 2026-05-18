"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, CheckCircle2, XCircle } from "lucide-react"
import { useIsNative } from "@/hooks/use-is-native"

export default function SubscriptionPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const status = searchParams?.get("status") ?? null
  const { isNative } = useIsNative()

  useEffect(() => {
    // If status is success, redirect after 3 seconds
    if (status === "success") {
      const timer = setTimeout(() => {
        router.push("/dashboard")
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [status, router])

  if (status === "success") {
    return (
      <div className="flex min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 items-center justify-center p-4">
        <Card className="w-full max-w-md bg-gray-800 border-gray-700">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-white">Subscription Successful!</CardTitle>
            <CardDescription className="text-gray-300">
              Your subscription is now active. Redirecting to dashboard...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (status === "canceled") {
    return (
      <div className="flex min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 items-center justify-center p-4">
        <Card className="w-full max-w-md bg-gray-800 border-gray-700">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl text-white">Subscription Canceled</CardTitle>
            <CardDescription className="text-gray-300">
              Your subscription was canceled. You can try again anytime.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {isNative ? (
              <Button
                className="w-full bg-teal-600 hover:bg-teal-700"
                onClick={() => window.open("https://melodicaapp.com", "_system")}
              >
                Visit melodicaapp.com
              </Button>
            ) : (
              <Link href="/pricing">
                <Button className="w-full bg-teal-600 hover:bg-teal-700">
                  View Plans
                </Button>
              </Link>
            )}
            <Link href="/dashboard">
              <Button variant="outline" className="w-full border-gray-600 text-gray-300">
                Back to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isNative) {
    return (
      <div className="flex min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 items-center justify-center p-4">
        <Card className="w-full max-w-md bg-gray-800 border-gray-700">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <Heart className="h-6 w-6 text-rose-500" />
            </div>
            <CardTitle className="text-2xl text-white">Manage Subscription</CardTitle>
            <CardDescription className="text-gray-300">
              Manage your subscription at our website
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              className="w-full bg-teal-600 hover:bg-teal-700"
              onClick={() => window.open("https://melodicaapp.com", "_system")}
            >
              Visit melodicaapp.com
            </Button>
            <Link href="/dashboard">
              <Button variant="outline" className="w-full border-gray-600 text-gray-300">
                Back to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <Heart className="h-6 w-6 text-rose-500" />
          </div>
          <CardTitle className="text-2xl text-white">Subscription</CardTitle>
          <CardDescription className="text-gray-300">
            Manage your subscription
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/pricing">
            <Button className="w-full bg-teal-600 hover:bg-teal-700">
              View Plans
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}

