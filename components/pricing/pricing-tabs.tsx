"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Check,
  Music,
  Heart,
  Activity,
  X,
  Headphones,
  Sparkles,
  Clock,
  Zap,
} from "lucide-react";
import Link from "next/link";
import CheckoutButton from "@/components/checkout-button";

export default function PricingTabs() {

  const plans = [
    {
      name: "Free",
      description: "Basic mood tracking and recommendations",
      monthlyPrice: "$0",
      yearlyPrice: "$0",
      features: [
        { name: "Basic mood tracking", included: true },
        { name: "Limited music recommendations", included: true },
        { name: "Activity suggestions", included: true },
        { name: "Ad-supported experience", included: true },
        { name: "Spotify song previews (30 sec)", included: true },
        { name: "Calendar integration & event reminders", included: true },
        { name: "Detailed music preference quiz", included: false },
        { name: "Personalized playlists", included: false },
        { name: "Advanced mood analytics", included: false },
        { name: "Ad-free experience", included: false },
        { name: "Full Spotify integration", included: false },
      ],
      cta: "Get Started",
      ctaLink: "/register",
      popular: false,
      icon: Heart,
      freeTrial: false,
    },
    {
      name: "Premium",
      description: "Enhanced features for music therapy",
      monthlyPrice: "$1.99",
      yearlyPrice: "$19.99",
      features: [
        { name: "Advanced mood tracking", included: true },
        { name: "Unlimited music recommendations", included: true },
        { name: "Personalized activity suggestions", included: true },
        { name: "Ad-free experience", included: true },
        { name: "Spotify song previews (full length)", included: true },
        { name: "Calendar integration & event reminders", included: true },
        { name: "Detailed music preference quiz", included: true },
        { name: "3 personalized playlists per week", included: true },
        { name: "Basic mood analytics", included: true },
        { name: "Export your mood data", included: false },
        { name: "Priority customer support", included: false },
      ],
      cta: "Subscribe",
      ctaLink: "/register?plan=premium",
      popular: true,
      icon: Music,
      freeTrial: true,
    },
    {
      name: "Ultimate",
      description: "Complete mental wellbeing solution",
      monthlyPrice: "$2.99",
      yearlyPrice: "$29.99",
      features: [
        { name: "Comprehensive mood tracking", included: true },
        { name: "AI-powered music recommendations", included: true },
        { name: "Custom activity programs", included: true },
        { name: "Ad-free premium experience", included: true },
        { name: "Full Spotify integration", included: true },
        { name: "Calendar integration & event reminders", included: true },
        { name: "Advanced music preference analysis", included: true },
        { name: "Unlimited personalized playlists", included: true },
        { name: "Advanced mood analytics & insights", included: true },
        { name: "Period tracking & cycle insights (for female users)", included: true },
        { name: "Profile sharing with other Ultimate users", included: true },
        { name: "Export & share your mood data", included: true },
        { name: "24/7 priority customer support", included: true },
      ],
      cta: "Subscribe",
      ctaLink: "/register?plan=ultimate",
      popular: false,
      icon: Sparkles,
      freeTrial: true,
    },
    {
      name: "Lifetime",
      description: "One-time payment for unlimited access",
      oneTimePrice: "$99.99",
      features: [
        { name: "All Ultimate plan features", included: true },
        { name: "Calendar integration & event reminders", included: true },
        { name: "Lifetime access", included: true },
        { name: "No recurring payments", included: true },
        { name: "Free future updates", included: true },
        { name: "Exclusive lifetime member badge", included: true },
        { name: "Priority customer support", included: true },
        { name: "Early access to new features", included: true },
        { name: "Personalized onboarding session", included: true },
        { name: "Custom mood tracking dashboard", included: true },
        { name: "Period tracking & cycle insights (for female users)", included: true },
        { name: "Profile sharing with other Ultimate users", included: true },
        { name: "Unlimited data exports", included: true },
      ],
      cta: "Buy Lifetime",
      ctaLink: "/register?plan=lifetime",
      popular: false,
      icon: Zap,
      freeTrial: false,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-black mb-2">Choose Your Plan</h2>
        <p className="text-gray-600">Compare monthly and yearly pricing options</p>
      </div>
      
      <div className="text-center mb-4">
        <p className="text-sm text-gray-500">
          💡 <strong>Monthly</strong> billing for flexibility • <strong>Yearly</strong> billing saves you 15%
        </p>
      </div>

      {/* Monthly Plans */}
      <div className="space-y-4">
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-black mb-2">Monthly Billing</h3>
          <p className="text-gray-600">Pay monthly for maximum flexibility</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
          {plans
            .filter((plan) => plan.name !== "Lifetime")
            .map((plan) => (
              <PricingCard
                key={`monthly-${plan.name}`}
                plan={plan}
                price={plan.monthlyPrice}
                billingCycle="monthly"
                popular={plan.popular}
              />
            ))}
          <PricingCard
            key="lifetime-monthly"
            plan={plans.find((p) => p.name === "Lifetime")!}
            price={plans.find((p) => p.name === "Lifetime")!.oneTimePrice!}
            billingCycle="lifetime"
            popular={false}
          />
        </div>
      </div>

      {/* Yearly Plans */}
      <div className="space-y-4">
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-black mb-2">Yearly Billing</h3>
          <p className="text-gray-600">Save 15% with annual billing</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
          {plans
            .filter((plan) => plan.name !== "Lifetime")
            .map((plan) => (
              <PricingCard
                key={`yearly-${plan.name}`}
                plan={plan}
                price={plan.yearlyPrice}
                billingCycle="yearly"
                popular={plan.popular}
              />
            ))}
          <PricingCard
            key="lifetime-yearly"
            plan={plans.find((p) => p.name === "Lifetime")!}
            price={plans.find((p) => p.name === "Lifetime")!.oneTimePrice!}
            billingCycle="lifetime"
            popular={false}
          />
        </div>
      </div>

      <div className="text-center mt-12">
        <h3 className="text-lg font-medium mb-4 text-black">All Plans Include</h3>
        <div className="flex flex-wrap justify-center gap-4 max-w-3xl mx-auto">
          {[
            { icon: Heart, text: "Mood Tracking" },
            { icon: Music, text: "Music Recommendations" },
            { icon: Activity, text: "Activity Suggestions" },
            { icon: Headphones, text: "Spotify Integration" },
            { icon: Clock, text: "Hourly Check-ins" },
            { icon: Zap, text: "Personalized Experience" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border text-sm">
              <item.icon className="h-4 w-4 text-teal-600" />
              <span className="text-black">{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface PricingCardProps {
  plan: {
    name: string;
    description: string;
    features: { name: string; included: boolean }[];
    cta: string;
    ctaLink: string;
    icon: any;
    freeTrial?: boolean;
    oneTimePrice?: string;
  };
  price: string;
  billingCycle: "monthly" | "yearly" | "lifetime";
  popular: boolean;
}

function PricingCard({ plan, price, billingCycle, popular }: PricingCardProps) {
  const Icon = plan.icon;
  const isPaidPlan = ["Premium", "Ultimate"].includes(plan.name);
  const isLifetimePlan = plan.name === "Lifetime";

  return (
    <Card className={`flex flex-col border-2 ${popular ? "border-teal-600 shadow-lg relative" : "border-gray-200"} h-full`}>
      {popular && (
        <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
          <div className="bg-teal-600 text-white text-xs font-medium px-3 py-1 rounded-full">Most Popular</div>
        </div>
      )}
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-full ${popular ? "bg-teal-100" : "bg-gray-100"}`}>
            <Icon className={`h-5 w-5 ${popular ? "text-teal-600" : "text-gray-600"}`} />
          </div>
          <CardTitle className="text-black">{plan.name}</CardTitle>
        </div>
        <CardDescription className="text-black">{plan.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="mb-6">
          <span className="text-3xl font-bold text-black">{price}</span>
          {!isLifetimePlan && (
            <span className="text-black ml-1">/{billingCycle === "monthly" ? "month" : "year"}</span>
          )}
          {plan.freeTrial && <div className="mt-2 text-sm text-teal-600 font-medium">Includes 2-week free trial</div>}
        </div>
        <ul className="space-y-3">
          {plan.features.map((feature, i) => (
            <li key={i} className="flex items-start gap-2">
              {feature.included ? (
                <Check className="h-5 w-5 text-teal-600 mt-0.5 flex-shrink-0" />
              ) : (
                <X className="h-5 w-5 text-gray-300 mt-0.5 flex-shrink-0" />
              )}
              <span className={feature.included ? "text-black" : "text-gray-500"}>{feature.name}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        {isPaidPlan ? (
          <CheckoutButton
            plan={plan.name.toLowerCase() as "premium" | "ultimate"}
            interval={billingCycle}
            className={`w-full text-white ${popular ? "bg-teal-600 hover:bg-teal-700" : "bg-gray-900 hover:bg-gray-800"}`}
          >
            {plan.cta}
          </CheckoutButton>
        ) : isLifetimePlan ? (
          <CheckoutButton
            plan="ultimate"
            interval="lifetime"
            className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
          >
            {plan.cta}
          </CheckoutButton>
        ) : (
          <Link href={plan.ctaLink} className="w-full">
            <Button className={`w-full text-white ${popular ? "bg-teal-600 hover:bg-teal-700" : "bg-gray-900 hover:bg-gray-800"}`}>
              {plan.cta}
            </Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  );
}
