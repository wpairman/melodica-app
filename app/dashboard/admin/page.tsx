"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/layouts/dashboard-layout"
import { MenuButton } from "@/components/navigation-sidebar"
import { AuthGuard } from "@/components/auth-guard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Shield, Download, RefreshCw, Mail, Calendar, CreditCard } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getAllUsersFromFirebase, type FirebaseUser } from "@/lib/firebase-users"
import { ADMIN_EMAILS, isAdminEmail } from "@/lib/admin-config"

interface User {
  name: string
  email: string
  gender?: string
  favoriteArtists?: string
  favoriteActivities?: string
  subscription?: {
    plan: string
    status: string
    currentPeriodEnd?: string | null
    isLifetime?: boolean
  }
  createdAt?: string
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Check if current user is admin
    const userData = localStorage.getItem("userData")
    if (userData) {
      try {
        const parsed = JSON.parse(userData)
        setCurrentUser(parsed)
        setIsAdmin(isAdminEmail(parsed.email || ""))
      } catch (error) {
        console.error("Error parsing user data:", error)
      }
    }

    // Load all users (async)
    loadUsers().finally(() => {
      setLoading(false)
    })
  }, [])

  const loadUsers = async () => {
    if (typeof window === 'undefined') return

    try {
      // Try to load from Firebase first (if configured)
      const firebaseUsers = await getAllUsersFromFirebase()
      
      if (firebaseUsers.length > 0) {
        // Use Firebase users
        const enrichedUsers = firebaseUsers.map((user: FirebaseUser) => {
          const subscription = user.subscription || {
            plan: user.selectedPlan ? user.selectedPlan.charAt(0).toUpperCase() + user.selectedPlan.slice(1) : "Free",
            status: "active",
            currentPeriodEnd: null,
            isLifetime: false,
          }

          return {
            name: user.name || "Unknown",
            email: user.email || "No email",
            gender: user.gender,
            favoriteArtists: user.favoriteArtists,
            favoriteActivities: user.favoriteActivities,
            subscription: subscription,
            createdAt: user.createdAt ? (user.createdAt instanceof Date ? user.createdAt.toISOString() : user.createdAt.toString()) : "Unknown",
          }
        })

        // Sort by email for easier viewing
        enrichedUsers.sort((a: User, b: User) => a.email.localeCompare(b.email))
        
        setUsers(enrichedUsers)
        console.log(`✅ Loaded ${enrichedUsers.length} users from Firebase`)
        return
      }

      // Fallback to localStorage if Firebase is not configured or returns no users
      console.log("⚠️ Firebase not configured or empty, falling back to localStorage")
      const allUsersStr = localStorage.getItem("allUsers")
      if (allUsersStr) {
        const allUsers = JSON.parse(allUsersStr)
        
        // Enrich users with subscription data
        const enrichedUsers = allUsers.map((user: any) => {
          // Default subscription
          let subscription = {
            plan: "Free",
            status: "active",
            currentPeriodEnd: null,
            isLifetime: false,
          }

          // Check if user has subscription in their data
          if (user.subscription) {
            subscription = user.subscription
          } else {
            // Try to get from userData if this is the current user
            const userDataStr = localStorage.getItem("userData")
            if (userDataStr) {
              try {
                const currentUserData = JSON.parse(userDataStr)
                if (currentUserData.email === user.email && currentUserData.subscription) {
                  subscription = currentUserData.subscription
                }
              } catch (e) {
                // Ignore
              }
            }
          }

          // Also check selectedPlan field
          if (user.selectedPlan && !user.subscription) {
            subscription.plan = user.selectedPlan.charAt(0).toUpperCase() + user.selectedPlan.slice(1)
          }

          return {
            name: user.name || "Unknown",
            email: user.email || "No email",
            gender: user.gender,
            favoriteArtists: user.favoriteArtists,
            favoriteActivities: user.favoriteActivities,
            subscription: subscription,
            createdAt: user.createdAt || user.timestamp || "Unknown",
          }
        })

        // Sort by email for easier viewing
        enrichedUsers.sort((a: User, b: User) => a.email.localeCompare(b.email))
        
        setUsers(enrichedUsers)
        console.log(`✅ Loaded ${enrichedUsers.length} users from localStorage`)
      } else {
        setUsers([])
      }
    } catch (error) {
      console.error("Error loading users:", error)
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      })
    }
  }

  const exportUsers = () => {
    const csv = [
      ["Name", "Email", "Gender", "Plan", "Status", "Subscription End", "Is Lifetime"].join(","),
      ...users.map(user => [
        `"${user.name}"`,
        `"${user.email}"`,
        `"${user.gender || "N/A"}"`,
        `"${user.subscription?.plan || "Free"}"`,
        `"${user.subscription?.status || "active"}"`,
        `"${user.subscription?.currentPeriodEnd ? new Date(user.subscription.currentPeriodEnd).toLocaleDateString() : "N/A"}"`,
        `"${user.subscription?.isLifetime ? "Yes" : "No"}"`,
      ].join(","))
    ].join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `melodica-users-${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)

    toast({
      title: "Export Successful",
      description: "User data exported to CSV",
    })
  }

  const getPlanBadgeVariant = (plan: string) => {
    switch (plan?.toLowerCase()) {
      case "premium":
        return "default"
      case "ultimate":
        return "default"
      case "lifetime":
        return "default"
      default:
        return "secondary"
    }
  }

  const getPlanColor = (plan: string) => {
    switch (plan?.toLowerCase()) {
      case "premium":
        return "text-blue-400"
      case "ultimate":
        return "text-purple-400"
      case "lifetime":
        return "text-yellow-400"
      default:
        return "text-gray-400"
    }
  }

  if (loading) {
    return (
      <AuthGuard>
        <DashboardLayout>
          <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center">
            <div className="text-white">Loading...</div>
          </div>
        </DashboardLayout>
      </AuthGuard>
    )
  }

  if (!isAdmin) {
    return (
      <AuthGuard>
        <DashboardLayout>
          <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center p-4">
            <Card className="bg-gray-800 border-gray-700 max-w-md w-full">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Shield className="h-5 w-5 text-red-500" />
                  Access Denied
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 mb-4">
                  You don't have permission to access the admin panel. Only administrators can view this page.
                </p>
                <Button onClick={() => router.push("/dashboard")} className="w-full">
                  Go to Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>
        </DashboardLayout>
      </AuthGuard>
    )
  }

  const planStats = {
    free: users.filter(u => (u.subscription?.plan || "Free").toLowerCase() === "free").length,
    premium: users.filter(u => (u.subscription?.plan || "").toLowerCase() === "premium").length,
    ultimate: users.filter(u => (u.subscription?.plan || "").toLowerCase() === "ultimate").length,
    lifetime: users.filter(u => u.subscription?.isLifetime).length,
  }

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
          {/* Fixed header */}
          <div className="sticky top-0 z-50 bg-gray-900 border-b border-gray-700 px-6 py-4 flex items-center gap-4">
            <MenuButton />
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-yellow-500" />
              <h1 className="text-2xl font-bold tracking-tight text-white">Admin Dashboard</h1>
            </div>
          </div>

          <div className="p-4 md:p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-400">Total Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">{users.length}</div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-blue-900/30 to-blue-800/30 border-blue-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-400">Premium</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-400">{planStats.premium}</div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-900/30 to-purple-800/30 border-purple-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-400">Ultimate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-purple-400">{planStats.ultimate}</div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-yellow-900/30 to-yellow-800/30 border-yellow-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-400">Lifetime</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-yellow-400">{planStats.lifetime}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button 
                  onClick={() => {
                    setLoading(true)
                    loadUsers().finally(() => setLoading(false))
                  }} 
                  variant="outline" 
                  className="border-gray-600 text-white hover:bg-gray-800"
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button onClick={exportUsers} variant="outline" className="border-gray-600 text-white hover:bg-gray-800">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>

              {/* Important Notice */}
              <Card className="bg-yellow-900/20 border-yellow-700">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-yellow-500 mt-0.5" />
                    <div>
                      <p className="text-yellow-200 font-medium mb-1">⚠️ Important: localStorage Limitation</p>
                      <p className="text-yellow-300/80 text-sm">
                        This admin panel only shows users who have signed up on <strong>this device/browser</strong>. 
                        localStorage is per-device, so users signing up on other devices won't appear here.
                      </p>
                      <p className="text-yellow-300/80 text-sm mt-2">
                        <strong>To track all users:</strong> You need a backend database (Firebase, Supabase, MongoDB, etc.) 
                        to store user data centrally. This is a client-side demo limitation.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Users Table */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    All Users ({users.length}) - This Device Only
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {users.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No users found on this device</p>
                      <p className="text-sm text-gray-500 mt-2">
                        Users who sign up on other devices won't appear here
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-700">
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Name</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Email</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Gender</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Plan</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Status</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Subscription End</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map((user, index) => (
                            <tr key={index} className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors">
                              <td className="py-3 px-4 text-white">{user.name}</td>
                              <td className="py-3 px-4 text-gray-300 flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                {user.email}
                              </td>
                              <td className="py-3 px-4 text-gray-300">{user.gender || "N/A"}</td>
                              <td className="py-3 px-4">
                                <Badge variant={getPlanBadgeVariant(user.subscription?.plan || "Free")} className={getPlanColor(user.subscription?.plan || "Free")}>
                                  {user.subscription?.plan || "Free"}
                                  {user.subscription?.isLifetime && " (Lifetime)"}
                                </Badge>
                              </td>
                              <td className="py-3 px-4">
                                <Badge variant={user.subscription?.status === "active" ? "default" : "outline"}>
                                  {user.subscription?.status || "active"}
                                </Badge>
                              </td>
                              <td className="py-3 px-4 text-gray-300">
                                {user.subscription?.isLifetime ? (
                                  <span className="text-yellow-400">Never expires</span>
                                ) : user.subscription?.currentPeriodEnd ? (
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    {new Date(user.subscription.currentPeriodEnd).toLocaleDateString()}
                                  </span>
                                ) : (
                                  "N/A"
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}

