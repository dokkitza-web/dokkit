import { NextResponse } from "next/server";
import { z } from "zod";
import {
  createDownloadAccessToken,
  hashDownloadToken,
} from "@/lib/downloads";
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

    return {
      product,
      quantity: item.quantity,
      totalCents: product.price_cents * item.quantity,
    };
  });
  const subtotalCents = normalisedItems.reduce(
    (total, item) => total + item.totalCents,
    0,
  );
  const orderNumber = createOrderNumber();
  const orderAccessToken = createDownloadAccessToken();
  const cleanEmail = customer.email.toLowerCase().trim();

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
      discount_cents: 0,
      total_cents: subtotalCents,
      currency: "ZAR",
      payfast_m_payment_id: orderNumber,
      download_access_token_hash: hashDownloadToken(orderAccessToken),
      download_access_token_created_at: new Date().toISOString(),
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
      },
      quantity: item.quantity,
      unit_price_cents: item.product.price_cents,
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
    amount_cents: subtotalCents,
    raw_payload: {},
  });

  if (paymentError) {
    return NextResponse.json({ error: paymentError.message }, { status: 500 });
  }

  const payment = createPayFastPayment({
    orderNumber,
    orderAccessToken,
    email: cleanEmail,
    amountCents: subtotalCents,
    itemName:
      normalisedItems.length === 1
        ? normalisedItems[0].product.name
        : `DokKit order ${orderNumber}`,
  });

  return NextResponse.json(
    {
      orderNumber: order.order_number,
      totalCents: order.total_cents,
      payment,
    },
    { status: 201 },
  );
}
