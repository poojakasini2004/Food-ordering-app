"use client";

import { useEffect, useState } from "react";
import { getOrders, updateOrderStatus, getSummary, OrderWithItems, DailySummary } from "./actions";
import BackButton from "@/components/BackButton";

export default function StaffOrdersPage() {
  const [orderGroups, setOrderGroups] = useState<OrderWithItems[]>([]);
  const [summary, setSummary] = useState<DailySummary>({
    totalOrdersToday: 0,
    pendingCount: 0,
    inProgressCount: 0,
    completedToday: 0,
    revenueCollected: 0,
  });
  const [loading, setLoading] = useState(true);
  const [cardErrors, setCardErrors] = useState<Record<string, string>>({});

  async function fetchData() {
    try {
      const [ordersData, summaryData] = await Promise.all([
        getOrders(),
        getSummary(),
      ]);
      setOrderGroups(ordersData);
      setSummary(summaryData);
    } catch {
      // silently keep existing data
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  async function handleStatusUpdate(orderId: string, newStatus: "ACTIVE" | "COMPLETED") {
    const result = await updateOrderStatus(orderId, newStatus);
    if (!result.success) {
      setCardErrors((prev) => ({ ...prev, [orderId]: result.error }));
    } else {
      setCardErrors((prev) => {
        const next = { ...prev };
        delete next[orderId];
        return next;
      });
      await fetchData();
    }
  }

  const pending = orderGroups.filter((g) => g.order.status === "PENDING");
  const inProgress = orderGroups.filter((g) => g.order.status === "ACTIVE");
  const completed = orderGroups.filter((g) => g.order.status === "COMPLETED");

  const columns: {
    label: string;
    icon: string;
    badge: string;
    cardBg: string;
    buttonBg: string;
    data: OrderWithItems[];
  }[] = [
    {
      label: "Pending Orders",
      icon: "⏳",
      badge: "bg-amber-100 text-amber-800",
      cardBg: "bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200",
      buttonBg: "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
      data: pending,
    },
    {
      label: "In Progress",
      icon: "🔄",
      badge: "bg-blue-100 text-blue-800",
      cardBg: "bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200",
      buttonBg: "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700",
      data: inProgress,
    },
    {
      label: "Completed",
      icon: "✅",
      badge: "bg-green-100 text-green-800",
      cardBg: "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200",
      buttonBg: "",
      data: completed,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Professional Header with Gradient */}
      <div className="relative bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 text-white shadow-2xl">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center text-3xl">
                  🍽️
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Staff Order Dashboard</h1>
                  <p className="text-orange-100 text-sm mt-1">SmartX Foods Kitchen Management</p>
                </div>
              </div>
            </div>
            <BackButton />
          </div>

          {/* Live Summary Cards in Header */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
            <div className="bg-white/95 backdrop-blur rounded-xl p-4 shadow-lg border border-white/20">
              <div className="text-sm text-gray-600 mb-1 font-medium">Total Orders</div>
              <div className="text-3xl font-bold text-gray-900">{summary.totalOrdersToday}</div>
            </div>
            <div className="bg-amber-500/95 backdrop-blur rounded-xl p-4 shadow-lg border border-white/20">
              <div className="text-sm text-amber-100 mb-1 font-medium">Pending</div>
              <div className="text-3xl font-bold text-white">{summary.pendingCount}</div>
            </div>
            <div className="bg-blue-500/95 backdrop-blur rounded-xl p-4 shadow-lg border border-white/20">
              <div className="text-sm text-blue-100 mb-1 font-medium">In Progress</div>
              <div className="text-3xl font-bold text-white">{summary.inProgressCount}</div>
            </div>
            <div className="bg-green-500/95 backdrop-blur rounded-xl p-4 shadow-lg border border-white/20">
              <div className="text-sm text-green-100 mb-1 font-medium">Completed</div>
              <div className="text-3xl font-bold text-white">{summary.completedToday}</div>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-pink-600 backdrop-blur rounded-xl p-4 shadow-lg border border-white/20">
              <div className="text-sm text-orange-100 mb-1 font-medium">Revenue</div>
              <div className="text-3xl font-bold text-white">${summary.revenueCollected.toFixed(0)}</div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* Orders Columns */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="text-6xl mb-4 animate-spin">⟳</div>
              <p className="text-lg text-gray-600 font-semibold">Loading orders...</p>
              <p className="text-sm text-gray-400 mt-1">Auto-refresh every 5 seconds</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {columns.map(({ label, icon, badge, cardBg, buttonBg, data }) => (
              <section key={label} className="space-y-4">
                {/* Column Header */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{icon}</span>
                      <div>
                        <h2 className="text-lg font-bold text-gray-800">{label}</h2>
                        <p className="text-xs text-gray-500">
                          {data.length} {data.length === 1 ? 'order' : 'orders'}
                        </p>
                      </div>
                    </div>
                    <span className={`text-lg font-bold rounded-full px-4 py-2 ${badge}`}>
                      {data.length}
                    </span>
                  </div>
                </div>

                {/* Order Cards */}
                <div className="space-y-4">
                  {data.length === 0 ? (
                    <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-8 text-center">
                      <div className="text-5xl mb-3 opacity-30">{icon}</div>
                      <p className="text-sm text-gray-400 font-medium">No orders in this stage</p>
                    </div>
                  ) : (
                    data.map(({ order, items }) => (
                      <div
                        key={order.id}
                        className={`rounded-2xl border-2 p-6 shadow-lg hover:shadow-xl transition-all duration-200 ${cardBg}`}
                      >
                        {/* Card Header */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-gray-700 bg-white px-3 py-1.5 rounded-lg shadow-sm">
                              #{order.id.slice(-8).toUpperCase()}
                            </span>
                          </div>
                          <span className="text-xs text-gray-600 font-semibold bg-white px-3 py-1.5 rounded-lg shadow-sm">
                            🕐 {new Date(order.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>

                        {/* Customer Info */}
                        <div className="bg-white/70 backdrop-blur rounded-xl p-4 mb-4 space-y-2">
                          <p className="font-bold text-gray-900 text-xl flex items-center gap-2">
                            <span>👤</span> {order.customerName}
                          </p>
                          <p className="text-sm text-gray-700 flex items-center gap-2">
                            <span>📍</span> {order.deliveryAddress}
                          </p>
                          <p className="text-sm text-gray-700 flex items-center gap-2">
                            <span>📞</span> {order.phone}
                          </p>
                        </div>

                        {/* Items */}
                        <div className="bg-white/70 backdrop-blur rounded-xl p-4 mb-4">
                          <h4 className="text-xs font-bold text-gray-600 mb-3 uppercase tracking-wider flex items-center gap-2">
                            <span>🍽️</span> Order Items
                          </h4>
                          <ul className="space-y-2">
                            {items.map((item) => (
                              <li key={item.id} className="flex justify-between items-center text-sm">
                                <span className="text-gray-800 font-semibold">
                                  {item.itemNameSnapshot}
                                </span>
                                <span className="flex items-center gap-2">
                                  <span className="text-gray-600 bg-gray-100 px-2 py-1 rounded font-medium">
                                    × {item.quantity}
                                  </span>
                                  <span className="text-gray-900 font-bold min-w-[60px] text-right">
                                    ${(item.unitPrice * item.quantity).toFixed(2)}
                                  </span>
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Total */}
                        <div className="flex justify-between items-center bg-white/80 backdrop-blur rounded-xl p-4 mb-4 border-2 border-orange-200">
                          <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                            💰 Total Amount
                          </span>
                          <span className="text-2xl font-bold text-orange-600">
                            ${order.totalAmount.toFixed(2)}
                          </span>
                        </div>

                        {/* Error */}
                        {cardErrors[order.id] && (
                          <div className="mb-4 bg-red-100 border-2 border-red-300 rounded-xl p-3">
                            <p className="text-sm text-red-800 font-semibold flex items-center gap-2">
                              <span>⚠️</span> {cardErrors[order.id]}
                            </p>
                          </div>
                        )}

                        {/* Actions */}
                        {order.status === "PENDING" && (
                          <button
                            onClick={() => handleStatusUpdate(order.id, "ACTIVE")}
                            className={`w-full text-white text-base font-bold py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 ${buttonBg}`}
                          >
                            <span className="flex items-center justify-center gap-2">
                              <span>👨‍🍳</span> Order Picked
                            </span>
                          </button>
                        )}

                        {order.status === "ACTIVE" && (
                          <button
                            onClick={() => handleStatusUpdate(order.id, "COMPLETED")}
                            className={`w-full text-white text-base font-bold py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 ${buttonBg}`}
                          >
                            <span className="flex items-center justify-center gap-2">
                              <span>✅</span> Order Ready
                            </span>
                          </button>
                        )}

                        {/* Completed — read only */}
                        {order.status === "COMPLETED" && (
                          <div className="text-center py-4 text-base font-bold text-green-700 uppercase tracking-wide bg-green-100 rounded-xl border-2 border-green-300">
                            <span className="flex items-center justify-center gap-2">
                              <span>✅</span> Completed & Ready for Pickup
                            </span>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
