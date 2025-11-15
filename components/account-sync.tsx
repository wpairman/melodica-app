"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Upload, AlertCircle, CheckCircle2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function AccountSync() {
  const { toast } = useToast()
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)

  const exportAccount = () => {
    setIsExporting(true)
    try {
      if (typeof window === 'undefined') {
        toast({
          title: "Error",
          description: "Cannot export account data",
          variant: "destructive",
        })
        return
      }

      // Get all user data from localStorage
      const allUsers = localStorage.getItem("allUsers")
      const currentUser = localStorage.getItem("currentUser")
      const userData = localStorage.getItem("userData")

      if (!allUsers && !currentUser && !userData) {
        toast({
          title: "No account data",
          description: "No account data found to export",
          variant: "destructive",
        })
        setIsExporting(false)
        return
      }

      const exportData = {
        allUsers: allUsers ? JSON.parse(allUsers) : [],
        currentUser: currentUser ? JSON.parse(currentUser) : null,
        userData: userData ? JSON.parse(userData) : null,
        exportedAt: new Date().toISOString(),
        version: "1.0",
      }

      // Create download link
      const dataStr = JSON.stringify(exportData, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `melodica-account-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast({
        title: "Account exported",
        description: "Your account data has been downloaded. Import it on your other device to sync your account.",
      })
    } catch (error) {
      console.error("Error exporting account:", error)
      toast({
        title: "Export failed",
        description: "Failed to export account data",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const importAccount = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      setIsImporting(true)
      try {
        const text = await file.text()
        const importData = JSON.parse(text)

        // Validate import data
        if (!importData.version || !importData.exportedAt) {
          throw new Error("Invalid account file format")
        }

        // Import data to localStorage
        if (importData.allUsers && Array.isArray(importData.allUsers)) {
          localStorage.setItem("allUsers", JSON.stringify(importData.allUsers))
        }

        if (importData.currentUser) {
          localStorage.setItem("currentUser", JSON.stringify(importData.currentUser))
          localStorage.setItem("isLoggedIn", "true")
        }

        if (importData.userData) {
          localStorage.setItem("userData", JSON.stringify(importData.userData))
        }

        toast({
          title: "Account imported",
          description: "Your account has been imported successfully. Please refresh the page.",
        })

        // Reload page after a short delay
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      } catch (error) {
        console.error("Error importing account:", error)
        toast({
          title: "Import failed",
          description: "Failed to import account data. Please check the file format.",
          variant: "destructive",
        })
      } finally {
        setIsImporting(false)
      }
    }
    input.click()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-yellow-500" />
          Multi-Device Account Sync
        </CardTitle>
        <CardDescription>
          Export your account data to use it on another device. This is a temporary solution until backend authentication is set up.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <p className="text-sm text-yellow-200">
            <strong>Note:</strong> This app currently uses device-specific storage. To use your account on another device, export your account data here and import it on the other device.
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={exportAccount}
            disabled={isExporting || isImporting}
            className="flex-1"
            variant="outline"
          >
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? "Exporting..." : "Export Account"}
          </Button>

          <Button
            onClick={importAccount}
            disabled={isExporting || isImporting}
            className="flex-1"
            variant="outline"
          >
            <Upload className="h-4 w-4 mr-2" />
            {isImporting ? "Importing..." : "Import Account"}
          </Button>
        </div>

        <div className="text-xs text-gray-400 space-y-1">
          <p>• Export: Download your account data as a JSON file</p>
          <p>• Import: Upload the JSON file on your other device</p>
          <p>• Security: Keep your exported file secure - it contains your account information</p>
        </div>
      </CardContent>
    </Card>
  )
}

