"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PayfastLogo } from "@/components/payfast-logo";
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
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#ff6a00]">
          Checkout
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">Cart</h1>
        <p className="mt-4 text-lg leading-8 text-[#5f5f66]">
          Review selected DokKit products before creating your order.
        </p>
      </div>

      {cart.length === 0 ? (
        <div className="mt-10 rounded-lg border border-[#ece7df] bg-white p-8 shadow-sm">
          <h2 className="text-xl font-semibold">Your cart is empty</h2>
          <p className="mt-3 text-sm leading-6 text-[#5f5f66]">
            Browse an industry package or single document to add products.
          </p>
          <Link
            href="/industries"
            className="mt-6 inline-flex rounded-md bg-[#ff6a00] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#d95400]"
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
                className="rounded-lg border border-[#ece7df] bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#ff6a00]">
                      {item.category === "industry_package"
                        ? "Industry package"
                        : "Single document"}
                    </p>
                    <h2 className="mt-2 text-xl font-semibold">{item.name}</h2>
                    {item.description ? (
                      <p className="mt-2 text-sm leading-6 text-[#5f5f66]">
                        {item.description}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.slug, item.quantity - 1)}
                      className="h-9 w-9 rounded-md border border-[#ece7df] text-lg"
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-sm font-semibold">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.slug, item.quantity + 1)}
                      className="h-9 w-9 rounded-md border border-[#ece7df] text-lg"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="mt-5 flex items-center justify-between border-t border-[#eef2ef] pt-4 text-sm">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.slug, 0)}
                    className="font-semibold text-[#5f5f66] hover:text-red-700"
                  >
                    Remove
                  </button>
                  <p className="font-semibold text-[#ff6a00]">
                    {formatPrice(item.priceCents * item.quantity)}
                  </p>
                </div>
              </article>
            ))}
          </div>

          <aside className="h-fit rounded-lg border border-[#ece7df] bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Order summary</h2>
            <div className="mt-5 flex items-center justify-between text-sm">
              <span className="text-[#5f5f66]">Subtotal</span>
              <span className="font-semibold">{formatPrice(totalCents)}</span>
            </div>
            <p className="mt-3 text-xs leading-5 text-[#5f5f66]">
              Payment is handled securely through Payfast by Network.
            </p>
            <div className="mt-4 rounded-2xl border border-black/10 bg-white px-4 py-3">
              <PayfastLogo className="h-8 w-auto" />
            </div>
            <Link
              href="/checkout"
              className="mt-6 flex w-full justify-center rounded-md bg-[#ff6a00] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#d95400]"
            >
              Continue to checkout
            </Link>
            <button
              type="button"
              onClick={clearCart}
              className="mt-3 w-full rounded-md border border-[#ece7df] px-5 py-3 text-sm font-semibold text-[#111111] transition hover:border-[#ff6a00]"
            >
              Clear cart
            </button>
          </aside>
        </div>
      )}
    </section>
  );
}
