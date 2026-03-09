"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle2, ArrowRight, User } from "lucide-react"
import DashboardLayout from "@/components/layouts/dashboard-layout"
import { useAuth } from "@/contexts/auth-context"
import { getUserByEmailFromFirebase, saveUserToFirebase, updateUserSubscriptionInFirebase } from "@/lib/firebase-users"
import { hashPassword } from "@/lib/password-utils"
import { useToast } from "@/hooks/use-toast"

export default function SubscriptionSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { login } = useAuth()
  const { toast } = useToast()
  const sessionId = searchParams?.get("session_id") || null
  const [loading, setLoading] = useState(true)
  const [subscription, setSubscription] = useState<any>(null)
  const [needsAccount, setNeedsAccount] = useState(false)
  const [sessionData, setSessionData] = useState<{ email: string; plan: string; isLifetime: boolean; currentPeriodEnd: string | null } | null>(null)
  const [createAccountForm, setCreateAccountForm] = useState({ name: "", password: "", confirmPassword: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!searchParams) return

    const isMock = searchParams.get("mock") === "true"
    const mockPlan = searchParams.get("plan")
    const mockInterval = searchParams.get("interval")

    if (isMock && mockPlan) {
      setTimeout(() => {
        const isLifetime = mockInterval === "lifetime"
        setSubscription({
          plan: mockPlan.charAt(0).toUpperCase() + mockPlan.slice(1),
          status: "active",
          currentPeriodEnd: isLifetime ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          isLifetime: isLifetime,
          isMock: true,
        })
        setLoading(false)
        if (typeof window !== "undefined") {
          const userData = localStorage.getItem("userData")
          if (userData) {
            const parsed = JSON.parse(userData)
            parsed.subscription = {
              plan: mockPlan.charAt(0).toUpperCase() + mockPlan.slice(1),
              status: "active",
              currentPeriodEnd: isLifetime ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              isLifetime: isLifetime,
              isMock: true,
            }
            localStorage.setItem("userData", JSON.stringify(parsed))
          }
        }
      }, 1500)
      return
    }

    if (sessionId) {
      const verifySession = async () => {
        try {
          const baseUrl = typeof window !== "undefined" ? window.location.origin : ""
          const response = await fetch(`${baseUrl}/api/stripe/verify-session?session_id=${sessionId}`)
          const data = await response.json()

          if (!response.ok || !data.success) {
            throw new Error(data.error || "Payment verification failed")
          }

          const params = new URLSearchParams(window.location.search)
          const planFromUrl = params.get("plan") || data.session.metadata?.plan || "premium"
          const intervalFromUrl = params.get("interval") || data.session.metadata?.interval || "monthly"
          const isLifetime = intervalFromUrl === "lifetime"
          const customerEmail = data.session.customer_email

          let currentPeriodEnd: string | null = null
          if (!isLifetime && data.subscription?.trial_end) {
            currentPeriodEnd = new Date(data.subscription.trial_end * 1000).toLocaleDateString()
          } else if (!isLifetime && data.subscription?.current_period_end) {
            currentPeriodEnd = new Date(data.subscription.current_period_end * 1000).toLocaleDateString()
          }

          const planName = planFromUrl.charAt(0).toUpperCase() + planFromUrl.slice(1)

          setSessionData({
            email: customerEmail || "",
            plan: planName,
            isLifetime,
            currentPeriodEnd,
          })

          setSubscription({
            plan: planName,
            status: data.subscription?.status || "active",
            currentPeriodEnd,
            isLifetime,
            verified: true,
          })

          if (customerEmail) {
            const existingUser = await getUserByEmailFromFirebase(customerEmail)
            if (!existingUser) {
              setNeedsAccount(true)
            } else {
              const subscription = {
                plan: planName,
                status: data.subscription?.status || "active",
                currentPeriodEnd: currentPeriodEnd ? new Date(currentPeriodEnd).toISOString() : null,
                isLifetime,
                verified: true,
              }
              await updateUserSubscriptionInFirebase(customerEmail, subscription)
              if (typeof window !== "undefined") {
                const userWithSub = {
                  ...existingUser,
                  subscription,
                }
                localStorage.setItem("userData", JSON.stringify(userWithSub))
                localStorage.setItem("currentUser", JSON.stringify(userWithSub))
                localStorage.setItem("isLoggedIn", "true")
                const allUsersStr = localStorage.getItem("allUsers")
                const allUsers = allUsersStr ? JSON.parse(allUsersStr) : []
                const idx = allUsers.findIndex((u: any) => u.email === customerEmail)
                if (idx >= 0) {
                  allUsers[idx] = { ...allUsers[idx], subscription: userWithSub.subscription }
                } else {
                  allUsers.push(userWithSub)
                }
                localStorage.setItem("allUsers", JSON.stringify(allUsers))
                login(userWithSub)
                router.push("/dashboard")
              }
            }
          } else {
            setNeedsAccount(true)
          }

          setLoading(false)
        } catch (error: any) {
          console.error("Verification error:", error)
          setLoading(false)
          setSubscription({ error: error.message || "Failed to verify payment" })
        }
      }
      verifySession()
    } else {
      setLoading(false)
    }
  }, [sessionId, searchParams, login, router])

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!sessionData?.email) return
    if (createAccountForm.password !== createAccountForm.confirmPassword) {
      toast({ title: "Passwords don't match", variant: "destructive" })
      return
    }
    if (createAccountForm.password.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" })
      return
    }
    if (!createAccountForm.name.trim()) {
      toast({ title: "Please enter your name", variant: "destructive" })
      return
    }

    setIsSubmitting(true)
    try {
      const hashedPassword = await hashPassword(createAccountForm.password)
      const userData = {
        name: createAccountForm.name.trim(),
        email: sessionData.email.toLowerCase(),
        password: hashedPassword,
        gender: "",
        favoriteArtists: "",
        favoriteActivities: "",
        selectedPlan: sessionData.plan.toLowerCase(),
        subscription: {
          plan: sessionData.plan,
          status: "active",
          currentPeriodEnd: sessionData.currentPeriodEnd ? new Date(sessionData.currentPeriodEnd).toISOString() : null,
          isLifetime: sessionData.isLifetime,
          verified: true,
        },
        createdAt: new Date().toISOString(),
        emailVerified: true,
      }

      await saveUserToFirebase(userData)

      if (typeof window !== "undefined") {
        const allUsersStr = localStorage.getItem("allUsers")
        const allUsers = allUsersStr ? JSON.parse(allUsersStr) : []
        allUsers.push(userData)
        localStorage.setItem("allUsers", JSON.stringify(allUsers))
        localStorage.setItem("userData", JSON.stringify(userData))
        localStorage.setItem("currentUser", JSON.stringify(userData))
        localStorage.setItem("isLoggedIn", "true")
        login(userData)
      }

      toast({ title: "Account created!", description: "Welcome to Melodica." })
      router.push("/dashboard")
    } catch (error: any) {
      toast({ title: "Error creating account", description: error.message, variant: "destructive" })
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-white">Verifying your subscription...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (subscription?.error) {
    return (
      <DashboardLayout>
        <div className="max-w-md mx-auto p-6">
          <Card className="bg-gray-800 border-red-500">
            <CardHeader>
              <CardTitle className="text-red-400">Payment Verification Failed</CardTitle>
              <CardDescription className="text-gray-300">{subscription.error}</CardDescription>
            </CardHeader>
            <CardFooter className="flex gap-4">
              <Link href="/pricing" className="flex-1">
                <Button variant="outline" className="w-full">Back to Pricing</Button>
              </Link>
              <Link href="/login" className="flex-1">
                <Button className="w-full">Log In</Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  if (needsAccount && sessionData) {
    return (
      <DashboardLayout>
        <div className="max-w-md mx-auto p-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="bg-green-500/20 p-3 rounded-full">
                  <CheckCircle2 className="h-8 w-8 text-green-400" />
                </div>
                <div>
                  <CardTitle className="text-white">Payment Successful!</CardTitle>
                  <CardDescription className="text-gray-300">
                    Create your account to access Melodica
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateAccount} className="space-y-4">
                <div>
                  <Label className="text-white">Email</Label>
                  <Input
                    value={sessionData.email}
                    readOnly
                    className="bg-gray-700 border-gray-600 text-gray-300"
                  />
                </div>
                <div>
                  <Label htmlFor="name" className="text-white">Full Name</Label>
                  <Input
                    id="name"
                    required
                    placeholder="Enter your name"
                    value={createAccountForm.name}
                    onChange={(e) => setCreateAccountForm((p) => ({ ...p, name: e.target.value }))}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="password" className="text-white">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    minLength={6}
                    placeholder="Create a password (min 6 characters)"
                    value={createAccountForm.password}
                    onChange={(e) => setCreateAccountForm((p) => ({ ...p, password: e.target.value }))}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword" className="text-white">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    required
                    placeholder="Confirm your password"
                    value={createAccountForm.confirmPassword}
                    onChange={(e) => setCreateAccountForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Creating account..." : "Create Account & Continue"}
                  <User className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-md mx-auto p-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="bg-green-500/20 p-3 rounded-full">
                <CheckCircle2 className="h-8 w-8 text-green-400" />
              </div>
              <div>
                <CardTitle className="text-white">Subscription Activated!</CardTitle>
                <CardDescription className="text-gray-300">
                  Your payment was verified successfully
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm text-gray-400">Plan</h3>
              <p className="font-medium text-white">{subscription?.plan || "Premium"}</p>
            </div>
            <div>
              <h3 className="text-sm text-gray-400">Status</h3>
              <p className="font-medium text-white capitalize">
                {subscription?.isLifetime ? "Lifetime Access" : (subscription?.status || "active")}
              </p>
            </div>
            {!subscription?.isLifetime && subscription?.currentPeriodEnd && (
              <div>
                <h3 className="text-sm text-gray-400">
                  {subscription?.status === "trialing" ? "Free Trial Ends" : "Current Period Ends"}
                </h3>
                <p className="font-medium text-white">{subscription.currentPeriodEnd}</p>
              </div>
            )}
            {subscription?.status === "trialing" && (
              <div className="bg-teal-500/20 border border-teal-500/50 rounded-lg p-4">
                <p className="text-sm text-teal-200">
                  <strong>Free Trial Active!</strong> Your 2-week trial has started.
                </p>
              </div>
            )}
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
