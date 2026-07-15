import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AddToCartButton } from "@/components/add-to-cart-button";
import {
  VAT_INCLUDED_LABEL,
  formatDocumentRange,
  formatFileFormats,
  formatPrice,
  type Industry,
  type IndustryPackageProduct,
  type PackageTierKey,
} from "@/data/catalogue";
import {
  LAUNCH_OFFER_DATE_RANGE_LABEL,
  LAUNCH_OFFER_DISCOUNTS,
  LAUNCH_OFFER_END_ISO,
  LAUNCH_OFFER_END_LABEL,
  LAUNCH_OFFER_LABEL,
  LAUNCH_OFFER_START_ISO,
  LAUNCH_OFFER_START_LABEL,
  getLaunchOfferPhase,
  getLaunchOfferPricing,
  type LaunchOfferPhase,
} from "@/lib/launch-offer";
import {
  getCatalogueIndustries,
  getCatalogueIndustryPackageProducts,
} from "@/lib/supabase/catalogue";

export const metadata: Metadata = {
  title: "Launch Offer | DokKit",
  description:
    "Save up to 20% on selected DokKit industry package packs from 13 July to 31 August 2026. Prices include 15% VAT.",
};

export const revalidate = 300;

const tierSummaries: Record<PackageTierKey, string> = {
  starter: "Core documents for quoting, invoicing, client intake, and everyday admin.",
  professional:
    "A stronger operating pack for repeat customers, job tracking, supplier records, and follow-up.",
  complete:
    "The fullest industry pack with a broader document library for daily operations and growth.",
};

const tierLabels: Record<PackageTierKey, string> = {
  starter: "Starter",
  professional: "Professional",
  complete: "Complete",
};

const phaseCopy: Record<
  LaunchOfferPhase,
  { status: string; headline: string; cta: string }
> = {
  upcoming: {
    status: `Starts ${LAUNCH_OFFER_START_LABEL}`,
    headline: "Save up to 20% on selected industry package packs.",
    cta: "Preview the offer",
  },
  active: {
    status: `Now live until ${LAUNCH_OFFER_END_LABEL}`,
    headline: "Save up to 20% on selected industry package packs.",
    cta: "Shop the offer",
  },
  ended: {
    status: `Ended ${LAUNCH_OFFER_END_LABEL}`,
    headline: "The launch offer has ended.",
    cta: "Browse current packages",
  },
};

function getTierName(product: IndustryPackageProduct) {
  return tierLabels[product.key] ?? product.name;
}

function getOfferPrice(product: IndustryPackageProduct) {
  return getLaunchOfferPricing({
    priceCents: product.priceCents,
    productType: "industry_package",
    packageTier: product.key,
    forceActive: true,
  });
}

function getActivePrice(product: IndustryPackageProduct) {
  return getLaunchOfferPricing({
    priceCents: product.priceCents,
    productType: "industry_package",
    packageTier: product.key,
  });
}

async function getOfferGroups() {
  const industries = await getCatalogueIndustries();
  const groups = await Promise.all(
    industries.map(async (industry) => ({
      industry,
      products: await getCatalogueIndustryPackageProducts(industry.slug),
    })),
  );

  return groups.filter((group) => group.products.length);
}

