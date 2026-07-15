import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { VAT_INCLUDED_LABEL, formatPrice } from "@/data/catalogue";
import {
  LAUNCH_OFFER_DATE_RANGE_LABEL,
  LAUNCH_OFFER_END_ISO,
  LAUNCH_OFFER_END_LABEL,
  LAUNCH_OFFER_LABEL,
  LAUNCH_OFFER_START_ISO,
  LAUNCH_OFFER_START_LABEL,
  getLaunchOfferPhase,
  getLaunchOfferPricing,
} from "@/lib/launch-offer";
import {
  getCatalogueIndustries,
  getCatalogueIndustryPackageProducts,
  getCatalogueIndustryBySlug,
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
  const [industry, packageProducts] = await Promise.all([
    getCatalogueIndustryBySlug(slug),
    getCatalogueIndustryPackageProducts(slug),
  ]);

  if (!industry) {
    notFound();
  }

  const launchOfferPhase = getLaunchOfferPhase();
  const showLaunchOfferNotice = launchOfferPhase !== "ended";
  const launchOfferNotice =
    launchOfferPhase === "active"
      ? `Launch offer active until ${LAUNCH_OFFER_END_LABEL}: selected packages up to 20% off.`
      : `Launch offer starts ${LAUNCH_OFFER_START_LABEL}: selected packages up to 20% off.`;

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
          {showLaunchOfferNotice ? (
            <Link
              href="/launch-offer"
              className="mt-6 inline-flex rounded-full border border-[#ffcfaa] bg-[#fff4eb] px-4 py-2 text-sm font-black text-[#d95400] transition hover:border-[#ff6a00] hover:text-[#ff6a00]"
            >
              {launchOfferNotice}
            </Link>
          ) : null}
          <div className="mt-8 rounded-[1.5rem] border border-black/10 bg-white p-6 shadow-sm">
            <h2 className="text-base font-black">Why it is attractive</h2>
            <p className="mt-3 text-sm leading-6 text-[#5f5f66]">
              {industry.why}
            </p>
          </div>
        </div>

        <div className="grid gap-4">
          {packageProducts.map((product) => {
            const pricing = getLaunchOfferPricing({
              priceCents: product.priceCents,
              productType: "industry_package",
              packageTier: product.key,
            });
            const hasOfferSaving = pricing.isApplied && pricing.discountCents > 0;

            return (
              <article
                key={product.slug}
                className={`rounded-[1.75rem] border p-6 shadow-sm ${
                  product.key === "complete"
                    ? "border-[#ff6a00] bg-[#111111] text-white orange-glow"
                    : "border-black/10 bg-white"
                }`}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-xl font-black">{product.name}</h2>
                    <p
                      className={`mt-2 text-sm leading-6 ${
                        product.key === "complete"
                          ? "text-white/65"
                          : "text-[#5f5f66]"
                      }`}
                    >
                      {product.description}
                    </p>
                    {hasOfferSaving ? (
                      <p className="mt-3 w-fit rounded-full bg-[#fff4eb] px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-[#d95400]">
                        {LAUNCH_OFFER_LABEL} - {pricing.discountPercent}% off
                      </p>
                    ) : null}
                  </div>
                  <div className="shrink-0 sm:text-right">
                    {hasOfferSaving ? (
                      <p
                        className={`text-xs font-semibold line-through ${
                          product.key === "complete"
                            ? "text-white/45"
                            : "text-[#8a8178]"
                        }`}
                      >
                        {formatPrice(pricing.originalPriceCents)}
                      </p>
                    ) : null}
                    <p className="text-2xl font-black text-[#ff6a00]">
                      {formatPrice(pricing.priceCents)}
                    </p>
                    <p
                      className={`mt-1 text-[0.65rem] font-black uppercase tracking-[0.12em] ${
                        product.key === "complete"
                          ? "text-[#ffb06f]"
                          : "text-[#d95400]"
                      }`}
                    >
                      {VAT_INCLUDED_LABEL}
                    </p>
                  </div>
                </div>
                <div
                  className={`mt-5 grid gap-3 text-sm font-bold sm:grid-cols-3 ${
                    product.key === "complete"
                      ? "text-white/75"
                      : "text-[#5f5f66]"
                  }`}
                >
                  <span className="rounded-2xl bg-[#fff4eb] px-3 py-2 text-[#5f5f66]">
                    {product.documentCount} Word document
                    {product.documentCount === 1 ? "" : "s"}
                  </span>
                  <span className="rounded-2xl bg-[#fff4eb] px-3 py-2 text-[#5f5f66]">
                    {product.workbookCount > 0
                      ? `${product.workbookCount} Excel workbook${
                          product.workbookCount === 1 ? "" : "s"
                        }`
                      : "Editable Word files"}
                  </span>
                  <span className="rounded-2xl bg-[#fff4eb] px-3 py-2 text-[#5f5f66]">
                    PDF coming soon
                  </span>
                </div>
                <div className="mt-5">
                  <AddToCartButton
                    item={{
                      slug: product.slug,
                      name: product.name,
                      priceCents: pricing.priceCents,
                      category: "industry_package",
                      description: product.description,
                      originalPriceCents: hasOfferSaving
                        ? pricing.originalPriceCents
                        : undefined,
                      discountPercent: hasOfferSaving
                        ? pricing.discountPercent
                        : undefined,
                      offerLabel: hasOfferSaving ? LAUNCH_OFFER_LABEL : undefined,
                      offerStartsAt: hasOfferSaving
                        ? LAUNCH_OFFER_START_ISO
                        : undefined,
                      offerEndsAt: hasOfferSaving
                        ? LAUNCH_OFFER_END_ISO
                        : undefined,
                    }}
                  />
                  {hasOfferSaving ? (
                    <p
                      className={`mt-2 text-xs ${
                        product.key === "complete"
                          ? "text-white/55"
                          : "text-[#5f5f66]"
                      }`}
                    >
                      Offer applies automatically from{" "}
                      {LAUNCH_OFFER_DATE_RANGE_LABEL}.
                    </p>
                  ) : null}
                </div>
              </article>
            );
          })}
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
