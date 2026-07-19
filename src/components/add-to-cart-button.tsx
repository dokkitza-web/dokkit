"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useConsent } from "@/components/analytics-provider";
import {
  CART_STORAGE_KEY,
  CART_UPDATED_EVENT,
  type CartItem,
} from "@/lib/cart";
import { toAnalyticsItem, trackCommerceEvent } from "@/lib/analytics";

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
  const buttonRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const { preferences, ready } = useConsent();

  useEffect(() => {
    const button = buttonRef.current;

    if (
      !button ||
      !ready ||
      (!preferences?.analytics && !preferences?.marketing)
    ) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) {
          return;
        }

        trackCommerceEvent({
          name: "view_item",
          items: [toAnalyticsItem({ ...item, quantity: 1 })],
          valueCents: item.priceCents,
          dedupeKey: `view_item:${pathname}:${item.slug}`,
        });
        observer.disconnect();
      },
      { threshold: 0.4 },
    );

    observer.observe(button);
    return () => observer.disconnect();
  }, [item, pathname, preferences?.analytics, preferences?.marketing, ready]);

  function addToCart() {
    const cart = readCart();
    const existingItem = cart.find((cartItem) => cartItem.slug === item.slug);

    const nextCart = existingItem
      ? cart.map((cartItem) =>
          cartItem.slug === item.slug
            ? {
                ...cartItem,
                ...item,
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
    trackCommerceEvent({
      name: "add_to_cart",
      items: [toAnalyticsItem({ ...item, quantity: 1 })],
      valueCents: item.priceCents,
    });
    setWasAdded(true);
    window.setTimeout(() => setWasAdded(false), 1800);
  }

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={addToCart}
      className={`rounded-full bg-[#ff6a00] px-5 py-3 text-sm font-black text-white shadow-lg shadow-[#ff6a00]/20 transition hover:bg-[#d95400] ${className}`}
    >
      {wasAdded ? "Added" : "Add to cart"}
    </button>
  );
}
