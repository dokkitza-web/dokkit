"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PayfastLogo } from "@/components/payfast-logo";
import {
  VAT_INCLUDED_LABEL,
  VAT_INCLUDED_SUMMARY_LABEL,
  formatFileFormats,
  formatPrice,
  getVatPortionCents,
  type SingleDocument,
} from "@/data/catalogue";
import {
  CART_STORAGE_KEY,
  CART_UPDATED_EVENT,
  formatCartCount,
  formatCartDiscountTotal,
  formatCartTotal,
  type CartItem,
} from "@/lib/cart";

const PACKAGE_TIER_SUFFIXES = [
  "-essential",
  "-starter",
  "-professional",
  "-complete",
];

const GENERAL_RECOMMENDATION_SLUGS = [
  "income-and-expense-tracker",
  "business-financial-income-statement-template",
  "crm-tracker",
  "non-disclosure-agreement-template",
  "popia-privacy-policy-statement-template",
  "joint-venture-structure-agreement-template",
];

const INDUSTRY_RECOMMENDATION_SLUGS: Record<string, string[]> = {
  "human-resources": [
    "business-financial-income-statement-template",
    "income-and-expense-tracker",
    "crm-tracker",
  ],
  "beauty-salons-and-spas": [
    "popia-privacy-policy-statement-template",
    "general-service-agreement-template",
    "non-disclosure-agreement-template",
  ],
  "catering-and-baking": [
    "general-service-agreement-template",
    "popia-privacy-policy-statement-template",
    "non-disclosure-agreement-template",
  ],
  "freelancers-consultants": [
    "non-disclosure-agreement-template",
    "joint-venture-structure-agreement-template",
    "crm-tracker",
  ],
  "landscaping-garden-services": [
    "popia-privacy-policy-statement-template",
    "crm-tracker",
    "income-and-expense-tracker",
  ],
  "transport-delivery-services": [
    "crm-tracker",
    "income-and-expense-tracker",
    "popia-privacy-policy-statement-template",
  ],
};

