import type { Handler } from "@netlify/functions"
import { loadProfileByIdToken } from "@/lib/server/auth-handlers"

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
}

export const handler: Handler = async (event) => {
  // Handle CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: CORS, body: "" }
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: CORS,
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
        headers: CORS,
        body: JSON.stringify({ error: result.error }),
      }
    }

    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify({ success: true, user: result.user }),
    }
  } catch (error: unknown) {
    console.error("Auth profile error:", error)
    const message = error instanceof Error ? error.message : "Failed to load profile"
    return {
      statusCode: 401,
      headers: CORS,
      body: JSON.stringify({ error: message }),
    }
  }
}
