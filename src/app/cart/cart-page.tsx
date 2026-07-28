"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PayfastLogo } from "@/components/payfast-logo";
import { formatPrice } from "@/data/catalogue";
import {
  CART_STORAGE_KEY,
  CART_UPDATED_EVENT,
  formatCartDiscountTotal,
  formatCartOriginalTotal,
  formatCartTotal,
  getCartItemLineTotalCents,
  getCartItemOriginalLineTotalCents,
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
  const originalTotalCents = useMemo(
    () => formatCartOriginalTotal(cart),
    [cart],
  );
  const discountTotalCents = useMemo(
    () => formatCartDiscountTotal(cart),
    [cart],
  );

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
    <section className="mx-auto max-w-7xl px-5 py-9 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#ff6a00]">
          Checkout
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">Cart</h1>
        <p className="mt-3 text-base leading-7 text-[#5f5f66] sm:mt-4 sm:text-lg sm:leading-8">
          Review selected DokKit products before creating your order.
        </p>
      </div>

      {cart.length === 0 ? (
        <div className="mt-7 rounded-md border border-[#ece7df] bg-white p-6 shadow-sm sm:mt-10 sm:p-8">
          <h2 className="text-xl font-semibold">Your cart is empty</h2>
          <p className="mt-3 text-sm leading-6 text-[#5f5f66]">
            Browse an industry package or single document to add products.
          </p>
          <Link
            href="/industries"
            className="mt-6 inline-flex min-h-12 items-center rounded-md bg-[#ff6a00] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#d95400]"
          >
            Browse industries
          </Link>
        </div>
      ) : (
        <div className="mt-7 grid gap-6 sm:mt-10 lg:grid-cols-[1fr_360px] lg:gap-8">
          <div className="grid gap-3 sm:gap-4">
            {cart.map((item) => {
              const lineTotalCents = getCartItemLineTotalCents(item);
              const originalLineTotalCents =
                getCartItemOriginalLineTotalCents(item);
              const hasOfferSaving = originalLineTotalCents > lineTotalCents;

              return (
                <article
                  key={item.slug}
                  className="rounded-md border border-[#ece7df] bg-white p-4 shadow-sm sm:p-5"
                >
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#ff6a00]">
                        {item.category === "industry_package"
                          ? "Industry package"
                          : "Single document"}
                      </p>
                      <h2 className="mt-2 text-xl font-semibold">
                        {item.name}
                      </h2>
                      {item.description ? (
                        <p className="mobile-line-clamp mt-2 text-sm leading-6 text-[#5f5f66] sm:block">
                          {item.description}
                        </p>
                      ) : null}
                      {hasOfferSaving && item.discountPercent ? (
                        <p className="mt-3 w-fit rounded-full bg-[#fff4eb] px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-[#d95400]">
                          {item.offerLabel ?? "Launch offer"} -{" "}
                          {item.discountPercent}% off
                        </p>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.slug, item.quantity - 1)
                        }
                        className="h-11 w-11 rounded-md border border-[#d7d0c7] text-lg font-bold"
                        aria-label={`Decrease quantity of ${item.name}`}
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-sm font-semibold">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.slug, item.quantity + 1)
                        }
                        className="h-11 w-11 rounded-md border border-[#d7d0c7] text-lg font-bold"
                        aria-label={`Increase quantity of ${item.name}`}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="mt-5 flex items-center justify-between border-t border-[#eef2ef] pt-4 text-sm">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.slug, 0)}
                      className="inline-flex min-h-11 items-center font-semibold text-[#5f5f66] hover:text-red-700"
                    >
                      Remove
                    </button>
                    <div className="text-right">
                      {hasOfferSaving ? (
                        <p className="text-xs font-semibold text-[#8a8178] line-through">
                          {formatPrice(originalLineTotalCents)}
                        </p>
                      ) : null}
                      <p className="font-semibold text-[#ff6a00]">
                        {formatPrice(lineTotalCents)}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <aside className="h-fit rounded-md border border-[#ece7df] bg-white p-5 shadow-sm sm:p-6 lg:sticky lg:top-24">
            <h2 className="text-xl font-semibold">Order summary</h2>
            {discountTotalCents > 0 ? (
              <>
                <div className="mt-5 flex items-center justify-between text-sm">
                  <span className="text-[#5f5f66]">Standard price</span>
                  <span className="font-semibold">
                    {formatPrice(originalTotalCents)}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-[#5f5f66]">Launch offer saving</span>
                  <span className="font-semibold text-[#d95400]">
                    -{formatPrice(discountTotalCents)}
                  </span>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-[#eef2ef] pt-4 text-sm">
                  <span className="text-[#5f5f66]">Total</span>
                  <span className="font-semibold">
                    {formatPrice(totalCents)}
                  </span>
                </div>
              </>
            ) : (
              <div className="mt-5 flex items-center justify-between text-sm">
                <span className="text-[#5f5f66]">Subtotal</span>
                <span className="font-semibold">{formatPrice(totalCents)}</span>
              </div>
            )}
            <p className="mt-3 text-xs leading-5 text-[#5f5f66]">
              Payment is handled securely through Payfast by Network.
            </p>
            <div className="mt-4 rounded-md border border-black/10 bg-white px-4 py-3">
              <PayfastLogo className="h-8 w-auto" />
            </div>
            <Link
              href="/checkout"
              className="mt-6 flex min-h-12 w-full items-center justify-center rounded-md bg-[#c24100] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#9a3412]"
            >
              Continue to secure checkout
            </Link>
            <p className="mt-3 text-center text-xs leading-5 text-[#5f5f66]">
              Pay securely with PayFast. Downloads unlock after payment
              verification and are also sent by email.
            </p>
            <Link
              href="/recommended-add-ons"
              className="mt-4 flex min-h-12 w-full items-center justify-center rounded-md border border-[#111111] px-5 py-3 text-sm font-semibold text-[#111111] transition hover:bg-[#111111] hover:text-white"
            >
              Review up to 3 optional add-ons
            </Link>
            <button
              type="button"
              onClick={clearCart}
              className="mt-3 min-h-11 w-full rounded-md border border-[#ece7df] px-5 py-3 text-sm font-semibold text-[#111111] transition hover:border-[#ff6a00]"
            >
              Clear cart
            </button>
          </aside>
        </div>
      )}
    </section>
  );
}
