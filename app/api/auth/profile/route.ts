import { NextRequest, NextResponse } from "next/server"
import { loadProfileByIdToken } from "@/lib/server/auth-handlers"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { idToken?: string }
    const result = await loadProfileByIdToken(body.idToken ?? "")
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }
    return NextResponse.json({ success: true, user: result.user })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to load profile"
    console.error("POST /api/auth/profile:", e)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
