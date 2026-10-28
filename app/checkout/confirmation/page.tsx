"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import type { Order, OrderItem } from "@/lib/db";
import { useCart } from "@/context/CartContext";
import BackButton from "@/components/BackButton";
import { getOrderById } from "./actions";

export default function ConfirmationPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const { clearCart } = useCart();

  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrder() {
      if (!orderId) {
        setLoading(false);
        return;
      }

      try {
        // First, try to get order from sessionStorage (just confirmed)
        const storedData = sessionStorage.getItem('confirmedOrder');
        if (storedData) {
          const { order: storedOrder, items: storedItems } = JSON.parse(storedData);
          setOrder(storedOrder);
          setItems(storedItems);
          clearCart();
          // Clear the stored data after use
          sessionStorage.removeItem('confirmedOrder');
          setLoading(false);
          return;
        }

        // If not in sessionStorage, fetch from server
        const result = await getOrderById(orderId);
        if (result) {
          setOrder(result.order);
          setItems(result.items);
          clearCart();
        }
      } catch (error) {
        console.error("Failed to load order:", error);
      } finally {
        setLoading(false);
      }
    }

    loadOrder();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">⏳</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Loading Order...</h1>
          <p className="text-gray-500">Please wait while we fetch your order details.</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h1>
          <p className="text-gray-500 mb-6">
            We couldn&apos;t find the order you&apos;re looking for.
          </p>
          <Link
            href="/menu"
            className="inline-block bg-orange-500 text-white font-semibold px-6 py-3 rounded-xl hover:bg-orange-600 transition-colors"
          >
            Back to Menu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-orange-600">
            🍽 SmartX Foods
          </Link>
          <BackButton />
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 py-10 space-y-6">
        {/* Success banner */}
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
          <div className="text-5xl mb-3">✅</div>
          <h1 className="text-2xl font-extrabold text-green-800">Your Order is Confirmed!</h1>
          <p className="text-green-700 mt-1">Please wait for your order. It is being prepared with care.</p>
          <p className="text-green-600 mt-2 text-sm">A confirmation email has been sent to your inbox.</p>
        </div>

        {/* Order details */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-bold text-gray-800">Order Details</h2>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-500">Order ID</p>
              <p className="font-mono font-semibold text-gray-800 text-xs break-all">{order.id}</p>
            </div>
            <div>
              <p className="text-gray-500">Name</p>
              <p className="font-semibold text-gray-800">{order.customerName}</p>
            </div>
            <div className="col-span-2">
              <p className="text-gray-500">Delivery Address</p>
              <p className="font-semibold text-gray-800">{order.deliveryAddress}</p>
            </div>
          </div>

          {/* Items */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Items Ordered</h3>
            <div className="divide-y divide-gray-100">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between py-2 text-sm">
                  <span className="text-gray-700">
                    {item.itemNameSnapshot} × {item.quantity}
                  </span>
                  <span className="font-semibold text-gray-900">
                    ${(item.unitPrice * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="flex justify-between pt-3 border-t border-gray-100">
            <span className="font-bold text-gray-800">Total</span>
            <span className="text-xl font-bold text-orange-500">
              ${order.totalAmount.toFixed(2)}
            </span>
          </div>

          {/* Payment */}
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
            <span className="text-green-700 text-lg">💵</span>
            <span className="font-semibold text-green-800">Payment: Cash on Delivery</span>
          </div>
        </div>

        <Link
          href="/menu"
          className="block text-center text-orange-600 font-semibold hover:underline"
        >
          Order more from our menu →
        </Link>
      </main>
    </div>
  );
}
