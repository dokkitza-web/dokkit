import Link from "next/link";

export const metadata = {
  title: "Payment returned | DokKit",
  description: "DokKit payment return page.",
};

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;

  return (
    <section className="mx-auto max-w-3xl px-6 py-14 lg:px-8">
      <div className="rounded-lg border border-[#dfe7e2] bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#147d64]">
          Payment returned
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          We are verifying your payment
        </h1>
        <p className="mt-4 text-sm leading-6 text-[#53615b]">
          PayFast returned you to DokKit. Downloads will unlock after the PayFast
          payment notification confirms the order.
        </p>
        {order ? (
          <p className="mt-4 rounded-md bg-[#f7f9f8] px-4 py-3 text-sm font-semibold">
            Order: {order}
          </p>
        ) : null}
        <Link
          href="/industries"
          className="mt-6 inline-flex rounded-md bg-[#147d64] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0f604d]"
        >
          Back to catalogue
        </Link>
      </div>
    </section>
  );
}
