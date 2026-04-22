import type { Handler } from "@netlify/functions"
import { loadProfileByIdToken } from "@/lib/server/auth-handlers"

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Method not allowed" }),
    }
  }

  try {
    const body = event.body ? JSON.parse(event.body) : {}
    const { idToken } = body as { idToken?: string }

    const result = await loadProfileByIdToken(idToken ?? "")
    if (!result.success) {
      return {
        statusCode: result.status,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: result.error }),
      }
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: true, user: result.user }),
    }
  } catch (error: unknown) {
    console.error("Auth profile error:", error)
    const message = error instanceof Error ? error.message : "Failed to load profile"
    return {
      statusCode: 401,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: message }),
    }
  }
}
