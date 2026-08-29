"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, CreditCard, Loader2, ShieldCheck } from "lucide-react";

type Props = { applicationId: string; locationId: string; environment: "production" | "sandbox" };
type Order = { id: string; order_number: string; order_group_id: string; customer_name: string; customer_email: string; total_amount: string | number; delivery_type: string | null; payment_status: string };
type SquareCard = { attach: (selector: string) => Promise<void>; tokenize: () => Promise<{ status: string; token?: string; errors?: Array<{ message?: string }> }> };
type SquarePayments = { card: () => Promise<SquareCard> };
declare global { interface Window { Square?: { payments: (applicationId: string, locationId: string) => SquarePayments } } }

export default function CheckoutClient({ applicationId, locationId, environment }: Props) {
  const [order, setOrder] = useState<Order | null>(null);
  const [total, setTotal] = useState(0);
  const [card, setCard] = useState<SquareCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get("orderId");
    const checkoutToken = params.get("token");
    if (!orderId) { setError("This checkout link is missing its order reference."); setLoading(false); return; }
    const loadSquare = new Promise<void>((resolve, reject) => {
      if (window.Square) { resolve(); return; }
      const script = document.createElement("script");
      script.src = environment === "production" ? "https://web.squarecdn.com/v1/square.js" : "https://sandbox.web.squarecdn.com/v1/square.js";
      script.onload = () => resolve(); script.onerror = () => reject(new Error("Secure payment could not be loaded.")); document.head.appendChild(script);
    });
    Promise.all([fetch(`/api/orders/${encodeURIComponent(orderId)}${checkoutToken ? `?token=${encodeURIComponent(checkoutToken)}` : ""}`).then(async (response) => { const result = await response.json(); if (!response.ok) throw new Error(result.error || "Unable to load order."); return result; }), loadSquare]).then(async ([result]) => {
      const current = result.order as Order;
      setOrder(current);
      setTotal(result.orders.reduce((sum: number, item: Order) => sum + Number(item.total_amount), 0));
      if (current.payment_status === "paid") { setComplete(true); return; }
      if (!window.Square || !applicationId || !locationId) throw new Error("Secure payment is not configured. Please contact Blueprints Club.");
      const clean = (value: string) => value.trim().replace(/^(["'])(.*)\1$/, "$2").trim();
      setLoading(false);
      await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
      const nextCard = await window.Square.payments(clean(applicationId), clean(locationId)).card();
      await nextCard.attach("#card-container");
      setCard(nextCard);
    }).catch((reason) => setError(reason instanceof Error ? reason.message : "Unable to load secure checkout.")).finally(() => setLoading(false));
  }, [applicationId, locationId, environment]);

  async function pay() {
    if (!order || !card) return;
    setBusy(true); setError("");
    try {
      const tokenResult = await card.tokenize();
      if (tokenResult.status !== "OK" || !tokenResult.token) throw new Error(tokenResult.errors?.[0]?.message || "Please check your card details.");
      const checkoutToken = new URLSearchParams(window.location.search).get("token");
      const response = await fetch(`/api/orders/${encodeURIComponent(order.id)}/pay`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sourceId: tokenResult.token, checkoutToken }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Payment could not be completed.");
      if (!result.paid) throw new Error("Payment is still being confirmed. Please contact Blueprints Club if the amount was charged.");
      setComplete(true);
      window.location.assign(`/order/success?reference=${encodeURIComponent(result.orderReference)}`);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Payment could not be completed."); }
    finally { setBusy(false); }
  }

  return <main className="min-h-screen bg-slate-50 text-gray-900"><header className="border-b border-gray-200 bg-white"><div className="max-w-6xl mx-auto px-5 py-5 flex items-center justify-between"><Link href="/" className="font-display text-2xl font-bold tracking-tight text-blueprint-950"><span className="text-blueprint-600">BLUE</span>PRINTS <span className="block text-[9px] tracking-[0.35em] text-gray-500">CLUB.COM</span></Link><div className="flex items-center gap-2 text-sm text-gray-500"><ShieldCheck className="w-4 h-4 text-green-600" />Secure checkout</div></div></header><div className="max-w-5xl mx-auto px-5 py-10"><Link href="/order" className="inline-flex items-center gap-2 text-sm font-semibold text-blueprint-700 hover:text-blueprint-950"><ArrowLeft className="w-4 h-4" />Back to order</Link><div className="grid lg:grid-cols-[1fr_340px] gap-8 mt-6 items-start"><section className="bg-white rounded-3xl border border-gray-200 p-7 shadow-sm"><p className="eyebrow">Blueprints Club checkout</p><h1 className="font-display text-4xl font-bold mt-2">Complete your payment</h1><p className="text-gray-600 mt-3">Your order is saved. Payment is processed securely by Square.</p>{loading && <div className="py-16 text-center text-gray-500"><Loader2 className="w-8 h-8 mx-auto animate-spin text-blueprint-600" /><p className="mt-3">Loading secure payment...</p></div>}{!loading && !complete && <><div className="mt-8 rounded-2xl border border-blueprint-100 bg-blueprint-50 p-5"><div className="flex items-center gap-3"><CreditCard className="w-5 h-5 text-blueprint-700" /><div><h2 className="font-bold">Card details</h2><p className="text-sm text-gray-600">Your card information is handled inside Square’s secure payment field.</p></div></div><div id="card-container" className="mt-5 min-h-28" /></div><button type="button" onClick={pay} disabled={!card || busy} className="w-full mt-6 rounded-xl bg-blueprint-700 text-white py-4 font-bold hover:bg-blueprint-800 disabled:opacity-50">{busy ? <span className="inline-flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Processing securely...</span> : `Pay $${total.toFixed(2)}`}</button></>}{complete && <div className="py-12 text-center"><CheckCircle2 className="w-14 h-14 mx-auto text-green-500" /><h2 className="font-display text-2xl font-bold mt-4">Payment confirmed</h2><p className="text-gray-600 mt-2">Your order confirmation is being prepared.</p></div>}{error && <p role="alert" className="mt-5 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">{error}</p>}</section><aside className="bg-blueprint-950 text-white rounded-3xl p-7 shadow-xl lg:sticky lg:top-8"><p className="text-blueprint-300 text-xs uppercase tracking-[0.2em]">Order summary</p><h2 className="font-display text-2xl font-bold mt-2">{order?.order_number || "Your order"}</h2><div className="border-t border-white/10 mt-6 pt-5 space-y-3 text-sm"><div className="flex justify-between"><span className="text-blueprint-200">Customer</span><span>{order?.customer_name || "—"}</span></div><div className="flex justify-between"><span className="text-blueprint-200">Fulfillment</span><span>{order?.delivery_type === "delivery" ? "Delivery" : "Pickup"}</span></div></div><div className="border-t border-white/10 mt-6 pt-5 flex justify-between items-end"><span className="font-bold">Total</span><span className="font-display text-3xl font-bold">${total.toFixed(2)}</span></div><p className="text-xs text-blueprint-300 mt-5">Payment is required before production begins. A receipt will be emailed after payment clears.</p></aside></div></div></main>;
}
