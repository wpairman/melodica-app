import { NextRequest, NextResponse } from "next/server"
import { loginWithEmailPassword } from "@/lib/server/auth-handlers"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { email?: string; password?: string }
    const result = await loginWithEmailPassword(body.email ?? "", body.password ?? "")
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }
    return NextResponse.json({ success: true, user: result.user })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Login failed"
    console.error("POST /api/auth/login:", e)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
