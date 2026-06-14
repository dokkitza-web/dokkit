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
      className="rounded-md border border-[#b9c8c0] px-4 py-2 text-sm font-semibold text-[#15201c] transition hover:border-[#147d64]"
    >
      Cart{count ? ` (${count})` : ""}
    </Link>
  );
}
