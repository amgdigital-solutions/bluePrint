import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function OrderPaymentSuccessPage() {
  return (
    <main className="bg-slate-50 min-h-screen">
      <Navbar />
      <section className="pt-36 pb-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="bg-green-50 border border-green-200 rounded-3xl p-10 sm:p-14 text-center">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="font-display text-3xl font-bold text-green-950">Payment received</h1>
            <p className="text-green-800 mt-3">Square is confirming your payment. We will email your receipt and order confirmation as soon as it clears.</p>
            <p className="text-sm text-green-700 mt-3">Production timing is confirmed separately based on workload and order complexity.</p>
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              <Link href="/dashboard/orders" className="rounded-xl bg-blueprint-700 px-5 py-3 text-white font-semibold">View my orders</Link>
              <Link href="/" className="rounded-xl border border-green-300 bg-white px-5 py-3 text-green-900 font-semibold">Back to home</Link>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
