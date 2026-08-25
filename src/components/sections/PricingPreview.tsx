"use client";

import Link from "next/link";
import { Check, Crown } from "lucide-react";

const plans = [
  { name: "Monthly", price: 39, period: "month", discount: 0, popular: false },
  { name: "6 Months", price: 225, period: "6 months", discount: 4, popular: true },
  { name: "1 Year", price: 435, period: "year", discount: 7, popular: false },
];

const benefits = ["Rush prints on call", "Digitizing $1.99", "Timing confirmed", "No max prints", "Free delivery $50+", "33% off every print"];

export default function PricingPreview() {
  return (
    <section className="py-24 bg-blueprint-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl font-bold mb-4">Join the Club</h2>
          <p className="text-blueprint-300 max-w-2xl mx-auto">Membership pays for itself. Print 40 blueprints and your membership is covered.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, idx) => (
            <div key={idx} className={`relative rounded-2xl p-8 ${plan.popular ? "bg-white text-gray-900 scale-105 shadow-2xl" : "bg-blueprint-900/50 border border-blueprint-800"}`}>
              {plan.popular && <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 px-4 py-1 rounded-full text-xs font-bold uppercase">Most Popular</div>}
              <h3 className="font-display text-xl font-bold mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="font-display text-5xl font-bold">${plan.price}</span>
                <span className={plan.popular ? "text-gray-500" : "text-blueprint-400"}>/{plan.period}</span>
              </div>
              {plan.discount > 0 && <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold mb-4">Save {plan.discount}%</span>}
              <ul className="space-y-3 mb-8">
                {benefits.map((b, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <Check className={`w-4 h-4 flex-shrink-0 ${plan.popular ? "text-blueprint-600" : "text-blueprint-400"}`} />
                    <span className={plan.popular ? "text-gray-600" : "text-blueprint-200"}>{b}</span>
                  </li>
                ))}
              </ul>
              <Link href="/membership" className={`block text-center py-3 rounded-xl font-bold transition-all ${plan.popular ? "btn-primary" : "bg-blueprint-800 hover:bg-blueprint-700 text-white"}`}>
                Choose {plan.name}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
