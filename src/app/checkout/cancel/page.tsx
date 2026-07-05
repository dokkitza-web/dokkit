import Link from "next/link";

type CheckoutCancelPageProps = {
  searchParams: Promise<{ order?: string }>;
};

export const metadata = {
  title: "Payment cancelled | DokKit",
  description: "Your DokKit payment was cancelled.",
};

export default async function CheckoutCancelPage({
  searchParams,
}: CheckoutCancelPageProps) {
  const { order } = await searchParams;

  return (
    <section className="mx-auto max-w-3xl px-6 py-16 text-center lg:px-8">
      <p className="text-sm font-bold uppercase text-[#f26a21]">
        Checkout cancelled
      </p>
      <h1 className="mt-3 text-4xl font-black text-[#111111]">
        No payment was completed
      </h1>
      <p className="mt-4 text-lg leading-8 text-[#5f5a54]">
        You can restart checkout whenever you are ready.
      </p>
      {order ? (
        <p className="mt-6 rounded-xl border border-[#eadfd4] bg-white px-5 py-4 text-sm font-bold text-[#111111]">
          Order reference: {order}
        </p>
      ) : null}
      <Link
        href="/industries"
        className="mt-8 inline-flex items-center justify-center rounded-md bg-[#f26a21] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#d95816]"
      >
        Choose a pack
      </Link>
    </section>
  );
}
