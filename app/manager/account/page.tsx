"use client";

import { useRouter } from "next/navigation";
import Sidebar from "@/components/manager/Sidebar";
import { logoutAction } from "./actions";

export default function ManagerAccountPage() {
  const router = useRouter();

  async function handleLogout() {
    await logoutAction();
    router.push("/login");
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 overflow-auto">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600 text-white">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative px-8 py-12">
            <h1 className="text-4xl font-bold mb-2">Account</h1>
            <p className="text-purple-100">Manage your profile and settings</p>
          </div>
        </div>

        <div className="px-8 py-8 max-w-2xl">
          {/* Profile Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-indigo-500 px-6 py-8">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-4xl">
                  👤
                </div>
                <div className="text-white">
                  <h2 className="text-2xl font-bold">Manager</h2>
                  <p className="text-purple-100">System Administrator</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Profile Information */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Profile Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">
                      Username
                    </label>
                    <p className="text-gray-900 font-mono bg-gray-50 px-4 py-2 rounded-lg">
                      manager
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">
                      Role
                    </label>
                    <p className="text-gray-900 bg-gray-50 px-4 py-2 rounded-lg">
                      Manager
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">
                      Access Level
                    </label>
                    <p className="text-gray-900 bg-gray-50 px-4 py-2 rounded-lg">
                      Full Access - Dashboard, Orders, Menu, Sales, Reports
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-6 border-t border-gray-200">
                <button
                  onClick={handleLogout}
                  className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <span>🚪</span>
                  <span>Logout</span>
                </button>
                <p className="text-xs text-gray-500 text-center mt-3">
                  You will be redirected to the login page
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
