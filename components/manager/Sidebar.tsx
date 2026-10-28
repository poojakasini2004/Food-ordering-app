"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/manager/dashboard", label: "Overview", icon: "📊" },
  { href: "/manager/orders", label: "All Orders", icon: "📋" },
  { href: "/manager/menu", label: "Menu Management", icon: "🍽️" },
  { href: "/manager/sales", label: "Sales Report", icon: "📈" },
  { href: "/manager/account", label: "Account", icon: "👤" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <Link href="/manager/dashboard" className="flex items-center gap-2">
          <span className="text-2xl">🍽</span>
          <div>
            <h1 className="text-lg font-bold text-gray-900">SmartX Foods</h1>
            <p className="text-xs text-gray-500">Manager Dashboard</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-orange-50 text-orange-600 font-semibold"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <Link
          href="/"
          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-orange-600 transition-colors"
        >
          <span>←</span>
          <span>Back to Home</span>
        </Link>
      </div>
    </aside>
  );
}
