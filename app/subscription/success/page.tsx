"use client"

import { useEffect, useState } from "react"

// Force dynamic rendering to avoid SSR issues with event handlers
export const dynamic = 'force-dynamic'
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, ArrowRight } from "lucide-react"
import DashboardLayout from "@/components/layouts/dashboard-layout"

export default function SubscriptionSuccessPage() {
  const searchParams = useSearchParams()
  const sessionId = searchParams?.get("session_id") || null
  const [loading, setLoading] = useState(true)
  const [subscription, setSubscription] = useState<any>(null)

  useEffect(() => {
    if (!searchParams) return
    
    // Check if this is a mock session (for prototype)
    const isMock = searchParams.get("mock") === "true"
    const mockPlan = searchParams.get("plan")
    const mockInterval = searchParams.get("interval")

    if (isMock && mockPlan) {
      setTimeout(() => {
        const isLifetime = mockInterval === "lifetime"

        setSubscription({
          plan: mockPlan.charAt(0).toUpperCase() + mockPlan.slice(1), // Capitalize first letter
          status: "active",
          currentPeriodEnd: isLifetime ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          isLifetime: isLifetime,
          isMock: true, // Flag to indicate this is a mock subscription
        })
        setLoading(false)

        // Update user data in localStorage for demo purposes (client-side only)
        if (typeof window !== 'undefined') {
          const userData = localStorage.getItem("userData")
          if (userData) {
            const parsedUserData = JSON.parse(userData)
            parsedUserData.subscription = {
              plan: mockPlan.charAt(0).toUpperCase() + mockPlan.slice(1),
              status: "active",
              currentPeriodEnd: isLifetime ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              isLifetime: isLifetime,
              isMock: true,
            }
            localStorage.setItem("userData", JSON.stringify(parsedUserData))
          }
        }
      }, 1500)
      return
    }

    // Verify payment with Stripe
    if (sessionId) {
      const verifySession = async () => {
        try {
          const response = await fetch(`/api/stripe/verify-session?session_id=${sessionId}`)
          const data = await response.json()

          if (!response.ok || !data.success) {
            throw new Error(data.error || "Payment verification failed")
          }

          // Extract plan info from metadata or URL params
          const params = new URLSearchParams(window.location.search)
          const planFromUrl = params.get("plan") || data.session.metadata?.plan || "premium"
          const intervalFromUrl = params.get("interval") || data.session.metadata?.interval || "monthly"
          const isLifetime = intervalFromUrl === "lifetime"

          // Calculate trial end date if subscription has trial
          let currentPeriodEnd: string | null = null
          if (!isLifetime && data.subscription?.trial_end) {
            currentPeriodEnd = new Date(data.subscription.trial_end * 1000).toLocaleDateString()
          } else if (!isLifetime && data.subscription?.current_period_end) {
            currentPeriodEnd = new Date(data.subscription.current_period_end * 1000).toLocaleDateString()
          }

          const planName = planFromUrl.charAt(0).toUpperCase() + planFromUrl.slice(1)

          setSubscription({
            plan: planName,
            status: data.subscription?.status || "active",
            currentPeriodEnd: currentPeriodEnd,
            isLifetime: isLifetime,
            verified: true,
          })

          // Update user data in localStorage
          if (typeof window !== 'undefined') {
            const userData = localStorage.getItem("userData")
            if (userData) {
              const parsedUserData = JSON.parse(userData)
              parsedUserData.subscription = {
                plan: planName,
                status: data.subscription?.status || "active",
                currentPeriodEnd: currentPeriodEnd ? new Date(currentPeriodEnd).toISOString() : null,
                isLifetime: isLifetime,
                verified: true,
              }
              localStorage.setItem("userData", JSON.stringify(parsedUserData))
            }
          }

          setLoading(false)
        } catch (error: any) {
          console.error("Verification error:", error)
          setLoading(false)
          // Show error state
          setSubscription({
            error: error.message || "Failed to verify payment",
          })
        }
      }

      verifySession()
    } else {
      setLoading(false)
    }
  }, [sessionId, searchParams])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p>Verifying your subscription...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (subscription?.error) {
    return (
      <DashboardLayout>
        <div className="max-w-md mx-auto">
          <Card className="border-red-200">
            <CardHeader className="bg-red-50 border-b border-red-100">
              <CardTitle className="text-red-900">Payment Verification Failed</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-red-700">{subscription.error}</p>
              <p className="text-sm text-gray-600 mt-4">
                If you completed payment, please contact support. Otherwise, try subscribing again.
              </p>
            </CardContent>
            <CardFooter className="flex gap-4">
              <Link href="/pricing" className="flex-1">
                <Button variant="outline" className="w-full">Back to Pricing</Button>
              </Link>
              <Link href="/dashboard" className="flex-1">
                <Button className="w-full">Go to Dashboard</Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-md mx-auto">
        <Card className="border-green-100">
          <CardHeader className="bg-green-50 border-b border-green-100">
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <CardTitle>Subscription Activated!</CardTitle>
                <CardDescription>
                  {subscription?.verified 
                    ? "Your payment was verified successfully" 
                    : "Your subscription is active"}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Plan</h3>
                <p className="font-medium">{subscription?.plan || "Premium"}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Status</h3>
                <p className="font-medium capitalize">
                  {subscription?.isLifetime ? "Lifetime Access" : (subscription?.status || "active")}
                </p>
              </div>
              {!subscription?.isLifetime && subscription?.currentPeriodEnd && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    {subscription?.status === "trialing" ? "Free Trial Ends" : "Current Period Ends"}
                  </h3>
                  <p className="font-medium">{subscription.currentPeriodEnd}</p>
                </div>
              )}
              {subscription?.isLifetime && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Access Type</h3>
                  <p className="font-medium">Lifetime (never expires)</p>
                </div>
              )}
              {subscription?.status === "trialing" && (
                <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                  <p className="text-sm text-teal-900">
                    <strong>Free Trial Active!</strong> Your 2-week trial has started. You won't be charged until it ends.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Link href="/dashboard" className="w-full">
              <Button className="w-full">
                Continue to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </DashboardLayout>
  )
}
