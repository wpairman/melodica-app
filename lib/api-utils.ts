/**
 * API Utility Functions
 * Calls Netlify functions directly for all server-side operations.
 */

/**
 * On native iOS (Capacitor with iosScheme:'https'), the app is served from
 * https://localhost with no port. Relative URLs resolve to https://localhost/…
 * which doesn't exist — use the absolute production URL instead.
 */
function getApiBase(): string {
  if (typeof window === "undefined") return ""
  const { hostname, port } = window.location
  if (hostname === "localhost" && (port === "" || port === "443")) {
    return "https://melodicaapp.com"
  }
  return ""
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
  let response: Response
  try {
    response = await fetch(`${getApiBase()}/.netlify/functions/stripe-checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tier, customer_email: customerEmail }),
    })
  } catch (fetchError: any) {
    throw new Error(`Network error: ${fetchError?.message || "Failed to fetch"}`)
  }

  const body = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(body?.error || `HTTP ${response.status}: ${response.statusText}`)
  }

  return body
}

/**
 * Calendar Sync API
 */
export async function syncCalendar(url: string): Promise<{ success: boolean; data: string }> {
  let response: Response
  try {
    response = await fetch(`${getApiBase()}/.netlify/functions/calendar-sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    })
  } catch (fetchError: any) {
    throw new Error(`Network error: ${fetchError?.message || "Failed to fetch"}`)
  }

  const body = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(body?.error || `HTTP ${response.status}: ${response.statusText}`)
  }

  return body
}

/**
 * Verify Stripe Session API
 */
export async function verifyStripeSession(sessionId: string): Promise<any> {
  let response: Response
  try {
    response = await fetch(
      `${getApiBase()}/.netlify/functions/stripe-verify-session?session_id=${sessionId}`,
      { headers: { "Content-Type": "application/json" } }
    )
  } catch (fetchError: any) {
    throw new Error(`Network error: ${fetchError?.message || "Failed to fetch"}`)
  }

  const body = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(body?.error || `HTTP ${response.status}: ${response.statusText}`)
  }

  return body
}
