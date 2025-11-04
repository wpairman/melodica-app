"use client";

import { useState } from "react";
import { createStripeCheckoutSession } from "@/lib/api-utils";

type CheckoutButtonProps = {
  plan: "premium" | "ultimate";
  interval: "monthly" | "yearly" | "lifetime";
  className?: string;
  children?: React.ReactNode;
};

const CheckoutButton = ({ plan, interval, className, children }: CheckoutButtonProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    // Client-side safety check
    if (typeof window === 'undefined') return;
    
    setLoading(true);
    setError(null);

    try {
      const data = await createStripeCheckoutSession(`${plan}_${interval}`);

      if (data?.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned from server");
      }
    } catch (err: any) {
      const errorMessage = err.message || "Failed to create checkout session. Please try again.";
      setError(errorMessage);
      alert(`Payment Error: ${errorMessage}\n\nPlease check your connection and try again.`);
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <button
        onClick={handleCheckout}
        type="button"
        disabled={loading}
        className={`px-4 py-2 rounded-xl text-white transition disabled:opacity-50 disabled:cursor-not-allowed ${
          className || "bg-black hover:bg-gray-800"
        }`}
      >
        {loading ? "Redirecting..." : children ?? "Subscribe"}
      </button>
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default CheckoutButton;
