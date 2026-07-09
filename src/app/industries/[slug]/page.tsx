import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { formatPrice } from "@/data/catalogue";
import {
  getCatalogueIndustries,
  getCatalogueIndustryBySlug,
  getCataloguePackageTiers,
} from "@/lib/supabase/catalogue";

export const revalidate = 300;

export async function generateStaticParams() {
  const industries = await getCatalogueIndustries();

  return industries.map((industry) => ({ slug: industry.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const industry = await getCatalogueIndustryBySlug(slug);

  if (!industry) {
    return {
      title: "Industry not found | DokKit",
    };
  }

  return {
    title: `${industry.name} packages | DokKit`,
    description: industry.summary,
  };
}

export default async function IndustryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [industry, packageTiers] = await Promise.all([
    getCatalogueIndustryBySlug(slug),
    getCataloguePackageTiers(),
  ]);

  if (!industry) {
    notFound();
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
      <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ff6a00]">
            Industry package
          </p>
          <h1 className="mt-4 text-5xl font-black tracking-tight">
            {industry.name}
          </h1>
          <p className="mt-5 text-lg leading-8 text-[#5f5f66]">
            {industry.summary}
          </p>
          <div className="mt-8 rounded-[1.5rem] border border-black/10 bg-white p-6 shadow-sm">
            <h2 className="text-base font-black">Why it is attractive</h2>
            <p className="mt-3 text-sm leading-6 text-[#5f5f66]">
              {industry.why}
            </p>
          </div>
        </div>

        <div className="grid gap-4">
          {packageTiers.map((tier) => (
            <article
              key={tier.key}
              className={`rounded-[1.75rem] border p-6 shadow-sm ${
                tier.key === "complete"
                  ? "border-[#ff6a00] bg-[#111111] text-white orange-glow"
                  : "border-black/10 bg-white"
              }`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-xl font-black">
                    {industry.name} {tier.name} Package
                  </h2>
                  <p
                    className={`mt-2 text-sm leading-6 ${
                      tier.key === "complete" ? "text-white/65" : "text-[#5f5f66]"
                    }`}
                  >
                    {tier.summary}
                  </p>
                </div>
                <p className="text-2xl font-black text-[#ff6a00]">
                  {formatPrice(tier.priceCents)}
                </p>
              </div>
              <div
                className={`mt-5 grid gap-3 text-sm font-bold sm:grid-cols-3 ${
                  tier.key === "complete" ? "text-white/75" : "text-[#5f5f66]"
                }`}
              >
                <span className="rounded-2xl bg-[#fff4eb] px-3 py-2 text-[#5f5f66]">
                  {tier.documentCount} DOCX
                </span>
                <span className="rounded-2xl bg-[#fff4eb] px-3 py-2 text-[#5f5f66]">
                  {tier.workbookCount} XLSX
                </span>
                <span className="rounded-2xl bg-[#fff4eb] px-3 py-2 text-[#5f5f66]">
                  PDF coming soon
                </span>
              </div>
              <div className="mt-5">
                <AddToCartButton
                  item={{
                    slug: `${industry.slug}-${tier.key}`,
                    name: `${industry.name} ${tier.name} Package`,
                    priceCents: tier.priceCents,
                    category: "industry_package",
                    description: tier.summary,
                  }}
                />
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-2">
        <section className="rounded-[1.5rem] border border-black/10 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black">Featured documents</h2>
          <ul className="mt-5 grid gap-3 text-sm text-[#5f5f66]">
            {industry.featuredDocuments.map((item) => (
              <li key={item} className="rounded-2xl bg-[#f6f4f1] px-4 py-3">
                {item}
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-[1.5rem] border border-black/10 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black">Customer use cases</h2>
          <ul className="mt-5 grid gap-3 text-sm text-[#5f5f66]">
            {industry.useCases.map((item) => (
              <li key={item} className="rounded-2xl bg-[#f6f4f1] px-4 py-3">
                {item}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </section>
  );
}
