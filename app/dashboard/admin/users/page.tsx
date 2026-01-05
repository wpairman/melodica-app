"use client"

import { useState, useEffect } from "react"
import { getAllUsersFromFirebase, type FirebaseUser } from "@/lib/firebase-users"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MenuButton } from "@/components/navigation-sidebar"
import DashboardLayout from "@/components/layouts/dashboard-layout"
import { AuthGuard } from "@/components/auth-guard"
import { useAuth } from "@/contexts/auth-context"
import { isAdminEmail } from "@/lib/admin-config"
import { useRouter } from "next/navigation"
import { Mail, RefreshCw, Download, Copy, CheckCircle2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function AdminUsersPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [users, setUsers] = useState<FirebaseUser[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null)

  // Check if user is admin
  useEffect(() => {
    if (user && !isAdminEmail(user.email)) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page.",
        variant: "destructive",
      })
      router.push("/dashboard")
    }
  }, [user, router, toast])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const fetchedUsers = await getAllUsersFromFirebase()
      setUsers(fetchedUsers)
    } catch (error) {
      console.error("Error fetching users:", error)
      toast({
        title: "Error",
        description: "Failed to fetch users. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user && isAdminEmail(user.email)) {
      fetchUsers()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const copyEmail = (email: string) => {
    navigator.clipboard.writeText(email)
    setCopiedEmail(email)
    toast({
      title: "Copied!",
      description: `${email} copied to clipboard`,
    })
    setTimeout(() => setCopiedEmail(null), 2000)
  }

  const copyAllEmails = () => {
    const emails = users.map(u => u.email).filter(Boolean).join(", ")
    navigator.clipboard.writeText(emails)
    toast({
      title: "Copied!",
      description: "All emails copied to clipboard",
    })
  }

  const downloadEmails = () => {
    const emails = users.map(u => u.email).filter(Boolean)
    const csv = [
      ["Email", "Name", "Verified", "Created At"],
      ...emails.map(email => {
        const user = users.find(u => u.email === email)
        return [
          email,
          user?.name || "",
          user?.emailVerified ? "Yes" : "No",
          user?.createdAt 
            ? (user.createdAt instanceof Date 
                ? user.createdAt.toLocaleDateString() 
                : new Date(user.createdAt as any).toLocaleDateString())
            : ""
        ]
      })
    ].map(row => row.join(",")).join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `registered-emails-${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Downloaded!",
      description: "Emails exported to CSV file",
    })
  }

  if (!user || !isAdminEmail(user.email)) {
    return null
  }

  const verifiedCount = users.filter(u => u.emailVerified).length
  const unverifiedCount = users.length - verifiedCount

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
          <div className="sticky top-0 z-50 bg-gray-900 border-b border-gray-700 px-6 py-4 flex items-center gap-4">
            <MenuButton />
            <h1 className="text-2xl font-bold tracking-tight text-white">Registered Users</h1>
          </div>

          <div className="p-6">
            <div className="max-w-6xl mx-auto space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Total Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{users.length}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Verified</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-500">{verifiedCount}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Unverified</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-yellow-500">{unverifiedCount}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                  <CardDescription>Manage and export user emails</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  <Button onClick={fetchUsers} disabled={loading}>
                    <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                    Refresh
                  </Button>
                  <Button onClick={copyAllEmails} variant="outline" disabled={users.length === 0}>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy All Emails
                  </Button>
                  <Button onClick={downloadEmails} variant="outline" disabled={users.length === 0}>
                    <Download className="mr-2 h-4 w-4" />
                    Download CSV
                  </Button>
                </CardContent>
              </Card>

              {/* Users List */}
              <Card>
                <CardHeader>
                  <CardTitle>Registered Emails</CardTitle>
                  <CardDescription>
                    {loading ? "Loading..." : `${users.length} registered user${users.length !== 1 ? "s" : ""}`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8">
                      <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400" />
                      <p className="mt-2 text-gray-400">Loading users...</p>
                    </div>
                  ) : users.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No users found in Firebase</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {users.map((user) => (
                        <div
                          key={user.id || user.email}
                          className="flex items-center justify-between p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <Mail className="h-5 w-5 text-gray-400 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-white truncate">{user.email}</span>
                                {user.emailVerified && (
                                  <span className="px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded">
                                    Verified
                                  </span>
                                )}
                                {!user.emailVerified && (
                                  <span className="px-2 py-0.5 text-xs bg-yellow-500/20 text-yellow-400 rounded">
                                    Unverified
                                  </span>
                                )}
                              </div>
                              {user.name && (
                                <p className="text-sm text-gray-400 truncate">{user.name}</p>
                              )}
                              {user.createdAt && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Registered:{" "}
                                  {user.createdAt instanceof Date
                                    ? user.createdAt.toLocaleDateString()
                                    : new Date(user.createdAt as any).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyEmail(user.email)}
                            className="ml-2"
                          >
                            {copiedEmail === user.email ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      ))}
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

