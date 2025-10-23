"use client";

import { useState } from "react";

type CheckoutButtonProps = {
  plan: "premium" | "ultimate";
  interval: "monthly" | "yearly" | "lifetime";
  className?: string;
  children?: React.ReactNode;
};

const CheckoutButton = ({ plan, interval, className, children }: CheckoutButtonProps) => {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    // Client-side safety check
    if (typeof window === 'undefined') return;
    
    setLoading(true);

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tier: `${plan}_${interval}`, // must match backend expectations
        }),
      });

      const data = await response.json();

      if (data?.url) {
        window.location.href = data.url;
      } else {
        console.error("Checkout failed:", data.error || "No URL returned");
        alert("Something went wrong. Please try again.");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={() => {
        if (typeof window !== 'undefined') {
          handleCheckout();
        }
      }}
      disabled={loading}
      className={`px-4 py-2 rounded-xl text-white transition ${className || "bg-black hover:bg-gray-800"}`}
    >
      {loading ? "Redirecting..." : children ?? "Subscribe"}
    </button>
  );
};

export default CheckoutButton;
