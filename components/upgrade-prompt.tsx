"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Crown, Sparkles, Music, TrendingUp, Activity } from "lucide-react"
import Link from "next/link"
import type { PlanType } from "@/lib/plan-features"

interface UpgradePromptProps {
  feature: string
  requiredPlan: PlanType
  currentPlan: PlanType
  onClose?: () => void
}

export function UpgradePrompt({ 
  feature, 
  requiredPlan, 
  currentPlan,
  onClose 
}: UpgradePromptProps) {
  const router = useRouter()
  const [open, setOpen] = useState(true)

  const handleUpgrade = () => {
    setOpen(false)
    router.push(`/pricing?upgrade=${requiredPlan}`)
    onClose?.()
  }

  const handleClose = () => {
    setOpen(false)
    onClose?.()
  }

  const planInfo: Record<PlanType, { name: string; icon: any; color: string }> = {
    free: { name: "Free Plan", icon: null, color: "text-gray-600" },
    premium: { name: "Premium Plan", icon: Music, color: "text-blue-600" },
    ultimate: { name: "Ultimate Plan", icon: Crown, color: "text-purple-600" },
    lifetime: { name: "Lifetime Plan", icon: Sparkles, color: "text-yellow-600" },
  }

  const Icon = planInfo[requiredPlan].icon

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-white dark:bg-gray-900">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {Icon && (
              <div className={`p-2 rounded-full bg-gradient-to-br from-teal-100 to-purple-100`}>
                <Icon className={`h-6 w-6 ${planInfo[requiredPlan].color}`} />
              </div>
            )}
            <div>
              <DialogTitle className="text-2xl text-gray-900 dark:text-white">
                Upgrade to {planInfo[requiredPlan].name}
              </DialogTitle>
              <DialogDescription className="text-gray-600 dark:text-gray-300">
                Unlock <strong className="text-teal-600">{feature}</strong>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <p className="text-gray-700 dark:text-gray-300">
            You're currently on the {planInfo[currentPlan].name.toLowerCase()}. 
            Upgrade to access this feature and more!
          </p>

          {requiredPlan === "premium" && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 space-y-2 border border-blue-200">
              <div className="flex items-center gap-2">
                <Music className="h-5 w-5 text-blue-600" />
                <h4 className="font-semibold text-gray-900 dark:text-white">Premium Features:</h4>
              </div>
              <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300 ml-7">
                <li>✓ Unlimited music recommendations</li>
                <li>✓ 3 personalized playlists per week</li>
                <li>✓ Ad-free experience</li>
                <li>✓ Basic mood analytics</li>
              </ul>
            </div>
          )}

          {requiredPlan === "ultimate" && (
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 space-y-2 border border-purple-200">
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-purple-600" />
                <h4 className="font-semibold text-gray-900 dark:text-white">Ultimate Features:</h4>
              </div>
              <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300 ml-7">
                <li>✓ AI-powered music recommendations</li>
                <li>✓ Unlimited personalized playlists</li>
                <li>✓ Advanced mood analytics & insights</li>
                <li>✓ Export & share your mood data</li>
                <li>✓ Period tracking (for female users)</li>
                <li>✓ 24/7 priority support</li>
              </ul>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose}>
            Maybe Later
          </Button>
          <Link href="/pricing" className="w-full sm:w-auto">
            <Button 
              className="w-full bg-gradient-to-r from-teal-600 to-purple-600 hover:from-teal-700 hover:to-purple-700 text-white"
              onClick={handleUpgrade}
            >
              <Crown className="mr-2 h-4 w-4" />
              Upgrade Now
            </Button>
          </Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

