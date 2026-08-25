"use client";

import { useEffect, useState } from "react";
import { Search, Filter, Clock, Package, Printer, CheckCircle2, Truck, XCircle, ChevronDown, ArrowUpDown } from "lucide-react";

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
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/orders?scope=all")
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Unable to load orders.");
        setOrders(result.orders || []);
      })
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : "Unable to load orders."))
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to update order status.");
      setOrders((current) => current.map((order) => (order.id === orderId ? result.order : order)));
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Unable to update order status.");
    }
  };

  const filtered = orders.filter((o) => {
    const customer = o.profile_name || o.customer_name;
    const matchesSearch = o.order_number.toLowerCase().includes(search.toLowerCase()) || customer.toLowerCase().includes(search.toLowerCase());
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

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}

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
              {!loading && filtered.map((order) => {
                const status = statusConfig[order.status];
                const StatusIcon = status.icon;
                const customer = order.profile_name || order.customer_name;
                const itemLabel = `${order.quantity}× ${order.print_type === "bw" ? "B&W" : "Color"}`;
                return (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">{order.order_number}</p>
                      <p className="text-xs text-gray-500">{itemLabel}</p>
                      {Array.isArray(order.files) && order.files.length > 0 ? <div className="mt-1 space-y-1">{order.files.map((file: { id: string; file_name: string; page_count: number; sets: number }) => <a key={file.id} href={`/api/orders/${order.id}/file?fileId=${file.id}`} className="block text-xs text-blueprint-600 hover:text-blueprint-800">{file.file_name} · {file.page_count}p × {file.sets}</a>)}</div> : order.file_url && <a href={`/api/orders/${order.id}/file`} className="text-xs text-blueprint-600 hover:text-blueprint-800">Download file</a>}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">{customer}</p>
                      <p className="text-xs text-gray-500">{order.customer_email}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{new Date(order.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${status.color}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{order.delivery_type === "construction_site" ? "Construction +$15" : order.delivery_type === "delivery" ? "Delivery" : "Pickup"}</td>
                    <td className="px-6 py-4 text-right font-semibold text-gray-900">${Number(order.total_amount).toFixed(2)}</td>
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
        {loading && <div className="text-center py-12 text-gray-500">Loading orders...</div>}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No orders found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
