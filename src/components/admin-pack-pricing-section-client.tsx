"use client";

import Link from "next/link";
import {
  formatDocumentRange,
  formatPrice,
  type PackageTier,
  type PackageTierKey,
} from "@/data/catalogue";
import {
  getLaunchOfferPhase,
  getLaunchOfferPricing,
  LAUNCH_OFFER_END_LABEL,
} from "@/lib/launch-offer";

type AdminPackPricingSectionClientProps = {
  headingLevel: "h1" | "h2";
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
    headline: "Start with the essentials",
    description:
      "For new or informal businesses that need credible documents without heavy admin.",
    listLabel: "Best if you need to:",
    features: [
      "Quote and invoice customers professionally",
      "Capture customer and job information",
      "Set clear basic terms and keep records",
    ],
  },
  professional: {
    headline: "Run jobs with less admin",
    description:
      "For businesses that quote often, onboard customers and manage repeat work.",
    listLabel: "Everything in Starter, plus tools to:",
    features: [
      "Track customers, follow-ups and recurring work",
      "Use stronger service and onboarding documents",
      "Standardise daily operations and handovers",
    ],
  },
  complete: {
    headline: "Build a full admin system",
    description:
      "For established operations that need connected records, procedures and management tools.",
    listLabel: "Everything in Professional, plus tools to:",
    features: [
      "Document repeatable procedures and quality checks",
      "Manage operational risks and team records",
      "Review performance with advanced reporting",
    ],
  },
};

const valueItems = [
  "Editable Word & Excel files",
  "Secure PayFast checkout",
  "Download after verified payment",
  "Made for SA small businesses",
];

function getFileSummary(tier: PackageTier) {
  const workbookCount = tier.workbookCount;
  const workbookSummary =
    workbookCount > 0
      ? ` + ${workbookCount} Excel workbook${workbookCount === 1 ? "" : "s"}`
      : "";

  return `${formatDocumentRange(tier.key)} Word templates${workbookSummary}`;
}

export function AdminPackPricingSectionClient({
  headingLevel,
  packageTiers,
}: AdminPackPricingSectionClientProps) {
  const Heading = headingLevel;
  const offerActive = getLaunchOfferPhase() === "active";

  return (
    <section
      aria-labelledby="admin-pack-pricing-heading"
      className="bg-[#f8f6f2] py-12 lg:py-20"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#c24100] sm:text-sm">
            Choose your package level
          </p>
          <Heading
            id="admin-pack-pricing-heading"
            className="mt-3 text-3xl font-black leading-tight text-[#111111] sm:text-4xl lg:text-[2.65rem]"
          >
            How much admin support does your business need?
          </Heading>
          <p className="mx-auto mt-4 max-w-3xl text-base leading-7 text-[#5f5f66] sm:text-lg">
            Pick a level, then choose your industry. Every pack contains
            editable Word templates and an Excel workbook built around the work
            your business actually does.
          </p>

          {offerActive ? (
            <div className="mx-auto mt-7 flex max-w-xl items-center gap-3 rounded-md border border-[#ffb995] bg-[#fff4ed] px-4 py-3 text-left text-sm font-black text-[#983600] sm:justify-center">
              <span
                aria-hidden="true"
                className="h-2 w-2 shrink-0 rounded-full bg-[#f15a2b]"
              />
              Launch prices end {LAUNCH_OFFER_END_LABEL} - discounts apply
              automatically
            </div>
          ) : null}
        </div>

        <div className="mt-14 grid gap-5 lg:grid-cols-3 lg:items-stretch">
          {packageTiers.map((tier) => {
            const presentation = tierPresentation[tier.key];
            const pricing = getLaunchOfferPricing({
              priceCents: tier.priceCents,
              productType: "industry_package",
              packageTier: tier.key,
            });
            const hasOfferSaving =
              pricing.isApplied && pricing.discountCents > 0;
            const recommended = tier.key === "professional";

            return (
              <article
                key={tier.key}
                className={`relative flex min-h-full flex-col rounded-md bg-white p-5 shadow-[0_5px_0_rgba(17,17,17,0.08)] sm:p-7 ${
                  recommended
                    ? "border-2 border-[#f15a2b]"
                    : "border border-black/10"
                }`}
              >
                {recommended ? (
                  <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-md bg-[#f15a2b] px-3 py-2 text-[0.65rem] font-black uppercase tracking-[0.08em] text-white">
                    Recommended for growing businesses
                  </span>
                ) : null}

                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#c24100]">
                  {tier.name}
                </p>
                <h3 className="mt-3 text-2xl font-black leading-tight text-[#111111]">
                  {presentation.headline}
                </h3>
                <p className="mt-6 min-h-16 text-sm leading-6 text-[#66666d]">
                  {presentation.description}
                </p>

                <div className="mt-4">
                  <p className="flex flex-wrap items-end gap-x-4 gap-y-1 text-[#111111]">
                    <span className="text-4xl font-black">
                      {formatPrice(pricing.priceCents)}
                    </span>
                    {hasOfferSaving ? (
                      <span className="pb-1 text-sm text-[#7a7774] line-through">
                        {formatPrice(pricing.originalPriceCents)}
                      </span>
                    ) : null}
                  </p>
                  {hasOfferSaving ? (
                    <p className="mt-1 text-sm font-black text-[#13835a]">
                      Save {pricing.discountPercent}% during the launch offer
                    </p>
                  ) : null}
                  <p className="mt-1 text-sm font-bold text-[#5b5855]">
                    Once-off payment &bull; No subscription
                  </p>
                </div>

                <p className="mt-5 rounded-md bg-[#f4f2ef] px-4 py-3 text-sm font-black leading-6 text-[#3f3f46]">
                  {getFileSummary(tier)}
                </p>

                <div className="my-5 h-px bg-black/10" />
                <p className="text-sm font-black text-[#242428]">
                  {presentation.listLabel}
                </p>
                <ul className="mt-4 grid gap-3 text-sm font-bold text-[#404047]">
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
                  <Link
                    href={`/industries?tier=${tier.key}`}
                    className={`inline-flex min-h-12 w-full items-center justify-center rounded-md border-2 px-4 py-3 text-sm font-black transition ${
                      recommended
                        ? "border-[#f15a2b] bg-[#f15a2b] text-white hover:border-[#c24100] hover:bg-[#c24100]"
                        : "border-[#111111] bg-white text-[#111111] hover:bg-[#111111] hover:text-white"
                    }`}
                  >
                    View {tier.name} packs
                  </Link>
                  <p className="mt-2 text-center text-xs font-bold text-[#625f5c]">
                    Compare exact contents by industry
                  </p>
                </div>
              </article>
            );
          })}
        </div>

        <ul className="mt-5 grid overflow-hidden rounded-md border border-black/10 bg-white sm:grid-cols-2 lg:grid-cols-4">
          {valueItems.map((item) => (
            <li
              key={item}
              className="flex min-h-14 items-center gap-3 border-b border-black/10 px-4 py-3 text-sm font-bold text-[#3f3f46] last:border-b-0 sm:[&:nth-child(3)]:border-b-0 sm:[&:nth-child(4)]:border-b-0 lg:border-b-0"
            >
              <span
                aria-hidden="true"
                className="text-sm font-black text-[#16865a]"
              >
                &#10003;
              </span>
              {item}
            </li>
          ))}
        </ul>

        <p className="mx-auto mt-3 max-w-3xl text-center text-xs leading-5 text-[#66666d]">
          Package size varies by industry. The exact file list is shown before
          you add a pack to your cart.
        </p>
      </div>
    </section>
  );
}
