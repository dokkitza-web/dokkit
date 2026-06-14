"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { formatPrice } from "@/data/catalogue";
import {
  CART_STORAGE_KEY,
  CART_UPDATED_EVENT,
  formatCartTotal,
  type CartItem,
} from "@/lib/cart";

type CheckoutResponse = {
  orderNumber: string;
  totalCents: number;
  payment:
    | {
        mode: "payfast";
        processUrl: string;
        fields: Record<string, string>;
      }
    | {
        mode: "configuration_required";
        message: string;
      };
};

function readCart() {
  try {
    const rawCart = window.localStorage.getItem(CART_STORAGE_KEY);

    return rawCart ? (JSON.parse(rawCart) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function clearCart() {
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify([]));
  window.dispatchEvent(new Event(CART_UPDATED_EVENT));
}

function submitPayFastForm(processUrl: string, fields: Record<string, string>) {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = processUrl;

  Object.entries(fields).forEach(([name, value]) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
}

export function CheckoutPage() {
  const [cart, setCart] = useState<CartItem[]>(readCart);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pendingOrder, setPendingOrder] = useState<CheckoutResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const totalCents = useMemo(() => formatCartTotal(cart), [cart]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPendingOrder(null);
    setIsSubmitting(true);

    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customer: {
          email,
          fullName,
          phone,
        },
        items: cart.map((item) => ({
          slug: item.slug,
          quantity: item.quantity,
        })),
      }),
    });
    const payload = await response.json();
    setIsSubmitting(false);

    if (!response.ok) {
      setError(payload.error ?? "Unable to create checkout order.");
      return;
    }

    const checkoutResponse = payload as CheckoutResponse;
    clearCart();
    setCart([]);
    setPendingOrder(checkoutResponse);

    if (checkoutResponse.payment.mode === "payfast") {
      submitPayFastForm(
        checkoutResponse.payment.processUrl,
        checkoutResponse.payment.fields,
      );
    }
  }

  if (!cart.length && !pendingOrder) {
    return (
      <section className="mx-auto max-w-3xl px-6 py-14 lg:px-8">
        <div className="rounded-lg border border-[#dfe7e2] bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-semibold tracking-tight">
            Checkout needs a cart
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#53615b]">
            Add at least one DokKit product before checkout.
          </p>
          <Link
            href="/industries"
            className="mt-6 inline-flex rounded-md bg-[#147d64] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0f604d]"
          >
            Browse industries
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#147d64]">
          Secure checkout
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">Checkout</h1>
        <p className="mt-4 text-lg leading-8 text-[#53615b]">
          Enter customer details to create a pending DokKit order.
        </p>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]">
        <form
          onSubmit={handleSubmit}
          className="rounded-lg border border-[#dfe7e2] bg-white p-6 shadow-sm"
        >
          <h2 className="text-xl font-semibold">Customer details</h2>
          <div className="mt-6 grid gap-5">
            <label className="grid gap-2 text-sm font-medium text-[#15201c]">
              Email address
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="rounded-md border border-[#b9c8c0] bg-white px-4 py-3 text-base outline-none transition focus:border-[#147d64] focus:ring-2 focus:ring-[#c8eadf]"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-[#15201c]">
              Full name
              <input
                type="text"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                className="rounded-md border border-[#b9c8c0] bg-white px-4 py-3 text-base outline-none transition focus:border-[#147d64] focus:ring-2 focus:ring-[#c8eadf]"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-[#15201c]">
              Phone number
              <input
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className="rounded-md border border-[#b9c8c0] bg-white px-4 py-3 text-base outline-none transition focus:border-[#147d64] focus:ring-2 focus:ring-[#c8eadf]"
              />
            </label>
          </div>

          {error ? (
            <p className="mt-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          {pendingOrder?.payment.mode === "configuration_required" ? (
            <div className="mt-5 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <p className="font-semibold">
                Pending order created: {pendingOrder.orderNumber}
              </p>
              <p className="mt-2">{pendingOrder.payment.message}</p>
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting || cart.length === 0}
            className="mt-6 rounded-md bg-[#147d64] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0f604d] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Creating order..." : "Create order and pay"}
          </button>
        </form>

        <aside className="h-fit rounded-lg border border-[#dfe7e2] bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Order summary</h2>
          <div className="mt-5 grid gap-4">
            {cart.map((item) => (
              <div key={item.slug} className="border-b border-[#eef2ef] pb-3">
                <div className="flex justify-between gap-4 text-sm">
                  <span className="font-medium">{item.name}</span>
                  <span className="font-semibold">
                    {formatPrice(item.priceCents * item.quantity)}
                  </span>
                </div>
                <p className="mt-1 text-xs text-[#53615b]">
                  Qty {item.quantity}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-5 flex items-center justify-between text-sm">
            <span className="text-[#53615b]">Total</span>
            <span className="text-xl font-semibold text-[#147d64]">
              {formatPrice(totalCents)}
            </span>
          </div>
        </aside>
      </div>
    </section>
  );
}
