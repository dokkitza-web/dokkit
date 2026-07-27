"use client";

import { type FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/data/catalogue";
import { useConsent } from "@/components/analytics-provider";
import { DownloadFileButton } from "@/components/download-file-button";
import { trackGooglePurchase } from "@/lib/analytics";
import { CART_STORAGE_KEY, CART_UPDATED_EVENT } from "@/lib/cart";

type OrderStatusResponse = {
  orderNumber: string;
  status: "pending_payment" | "paid" | "failed" | "cancelled" | "refunded";
  totalCents: number;
  customerEmail: string;
  paidAt: string | null;
  accessIssuedAt: string | null;
  accessExpiresAt: string | null;
  successfulDownloads: number;
  downloadLimit: number;
  remainingDownloads: number;
  downloadsUnlocked: boolean;
  items: {
    name: string;
    slug: string;
    quantity: number;
    totalCents: number;
    files: {
      id: string;
      kind: string;
      versionLabel: string;
      checksum: string | null;
      createdAt: string;
    }[];
  }[];
};

function getStatusCopy(order: OrderStatusResponse) {
  if (order.status === "paid") {
    return {
      title: "Payment confirmed",
      body: `Payment confirmed. Your DokKit files are ready. Use the secure button below to download them now. We have also emailed access to ${order.customerEmail}. Secure access remains active for 7 days and permits up to 5 successful download attempts. Save a backup after downloading. If the email or files do not arrive, contact support@dokkit.co.za and include order ${order.orderNumber}.`,
      tone: "success",
    };
  }

  if (order.status === "cancelled") {
    return {
      title: "Payment cancelled",
      body: "No payment was completed for this order.",
      tone: "warning",
    };
  }

  if (order.status === "failed" || order.status === "refunded") {
    return {
      title: order.status === "refunded" ? "Order refunded" : "Payment failed",
      body:
        order.status === "refunded"
          ? "This order has been recorded as refunded. Secure file access is not available."
          : "The payment could not be verified, so no files were unlocked. Please return to checkout or contact support@dokkit.co.za.",
      tone: "warning",
    };
  }

  return {
    title: "Waiting for PayFast confirmation",
    body: `We are waiting for PayFast to confirm this payment. Do not pay again. We will unlock the files and email you as soon as verification succeeds. If the payment was completed and this message remains after 30 minutes, contact support@dokkit.co.za with order ${order.orderNumber}.`,
    tone: "pending",
  };
}

export function OrderStatusPoll({
  orderNumber,
}: {
  orderNumber: string;
}) {
  const [order, setOrder] = useState<OrderStatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [needsAccessCode, setNeedsAccessCode] = useState(false);
  const [accessCode, setAccessCode] = useState("");
  const [isAuthorising, setIsAuthorising] = useState(false);
  const [accessAttempt, setAccessAttempt] = useState(0);
  const { preferences, ready } = useConsent();

  useEffect(() => {
    let isMounted = true;

    async function loadStatus() {
      try {
        const query = new URLSearchParams({ order: orderNumber });

        const response = await fetch(
          `/api/orders/status?${query.toString()}`,
        );
        const payload = await response.json();

        if (!isMounted) {
          return;
        }

        if (!response.ok) {
          if (response.status === 403) {
            setNeedsAccessCode(true);
            setError(null);
            return;
          }

          setError(payload.error ?? "Unable to load order status.");
          return;
        }

        setOrder(payload);
        setNeedsAccessCode(false);
        setError(null);
      } catch {
        if (isMounted) {
          setError("Unable to load order status.");
        }
      }
    }

    void loadStatus();
    const interval = window.setInterval(loadStatus, 3000);

    return () => {
      isMounted = false;
      window.clearInterval(interval);
    };
  }, [accessAttempt, orderNumber]);

  async function authoriseOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsAuthorising(true);
    setError(null);

    try {
      const response = await fetch("/api/orders/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber, accessCode }),
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        setError(
          payload?.error ?? "The secure access code could not be verified.",
        );
        return;
      }

      setAccessCode("");
      setAccessAttempt((attempt) => attempt + 1);
    } catch {
      setError("The secure access code could not be verified.");
    } finally {
      setIsAuthorising(false);
    }
  }

  useEffect(() => {
    if (!ready || !preferences?.analytics || order?.status !== "paid") {
      return;
    }

    trackGooglePurchase({
      transactionId: order.orderNumber,
      valueCents: order.totalCents,
      items: order.items.map((item) => ({
        itemId: item.slug,
        itemName: item.name,
        itemCategory: "dokkit_product",
        priceCents: Math.round(item.totalCents / item.quantity),
        quantity: item.quantity,
      })),
    });
  }, [order, preferences?.analytics, ready]);

  useEffect(() => {
    if (order?.status !== "paid") {
      return;
    }

    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify([]));
    window.dispatchEvent(new Event(CART_UPDATED_EVENT));
  }, [order?.status]);

  if (needsAccessCode) {
    return (
      <form
        onSubmit={authoriseOrder}
        className="mt-5 rounded-lg border border-[#ece7df] bg-[#f6f4f1] p-5"
      >
        <p className="text-sm font-semibold text-[#111111]">
          Enter your secure access code
        </p>
        <p className="mt-2 text-sm leading-6 text-[#5f5f66]">
          Use the code in your DokKit order email. The code is stored in an
          essential HttpOnly cookie and is not added to the page URL.
        </p>
        <label className="mt-4 grid gap-2 text-sm font-medium">
          Secure access code
          <input
            type="password"
            autoComplete="one-time-code"
            value={accessCode}
            onChange={(event) => setAccessCode(event.target.value)}
            required
            minLength={20}
            className="rounded-md border border-[#cfc7bd] bg-white px-4 py-3 font-mono text-base outline-none focus:border-[#ff6a00] focus:ring-2 focus:ring-[#ffd8bd]"
          />
        </label>
        {error ? (
          <p className="mt-3 text-sm font-semibold text-red-700" role="alert">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={isAuthorising}
          className="mt-4 min-h-12 rounded-md bg-[#c24100] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {isAuthorising ? "Checking code..." : "Open secure order"}
        </button>
      </form>
    );
  }

  if (error) {
    return (
      <div className="mt-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mt-5 rounded-md bg-[#f6f4f1] px-4 py-3 text-sm text-[#5f5f66]">
        Loading order status...
      </div>
    );
  }

  const statusCopy = getStatusCopy(order);
  const downloadCount = order.items.reduce(
    (total, item) => total + item.files.length,
    0,
  );

  return (
    <div className="mt-5 rounded-lg border border-[#ece7df] bg-[#f6f4f1] p-5">
      <p className="text-sm font-semibold text-[#111111]">
        {statusCopy.title}
      </p>
      <p className="mt-2 text-sm leading-6 text-[#5f5f66]">{statusCopy.body}</p>
      <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-[#5f5f66]">Order</dt>
          <dd className="mt-1 font-semibold">{order.orderNumber}</dd>
        </div>
        <div>
          <dt className="text-[#5f5f66]">Successful downloads</dt>
          <dd className="mt-1 font-semibold">
            {order.successfulDownloads} of {order.downloadLimit}
          </dd>
        </div>
        <div>
          <dt className="text-[#5f5f66]">Access expires</dt>
          <dd className="mt-1 font-semibold">
            {order.accessExpiresAt ?? "-"}
          </dd>
        </div>
        <div>
          <dt className="text-[#5f5f66]">Total</dt>
          <dd className="mt-1 font-semibold">{formatPrice(order.totalCents)}</dd>
        </div>
        <div>
          <dt className="text-[#5f5f66]">Status</dt>
          <dd className="mt-1 font-semibold">{order.status}</dd>
        </div>
        <div>
          <dt className="text-[#5f5f66]">Paid at</dt>
          <dd className="mt-1 font-semibold">{order.paidAt ?? "-"}</dd>
        </div>
      </dl>
      {order.status === "paid" && !order.downloadsUnlocked ? (
        <div className="mt-5 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800">
          Secure access has expired or the five successful download attempts
          have been used. Contact support@dokkit.co.za with the order number and
          payment email for reasonable assistance.
        </div>
      ) : null}
      {order.status === "paid" && order.downloadsUnlocked ? (
        <div className="mt-5 rounded-lg border border-[#ece7df] bg-white p-4">
          <p className="text-sm font-semibold text-[#111111]">
            Secure downloads
          </p>
          {downloadCount ? (
            <div className="mt-4 space-y-4">
              {order.items.map((item) => (
                <div
                  key={item.slug}
                  className="rounded-md border border-[#eef2ef] p-4"
                >
                  <p className="text-sm font-semibold text-[#111111]">
                    {item.name}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-3">
                    {item.files.map((file) => (
                      <DownloadFileButton
                        key={file.id}
                        orderNumber={order.orderNumber}
                        productFileId={file.id}
                        fileKind={file.kind}
                        versionLabel={file.versionLabel}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm leading-6 text-[#5f5f66]">
              No files are attached to this paid product yet. Once product files
              are uploaded to the private Supabase bucket, they will appear here
              automatically.
            </p>
          )}
        </div>
      ) : null}
      {order.status === "paid" ? null : (
        <Link
          href="/industries"
          className="mt-5 inline-flex rounded-md bg-[#ff6a00] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#d95400]"
        >
          Continue
        </Link>
      )}
    </div>
  );
}
