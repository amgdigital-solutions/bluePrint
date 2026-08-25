"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Crown, Zap, Truck, Clock, Shield, Printer, AlertTriangle, MapPin, UserRound } from "lucide-react";

const plans = [
  { name: "Monthly Club", tier: "monthly", price: 39, period: "month", detail: "First month free · 6-month commitment", popular: false },
  { name: "6-Month Club", tier: "6month", price: 37.50, period: "month", detail: "$225 total · billed every 6 months", popular: true },
  { name: "Annual Club", tier: "yearly", price: 36.25, period: "month", detail: "$435 total · billed annually", popular: false },
];

const benefits = [
  { icon: Zap, title: "Rush Prints", desc: "Expedite/priority printing on call. Skip the queue when you need it fast." },
  { icon: Shield, title: "Digitizing", desc: "Hard copy to soft copy conversion for just $1.99 per document." },
  { icon: Clock, title: "24hr Submissions", desc: "Submit orders anytime. We process all member orders within 24 business hours." },
  { icon: Printer, title: "No Maximum Prints", desc: "Order as many as you need. No caps on quantity for large projects." },
  { icon: Truck, title: "Member Delivery", desc: "Free delivery within 10 miles on eligible $50+ orders. A different delivery address adds $15." },
  { icon: Crown, title: "Member Pricing", desc: "Save 33% on every blueprint. B&W $1.99 (reg $2.99), Color $5.95 (reg $6.95)." },
];

