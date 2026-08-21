"use client";

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Signpost, ShieldAlert, HardHat, TreePine, MessageSquareQuote, X, Send, CheckCircle2 } from "lucide-react";

const products = [
  {
    name: "Construction Banners",
    desc: "Durable vinyl banners for job sites, safety zones, and project branding. Weather-resistant with reinforced grommets for easy hanging.",
    icon: Signpost,
    sizes: "Multiple sizes available",
    features: ["Weather-resistant vinyl", "Reinforced grommets", "Full-color printing", "Custom designs"],
  },
  {
    name: "Safety Signs",
    desc: "OSHA-compliant safety signage including hard hat zones, fall protection warnings, and hazard indicators. Essential for every job site.",
    icon: ShieldAlert,
    sizes: "Standard & custom sizes",
    features: ["OSHA compliant", "Reflective options", "Weatherproof", "Multiple languages"],
  },
  {
    name: "Job Site Signs",
    desc: "Professional contractor signs with your company branding, project details, and contact information. Make your site look official.",
    icon: HardHat,
    sizes: "4×4 ft, 4×8 ft, custom",
    features: ["Company branding", "Project details", "Contact info", "Durable materials"],
  },
  {
    name: "Lawn Signage",
    desc: "Corrugated yard signs perfect for real estate, construction announcements, and event promotion. Lightweight and easy to install.",
    icon: TreePine,
    sizes: "18×24 in, 24×36 in",
    features: ["Corrugated plastic", "H-stakes included", "Double-sided", "UV resistant"],
  },
];

export default function ProductsPage() {
  const [quoteModal, setQuoteModal] = useState<{ open: boolean; product: string }>({ open: false, product: "" });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", details: "" });

  const handleQuoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productName: quoteModal.product, customerName: formData.name, customerEmail: formData.email, customerPhone: formData.phone, details: formData.details }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to submit your request.");
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setQuoteModal({ open: false, product: "" });
        setFormData({ name: "", email: "", phone: "", details: "" });
      }, 2500);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to submit your request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main>
      <Navbar />
      <section className="pt-32 pb-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="font-display text-5xl font-bold text-gray-900 mb-6">Additional Products</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Beyond blueprints, we offer a full range of construction site printing solutions. Request a custom quote for any item below.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {products.map((product, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-8 border-2 border-gray-100 hover:border-blueprint-200 transition-all hover:shadow-lg group">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 bg-blueprint-50 rounded-xl flex items-center justify-center group-hover:bg-blueprint-100 transition-colors">
                    <product.icon className="w-7 h-7 text-blueprint-600" />
                  </div>
                  <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">{product.sizes}</span>
                </div>
                <h3 className="font-display text-xl font-bold text-gray-900 mb-2">{product.name}</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">{product.desc}</p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {product.features.map((f, i) => (
                    <span key={i} className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">{f}</span>
                  ))}
                </div>
                <button
                  onClick={() => setQuoteModal({ open: true, product: product.name })}
                  className="w-full py-3 rounded-xl border-2 border-blueprint-200 text-blueprint-700 font-semibold hover:bg-blueprint-600 hover:text-white hover:border-blueprint-600 transition-all flex items-center justify-center gap-2"
                >
                  <MessageSquareQuote className="w-4 h-4" />
                  Request Quotation
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />

      {/* Quote Modal */}
      {quoteModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display text-2xl font-bold text-gray-900">Request Quotation</h3>
                <button onClick={() => setQuoteModal({ open: false, product: "" })} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
              {submitted ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h4 className="font-semibold text-gray-900 text-lg mb-1">Quote Request Sent!</h4>
                  <p className="text-gray-500">We&apos;ll get back to you within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleQuoteSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Product</label>
                    <input type="text" value={quoteModal.product} readOnly className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-600" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Name *</label>
                    <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blueprint-500 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                    <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blueprint-500 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                    <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blueprint-500 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Project Details</label>
                    <textarea rows={3} value={formData.details} onChange={(e) => setFormData({ ...formData, details: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blueprint-500 transition-colors resize-none" placeholder="Quantity, size, timeline, special requirements..." />
                  </div>
                  {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
                  <button type="submit" disabled={submitting} className="w-full btn-primary flex items-center justify-center gap-2 py-3 disabled:opacity-60">
                    <Send className="w-4 h-4" />
                    {submitting ? "Sending..." : "Send Quote Request"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
