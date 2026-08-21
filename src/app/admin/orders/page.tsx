"use client";

import { useState } from "react";
import { Search, Filter, Clock, Package, Printer, CheckCircle2, Truck, XCircle, ChevronDown, ArrowUpDown } from "lucide-react";

const allOrders = [
  { id: "ORD-1247", customer: "Marcus Johnson", email: "marcus@apex.com", date: "2026-08-21", status: "printing", total: 59.80, items: "10× B&W", printType: "bw", delivery: "Free", address: "123 Main St, WPB" },
  { id: "ORD-1246", customer: "Sarah Chen", email: "sarah@chen.design", date: "2026-08-21", status: "pending", total: 119.00, items: "20× Color", printType: "color", delivery: "Construction +$15", address: "456 Site Rd, WPB" },
  { id: "ORD-1245", customer: "David Rodriguez", email: "david@buildright.com", date: "2026-08-20", status: "ready", total: 29.90, items: "5× B&W", printType: "bw", delivery: "Pickup", address: "5001 S Dixie Hwy" },
  { id: "ORD-1244", customer: "Jennifer Walsh", email: "jen@walsh.com", date: "2026-08-20", status: "delivered", total: 178.50, items: "30× Color", printType: "color", delivery: "Free", address: "789 Oak Ave, WPB" },
  { id: "ORD-1243", customer: "Michael Torres", email: "mike@torres.com", date: "2026-08-19", status: "printing", total: 89.70, items: "15× B&W", printType: "bw", delivery: "Free", address: "321 Pine St, WPB" },
  { id: "ORD-1242", customer: "Amanda Foster", email: "amanda@foster.com", date: "2026-08-18", status: "cancelled", total: 0, items: "Cancelled", printType: "bw", delivery: "—", address: "—" },
  { id: "ORD-1241", customer: "Marcus Johnson", email: "marcus@apex.com", date: "2026-08-15", status: "delivered", total: 119.00, items: "20× B&W", printType: "bw", delivery: "Free", address: "123 Main St, WPB" },
  { id: "ORD-1240", customer: "Sarah Chen", email: "sarah@chen.design", date: "2026-08-12", status: "delivered", total: 59.50, items: "10× Color", printType: "color", delivery: "Free", address: "654 Elm St, WPB" },
];

const statusConfig: Record<string, { label: string; color: string; icon: any; next: string | null }> = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-700", icon: Clock, next: "processing" },
  processing: { label: "Processing", color: "bg-blue-100 text-blue-700", icon: Package, next: "printing" },
  printing: { label: "Printing", color: "bg-purple-100 text-purple-700", icon: Printer, next: "ready" },
  ready: { label: "Ready", color: "bg-green-100 text-green-700", icon: CheckCircle2, next: "delivered" },
  delivered: { label: "Delivered", color: "bg-gray-100 text-gray-700", icon: Truck, next: null },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-700", icon: XCircle, next: null },
};

export default function AdminOrdersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [orders, setOrders] = useState(allOrders);

  const updateStatus = (orderId: string, newStatus: string) => {
    setOrders(orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
  };

  const filtered = orders.filter((o) => {
    const matchesSearch = o.id.toLowerCase().includes(search.toLowerCase()) || o.customer.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">All Orders</h1>
          <p className="text-gray-500 text-sm mt-1">Manage and update order statuses</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search orders..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:border-blueprint-500 transition-colors w-48" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2 rounded-lg border border-gray-200 text-sm focus:border-blueprint-500 bg-white">
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="printing">Printing</option>
            <option value="ready">Ready</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Order</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Delivery</th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                <th className="text-center px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((order) => {
                const status = statusConfig[order.status];
                const StatusIcon = status.icon;
                return (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">{order.id}</p>
                      <p className="text-xs text-gray-500">{order.items}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">{order.customer}</p>
                      <p className="text-xs text-gray-500">{order.email}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{order.date}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${status.color}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{order.delivery}</td>
                    <td className="px-6 py-4 text-right font-semibold text-gray-900">${order.total.toFixed(2)}</td>
                    <td className="px-6 py-4 text-center">
                      {status.next && (
                        <button
                          onClick={() => updateStatus(order.id, status.next!)}
                          className="text-xs bg-blueprint-600 text-white px-3 py-1.5 rounded-lg font-medium hover:bg-blueprint-700 transition-colors"
                        >
                          Mark {status.next === "processing" ? "Processing" : status.next === "printing" ? "Printing" : status.next === "ready" ? "Ready" : "Delivered"}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No orders found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
