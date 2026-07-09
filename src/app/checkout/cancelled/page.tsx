import Link from "next/link";
import { CancelOrderStatus } from "@/components/cancel-order-status";

export const metadata = {
  title: "Payment cancelled | DokKit",
  description: "DokKit payment cancellation page.",
};

export default async function CheckoutCancelledPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;

  return (
    <section className="mx-auto max-w-3xl px-6 py-14 lg:px-8">
      <div className="rounded-lg border border-[#ece7df] bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#ff6a00]">
          Payment cancelled
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          No payment was completed
        </h1>
        <p className="mt-4 text-sm leading-6 text-[#5f5f66]">
          You can return to the catalogue and start checkout again.
        </p>
        {order ? (
          <CancelOrderStatus orderNumber={order} />
        ) : null}
        <Link
          href="/industries"
          className="mt-6 inline-flex rounded-md bg-[#ff6a00] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#d95400]"
        >
          Back to catalogue
        </Link>
      </div>
    </section>
  );
}
