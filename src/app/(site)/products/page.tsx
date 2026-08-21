"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Check, MessageSquareQuote, ShoppingCart, X, Send, CheckCircle2, Signpost, ShieldAlert, HardHat, TreePine } from "lucide-react";

const blueprintProducts = [
  { id: "bw", name: "Black & White Blueprints", description: "Crisp, professional 24×36 prints for construction sets, permits, and field crews.", regular: 2.99, member: 1.99, icon: "B&W", tone: "from-slate-900 to-blueprint-900" },
  { id: "color", name: "Color Blueprints", description: "High-detail color plans for client presentations, coordination, and project reviews.", regular: 6.95, member: 5.95, icon: "COLOR", tone: "from-blueprint-600 to-cyan-500" },
];

const quoteProducts = [
  { name: "Construction Banners", desc: "Weather-resistant vinyl banners with reinforced grommets.", icon: Signpost, sizes: "Multiple sizes" },
  { name: "Safety Signs", desc: "Professional OSHA-focused safety signage for every job site.", icon: ShieldAlert, sizes: "Standard & custom" },
  { name: "Job Site Signs", desc: "Branded project signs that make your site look official.", icon: HardHat, sizes: "4×4, 4×8, custom" },
  { name: "Lawn Signage", desc: "Durable corrugated signs for announcements and promotions.", icon: TreePine, sizes: "18×24, 24×36" },
];

