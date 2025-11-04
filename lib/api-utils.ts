/**
 * API Utility Functions
 * Handles API calls with support for both development and production environments
 * 
 * For production (static export), API routes must be deployed separately.
 * Set NEXT_PUBLIC_API_URL to your backend URL (e.g., https://your-api.vercel.app)
 */

/**
 * Get the base API URL
 * Uses NEXT_PUBLIC_API_URL if set, otherwise falls back to relative /api for development
 */
export function getApiUrl(): string {
  if (typeof window === 'undefined') {
    // Server-side: use relative URL or environment variable
    return process.env.NEXT_PUBLIC_API_URL || '/api'
  }
  
  // Client-side: use environment variable or relative URL
  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  if (apiUrl) {
    return apiUrl
  }
  
  // Fallback to relative URL (works in development, but not in static export)
  return '/api'
}

/**
 * Make an API request
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const apiUrl = getApiUrl()
  const url = `${apiUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ 
      error: `HTTP ${response.status}: ${response.statusText}` 
    }))
    throw new Error(errorData.error || `Request failed: ${response.status}`)
  }

  return response.json()
}

/**
 * Stripe Checkout API
 */
export async function createStripeCheckoutSession(tier: string): Promise<{ url: string }> {
  return apiRequest<{ url: string }>('/stripe/checkout', {
    method: 'POST',
    body: JSON.stringify({ tier }),
  })
}

/**
 * Calendar Sync API
 */
export async function syncCalendar(url: string): Promise<{ success: boolean; data: string }> {
  return apiRequest<{ success: boolean; data: string }>('/calendar-sync', {
    method: 'POST',
    body: JSON.stringify({ url }),
  })
}

/**
 * Verify Stripe Session API
 */
export async function verifyStripeSession(sessionId: string): Promise<any> {
  return apiRequest(`/stripe/verify-session?session_id=${sessionId}`)
}

