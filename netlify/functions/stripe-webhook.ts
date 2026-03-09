import type { Handler } from "@netlify/functions"
import Stripe from "stripe"

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) }
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!stripeKey || !webhookSecret) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Stripe not configured" }),
    }
  }

  const signature = event.headers["stripe-signature"]
  if (!signature) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Missing stripe-signature header" }),
    }
  }

  const body = event.body || ""
  const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" })

  let stripeEvent
  try {
    stripeEvent = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message)
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Webhook signature verification failed" }),
    }
  }

  switch (stripeEvent.type) {
    case "checkout.session.completed":
      const session = stripeEvent.data.object as any
      if (session.payment_status === "paid") {
        console.log("Checkout completed:", session.id)
      }
      break
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      console.log(`Subscription ${stripeEvent.type}:`, (stripeEvent.data.object as any).id)
      break
    default:
      console.log(`Unhandled event: ${stripeEvent.type}`)
  }

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ received: true }),
  }
}
