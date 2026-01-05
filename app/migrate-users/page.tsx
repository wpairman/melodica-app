"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { migrateUsersToFirebase, compareUserCounts } from "@/lib/migrate-users-to-firebase"
import { Loader2, Users, ArrowRight, CheckCircle, XCircle } from "lucide-react"

export default function MigrateUsersPage() {
  const { toast } = useToast()
  const [isMigrating, setIsMigrating] = useState(false)
  const [migrationResult, setMigrationResult] = useState<{
    success: number
    failed: number
    errors: Array<{ email: string; error: string }>
  } | null>(null)
  const [comparison, setComparison] = useState<{
    localStorage: number
    firebase: number
    difference: number
  } | null>(null)
  const [isComparing, setIsComparing] = useState(false)

  const handleCompare = async () => {
    setIsComparing(true)
    try {
      const result = await compareUserCounts()
      setComparison(result)
      toast({
        title: "Comparison complete",
        description: `Found ${result.localStorage} in localStorage and ${result.firebase} in Firebase`,
      })
    } catch (error: any) {
      console.error("Error comparing:", error)
      toast({
        title: "Error",
        description: error?.message || "Failed to compare user counts",
        variant: "destructive",
      })
    } finally {
      setIsComparing(false)
    }
  }

  const handleMigrate = async () => {
    setIsMigrating(true)
    setMigrationResult(null)
    
    try {
      const result = await migrateUsersToFirebase()
      setMigrationResult(result)
      
      if (result.success > 0) {
        toast({
          title: "Migration complete!",
          description: `Successfully migrated ${result.success} users. ${result.failed > 0 ? `${result.failed} failed.` : ""}`,
        })
      } else {
        toast({
          title: "Migration failed",
          description: `Failed to migrate users. Check console for details.`,
          variant: "destructive",
        })
      }

      // Refresh comparison after migration
      await handleCompare()
    } catch (error: any) {
      console.error("Migration error:", error)
      toast({
        title: "Migration error",
        description: error?.message || "Failed to migrate users",
        variant: "destructive",
      })
    } finally {
      setIsMigrating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="h-6 w-6" />
              Migrate Users to Firebase
            </CardTitle>
            <CardDescription className="text-gray-400">
              Migrate all users from localStorage to Firebase Firestore
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Comparison Section */}
            <div className="space-y-2">
              <h3 className="text-white font-semibold">User Count Comparison</h3>
              {comparison && (
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <div className="text-gray-400 text-sm">localStorage</div>
                    <div className="text-2xl font-bold text-white">{comparison.localStorage}</div>
                  </div>
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <div className="text-gray-400 text-sm">Firebase</div>
                    <div className="text-2xl font-bold text-white">{comparison.firebase}</div>
                  </div>
                  <div className={`p-4 rounded-lg ${comparison.difference > 0 ? 'bg-yellow-900/20' : 'bg-green-900/20'}`}>
                    <div className="text-gray-400 text-sm">Difference</div>
                    <div className={`text-2xl font-bold ${comparison.difference > 0 ? 'text-yellow-400' : 'text-green-400'}`}>
                      {comparison.difference}
                    </div>
                  </div>
                </div>
              )}
              <Button
                onClick={handleCompare}
                disabled={isComparing}
                variant="outline"
                className="border-gray-600 text-white hover:bg-gray-700"
              >
                {isComparing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Comparing...
                  </>
                ) : (
                  "Compare User Counts"
                )}
              </Button>
            </div>

            {/* Migration Section */}
            <div className="space-y-2">
              <h3 className="text-white font-semibold">Migration</h3>
              <p className="text-gray-400 text-sm">
                This will migrate all users from localStorage to Firebase. Users that already exist in Firebase will be updated.
              </p>
              <Button
                onClick={handleMigrate}
                disabled={isMigrating}
                className="bg-teal-600 hover:bg-teal-700 text-white"
              >
                {isMigrating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Migrating...
                  </>
                ) : (
                  <>
                    <ArrowRight className="mr-2 h-4 w-4" />
                    Start Migration
                  </>
                )}
              </Button>
            </div>

            {/* Results */}
            {migrationResult && (
              <div className="mt-6 space-y-4">
                <h3 className="text-white font-semibold">Migration Results</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-900/20 p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-green-400">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-semibold">Success</span>
                    </div>
                    <div className="text-3xl font-bold text-white mt-2">{migrationResult.success}</div>
                  </div>
                  <div className="bg-red-900/20 p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-red-400">
                      <XCircle className="h-5 w-5" />
                      <span className="font-semibold">Failed</span>
                    </div>
                    <div className="text-3xl font-bold text-white mt-2">{migrationResult.failed}</div>
                  </div>
                </div>

                {migrationResult.errors.length > 0 && (
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <h4 className="text-white font-semibold mb-2">Errors:</h4>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {migrationResult.errors.map((error, index) => (
                        <div key={index} className="text-sm text-red-400">
                          <span className="font-medium">{error.email}:</span> {error.error}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Important Notes</CardTitle>
          </CardHeader>
          <CardContent className="text-gray-400 space-y-2 text-sm">
            <p>• This migration is safe to run multiple times - existing users will be updated, not duplicated</p>
            <p>• Users are identified by email address</p>
            <p>• Passwords are already hashed and will be preserved</p>
            <p>• Email verification status will be preserved</p>
            <p>• After migration, check Firebase Console to verify all users are present</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}



