"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { formatPrice } from "@/data/catalogue";
import {
  CART_STORAGE_KEY,
  CART_UPDATED_EVENT,
  formatCartTotal,
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

export function CartPage() {
  const [cart, setCart] = useState<CartItem[]>(readCart);

  const totalCents = useMemo(() => formatCartTotal(cart), [cart]);

  function updateQuantity(slug: string, quantity: number) {
    const nextCart = cart
      .map((item) =>
        item.slug === slug
          ? {
              ...item,
              quantity,
            }
          : item,
      )
      .filter((item) => item.quantity > 0);

    setCart(nextCart);
    writeCart(nextCart);
  }

  function clearCart() {
    setCart([]);
    writeCart([]);
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#147d64]">
          Checkout
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">Cart</h1>
        <p className="mt-4 text-lg leading-8 text-[#53615b]">
          Review selected DokKit products before creating your order.
        </p>
      </div>

      {cart.length === 0 ? (
        <div className="mt-10 rounded-lg border border-[#dfe7e2] bg-white p-8 shadow-sm">
          <h2 className="text-xl font-semibold">Your cart is empty</h2>
          <p className="mt-3 text-sm leading-6 text-[#53615b]">
            Browse an industry package or single document to add products.
          </p>
          <Link
            href="/industries"
            className="mt-6 inline-flex rounded-md bg-[#147d64] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0f604d]"
          >
            Browse industries
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="grid gap-4">
            {cart.map((item) => (
              <article
                key={item.slug}
                className="rounded-lg border border-[#dfe7e2] bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#147d64]">
                      {item.category === "industry_package"
                        ? "Industry package"
                        : "Single document"}
                    </p>
                    <h2 className="mt-2 text-xl font-semibold">{item.name}</h2>
                    {item.description ? (
                      <p className="mt-2 text-sm leading-6 text-[#53615b]">
                        {item.description}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.slug, item.quantity - 1)}
                      className="h-9 w-9 rounded-md border border-[#dfe7e2] text-lg"
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-sm font-semibold">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.slug, item.quantity + 1)}
                      className="h-9 w-9 rounded-md border border-[#dfe7e2] text-lg"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="mt-5 flex items-center justify-between border-t border-[#eef2ef] pt-4 text-sm">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.slug, 0)}
                    className="font-semibold text-[#53615b] hover:text-red-700"
                  >
                    Remove
                  </button>
                  <p className="font-semibold text-[#147d64]">
                    {formatPrice(item.priceCents * item.quantity)}
                  </p>
                </div>
              </article>
            ))}
          </div>

          <aside className="h-fit rounded-lg border border-[#dfe7e2] bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Order summary</h2>
            <div className="mt-5 flex items-center justify-between text-sm">
              <span className="text-[#53615b]">Subtotal</span>
              <span className="font-semibold">{formatPrice(totalCents)}</span>
            </div>
            <p className="mt-3 text-xs leading-5 text-[#53615b]">
              Payment is handled through PayFast once checkout is configured.
            </p>
            <Link
              href="/checkout"
              className="mt-6 flex w-full justify-center rounded-md bg-[#147d64] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0f604d]"
            >
              Continue to checkout
            </Link>
            <button
              type="button"
              onClick={clearCart}
              className="mt-3 w-full rounded-md border border-[#dfe7e2] px-5 py-3 text-sm font-semibold text-[#15201c] transition hover:border-[#147d64]"
            >
              Clear cart
            </button>
          </aside>
        </div>
      )}
    </section>
  );
}
