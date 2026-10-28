"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import BackButton from "@/components/BackButton";

export default function CartPage() {
  const router = useRouter();
  const { cartItems, updateQuantity, removeItem, subtotal } = useCart();

  const totalItems = cartItems.reduce((sum, ci) => sum + ci.quantity, 0);
  const totalUniqueItems = cartItems.length;

  return (
    <div className="relative min-h-screen">
      {/* Background */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10"
        style={{ backgroundImage: "url('/image2.jpg')" }}
      />
      <div className="fixed inset-0 bg-black/45 -z-10" />

      {/* Nav */}
      <nav className="bg-white/80 backdrop-blur border-b border-white/30 shadow-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-orange-600">
            🍽 SmartX Foods
          </Link>
          <div className="flex items-center gap-4">
            <BackButton />
            <Link href="/menu" className="text-sm text-gray-500 hover:text-orange-600 transition-colors">
              Browse Menu
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-extrabold text-white drop-shadow-lg mb-2">Your Cart</h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🛒</div>
            <p className="text-xl text-gray-500 mb-6">Your cart is empty.</p>
            <Link
              href="/menu"
              className="inline-block bg-orange-500 text-white font-semibold px-6 py-3 rounded-xl hover:bg-orange-600 transition-colors"
            >
              Browse Menu
            </Link>
          </div>
        ) : (
          <>
            {/* Summary bar */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-2 text-sm">
                <span className="text-orange-700 font-semibold">{totalUniqueItems}</span>
                <span className="text-orange-600 ml-1">{totalUniqueItems === 1 ? "item type" : "item types"}</span>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-2 text-sm">
                <span className="text-orange-700 font-semibold">{totalItems}</span>
                <span className="text-orange-600 ml-1">total {totalItems === 1 ? "item" : "items"}</span>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-2 text-sm">
                <span className="text-orange-700 font-semibold">${subtotal.toFixed(2)}</span>
                <span className="text-orange-600 ml-1">subtotal</span>
              </div>
            </div>

            {/* Column headers */}
            <div className="hidden sm:grid grid-cols-[1fr_auto_auto_auto] gap-4 px-5 pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              <span>Item</span>
              <span className="text-center w-28">Quantity</span>
              <span className="text-right w-20">Price each</span>
              <span className="text-right w-20">Row total</span>
            </div>

            {/* Items list */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-100">
              {cartItems.map(({ menuItem, quantity }) => (
                <div
                  key={menuItem.id}
                  className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto_auto] gap-3 sm:gap-4 items-center px-5 py-4"
                >
                  {/* Name */}
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{menuItem.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5 sm:hidden">
                      ${menuItem.price.toFixed(2)} each · Total: ${(menuItem.price * quantity).toFixed(2)}
                    </p>
                  </div>

                  {/* Quantity controls */}
                  <div className="flex items-center gap-2 w-28">
                    <button
                      onClick={() => updateQuantity(menuItem.id, quantity - 1)}
                      disabled={quantity === 1}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-lg leading-none"
                    >
                      –
                    </button>
                    <span className="w-6 text-center font-bold text-gray-800 tabular-nums">
                      {quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(menuItem.id, quantity + 1)}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-700 hover:bg-gray-100 font-bold text-lg leading-none"
                    >
                      +
                    </button>
                  </div>

                  {/* Unit price */}
                  <span className="hidden sm:block w-20 text-right text-gray-500 text-sm tabular-nums">
                    ${menuItem.price.toFixed(2)}
                  </span>

                  {/* Row total */}
                  <span className="hidden sm:block w-20 text-right font-semibold text-orange-500 tabular-nums">
                    ${(menuItem.price * quantity).toFixed(2)}
                  </span>

                  {/* Remove (below on mobile, inline on desktop) */}
                  <button
                    onClick={() => removeItem(menuItem.id)}
                    className="text-red-400 hover:text-red-600 text-xs font-medium sm:col-start-2 sm:col-span-3 text-left sm:text-right"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            {/* Subtotal row */}
            <div className="mt-4 flex items-center justify-between bg-white rounded-2xl px-5 py-4 border border-gray-100 shadow-sm">
              <div>
                <p className="text-sm text-gray-500">{totalItems} {totalItems === 1 ? "item" : "items"} in cart</p>
                <p className="text-lg font-bold text-gray-800">Order Subtotal</p>
              </div>
              <span className="text-3xl font-extrabold text-orange-500">
                ${subtotal.toFixed(2)}
              </span>
            </div>

            {/* Checkout button */}
            <div className="mt-6">
              <button
                onClick={() => router.push("/checkout")}
                className="w-full bg-orange-500 text-white font-bold text-lg py-4 rounded-2xl hover:bg-orange-600 transition-colors shadow-md"
              >
                Proceed to Checkout → ${subtotal.toFixed(2)}
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
