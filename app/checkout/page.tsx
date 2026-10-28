"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { createOrder } from "./actions";
import BackButton from "@/components/BackButton";

interface FieldErrors {
  customerName?: string;
  email?: string;
  deliveryAddress?: string;
  phone?: string;
}

function validate(name: string, email: string, address: string, phone: string): FieldErrors {
  const errors: FieldErrors = {};
  if (!name.trim()) errors.customerName = "Full name is required.";
  if (!email.trim()) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.email = "Please enter a valid email address.";
  }
  if (!address.trim()) errors.deliveryAddress = "Delivery address is required.";
  if (!phone.trim()) {
    errors.phone = "Phone number is required.";
  } else if (!/^\d{7,}$/.test(phone.trim())) {
    errors.phone = "Phone must be numeric and at least 7 digits.";
  }
  return errors;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, subtotal } = useCart();

  const [customerName, setCustomerName] = useState("");
  const [email, setEmail] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [touched, setTouched] = useState({ customerName: false, email: false, deliveryAddress: false, phone: false });
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Redirect to menu if cart is empty
  useEffect(() => {
    if (cartItems.length === 0) {
      router.push("/menu");
    }
  }, [cartItems, router]);

  const errors = validate(customerName, email, deliveryAddress, phone);
  const hasErrors = Object.keys(errors).length > 0;

  async function handlePlaceOrder() {
    setTouched({ customerName: true, email: true, deliveryAddress: true, phone: true });
    if (hasErrors) return;

    setSubmitting(true);
    setServerError(null);

    try {
      const result = await createOrder({
        customerName,
        email,
        phone,
        deliveryAddress,
        cartItems: cartItems.map(({ menuItem, quantity }) => ({
          menuItemId: menuItem.id,
          itemNameSnapshot: menuItem.name,
          quantity,
          unitPrice: menuItem.price,
        })),
      });

      if (result.success) {
        // Store order data in sessionStorage for confirmation page
        sessionStorage.setItem('confirmedOrder', JSON.stringify({
          order: result.order,
          items: result.items
        }));
        router.push(`/checkout/confirmation?orderId=${result.orderId}`);
      } else {
        setServerError(result.error);
      }
    } catch {
      setServerError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (cartItems.length === 0) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-orange-600">
            🍽 SmartX Foods
          </Link>
          <div className="flex items-center gap-4">
            <BackButton />
            <Link href="/cart" className="text-sm text-gray-500 hover:text-orange-600">
              View Cart
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-10 space-y-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Checkout</h1>

        {/* Order summary */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Order Summary</h2>
          <div className="divide-y divide-gray-100">
            {cartItems.map(({ menuItem, quantity }) => (
              <div key={menuItem.id} className="flex justify-between py-3 text-sm">
                <span className="text-gray-700">
                  {menuItem.name} × {quantity}
                </span>
                <span className="font-semibold text-gray-900">
                  ${(menuItem.price * quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
          <div className="flex justify-between pt-4 border-t border-gray-100 mt-2">
            <span className="font-bold text-gray-800">Total</span>
            <span className="text-xl font-bold text-orange-500">${subtotal.toFixed(2)}</span>
          </div>
        </section>

        {/* Delivery details */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <h2 className="text-lg font-bold text-gray-800">Delivery Details</h2>

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, customerName: true }))}
              placeholder="Your full name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            {touched.customerName && errors.customerName && (
              <p className="mt-1 text-sm text-red-600">{errors.customerName}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, email: true }))}
              placeholder="your.email@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            {touched.email && errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Delivery Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Delivery Address
            </label>
            <input
              type="text"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, deliveryAddress: true }))}
              placeholder="Street, city, postcode"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            {touched.deliveryAddress && errors.deliveryAddress && (
              <p className="mt-1 text-sm text-red-600">{errors.deliveryAddress}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
              placeholder="e.g. 07911123456"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            {touched.phone && errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
            )}
          </div>

          {/* Payment method — static label only */}
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
            <span className="text-green-700 text-lg">💵</span>
            <span className="font-semibold text-green-800">Payment: Cash on Delivery</span>
          </div>
        </section>

        {/* Server error */}
        {serverError && (
          <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg">{serverError}</p>
        )}

        {/* Place Order */}
        <button
          onClick={handlePlaceOrder}
          disabled={submitting || (Object.keys(touched).some((k) => touched[k as keyof typeof touched]) && hasErrors)}
          className="w-full bg-orange-500 text-white font-bold text-lg py-4 rounded-2xl hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? "Placing Order..." : "Place Order"}
        </button>
      </main>
    </div>
  );
}
