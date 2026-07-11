import { NextResponse } from "next/server";
import { z } from "zod";
import { createOrderAccessToken } from "@/lib/downloads";
import { sendOrderConfirmationEmail } from "@/lib/emails";
import {
  LAUNCH_OFFER_DATE_RANGE_LABEL,
  LAUNCH_OFFER_END_ISO,
  LAUNCH_OFFER_LABEL,
  LAUNCH_OFFER_START_ISO,
  getLaunchOfferPricing,
} from "@/lib/launch-offer";
import { createPayFastPayment } from "@/lib/payfast";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

const checkoutSchema = z.object({
  customer: z.object({
    email: z.string().email(),
    fullName: z.string().trim().min(2).max(120).optional().or(z.literal("")),
    phone: z.string().trim().max(40).optional().or(z.literal("")),
  }),
  items: z
    .array(
      z.object({
        slug: z.string().trim().min(1),
        quantity: z.number().int().min(1).max(20),
      }),
    )
    .min(1)
    .max(50),
});

type ProductRow = {
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

function createOrderNumber() {
  const datePart = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const randomPart = crypto.randomUUID().slice(0, 8).toUpperCase();

  return `DK-${datePart}-${randomPart}`;
}

export async function POST(request: Request) {
  const parsedBody = checkoutSchema.safeParse(await request.json());

  if (!parsedBody.success) {
    return NextResponse.json(
      {
        error: "Invalid checkout details.",
        issues: parsedBody.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  let supabase;

  try {
    supabase = createSupabaseServiceClient();
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Server checkout configuration is missing.",
      },
      { status: 503 },
    );
  }

  const { customer, items } = parsedBody.data;
  const slugs = [...new Set(items.map((item) => item.slug))];
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select(
      "id,slug,name,description,product_type,package_tier,price_cents,document_count,workbook_count,pdf_count,metadata",
    )
    .in("slug", slugs)
    .eq("is_live", true);

  if (productsError) {
    return NextResponse.json({ error: productsError.message }, { status: 500 });
  }

  const productRows = (products ?? []) as ProductRow[];
  const productBySlug = new Map(productRows.map((product) => [product.slug, product]));
  const missingProducts = slugs.filter((slug) => !productBySlug.has(slug));

  if (missingProducts.length) {
    return NextResponse.json(
      {
        error: "Some cart items are no longer available.",
        missingProducts,
      },
      { status: 400 },
    );
  }

  const normalisedItems = items.map((item) => {
    const product = productBySlug.get(item.slug);

    if (!product) {
      throw new Error(`Missing product ${item.slug}`);
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
    };
  });
  const subtotalCents = normalisedItems.reduce(
    (total, item) => total + item.subtotalCents,
    0,
  );
  const discountCents = normalisedItems.reduce(
    (total, item) => total + item.discountCents,
    0,
  );
  const totalCents = normalisedItems.reduce(
    (total, item) => total + item.totalCents,
    0,
  );
  const orderNumber = createOrderNumber();
  const orderAccessToken = createOrderAccessToken(orderNumber);
  const cleanEmail = customer.email.toLowerCase().trim();
  const payment = createPayFastPayment({
    orderNumber,
    orderAccessToken,
    email: cleanEmail,
    amountCents: totalCents,
    itemName:
      normalisedItems.length === 1
        ? normalisedItems[0].product.name
        : `DokKit order ${orderNumber}`,
  });

  if (payment.mode === "configuration_required") {
    return NextResponse.json({ error: payment.message }, { status: 503 });
  }

  const { data: customerRow, error: customerError } = await supabase
    .from("customers")
    .upsert(
      {
        email: cleanEmail,
        full_name: customer.fullName || null,
        phone: customer.phone || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "email" },
    )
    .select("id")
    .single();

  if (customerError) {
    return NextResponse.json({ error: customerError.message }, { status: 500 });
  }

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      order_number: orderNumber,
      customer_id: customerRow.id,
      email: cleanEmail,
      status: "pending_payment",
      subtotal_cents: subtotalCents,
      discount_cents: discountCents,
      total_cents: totalCents,
      currency: "ZAR",
      payfast_m_payment_id: orderNumber,
    })
    .select("id,order_number,total_cents")
    .single();

  if (orderError) {
    return NextResponse.json({ error: orderError.message }, { status: 500 });
  }

  const { error: orderItemsError } = await supabase.from("order_items").insert(
    normalisedItems.map((item) => ({
      order_id: order.id,
      product_id: item.product.id,
      product_snapshot: {
        slug: item.product.slug,
        name: item.product.name,
        description: item.product.description,
        product_type: item.product.product_type,
        package_tier: item.product.package_tier,
        document_count: item.product.document_count,
        workbook_count: item.product.workbook_count,
        pdf_count: item.product.pdf_count,
        metadata: item.product.metadata,
        pricing: {
          standard_price_cents: item.product.price_cents,
          unit_price_cents: item.unitPriceCents,
          line_discount_cents: item.discountCents,
          offer_label: item.pricing.isApplied ? LAUNCH_OFFER_LABEL : null,
          offer_applied: item.pricing.isApplied,
          offer_discount_percent: item.pricing.isApplied
            ? item.pricing.discountPercent
            : 0,
          offer_period: item.pricing.isApplied
            ? LAUNCH_OFFER_DATE_RANGE_LABEL
            : null,
          offer_starts_at: item.pricing.isApplied
            ? LAUNCH_OFFER_START_ISO
            : null,
          offer_ends_at: item.pricing.isApplied ? LAUNCH_OFFER_END_ISO : null,
        },
      },
      quantity: item.quantity,
      unit_price_cents: item.unitPriceCents,
      total_cents: item.totalCents,
    })),
  );

  if (orderItemsError) {
    return NextResponse.json({ error: orderItemsError.message }, { status: 500 });
  }

  const { error: paymentError } = await supabase.from("payments").insert({
    order_id: order.id,
    provider: "payfast",
    status: "initiated",
    amount_cents: totalCents,
    raw_payload: {},
  });

  if (paymentError) {
    return NextResponse.json({ error: paymentError.message }, { status: 500 });
  }

  await sendOrderConfirmationEmail({
    supabase,
    orderId: order.id,
    customerId: customerRow.id,
    orderNumber,
    to: cleanEmail,
    totalCents,
    accessToken: orderAccessToken,
    items: normalisedItems.map((item) => ({
      name: item.product.name,
      quantity: item.quantity,
      totalCents: item.totalCents,
    })),
  });

  return NextResponse.json(
    {
      orderNumber: order.order_number,
      discountCents,
      totalCents: order.total_cents,
      payment,
    },
    { status: 201 },
  );
}
