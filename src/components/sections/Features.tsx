"use client";

import { FileText, Palette, Zap, Shield, Truck, Clock, Smartphone, Award } from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "B&W Blueprints",
    desc: "Crisp 24×36 black & white prints. Perfect for construction plans and architectural drawings.",
    price: "From $1.99",
  },
  {
    icon: Palette,
    title: "Color Blueprints",
    desc: "Full-color construction plans with vivid detail. Ideal for presentations and client reviews.",
    price: "From $5.95",
  },
  {
    icon: Zap,
    title: "Rush Printing",
    desc: "Members get priority queue access. Same-day printing available on call when capacity allows.",
    price: "Members Only",
  },
  {
    icon: Shield,
    title: "Digitizing",
    desc: "Convert hard copy blueprints to digital files. Preserve your archives in modern formats.",
    price: "$1.99",
  },
  {
    icon: Truck,
    title: "Free Delivery",
    desc: "Members enjoy free delivery within 10 miles on orders $50+. Construction sites +$15.",
    price: "Members $50+",
  },
  {
    icon: Clock,
    title: "24hr Submissions",
    desc: "Submit orders anytime, day or night. We process all orders within 24 business hours.",
    price: "Always",
  },
  {
    icon: Smartphone,
    title: "Easy Upload",
    desc: "Drag & drop PDF, DWG, DXF, or image files. Mobile-friendly ordering from any device.",
    price: "Free",
  },
  {
    icon: Award,
    title: "No Max Limits",
    desc: "Members can order any quantity. No caps on print runs for large construction projects.",
    price: "Members Only",
  },
];

export default function Features() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="eyebrow mb-3">Built for your next deadline</p>
          <h2 className="font-display text-4xl font-bold text-gray-900 mb-4 tracking-tight">Everything your plans need</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Everything you need for professional blueprint printing, from standard B&W copies to full-color plans and digitizing services.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-6 border border-gray-100 card-hover group"
            >
              <div className="w-12 h-12 bg-blueprint-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blueprint-100 transition-colors">
                <feature.icon className="w-6 h-6 text-blueprint-600" />
              </div>
              <h3 className="font-display font-bold text-lg text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-500 mb-4 leading-relaxed">{feature.desc}</p>
              <span className="inline-block bg-blueprint-50 text-blueprint-700 text-xs font-semibold px-3 py-1 rounded-full">
                {feature.price}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
