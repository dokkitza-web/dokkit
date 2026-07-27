import { NextResponse } from "next/server";
import { z } from "zod";
import {
  CheckoutPricingError,
  checkoutItemsSchema,
  getCheckoutPricing,
} from "@/lib/checkout-pricing";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

const quoteSchema = z.object({
  items: checkoutItemsSchema,
});

export async function POST(request: Request) {
  const parsedBody = quoteSchema.safeParse(await request.json());

  if (!parsedBody.success) {
    return NextResponse.json(
      { error: "Invalid cart details." },
      { status: 400 },
    );
  }

  try {
    const pricing = await getCheckoutPricing({
      supabase: createSupabaseServiceClient(),
      items: parsedBody.data.items,
    });

    return NextResponse.json({
      subtotalCents: pricing.subtotalCents,
      discountCents: pricing.discountCents,
      totalCents: pricing.totalCents,
      items: pricing.items.map((item) => ({
        slug: item.product.slug,
        name: item.product.name,
        quantity: item.quantity,
        unitPriceCents: item.unitPriceCents,
        totalCents: item.totalCents,
      })),
    });
  } catch (error) {
    if (error instanceof CheckoutPricingError) {
      return NextResponse.json(
        {
          error: error.message,
          missingProducts: error.missingProducts,
        },
        { status: error.status },
      );
    }

    return NextResponse.json(
      { error: "Could not calculate the order total." },
      { status: 500 },
    );
  }
}
