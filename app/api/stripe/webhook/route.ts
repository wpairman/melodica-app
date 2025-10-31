import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    
    // If Stripe is not configured, reject the webhook
    if (!stripeKey) {
      console.error("Stripe webhook called but STRIPE_SECRET_KEY is not set");
      return NextResponse.json({ 
        error: "Stripe not configured" 
      }, { status: 500 });
    }

    // Dynamic import of Stripe to avoid build-time dependency
    const { default: Stripe } = await import('stripe');
    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
    });

    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json({ 
        error: "Missing stripe-signature header" 
      }, { status: 400 });
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("STRIPE_WEBHOOK_SECRET is not set");
      return NextResponse.json({ 
        error: "Webhook secret not configured" 
      }, { status: 500 });
    }

    let event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (error: any) {
      console.error(`Webhook signature verification failed: ${error.message}`);
      return NextResponse.json({ 
        error: `Webhook signature verification failed: ${error.message}` 
      }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed":
        const checkoutSession = event.data.object as any;
        
        // IMPORTANT: Only activate subscription if payment was successful
        if (checkoutSession.payment_status === "paid") {
          console.log("Checkout completed with successful payment:", {
            sessionId: checkoutSession.id,
            customerId: checkoutSession.customer,
            subscriptionId: checkoutSession.subscription,
            paymentStatus: checkoutSession.payment_status,
          });
          
          // Here you would typically:
          // 1. Retrieve user from database using checkoutSession.client_reference_id or metadata
          // 2. Update user's subscription status in database
          // 3. Send confirmation email
          
          // For now, we just log it - the success page will verify with Stripe directly
        } else {
          console.warn("Checkout session completed but payment not successful:", {
            sessionId: checkoutSession.id,
            paymentStatus: checkoutSession.payment_status,
          });
        }
        break;

      case "customer.subscription.created":
        const subscriptionCreated = event.data.object as any;
        console.log("Subscription created:", {
          subscriptionId: subscriptionCreated.id,
          status: subscriptionCreated.status,
          customerId: subscriptionCreated.customer,
        });
        break;

      case "customer.subscription.updated":
        const subscriptionUpdated = event.data.object as any;
        console.log("Subscription updated:", {
          subscriptionId: subscriptionUpdated.id,
          status: subscriptionUpdated.status,
        });
        break;

      case "customer.subscription.deleted":
        const subscriptionDeleted = event.data.object as any;
        console.log("Subscription cancelled:", {
          subscriptionId: subscriptionDeleted.id,
        });
        break;

      case "payment_intent.succeeded":
        const paymentIntent = event.data.object as any;
        console.log("Payment succeeded:", {
          paymentIntentId: paymentIntent.id,
          amount: paymentIntent.amount,
        });
        break;

      case "payment_intent.payment_failed":
        const failedPayment = event.data.object as any;
        console.error("Payment failed:", {
          paymentIntentId: failedPayment.id,
          error: failedPayment.last_payment_error,
        });
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json({ 
      error: `Webhook error: ${error.message}` 
    }, { status: 500 });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}
