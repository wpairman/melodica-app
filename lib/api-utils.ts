/**
 * API Utility Functions
 * Handles API calls with support for both development and production environments
 * 
 * For production (static export), API routes must be deployed separately.
 * Set NEXT_PUBLIC_API_URL to your backend URL (e.g., https://your-api.vercel.app)
 */

/**
 * Get the base API URL
 * For Netlify with co-located functions: leave NEXT_PUBLIC_API_URL unset so requests
 * go to /api/* on the same origin. Only set it if using a separate API backend.
 */
export function getApiUrl(): string {
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL || '/api'
  }
  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  if (apiUrl) {
    return apiUrl
  }
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
  
  let response: Response
  try {
    response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })
  } catch (fetchError: any) {
    throw new Error(`Network error (${url}): ${fetchError?.message || 'Failed to fetch'}`)
  }

  const body = await response.json().catch(() => null)

  if (!response.ok) {
    const serverError = body?.error || `HTTP ${response.status}: ${response.statusText}`
    throw new Error(serverError)
  }

  return body
}

/**
 * Stripe Checkout API
 * @param tier - Plan and interval, e.g. "premium_monthly"
 * @param customerEmail - Optional email to pre-fill in Stripe Checkout
 */
export async function createStripeCheckoutSession(
  tier: string,
  customerEmail?: string
): Promise<{ url: string; error?: string }> {
  try {
    return await apiRequest<{ url: string; error?: string }>('/stripe/checkout', {
      method: 'POST',
      body: JSON.stringify({ tier, customer_email: customerEmail }),
    })
  } catch (error: any) {
    throw error
  }
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

