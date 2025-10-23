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
      return NextResponse.json({ error: "Missing Stripe key" }, { status: 500 });
    }
    
    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
    });

    const { tier } = await req.json();

    if (!tier || typeof tier !== "string" || !tier.includes("_")) {
      return NextResponse.json({ error: "Invalid plan or interval" }, { status: 400 });
    }

    const [plan, interval] = tier.split("_");

    const priceId = priceMap[plan]?.[interval];
    if (!priceId) {
      return NextResponse.json({ error: "Invalid plan or interval" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: interval === "lifetime" ? "payment" : "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${req.headers.get("origin")}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/pricing`,
      ...(interval !== "lifetime" && {
        subscription_data: { trial_period_days: 14 },
      }),
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Stripe checkout error:", error.message);
    return NextResponse.json({ error: "Error creating checkout session" }, { status: 500 });
  }
}
