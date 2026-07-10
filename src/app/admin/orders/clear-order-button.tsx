"use client";

import { useFormStatus } from "react-dom";

export function ClearOrderButton({
  orderNumber,
  mode,
}: {
  orderNumber: string;
  mode: "clear" | "restore";
}) {
  const { pending } = useFormStatus();
  const isRestore = mode === "restore";

  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(event) => {
        if (isRestore) {
          return;
        }

        const confirmed = window.confirm(
          `Clear order ${orderNumber} from the active dashboard?\n\nThis only hides the order from the active Orders view. It does not delete the order, payment, customer, email, or download records. You can restore it from the Cleared view.`,
        );

        if (!confirmed) {
          event.preventDefault();
        }
      }}
      className={
        isRestore
          ? "rounded-full border border-black/10 px-3 py-2 text-xs font-black text-[#111111] transition hover:border-[#ff6a00] hover:text-[#ff6a00] disabled:cursor-not-allowed disabled:opacity-60"
          : "rounded-full border border-amber-200 px-3 py-2 text-xs font-black text-amber-800 transition hover:border-amber-400 hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-60"
      }
    >
      {pending
        ? isRestore
          ? "Restoring..."
          : "Clearing..."
        : isRestore
          ? "Restore order"
          : "Clear order"}
    </button>
  );
}
