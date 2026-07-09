"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  CART_STORAGE_KEY,
  CART_UPDATED_EVENT,
  formatCartCount,
  type CartItem,
} from "@/lib/cart";

function readCartCount() {
  try {
    const rawCart = window.localStorage.getItem(CART_STORAGE_KEY);
    const cart = rawCart ? (JSON.parse(rawCart) as CartItem[]) : [];

    return formatCartCount(cart);
  } catch {
    return 0;
  }
}

export function CartLink() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    function updateCount() {
      setCount(readCartCount());
    }

    updateCount();
    window.addEventListener("storage", updateCount);
    window.addEventListener(CART_UPDATED_EVENT, updateCount);

    return () => {
      window.removeEventListener("storage", updateCount);
      window.removeEventListener(CART_UPDATED_EVENT, updateCount);
    };
  }, []);

  return (
    <Link
      href="/cart"
      aria-label={count ? `Cart with ${count} items` : "Cart"}
      className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white text-[#ff6a00] shadow-sm transition hover:border-[#ff6a00] hover:bg-[#fff4eb]"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.2"
      >
        <circle cx="9" cy="20" r="1.5" />
        <circle cx="18" cy="20" r="1.5" />
        <path d="M3 4h2l2.2 10.4a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 2-1.5L21 8H6.1" />
      </svg>
      {count ? (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#111111] px-1.5 text-[11px] font-black leading-none text-white">
          {count}
        </span>
      ) : null}
    </Link>
  );
}
