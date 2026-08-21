"use client";

import Link from "next/link";
import { ShoppingBag, Clock, CheckCircle2, Truck, ArrowRight, Upload } from "lucide-react";

// Mock data - replace with real API calls
const recentOrders = [
  { id: "ORD-001", date: "2026-08-20", status: "delivered", total: 59.80, items: "10× B&W Blueprints", printType: "bw" },
  { id: "ORD-002", date: "2026-08-18", status: "printing", total: 119.00, items: "20× Color Blueprints", printType: "color" },
  { id: "ORD-003", date: "2026-08-15", status: "ready", total: 29.90, items: "5× B&W Blueprints", printType: "bw" },
];

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-700", icon: Clock },
  processing: { label: "Processing", color: "bg-blue-100 text-blue-700", icon: Clock },
  printing: { label: "Printing", color: "bg-purple-100 text-purple-700", icon: ShoppingBag },
  ready: { label: "Ready", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
  delivered: { label: "Delivered", color: "bg-gray-100 text-gray-700", icon: Truck },
};

export default function DashboardHome() {
  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Total Orders</p>
          <p className="font-display text-3xl font-bold text-gray-900">12</p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Active Orders</p>
          <p className="font-display text-3xl font-bold text-blueprint-700">2</p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Total Spent</p>
          <p className="font-display text-3xl font-bold text-gray-900">$847.50</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-blueprint-600 to-blueprint-800 rounded-2xl p-8 text-white">
        <h2 className="font-display text-2xl font-bold mb-2">Need More Prints?</h2>
        <p className="text-blueprint-100 mb-6">Upload your blueprints and get them printed within 24 hours.</p>
        <Link href="/order" className="inline-flex items-center gap-2 bg-white text-blueprint-700 px-6 py-3 rounded-xl font-bold hover:bg-blueprint-50 transition-all">
          <Upload className="w-5 h-5" />
          Place New Order
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-display font-bold text-lg text-gray-900">Recent Orders</h3>
          <Link href="/dashboard/orders" className="text-sm text-blueprint-600 font-medium hover:text-blueprint-800 flex items-center gap-1">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="divide-y divide-gray-100">
          {recentOrders.map((order) => {
            const status = statusConfig[order.status];
            const StatusIcon = status.icon;
            return (
              <div key={order.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${status.color}`}>
                    <StatusIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{order.id}</p>
                    <p className="text-sm text-gray-500">{order.items} • {order.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">${order.total.toFixed(2)}</p>
                  <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${status.color}`}>
                    {status.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Membership Status */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <ShoppingBag className="w-6 h-6 text-yellow-700" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-gray-900 mb-1">Membership Status</h3>
            <p className="text-gray-600 text-sm mb-3">
              You are on the <span className="font-semibold text-yellow-800">Monthly</span> plan. 
              Your membership renews on <span className="font-semibold">Sep 20, 2026</span>.
            </p>
            <Link href="/membership" className="text-sm text-blueprint-600 font-semibold hover:text-blueprint-800">
              Manage Membership →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
