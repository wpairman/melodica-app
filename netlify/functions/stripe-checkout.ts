import type { Handler } from "@netlify/functions"
import Stripe from "stripe"

const priceMap: Record<string, Record<string, string>> = {
  premium: {
    monthly: "price_1Rgy9yHc0HPmM6HNPf15gTLT",
    yearly: "price_1RgyAzHc0HPmM6HNaJ2zl66e",
    lifetime: "price_1RgyBuHc0HPmM6HNeljL7yLP",
  },
  ultimate: {
    monthly: "price_1RgyALHc0HPmM6HNrgM1PIjS",
    yearly: "price_1RgyBSHc0HPmM6HN9aSZs616",
    lifetime: "price_1RgyBuHc0HPmM6HNeljL7yLP",
  },
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) }
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY
  if (!stripeKey) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error: "Payment system configuration error. STRIPE_SECRET_KEY is not set.",
      }),
    }
  }

  try {
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" })
    const body = JSON.parse(event.body || "{}")
    const { tier, customer_email: customerEmail } = body

    if (!tier || typeof tier !== "string" || !tier.includes("_")) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Invalid plan or interval format" }),
      }
    }

    const [plan, interval] = tier.split("_")
    if (!plan || !interval) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Invalid plan or interval format" }),
      }
    }

    const priceId = priceMap[plan]?.[interval]
    if (!priceId) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: `Invalid plan (${plan}) or interval (${interval})` }),
      }
    }

    const origin = event.headers["origin"] || event.headers["referer"] || process.env.URL || "https://melodica1.netlify.app"
    const baseUrl = (origin.startsWith("http") ? origin : `https://${origin}`).replace(/\/$/, "").split("?")[0]

    const session = await stripe.checkout.sessions.create({
      mode: interval === "lifetime" ? "payment" : "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}&plan=${plan}&interval=${interval}`,
      cancel_url: `${baseUrl}/register?plan=${plan}&interval=${interval}`,
      ...(interval !== "lifetime" && { subscription_data: { trial_period_days: 14 } }),
      metadata: { plan, interval },
      ...(customerEmail && typeof customerEmail === "string" && { customer_email: customerEmail }),
    })

    if (!session.url) {
      throw new Error("Stripe session created but no URL returned")
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: session.url }),
    }
  } catch (error: any) {
    console.error("Stripe checkout error:", error)
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error: error?.message || "Error creating checkout session",
      }),
    }
  }
}
