"use client";

import Link from "next/link";
import { Users, ShoppingBag, DollarSign, TrendingUp, ArrowRight, Clock } from "lucide-react";

const stats = [
  { label: "Total Subscribers", value: "156", change: "+12 this month", icon: Users, color: "bg-blue-50 text-blue-600" },
  { label: "Total Orders", value: "1,247", change: "+89 this month", icon: ShoppingBag, color: "bg-purple-50 text-purple-600" },
  { label: "Revenue", value: "$8,420", change: "+15% vs last month", icon: DollarSign, color: "bg-green-50 text-green-600" },
  { label: "Pending Orders", value: "23", change: "5 rush orders", icon: Clock, color: "bg-yellow-50 text-yellow-600" },
];

const recentOrders = [
  { id: "ORD-1247", customer: "Marcus Johnson", date: "2026-08-21", status: "printing", total: 59.80 },
  { id: "ORD-1246", customer: "Sarah Chen", date: "2026-08-21", status: "pending", total: 119.00 },
  { id: "ORD-1245", customer: "David Rodriguez", date: "2026-08-20", status: "ready", total: 29.90 },
  { id: "ORD-1244", customer: "Jennifer Walsh", date: "2026-08-20", status: "delivered", total: 178.50 },
  { id: "ORD-1243", customer: "Michael Torres", date: "2026-08-19", status: "printing", total: 89.70 },
];

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  processing: "bg-blue-100 text-blue-700",
  printing: "bg-purple-100 text-purple-700",
  ready: "bg-green-100 text-green-700",
  delivered: "bg-gray-100 text-gray-700",
};

export default function AdminOverviewPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back, Admin. Here&apos;s what&apos;s happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
            <p className="font-display text-3xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="text-xs text-green-600 font-medium mt-1">{stat.change}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-display font-bold text-lg text-gray-900">Recent Orders</h3>
          <Link href="/admin/orders" className="text-sm text-blueprint-600 font-medium hover:text-blueprint-800 flex items-center gap-1">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{order.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{order.customer}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{order.date}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[order.status]}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-gray-900">${order.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
