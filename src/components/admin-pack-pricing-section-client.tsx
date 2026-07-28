"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import {
  formatDocumentRange,
  formatPrice,
  type IndustryPackageProduct,
  type PackageTier,
  type PackageTierKey,
} from "@/data/catalogue";

export type PricingIndustry = {
  slug: string;
  name: string;
  products: IndustryPackageProduct[];
};

type AdminPackPricingSectionClientProps = {
  headingLevel: "h1" | "h2";
  industries: PricingIndustry[];
  packageTiers: PackageTier[];
};

const tierPresentation: Record<
  PackageTierKey,
  {
    headline: string;
    description: string;
    listLabel: string;
    features: string[];
  }
> = {
  starter: {
    headline: "Set up the essentials",
    description:
      "For new or informal businesses that need credible admin basics without unnecessary paperwork.",
    listLabel: "Core documents include:",
    features: [
      "Quotation template",
      "Invoice workbook",
      "Customer intake form",
      "Basic terms and conditions",
    ],
  },
  professional: {
    headline: "Run jobs more professionally",
    description:
      "For growing businesses that quote often, onboard customers and need better control of recurring work.",
    listLabel: "Everything in Starter, plus:",
    features: [
      "CRM tracker",
      "Service agreement",
      "Client onboarding pack",
      "Additional operational documents",
    ],
  },
  complete: {
    headline: "Build a complete admin system",
    description:
      "For owners who want one connected document library from first enquiry through delivery and review.",
    listLabel: "Everything in Professional, plus:",
    features: [
      "Advanced reporting workbook",
      "Standard operating procedures",
      "Risk and compliance checklists",
      "Full operational document library",
    ],
  },
};

const valueItems = [
  "Editable Word & Excel files",
  "Once-off payment in Rand",
  "Secure digital delivery",
  "Made for SA small businesses",
];

function getFileSummary(
  tier: PackageTier,
  product?: IndustryPackageProduct,
) {
  const documentCount = product?.documentCount;
  const workbookCount = product?.workbookCount ?? tier.workbookCount;
  const documentLabel =
    documentCount === undefined
      ? `${formatDocumentRange(tier.key)} editable Word documents`
      : `${documentCount} editable Word document${documentCount === 1 ? "" : "s"}`;

  if (workbookCount < 1) {
    return documentLabel;
  }

  return `${documentLabel} + ${workbookCount} Excel workbook${
    workbookCount === 1 ? "" : "s"
  }`;
}

