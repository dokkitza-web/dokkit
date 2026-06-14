import type { Metadata } from "next";
import { notFound } from "next/navigation";
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
    <section className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#147d64]">
            Industry package
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">
            {industry.name}
          </h1>
          <p className="mt-5 text-lg leading-8 text-[#53615b]">
            {industry.summary}
          </p>
          <div className="mt-8 rounded-lg border border-[#dfe7e2] bg-white p-5">
            <h2 className="text-base font-semibold">Why it is attractive</h2>
            <p className="mt-3 text-sm leading-6 text-[#53615b]">
              {industry.why}
            </p>
          </div>
        </div>

        <div className="grid gap-4">
          {packageTiers.map((tier) => (
            <article
              key={tier.key}
              className="rounded-lg border border-[#dfe7e2] bg-white p-5 shadow-sm"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold">
                    {industry.name} {tier.name} Package
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-[#53615b]">
                    {tier.summary}
                  </p>
                </div>
                <p className="text-2xl font-semibold text-[#147d64]">
                  {formatPrice(tier.priceCents)}
                </p>
              </div>
              <div className="mt-5 grid gap-3 text-sm text-[#53615b] sm:grid-cols-3">
                <span className="rounded-md bg-[#eef5f2] px-3 py-2">
                  {tier.documentCount} DOCX
                </span>
                <span className="rounded-md bg-[#eef5f2] px-3 py-2">
                  {tier.workbookCount} XLSX
                </span>
                <span className="rounded-md bg-[#eef5f2] px-3 py-2">
                  {tier.pdfCount} PDFs
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-2">
        <section className="rounded-lg border border-[#dfe7e2] bg-white p-6">
          <h2 className="text-xl font-semibold">Featured documents</h2>
          <ul className="mt-5 grid gap-3 text-sm text-[#53615b]">
            {industry.featuredDocuments.map((item) => (
              <li key={item} className="rounded-md bg-[#f7f9f8] px-4 py-3">
                {item}
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-lg border border-[#dfe7e2] bg-white p-6">
          <h2 className="text-xl font-semibold">Customer use cases</h2>
          <ul className="mt-5 grid gap-3 text-sm text-[#53615b]">
            {industry.useCases.map((item) => (
              <li key={item} className="rounded-md bg-[#f7f9f8] px-4 py-3">
                {item}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </section>
  );
}
