import type { Handler } from "@netlify/functions"
import { verifyPassword, isOldHashFormat } from "@/lib/password-utils"
import { getUserByEmailFromFirebase } from "@/lib/firebase-users"

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
    const { email, password } = body as { email?: string; password?: string }

    if (!email || !password) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Email and password are required" }),
      }
    }

    const normalizedEmail = email.trim().toLowerCase()

    const firebaseUser = await getUserByEmailFromFirebase(normalizedEmail)

    if (!firebaseUser || !firebaseUser.password) {
      return {
        statusCode: 401,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Invalid email or password" }),
      }
    }

    const storedPassword = firebaseUser.password

    let isValid = false
    if (isOldHashFormat(storedPassword)) {
      isValid = storedPassword === password
    } else {
      isValid = await verifyPassword(password, storedPassword)
    }

    if (!isValid) {
      return {
        statusCode: 401,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Invalid email or password" }),
      }
    }

    const userPayload = {
      name: firebaseUser.name,
      email: firebaseUser.email,
      gender: firebaseUser.gender || "",
      favoriteArtists: firebaseUser.favoriteArtists || "",
      favoriteActivities: firebaseUser.favoriteActivities || "",
      musicGenres: firebaseUser.musicGenres || "",
      subscription: firebaseUser.subscription || null,
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        success: true,
        user: userPayload,
      }),
    }
  } catch (error: any) {
    console.error("Auth login error:", error)
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error: error?.message || "Login failed",
      }),
    }
  }
}

