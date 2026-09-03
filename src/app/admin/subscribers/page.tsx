"use client";

import { useEffect, useState } from "react";
import { Search, Crown, Users, Loader2, Mail, CreditCard } from "lucide-react";

type Subscriber = { id: string; full_name: string; email: string; phone?: string; membership_tier: "monthly" | "6month" | "yearly" | null; status: string; membership_expires_at: string | null; orders: number };

const tierColors: Record<string, string> = {
  Monthly: "bg-blue-100 text-blue-700",
  "6 Months": "bg-purple-100 text-purple-700",
  Yearly: "bg-green-100 text-green-700",
};

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  cancelled: "bg-gray-100 text-gray-700",
  past_due: "bg-red-100 text-red-700",
};

export default function AdminSubscribersPage() {
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [remindingId, setRemindingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/admin/subscribers").then(async (response) => { const result = await response.json(); if (!response.ok) throw new Error(result.error); setSubscribers(result.subscribers); }).catch((reason) => setError(reason instanceof Error ? reason.message : "Unable to load subscribers.")).finally(() => setLoading(false));
  }, []);

  async function sendWelcomeEmail(id: string) {
    setSendingId(id); setError(""); setMessage("");
    try {
      const response = await fetch(`/api/admin/subscribers/${id}/welcome-email`, { method: "POST" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to send welcome email.");
      setMessage(result.message);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to send welcome email."); }
    finally { setSendingId(null); }
  }

  async function sendPaymentReminder(id: string) {
    setRemindingId(id); setError(""); setMessage("");
    try {
      const response = await fetch(`/api/admin/subscribers/${id}/welcome-email`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind: "payment-reminder" }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to send payment reminder.");
      setMessage(result.message);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to send payment reminder."); }
    finally { setRemindingId(null); }
  }

  const filtered = subscribers.filter((s) => {
    const matchesSearch = s.full_name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase());
    const tier = s.membership_tier === "6month" ? "6 Months" : s.membership_tier === "yearly" ? "Yearly" : "Monthly";
    const matchesTier = tierFilter === "all" || tier === tierFilter;
    const matchesStatus = statusFilter === "all" || s.status === statusFilter;
    return matchesSearch && matchesTier && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Subscribers</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your Blueprints Club members</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:border-blueprint-500 transition-colors w-48" />
          </div>
          <select value={tierFilter} onChange={(e) => setTierFilter(e.target.value)} className="px-4 py-2 rounded-lg border border-gray-200 text-sm focus:border-blueprint-500 bg-white">
            <option value="all">All Tiers</option>
            <option value="Monthly">Monthly</option>
            <option value="6 Months">6 Months</option>
            <option value="Yearly">Yearly</option>
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2 rounded-lg border border-gray-200 text-sm focus:border-blueprint-500 bg-white">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="cancelled">Cancelled</option>
            <option value="past_due">Past Due</option>
          </select>
        </div>
      </div>
      {message && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">{message}</div>}

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Member</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tier</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Expires</th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Orders</th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((sub) => {
                const tier = sub.membership_tier === "6month" ? "6 Months" : sub.membership_tier === "yearly" ? "Yearly" : "Monthly";
                return (
                <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blueprint-100 rounded-full flex items-center justify-center font-bold text-blueprint-700 text-sm">
                        {sub.full_name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{sub.full_name}</p>
                        <p className="text-xs text-gray-500">{sub.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${tierColors[tier]}`}>
                      <Crown className="w-3 h-3" />
                      {tier}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[sub.status]}`}>
                      {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{sub.membership_expires_at ? new Date(sub.membership_expires_at).toLocaleDateString() : "—"}</td>
                  <td className="px-6 py-4 text-right font-semibold text-gray-900">{sub.orders}</td>
                  <td className="px-6 py-4 text-right"><div className="flex justify-end gap-2"><button onClick={() => sendWelcomeEmail(sub.id)} disabled={sendingId === sub.id || remindingId === sub.id} className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg text-blueprint-700 bg-blueprint-50 hover:bg-blueprint-100 disabled:opacity-60"><Mail className="w-3.5 h-3.5" />{sendingId === sub.id ? "Sending..." : "Welcome"}</button><button onClick={() => sendPaymentReminder(sub.id)} disabled={sendingId === sub.id || remindingId === sub.id} className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg text-amber-700 bg-amber-50 hover:bg-amber-100 disabled:opacity-60"><CreditCard className="w-3.5 h-3.5" />{remindingId === sub.id ? "Sending..." : "Payment reminder"}</button></div></td>
                </tr>
              ); })}
            </tbody>
          </table>
        </div>
        {loading && <div className="text-center py-12 text-gray-500"><Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin" />Loading live subscribers...</div>}
        {error && <div className="text-center py-12 text-red-600">{error}</div>}
        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No subscribers found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
