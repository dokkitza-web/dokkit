import { formatPrice } from "@/data/catalogue";
import { getCataloguePackageTiers } from "@/lib/supabase/catalogue";

export const metadata = {
  title: "Package comparison | DokKit",
  description: "Compare DokKit Starter, Professional, and Complete packages.",
};

export const revalidate = 300;

export default async function PackagesPage() {
  const packageTiers = await getCataloguePackageTiers();

  return (
    <section className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#147d64]">
          Package comparison
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">
          Starter, Professional, and Complete
        </h1>
        <p className="mt-4 text-lg leading-8 text-[#53615b]">
          Keep the offer simple at launch: one clear ladder repeated across all
          15 industries, with industry-specific wording and templates inside.
        </p>
      </div>

      <div className="mt-10 grid gap-4 lg:grid-cols-3">
        {packageTiers.map((tier) => (
          <article
            key={tier.key}
            className="rounded-lg border border-[#dfe7e2] bg-white p-6 shadow-sm"
          >
            <h2 className="text-2xl font-semibold">{tier.name}</h2>
            <p className="mt-3 text-sm leading-6 text-[#53615b]">
              {tier.summary}
            </p>
            <p className="mt-6 text-3xl font-semibold text-[#147d64]">
              {formatPrice(tier.priceCents)}
            </p>
            <p className="mt-2 text-sm text-[#53615b]">{tier.bestFor}</p>
            <ul className="mt-6 grid gap-3 text-sm text-[#53615b]">
              {tier.includes.map((item) => (
                <li key={item} className="rounded-md bg-[#f7f9f8] px-4 py-3">
                  {item}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
