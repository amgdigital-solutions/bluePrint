"use client";

import { useEffect, useState } from "react";
import { Clock, ShoppingBag, CheckCircle2, Truck, Package, Search, Filter, ChevronDown } from "lucide-react";

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  pending: { label: "Pending", color: "text-yellow-700", bg: "bg-yellow-50", icon: Clock },
  processing: { label: "Processing", color: "text-blue-700", bg: "bg-blue-50", icon: Package },
  printing: { label: "Printing", color: "text-purple-700", bg: "bg-purple-50", icon: ShoppingBag },
  ready: { label: "Ready for Pickup", color: "text-green-700", bg: "bg-green-50", icon: CheckCircle2 },
  delivered: { label: "Delivered", color: "text-gray-700", bg: "bg-gray-50", icon: Truck },
  cancelled: { label: "Cancelled", color: "text-red-700", bg: "bg-red-50", icon: Clock },
};

export default function DashboardOrdersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/orders")
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Unable to load orders.");
        setOrders(result.orders || []);
      })
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : "Unable to load orders."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = orders.filter((o) => {
    const itemLabel = `${o.quantity}× ${o.print_type === "bw" ? "B&W" : "Color"} Blueprints`;
    const matchesSearch = o.order_number.toLowerCase().includes(search.toLowerCase()) || itemLabel.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-bold text-gray-900">My Orders</h1>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:border-blueprint-500 transition-colors w-48"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-9 pr-8 py-2 rounded-lg border border-gray-200 text-sm focus:border-blueprint-500 transition-colors appearance-none bg-white"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="printing">Printing</option>
              <option value="ready">Ready</option>
              <option value="delivered">Delivered</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Order</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Delivery</th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {!loading && filtered.map((order) => {
                const status = statusConfig[order.status];
                const StatusIcon = status.icon;
                const itemLabel = `${order.quantity}× ${order.print_type === "bw" ? "B&W" : "Color"} Blueprints`;
                return (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900">{order.order_number}</p>
                        <p className="text-sm text-gray-500">{itemLabel}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{new Date(order.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full ${status.bg} ${status.color}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{order.delivery_type === "construction_site" ? "Construction Site +$15" : order.delivery_type === "delivery" ? "Delivery" : "Pickup"}</td>
                    <td className="px-6 py-4 text-right font-semibold text-gray-900">${Number(order.total_amount).toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {loading && <div className="text-center py-12 text-gray-500">Loading your orders...</div>}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No orders found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
