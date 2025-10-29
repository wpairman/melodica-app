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

    // Original code for when you implement Stripe later
    if (sessionId) {
      // In a real app, you would verify the session with Stripe
      // and retrieve the subscription details
      // For demo purposes, we'll simulate this
      setTimeout(() => {
        // Check URL params for plan type
        const params = new URLSearchParams(window.location.search)
        const isLifetime = params.get("plan_type") === "lifetime"

        setSubscription({
          plan: "Premium",
          status: "active",
          currentPeriodEnd: isLifetime ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          isLifetime: isLifetime,
        })
        setLoading(false)

        // Update user data in localStorage for demo purposes (client-side only)
        if (typeof window !== 'undefined') {
          const userData = localStorage.getItem("userData")
          if (userData) {
            const parsedUserData = JSON.parse(userData)
            parsedUserData.subscription = {
              plan: "Premium",
              status: "active",
              currentPeriodEnd: isLifetime ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              isLifetime: isLifetime,
            }
            localStorage.setItem("userData", JSON.stringify(parsedUserData))
          }
        }
      }, 1500)
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
                <CardDescription>Your payment was successful</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Plan</h3>
                <p className="font-medium">{subscription.plan}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Status</h3>
                <p className="font-medium capitalize">
                  {subscription.isLifetime ? "Lifetime Access" : subscription.status}
                </p>
              </div>
              {!subscription.isLifetime && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Current Period Ends</h3>
                  <p className="font-medium">{subscription.currentPeriodEnd}</p>
                </div>
              )}
              {subscription.isLifetime && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Access Type</h3>
                  <p className="font-medium">Lifetime (never expires)</p>
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
