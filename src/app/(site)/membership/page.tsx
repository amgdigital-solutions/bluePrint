"use client";

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Check, Crown, Zap, Truck, Clock, Shield, Printer, AlertTriangle } from "lucide-react";

const plans = [
  { name: "Monthly", price: 39, period: "month", discount: 0, popular: false, stripePriceId: "price_monthly" },
  { name: "6 Months", price: 225, period: "6 months", discount: 4, popular: true, stripePriceId: "price_6month" },
  { name: "1 Year", price: 435, period: "year", discount: 7, popular: false, stripePriceId: "price_yearly" },
];

const benefits = [
  { icon: Zap, title: "Rush Prints", desc: "Expedite/priority printing on call. Skip the queue when you need it fast." },
  { icon: Shield, title: "Digitizing", desc: "Hard copy to soft copy conversion for just $1.99 per document." },
  { icon: Clock, title: "24hr Submissions", desc: "Submit orders anytime. We process all member orders within 24 business hours." },
  { icon: Printer, title: "No Maximum Prints", desc: "Order as many as you need. No caps on quantity for large projects." },
  { icon: Truck, title: "Free Delivery", desc: "Free delivery within 10 miles on orders $50+. Construction sites +$15." },
  { icon: Crown, title: "Member Pricing", desc: "Save 33% on every blueprint. B&W $1.99 (reg $2.99), Color $5.95 (reg $6.95)." },
];

export default function MembershipPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async (plan: typeof plans[0]) => {
    setIsLoading(true);
    setSelectedPlan(plan.name);
    // TODO: Integrate Square checkout here
    // For now, show a coming soon message
    alert(`Square checkout integration needed for ${plan.name} plan ($${plan.price}). This will redirect to Square payment.`);
    setIsLoading(false);
  };

  return (
    <main>
      <Navbar />
      <section className="pt-32 pb-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="font-display text-5xl font-bold text-gray-900 mb-6">Membership Plans</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join Blueprints Club and unlock exclusive pricing, priority service, and member-only benefits designed for professionals.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-20 max-w-5xl mx-auto">
            {plans.map((plan, idx) => (
              <div
                key={idx}
                className={`relative rounded-2xl p-8 ${
                  plan.popular
                    ? "bg-gradient-to-br from-blueprint-600 to-blueprint-800 text-white shadow-xl scale-105"
                    : "bg-white border-2 border-gray-100 hover:border-blueprint-200 transition-all"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    Most Popular
                  </div>
                )}
                <div className="mb-6">
                  <h3 className={`font-display text-xl font-bold mb-2 ${plan.popular ? "text-white" : "text-gray-900"}`}>
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline gap-1">
                    <span className={`font-display text-5xl font-bold ${plan.popular ? "text-white" : "text-blueprint-700"}`}>
                      ${plan.price}
                    </span>
                    <span className={plan.popular ? "text-blueprint-200" : "text-gray-500"}>/{plan.period}</span>
                  </div>
                  {plan.discount > 0 && (
                    <div className={`mt-2 inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${
                      plan.popular ? "bg-white/20 text-white" : "bg-green-50 text-green-700"
                    }`}>
                      Save {plan.discount}%
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleSubscribe(plan)}
                  disabled={isLoading}
                  className={`w-full py-3 rounded-xl font-semibold transition-all ${
                    plan.popular
                      ? "bg-white text-blueprint-700 hover:bg-blueprint-50"
                      : "btn-primary"
                  } ${isLoading && selectedPlan === plan.name ? "opacity-70 cursor-wait" : ""}`}
                >
                  {isLoading && selectedPlan === plan.name ? "Processing..." : `Choose ${plan.name}`}
                </button>
              </div>
            ))}
          </div>

          {/* Benefits Grid */}
          <div className="mb-16">
            <h2 className="font-display text-3xl font-bold text-gray-900 text-center mb-12">Member Benefits</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {benefits.map((benefit, idx) => (
                <div key={idx} className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                  <div className="w-12 h-12 bg-blueprint-50 rounded-xl flex items-center justify-center mb-4">
                    <benefit.icon className="w-6 h-6 text-blueprint-600" />
                  </div>
                  <h3 className="font-display font-bold text-lg text-gray-900 mb-2">{benefit.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{benefit.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Savings Calculator */}
          <div className="bg-blueprint-50 rounded-2xl p-8 border border-blueprint-100">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-blueprint-100 rounded-xl flex items-center justify-center">
                  <Crown className="w-7 h-7 text-blueprint-600" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-lg text-gray-900">Membership Pays for Itself</h4>
                  <p className="text-gray-600 text-sm">Print just 40 blueprints/month and your membership is covered by savings alone.</p>
                </div>
              </div>
              <div className="flex gap-8 text-center">
                <div>
                  <p className="font-display text-3xl font-bold text-blueprint-700">$1.99</p>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Member Price</p>
                </div>
                <div className="w-px bg-blueprint-200" />
                <div>
                  <p className="font-display text-3xl font-bold text-gray-400">$2.99</p>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Regular Price</p>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Policy */}
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-6 flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-yellow-900 mb-1">Delivery Policy</h4>
              <p className="text-sm text-yellow-800 leading-relaxed">
                Free delivery available for members only on orders $50 and above within 10 miles of our West Palm Beach location.
                Construction site deliveries incur an additional $15 charge. Minimum order value for delivery is $50.
                Orders outside the 10-mile radius can choose pickup or call us at +1 561-804-9110 for special arrangements.
              </p>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
