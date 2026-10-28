import { menuItems, menuCategories } from "@/lib/db";
import MenuAdminClient from "./MenuAdminClient";
import Sidebar from "@/components/manager/Sidebar";

export default function ManagerMenuPage() {
  const availableCount = menuItems.filter((item) => item.isAvailable).length;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 overflow-auto">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-green-500 via-green-600 to-emerald-600 text-white">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative px-8 py-12">
            <h1 className="text-4xl font-bold mb-2">Menu Management</h1>
            <p className="text-green-100">Add, edit, and manage your restaurant menu</p>
          </div>
        </div>

        <div className="px-8 py-8 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <p className="text-sm font-semibold text-gray-600 mb-1">Total Items</p>
              <p className="text-3xl font-bold text-gray-900">{menuItems.length}</p>
            </div>
            <div className="bg-green-50 rounded-xl border border-green-200 p-6">
              <p className="text-sm font-semibold text-green-600 mb-1">Available</p>
              <p className="text-3xl font-bold text-green-600">{availableCount}</p>
            </div>
            <div className="bg-red-50 rounded-xl border border-red-200 p-6">
              <p className="text-sm font-semibold text-red-600 mb-1">Unavailable</p>
              <p className="text-3xl font-bold text-red-600">
                {menuItems.length - availableCount}
              </p>
            </div>
          </div>

          {/* Menu Admin Client */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <MenuAdminClient menuItems={menuItems} menuCategories={menuCategories} />
          </div>
        </div>
      </main>
    </div>
  );
}
