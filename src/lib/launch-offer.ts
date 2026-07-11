import type { PackageTierKey } from "@/data/catalogue";

export type LaunchOfferPhase = "upcoming" | "active" | "ended";

export const LAUNCH_OFFER_START_ISO = "2026-07-12T22:00:00.000Z";
export const LAUNCH_OFFER_END_ISO = "2026-07-31T21:59:59.999Z";
export const LAUNCH_OFFER_START_LABEL = "13 July 2026";
export const LAUNCH_OFFER_END_LABEL = "31 July 2026";
export const LAUNCH_OFFER_DATE_RANGE_LABEL = "13 to 31 July 2026";
export const LAUNCH_OFFER_LABEL = "Launch offer";

export const LAUNCH_OFFER_DISCOUNTS: Record<PackageTierKey, number> = {
  starter: 10,
  professional: 15,
  complete: 20,
};

const launchOfferStartTime = new Date(LAUNCH_OFFER_START_ISO).getTime();
const launchOfferEndTime = new Date(LAUNCH_OFFER_END_ISO).getTime();

function isPackageTierKey(value?: string | null): value is PackageTierKey {
  return (
    value === "starter" || value === "professional" || value === "complete"
  );
}

export function getLaunchOfferPhase(now = new Date()): LaunchOfferPhase {
  const nowTime = now.getTime();

  if (nowTime < launchOfferStartTime) {
    return "upcoming";
  }

  if (nowTime > launchOfferEndTime) {
    return "ended";
  }

  return "active";
}

export function isLaunchOfferActive(now = new Date()) {
  return getLaunchOfferPhase(now) === "active";
}

export function getLaunchOfferDiscountPercent({
  productType,
  packageTier,
}: {
  productType?: string | null;
  packageTier?: string | null;
}) {
  if (productType !== "industry_package" || !isPackageTierKey(packageTier)) {
    return 0;
  }

  return LAUNCH_OFFER_DISCOUNTS[packageTier];
}

export function getLaunchOfferPriceCents(
  priceCents: number,
  discountPercent: number,
) {
  if (discountPercent <= 0) {
    return priceCents;
  }

  return Math.round((priceCents * (100 - discountPercent)) / 100);
}

export function getLaunchOfferPricing({
  priceCents,
  productType,
  packageTier,
  now = new Date(),
  forceActive = false,
}: {
  priceCents: number;
  productType?: string | null;
  packageTier?: string | null;
  now?: Date;
  forceActive?: boolean;
}) {
  const phase = getLaunchOfferPhase(now);
  const discountPercent = getLaunchOfferDiscountPercent({
    productType,
    packageTier,
  });
  const isEligible = discountPercent > 0;
  const isApplied = isEligible && (forceActive || phase === "active");
  const discountedPriceCents = getLaunchOfferPriceCents(
    priceCents,
    discountPercent,
  );
  const finalPriceCents = isApplied ? discountedPriceCents : priceCents;

  return {
    phase,
    isEligible,
    isApplied,
    discountPercent,
    originalPriceCents: priceCents,
    priceCents: finalPriceCents,
    discountCents: priceCents - finalPriceCents,
  };
}
