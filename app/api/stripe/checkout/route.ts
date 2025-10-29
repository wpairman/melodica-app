import { NextResponse } from "next/server";
import Stripe from "stripe";

const priceMap: Record<string, Record<string, string>> = {
  premium: {
    monthly: "price_1Rgy9yHc0HPmM6HNPf15gTLT",
    yearly: "price_1RgyAzHc0HPmM6HNaJ2zl66e",
    lifetime: "price_1RgyBuHc0HPmM6HNeljL7yLP", // optional
  },
  ultimate: {
    monthly: "price_1RgyALHc0HPmM6HNrgM1PIjS",
    yearly: "price_1RgyBSHc0HPmM6HN9aSZs616",
    lifetime: "price_1RgyBuHc0HPmM6HNeljL7yLP",
  },
};

export async function POST(req: Request) {
  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      console.error("Stripe secret key is missing from environment variables");
      return NextResponse.json({ error: "Payment system configuration error. Please contact support." }, { status: 500 });
    }
    
    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
    });

    let body;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const { tier } = body;

    if (!tier || typeof tier !== "string" || !tier.includes("_")) {
      return NextResponse.json({ error: "Invalid plan or interval format" }, { status: 400 });
    }

    const [plan, interval] = tier.split("_");

    if (!plan || !interval) {
      return NextResponse.json({ error: "Invalid plan or interval format" }, { status: 400 });
    }

    const priceId = priceMap[plan]?.[interval];
    if (!priceId) {
      console.error(`Price ID not found for plan: ${plan}, interval: ${interval}`);
      return NextResponse.json({ 
        error: `Invalid plan (${plan}) or interval (${interval}). Available: premium/ultimate, monthly/yearly/lifetime` 
      }, { status: 400 });
    }

    // Get origin for redirect URLs
    const origin = req.headers.get("origin") || req.headers.get("host") || "http://localhost:3000";
    const protocol = origin.startsWith("http") ? "" : "https://";
    const baseUrl = origin.startsWith("http") ? origin : `${protocol}${origin}`;

    const session = await stripe.checkout.sessions.create({
      mode: interval === "lifetime" ? "payment" : "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}&plan=${plan}&interval=${interval}`,
      cancel_url: `${baseUrl}/pricing`,
      ...(interval !== "lifetime" && {
        subscription_data: { trial_period_days: 14 },
      }),
      metadata: {
        plan: plan,
        interval: interval,
      },
    });

    if (!session.url) {
      throw new Error("Stripe session created but no URL returned");
    }

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Stripe checkout error:", error);
    
    // Provide more specific error messages
    let errorMessage = "Error creating checkout session";
    if (error?.type === "StripeInvalidRequestError") {
      errorMessage = `Stripe error: ${error.message}`;
    } else if (error?.message) {
      errorMessage = error.message;
    }
    
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
