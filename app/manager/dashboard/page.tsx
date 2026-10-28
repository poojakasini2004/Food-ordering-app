"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/manager/Sidebar";
import SummaryCard from "@/components/manager/SummaryCard";
import OrderStatusBadge from "@/components/manager/OrderStatusBadge";
import {
  getDashboardSummary,
  getRecentOrders,
  getTopSellingItemsToday,
  DashboardSummary,
  RecentOrder,
  TopSellingItem,
} from "./actions";

export default function ManagerDashboard() {
  const [summary, setSummary] = useState<DashboardSummary>({
    totalOrdersToday: 0,
    pendingOrders: 0,
    inProgressOrders: 0,
    completedToday: 0,
    revenueToday: 0,
    revenueAllTime: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [topItems, setTopItems] = useState<TopSellingItem[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchData() {
    try {
      const [summaryData, ordersData, itemsData] = await Promise.all([
        getDashboardSummary(),
        getRecentOrders(),
        getTopSellingItemsToday(),
      ]);
      setSummary(summaryData);
      setRecentOrders(ordersData);
      setTopItems(itemsData);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 overflow-auto">
        {/* Header with background */}
        <div className="relative bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 text-white">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative px-8 py-12">
            <h1 className="text-4xl font-bold mb-2">Dashboard Overview</h1>
            <p className="text-orange-100">Welcome back! Here's what's happening today.</p>
          </div>
        </div>

        <div className="px-8 py-8 space-y-8">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="text-5xl mb-4 animate-spin">⟳</div>
                <p className="text-gray-500">Loading dashboard...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <SummaryCard
                  title="Total Orders Today"
                  value={summary.totalOrdersToday}
                  subtitle="All orders placed today"
                  icon="📦"
                  color="gray"
                />
                <SummaryCard
                  title="Pending Orders"
                  value={summary.pendingOrders}
                  subtitle="Awaiting preparation"
                  icon="⏳"
                  color="yellow"
                />
                <SummaryCard
                  title="In Progress"
                  value={summary.inProgressOrders}
                  subtitle="Being prepared"
                  icon="👨‍🍳"
                  color="blue"
                />
                <SummaryCard
                  title="Completed Today"
                  value={summary.completedToday}
                  subtitle="Successfully delivered"
                  icon="✅"
                  color="green"
                />
                <SummaryCard
                  title="Revenue Today"
                  value={`$${summary.revenueToday.toFixed(2)}`}
                  subtitle="Today's earnings"
                  icon="💰"
                  color="orange"
                />
                <SummaryCard
                  title="Total Revenue"
                  value={`$${summary.revenueAllTime.toFixed(2)}`}
                  subtitle="All-time earnings"
                  icon="💎"
                  color="green"
                />
              </div>

              {/* Recent Orders & Top Items */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Orders */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
                    <p className="text-sm text-gray-500">Last 10 orders placed</p>
                  </div>
                  <div className="p-6">
                    {recentOrders.length === 0 ? (
                      <div className="text-center py-8 text-gray-400">
                        <p className="text-4xl mb-2">📭</p>
                        <p>No orders yet</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {recentOrders.map((order) => (
                          <div
                            key={order.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 truncate">
                                {order.customerName}
                              </p>
                              <p className="text-xs text-gray-500 font-mono">
                                #{order.id.slice(-8)}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <OrderStatusBadge status={order.status as any} />
                              <p className="font-bold text-gray-900">
                                ${order.totalAmount.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Top Selling Items */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-bold text-gray-900">Top Selling Items Today</h2>
                    <p className="text-sm text-gray-500">Best performers</p>
                  </div>
                  <div className="p-6">
                    {topItems.length === 0 ? (
                      <div className="text-center py-8 text-gray-400">
                        <p className="text-4xl mb-2">🍽️</p>
                        <p>No sales today</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {topItems.map((item, idx) => (
                          <div key={item.itemName} className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 font-bold flex items-center justify-center shrink-0">
                              {idx + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 truncate">
                                {item.itemName}
                              </p>
                              <p className="text-sm text-gray-500">
                                {item.quantitySold} sold • ${item.revenue.toFixed(2)} revenue
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
