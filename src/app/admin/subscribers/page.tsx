"use client";

import { useState } from "react";
import { Search, Filter, Crown, Calendar, Mail, Phone, ChevronDown, Users } from "lucide-react";

const subscribers = [
  { id: "USR-001", name: "Marcus Johnson", email: "marcus@apex.com", phone: "+1 561-111-2222", tier: "Monthly", status: "active", joined: "2026-01-15", expires: "2026-09-15", orders: 45 },
  { id: "USR-002", name: "Sarah Chen", email: "sarah@chen.design", phone: "+1 561-222-3333", tier: "6 Months", status: "active", joined: "2026-03-10", expires: "2026-09-10", orders: 28 },
  { id: "USR-003", name: "David Rodriguez", email: "david@buildright.com", phone: "+1 561-333-4444", tier: "Yearly", status: "active", joined: "2026-02-01", expires: "2027-02-01", orders: 67 },
  { id: "USR-004", name: "Jennifer Walsh", email: "jen@walsh.com", phone: "+1 561-444-5555", tier: "Monthly", status: "cancelled", joined: "2026-05-20", expires: "2026-06-20", orders: 12 },
  { id: "USR-005", name: "Michael Torres", email: "mike@torres.com", phone: "+1 561-555-6666", tier: "6 Months", status: "active", joined: "2026-04-15", expires: "2026-10-15", orders: 34 },
  { id: "USR-006", name: "Amanda Foster", email: "amanda@foster.com", phone: "+1 561-666-7777", tier: "Monthly", status: "past_due", joined: "2026-06-01", expires: "2026-07-01", orders: 8 },
];

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

  const filtered = subscribers.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase());
    const matchesTier = tierFilter === "all" || s.tier === tierFilter;
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
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((sub) => (
                <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blueprint-100 rounded-full flex items-center justify-center font-bold text-blueprint-700 text-sm">
                        {sub.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{sub.name}</p>
                        <p className="text-xs text-gray-500">{sub.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${tierColors[sub.tier]}`}>
                      <Crown className="w-3 h-3" />
                      {sub.tier}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[sub.status]}`}>
                      {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{sub.expires}</td>
                  <td className="px-6 py-4 text-right font-semibold text-gray-900">{sub.orders}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No subscribers found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