function OfferTierCard({
  tierKey,
  sampleProduct,
}: {
  tierKey: PackageTierKey;
  sampleProduct?: IndustryPackageProduct;
}) {
  const discountPercent = LAUNCH_OFFER_DISCOUNTS[tierKey];
  const previewPricing = sampleProduct ? getOfferPrice(sampleProduct) : null;
  const isComplete = tierKey === "complete";

  return (
    <article
      className={`rounded-[2rem] border p-7 shadow-sm ${
        isComplete
          ? "border-[#ff6a00] bg-[#111111] text-white orange-glow"
          : "border-black/10 bg-white text-[#111111]"
      }`}
    >
      <p
        className={`text-xs font-black uppercase tracking-[0.18em] ${
          isComplete ? "text-[#ffb06f]" : "text-[#ff6a00]"
        }`}
      >
        {discountPercent}% off
      </p>
      <h2 className="mt-4 text-2xl font-black">{tierLabels[tierKey]} Pack</h2>
      <p
        className={`mt-3 text-sm leading-6 ${
          isComplete ? "text-white/65" : "text-[#5f5f66]"
        }`}
      >
        {tierSummaries[tierKey]}
      </p>
      {previewPricing ? (
        <div className="mt-6">
          <p
            className={`text-sm font-semibold line-through ${
              isComplete ? "text-white/45" : "text-[#8a8178]"
            }`}
          >
            {formatPrice(previewPricing.originalPriceCents)}
          </p>
          <p className="text-4xl font-black text-[#ff6a00]">
            {formatPrice(previewPricing.priceCents)}
          </p>
          <p
            className={`mt-1 text-xs font-black uppercase tracking-[0.14em] ${
              isComplete ? "text-[#ffb06f]" : "text-[#d95400]"
            }`}
          >
            {VAT_INCLUDED_LABEL}
          </p>
        </div>
      ) : null}
      <p
        className={`mt-5 text-sm ${
          isComplete ? "text-white/60" : "text-[#5f5f66]"
        }`}
      >
        {formatDocumentRange(tierKey)} Word documents, 1 Excel workbook, PDF
        coming soon.
      </p>
    </article>
  );
}

