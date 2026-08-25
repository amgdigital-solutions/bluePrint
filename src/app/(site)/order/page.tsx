"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { upload } from "@vercel/blob/client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { CheckCircle2, Clock3, FileUp, Loader2, MapPin, Plus, ShoppingCart, ShieldCheck, Truck, UploadCloud, X } from "lucide-react";

const prices = { bw: { regular: 2.99, member: 1.99, label: "Black & White" }, color: { regular: 6.95, member: 5.95, label: "Color" } } as const;
type PrintType = keyof typeof prices;
type CartItem = { printType: PrintType; quantity: number };
type UploadItem = { id: string; file: File; pageCount: number; sets: number; printType: PrintType };

async function detectPageCount(file: File) {
  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) return 1;
  const text = new TextDecoder("latin1").decode(new Uint8Array(await file.arrayBuffer()));
  return Math.max(1, text.match(/\/Type\s*\/Page\b/g)?.length || 1);
}

export default function OrderPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [files, setFiles] = useState<UploadItem[]>([]);
  const [member, setMember] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", notes: "" });
  const [distance, setDistance] = useState<number | null>(null);
  const [delivery, setDelivery] = useState<"pickup" | "delivery">("pickup");
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("blueprints-cart") || "null");
      if (Array.isArray(saved)) setCart(saved);
      else if (saved?.printType) setCart([{ printType: saved.printType, quantity: Number(saved.quantity) || 1 }]);
    } catch { /* use empty cart */ }
    fetch("/api/profile").then(async (response) => {
      if (!response.ok) return;
      const profile = (await response.json()).profile;
      setMember(profile.is_member === true);
      setForm((current) => ({ ...current, name: profile.full_name || "", email: profile.email || "", phone: profile.phone || "", address: profile.address || "" }));
    }).finally(() => setProfileLoaded(true));
  }, []);

  const priceFor = (type: PrintType) => member ? prices[type].member : prices[type].regular;
  const fileCart = (Object.keys(prices) as PrintType[]).map((printType) => ({ printType, quantity: files.filter((file) => file.printType === printType).reduce((sum, file) => sum + file.pageCount * file.sets, 0) })).filter((item) => item.quantity > 0);
  const checkoutCart = files.length ? fileCart : cart;
  const subtotal = Number(checkoutCart.reduce((sum, item) => sum + item.quantity * priceFor(item.printType), 0).toFixed(2));
  const eligibleDelivery = member && subtotal >= 50 && distance !== null && distance <= 10;
  const saveCart = (next: CartItem[]) => { setCart(next); localStorage.setItem("blueprints-cart", JSON.stringify(next)); };
  const addProduct = (type: PrintType) => { const existing = cart.find((item) => item.printType === type); saveCart(existing ? cart.map((item) => item.printType === type ? { ...item, quantity: item.quantity + 1 } : item) : [...cart, { printType: type, quantity: 1 }]); };
  const removeProduct = (type: PrintType) => saveCart(cart.filter((item) => item.printType !== type));
  const changeQuantity = (type: PrintType, quantity: number) => saveCart(cart.map((item) => item.printType === type ? { ...item, quantity: Math.max(1, Math.min(10000, quantity || 1)) } : item));
  const updateFile = (id: string, changes: Partial<UploadItem>) => setFiles((current) => current.map((item) => item.id === id ? { ...item, ...changes } : item));

  async function addFiles(selected: FileList | null) {
    if (!selected?.length) return;
    setBusy(true); setError("");
    try {
      const additions = await Promise.all(Array.from(selected).map(async (file) => ({ id: crypto.randomUUID(), file, pageCount: await detectPageCount(file), sets: 1, printType: "bw" as PrintType })));
      setFiles((current) => [...current, ...additions].slice(0, 20));
    } catch { setError("We could not read one of those files. Please try again."); }
    finally { setBusy(false); }
  }

  async function checkDistance() {
    setError("");
    if (!form.address.trim()) { setError("Enter a delivery address first."); return; }
    setBusy(true);
    try {
      const response = await fetch("/api/distance", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ address: form.address }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setDistance(result.distance);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to calculate distance."); }
    finally { setBusy(false); }
  }

  async function submitOrder(event: React.FormEvent) {
    event.preventDefault(); setError("");
    if (!cart.length) { setError("Choose at least one blueprint product first."); return; }
    if (!files.length) { setError("Please upload at least one blueprint file."); return; }
    if (delivery === "delivery" && !eligibleDelivery) { setError("Delivery is available to members on $50+ orders within 10 miles. Please choose pickup or call us for special delivery."); return; }
    setBusy(true);
    try {
      const meResponse = await fetch("/api/auth/me");
      const me = meResponse.ok ? await meResponse.json() : { user: null };
      const uploadedFiles = [];
      for (const item of files) {
        const safeName = item.file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const path = me.user ? `orders/${me.user.id}/${crypto.randomUUID()}-${safeName}` : `orders/guest/${crypto.randomUUID()}-${safeName}`;
        const blob = await upload(path, item.file, { access: "private", handleUploadUrl: "/api/upload" });
        uploadedFiles.push({ fileName: item.file.name, fileUrl: blob.url, printType: item.printType, pageCount: item.pageCount, sets: item.sets });
      }
      const response = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ customerName: form.name, customerEmail: form.email, customerPhone: form.phone, items: cart, files: uploadedFiles, deliveryAddress: delivery === "delivery" ? form.address : null, distanceMiles: delivery === "delivery" ? distance : null, deliveryChoice: delivery, notes: form.notes }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to submit your order.");
      localStorage.removeItem("blueprints-cart"); setSubmitted(true);
      if (me.user) window.setTimeout(() => router.push("/dashboard/orders"), 1800);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to submit your order."); }
    finally { setBusy(false); }
  }

  return <main className="bg-slate-50"><Navbar /><section className="pt-32 pb-20"><div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
    <p className="eyebrow mb-2">Cart & checkout</p><h1 className="font-display text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight">Build your print order</h1><p className="text-gray-600 mt-3 mb-10">Upload each blueprint, choose its print mode, and tell us how many sets you need.</p>
    {submitted ? <div className="bg-green-50 border border-green-200 rounded-3xl p-14 text-center"><CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" /><h2 className="font-display text-2xl font-bold text-green-900">Order submitted</h2><p className="text-green-700 mt-2">We&apos;ll contact you within 30 minutes.</p></div> : <form onSubmit={submitOrder} className="grid lg:grid-cols-[1fr_360px] gap-8 items-start">
      <div className="space-y-6">
        {!cart.length && <section className="bg-white rounded-3xl border border-gray-200 p-7"><h2 className="font-display text-xl font-bold text-gray-900">Choose your products</h2><p className="text-sm text-gray-500 mt-1 mb-6">Select B&W, Color, or both.</p><div className="grid sm:grid-cols-2 gap-4">{(Object.keys(prices) as PrintType[]).map((type) => <button type="button" key={type} onClick={() => addProduct(type)} className="text-left rounded-2xl border-2 border-gray-200 p-5 hover:border-blueprint-500 hover:bg-blueprint-50 transition-colors"><p className="font-display text-lg font-bold text-gray-900">{prices[type].label} Blueprints</p><p className="text-sm text-gray-500 mt-1">24×36 standard</p><p className="text-blueprint-700 font-bold mt-4">From ${prices[type].regular.toFixed(2)} / sheet</p><span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-blueprint-700"><Plus className="w-4 h-4" />Add product</span></button>)}</div></section>}
        {cart.length > 0 && <section className="bg-white rounded-3xl border border-gray-200 p-7"><div className="flex justify-between items-center mb-6"><div><p className="eyebrow mb-1">Your cart</p><h2 className="font-display text-xl font-bold text-gray-900">Print products</h2></div><button type="button" onClick={() => saveCart([])} className="text-sm text-gray-500 hover:text-red-600">Clear cart</button></div><div className="space-y-3">{cart.map((item) => <div key={item.printType} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4"><div className="w-12 h-12 rounded-xl bg-blueprint-950 text-white flex items-center justify-center text-xs font-bold">{item.printType === "bw" ? "B&W" : "COLOR"}</div><div className="flex-1"><p className="font-semibold text-gray-900">{prices[item.printType].label} Blueprints</p><p className="text-sm text-green-600">{member ? "Member pricing applies per sheet" : "Standard pricing applies per sheet"}</p></div><input aria-label={`${prices[item.printType].label} quantity`} type="number" min={1} max={10000} value={item.quantity} onChange={(e) => changeQuantity(item.printType, Number(e.target.value))} className="w-20 rounded-lg border border-gray-200 px-2 py-2" /><button type="button" aria-label={`Remove ${prices[item.printType].label}`} onClick={() => removeProduct(item.printType)} className="p-2 text-gray-400 hover:text-red-600"><X className="w-4 h-4" /></button></div>)}</div><div className="flex gap-4 mt-5"><button type="button" onClick={() => addProduct("bw")} className="text-sm font-bold text-blueprint-700">+ Add B&W</button><button type="button" onClick={() => addProduct("color")} className="text-sm font-bold text-blueprint-700">+ Add Color</button></div></section>}
        {cart.length > 0 && <><section className="bg-white rounded-3xl border border-gray-200 p-7"><div className="flex items-center gap-3 mb-2"><FileUp className="w-5 h-5 text-blueprint-600" /><div><h2 className="font-display text-xl font-bold text-gray-900">Blueprint files</h2><p className="text-sm text-gray-500">Add up to 20 PDF, JPG, PNG, DWG, or DXF files. PDF pages are counted automatically.</p></div></div><input ref={fileInputRef} type="file" className="hidden" multiple accept="image/*,.pdf,.dwg,.dxf" onChange={(e) => { void addFiles(e.target.files); e.currentTarget.value = ""; }} /><button type="button" onClick={() => fileInputRef.current?.click()} className="w-full border-2 border-dashed border-gray-200 rounded-2xl p-7 text-center hover:border-blueprint-400 transition-colors"><UploadCloud className="w-10 h-10 text-blueprint-400 mx-auto mb-3" /><p className="font-semibold text-gray-800">Add blueprint files</p><p className="text-sm text-gray-500 mt-1">Each row below is priced by pages × sets.</p></button>{files.length > 0 && <div className="space-y-3 mt-5">{files.map((item) => <div key={item.id} className="rounded-2xl bg-slate-50 border border-gray-200 p-4"><div className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-green-500 mt-1" /><div className="min-w-0 flex-1"><p className="font-semibold text-gray-900 truncate">{item.file.name}</p><p className="text-xs text-gray-500 mt-1">{(item.file.size / 1024 / 1024).toFixed(2)} MB · {item.pageCount} page{item.pageCount === 1 ? "" : "s"} detected</p></div><button type="button" aria-label={`Remove ${item.file.name}`} onClick={() => setFiles((current) => current.filter((file) => file.id !== item.id))} className="p-1 text-gray-400 hover:text-red-600"><X className="w-4 h-4" /></button></div><div className="grid grid-cols-2 gap-3 mt-4"><label className="text-xs font-semibold text-gray-600">Print mode<select value={item.printType} onChange={(e) => updateFile(item.id, { printType: e.target.value as PrintType })} className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"><option value="bw">Black & White</option><option value="color">Color</option></select></label><label className="text-xs font-semibold text-gray-600">Sets<select value={item.sets} onChange={(e) => updateFile(item.id, { sets: Math.max(1, Math.min(10000, Number(e.target.value) || 1)) })} className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm">{Array.from({ length: 10 }, (_, index) => <option key={index + 1} value={index + 1}>{index + 1} set{index ? "s" : ""}</option>)}</select></label></div><p className="text-xs text-blueprint-700 font-semibold mt-3">{item.pageCount} pages × {item.sets} set{item.sets === 1 ? "" : "s"} = {item.pageCount * item.sets} sheets</p></div>)}</div>}</section><section className="bg-white rounded-3xl border border-gray-200 p-7"><div className="flex items-center gap-3 mb-6"><ShieldCheck className="w-5 h-5 text-blueprint-600" /><div><h2 className="font-display text-xl font-bold text-gray-900">Customer details</h2><p className="text-sm text-gray-500">Used to confirm your order.</p></div></div><div className="grid sm:grid-cols-2 gap-4"><input required placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-xl border border-gray-200 px-4 py-3" /><input required type="email" placeholder="Email address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="rounded-xl border border-gray-200 px-4 py-3" /><input required placeholder="Phone number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="rounded-xl border border-gray-200 px-4 py-3 sm:col-span-2" /></div></section><section className="bg-white rounded-3xl border border-gray-200 p-7"><div className="flex items-center gap-3 mb-6"><Truck className="w-5 h-5 text-blueprint-600" /><div><h2 className="font-display text-xl font-bold text-gray-900">Pickup or delivery</h2><p className="text-sm text-gray-500">Members need $50+ and a 10-mile radius.</p></div></div><div className="flex gap-3 mb-5"><button type="button" onClick={() => setDelivery("pickup")} className={`flex-1 rounded-xl border-2 px-4 py-3 text-sm font-bold ${delivery === "pickup" ? "border-blueprint-600 bg-blueprint-50 text-blueprint-700" : "border-gray-200 text-gray-600"}`}>Pickup at store</button><button type="button" disabled={!eligibleDelivery} onClick={() => setDelivery("delivery")} className={`flex-1 rounded-xl border-2 px-4 py-3 text-sm font-bold disabled:opacity-50 ${delivery === "delivery" ? "border-blueprint-600 bg-blueprint-50 text-blueprint-700" : "border-gray-200 text-gray-600"}`}>Eligible delivery</button></div><div className="flex gap-3"><input placeholder="Delivery address" value={form.address} onChange={(e) => { setForm({ ...form, address: e.target.value }); setDistance(null); }} className="flex-1 rounded-xl border border-gray-200 px-4 py-3" /><button type="button" onClick={checkDistance} disabled={busy} className="rounded-xl bg-blueprint-600 text-white px-4 disabled:opacity-60">{busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}</button></div>{distance !== null && <p className={`mt-4 rounded-xl p-4 text-sm ${eligibleDelivery ? "bg-green-50 text-green-800" : "bg-amber-50 text-amber-900"}`}>{eligibleDelivery ? `Delivery available — ${distance} miles away.` : `Pickup recommended — ${distance} miles away or subtotal is below $50. Call +1 561-804-9110 for special delivery.`}</p>}{!member && profileLoaded && <p className="mt-4 rounded-xl bg-blueprint-50 p-4 text-sm text-blueprint-900"><strong>Members unlock delivery and lower pricing.</strong> Sign in or join the Club.</p>}<textarea rows={3} placeholder="Special instructions (optional)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-3 mt-5 resize-none" /></section></>}
      </div>
      <aside className="lg:sticky lg:top-28 bg-blueprint-950 text-white rounded-3xl p-7 shadow-xl"><div className="flex items-center gap-3 mb-7"><ShoppingCart className="w-5 h-5 text-blueprint-300" /><h2 className="font-display text-xl font-bold">Order summary</h2></div>{checkoutCart.length ? <><div className="space-y-3 border-b border-white/10 pb-5">{checkoutCart.map((item) => <div key={item.printType} className="flex justify-between text-sm"><span className="text-blueprint-200">{item.quantity}× {prices[item.printType].label}</span><span>${(item.quantity * priceFor(item.printType)).toFixed(2)}</span></div>)}</div><div className="flex justify-between pt-5"><span className="font-bold">Total</span><span className="font-display text-3xl font-bold">${subtotal.toFixed(2)}</span></div>{member && <p className="text-sm text-green-300 mt-5">Member pricing applied automatically.</p>}<button disabled={busy} className="w-full mt-7 bg-white text-blueprint-900 rounded-xl py-3.5 font-bold disabled:opacity-60">{busy ? "Uploading..." : "Submit order"}</button></> : <div className="text-center py-8"><ShoppingCart className="w-10 h-10 text-blueprint-300 mx-auto mb-3" /><p className="text-blueprint-200 text-sm">Your cart is empty.</p><button type="button" onClick={() => router.push("/products")} className="mt-4 text-sm font-bold text-white underline">Browse products</button></div>}{error && <p role="alert" className="mt-4 text-sm text-red-200">{error}</p>}<div className="flex gap-2 mt-5 text-xs text-blueprint-300"><Clock3 className="w-4 h-4" />We&apos;ll confirm timing within 30 minutes.</div></aside>
    </form>}
  </div></section><Footer /></main>;
}
