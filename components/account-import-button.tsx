"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Upload } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

export function AccountImportButton() {
  const { toast } = useToast()
  const router = useRouter()
  const { login } = useAuth()
  const [isImporting, setIsImporting] = useState(false)

  const handleImport = () => {
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
          // Auto-login the user
          login(importData.currentUser)
        }

        if (importData.userData) {
          localStorage.setItem("userData", JSON.stringify(importData.userData))
        }

        toast({
          title: "Account imported successfully",
          description: "Your account has been imported. Redirecting to dashboard...",
        })

        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.push("/dashboard")
        }, 1000)
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
    <Button
      onClick={handleImport}
      disabled={isImporting}
      variant="outline"
      size="sm"
      className="w-full"
    >
      <Upload className="h-4 w-4 mr-2" />
      {isImporting ? "Importing..." : "Import Account from Another Device"}
    </Button>
  )
}

