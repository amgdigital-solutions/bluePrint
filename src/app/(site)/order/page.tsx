"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { upload } from "@vercel/blob/client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { AlertTriangle, CheckCircle2, Clock3, FileUp, Loader2, MapPin, Navigation, ShieldCheck, ShoppingCart, Truck, UploadCloud, X } from "lucide-react";

const business = { lat: 26.6834, lng: -80.0543 };
const prices = { bw: { regular: 2.99, member: 1.99, label: "Black & White" }, color: { regular: 6.95, member: 5.95, label: "Color" } } as const;

function milesBetween(lat1: number, lng1: number, lat2: number, lng2: number) {
  const radius = 3959; const dLat = (lat2 - lat1) * Math.PI / 180; const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function OrderPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isMember, setIsMember] = useState(false);
  const [authLoaded, setAuthLoaded] = useState(false);
  const [cart, setCart] = useState({ printType: "bw" as "bw" | "color", quantity: 1 });
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", notes: "", file: null as File | null });
  const [deliveryChoice, setDeliveryChoice] = useState<"pickup" | "delivery">("pickup");
  const [distance, setDistance] = useState<number | null>(null);
  const [useLocation, setUseLocation] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    try { const saved = JSON.parse(localStorage.getItem("blueprints-cart") || "null"); if (saved?.printType) setCart({ printType: saved.printType, quantity: Math.max(1, Number(saved.quantity) || 1) }); } catch { /* use defaults */ }
    fetch("/api/profile").then(async (response) => { if (!response.ok) return; const result = await response.json(); const profile = result.profile; setIsMember(profile.is_member === true); setForm((current) => ({ ...current, name: profile.full_name || "", email: profile.email || "", phone: profile.phone || "", address: profile.address || "" })); }).finally(() => setAuthLoaded(true));
  }, []);

  const unitPrice = isMember ? prices[cart.printType].member : prices[cart.printType].regular;
  const subtotal = Number((unitPrice * cart.quantity).toFixed(2));
  const deliveryEligible = isMember && subtotal >= 50 && distance !== null && distance <= 10;
  const deliveryFee = deliveryChoice === "delivery" && deliveryEligible && false ? 15 : 0;
  const total = subtotal + deliveryFee;

  function updateCart(quantity: number) { const next = { ...cart, quantity: Math.min(10000, Math.max(1, quantity)) }; setCart(next); localStorage.setItem("blueprints-cart", JSON.stringify(next)); }

  async function checkDistance() {
    if (useLocation && navigator.geolocation) {
      setCalculating(true); navigator.geolocation.getCurrentPosition((position) => { setDistance(Number(milesBetween(business.lat, business.lng, position.coords.latitude, position.coords.longitude).toFixed(1))); setCalculating(false); }, () => { setError("Unable to access your location. Enter the delivery address instead."); setCalculating(false); }); return;
    }
    if (!form.address.trim()) { setError("Enter a delivery address first."); return; }
    setCalculating(true); setError("");
    try { const response = await fetch("/api/distance", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ address: form.address }) }); const result = await response.json(); if (!response.ok) throw new Error(result.error); setDistance(result.distance); } catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to calculate distance."); } finally { setCalculating(false); }
  }

  async function submitOrder(event: React.FormEvent) {
    event.preventDefault(); setError("");
    if (!form.file) { setError("Please upload your blueprint file."); return; }
    if (deliveryChoice === "delivery" && !deliveryEligible) { setError("Delivery is available to members on $50+ orders within 10 miles. Please choose pickup or call us for special delivery."); return; }
    setSubmitting(true);
    try {
      const meResponse = await fetch("/api/auth/me"); const me = meResponse.ok ? await meResponse.json() : { user: null };
      const safeName = form.file.name.replace(/[^a-zA-Z0-9._-]/g, "_"); const path = me.user ? `orders/${me.user.id}/${crypto.randomUUID()}-${safeName}` : `orders/guest/${crypto.randomUUID()}-${safeName}`;
      const blob = await upload(path, form.file, { access: "private", handleUploadUrl: "/api/upload" });
      const response = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ customerName: form.name, customerEmail: form.email, customerPhone: form.phone, printType: cart.printType, quantity: cart.quantity, deliveryAddress: deliveryChoice === "delivery" ? form.address : null, distanceMiles: deliveryChoice === "delivery" ? distance : null, deliveryChoice, isConstructionSite: false, fileName: form.file.name, fileUrl: blob.url, notes: form.notes }) });
      const result = await response.json(); if (!response.ok) throw new Error(result.error || "Unable to submit your order.");
      localStorage.removeItem("blueprints-cart"); setSubmitted(true); if (me.user) window.setTimeout(() => router.push("/dashboard/orders"), 1800);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to submit your order."); } finally { setSubmitting(false); }
  }

  return <main className="bg-slate-50"><Navbar /><section className="pt-32 pb-20"><div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8"><div className="mb-10"><p className="eyebrow mb-2">Secure checkout</p><h1 className="font-display text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight">Finish your print order</h1><p className="text-gray-600 mt-3">Upload your file, confirm your details, and choose pickup or eligible delivery.</p></div>{submitted ? <div className="bg-green-50 border border-green-200 rounded-3xl p-14 text-center"><CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" /><h2 className="font-display text-2xl font-bold text-green-900">Order submitted</h2><p className="text-green-700 mt-2">We&apos;ll contact you within 30 minutes during business hours.</p></div> : <form onSubmit={submitOrder} className="grid lg:grid-cols-[1fr_360px] gap-8 items-start"><div className="space-y-6"><div className="bg-white rounded-3xl border border-gray-200 p-7"><div className="flex items-center gap-3 mb-6"><div className="w-10 h-10 rounded-xl bg-blueprint-50 flex items-center justify-center"><FileUp className="w-5 h-5 text-blueprint-600" /></div><div><h2 className="font-display text-xl font-bold text-gray-900">Your blueprint file</h2><p className="text-sm text-gray-500">PDF, JPG, PNG, DWG, or DXF · up to 50MB</p></div></div><div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-gray-200 rounded-2xl p-9 text-center cursor-pointer hover:border-blueprint-400 hover:bg-blueprint-50/40 transition-colors"> <input ref={fileInputRef} type="file" className="hidden" accept="image/*,.pdf,.dwg,.dxf" onChange={(event) => setForm((current) => ({ ...current, file: event.target.files?.[0] || null }))} />{form.file ? <div className="flex items-center justify-center gap-3"><CheckCircle2 className="w-8 h-8 text-green-500" /><div className="text-left"><p className="font-semibold text-gray-900">{form.file.name}</p><p className="text-sm text-gray-500">{(form.file.size / 1024 / 1024).toFixed(2)} MB</p></div><button type="button" onClick={(event) => { event.stopPropagation(); setForm((current) => ({ ...current, file: null })); }} className="p-2 text-gray-400 hover:text-red-500"><X className="w-4 h-4" /></button></div> : <><UploadCloud className="w-10 h-10 text-blueprint-400 mx-auto mb-3" /><p className="font-semibold text-gray-800">Drop your plan here or browse files</p><p className="text-sm text-gray-500 mt-1">Your file stays private and is only attached to this order.</p></>}</div></div>
      <div className="bg-white rounded-3xl border border-gray-200 p-7"><div className="flex items-center gap-3 mb-6"><div className="w-10 h-10 rounded-xl bg-blueprint-50 flex items-center justify-center"><ShieldCheck className="w-5 h-5 text-blueprint-600" /></div><div><h2 className="font-display text-xl font-bold text-gray-900">Customer details</h2><p className="text-sm text-gray-500">We use these details to confirm your order.</p></div></div><div className="grid sm:grid-cols-2 gap-4"><input required placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-xl border border-gray-200 px-4 py-3" /><input required type="email" placeholder="Email address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="rounded-xl border border-gray-200 px-4 py-3" /><input required placeholder="Phone number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="rounded-xl border border-gray-200 px-4 py-3 sm:col-span-2" /></div></div>
      <div className="bg-white rounded-3xl border border-gray-200 p-7"><div className="flex items-center gap-3 mb-6"><div className="w-10 h-10 rounded-xl bg-blueprint-50 flex items-center justify-center"><Truck className="w-5 h-5 text-blueprint-600" /></div><div><h2 className="font-display text-xl font-bold text-gray-900">Pickup or delivery</h2><p className="text-sm text-gray-500">Delivery eligibility is checked before payment.</p></div></div><div className="flex gap-3 mb-5"><button type="button" onClick={() => setDeliveryChoice("pickup")} className={`flex-1 rounded-xl border-2 px-4 py-3 text-sm font-bold ${deliveryChoice === "pickup" ? "border-blueprint-600 bg-blueprint-50 text-blueprint-700" : "border-gray-200 text-gray-600"}`}>Pickup at store</button><button type="button" disabled={!deliveryEligible} onClick={() => setDeliveryChoice("delivery")} className={`flex-1 rounded-xl border-2 px-4 py-3 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-50 ${deliveryChoice === "delivery" ? "border-blueprint-600 bg-blueprint-50 text-blueprint-700" : "border-gray-200 text-gray-600"}`}>Eligible delivery</button></div><div className="flex gap-3"><input placeholder="Delivery address" value={form.address} onChange={(e) => { setForm({ ...form, address: e.target.value }); setDistance(null); }} className="flex-1 rounded-xl border border-gray-200 px-4 py-3" /><button type="button" onClick={checkDistance} disabled={calculating} className="rounded-xl bg-blueprint-600 text-white px-4 font-bold disabled:opacity-60">{calculating ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}</button></div><button type="button" onClick={() => setUseLocation(!useLocation)} className="mt-3 text-sm text-blueprint-700 font-semibold flex items-center gap-2"><Navigation className="w-4 h-4" />{useLocation ? "Using my location" : "Use my current location"}</button>{distance !== null && <div className={`mt-4 rounded-xl p-4 text-sm ${deliveryEligible ? "bg-green-50 text-green-800" : "bg-amber-50 text-amber-900"}`}>{deliveryEligible ? <><strong>Delivery available.</strong> You are {distance} miles away and your order qualifies.</> : <><strong>Pickup recommended.</strong> You are {distance} miles away or your subtotal is below $50. Members can call +1 561-804-9110 for special delivery.</>}</div>}{!isMember && authLoaded && <div className="mt-4 rounded-xl bg-blueprint-50 p-4 text-sm text-blueprint-900"><strong>Members unlock delivery.</strong> Sign in or join the Club to access member pricing and eligible delivery.</div>}<textarea rows={3} placeholder="Special instructions (optional)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-3 mt-5 resize-none" /></div></div>
      <aside className="lg:sticky lg:top-28 bg-blueprint-950 text-white rounded-3xl p-7 shadow-xl"><div className="flex items-center gap-3 mb-7"><ShoppingCart className="w-5 h-5 text-blueprint-300" /><h2 className="font-display text-xl font-bold">Order summary</h2></div><div className="flex justify-between items-start border-b border-white/10 pb-5"><div><p className="font-semibold">{prices[cart.printType].label} Blueprints</p><p className="text-sm text-blueprint-300">24×36 · {cart.quantity} sheets</p></div><button type="button" onClick={() => updateCart(cart.quantity - 1)} className="text-blueprint-300 hover:text-white">−</button></div><div className="flex items-center gap-3 py-5"><label className="text-sm text-blueprint-200">Quantity</label><input aria-label="Quantity" type="number" min={1} max={10000} value={cart.quantity} onChange={(e) => updateCart(Number(e.target.value))} className="w-24 rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-white" /></div><div className="space-y-3 border-t border-white/10 pt-5"><div className="flex justify-between text-sm text-blueprint-200"><span>Price per sheet</span><span>${unitPrice.toFixed(2)}</span></div><div className="flex justify-between text-sm text-blueprint-200"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>{deliveryChoice === "delivery" && <div className="flex justify-between text-sm text-blueprint-200"><span>Delivery</span><span>Included</span></div>}<div className="flex justify-between border-t border-white/10 pt-4"><span className="font-bold">Total</span><span className="font-display text-3xl font-bold">${total.toFixed(2)}</span></div></div>{isMember && <p className="text-sm text-green-300 mt-5">Member pricing applied automatically.</p>}<button disabled={submitting} className="w-full mt-7 bg-white text-blueprint-900 rounded-xl py-3.5 font-bold hover:bg-blueprint-50 disabled:opacity-60">{submitting ? "Submitting..." : "Submit order"}</button>{error && <p role="alert" className="mt-4 text-sm text-red-200">{error}</p>}<div className="flex gap-2 mt-5 text-xs text-blueprint-300"><Clock3 className="w-4 h-4 flex-shrink-0" />We&apos;ll confirm production timing within 30 minutes.</div></aside></form>}</div></section><Footer /></main>;
}
