"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginAction } from "./actions";
import BackButton from "@/components/BackButton";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await loginAction(username, password);
      if (!result.success) {
        setError(result.error);
      } else if (result.role === "STAFF") {
        router.push("/staff/orders");
      } else if (result.role === "MANAGER") {
        router.push("/manager/dashboard");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/image2.jpg')" }}
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Card */}
      <div className="relative z-10 bg-white/95 backdrop-blur p-8 rounded-2xl shadow-2xl w-full max-w-sm mx-4">
        <div className="flex justify-start mb-2">
          <BackButton />
        </div>
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🍽</div>
          <h1 className="text-2xl font-bold text-gray-900">SmartX Foods</h1>
          <p className="text-sm text-gray-500 mt-1">Staff &amp; Manager Login</p>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="Enter username"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="Enter password"
            />
          </div>

          {error !== null && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg" role="alert">
              {error}
            </p>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-orange-500 text-white py-2.5 px-4 rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </div>

        <p className="text-xs text-center text-gray-400 mt-6">
          Customers don&apos;t need to log in —{" "}
          <a href="/menu" className="text-orange-500 hover:underline">browse the menu</a>
        </p>
      </div>
    </div>
  );
}
