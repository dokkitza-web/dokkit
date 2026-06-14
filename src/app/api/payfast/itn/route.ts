import crypto from "node:crypto";
import dns from "node:dns/promises";
import type { SupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { decryptDownloadAccessToken } from "@/lib/downloads";
import { sendDownloadReadyEmail } from "@/lib/emails";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

type PayFastData = Record<string, string>;

type VerifiedOrderRow = {
  id: string;
  order_number: string;
  total_cents: number;
  status: string;
  email: string;
  customer_id: string | null;
  download_access_token_ciphertext: string | null;
};

type OrderEmailItemRow = {
  quantity: number;
  total_cents: number;
  product_snapshot: {
    name?: string;
  };
};

function encodePayFastValue(value: string) {
  return encodeURIComponent(value.trim()).replace(/%20/g, "+");
}

function getPayFastHost() {
  const processUrl =
    process.env.PAYFAST_PROCESS_URL || "https://sandbox.payfast.co.za/eng/process";

  return processUrl.includes("sandbox")
    ? "sandbox.payfast.co.za"
    : "www.payfast.co.za";
}

function parseForwardedIps(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");

  return [forwardedFor, realIp]
    .filter(Boolean)
    .flatMap((value) => value?.split(",") ?? [])
    .map((value) => value.trim())
    .filter(Boolean);
}

function buildParamString(searchParams: URLSearchParams) {
  const entries = [...searchParams.entries()].filter(([key]) => key !== "signature");

  return entries
    .map(([key, value]) => `${key}=${encodePayFastValue(value)}`)
    .join("&");
}

function paramsToData(searchParams: URLSearchParams): PayFastData {
  return Object.fromEntries([...searchParams.entries()]);
}

function validSignature(data: PayFastData, paramString: string) {
  const passphrase = process.env.PAYFAST_PASSPHRASE;
  const signatureSource = passphrase
    ? `${paramString}&passphrase=${encodePayFastValue(passphrase)}`
    : paramString;
  const expectedSignature = crypto
    .createHash("md5")
    .update(signatureSource)
    .digest("hex");

  return data.signature === expectedSignature;
}

async function validPayFastIp(request: Request) {
  if (process.env.PAYFAST_SKIP_IP_CHECK === "true") {
    return true;
  }

  const requestIps = parseForwardedIps(request);

  if (!requestIps.length) {
    return false;
  }

  const validHosts = [
    "www.payfast.co.za",
    "sandbox.payfast.co.za",
    "w1w.payfast.co.za",
    "w2w.payfast.co.za",
  ];
  const lookupResults = await Promise.allSettled(
    validHosts.map((host) => dns.lookup(host, { all: true })),
  );
  const validIps = new Set(
    lookupResults.flatMap((result) =>
      result.status === "fulfilled"
        ? result.value.map((address) => address.address)
        : [],
    ),
  );

  return requestIps.some((ip) => validIps.has(ip));
}

function validPaymentAmount(expectedCents: number, amountGross: string | undefined) {
  const paidAmount = Number.parseFloat(amountGross ?? "");

  if (!Number.isFinite(paidAmount)) {
    return false;
  }

  return Math.abs(expectedCents / 100 - paidAmount) <= 0.01;
}

async function validServerConfirmation(paramString: string) {
  const host = getPayFastHost();
  const response = await fetch(`https://${host}/eng/query/validate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: paramString,
  });
  const result = (await response.text()).trim();

  return result === "VALID";
}

async function logItn({
  payload,
  orderId,
  paymentId,
  signatureValid,
  amountValid,
  statusText,
  processed,
}: {
  payload: PayFastData;
  orderId?: string;
  paymentId?: string;
  signatureValid?: boolean;
  amountValid?: boolean;
  statusText?: string;
  processed?: boolean;
}) {
  const supabase = createSupabaseServiceClient();

  await supabase.from("payfast_itn_logs").insert({
    payment_id: paymentId ?? null,
    order_id: orderId ?? null,
    payload,
    signature_valid: signatureValid ?? null,
    amount_valid: amountValid ?? null,
    status_text: statusText ?? payload.payment_status ?? null,
    processed_at: processed ? new Date().toISOString() : null,
  });
}

async function sendDownloadEmailForOrder({
  supabase,
  order,
}: {
  supabase: SupabaseClient;
  order: VerifiedOrderRow;
}) {
  const accessToken = decryptDownloadAccessToken(
    order.download_access_token_ciphertext,
  );

  if (!accessToken) {
    return;
  }

  const { data: orderItems } = await supabase
    .from("order_items")
    .select("quantity,total_cents,product_snapshot")
    .eq("order_id", order.id);

  await sendDownloadReadyEmail({
    supabase,
    orderId: order.id,
    customerId: order.customer_id,
    orderNumber: order.order_number,
    to: order.email,
    totalCents: order.total_cents,
    accessToken,
    items: ((orderItems ?? []) as OrderEmailItemRow[]).map((item) => ({
      name: item.product_snapshot?.name ?? "DokKit product",
      quantity: item.quantity,
      totalCents: item.total_cents,
    })),
  });
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const searchParams = new URLSearchParams(rawBody);
  const data = paramsToData(searchParams);
  const paramString = buildParamString(searchParams);
  const orderNumber = data.m_payment_id;
  const pfPaymentId = data.pf_payment_id;
  let orderId: string | undefined;
  let paymentId: string | undefined;
  let signatureValid = false;
  let amountValid = false;
  const statusText = data.payment_status ?? "UNKNOWN";

  try {
    const supabase = createSupabaseServiceClient();
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(
        "id,order_number,total_cents,status,email,customer_id,download_access_token_ciphertext",
      )
      .eq("order_number", orderNumber)
      .single();

    if (orderError || !order) {
      await logItn({
        payload: data,
        signatureValid: false,
        amountValid: false,
        statusText: "ORDER_NOT_FOUND",
      });

      return NextResponse.json({ received: true }, { status: 200 });
    }

    orderId = order.id;

    const { data: payment } = await supabase
      .from("payments")
      .select("id,status,provider_payment_id")
      .eq("order_id", order.id)
      .eq("provider", "payfast")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    paymentId = payment?.id;
    signatureValid = validSignature(data, paramString);
    const ipValid = await validPayFastIp(request);
    amountValid = validPaymentAmount(order.total_cents, data.amount_gross);
    const serverConfirmed = await validServerConfirmation(paramString);
    const isComplete = data.payment_status === "COMPLETE";
    const checksPassed =
      signatureValid && ipValid && amountValid && serverConfirmed && isComplete;

    await logItn({
      payload: {
        ...data,
        _checks: JSON.stringify({
          signatureValid,
          ipValid,
          amountValid,
          serverConfirmed,
          isComplete,
        }),
      },
      orderId,
      paymentId,
      signatureValid,
      amountValid,
      statusText,
      processed: checksPassed,
    });

    if (!checksPassed) {
      if (paymentId && payment?.status !== "verified" && order.status !== "paid") {
        await supabase
          .from("payments")
          .update({
            status: "invalid",
            provider_payment_id: pfPaymentId ?? payment?.provider_payment_id,
            raw_payload: data,
            updated_at: new Date().toISOString(),
          })
          .eq("id", paymentId);
      }

      return NextResponse.json({ received: true }, { status: 200 });
    }

    const verifiedOrder = order as VerifiedOrderRow;

    if (order.status === "paid" || payment?.status === "verified") {
      await sendDownloadEmailForOrder({
        supabase,
        order: verifiedOrder,
      });

      return NextResponse.json({ received: true }, { status: 200 });
    }

    if (paymentId) {
      await supabase
        .from("payments")
        .update({
          status: "verified",
          provider_payment_id: pfPaymentId ?? payment?.provider_payment_id,
          raw_payload: data,
          verified_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", paymentId);
    }

    await supabase
      .from("orders")
      .update({
        status: "paid",
        paid_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", order.id);

    await sendDownloadEmailForOrder({
      supabase,
      order: {
        ...verifiedOrder,
        status: "paid",
      },
    });

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    await logItn({
      payload: data,
      orderId,
      paymentId,
      signatureValid,
      amountValid,
      statusText:
        error instanceof Error ? `ERROR: ${error.message}` : "ERROR: unknown",
    });

    return NextResponse.json({ received: false }, { status: 500 });
  }
}
