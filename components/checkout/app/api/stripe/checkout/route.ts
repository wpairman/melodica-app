import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

const priceMap: Record<string, Record<string, string>> = {
  premium: {
    monthly: "price_1Rgy9yHc0HPmM6HNPf15gTLT",
    yearly: "price_1RgyAzHc0HPmM6HNaJ2zl66e",
    lifetime: "price_1RgyBuHc0HPmM6HNeljL7yLP",
  },
  ultimate: {
    monthly: "price_1RgyALHc0HPmM6HNrgM1PIjS",
    yearly: "price_1RgyBSHc0HPmM6HN9aSZs616",
    lifetime: "price_1RgyBuHc0HPmM6HNeljL7yLP", // Reuse same ID if you have one lifetime plan
  },
};

export async function POST(req: Request) {
  const { plan, interval } = await req.json();

  const priceId = priceMap[plan]?.[interval];
  if (!priceId) {
    return NextResponse.json({ error: "Invalid plan or interval" }, { status: 400 });
  }

  const isLifetime = interval === "lifetime";

  try {
    const session = await stripe.checkout.sessions.create({
      mode: isLifetime ? "payment" : "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: "http://localhost:3000/success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "http://localhost:3000/cancel",
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Stripe error:", error.message);
    return NextResponse.json({ error: "Stripe checkout failed" }, { status: 500 });
  }
}
