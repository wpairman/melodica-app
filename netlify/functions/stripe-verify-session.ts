import type { Handler } from "@netlify/functions"
import Stripe from "stripe"

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "GET") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) }
  }

  const sessionId = event.queryStringParameters?.session_id
  if (!sessionId) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Session ID is required" }),
    }
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY
  if (!stripeKey) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Stripe not configured" }),
    }
  }

  try {
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" })
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription", "customer"],
    })

    if (session.payment_status !== "paid") {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          error: "Payment not completed",
          payment_status: session.payment_status,
        }),
      }
    }

    const subscription = session.subscription
    let subscriptionDetails = null
    if (subscription && typeof subscription !== "string") {
      const sub = subscription as any
      subscriptionDetails = {
        id: sub.id,
        status: sub.status,
        current_period_end: sub.current_period_end,
        trial_end: sub.trial_end,
      }
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
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
      }),
    }
  } catch (error: any) {
    console.error("Verify session error:", error)
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error: error?.message || "Failed to verify session",
      }),
    }
  }
}
