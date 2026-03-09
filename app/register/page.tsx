"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Heart, ArrowRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { saveUserToFirebase, getUserByEmailFromFirebase, type FirebaseUser } from "@/lib/firebase-users"
import { hashPassword } from "@/lib/password-utils"
import { createStripeCheckoutSession } from "@/lib/api-utils"
import { useToast } from "@/hooks/use-toast"

const PLAN_LABELS: Record<string, string> = {
  premium_monthly: "Premium (Monthly)",
  premium_yearly: "Premium (Yearly)",
  ultimate_monthly: "Ultimate (Monthly)",
  ultimate_yearly: "Ultimate (Yearly)",
  ultimate_lifetime: "Lifetime",
}

export default function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" })

  const plan = searchParams?.get("plan") || ""
  const interval = searchParams?.get("interval") || ""
  const tier = plan && interval ? `${plan}_${interval}` : ""

  useEffect(() => {
    if (!plan || !interval) {
      router.replace("/pricing")
    }
  }, [plan, interval, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tier || !plan || !interval) return

    if (form.password !== form.confirmPassword) {
      toast({ title: "Passwords don't match", variant: "destructive" })
      return
    }
    if (form.password.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" })
      return
    }
    if (!form.name.trim()) {
      toast({ title: "Please enter your name", variant: "destructive" })
      return
    }
    if (!form.email.trim()) {
      toast({ title: "Please enter your email", variant: "destructive" })
      return
    }

    setLoading(true)
    try {
      const existingUser = await getUserByEmailFromFirebase(form.email.toLowerCase().trim())
      if (existingUser) {
        toast({
          title: "Email already registered",
          description: "Please log in to add a subscription or use a different email.",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      const hashedPassword = await hashPassword(form.password)
      const userData = {
        name: form.name.trim(),
        email: form.email.toLowerCase().trim(),
        password: hashedPassword,
        gender: "",
        favoriteArtists: "",
        favoriteActivities: "",
        selectedPlan: plan,
        subscription: undefined as FirebaseUser["subscription"],
        createdAt: new Date(),
        emailVerified: false,
      }

      await saveUserToFirebase(userData)

      const { url } = await createStripeCheckoutSession(tier, form.email.toLowerCase().trim())
      if (url) {
        window.location.href = url
      } else {
        throw new Error("No checkout URL returned")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Something went wrong. Please try again.",
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  if (!plan || !interval) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800">
        <p className="text-gray-400">Redirecting to pricing...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-gray-900 to-gray-800">
      <header className="border-b border-gray-700 px-4 py-4 lg:px-6">
        <Link href="/" className="inline-flex items-center gap-2 font-semibold text-white hover:text-gray-300">
          <Heart className="h-6 w-6 text-rose-500" />
          <span>Melodica</span>
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center p-4">
        <Card className="w-full max-w-md border-gray-700 bg-gray-800">
          <CardHeader>
            <CardTitle className="text-xl text-white">Create your account</CardTitle>
            <CardDescription className="text-gray-300">
              You&apos;re signing up for{" "}
              <strong className="text-teal-400">{PLAN_LABELS[tier] || tier}</strong>. You&apos;ll complete payment on the next step.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-white">
                  Full name
                </Label>
                <Input
                  id="name"
                  required
                  placeholder="Your name"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  className="mt-1 border-gray-600 bg-gray-700 text-white placeholder:text-gray-400"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-white">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  className="mt-1 border-gray-600 bg-gray-700 text-white placeholder:text-gray-400"
                />
              </div>
              <div>
                <Label htmlFor="password" className="text-white">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  placeholder="At least 6 characters"
                  value={form.password}
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                  className="mt-1 border-gray-600 bg-gray-700 text-white placeholder:text-gray-400"
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword" className="text-white">
                  Confirm password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  required
                  placeholder="Confirm your password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                  className="mt-1 border-gray-600 bg-gray-700 text-white placeholder:text-gray-400"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-teal-600 hover:bg-teal-700"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Continue to payment
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
            <p className="mt-4 text-center text-sm text-gray-400">
              Already have an account?{" "}
              <Link href="/login" className="text-teal-400 hover:underline">
                Log in
              </Link>
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
