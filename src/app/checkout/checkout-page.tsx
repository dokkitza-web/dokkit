"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useConsent } from "@/components/analytics-provider";
import { PayfastLogo } from "@/components/payfast-logo";
import { formatPrice } from "@/data/catalogue";
import {
  CHECKOUT_DISCLOSURE_COPY,
  policyLinks,
  supplierIdentity,
} from "@/data/legal-policies";
import {
  getMetaAttribution,
  toAnalyticsItem,
  trackCommerceEvent,
} from "@/lib/analytics";
import {
  CART_STORAGE_KEY,
  formatCartDiscountTotal,
  formatCartOriginalTotal,
  formatCartTotal,
  getCartItemLineTotalCents,
  getCartItemOriginalLineTotalCents,
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

type CheckoutQuote = {
  subtotalCents: number;
  discountCents: number;
  totalCents: number;
  items: {
    slug: string;
    name: string;
    quantity: number;
    unitPriceCents: number;
    totalCents: number;
  }[];
};

function readCart() {
  try {
    const rawCart = window.localStorage.getItem(CART_STORAGE_KEY);

    return rawCart ? (JSON.parse(rawCart) as CartItem[]) : [];
  } catch {
    return [];
  }
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
  const [cart] = useState<CartItem[]>(readCart);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pendingOrder, setPendingOrder] = useState<CheckoutResponse | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [policyAccepted, setPolicyAccepted] = useState(false);
  const [acceptanceError, setAcceptanceError] = useState<string | null>(null);
  const [quote, setQuote] = useState<CheckoutQuote | null>(null);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(true);
  const checkoutAttemptId = useRef(crypto.randomUUID());
  const { preferences, ready } = useConsent();
  const cartTotalCents = useMemo(() => formatCartTotal(cart), [cart]);
  const originalTotalCents = useMemo(
    () => formatCartOriginalTotal(cart),
    [cart],
  );
  const discountTotalCents = useMemo(
    () => formatCartDiscountTotal(cart),
    [cart],
  );
  const cartSignature = useMemo(
    () =>
      cart
        .map((item) => `${item.slug}:${item.quantity}`)
        .sort()
        .join(","),
    [cart],
  );

  useEffect(() => {
    if (!cart.length) {
      return;
    }

    const controller = new AbortController();

    void fetch("/api/checkout/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: cart.map((item) => ({
          slug: item.slug,
          quantity: item.quantity,
        })),
      }),
      signal: controller.signal,
    })
      .then(async (response) => {
        const payload = await response.json().catch(() => null);

        if (!response.ok || !payload) {
          throw new Error(
            payload?.error ?? "Could not verify the order total.",
          );
        }

        setQuote(payload as CheckoutQuote);
      })
      .catch((quoteRequestError) => {
        if (
          quoteRequestError instanceof DOMException &&
          quoteRequestError.name === "AbortError"
        ) {
          return;
        }

        setQuote(null);
        setQuoteError(
          quoteRequestError instanceof Error
            ? quoteRequestError.message
            : "Could not verify the order total.",
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setQuoteLoading(false);
        }
      });

    return () => controller.abort();
  }, [cart, cartSignature]);

  useEffect(() => {
    if (
      !ready ||
      !cart.length ||
      (!preferences?.analytics && !preferences?.marketing)
    ) {
      return;
    }

    trackCommerceEvent({
      name: "begin_checkout",
      items: cart.map(toAnalyticsItem),
      valueCents: quote?.totalCents ?? cartTotalCents,
      dedupeKey: `begin_checkout:${cartSignature}`,
    });
  }, [
    cart,
    cartSignature,
    cartTotalCents,
    preferences?.analytics,
    preferences?.marketing,
    quote?.totalCents,
    ready,
  ]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPendingOrder(null);

    if (!policyAccepted) {
      setAcceptanceError(
        "Select the policy agreement before continuing to PayFast.",
      );
      return;
    }

    if (!quote) {
      setError(
        quoteError ??
          "The server-verified total is not ready. Please wait and try again.",
      );
      return;
    }

    setAcceptanceError(null);
    setIsSubmitting(true);

    try {
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
          quotedTotalCents: quote.totalCents,
          checkoutAttemptId: checkoutAttemptId.current,
          policyAccepted,
          attribution: getMetaAttribution(),
        }),
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok || !payload) {
        if (response.status === 409 && Number.isInteger(payload?.totalCents)) {
          setQuote((current) =>
            current ? { ...current, totalCents: payload.totalCents } : current,
          );
        }

        setError(
          payload?.error ??
            "Checkout could not be started. Your cart is still saved.",
        );
        return;
      }

      const checkoutResponse = payload as CheckoutResponse;
      setPendingOrder(checkoutResponse);

      if (checkoutResponse.payment.mode === "payfast") {
        submitPayFastForm(
          checkoutResponse.payment.processUrl,
          checkoutResponse.payment.fields,
        );
      }
    } catch {
      setError(
        "Checkout could not connect. Your cart is still saved, so you can try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!cart.length && !pendingOrder) {
    return (
      <section className="mx-auto max-w-3xl px-5 py-9 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
        <div className="rounded-md border border-[#ece7df] bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-3xl font-semibold">Checkout needs a cart</h1>
          <p className="mt-3 text-sm leading-6 text-[#5f5f66]">
            Add at least one DokKit product before checkout.
          </p>
          <Link
            href="/industries"
            className="mt-6 inline-flex min-h-12 items-center rounded-md bg-[#c24100] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#9a3412]"
          >
            Browse industries
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-5 py-9 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase text-[#a63d00]">
          Secure checkout
        </p>
        <h1 className="mt-3 text-4xl font-semibold">Checkout</h1>
        <p className="mt-3 text-base leading-7 text-[#5f5f66] sm:mt-4 sm:text-lg sm:leading-8">
          Enter the email address that should receive the order confirmation and
          secure download link. Payment is completed on PayFast.
        </p>
        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-[#5f5f66]">
          <span>Secure PayFast payment</span>
          <span>No subscription</span>
          <span>Email delivery after verification</span>
        </div>
      </div>

      <div className="mt-7 grid gap-6 sm:mt-10 lg:grid-cols-[1fr_360px] lg:gap-8">
        <form
          onSubmit={handleSubmit}
          className="order-2 rounded-md border border-[#ece7df] bg-white p-5 shadow-sm sm:p-6 lg:order-1"
        >
          <h2 className="text-xl font-semibold">Customer details</h2>
          <div className="mt-6 grid gap-5">
            <label className="grid gap-2 text-sm font-medium text-[#111111]">
              Email address
              <input
                type="email"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="rounded-md border border-[#cfc7bd] bg-white px-4 py-3 text-base outline-none transition focus:border-[#ff6a00] focus:ring-2 focus:ring-[#ffd8bd]"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-[#111111]">
              Full name
              <input
                type="text"
                name="name"
                autoComplete="name"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                className="rounded-md border border-[#cfc7bd] bg-white px-4 py-3 text-base outline-none transition focus:border-[#ff6a00] focus:ring-2 focus:ring-[#ffd8bd]"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-[#111111]">
              Phone number
              <input
                type="tel"
                name="tel"
                autoComplete="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className="rounded-md border border-[#cfc7bd] bg-white px-4 py-3 text-base outline-none transition focus:border-[#ff6a00] focus:ring-2 focus:ring-[#ffd8bd]"
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

          <div className="mt-6 border-l-4 border-[#c24100] bg-[#fff7f0] p-5">
            <p className="text-sm leading-6 text-[#3f3f43]">
              {CHECKOUT_DISCLOSURE_COPY.replace(
                "[CUSTOMER EMAIL]",
                email || "your order email",
              )}
            </p>
          </div>

          <div className="mt-6">
            <label className="flex cursor-pointer items-start gap-3 text-sm leading-6 text-[#3f3f43]">
              <input
                type="checkbox"
                name="policyAccepted"
                checked={policyAccepted}
                onChange={(event) => {
                  setPolicyAccepted(event.target.checked);
                  if (event.target.checked) {
                    setAcceptanceError(null);
                  }
                }}
                required
                aria-describedby={
                  acceptanceError ? "policy-acceptance-error" : undefined
                }
                className="mt-1 h-5 w-5 shrink-0 accent-[#c24100]"
              />
              <span>
                I have reviewed my order and agree to the{" "}
                <Link
                  href="/terms"
                  className="font-semibold text-[#005f73] underline underline-offset-4"
                >
                  Website Terms
                </Link>
                ,{" "}
                <Link
                  href="/licence"
                  className="font-semibold text-[#005f73] underline underline-offset-4"
                >
                  Template Licence
                </Link>
                ,{" "}
                <Link
                  href="/digital-delivery"
                  className="font-semibold text-[#005f73] underline underline-offset-4"
                >
                  Digital Delivery Policy
                </Link>
                ,{" "}
                <Link
                  href="/refunds"
                  className="font-semibold text-[#005f73] underline underline-offset-4"
                >
                  Refund and Remedy Policy
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="font-semibold text-[#005f73] underline underline-offset-4"
                >
                  Privacy and Cookies Policy
                </Link>
                . I understand that the Products are editable digital
                templates, not bespoke legal or professional advice, and that
                my statutory rights are not excluded.
              </span>
            </label>
            {acceptanceError ? (
              <p
                id="policy-acceptance-error"
                className="mt-2 text-sm font-semibold text-red-700"
                role="alert"
              >
                {acceptanceError}
              </p>
            ) : null}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || quoteLoading || !quote}
            className="mt-6 min-h-12 w-full rounded-md bg-[#c24100] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#9a3412] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting
              ? "Opening secure payment..."
              : quoteLoading
                ? "Verifying order total..."
                : `Pay securely with PayFast — ${formatPrice(
                    quote?.totalCents ?? cartTotalCents,
                  )}`}
          </button>
        </form>

        <aside className="order-1 h-fit rounded-md border border-[#ece7df] bg-white p-5 shadow-sm sm:p-6 lg:order-2 lg:sticky lg:top-24">
          <h2 className="text-xl font-semibold">Order summary</h2>
          <div className="mt-5 grid gap-4">
            {cart.map((item) => {
              const quotedItem = quote?.items.find(
                (candidate) => candidate.slug === item.slug,
              );
              const lineTotalCents =
                quotedItem?.totalCents ?? getCartItemLineTotalCents(item);
              const originalLineTotalCents =
                getCartItemOriginalLineTotalCents(item);
              const hasOfferSaving = originalLineTotalCents > lineTotalCents;

              return (
                <div key={item.slug} className="border-b border-[#eef2ef] pb-3">
                  <div className="flex justify-between gap-4 text-sm">
                    <span className="font-medium">{item.name}</span>
                    <span className="text-right font-semibold">
                      {hasOfferSaving ? (
                        <span className="block text-xs font-semibold text-[#8a8178] line-through">
                          {formatPrice(originalLineTotalCents)}
                        </span>
                      ) : null}
                      {formatPrice(lineTotalCents)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[#5f5f66]">
                    Qty {item.quantity}{" "}
                    <Link
                      href="/cart"
                      className="ml-2 font-semibold text-[#005f73] underline underline-offset-4"
                    >
                      Edit
                    </Link>
                  </p>
                </div>
              );
            })}
          </div>
          {(quote?.discountCents ?? discountTotalCents) > 0 ? (
            <>
              <div className="mt-5 flex items-center justify-between text-sm">
                <span className="text-[#5f5f66]">Standard price</span>
                <span className="font-semibold">
                  {formatPrice(quote?.subtotalCents ?? originalTotalCents)}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-[#5f5f66]">Launch offer saving</span>
                <span className="font-semibold text-[#d95400]">
                  -{formatPrice(quote?.discountCents ?? discountTotalCents)}
                </span>
              </div>
            </>
          ) : null}
          <div className="mt-5 flex items-center justify-between text-sm">
            <span className="text-[#5f5f66]">Total</span>
            <span className="text-xl font-semibold text-[#a63d00]">
              {formatPrice(quote?.totalCents ?? cartTotalCents)}
            </span>
          </div>
          <p className="mt-3 text-xs font-bold uppercase text-[#5f5f66]">
            {quote
              ? "Server-verified total in South African rand"
              : "Verifying total in South African rand"}
          </p>
          {quoteError ? (
            <p className="mt-3 text-sm text-red-700">{quoteError}</p>
          ) : null}
          <div className="mt-5 rounded-md border border-black/10 bg-white px-4 py-3">
            <p className="mb-2 text-xs font-black uppercase text-[#5f5f66]">
              Secure payment
            </p>
            <PayfastLogo className="h-8 w-auto" />
          </div>
          <div className="mt-5 border-t border-black/10 pt-4 text-xs leading-5 text-[#5f5f66]">
            <p className="font-semibold text-[#111111]">
              {supplierIdentity.legalOperator}
            </p>
            <p>
              Registration {supplierIdentity.registrationNumber}.{" "}
              {supplierIdentity.vatStatus}
            </p>
            <p className="mt-2">
              {supplierIdentity.address} | {supplierIdentity.telephone}
            </p>
            <div className="mt-3 flex flex-wrap gap-x-3 gap-y-2">
              {policyLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="font-semibold text-[#005f73] underline underline-offset-4"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
