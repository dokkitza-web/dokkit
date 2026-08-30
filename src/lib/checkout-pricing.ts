import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import {
  LAUNCH_OFFER_DATE_RANGE_LABEL,
  LAUNCH_OFFER_END_ISO,
  LAUNCH_OFFER_LABEL,
  LAUNCH_OFFER_START_ISO,
  getLaunchOfferPricing,
} from "@/lib/launch-offer";
import { tradePackSlugs } from "@/data/trade-packs";

export const checkoutItemsSchema = z
  .array(
    z.object({
      slug: z.string().trim().min(1),
      quantity: z.number().int().min(1).max(20),
    }),
  )
  .min(1)
  .max(50);

export type ProductRow = {
  id: string;
  slug: string;
  name: string;
  description: string;
  product_type: string;
  package_tier: string | null;
  price_cents: number;
  document_count: number;
  workbook_count: number;
  pdf_count: number;
  metadata: Record<string, unknown>;
};

export class CheckoutPricingError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly missingProducts: string[] = [],
  ) {
    super(message);
  }
}

export async function getCheckoutPricing({
  supabase,
  items,
}: {
  supabase: SupabaseClient;
  items: z.infer<typeof checkoutItemsSchema>;
}) {
  const slugs = [...new Set(items.map((item) => item.slug))];
  const sellableSlugs = slugs.filter((slug) => tradePackSlugs.includes(slug));
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select(
      "id,slug,name,description,product_type,package_tier,price_cents,document_count,workbook_count,pdf_count,metadata",
    )
    .in("slug", sellableSlugs)
    .eq("is_live", true);

  if (productsError) {
    throw new CheckoutPricingError(productsError.message, 500);
  }

  const productRows = (products ?? []) as ProductRow[];
  const productBySlug = new Map(
    productRows.map((product) => [product.slug, product]),
  );
  const missingProducts = slugs.filter((slug) => !productBySlug.has(slug));

  if (missingProducts.length) {
    throw new CheckoutPricingError(
      "Some cart items are no longer available.",
      400,
      missingProducts,
    );
  }

  const normalisedItems = items.map((item) => {
    const product = productBySlug.get(item.slug);

    if (!product) {
      throw new CheckoutPricingError(`Missing product ${item.slug}`, 400);
    }

    const pricing = getLaunchOfferPricing({
      priceCents: product.price_cents,
      productType: product.product_type,
      packageTier: product.package_tier,
    });
    const unitPriceCents = pricing.priceCents;

    return {
      product,
      quantity: item.quantity,
      pricing,
      unitPriceCents,
      subtotalCents: product.price_cents * item.quantity,
      discountCents: pricing.discountCents * item.quantity,
      totalCents: unitPriceCents * item.quantity,
      snapshotPricing: {
        standard_price_cents: product.price_cents,
        unit_price_cents: unitPriceCents,
        line_discount_cents: pricing.discountCents * item.quantity,
        offer_label: pricing.isApplied ? LAUNCH_OFFER_LABEL : null,
        offer_applied: pricing.isApplied,
        offer_discount_percent: pricing.isApplied
          ? pricing.discountPercent
          : 0,
        offer_period: pricing.isApplied
          ? LAUNCH_OFFER_DATE_RANGE_LABEL
          : null,
        offer_starts_at: pricing.isApplied ? LAUNCH_OFFER_START_ISO : null,
        offer_ends_at: pricing.isApplied ? LAUNCH_OFFER_END_ISO : null,
      },
    };
  });

  return {
    items: normalisedItems,
    subtotalCents: normalisedItems.reduce(
      (total, item) => total + item.subtotalCents,
      0,
    ),
    discountCents: normalisedItems.reduce(
      (total, item) => total + item.discountCents,
      0,
    ),
    totalCents: normalisedItems.reduce(
      (total, item) => total + item.totalCents,
      0,
    ),
  };
}
