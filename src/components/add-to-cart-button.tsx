"use client";

import { useState } from "react";
import {
  CART_STORAGE_KEY,
  CART_UPDATED_EVENT,
  type CartItem,
} from "@/lib/cart";

function readCart() {
  try {
    const rawCart = window.localStorage.getItem(CART_STORAGE_KEY);

    return rawCart ? (JSON.parse(rawCart) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function writeCart(items: CartItem[]) {
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(CART_UPDATED_EVENT));
}

export function AddToCartButton({
  item,
  className = "",
}: {
  item: Omit<CartItem, "quantity">;
  className?: string;
}) {
  const [wasAdded, setWasAdded] = useState(false);

  function addToCart() {
    const cart = readCart();
    const existingItem = cart.find((cartItem) => cartItem.slug === item.slug);

    const nextCart = existingItem
      ? cart.map((cartItem) =>
          cartItem.slug === item.slug
            ? {
                ...cartItem,
                quantity: cartItem.quantity + 1,
              }
            : cartItem,
        )
      : [
          ...cart,
          {
            ...item,
            quantity: 1,
          },
        ];

    writeCart(nextCart);
    setWasAdded(true);
    window.setTimeout(() => setWasAdded(false), 1800);
  }

  return (
    <button
      type="button"
      onClick={addToCart}
      className={`rounded-md bg-[#147d64] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0f604d] ${className}`}
    >
      {wasAdded ? "Added" : "Add to cart"}
    </button>
  );
}
