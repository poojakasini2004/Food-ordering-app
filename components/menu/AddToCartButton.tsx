"use client";

import { useCart } from "@/context/CartContext";
import type { MenuItem } from "@/lib/db";

interface AddToCartButtonProps {
  menuItem: MenuItem;
}

export default function AddToCartButton({ menuItem }: AddToCartButtonProps) {
  const { cartItems, addItem } = useCart();

  const cartItem = cartItems.find((ci) => ci.menuItem.id === menuItem.id);
  const qty = cartItem?.quantity ?? 0;

  if (!menuItem.isAvailable) {
    return (
      <button
        disabled
        className="px-4 py-2 rounded-xl text-sm font-semibold bg-gray-200 text-gray-400 cursor-not-allowed"
      >
        Unavailable
      </button>
    );
  }

  return (
    <button
      onClick={() => addItem(menuItem)}
      className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-orange-600 transition-colors"
    >
      {qty > 0 ? (
        <>
          <span>Add to Cart</span>
          <span className="bg-white text-orange-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
            {qty}
          </span>
        </>
      ) : (
        "Add to Cart"
      )}
    </button>
  );
}