function readCart() {
  try {
    const rawCart = window.localStorage.getItem(CART_STORAGE_KEY);

    return rawCart ? (JSON.parse(rawCart) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function writeCart(items: CartItem[]) {
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(CART_UPDATED_EVENT));
}

function getIndustrySlugFromPackageSlug(slug: string) {
  const suffix = PACKAGE_TIER_SUFFIXES.find((item) => slug.endsWith(item));

  return suffix ? slug.slice(0, -suffix.length) : null;
}

function getRecommendationPriority(cart: CartItem[]) {
  const industrySlugs = cart
    .filter((item) => item.category === "industry_package")
    .map((item) => getIndustrySlugFromPackageSlug(item.slug))
    .filter((slug): slug is string => Boolean(slug));
  const prioritySlugs = new Set<string>();

  industrySlugs.forEach((slug) => {
    INDUSTRY_RECOMMENDATION_SLUGS[slug]?.forEach((item) =>
      prioritySlugs.add(item),
    );
  });
  GENERAL_RECOMMENDATION_SLUGS.forEach((item) => prioritySlugs.add(item));

  return [...prioritySlugs];
}

function getRecommendedDocuments(
  singleDocuments: SingleDocument[],
  cart: CartItem[],
  packageInclusions: Record<string, string[]>,
) {
  const excludedSlugs = new Set(cart.map((item) => item.slug));
  cart
    .filter((item) => item.category === "industry_package")
    .forEach((item) => {
      packageInclusions[item.slug]?.forEach((slug) =>
        excludedSlugs.add(slug),
      );
    });
  const documentsBySlug = new Map(
    singleDocuments.map((document) => [document.slug, document]),
  );
  const prioritySlugs = getRecommendationPriority(cart);

  return prioritySlugs
    .map((slug) => documentsBySlug.get(slug))
    .filter(
      (document): document is SingleDocument =>
        document !== undefined && !excludedSlugs.has(document.slug),
    )
    .slice(0, 3);
}

export function RecommendedAddOnsPage({
  singleDocuments,
  packageInclusions,
}: {
  singleDocuments: SingleDocument[];
  packageInclusions: Record<string, string[]>;
}) {
  const [cart, setCart] = useState<CartItem[]>(readCart);
  const recommendations = useMemo(
    () =>
      getRecommendedDocuments(singleDocuments, cart, packageInclusions),
    [cart, packageInclusions, singleDocuments],
  );
  const cartCount = useMemo(() => formatCartCount(cart), [cart]);
  const hasPackage = useMemo(
    () => cart.some((item) => item.category === "industry_package"),
    [cart],
  );
  const totalCents = useMemo(() => formatCartTotal(cart), [cart]);
  const discountCents = useMemo(() => formatCartDiscountTotal(cart), [cart]);
  const vatPortionCents = useMemo(
    () => getVatPortionCents(totalCents),
    [totalCents],
  );

  function addDocument(document: SingleDocument) {
    const existingItem = cart.find((item) => item.slug === document.slug);
    const nextCart = existingItem
      ? cart.map((item) =>
          item.slug === document.slug
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item,
        )
      : [
          ...cart,
          {
            slug: document.slug,
            name: document.name,
            priceCents: document.priceCents,
            quantity: 1,
            category: "single_document" as const,
            description: document.description,
          },
        ];

    setCart(nextCart);
    writeCart(nextCart);
  }

  if (!cart.length) {
    return (
      <section className="mx-auto max-w-3xl px-6 py-14 lg:px-8">
        <div className="rounded-lg border border-[#ece7df] bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#ff6a00]">
            Recommended add-ons
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            Your cart is empty
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#5f5f66]">
            Add an industry package or single document before reviewing add-ons.
          </p>
          <Link
            href="/industries"
            className="mt-6 inline-flex rounded-md bg-[#ff6a00] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#d95400]"
          >
            Browse industries
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-14 pb-32 lg:px-8 lg:pb-16">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#ff6a00]">
          Optional add-ons
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">
          Up to three useful extras, checked against your cart.
        </h1>
        <p className="mt-4 text-lg leading-8 text-[#5f5f66]">
          We remove products already in your cart and document types already
          covered by a selected package. Adding anything here is optional.
        </p>
        <Link
          href="/checkout"
          className="mt-6 inline-flex min-h-12 items-center justify-center rounded-md bg-[#c24100] px-5 py-3 text-sm font-black text-white transition hover:bg-[#9a3412]"
        >
          No thanks—continue to checkout
        </Link>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          {recommendations.length ? (
            <div className="grid gap-4 md:grid-cols-2">
              {recommendations.map((document) => (
                <article
                  key={document.slug}
                  className="rounded-[1.5rem] border border-black/10 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-[#ff6a00] hover:shadow-xl"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.16em] text-[#ff6a00]">
                        {hasPackage
                          ? "Not included in your selected pack"
                          : "Optional add-on"}
                      </p>
                      <h2 className="mt-2 text-lg font-black text-[#111111]">
                        {document.name}
                      </h2>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="rounded-full bg-[#111111] px-3 py-1 text-sm font-black text-white">
                        {formatPrice(document.priceCents)}
                      </p>
                      <p className="mt-1 text-[0.65rem] font-black uppercase tracking-[0.12em] text-[#d95400]">
                        {VAT_INCLUDED_LABEL}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[#5f5f66]">
                    {document.description}
                  </p>
                  <p className="mt-5 text-xs font-black tracking-[0.08em] text-[#ff6a00]">
                    {formatFileFormats(document.fileFormats)} / PDF coming soon
                  </p>
                  <button
                    type="button"
                    onClick={() => addDocument(document)}
                    className="mt-5 rounded-full bg-[#ff6a00] px-5 py-3 text-sm font-black text-white shadow-lg shadow-[#ff6a00]/20 transition hover:bg-[#d95400]"
                  >
                    Add to cart
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-[1.5rem] border border-black/10 bg-white p-8 shadow-sm">
              <h2 className="text-xl font-black">
                Your cart already covers the closest matches
              </h2>
              <p className="mt-3 text-sm leading-6 text-[#5f5f66]">
                Continue to checkout without adding another product.
              </p>
            </div>
          )}
        </div>

        <aside className="hidden h-fit rounded-lg border border-[#ece7df] bg-white p-6 shadow-sm lg:sticky lg:top-24 lg:block">
          <h2 className="text-xl font-semibold">Checkout summary</h2>
          <div className="mt-5 flex items-center justify-between text-sm">
            <span className="text-[#5f5f66]">Items</span>
            <span className="font-semibold">{cartCount}</span>
          </div>
          {discountCents > 0 ? (
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-[#5f5f66]">Launch offer saving</span>
              <span className="font-semibold text-[#d95400]">
                -{formatPrice(discountCents)}
              </span>
            </div>
          ) : null}
          <div className="mt-4 flex items-center justify-between border-t border-[#eef2ef] pt-4 text-sm">
            <span className="text-[#5f5f66]">Total</span>
            <span className="text-xl font-semibold text-[#ff6a00]">
              {formatPrice(totalCents)}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="font-bold uppercase tracking-[0.12em] text-[#d95400]">
              {VAT_INCLUDED_SUMMARY_LABEL}
            </span>
            <span className="font-semibold text-[#5f5f66]">
              {formatPrice(vatPortionCents)}
            </span>
          </div>
          <div className="mt-5 rounded-md border border-black/10 p-4">
            <p className="mb-2 text-xs font-black uppercase tracking-[0.12em] text-[#5f5f66]">
              Secure payment
            </p>
            <PayfastLogo className="h-8 w-auto" />
          </div>
          <Link
            href="/checkout"
            className="mt-6 flex min-h-12 w-full items-center justify-center rounded-md bg-[#c24100] px-5 py-3 text-center text-sm font-black text-white transition hover:bg-[#9a3412]"
          >
            No thanks—continue to checkout
          </Link>
          <Link
            href="/cart"
            className="mt-3 flex min-h-11 w-full items-center justify-center rounded-md border border-[#ece7df] px-5 py-2.5 text-sm font-semibold text-[#111111] transition hover:border-[#c24100]"
          >
            Back to cart
          </Link>
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-black/10 bg-white/95 px-5 py-4 shadow-2xl backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#5f5f66]">
              {cartCount} item{cartCount === 1 ? "" : "s"}
            </p>
            <p className="text-lg font-black text-[#ff6a00]">
              {formatPrice(totalCents)}
            </p>
          </div>
          <Link
            href="/checkout"
            className="max-w-[15rem] shrink-0 rounded-md bg-[#c24100] px-4 py-3 text-center text-xs font-black text-white shadow-lg transition hover:bg-[#9a3412]"
          >
            No thanks—continue to checkout
          </Link>
        </div>
      </div>
    </section>
  );
}
