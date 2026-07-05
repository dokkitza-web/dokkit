import { NextResponse } from "next/server";
import { getServerEnv } from "@/lib/env";
import {
  getRequestIp,
  isAllowedPayfastIp,
  payfastAmountToCents,
  validatePayfastData,
  verifyPayfastSignature,
} from "@/lib/payfast";
import { sendDownloadEmailForOrder } from "@/lib/order-delivery";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export const runtime = "nodejs";

type ItnPayload = Record<string, string>;

type OrderRow = {
  id: string;
  order_number: string;
  email: string;
  customer_id: string | null;
  total_cents: number;
};

function parseItnBody(body: string) {
  const params = new URLSearchParams(body);
  const payload: ItnPayload = {};

  for (const [key, value] of params.entries()) {
    payload[key] = value;
  }

  return payload;
}

function paymentStatusForOrder(paymentStatus: string) {
  const normalizedStatus = paymentStatus.toUpperCase();

  if (normalizedStatus === "COMPLETE") {
    return "paid";
  }

  if (normalizedStatus === "CANCELLED") {
    return "cancelled";
  }

  return "failed";
}

function paymentStatusForPayment(paymentStatus: string) {
  return paymentStatus.toUpperCase() === "COMPLETE" ? "verified" : "failed";
}

async function logItn(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  input: {
    payload: ItnPayload;
    orderId?: string;
    paymentId?: string;
    signatureValid?: boolean;
    amountValid?: boolean;
    statusText: string;
    processed?: boolean;
  },
) {
  await supabase.from("payfast_itn_logs").insert({
    payment_id: input.paymentId,
    order_id: input.orderId,
    payload: input.payload,
    signature_valid: input.signatureValid,
    amount_valid: input.amountValid,
    status_text: input.statusText,
    processed_at: input.processed ? new Date().toISOString() : null,
  });
}

export async function POST(request: Request) {
  const env = getServerEnv();
  const supabase = createSupabaseAdminClient();
  const payload = parseItnBody(await request.text());
  const orderNumber = payload.m_payment_id;
  const paymentStatus = payload.payment_status || "";
  const signatureValid = verifyPayfastSignature(payload, env.payfastPassphrase);
  const clientIp = getRequestIp(request);
  const ipValid =
    !env.payfastRequireIpMatch ||
    isAllowedPayfastIp(clientIp, env.payfastAllowedIps);

  if (!orderNumber) {
    await logItn(supabase, {
      payload,
      signatureValid,
      statusText: "Missing m_payment_id.",
    });

    return NextResponse.json({ error: "Missing order reference." }, { status: 400 });
  }

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id, order_number, email, customer_id, total_cents")
    .eq("payfast_m_payment_id", orderNumber)
    .single<OrderRow>();

  if (orderError || !order) {
    await logItn(supabase, {
      payload,
      signatureValid,
      statusText: "Order not found.",
    });

    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  const { data: payment } = await supabase
    .from("payments")
    .select("id")
    .eq("order_id", order.id)
    .eq("provider", "payfast")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const amountCents = payfastAmountToCents(
    payload.amount_gross || payload.amount || payload.amount_net,
  );
  const amountValid = amountCents === order.total_cents;
  const merchantValid =
    !payload.merchant_id || payload.merchant_id === env.payfastMerchantId;
  const dataValid =
    signatureValid &&
    amountValid &&
    merchantValid &&
    ipValid &&
    (await validatePayfastData(payload, env.payfastValidateUrl).catch(
      () => false,
    ));
  const paymentId = payment?.id;

  if (!dataValid) {
    if (paymentId) {
      await supabase
        .from("payments")
        .update({
          provider_payment_id: payload.pf_payment_id || null,
          status: "invalid",
          amount_cents: amountCents ?? order.total_cents,
          raw_payload: {
            ...payload,
            client_ip: clientIp,
            signature_valid: signatureValid,
            amount_valid: amountValid,
            merchant_valid: merchantValid,
            ip_valid: ipValid,
          },
        })
        .eq("id", paymentId);
    }

    await logItn(supabase, {
      payload,
      orderId: order.id,
      paymentId,
      signatureValid,
      amountValid,
      statusText: "Invalid ITN security checks.",
    });

    return NextResponse.json({ error: "Invalid ITN." }, { status: 400 });
  }

  if (paymentId) {
    await supabase
      .from("payments")
      .update({
        provider_payment_id: payload.pf_payment_id || null,
        status: paymentStatusForPayment(paymentStatus),
        amount_cents: amountCents,
        raw_payload: {
          ...payload,
          client_ip: clientIp,
          signature_valid: signatureValid,
          amount_valid: amountValid,
          merchant_valid: merchantValid,
          ip_valid: ipValid,
        },
        verified_at:
          paymentStatus.toUpperCase() === "COMPLETE"
            ? new Date().toISOString()
            : null,
      })
      .eq("id", paymentId);
  }

  await supabase
    .from("orders")
    .update({
      status: paymentStatusForOrder(paymentStatus),
      paid_at:
        paymentStatus.toUpperCase() === "COMPLETE"
          ? new Date().toISOString()
          : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", order.id);

  await logItn(supabase, {
    payload,
    orderId: order.id,
    paymentId,
    signatureValid,
    amountValid,
    statusText: paymentStatus || "No payment status.",
    processed: true,
  });

  if (paymentStatus.toUpperCase() === "COMPLETE") {
    await sendDownloadEmailForOrder(supabase, order);
  }

  return new Response("OK", { status: 200 });
}

export async function GET() {
  return new Response("OK", { status: 200 });
}
