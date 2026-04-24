/**
 * Plan Features Configuration
 * Defines which features are available for each subscription plan
 */

export type PlanType = "free" | "premium" | "ultimate" | "lifetime"

export type FeatureName =
  | "basicMoodTracking"
  | "advancedMoodTracking"
  | "comprehensiveMoodTracking"
  | "limitedMusicRecommendations"
  | "unlimitedMusicRecommendations"
  | "aiPoweredMusicRecommendations"
  | "activitySuggestions"
  | "personalizedActivitySuggestions"
  | "customActivityPrograms"
  | "adFree"
  | "fullSpotifyIntegration"
  | "calendarIntegration"
  | "musicPreferenceQuiz"
  | "advancedMusicAnalysis"
  | "basicMoodAnalytics"
  | "advancedMoodAnalytics"
  | "personalizedPlaylists3Weekly"
  | "unlimitedPersonalizedPlaylists"
  | "periodTracking"
  | "profileSharing"
  | "exportMoodData"
  | "prioritySupport"

export const planFeatures: Record<PlanType, FeatureName[]> = {
  free: [
    "basicMoodTracking",
    "limitedMusicRecommendations",
    "activitySuggestions",
    "calendarIntegration",
  ],
  premium: [
    "advancedMoodTracking",
    "unlimitedMusicRecommendations",
    "personalizedActivitySuggestions",
    "adFree",
    "calendarIntegration",
    "musicPreferenceQuiz",
    "personalizedPlaylists3Weekly",
    "basicMoodAnalytics",
  ],
  ultimate: [
    "comprehensiveMoodTracking",
    "aiPoweredMusicRecommendations",
    "customActivityPrograms",
    "adFree",
    "fullSpotifyIntegration",
    "calendarIntegration",
    "advancedMusicAnalysis",
    "unlimitedPersonalizedPlaylists",
    "advancedMoodAnalytics",
    "periodTracking",
    "profileSharing",
    "exportMoodData",
    "prioritySupport",
  ],
  lifetime: [
    "comprehensiveMoodTracking",
    "aiPoweredMusicRecommendations",
    "customActivityPrograms",
    "adFree",
    "fullSpotifyIntegration",
    "calendarIntegration",
    "advancedMusicAnalysis",
    "unlimitedPersonalizedPlaylists",
    "advancedMoodAnalytics",
    "periodTracking",
    "profileSharing",
    "exportMoodData",
    "prioritySupport",
  ],
}

/**
 * Normalize plan string from Firestore to PlanType
 * Handles capitalization differences e.g. "Premium" -> "premium"
 */
export function normalizePlan(raw: string | undefined | null): PlanType {
  if (!raw) return "free"
  const lower = raw.toLowerCase().trim()
  if (lower === "premium") return "premium"
  if (lower === "ultimate") return "ultimate"
  if (lower === "lifetime") return "lifetime"
  return "free"
}

/**
 * Check if a user's plan has access to a specific feature
 */
export function hasFeatureAccess(userPlan: PlanType, feature: FeatureName): boolean {
  return planFeatures[userPlan]?.includes(feature) ?? false
}

/**
 * Get the minimum plan required for a feature
 */
export function getMinimumPlanForFeature(feature: FeatureName): PlanType {
  if (planFeatures.ultimate.includes(feature)) return "ultimate"
  if (planFeatures.premium.includes(feature)) return "premium"
  return "free"
}

/**
 * Get upgrade message for a feature
 */
export function getUpgradeMessage(feature: FeatureName): {
  title: string
  message: string
  requiredPlan: PlanType
} {
  const requiredPlan = getMinimumPlanForFeature(feature)

  const messages: Record<PlanType, { title: string; message: string }> = {
    free: {
      title: "Feature Available in Premium Plans",
      message: "Upgrade to Premium or Ultimate to unlock this feature.",
    },
    premium: {
      title: "Premium Feature",
      message: "This feature is available with Premium or Ultimate plans.",
    },
    ultimate: {
      title: "Ultimate Feature",
      message: "Upgrade to Ultimate to unlock this advanced feature.",
    },
    lifetime: {
      title: "Lifetime Feature",
      message: "Upgrade to Lifetime to unlock all features permanently.",
    },
  }

  return {
    ...messages[requiredPlan],
    requiredPlan,
  }
}

/**
 * Get feature-based limits for a plan
 */
export function getPlanLimits(plan: PlanType): {
  maxMusicRecommendations: number
  maxPlaylistsPerWeek: number
  canExportData: boolean
  canShareProfile: boolean
  hasAdvancedAnalytics: boolean
} {
  const limits = {
    free: {
      maxMusicRecommendations: 10,
      maxPlaylistsPerWeek: 0,
      canExportData: false,
      canShareProfile: false,
      hasAdvancedAnalytics: false,
    },
    premium: {
      maxMusicRecommendations: Infinity,
      maxPlaylistsPerWeek: 3,
      canExportData: false,
      canShareProfile: false,
      hasAdvancedAnalytics: false,
    },
    ultimate: {
      maxMusicRecommendations: Infinity,
      maxPlaylistsPerWeek: Infinity,
      canExportData: true,
      canShareProfile: true,
      hasAdvancedAnalytics: true,
    },
    lifetime: {
      maxMusicRecommendations: Infinity,
      maxPlaylistsPerWeek: Infinity,
      canExportData: true,
      canShareProfile: true,
      hasAdvancedAnalytics: true,
    },
  }

  return limits[plan]
}

/**
 * Get user's current plan from auth context user object
 * Pass the subscription object directly from Firestore
 */
export function getUserPlanFromSubscription(
  subscription: { plan?: string; status?: string } | null | undefined
): PlanType {
  if (!subscription) return "free"

  const status = subscription.status?.toLowerCase()

  // Only grant access if subscription is active or trialing
  if (status !== "active" && status !== "trialing") return "free"

  return normalizePlan(subscription.plan)
}

/**
 * Client helper: resolve plan from localStorage (userData or legacy subscription key).
 * Uses subscription status when present; falls back to selectedPlan for older payloads.
 */
export function getUserPlan(): PlanType {
  if (typeof window === "undefined") return "free"

  try {
    const userDataRaw = localStorage.getItem("userData")
    if (userDataRaw) {
      const parsed = JSON.parse(userDataRaw) as {
        subscription?: { plan?: string; status?: string }
        selectedPlan?: string
      }
      if (parsed.subscription) {
        return getUserPlanFromSubscription(parsed.subscription)
      }
      if (parsed.selectedPlan) {
        return normalizePlan(parsed.selectedPlan)
      }
    }

    const subRaw = localStorage.getItem("subscription")
    if (subRaw) {
      return getUserPlanFromSubscription(
        JSON.parse(subRaw) as { plan?: string; status?: string }
      )
    }
  } catch (error) {
    console.error("Error getting user plan:", error)
  }

  return "free"
}