export default function ProductsPage() {
  const router = useRouter();
  const [quoteProduct, setQuoteProduct] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", details: "" });

  function addBlueprint(id: string) {
    localStorage.setItem("blueprints-cart", JSON.stringify({ printType: id, quantity: 1 }));
    router.push("/order");
  }

  async function submitQuote(event: React.FormEvent) {
    event.preventDefault(); setSubmitting(true); setError("");
    try {
      const response = await fetch("/api/quotes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productName: quoteProduct, customerName: formData.name, customerEmail: formData.email, customerPhone: formData.phone, details: formData.details }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to submit your request.");
      setSubmitted(true);
      setTimeout(() => { setSubmitted(false); setQuoteProduct(""); setFormData({ name: "", email: "", phone: "", details: "" }); }, 2200);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to submit your request."); } finally { setSubmitting(false); }
  }

  return <main className="bg-slate-50"><Navbar />
    <section className="pt-32 pb-16 bg-blueprint-950 text-white relative overflow-hidden"><div className="absolute inset-0 blueprint-grid opacity-20" /><div className="absolute -right-32 -top-40 w-96 h-96 rounded-full bg-blueprint-500/30 blur-3xl" /><div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><p className="text-blueprint-300 text-xs font-bold uppercase tracking-[0.2em] mb-4">Blueprints Club shop</p><h1 className="font-display text-5xl lg:text-6xl font-bold tracking-tight mb-5">Print-ready plans,<br /><span className="text-blueprint-300">priced for professionals.</span></h1><p className="text-blueprint-100 text-lg max-w-2xl">Choose your print type, add it to your cart, and upload your file at checkout. Members automatically receive the lower rate.</p></div></section>
    <section className="py-16"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div className="flex items-end justify-between mb-8"><div><p className="eyebrow mb-2">Blueprint printing</p><h2 className="font-display text-3xl font-bold text-gray-900">Start an order</h2></div><div className="hidden sm:flex items-center gap-2 text-sm text-gray-500"><ShoppingCart className="w-4 h-4 text-blueprint-600" />Upload files at checkout</div></div><div className="grid md:grid-cols-2 gap-6">{blueprintProducts.map((product) => <article key={product.id} className="bg-white rounded-3xl border border-gray-200 overflow-hidden card-hover"><div className={`h-48 bg-gradient-to-br ${product.tone} p-7 flex items-end relative`}><div className="absolute inset-0 blueprint-grid opacity-20" /><span className="relative font-display text-4xl font-bold tracking-tight text-white">{product.icon}</span><span className="relative ml-auto bg-white/15 backdrop-blur text-white text-xs font-bold px-3 py-1.5 rounded-full">24×36 standard</span></div><div className="p-7"><h3 className="font-display text-2xl font-bold text-gray-900">{product.name}</h3><p className="text-gray-600 mt-2 min-h-12">{product.description}</p><div className="flex items-end justify-between mt-7"><div><p className="text-xs uppercase tracking-wider text-gray-400">Starting at</p><p className="font-display text-3xl font-bold text-blueprint-700">${product.regular.toFixed(2)} <span className="text-sm font-normal text-gray-400">/ sheet</span></p><p className="text-sm text-green-600 mt-1">Members pay ${product.member.toFixed(2)}</p></div><button onClick={() => addBlueprint(product.id)} className="btn-primary flex items-center gap-2"><ShoppingCart className="w-4 h-4" />Add to cart</button></div></div></article>)}</div><div className="mt-6 rounded-2xl bg-blueprint-50 border border-blueprint-100 p-5 flex flex-col sm:flex-row gap-3 sm:items-center"><Check className="w-5 h-5 text-blueprint-600 flex-shrink-0" /><p className="text-sm text-blueprint-900"><strong>Member pricing is automatic.</strong> Sign in before checkout and your account membership will determine the final price.</p><button onClick={() => router.push("/membership")} className="sm:ml-auto text-sm font-bold text-blueprint-700 hover:text-blueprint-900 whitespace-nowrap">View membership →</button></div></div></section>
    <section className="py-16 bg-white"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div className="mb-8"><p className="eyebrow mb-2">More than blueprints</p><h2 className="font-display text-3xl font-bold text-gray-900">Custom products</h2><p className="text-gray-600 mt-2">Tell us what you need and our team will prepare a quote.</p></div><div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">{quoteProducts.map((product) => <article key={product.name} className="rounded-2xl border border-gray-200 p-5 card-hover"><div className="w-11 h-11 rounded-xl bg-blueprint-50 flex items-center justify-center mb-4"><product.icon className="w-5 h-5 text-blueprint-600" /></div><p className="text-xs text-gray-400 uppercase tracking-wider">{product.sizes}</p><h3 className="font-display text-lg font-bold text-gray-900 mt-1">{product.name}</h3><p className="text-sm text-gray-500 mt-2 mb-5">{product.desc}</p><button onClick={() => setQuoteProduct(product.name)} className="w-full rounded-xl border border-blueprint-200 py-2.5 text-sm font-bold text-blueprint-700 hover:bg-blueprint-600 hover:text-white transition-colors">Request a quote</button></article>)}</div></div></section><Footer />
    {quoteProduct && <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4"><div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-7"><div className="flex justify-between items-start mb-6"><div><p className="eyebrow mb-1">Custom product quote</p><h3 className="font-display text-2xl font-bold text-gray-900">{quoteProduct}</h3></div><button aria-label="Close quote form" onClick={() => setQuoteProduct("")} className="p-2 rounded-lg hover:bg-gray-100"><X className="w-5 h-5" /></button></div>{submitted ? <div className="py-10 text-center"><CheckCircle2 className="w-14 h-14 text-green-500 mx-auto mb-3" /><h4 className="font-bold text-gray-900">Request received</h4><p className="text-gray-500 text-sm mt-1">We&apos;ll get back to you within 24 hours.</p></div> : <form onSubmit={submitQuote} className="space-y-4"><input required placeholder="Full name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-3" /><input required type="email" placeholder="Email address" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-3" /><input placeholder="Phone (optional)" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-3" /><textarea rows={3} placeholder="Quantity, sizes, timeline, or special requirements" value={formData.details} onChange={(e) => setFormData({ ...formData, details: e.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-3 resize-none" />{error && <p className="text-sm text-red-600">{error}</p>}<button disabled={submitting} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60"><Send className="w-4 h-4" />{submitting ? "Sending..." : "Send quote request"}</button></form>}</div></div>}
  </main>;
}