export function AdminPackPricingSectionClient({
  headingLevel,
  industries,
  packageTiers,
}: AdminPackPricingSectionClientProps) {
  const [selectedIndustrySlug, setSelectedIndustrySlug] = useState("");
  const selectRef = useRef<HTMLSelectElement>(null);
  const Heading = headingLevel;
  const selectedIndustry = industries.find(
    (industry) => industry.slug === selectedIndustrySlug,
  );
  const selectedProducts = new Map(
    selectedIndustry?.products.map((product) => [product.key, product]) ?? [],
  );

  function focusIndustrySelect() {
    selectRef.current?.focus();
    selectRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }

  return (
    <section
      aria-labelledby="admin-pack-pricing-heading"
      className="bg-[#fffaf5] py-12 lg:py-20"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="grid gap-7 lg:grid-cols-[minmax(0,1.75fr)_minmax(320px,0.95fr)] lg:items-start lg:gap-12">
          <div className="max-w-4xl">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#c24100]">
              DokKit admin packs
            </p>
            <Heading
              id="admin-pack-pricing-heading"
              className="mt-3 text-3xl font-black leading-tight text-[#111111] sm:text-4xl lg:text-[2.65rem]"
            >
              Choose the right admin pack for your business
            </Heading>
            <p className="mt-3 max-w-3xl text-base leading-7 text-[#5f5f66] sm:text-lg">
              Select your industry first, then compare the exact documents
              included in each pack. Every file is editable and built for
              practical South African business use.
            </p>
          </div>

          <div className="rounded-md border border-[#ffb77a] bg-white p-4 sm:p-5">
            <label
              htmlFor="pricing-industry"
              className="block text-sm font-black text-[#111111]"
            >
              What type of business do you run?
            </label>
            <select
              ref={selectRef}
              id="pricing-industry"
              value={selectedIndustrySlug}
              onChange={(event) => setSelectedIndustrySlug(event.target.value)}
              className="mt-2 min-h-12 w-full rounded-md border border-black/20 bg-white px-4 text-base font-bold text-[#303038] outline-none transition focus:border-[#ff6a00] focus:ring-2 focus:ring-[#ff6a00]/20"
            >
              <option value="">Select your industry</option>
              {industries.map((industry) => (
                <option key={industry.slug} value={industry.slug}>
                  {industry.name}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs leading-5 text-[#6b6b72]">
              You will see the full document list before you pay.
            </p>
          </div>
        </div>

        <ul className="mt-8 grid gap-2.5 sm:grid-cols-2 lg:mt-10 lg:grid-cols-4">
          {valueItems.map((item) => (
            <li
              key={item}
              className="flex min-h-11 items-center gap-3 rounded-md border border-black/10 bg-white px-3.5 py-2.5 text-sm font-bold text-[#3f3f46]"
            >
              <span
                aria-hidden="true"
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#eaf8f1] text-xs font-black text-[#16865a]"
              >
                &#10003;
              </span>
              {item}
            </li>
          ))}
        </ul>

        <div className="mt-7 grid gap-4 lg:grid-cols-3 lg:items-stretch">
          {packageTiers.map((tier) => {
            const presentation = tierPresentation[tier.key];
            const product = selectedProducts.get(tier.key);
            const unavailable = Boolean(selectedIndustry && !product);
            const packageHref =
              selectedIndustry && product
                ? `/industries/${selectedIndustry.slug}#${product.slug}`
                : "/industries";
            const displayPrice = product?.priceCents ?? tier.priceCents;

            return (
              <article
                key={tier.key}
                className={`flex min-h-full flex-col rounded-md border bg-white p-5 shadow-sm sm:p-7 ${
                  tier.key === "complete"
                    ? "border-2 border-[#ff6a00] shadow-[0_16px_40px_rgba(194,65,0,0.10)]"
                    : "border-black/10"
                } ${unavailable ? "bg-black/[0.02]" : ""}`}
              >
                <div className="flex min-h-6 items-start justify-between gap-3">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-[#c24100]">
                    {tier.name}
                  </p>
                  {tier.key === "complete" ? (
                    <span className="rounded-full border border-[#ffb77a] px-2.5 py-1 text-[0.65rem] font-black uppercase tracking-[0.12em] text-[#9d3800]">
                      Most comprehensive
                    </span>
                  ) : null}
                </div>

                <h3 className="mt-3 max-w-xs text-2xl font-black leading-tight text-[#111111]">
                  {presentation.headline}
                </h3>
                <p className="mt-6 text-sm leading-6 text-[#66666d]">
                  {presentation.description}
                </p>

                {unavailable ? (
                  <div className="mt-3 rounded-md border border-[#ffcfaa] bg-[#fff4eb] px-3 py-2 text-sm font-bold text-[#8f3500]">
                    This tier is not offered for {selectedIndustry?.name}.
                  </div>
                ) : (
                  <>
                    <p className="mt-2 flex flex-wrap items-end gap-x-2 text-[#111111]">
                      <span className="text-4xl font-black">
                        {formatPrice(displayPrice)}
                      </span>
                      <span className="pb-1 text-xs font-bold text-[#68686f]">
                        once-off
                      </span>
                    </p>
                    <p className="mt-2 text-xs leading-5 text-[#55555c]">
                      {getFileSummary(tier, product)}
                    </p>
                  </>
                )}

                <div className="my-5 h-px bg-black/10" />
                <p className="text-sm font-black text-[#3f3f46]">
                  {presentation.listLabel}
                </p>
                <ul className="mt-4 grid gap-4 text-sm font-bold text-[#404047]">
                  {presentation.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <span
                        aria-hidden="true"
                        className="mt-px flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#9bdabd] bg-[#eaf8f1] text-xs font-black text-[#16865a]"
                      >
                        &#10003;
                      </span>
                      <span className="leading-5">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8 flex flex-1 flex-col justify-end">
                  {selectedIndustry ? (
                    <Link
                      href={
                        product
                          ? packageHref
                          : `/industries/${selectedIndustry.slug}`
                      }
                      className="inline-flex min-h-11 w-fit items-center text-sm font-black text-[#3f3f46] underline decoration-black/35 underline-offset-4 transition hover:text-[#c24100]"
                    >
                      {product
                        ? `See full ${tier.name} contents`
                        : `See available ${selectedIndustry.name} packs`}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={focusIndustrySelect}
                      className="min-h-11 w-fit text-left text-sm font-black text-[#3f3f46] underline decoration-black/35 underline-offset-4 transition hover:text-[#c24100]"
                    >
                      See full {tier.name} contents
                    </button>
                  )}

                  {selectedIndustry && product ? (
                    <Link
                      href={packageHref}
                      className={`mt-3 inline-flex min-h-12 w-full items-center justify-center rounded-md px-4 py-3 text-sm font-black transition ${
                        tier.key === "complete"
                          ? "bg-[#ff6a00] text-[#111111] hover:bg-[#e45e00]"
                          : "bg-[#161616] text-white hover:bg-[#303030]"
                      }`}
                    >
                      Choose {tier.name}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={
                        selectedIndustry
                          ? undefined
                          : focusIndustrySelect
                      }
                      disabled={unavailable}
                      className={`mt-3 min-h-12 w-full rounded-md px-4 py-3 text-sm font-black ${
                        unavailable
                          ? "cursor-not-allowed bg-black/10 text-black/45"
                          : tier.key === "complete"
                            ? "bg-[#ff6a00] text-[#111111] hover:bg-[#e45e00]"
                            : "bg-[#161616] text-white hover:bg-[#303030]"
                      }`}
                    >
                      {unavailable
                        ? "Not available"
                        : "Select industry first"}
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        <p className="mx-auto mt-6 max-w-3xl text-center text-xs leading-5 text-[#66666d]">
          Exact document counts and contents vary by industry. The full pack
          contents are shown before payment.
        </p>
      </div>
    </section>
  );
}
