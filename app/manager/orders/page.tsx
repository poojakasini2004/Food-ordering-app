"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/manager/Sidebar";
import OrderStatusBadge from "@/components/manager/OrderStatusBadge";
import { getAllOrders, OrderWithDetails } from "./actions";
import type { OrderStatus } from "@/lib/db";

type FilterStatus = "ALL" | OrderStatus;

export default function ManagerOrdersPage() {
  const [allOrders, setAllOrders] = useState<OrderWithDetails[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<OrderWithDetails[]>([]);
  const [filter, setFilter] = useState<FilterStatus>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchOrders() {
    try {
      const data = await getAllOrders();
      setAllOrders(data);
      applyFilters(data, filter, searchTerm);
    } finally {
      setLoading(false);
    }
  }

  function applyFilters(
    orders: OrderWithDetails[],
    statusFilter: FilterStatus,
    search: string
  ) {
    let filtered = orders;

    // Status filter
    if (statusFilter !== "ALL") {
      filtered = filtered.filter((o) => o.order.status === statusFilter);
    }

    // Search filter
    if (search.trim()) {
      const term = search.toLowerCase();
      filtered = filtered.filter(
        (o) =>
          o.order.customerName.toLowerCase().includes(term) ||
          o.order.id.toLowerCase().includes(term) ||
          o.order.phone.includes(term)
      );
    }

    setFilteredOrders(filtered);
  }

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    applyFilters(allOrders, filter, searchTerm);
  }, [filter, searchTerm, allOrders]);

  const handleFilterChange = (newFilter: FilterStatus) => {
    setFilter(newFilter);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const toggleExpand = (orderId: string) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const statusCounts = {
    ALL: allOrders.length,
    PENDING: allOrders.filter((o) => o.order.status === "PENDING").length,
    ACTIVE: allOrders.filter((o) => o.order.status === "ACTIVE").length,
    COMPLETED: allOrders.filter((o) => o.order.status === "COMPLETED").length,
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 overflow-auto">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 text-white">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative px-8 py-12">
            <h1 className="text-4xl font-bold mb-2">All Orders</h1>
            <p className="text-blue-100">Complete order management and tracking</p>
          </div>
        </div>

        <div className="px-8 py-8 space-y-6">
          {/* Filters & Search */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
            {/* Status Filter */}
            <div className="flex flex-wrap gap-2">
              {(["ALL", "PENDING", "ACTIVE", "COMPLETED"] as FilterStatus[]).map((status) => (
                <button
                  key={status}
                  onClick={() => handleFilterChange(status)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    filter === status
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {status === "ALL" ? "All" : status === "ACTIVE" ? "In Progress" : status}{" "}
                  <span className="text-sm">({statusCounts[status as keyof typeof statusCounts]})</span>
                </button>
              ))}
            </div>

            {/* Search */}
            <div>
              <input
                type="text"
                placeholder="Search by customer name, order ID, or phone..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Count */}
            <p className="text-sm text-gray-600">
              Showing <span className="font-bold">{filteredOrders.length}</span> order
              {filteredOrders.length !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Orders Table */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="text-5xl mb-4 animate-spin">⟳</div>
                <p className="text-gray-500">Loading orders...</p>
              </div>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">No orders found</h3>
              <p className="text-gray-500">Try adjusting your filters or search term</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Items
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Time
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredOrders.map(({ order, items }) => (
                      <>
                        <tr
                          key={order.id}
                          onClick={() => toggleExpand(order.id)}
                          className="hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          <td className="px-6 py-4">
                            <p className="font-mono text-sm font-semibold text-gray-900">
                              #{order.id.slice(-8)}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-semibold text-gray-900">{order.customerName}</p>
                            <p className="text-sm text-gray-500">{order.phone}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-gray-600">
                              {items.map((item) => `${item.itemNameSnapshot} x${item.quantity}`).join(", ")}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-bold text-gray-900">${order.totalAmount.toFixed(2)}</p>
                          </td>
                          <td className="px-6 py-4">
                            <OrderStatusBadge status={order.status} />
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-gray-600">
                              {new Date(order.createdAt).toLocaleString()}
                            </p>
                          </td>
                        </tr>
                        {expandedOrderId === order.id && (
                          <tr>
                            <td colSpan={6} className="px-6 py-4 bg-gray-50">
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                                      Customer Email
                                    </p>
                                    <p className="text-sm text-gray-900">{order.email}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                                      Delivery Address
                                    </p>
                                    <p className="text-sm text-gray-900">{order.deliveryAddress}</p>
                                  </div>
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                                    Order Items
                                  </p>
                                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                                    {items.map((item) => (
                                      <div
                                        key={item.id}
                                        className="flex justify-between py-2 border-b last:border-0"
                                      >
                                        <span className="text-sm text-gray-700">
                                          {item.itemNameSnapshot} × {item.quantity}
                                        </span>
                                        <span className="text-sm font-semibold text-gray-900">
                                          ${(item.unitPrice * item.quantity).toFixed(2)}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