function IndustryOfferCard({
  industry,
  products,
  phase,
}: {
  industry: Industry;
  products: IndustryPackageProduct[];
  phase: LaunchOfferPhase;
}) {
  const offerIsActive = phase === "active";

  return (
    <article className="rounded-[1.75rem] border border-black/10 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#ff6a00]">
            Industry pack
          </p>
          <h3 className="mt-3 text-xl font-black text-[#111111]">
            {industry.name}
          </h3>
          <p className="mt-3 text-sm leading-6 text-[#5f5f66]">
            {industry.summary}
          </p>
        </div>
        <Link
          href={`/industries/${industry.slug}`}
          className="shrink-0 rounded-full border border-black/10 px-4 py-2 text-sm font-black text-[#111111] transition hover:border-[#ff6a00] hover:text-[#ff6a00]"
        >
          View pack
        </Link>
      </div>

      <div className="mt-5 divide-y divide-[#eef2ef] border-y border-[#eef2ef]">
        {products.map((product) => {
          const previewPricing = getOfferPrice(product);
          const activePricing = getActivePrice(product);
          const activeSaving =
            activePricing.isApplied && activePricing.discountCents > 0;

          return (
            <div
              key={product.slug}
              className="grid gap-4 py-4 sm:grid-cols-[1fr_auto] sm:items-center"
            >
              <div>
                <p className="font-black text-[#111111]">
                  {getTierName(product)} Package
                </p>
                <p className="mt-1 text-xs font-bold text-[#5f5f66]">
                  {product.documentCount} Word documents,{" "}
                  {product.workbookCount} Excel workbook /{" "}
                  {formatFileFormats(product.fileFormats)}
                </p>
                <p className="mt-2 w-fit rounded-full bg-[#fff4eb] px-3 py-1 text-[0.65rem] font-black uppercase tracking-[0.12em] text-[#d95400]">
                  {previewPricing.discountPercent}% off launch offer
                </p>
              </div>
              <div className="grid gap-3 sm:justify-items-end">
                <div className="sm:text-right">
                  <p className="text-xs font-semibold text-[#8a8178] line-through">
                    {formatPrice(previewPricing.originalPriceCents)}
                  </p>
                  <p className="text-xl font-black text-[#ff6a00]">
                    {formatPrice(previewPricing.priceCents)}
                  </p>
                  <p className="mt-1 text-[0.65rem] font-black uppercase tracking-[0.12em] text-[#d95400]">
                    {VAT_INCLUDED_LABEL}
                  </p>
                </div>
                {offerIsActive ? (
                  <AddToCartButton
                    className="w-full sm:w-auto"
                    item={{
                      slug: product.slug,
                      name: product.name,
                      priceCents: activePricing.priceCents,
                      category: "industry_package",
                      description: product.description,
                      originalPriceCents: activeSaving
                        ? activePricing.originalPriceCents
                        : undefined,
                      discountPercent: activeSaving
                        ? activePricing.discountPercent
                        : undefined,
                      offerLabel: activeSaving ? LAUNCH_OFFER_LABEL : undefined,
                      offerStartsAt: activeSaving
                        ? LAUNCH_OFFER_START_ISO
                        : undefined,
                      offerEndsAt: activeSaving ? LAUNCH_OFFER_END_ISO : undefined,
                    }}
                  />
                ) : (
                  <Link
                    href={`/industries/${industry.slug}`}
                    className="inline-flex w-full justify-center rounded-full bg-[#111111] px-5 py-3 text-sm font-black text-white transition hover:bg-[#2b2b2b] sm:w-auto"
                  >
                    View details
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </article>
  );
}

export default async function LaunchOfferPage() {
  const phase = getLaunchOfferPhase();
  const offerGroups = await getOfferGroups();
  const sampleProductsByTier = new Map<PackageTierKey, IndustryPackageProduct>();

  offerGroups.forEach((group) => {
    group.products.forEach((product) => {
      if (!sampleProductsByTier.has(product.key)) {
        sampleProductsByTier.set(product.key, product);
      }
    });
  });

  const copy = phaseCopy[phase];

  return (
    <>
      <section className="relative isolate overflow-hidden bg-[#111111] text-white">
        <div className="absolute inset-0 -z-10">
          <Image
            src="/images/dokkit-hero-workspace.png"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-45"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(17,17,17,0.94)_0%,rgba(17,17,17,0.74)_48%,rgba(17,17,17,0.44)_100%)]" />
        </div>
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
          <div className="max-w-3xl">
            <p className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#ffb06f]">
              {copy.status}
            </p>
            <h1 className="mt-6 text-5xl font-black leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
              DokKit Launch Offer
            </h1>
            <p className="mt-6 max-w-2xl text-2xl font-black leading-tight text-white">
              {copy.headline}
            </p>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/72">
              From {LAUNCH_OFFER_DATE_RANGE_LABEL}, selected editable industry
              package packs are discounted by 10%, 15%, or 20%. Prices include
              15% VAT and files are supplied as Word templates and Excel
              workbooks.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#selected-packages"
                className="inline-flex items-center justify-center rounded-full bg-[#ff6a00] px-6 py-3.5 text-sm font-black text-white shadow-xl shadow-[#ff6a00]/25 transition hover:-translate-y-0.5 hover:bg-[#d95400]"
              >
                {copy.cta}
              </a>
              <Link
                href="/industries"
                className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-black text-white transition hover:-translate-y-0.5 hover:border-[#ff6a00]"
              >
                Browse industries
              </Link>
            </div>
            <div className="mt-10 grid gap-3 text-sm font-black sm:grid-cols-3">
              <span className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3">
                Starter: 10% off
              </span>
              <span className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3">
                Professional: 15% off
              </span>
              <span className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3">
                Complete: 20% off
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#fffaf5] py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ff6a00]">
                Offer pricing
              </p>
              <h2 className="mt-4 max-w-3xl text-4xl font-black tracking-tight text-[#111111]">
                Three package levels, discounted for the launch period.
              </h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-[#5f5f66]">
              The discount is applied automatically at checkout only during the
              offer window.
            </p>
          </div>
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {(["starter", "professional", "complete"] as PackageTierKey[]).map(
              (tierKey) => (
                <OfferTierCard
                  key={tierKey}
                  tierKey={tierKey}
                  sampleProduct={sampleProductsByTier.get(tierKey)}
                />
              ),
            )}
          </div>
        </div>
      </section>

      <section
        id="selected-packages"
        className="scroll-mt-24 border-y border-black/10 bg-white py-16 lg:py-20"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ff6a00]">
              Selected packages
            </p>
            <h2 className="mt-4 text-4xl font-black tracking-tight text-[#111111]">
              Launch offer packs by industry.
            </h2>
            <p className="mt-4 text-sm leading-6 text-[#5f5f66]">
              Choose the industry that fits your business, then select Starter,
              Professional, or Complete. Single documents are not included in
              this launch offer.
            </p>
          </div>
          <div className="mt-10 grid gap-5 xl:grid-cols-2">
            {offerGroups.map((group) => (
              <IndustryOfferCard
                key={group.industry.slug}
                industry={group.industry}
                products={group.products}
                phase={phase}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#111111] py-16 text-white lg:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 lg:grid-cols-3 lg:px-8">
          <article className="rounded-[1.5rem] border border-white/10 bg-white/5 p-6">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#ffb06f]">
              Dates
            </p>
            <h3 className="mt-4 text-2xl font-black">
              {LAUNCH_OFFER_DATE_RANGE_LABEL}
            </h3>
            <p className="mt-3 text-sm leading-6 text-white/65">
              The offer starts on {LAUNCH_OFFER_START_LABEL} and ends on{" "}
              {LAUNCH_OFFER_END_LABEL}.
            </p>
          </article>
          <article className="rounded-[1.5rem] border border-white/10 bg-white/5 p-6">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#ffb06f]">
              Checkout
            </p>
            <h3 className="mt-4 text-2xl font-black">
              Discount applied automatically
            </h3>
            <p className="mt-3 text-sm leading-6 text-white/65">
              Eligible package products are recalculated on the server before
              the PayFast payment amount is created.
            </p>
          </article>
          <article className="rounded-[1.5rem] border border-white/10 bg-white/5 p-6">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#ffb06f]">
              VAT and files
            </p>
            <h3 className="mt-4 text-2xl font-black">Prices include 15% VAT</h3>
            <p className="mt-3 text-sm leading-6 text-white/65">
              Packages include editable Word documents and an Excel workbook.
              PDF versions are coming soon.
            </p>
          </article>
        </div>
      </section>

      <section className="bg-[#fff4eb] py-16 lg:py-20">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <div className="text-center">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ff6a00]">
              Launch offer FAQ
            </p>
            <h2 className="mt-4 text-4xl font-black tracking-tight">
              Clear answers before you buy.
            </h2>
          </div>
          <div className="mt-10 grid gap-4">
            {[
              {
                question: "Which products are discounted?",
                answer:
                  "The launch offer applies to selected industry package packs only: Starter, Professional, and Complete. Single documents stay at their normal prices.",
              },
              {
                question: "Are the prices VAT-inclusive?",
                answer:
                  "Yes. The listed launch offer prices include 15% VAT.",
              },
              {
                question: "What happens after payment?",
                answer:
                  "After PayFast confirms payment, DokKit unlocks the secure downloads attached to your purchased products.",
              },
              {
                question: "Can I edit the files?",
                answer:
                  "Yes. The packs are supplied as editable Word templates and Excel workbooks so you can add your business details, logo, pricing, and wording.",
              },
            ].map((faq) => (
              <article
                key={faq.question}
                className="rounded-[1.5rem] border border-black/10 bg-white p-6 shadow-sm"
              >
                <h3 className="font-black text-[#111111]">{faq.question}</h3>
                <p className="mt-3 text-sm leading-6 text-[#5f5f66]">
                  {faq.answer}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-16 lg:py-20">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ff6a00]">
            Ready when your customer admin is ready
          </p>
          <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
            Pick a package pack and start with cleaner business documents.
          </h2>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/industries"
              className="rounded-full bg-[#ff6a00] px-6 py-3.5 text-sm font-black text-white transition hover:bg-[#d95400]"
            >
              Browse industry packs
            </Link>
            <Link
              href="/single-documents"
              className="rounded-full border border-black/10 px-6 py-3.5 text-sm font-black text-[#111111] transition hover:border-[#ff6a00] hover:text-[#ff6a00]"
            >
              View single templates
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
