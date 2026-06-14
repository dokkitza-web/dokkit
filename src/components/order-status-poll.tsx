"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/data/catalogue";

type OrderStatusResponse = {
  orderNumber: string;
  status: "pending_payment" | "paid" | "failed" | "cancelled" | "refunded";
  totalCents: number;
  paidAt: string | null;
  items: {
    name: string;
    slug: string;
    quantity: number;
    totalCents: number;
  }[];
};

function getStatusCopy(status: OrderStatusResponse["status"]) {
  if (status === "paid") {
    return {
      title: "Payment verified",
      body: "PayFast has confirmed the payment. Secure downloads are the next module to unlock.",
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

export function OrderStatusPoll({ orderNumber }: { orderNumber: string }) {
  const [order, setOrder] = useState<OrderStatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadStatus() {
      try {
        const response = await fetch(
          `/api/orders/status?order=${encodeURIComponent(orderNumber)}`,
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
  }, [orderNumber]);

  if (error) {
    return (
      <div className="mt-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mt-5 rounded-md bg-[#f7f9f8] px-4 py-3 text-sm text-[#53615b]">
        Loading order status...
      </div>
    );
  }

  const statusCopy = getStatusCopy(order.status);

  return (
    <div className="mt-5 rounded-lg border border-[#dfe7e2] bg-[#f7f9f8] p-5">
      <p className="text-sm font-semibold text-[#15201c]">
        {statusCopy.title}
      </p>
      <p className="mt-2 text-sm leading-6 text-[#53615b]">{statusCopy.body}</p>
      <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-[#53615b]">Order</dt>
          <dd className="mt-1 font-semibold">{order.orderNumber}</dd>
        </div>
        <div>
          <dt className="text-[#53615b]">Total</dt>
          <dd className="mt-1 font-semibold">{formatPrice(order.totalCents)}</dd>
        </div>
        <div>
          <dt className="text-[#53615b]">Status</dt>
          <dd className="mt-1 font-semibold">{order.status}</dd>
        </div>
        <div>
          <dt className="text-[#53615b]">Paid at</dt>
          <dd className="mt-1 font-semibold">{order.paidAt ?? "-"}</dd>
        </div>
      </dl>
      {order.status === "paid" ? (
        <Link
          href="/industries"
          className="mt-5 inline-flex rounded-md bg-[#147d64] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0f604d]"
        >
          Continue
        </Link>
      ) : null}
    </div>
  );
}
