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
  | "adSupported"
  | "adFree"
  | "spotifyPreviews30Sec"
  | "spotifyPreviewsFull"
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
    "adSupported",
    "spotifyPreviews30Sec",
    "calendarIntegration",
  ],
  premium: [
    "advancedMoodTracking",
    "unlimitedMusicRecommendations",
    "personalizedActivitySuggestions",
    "adFree",
    "spotifyPreviewsFull",
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
  musicPreviewLength: number
  canExportData: boolean
  canShareProfile: boolean
  hasAdvancedAnalytics: boolean
} {
  const limits = {
    free: {
      maxMusicRecommendations: 10, // Limited
      maxPlaylistsPerWeek: 0,
      musicPreviewLength: 30, // seconds
      canExportData: false,
      canShareProfile: false,
      hasAdvancedAnalytics: false,
    },
    premium: {
      maxMusicRecommendations: Infinity,
      maxPlaylistsPerWeek: 3,
      musicPreviewLength: Infinity, // full length
      canExportData: false,
      canShareProfile: false,
      hasAdvancedAnalytics: false,
    },
    ultimate: {
      maxMusicRecommendations: Infinity,
      maxPlaylistsPerWeek: Infinity,
      musicPreviewLength: Infinity,
      canExportData: true,
      canShareProfile: true,
      hasAdvancedAnalytics: true,
    },
    lifetime: {
      maxMusicRecommendations: Infinity,
      maxPlaylistsPerWeek: Infinity,
      musicPreviewLength: Infinity,
      canExportData: true,
      canShareProfile: true,
      hasAdvancedAnalytics: true,
    },
  }

  return limits[plan]
}

/**
 * Get user's current plan from localStorage
 */
export function getUserPlan(): PlanType {
  if (typeof window === 'undefined') return 'free'
  
  try {
    const userData = localStorage.getItem("userData")
    if (userData) {
      const parsed = JSON.parse(userData)
      return parsed.selectedPlan || 'free'
    }

    // Also check subscription status
    const subscription = localStorage.getItem("subscription")
    if (subscription) {
      const parsed = JSON.parse(subscription)
      return parsed.plan || 'free'
    }
  } catch (error) {
    console.error("Error getting user plan:", error)
  }

  return 'free'
}

