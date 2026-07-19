"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  VAT_INCLUDED_SUMMARY_LABEL,
  formatPrice,
  getVatPortionCents,
} from "@/data/catalogue";
import { useConsent } from "@/components/analytics-provider";
import { DownloadFileButton } from "@/components/download-file-button";
import { trackGooglePurchase } from "@/lib/analytics";

type OrderStatusResponse = {
  orderNumber: string;
  status: "pending_payment" | "paid" | "failed" | "cancelled" | "refunded";
  totalCents: number;
  paidAt: string | null;
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

function getStatusCopy(status: OrderStatusResponse["status"]) {
  if (status === "paid") {
    return {
      title: "Payment verified",
      body: "PayFast has confirmed the payment. Your secure downloads are available below when files are attached to this order.",
      tone: "success",
    };
  }

  if (status === "cancelled") {
    return {
      title: "Payment cancelled",
      body: "No payment was completed for this order.",
      tone: "warning",
    };
  }

  if (status === "failed") {
    return {
      title: "Payment failed",
      body: "The payment could not be verified. Please try checkout again or contact support.",
      tone: "warning",
    };
  }

  return {
    title: "Waiting for PayFast confirmation",
    body: "This page checks every few seconds. Downloads will only unlock after the PayFast ITN confirms payment.",
    tone: "pending",
  };
}

export function OrderStatusPoll({
  orderNumber,
  accessToken,
}: {
  orderNumber: string;
  accessToken: string;
}) {
  const [order, setOrder] = useState<OrderStatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { preferences, ready } = useConsent();

  useEffect(() => {
    let isMounted = true;

    async function loadStatus() {
      try {
        const query = new URLSearchParams({ order: orderNumber });

        if (accessToken) {
          query.set("access", accessToken);
        }

        const response = await fetch(
          `/api/orders/status?${query.toString()}`,
        );
        const payload = await response.json();

        if (!isMounted) {
          return;
        }

        if (!response.ok) {
          setError(payload.error ?? "Unable to load order status.");
          return;
        }

        setOrder(payload);
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
  }, [accessToken, orderNumber]);

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

  const statusCopy = getStatusCopy(order.status);
  const vatPortionCents = getVatPortionCents(order.totalCents);
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
          <dt className="text-[#5f5f66]">Total</dt>
          <dd className="mt-1 font-semibold">{formatPrice(order.totalCents)}</dd>
        </div>
        <div>
          <dt className="text-[#5f5f66]">{VAT_INCLUDED_SUMMARY_LABEL}</dt>
          <dd className="mt-1 font-semibold">
            {formatPrice(vatPortionCents)}
          </dd>
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
          This order is paid, but this page is missing its secure access token.
          Use the original checkout return link, or wait for the secure download
          email once email delivery is connected.
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
                        accessToken={accessToken}
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
