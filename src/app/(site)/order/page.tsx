"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { upload } from "@vercel/blob/client";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { CheckCircle2, Clock3, FileUp, Loader2, MapPin, ShoppingCart, ShieldCheck, Truck, UploadCloud, X } from "lucide-react";

const prices = { bw: { regular: 2.99, member: 1.99, label: "Black & White" }, color: { regular: 6.95, member: 5.95, label: "Color" } } as const;
type PrintType = keyof typeof prices;
type UploadItem = { id: string; file: File; pageCount: number; sets: number; printType: PrintType };

async function analyzePdf(file: File) {
  const text = new TextDecoder("latin1").decode(new Uint8Array(await file.arrayBuffer()));
  return { pageCount: Math.max(1, text.match(/\/Type\s*\/Page\b/g)?.length || 1), printType: /\/DeviceRGB|\/DeviceCMYK|\/CalRGB|\/ICCBased|\/Indexed|\b(?:rg|RG|sc|SC)\b/.test(text) ? "color" as PrintType : "bw" as PrintType };
}

export default function OrderPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pickupAddress = "5001 S Dixie Hwy, West Palm Beach, FL 33405, United States";
  const [files, setFiles] = useState<UploadItem[]>([]);
  const [member, setMember] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [profileAddress, setProfileAddress] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", notes: "" });
  const [distance, setDistance] = useState<number | null>(null);
  const [delivery, setDelivery] = useState<"pickup" | "delivery">("pickup");
  const [addressMode, setAddressMode] = useState<"profile" | "alternate">("profile");
  const [printConsent, setPrintConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function checkDistanceFor(address: string) {
    const response = await fetch("/api/distance", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ address }) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Unable to calculate distance.");
    setDistance(result.distance);
    return result.distance as number;
  }

  useEffect(() => {
    fetch("/api/profile").then(async (response) => {
      if (!response.ok) return;
      const profile = (await response.json()).profile;
      const isMember = profile.is_member === true;
      const savedAddress = profile.address || "";
      setMember(isMember); setProfileAddress(savedAddress); setAddressMode(isMember && savedAddress ? "profile" : "alternate");
      setForm((current) => ({ ...current, name: profile.full_name || "", email: profile.email || "", phone: profile.phone || "", address: savedAddress }));
      if (isMember && savedAddress) void checkDistanceFor(savedAddress);
    }).finally(() => setProfileLoaded(true));
  }, []);

  const priceFor = (type: PrintType) => member ? prices[type].member : prices[type].regular;
  const checkoutCart = (Object.keys(prices) as PrintType[]).map((printType) => ({ printType, quantity: files.filter((file) => file.printType === printType).reduce((sum, file) => sum + file.pageCount * file.sets, 0) })).filter((item) => item.quantity > 0);
  const subtotal = Number(checkoutCart.reduce((sum, item) => sum + item.quantity * priceFor(item.printType), 0).toFixed(2));
  const deliveryFee = delivery === "delivery" && (!member || addressMode === "alternate") ? 15 : 0;
  const grandTotal = Number((subtotal + deliveryFee).toFixed(2));
  const eligibleDelivery = Boolean(form.address.trim()) && distance !== null && distance <= 10 && (!member || subtotal >= 50);
  const updateFile = (id: string, changes: Partial<UploadItem>) => setFiles((current) => current.map((item) => item.id === id ? { ...item, ...changes } : item));

  async function addFiles(selected: FileList | null) {
    if (!selected?.length) return;
    setBusy(true); setError("");
    try {
      const invalid = Array.from(selected).find((file) => file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf"));
      if (invalid) throw new Error("PDF files only. For DWG, DXF, JPG, PNG, or other formats, email info@blueprintsclub.com; extra preparation charges may apply.");
      const additions = await Promise.all(Array.from(selected).map(async (file) => { const analyzed = await analyzePdf(file); return { id: crypto.randomUUID(), file, ...analyzed, sets: 1 }; }));
      setFiles((current) => [...current, ...additions].slice(0, 20));
    } catch (reason) { setError(reason instanceof Error ? reason.message : "We could not analyze one of those files. Please try again."); }
    finally { setBusy(false); }
  }

  async function checkDistance() {
    setError("");
    if (!form.address.trim()) { setError("Enter a delivery address first."); return; }
    setBusy(true);
    try { await checkDistanceFor(form.address); }
    catch (reason) { setDistance(null); setError(reason instanceof Error ? reason.message : "Unable to calculate distance."); }
    finally { setBusy(false); }
  }

  async function submitOrder(event: React.FormEvent) {
    event.preventDefault(); setError("");
    if (!files.length) { setError("Please upload at least one PDF blueprint file."); return; }
    if (!printConsent) { setError("Please confirm the print-mode consent before submitting your order."); return; }
    if (delivery === "delivery" && !eligibleDelivery) { setError(member ? "Member delivery requires a $50+ subtotal and an address within 10 miles." : "Delivery requires an address within 10 miles. Please check your address or choose pickup."); return; }
    setBusy(true);
    try {
      const meResponse = await fetch("/api/auth/me");
      const me = meResponse.ok ? await meResponse.json() : { user: null };
      const uploadedFiles = [];
      for (const item of files) { const safeName = item.file.name.replace(/[^a-zA-Z0-9._-]/g, "_"); const path = me.user ? `orders/${me.user.id}/${crypto.randomUUID()}-${safeName}` : `orders/guest/${crypto.randomUUID()}-${safeName}`; const blob = await upload(path, item.file, { access: "private", handleUploadUrl: "/api/upload" }); uploadedFiles.push({ fileName: item.file.name, fileUrl: blob.url, printType: item.printType, pageCount: item.pageCount, sets: item.sets }); }
      const response = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ customerName: form.name, customerEmail: form.email, customerPhone: form.phone, files: uploadedFiles, printConsentAccepted: printConsent, deliveryAddress: delivery === "delivery" ? form.address : null, alternateDeliveryAddress: member && addressMode === "alternate", distanceMiles: delivery === "delivery" ? distance : null, deliveryChoice: delivery, notes: form.notes }) });
      const result = await response.json(); if (!response.ok) throw new Error(result.error || "Unable to submit your order.");
      setSubmitted(true); if (me.user) window.setTimeout(() => router.push("/dashboard/orders"), 1800);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to submit your order."); }
    finally { setBusy(false); }
  }

  return <main className="bg-slate-50"><Navbar /><section className="pt-32 pb-20"><div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8"><div className="flex items-center justify-between mb-5"><p className="eyebrow">Checkout</p><Link href="/" className="text-sm font-semibold text-blueprint-700 hover:text-blueprint-900">← Back to home</Link></div><h1 className="font-display text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight">Upload your blueprint files</h1><p className="text-gray-600 mt-3 mb-10">Every uploaded PDF becomes part of your order. We count pages and suggest the print mode automatically.</p>
    {submitted ? <div className="bg-green-50 border border-green-200 rounded-3xl p-14 text-center"><CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" /><h2 className="font-display text-2xl font-bold text-green-900">Order submitted</h2><p className="text-green-700 mt-2">We&apos;ll confirm timing based on workload and order complexity.</p></div> : <form onSubmit={submitOrder} className="grid lg:grid-cols-[1fr_360px] gap-8 items-start"><div className="space-y-6">
      <section className="bg-white rounded-3xl border border-gray-200 p-7"><div className="flex items-center gap-3 mb-2"><FileUp className="w-5 h-5 text-blueprint-600" /><div><h2 className="font-display text-xl font-bold text-gray-900">Blueprint PDF files</h2><p className="text-sm text-gray-500">PDF files only. Pages are counted automatically. For DWG, DXF, JPG, PNG, or other formats, email info@blueprintsclub.com; extra preparation charges may apply.</p></div></div><input ref={fileInputRef} type="file" className="hidden" multiple accept="application/pdf,.pdf" onChange={(event) => { void addFiles(event.target.files); event.currentTarget.value = ""; }} /><button type="button" onClick={() => fileInputRef.current?.click()} className="w-full border-2 border-dashed border-gray-200 rounded-2xl p-7 text-center hover:border-blueprint-400 transition-colors"><UploadCloud className="w-10 h-10 text-blueprint-400 mx-auto mb-3" /><p className="font-semibold text-gray-800">Add PDF files</p><p className="text-sm text-gray-500 mt-1">Each row is priced by pages × sets.</p></button>{files.length > 0 && <div className="space-y-3 mt-5">{files.map((item) => <div key={item.id} className="rounded-2xl bg-slate-50 border border-gray-200 p-4"><div className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-green-500 mt-1" /><div className="min-w-0 flex-1"><p className="font-semibold text-gray-900 truncate">{item.file.name}</p><p className="text-xs text-gray-500 mt-1">{(item.file.size / 1024 / 1024).toFixed(2)} MB · {item.pageCount} page{item.pageCount === 1 ? "" : "s"} · suggested {prices[item.printType].label}</p></div><button type="button" aria-label={`Remove ${item.file.name}`} onClick={() => setFiles((current) => current.filter((file) => file.id !== item.id))} className="p-1 text-gray-400 hover:text-red-600"><X className="w-4 h-4" /></button></div><div className="grid grid-cols-2 gap-3 mt-4"><label className="text-xs font-semibold text-gray-600">Print mode<select value={item.printType} onChange={(event) => updateFile(item.id, { printType: event.target.value as PrintType })} className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"><option value="bw">Black & White</option><option value="color">Color</option></select></label><label className="text-xs font-semibold text-gray-600">Sets<select value={item.sets} onChange={(event) => updateFile(item.id, { sets: Math.max(1, Math.min(10000, Number(event.target.value) || 1)) })} className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm">{Array.from({ length: 10 }, (_, index) => <option key={index + 1} value={index + 1}>{index + 1} set{index ? "s" : ""}</option>)}</select></label></div><p className="text-xs text-blueprint-700 font-semibold mt-3">{item.pageCount} pages × {item.sets} set{item.sets === 1 ? "" : "s"} = {item.pageCount * item.sets} sheets</p></div>)}</div>}</section>
      {!member && profileLoaded && <section className="bg-white rounded-3xl border border-gray-200 p-7"><div className="flex items-center gap-3 mb-3"><ShieldCheck className="w-5 h-5 text-blueprint-600" /><div><h2 className="font-display text-xl font-bold text-gray-900">Customer details</h2><p className="text-sm text-gray-500">Enter your details to submit this order without membership.</p></div></div><div className="grid sm:grid-cols-2 gap-4"><input required placeholder="Full name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="rounded-xl border border-gray-200 px-4 py-3" /><input required type="email" placeholder="Email address" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="rounded-xl border border-gray-200 px-4 py-3" /><input required placeholder="Phone number" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} className="rounded-xl border border-gray-200 px-4 py-3 sm:col-span-2" /></div></section>}
      <section className="bg-white rounded-3xl border border-gray-200 p-7"><div className="flex items-center gap-3 mb-6"><Truck className="w-5 h-5 text-blueprint-600" /><div><h2 className="font-display text-xl font-bold text-gray-900">Pickup or delivery</h2><p className="text-sm text-gray-500">Members: free delivery on $50+ orders within 10 miles. Non-members: $15 delivery fee within 10 miles.</p></div></div><div className="flex gap-3 mb-5"><button type="button" onClick={() => setDelivery("pickup")} className={`flex-1 rounded-xl border-2 px-4 py-3 text-sm font-bold ${delivery === "pickup" ? "border-blueprint-600 bg-blueprint-50 text-blueprint-700" : "border-gray-200 text-gray-600"}`}>Pickup at store</button><button type="button" disabled={!eligibleDelivery} onClick={() => setDelivery("delivery")} className={`flex-1 rounded-xl border-2 px-4 py-3 text-sm font-bold disabled:opacity-50 ${delivery === "delivery" ? "border-blueprint-600 bg-blueprint-50 text-blueprint-700" : "border-gray-200 text-gray-600"}`}>Eligible delivery</button></div>{member && <div className="flex gap-2 mb-4"><button type="button" onClick={() => { setAddressMode("profile"); setForm((current) => ({ ...current, address: profileAddress })); setDistance(null); if (profileAddress) void checkDistanceFor(profileAddress); }} className={`flex-1 rounded-xl border-2 px-3 py-2 text-sm font-bold ${addressMode === "profile" ? "border-blueprint-600 bg-blueprint-50 text-blueprint-700" : "border-gray-200 text-gray-600"}`}>Use saved address</button><button type="button" onClick={() => { setAddressMode("alternate"); setForm((current) => ({ ...current, address: "" })); setDistance(null); }} className={`flex-1 rounded-xl border-2 px-3 py-2 text-sm font-bold ${addressMode === "alternate" ? "border-blueprint-600 bg-blueprint-50 text-blueprint-700" : "border-gray-200 text-gray-600"}`}>Another address (+$15)</button></div>}{member && addressMode === "profile" && <p className="text-xs text-gray-500 mb-3">Saved member address: {form.address || "No address saved in profile"}</p>}<div className="flex gap-3"><input readOnly={member && addressMode === "profile" && Boolean(profileAddress)} placeholder={member && addressMode === "profile" ? "Saved profile address" : "Delivery address"} value={form.address} onChange={(event) => { setForm({ ...form, address: event.target.value }); setDistance(null); }} className={`flex-1 rounded-xl border border-gray-200 px-4 py-3 ${member && addressMode === "profile" ? "bg-gray-50" : ""}`} /><button type="button" onClick={checkDistance} disabled={busy || !form.address.trim()} className="rounded-xl bg-blueprint-600 text-white px-4 disabled:opacity-60">{busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}</button></div>{member && addressMode === "alternate" && <p className="text-xs text-amber-700 mt-2">An alternate delivery address adds $15 and must still be within 10 miles.</p>}{!member && <p className="text-xs text-blueprint-700 mt-2">Non-members can order delivery within 10 miles for a $15 delivery fee.</p>}{distance !== null && <p className={`mt-4 rounded-xl p-4 text-sm ${eligibleDelivery ? "bg-green-50 text-green-800" : "bg-amber-50 text-amber-900"}`}>{eligibleDelivery ? `Delivery available — ${distance} miles away${deliveryFee ? " · $15 delivery fee" : ""}.` : `Delivery is unavailable at ${distance} miles or because the subtotal is below $50. Choose pickup or call +1 561-804-9110.`}</p>}<textarea rows={3} placeholder="Special instructions (optional)" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-3 mt-5 resize-none" /></section>
      <label className="flex gap-3 items-start rounded-2xl border border-blueprint-100 bg-blueprint-50 p-4 text-sm text-blueprint-950"><input type="checkbox" checked={printConsent} onChange={(event) => setPrintConsent(event.target.checked)} className="mt-1 h-4 w-4 accent-blueprint-600" /><span>I confirm that the B&amp;W or Color selection for each document is accurate. I understand Blueprints Club may contact me and charge the price difference if the selected mode does not match the uploaded file.</span></label>
    </div><aside className="lg:sticky lg:top-28 bg-blueprint-950 text-white rounded-3xl p-7 shadow-xl"><div className="flex items-center gap-3 mb-7"><ShoppingCart className="w-5 h-5 text-blueprint-300" /><h2 className="font-display text-xl font-bold">Order summary</h2></div>{checkoutCart.length ? <><div className="space-y-3 border-b border-white/10 pb-5">{checkoutCart.map((item) => <div key={item.printType} className="flex justify-between text-sm"><span className="text-blueprint-200">{item.quantity}× {prices[item.printType].label}</span><span>${(item.quantity * priceFor(item.printType)).toFixed(2)}</span></div>)}{deliveryFee > 0 && <div className="flex justify-between text-sm"><span className="text-blueprint-200">Delivery fee</span><span>$15.00</span></div>}</div><div className="flex justify-between pt-5"><span className="font-bold">Total</span><span className="font-display text-3xl font-bold">${grandTotal.toFixed(2)}</span></div>{member && <p className="text-sm text-green-300 mt-5">Member pricing applied automatically.</p>}<button disabled={busy} className="w-full mt-7 bg-white text-blueprint-900 rounded-xl py-3.5 font-bold disabled:opacity-60">{busy ? "Uploading..." : "Submit order"}</button></> : <div className="text-center py-8"><ShoppingCart className="w-10 h-10 text-blueprint-300 mx-auto mb-3" /><p className="text-blueprint-200 text-sm">Upload PDF files to build your order.</p></div>}{error && <p role="alert" className="mt-4 text-sm text-red-200">{error}</p>}<div className="flex gap-2 mt-5 text-xs text-blueprint-300"><Clock3 className="w-4 h-4" />Timing is confirmed based on workload and order complexity.</div></aside></form>}
  </div></section><Footer /></main>;
}
