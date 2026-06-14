"use client";

import { useEffect, useState } from "react";

export function CancelOrderStatus({ orderNumber }: { orderNumber: string }) {
  const [message, setMessage] = useState("Updating order status...");

  useEffect(() => {
    let isMounted = true;

    async function cancelOrder() {
      try {
        const response = await fetch("/api/orders/cancel", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ orderNumber }),
        });
        const payload = await response.json();

        if (!isMounted) {
          return;
        }

        if (!response.ok) {
          setMessage(payload.error ?? "Unable to update order status.");
          return;
        }

        setMessage(
          payload.status === "paid"
            ? "This order is already paid and was not cancelled."
            : "Pending order marked as cancelled.",
        );
      } catch {
        if (isMounted) {
          setMessage("Unable to update order status.");
        }
      }
    }

    void cancelOrder();

    return () => {
      isMounted = false;
    };
  }, [orderNumber]);

  return (
    <p className="mt-4 rounded-md bg-[#f7f9f8] px-4 py-3 text-sm font-semibold">
      {message}
    </p>
  );
}
