import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Upload, FileCheck, Printer, Truck, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";

const steps = [
  {
    icon: Upload,
    title: "Upload Your File",
    desc: "Drag and drop your PDF, DWG, DXF, or image file directly on our order page. We accept all major blueprint formats up to 50MB.",
    details: ["PDF, JPG, PNG, DWG, DXF supported", "Mobile-friendly upload", "Instant file validation"],
  },
  {
    icon: FileCheck,
    title: "We Review & Confirm",
    desc: "Our team reviews your file within 30 minutes during business hours. We confirm print specs, pricing, and delivery options.",
    details: ["File quality check", "Print settings confirmation", "Delivery distance verification"],
  },
  {
    icon: Printer,
    title: "Professional Printing",
    desc: "Your blueprints are printed on premium 24×36 paper using high-resolution printers. Color accuracy guaranteed for renderings.",
    details: ["24×36 standard size", "B&W or full color", "Premium paper stock"],
  },
  {
    icon: Truck,
    title: "Delivery or Pickup",
    desc: "Members get free delivery within 10 miles on orders $50+. Construction sites add $15. Or pick up at our WPB location.",
    details: ["Free delivery (members, $50+)", "10-mile radius", "Construction site delivery available"],
  },
];

export default function HowItWorksPage() {
  return (
    <main>
      <Navbar />
      <section className="pt-32 pb-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="font-display text-5xl font-bold text-gray-900 mb-6">How It Works</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From upload to delivery in four simple steps. No account required for one-time orders — but membership unlocks the best experience.
            </p>
          </div>

          <div className="space-y-12">
            {steps.map((step, idx) => (
              <div key={idx} className="flex flex-col md:flex-row gap-8 items-start">
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 bg-blueprint-50 rounded-2xl flex items-center justify-center">
                    <step.icon className="w-8 h-8 text-blueprint-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="font-display text-sm font-bold text-blueprint-500">STEP {String(idx + 1).padStart(2, "0")}</span>
                    <div className="h-px flex-1 bg-gray-200" />
                  </div>
                  <h3 className="font-display text-2xl font-bold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed mb-4">{step.desc}</p>
                  <div className="flex flex-wrap gap-2">
                    {step.details.map((d, i) => (
                      <span key={i} className="inline-flex items-center gap-1 bg-blueprint-50 text-blueprint-700 text-sm px-3 py-1.5 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center bg-blueprint-50 rounded-2xl p-10">
            <h3 className="font-display text-2xl font-bold text-gray-900 mb-4">Ready to get started?</h3>
            <p className="text-gray-600 mb-6">Upload your first blueprint and see how easy professional printing can be.</p>
            <Link href="/order" className="btn-primary inline-flex items-center gap-2">
              Place Your Order <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
