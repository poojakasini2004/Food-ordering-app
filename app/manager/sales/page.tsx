"use client";

import { useState, useEffect, useCallback } from "react";
import { getSalesData, SalesFilter, SalesData } from "./actions";
import Sidebar from "@/components/manager/Sidebar";
import SummaryCard from "@/components/manager/SummaryCard";

const FILTERS: { key: SalesFilter; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "week", label: "This Week" },
  { key: "month", label: "This Month" },
  { key: "custom", label: "Custom Range" },
];

export default function SalesDashboardPage() {
  const [activeFilter, setActiveFilter] = useState<SalesFilter>("today");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<SalesData | null>(null);

  const fetchData = useCallback(
    async (filter: SalesFilter, from?: string, to?: string) => {
      setLoading(true);
      try {
        const customRange =
          filter === "custom" && from && to
            ? { from: new Date(from), to: new Date(to) }
            : undefined;
        const result = await getSalesData(filter, customRange);
        setData(result);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchData("today");
  }, [fetchData]);

  function handleFilterClick(filter: SalesFilter) {
    setActiveFilter(filter);
    if (filter !== "custom") {
      fetchData(filter);
    }
  }

  function handleApplyCustom() {
    if (fromDate && toDate) {
      fetchData("custom", fromDate, toDate);
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 overflow-auto">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600 text-white">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative px-8 py-12">
            <h1 className="text-4xl font-bold mb-2">Sales Report</h1>
            <p className="text-emerald-100">Analyze your sales performance and trends</p>
          </div>
        </div>

        <div className="px-8 py-8 space-y-6">
          {/* Filter bar */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex flex-wrap gap-3 items-end">
              {FILTERS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => handleFilterClick(key)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                    activeFilter === key
                      ? "bg-orange-500 text-white shadow"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {label}
                </button>
              ))}

              {activeFilter === "custom" && (
                <>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">From</label>
                    <input
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">To</label>
                    <input
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                  </div>
                  <button
                    onClick={handleApplyCustom}
                    disabled={!fromDate || !toDate}
                    className="bg-orange-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-orange-600 disabled:opacity-50 transition-colors"
                  >
                    Apply
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="text-4xl mb-3 animate-spin">⟳</div>
                <p className="text-gray-500">Loading sales data...</p>
              </div>
            </div>
          ) : data?.isEmpty ? (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
              <div className="text-5xl mb-4">📊</div>
              <h2 className="text-xl font-bold text-gray-700 mb-2">No completed orders found</h2>
              <p className="text-gray-400">No completed orders found for this period.</p>
            </div>
          ) : (
            <>
              {/* Summary cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <SummaryCard
                  title="Total Orders"
                  value={data?.totalOrders ?? 0}
                  subtitle="Completed orders in period"
                  icon="📦"
                  color="gray"
                />
                <SummaryCard
                  title="Total Revenue"
                  value={`$${(data?.totalRevenue ?? 0).toFixed(2)}`}
                  subtitle="Cash on delivery earnings"
                  icon="💰"
                  color="green"
                />
                <SummaryCard
                  title="Average Order Value"
                  value={`$${(data && data.totalOrders > 0 ? data.totalRevenue / data.totalOrders : 0).toFixed(2)}`}
                  subtitle="Per order average"
                  icon="📈"
                  color="blue"
                />
              </div>

              {/* Top 5 items */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4">
                  Top {data?.topItems.length ?? 0} Items
                </h2>
                {data && data.topItems.length > 0 ? (
                  <ol className="space-y-3">
                    {data.topItems.map((item, idx) => (
                      <li key={item.itemName} className="flex items-center gap-4">
                        <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 text-sm font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-800 truncate">{item.itemName}</p>
                        </div>
                        <span className="text-sm font-bold text-gray-700 shrink-0">
                          {item.quantitySold} sold
                        </span>
                        {/* Bar */}
                        <div className="w-24 bg-gray-100 rounded-full h-2 shrink-0">
                          <div
                            className="bg-emerald-400 h-2 rounded-full"
                            style={{
                              width: `${
                                ((item.quantitySold /
                                  (data.topItems[0]?.quantitySold ?? 1)) *
                                  100).toFixed(0)
                              }%`,
                            }}
                          />
                        </div>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="text-gray-400 text-sm">No item data available.</p>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
