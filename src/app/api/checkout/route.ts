import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { buildPayfastCheckout } from "@/lib/payfast";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export const runtime = "nodejs";

const checkoutSchema = z.object({
  productSlug: z.string().min(1),
  fullName: z.string().min(2).max(120),
  email: z.string().email().max(254),
  phone: z.string().max(40).optional(),
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
  const randomPart = randomBytes(4).toString("hex").toUpperCase();

  return `DK-${datePart}-${randomPart}`;
}

export async function POST(request: Request) {
  const parsed = checkoutSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please provide a valid name, email address, and product." },
      { status: 400 },
    );
  }

  const { productSlug, fullName, email, phone } = parsed.data;
  const normalizedEmail = email.trim().toLowerCase();
  const supabase = createSupabaseAdminClient();

  const { data: product, error: productError } = await supabase
    .from("products")
    .select(
      "id, slug, name, description, product_type, package_tier, price_cents, document_count, workbook_count, pdf_count, metadata",
    )
    .eq("slug", productSlug)
    .eq("is_live", true)
    .single<ProductRow>();

  if (productError || !product) {
    return NextResponse.json(
      { error: "This product is not available for checkout." },
      { status: 404 },
    );
  }

  const { data: productFile, error: productFileError } = await supabase
    .from("product_files")
    .select("id")
    .eq("product_id", product.id)
    .eq("file_kind", "zip")
    .eq("is_active", true)
    .limit(1)
    .maybeSingle();

  if (productFileError || !productFile) {
    return NextResponse.json(
      { error: "This product has no active downloadable file yet." },
      { status: 409 },
    );
  }

  const { data: customer, error: customerError } = await supabase
    .from("customers")
    .upsert(
      {
        email: normalizedEmail,
        full_name: fullName.trim(),
        phone: phone?.trim() || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "email" },
    )
    .select("id")
    .single();

  if (customerError || !customer) {
    return NextResponse.json(
      { error: "Could not create the customer record." },
      { status: 500 },
    );
  }

  const orderNumber = createOrderNumber();
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      order_number: orderNumber,
      customer_id: customer.id,
      email: normalizedEmail,
      status: "pending_payment",
      subtotal_cents: product.price_cents,
      discount_cents: 0,
      total_cents: product.price_cents,
      currency: "ZAR",
      payfast_m_payment_id: orderNumber,
    })
    .select("id, order_number, total_cents")
    .single();

  if (orderError || !order) {
    return NextResponse.json(
      { error: "Could not create the order." },
      { status: 500 },
    );
  }

  const { error: itemError } = await supabase.from("order_items").insert({
    order_id: order.id,
    product_id: product.id,
    product_snapshot: {
      slug: product.slug,
      name: product.name,
      product_type: product.product_type,
      package_tier: product.package_tier,
      price_cents: product.price_cents,
      document_count: product.document_count,
      workbook_count: product.workbook_count,
      pdf_count: product.pdf_count,
      metadata: product.metadata,
    },
    quantity: 1,
    unit_price_cents: product.price_cents,
    total_cents: product.price_cents,
  });

  if (itemError) {
    return NextResponse.json(
      { error: "Could not create the order item." },
      { status: 500 },
    );
  }

  const { error: paymentError } = await supabase.from("payments").insert({
    order_id: order.id,
    provider: "payfast",
    status: "initiated",
    amount_cents: order.total_cents,
    raw_payload: {
      source: "checkout",
      product_slug: product.slug,
    },
  });

  if (paymentError) {
    return NextResponse.json(
      { error: "Could not create the payment record." },
      { status: 500 },
    );
  }

  const checkout = buildPayfastCheckout({
    orderNumber: order.order_number,
    productSlug: product.slug,
    productName: product.name,
    productDescription: product.description,
    amountCents: order.total_cents,
    customerName: fullName,
    customerEmail: normalizedEmail,
  });

  return NextResponse.json({
    orderNumber: order.order_number,
    paymentUrl: checkout.paymentUrl,
    fields: checkout.fields,
  });
}
