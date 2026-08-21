"use client";

import { Upload, FileCheck, Printer, Truck } from "lucide-react";

const steps = [
  { icon: Upload, step: "01", title: "Upload", desc: "Drag & drop your PDF, DWG, or image file. We accept all major blueprint formats." },
  { icon: FileCheck, step: "02", title: "Review", desc: "We verify your file and confirm specs. You'll get a quote within 30 minutes." },
  { icon: Printer, step: "03", title: "Print", desc: "High-quality 24×36 printing on premium paper. Color or B&W, your choice." },
  { icon: Truck, step: "04", title: "Deliver", desc: "Free delivery within 10 miles for members on $50+ orders. Or pick up at our WPB location." },
];

export default function HowItWorks() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Four simple steps from upload to delivery. No hassle, no hidden fees.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((s, idx) => (
            <div key={idx} className="relative text-center">
              <div className="w-20 h-20 bg-blueprint-50 rounded-2xl flex items-center justify-center mx-auto mb-6 relative z-10">
                <s.icon className="w-8 h-8 text-blueprint-600" />
              </div>
              <span className="font-display text-6xl font-bold text-blueprint-50 absolute top-0 left-1/2 -translate-x-1/2 -z-0 select-none">{s.step}</span>
              <h3 className="font-display font-bold text-xl text-gray-900 mb-2 relative z-10">{s.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed relative z-10">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