export default function MembershipPage() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const [memberForm, setMemberForm] = useState({ fullName: "", phone: "", company: "", address: "" });
  const [profileEmail, setProfileEmail] = useState("");

  useEffect(() => {
    fetch("/api/profile").then(async (response) => { if (!response.ok) return; const result = await response.json(); setProfileEmail(result.profile.email || ""); setMemberForm({ fullName: result.profile.full_name || "", phone: result.profile.phone || "", company: result.profile.company || "", address: result.profile.address || "" }); }).catch(() => undefined);
  }, []);

  const handleSubscribe = async (plan: typeof plans[0]) => {
    if (!profileEmail) {
      router.push(`/register?next=/membership&plan=${encodeURIComponent(plan.tier)}`);
      return;
    }
    setIsLoading(true);
    setSelectedPlan(plan.name);
    if (!memberForm.fullName || !memberForm.address) {
      setNotice("Please complete your name and saved delivery address before continuing.");
      setIsLoading(false);
      return;
    }
    if (!profileEmail) {
      setNotice("Please sign in before joining the Club so we can connect the Square subscription to your account.");
      setIsLoading(false);
      return;
    }
    try {
      const profileResponse = await fetch("/api/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fullName: memberForm.fullName, email: profileEmail, phone: memberForm.phone, company: memberForm.company, address: memberForm.address }) });
      const profileResult = await profileResponse.json();
      if (!profileResponse.ok) throw new Error(profileResult.error || "Unable to save your membership details.");
      const subscriptionResponse = await fetch("/api/membership/subscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tier: plan.tier }) });
      const subscriptionResult = await subscriptionResponse.json();
      if (!subscriptionResponse.ok) throw new Error(subscriptionResult.error || "Unable to start your membership.");
      setNotice(subscriptionResult.message || "Membership started. Check your email for the Square invoice.");
    } catch (reason) { setNotice(reason instanceof Error ? reason.message : "Unable to start your membership."); }
    finally { setIsLoading(false); }
  };

  return (
    <main>
      <Navbar />
      <section className="pt-32 pb-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="font-display text-5xl font-bold text-gray-900 mb-6">Membership Plans</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join Blueprints Club and unlock exclusive pricing, priority service, and member-only benefits designed for professionals.
            </p>
          </div>

          {notice && <div role="status" className="max-w-3xl mx-auto mb-10 rounded-2xl border border-blueprint-200 bg-blueprint-50 px-5 py-4 text-center text-sm text-blueprint-900">{notice}</div>}

          {!profileEmail && (
            <div className="max-w-3xl mx-auto mb-10 rounded-2xl border border-blueprint-200 bg-blueprint-50 px-6 py-5 text-center">
              <h2 className="font-display text-xl font-bold text-gray-900">New to Blueprints Club?</h2>
              <p className="mt-1 text-sm text-gray-600">Create your free account first. After registration, you&apos;ll return here to select a plan and save your member details.</p>
              <div className="mt-4 flex flex-col sm:flex-row justify-center gap-3">
                <button onClick={() => router.push("/register?next=/membership")} className="btn-primary rounded-xl px-6 py-3 font-semibold">Create an account</button>
                <button onClick={() => router.push("/login?next=/membership")} className="rounded-xl border border-blueprint-300 bg-white px-6 py-3 font-semibold text-blueprint-700 hover:bg-blueprint-100">Already have an account? Sign in</button>
              </div>
            </div>
          )}

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-20 max-w-5xl mx-auto">
            {plans.map((plan, idx) => (
              <div
                key={idx}
                className={`relative rounded-2xl p-8 ${
                  plan.popular
                    ? "bg-gradient-to-br from-blueprint-600 to-blueprint-800 text-white shadow-xl scale-105"
                    : "bg-white border-2 border-gray-100 hover:border-blueprint-200 transition-all"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    Most Popular
                  </div>
                )}
                <div className="mb-6">
                  <h3 className={`font-display text-xl font-bold mb-2 ${plan.popular ? "text-white" : "text-gray-900"}`}>
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline gap-1">
                    <span className={`font-display text-5xl font-bold ${plan.popular ? "text-white" : "text-blueprint-700"}`}>
                      ${plan.price}
                    </span>
                    <span className={plan.popular ? "text-blueprint-200" : "text-gray-500"}>/{plan.period}</span>
                  </div>
                  <p className={`mt-3 text-sm ${plan.popular ? "text-blueprint-100" : "text-gray-500"}`}>{plan.detail}</p>
                </div>
                <button
                  onClick={() => handleSubscribe(plan)}
                  disabled={isLoading}
                  className={`w-full py-3 rounded-xl font-semibold transition-all ${
                    plan.popular
                      ? "bg-white text-blueprint-700 hover:bg-blueprint-50"
                      : "btn-primary"
                  } ${isLoading && selectedPlan === plan.name ? "opacity-70 cursor-wait" : ""}`}
                >
                  {isLoading && selectedPlan === plan.name ? "Processing..." : `Choose ${plan.name}`}
                </button>
              </div>
            ))}
          </div>

          <section className="max-w-3xl mx-auto mb-20 rounded-3xl bg-slate-50 border border-gray-200 p-7 sm:p-9">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-11 h-11 rounded-xl bg-blueprint-100 flex items-center justify-center flex-shrink-0"><UserRound className="w-5 h-5 text-blueprint-700" /></div>
              <div><h2 className="font-display text-2xl font-bold text-gray-900">Membership details</h2><p className="text-sm text-gray-500 mt-1">Save your usual delivery address. It will be used as your default member address at checkout.</p></div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <input required placeholder="Full name" value={memberForm.fullName} onChange={(event) => setMemberForm({ ...memberForm, fullName: event.target.value })} className="rounded-xl border border-gray-200 px-4 py-3 bg-white" />
              <input placeholder="Phone number" value={memberForm.phone} onChange={(event) => setMemberForm({ ...memberForm, phone: event.target.value })} className="rounded-xl border border-gray-200 px-4 py-3 bg-white" />
              <input placeholder="Company or project name (optional)" value={memberForm.company} onChange={(event) => setMemberForm({ ...memberForm, company: event.target.value })} className="rounded-xl border border-gray-200 px-4 py-3 bg-white sm:col-span-2" />
              <div className="sm:col-span-2 relative"><MapPin className="absolute left-4 top-3.5 w-4 h-4 text-blueprint-500" /><input required placeholder="Saved delivery address" value={memberForm.address} onChange={(event) => setMemberForm({ ...memberForm, address: event.target.value })} className="w-full rounded-xl border border-gray-200 pl-11 pr-4 py-3 bg-white" /></div>
            </div>
            <p className="text-xs text-gray-500 mt-4">Your saved address is the default delivery address. Delivering to another address later adds a $15 alternate-address fee.</p>
          </section>

          {/* Benefits Grid */}
          <div className="mb-16">
            <h2 className="font-display text-3xl font-bold text-gray-900 text-center mb-12">Member Benefits</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {benefits.map((benefit, idx) => (
                <div key={idx} className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                  <div className="w-12 h-12 bg-blueprint-50 rounded-xl flex items-center justify-center mb-4">
                    <benefit.icon className="w-6 h-6 text-blueprint-600" />
                  </div>
                  <h3 className="font-display font-bold text-lg text-gray-900 mb-2">{benefit.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{benefit.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Savings Calculator */}
          <div className="bg-blueprint-50 rounded-2xl p-8 border border-blueprint-100">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-blueprint-100 rounded-xl flex items-center justify-center">
                  <Crown className="w-7 h-7 text-blueprint-600" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-lg text-gray-900">Membership Pays for Itself</h4>
                  <p className="text-gray-600 text-sm">Print just 40 blueprints/month and your membership is covered by savings alone.</p>
                </div>
              </div>
              <div className="flex gap-8 text-center">
                <div>
                  <p className="font-display text-3xl font-bold text-blueprint-700">$1.99</p>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Member Price</p>
                </div>
                <div className="w-px bg-blueprint-200" />
                <div>
                  <p className="font-display text-3xl font-bold text-gray-400">$2.99</p>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Regular Price</p>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Policy */}
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-6 flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-yellow-900 mb-1">Delivery Policy</h4>
              <p className="text-sm text-yellow-800 leading-relaxed">
                Free delivery available for members only on orders $50 and above within 10 miles of our West Palm Beach location.
                Delivery to an address different from your saved member address adds a $15 alternate-address fee. Minimum order value for free delivery is $50.
                Orders outside the 10-mile radius can choose pickup or call us at +1 561-804-9110 for special arrangements.
              </p>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
