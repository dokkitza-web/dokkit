import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { DocumentPreviewButton } from "@/components/document-preview-button";
import {
  formatPrice,
  getIndustryBySlug,
  industries,
  isIndustryAvailable,
  packageTiers,
} from "@/data/catalogue";
import { documentPreviews } from "@/data/document-previews";

export const dynamicParams = false;

export function generateStaticParams() {
  return industries
    .filter((industry) => isIndustryAvailable(industry.slug))
    .map((industry) => ({ slug: industry.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const industry = getIndustryBySlug(slug);

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
  const industry = getIndustryBySlug(slug);

  if (!industry || !isIndustryAvailable(industry.slug)) {
    notFound();
  }

  const isAvailable = true;
  const buyableTier = "complete";

  return (
    <>
      <section className="border-b border-[#eadfd4] bg-white px-6 py-14 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-sm font-bold uppercase text-[#f26a21]">
              Industry package
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <h1 className="text-4xl font-bold text-[#111111]">
                {industry.name}
              </h1>
              <span
                className={`rounded-md px-3 py-1 text-xs font-bold uppercase ${
                  isAvailable
                    ? "bg-[#fff3ea] text-[#a94710]"
                    : "bg-[#eee7df] text-[#6f6a64]"
                }`}
              >
                {isAvailable ? "Available now" : "Being polished"}
              </span>
            </div>
            <p className="mt-5 text-lg leading-8 text-[#5f5a54]">
              {industry.summary}
            </p>
            <div className="mt-8 rounded-xl border border-[#eadfd4] bg-[#fbf8f5] p-5">
              <h2 className="text-base font-bold text-[#111111]">
                Why this pack matters
              </h2>
              <p className="mt-3 text-sm leading-6 text-[#5f5a54]">
                {industry.why}
              </p>
            </div>
            {!isAvailable ? (
              <div className="mt-4 rounded-xl border border-[#eadfd4] bg-white p-5 text-sm leading-6 text-[#5f5a54]">
                This industry is visible as part of the DokKit roadmap while the
                final pack files are being polished. Checkout is not enabled for
                this pack yet.
              </div>
            ) : null}
          </div>

          <div className="grid gap-4">
            {packageTiers.map((tier, index) => {
              const isBuyable = isAvailable && tier.key === buyableTier;
              const productSlug = `${industry.slug}-${tier.key}`;

              return (
                <article
                  key={tier.key}
                  className="rounded-xl border border-[#eadfd4] bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-[#111111]">
                        {industry.name} {tier.name} Pack
                      </h2>
                      <p className="mt-2 text-sm leading-6 text-[#5f5a54]">
                        {tier.summary}
                      </p>
                    </div>
                    <p className="shrink-0 text-2xl font-bold text-[#f26a21]">
                      {formatPrice(tier.priceCents)}
                    </p>
                  </div>
                  <div className="mt-5 grid gap-3 text-sm text-[#5f5a54] sm:grid-cols-3">
                    <span className="rounded-md bg-[#fbf8f5] px-3 py-2">
                      From {tier.documentCount} files
                    </span>
                    <span className="rounded-md bg-[#fbf8f5] px-3 py-2">
                      DOCX templates
                    </span>
                    <span className="rounded-md bg-[#fbf8f5] px-3 py-2">
                      XLSX workbook
                    </span>
                  </div>
                  <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                    <Link
                      href={
                        isBuyable ? `/checkout/${productSlug}` : "/coming-soon"
                      }
                      className={`inline-flex items-center justify-center rounded-md px-4 py-2.5 text-sm font-bold transition ${
                        isBuyable
                          ? "bg-[#f26a21] text-white hover:bg-[#d95816]"
                          : "bg-[#e5ddd5] text-[#7b746d]"
                      }`}
                    >
                      {isBuyable ? "Buy This Pack" : "Coming Soon"}
                    </Link>
                    <DocumentPreviewButton
                      preview={documentPreviews[index % documentPreviews.length]}
                      label="Preview Templates"
                    />
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <section className="rounded-xl border border-[#eadfd4] bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-[#111111]">
              Featured documents
            </h2>
            <ul className="mt-5 grid gap-3 text-sm text-[#5f5a54]">
              {industry.featuredDocuments.map((item) => (
                <li key={item} className="rounded-md bg-[#fbf8f5] px-4 py-3">
                  {item}
                </li>
              ))}
            </ul>
          </section>
          <section className="rounded-xl border border-[#eadfd4] bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-[#111111]">
              Customer use cases
            </h2>
            <ul className="mt-5 grid gap-3 text-sm text-[#5f5a54]">
              {industry.useCases.map((item) => (
                <li key={item} className="rounded-md bg-[#fbf8f5] px-4 py-3">
                  {item}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </section>
    </>
  );
}
