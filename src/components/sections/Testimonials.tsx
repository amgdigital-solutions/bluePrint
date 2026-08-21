"use client";

import { Star, Quote } from "lucide-react";

const testimonials = [
  { name: "Marcus Johnson", role: "Project Manager, Apex Construction", text: "Blueprints Club cut our printing costs by 40%. The rush service saved us on a deadline last month.", rating: 5 },
  { name: "Sarah Chen", role: "Architect, Chen Design Studio", text: "Finally a print shop that understands architects. The color accuracy on our renderings is spot-on.", rating: 5 },
  { name: "David Rodriguez", role: "Site Supervisor, BuildRight LLC", text: "Free delivery to our job sites within 10 miles? That's a game changer. No more sending interns to pick up prints.", rating: 5 },
];

export default function Testimonials() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl font-bold text-gray-900 mb-4">What Our Members Say</h2>
          <p className="text-gray-600">Trusted by 500+ professionals across South Florida.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <Quote className="w-8 h-8 text-blueprint-200 mb-4" />
              <div className="flex gap-1 mb-4">
                {[...Array(t.rating)].map((_, i) => <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />)}
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">&ldquo;{t.text}&rdquo;</p>
              <div>
                <p className="font-semibold text-gray-900">{t.name}</p>
                <p className="text-sm text-gray-500">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
