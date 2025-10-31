import { NextResponse } from "next/server"
import Stripe from "stripe"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const sessionId = searchParams.get("session_id")

    if (!sessionId) {
      return NextResponse.json({ 
        error: "Session ID is required" 
      }, { status: 400 })
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY
    if (!stripeKey) {
      return NextResponse.json({ 
        error: "Stripe not configured" 
      }, { status: 500 })
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
    })

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'customer'],
    })

    // Verify payment status
    if (session.payment_status !== "paid") {
      return NextResponse.json({ 
        error: "Payment not completed",
        payment_status: session.payment_status
      }, { status: 400 })
    }

    // Extract subscription details
    const subscription = session.subscription
    let subscriptionDetails = null

    if (subscription && typeof subscription !== 'string') {
      const sub = subscription as any
      subscriptionDetails = {
        id: sub.id,
        status: sub.status,
        current_period_end: sub.current_period_end,
        trial_end: sub.trial_end,
      }
    }

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        payment_status: session.payment_status,
        customer_email: session.customer_details?.email,
        amount_total: session.amount_total,
        currency: session.currency,
        metadata: session.metadata,
      },
      subscription: subscriptionDetails,
    })
  } catch (error: any) {
    console.error("Verify session error:", error)
    return NextResponse.json({ 
      error: error.message || "Failed to verify session"
    }, { status: 500 })
  }
}

