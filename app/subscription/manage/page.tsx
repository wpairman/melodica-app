"use client"

import { useState, useEffect } from "react"

// Force dynamic rendering to avoid SSR issues with event handlers
export const dynamic = 'force-dynamic'
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { CreditCard, Calendar, CheckCircle, AlertCircle, ArrowUpRight } from "lucide-react"
import DashboardLayout from "@/components/layouts/dashboard-layout"

export default function ManageSubscriptionPage() {
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In a real app, you would fetch this from an API (client-side only)
    if (typeof window !== 'undefined') {
      const storedData = localStorage.getItem("userData")
      if (storedData) {
        const parsedData = JSON.parse(storedData)

        // Add subscription data if not present (for demo)
        if (!parsedData.subscription) {
          parsedData.subscription = {
            plan: "Free",
            status: "active",
            currentPeriodEnd: null,
            isLifetime: false,
          }
        }

        setUserData(parsedData)
      }
    }
    setLoading(false)
  }, [])

  const handleCancelSubscription = () => {
    // In a real app, you would call the Stripe API to cancel the subscription
    // For demo purposes, we'll just update the local storage
    if (userData) {
      const updatedUserData = {
        ...userData,
        subscription: {
          ...userData.subscription,
          status: "canceled",
          canceledAt: new Date().toISOString(),
        },
      }
      setUserData(updatedUserData)
      // Save to localStorage (client-side only)
      if (typeof window !== 'undefined') {
        localStorage.setItem("userData", JSON.stringify(updatedUserData))
      }
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p>Loading subscription details...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (!userData) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p>Please log in to view your subscription.</p>
        </div>
      </DashboardLayout>
    )
  }

  const { subscription } = userData
  const isPaid = subscription.plan !== "Free"
  const isActive = subscription.status === "active"
  const isCanceled = subscription.status === "canceled"

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        {userData?.subscription?.isMock && (
          <Card className="bg-blue-50 border-blue-200 mb-4">
            <CardContent className="pt-6 pb-6">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <AlertCircle className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-blue-800">Prototype Mode</h3>
                  <p className="text-sm text-blue-700">
                    This is a prototype subscription. Stripe payment processing will be added in a future update.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Subscription</h1>
          <p className="text-gray-500">View and manage your Melodica subscription</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Current Plan</CardTitle>
              <Badge variant={isPaid ? (isActive ? "default" : "outline") : "secondary"}>{subscription.plan}</Badge>
            </div>
            <CardDescription>
              {isPaid
                ? isActive
                  ? "Your subscription is active"
                  : "Your subscription has been canceled"
                : "You are currently on the free plan"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isPaid && (
              <>
                <div className="flex items-center gap-2 text-sm">
                  {subscription.isLifetime ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Lifetime access (never expires)</span>
                    </>
                  ) : (
                    <>
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span>
                        {isActive
                          ? `Current period ends on ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`
                          : isCanceled
                            ? `Access until ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`
                            : "Subscription inactive"}
                      </span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CreditCard className="h-4 w-4 text-gray-500" />
                  <span>Payment method: •••• 4242</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {isActive || subscription.isLifetime ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                  )}
                  <span>
                    Status:{" "}
                    {subscription.isLifetime
                      ? "Lifetime Access"
                      : isActive
                        ? "Active"
                        : isCanceled
                          ? "Canceled"
                          : "Inactive"}
                  </span>
                </div>
              </>
            )}

            {!isPaid && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h3 className="font-medium text-blue-800 mb-2">Upgrade to Premium or Ultimate</h3>
                <p className="text-sm text-blue-700 mb-4">
                  Get access to advanced features, unlimited music recommendations, and more.
                </p>
                <Link href="/pricing">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    View Plans
                    <ArrowUpRight className="ml-2 h-3 w-3" />
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
          {isPaid && isActive && !subscription.isLifetime && (
            <CardFooter className="flex justify-between">
              <Button variant="outline">Update Payment Method</Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                    Cancel Subscription
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure you want to cancel?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Your subscription will remain active until the end of your current billing period. After that, you
                      will be downgraded to the free plan.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                    <AlertDialogAction onClick={handleCancelSubscription} className="bg-red-500 hover:bg-red-600">
                      Yes, Cancel
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardFooter>
          )}
          {isPaid && isCanceled && (
            <CardFooter>
              <Link href="/pricing" className="w-full">
                <Button className="w-full">Reactivate Subscription</Button>
              </Link>
            </CardFooter>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Billing History</CardTitle>
            <CardDescription>View your past invoices and payment history</CardDescription>
          </CardHeader>
          <CardContent>
            {isPaid ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 border rounded-md">
                  <div>
                    <p className="font-medium">Invoice #1001</p>
                    <p className="text-sm text-gray-500">
                      {new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${subscription.plan === "Premium" ? "1.99" : "2.99"}</p>
                    <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
                      Paid
                    </Badge>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No billing history available for free plan.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
