import { NextResponse } from "next/server";
import { z } from "zod";
import {
  CheckoutPricingError,
  checkoutItemsSchema,
  getCheckoutPricing,
} from "@/lib/checkout-pricing";
import { POLICY_BUNDLE_VERSION } from "@/data/legal-policies";
import {
  CONSENT_COOKIE_NAME,
  hashConsentKey,
  readCookie,
} from "@/lib/consent";
import {
  createOrderAccessCookieName,
  createOrderAccessToken,
  decryptDownloadAccessToken,
  encryptDownloadAccessToken,
  hashDownloadToken,
} from "@/lib/downloads";
import { sendOrderConfirmationEmail } from "@/lib/emails";
import { createPayFastPayment } from "@/lib/payfast";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

const checkoutSchema = z.object({
  customer: z.object({
    email: z.string().email(),
    fullName: z.string().trim().min(2).max(120).optional().or(z.literal("")),
    phone: z.string().trim().max(40).optional().or(z.literal("")),
  }),
  items: checkoutItemsSchema,
  quotedTotalCents: z.number().int().nonnegative(),
  checkoutAttemptId: z.uuid(),
  policyAccepted: z.literal(true),
  attribution: z
    .object({
      fbp: z.string().trim().min(1).max(255).optional(),
      fbc: z.string().trim().min(1).max(255).optional(),
    })
    .optional(),
});

function createOrderNumber() {
  const datePart = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const randomPart = crypto.randomUUID().slice(0, 8).toUpperCase();

  return `DK-${datePart}-${randomPart}`;
}

function getClientIp(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    undefined
  );
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

  const {
    attribution,
    customer,
    items,
    checkoutAttemptId,
    quotedTotalCents,
  } = parsedBody.data;
  let checkoutPricing;

  try {
    checkoutPricing = await getCheckoutPricing({ supabase, items });
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
      { error: "Could not verify the order total." },
      { status: 500 },
    );
  }

  const {
    items: normalisedItems,
    subtotalCents,
    discountCents,
    totalCents,
  } = checkoutPricing;

  if (quotedTotalCents !== totalCents) {
    return NextResponse.json(
      {
        error:
          "The order total changed before payment. Review the updated total and try again.",
        totalCents,
      },
      { status: 409 },
    );
  }

  const cleanEmail = customer.email.toLowerCase().trim();
  const acceptedAtUtc = new Date().toISOString();
  const consentKey = readCookie(request, CONSENT_COOKIE_NAME);
  const { data: existingOrder, error: existingOrderError } = await supabase
    .from("orders")
    .select(
      "id,order_number,email,total_cents,discount_cents,download_access_token_ciphertext",
    )
    .eq("checkout_attempt_id", checkoutAttemptId)
    .maybeSingle();

  if (existingOrderError) {
    return NextResponse.json(
      { error: existingOrderError.message },
      { status: 500 },
    );
  }

  if (existingOrder) {
    if (
      existingOrder.email !== cleanEmail ||
      existingOrder.total_cents !== totalCents
    ) {
      return NextResponse.json(
        {
          error:
            "This checkout attempt changed. Review the order and start payment again.",
        },
        { status: 409 },
      );
    }

    const existingAccessToken = decryptDownloadAccessToken(
      existingOrder.download_access_token_ciphertext,
    );

    if (!existingAccessToken) {
      return NextResponse.json(
        { error: "The existing secure order session could not be restored." },
        { status: 500 },
      );
    }

    const [
      { count: existingItemCount },
      { data: existingPaymentRow },
    ] = await Promise.all([
      supabase
        .from("order_items")
        .select("id", { count: "exact", head: true })
        .eq("order_id", existingOrder.id),
      supabase
        .from("payments")
        .select("id")
        .eq("order_id", existingOrder.id)
        .eq("provider", "payfast")
        .maybeSingle(),
    ]);

    if (!existingItemCount || !existingPaymentRow) {
      return NextResponse.json(
        {
          error:
            "This checkout attempt is still being prepared. Wait a moment and try the payment button again.",
        },
        { status: 409 },
      );
    }

    const existingPayment = createPayFastPayment({
      orderNumber: existingOrder.order_number,
      email: cleanEmail,
      amountCents: totalCents,
      itemName:
        normalisedItems.length === 1
          ? normalisedItems[0].product.name
          : `DokKit order ${existingOrder.order_number}`,
    });
    const existingResponse = NextResponse.json({
      orderNumber: existingOrder.order_number,
      discountCents: existingOrder.discount_cents,
      totalCents: existingOrder.total_cents,
      payment: existingPayment,
    });

    existingResponse.cookies.set(
      createOrderAccessCookieName(existingOrder.order_number),
      existingAccessToken,
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 8 * 24 * 60 * 60,
      },
    );

    return existingResponse;
  }

  const orderNumber = createOrderNumber();
  const orderAccessToken = createOrderAccessToken();
  const payment = createPayFastPayment({
    orderNumber,
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
      checkout_attempt_id: checkoutAttemptId,
      policy_bundle_version: POLICY_BUNDLE_VERSION,
      policy_accepted_at: acceptedAtUtc,
      download_access_token_hash: hashDownloadToken(orderAccessToken),
      download_access_token_ciphertext:
        encryptDownloadAccessToken(orderAccessToken),
    })
    .select("id,order_number,total_cents")
    .single();

  if (orderError) {
    if (orderError.code === "23505") {
      return NextResponse.json(
        {
          error:
            "This checkout attempt is already being prepared. Wait a moment and try the payment button again.",
        },
        { status: 409 },
      );
    }

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
        pricing: item.snapshotPricing,
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
    raw_payload: {
      _policy_acceptance: {
        policy_bundle_version: POLICY_BUNDLE_VERSION,
        accepted_at_utc: acceptedAtUtc,
        customer_id: customerRow.id,
      },
      ...(attribution
        ? {
            _meta_attribution: {
              fbp: attribution.fbp,
              fbc: attribution.fbc,
              client_ip_address: getClientIp(request),
              client_user_agent:
                request.headers.get("user-agent")?.slice(0, 500) ?? undefined,
              consent_key_hash: consentKey
                ? hashConsentKey(consentKey)
                : undefined,
            },
          }
        : {}),
    },
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

  const response = NextResponse.json(
    {
      orderNumber: order.order_number,
      discountCents,
      totalCents: order.total_cents,
      payment,
    },
    { status: 201 },
  );

  response.cookies.set(
    createOrderAccessCookieName(orderNumber),
    orderAccessToken,
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 8 * 24 * 60 * 60,
    },
  );

  return response;
}
