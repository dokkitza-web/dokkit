import crypto from "node:crypto";
import dns from "node:dns/promises";
import type { SupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createOrderAccessToken } from "@/lib/downloads";
import {
  sendAdminPaidOrderNotificationEmail,
  sendDownloadReadyEmail,
} from "@/lib/emails";
import { sendMetaConversionEvent } from "@/lib/meta-conversions";
import { getPayFastRuntimeConfig } from "@/lib/payfast";
import { getSiteUrl } from "@/lib/site-url";
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
};

type OrderEmailItemRow = {
  quantity: number;
  total_cents: number;
  product_snapshot: {
    name?: string;
    slug?: string;
  };
};

type StoredMetaAttribution = {
  fbp?: string;
  fbc?: string;
  client_ip_address?: string;
  client_user_agent?: string;
};

function encodePayFastValue(value: string) {
  return encodeURIComponent(value.trim()).replace(/%20/g, "+");
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

async function validPayFastIp(request: Request, validHosts: string[]) {
  if (process.env.PAYFAST_SKIP_IP_CHECK === "true") {
    return true;
  }

  const requestIps = parseForwardedIps(request);

  if (!requestIps.length) {
    return false;
  }

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

async function validServerConfirmation(paramString: string, host: string) {
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
  const accessToken = createOrderAccessToken(order.order_number);

  const { data: orderItems } = await supabase
    .from("order_items")
    .select("quantity,total_cents,product_snapshot")
    .eq("order_id", order.id);
  const emailItems = ((orderItems ?? []) as OrderEmailItemRow[]).map((item) => ({
    name: item.product_snapshot?.name ?? "DokKit product",
    quantity: item.quantity,
    totalCents: item.total_cents,
  }));

  await sendDownloadReadyEmail({
    supabase,
    orderId: order.id,
    customerId: order.customer_id,
    orderNumber: order.order_number,
    to: order.email,
    totalCents: order.total_cents,
    accessToken,
    items: emailItems,
  });

  await sendAdminPaidOrderNotificationEmail({
    supabase,
    orderId: order.id,
    customerId: order.customer_id,
    orderNumber: order.order_number,
    customerEmail: order.email,
    totalCents: order.total_cents,
    items: emailItems,
  });
}

function getStoredMetaAttribution(rawPayload: unknown) {
  if (!rawPayload || typeof rawPayload !== "object") {
    return undefined;
  }

  const attribution = (rawPayload as Record<string, unknown>)[
    "_meta_attribution"
  ];

  if (!attribution || typeof attribution !== "object") {
    return undefined;
  }

  const candidate = attribution as StoredMetaAttribution;

  return {
    fbp: typeof candidate.fbp === "string" ? candidate.fbp : undefined,
    fbc: typeof candidate.fbc === "string" ? candidate.fbc : undefined,
    client_ip_address:
      typeof candidate.client_ip_address === "string"
        ? candidate.client_ip_address
        : undefined,
    client_user_agent:
      typeof candidate.client_user_agent === "string"
        ? candidate.client_user_agent
        : undefined,
  };
}

async function sendMetaPurchaseForOrder({
  supabase,
  order,
  attribution,
}: {
  supabase: SupabaseClient;
  order: VerifiedOrderRow;
  attribution?: StoredMetaAttribution;
}) {
  if (!attribution) {
    return;
  }

  try {
    const { data: orderItems, error: orderItemsError } = await supabase
      .from("order_items")
      .select("quantity,total_cents,product_snapshot")
      .eq("order_id", order.id);

    if (orderItemsError) {
      throw new Error(orderItemsError.message);
    }

    const items = (orderItems ?? []) as OrderEmailItemRow[];

    await sendMetaConversionEvent({
      eventName: "Purchase",
      eventId: `purchase_${order.order_number}`,
      eventSourceUrl: `${getSiteUrl()}/checkout/success`,
      userData: {
        clientIpAddress: attribution.client_ip_address,
        clientUserAgent: attribution.client_user_agent,
        fbp: attribution.fbp,
        fbc: attribution.fbc,
      },
      customData: {
        currency: "ZAR",
        value: order.total_cents / 100,
        contentIds: items.map(
          (item) => item.product_snapshot?.slug ?? "dokkit-product",
        ),
        contentName:
          items.length === 1
            ? items[0].product_snapshot?.name ?? "DokKit product"
            : "DokKit order",
        contentType: "product",
        contents: items.map((item) => ({
          id: item.product_snapshot?.slug ?? "dokkit-product",
          quantity: item.quantity,
          itemPrice: item.total_cents / item.quantity / 100,
        })),
      },
    });
  } catch (error) {
    console.warn(
      "Meta Purchase event was not sent.",
      error instanceof Error ? error.message : error,
    );
  }
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
  const payFastConfig = getPayFastRuntimeConfig();

  if (!payFastConfig.ok) {
    await logItn({
      payload: {
        ...data,
        _payfast_configuration_error: payFastConfig.message,
      },
      signatureValid: false,
      amountValid: false,
      statusText: "PAYFAST_CONFIGURATION_ERROR",
      processed: false,
    });

    return NextResponse.json({ received: true }, { status: 200 });
  }

  try {
    const supabase = createSupabaseServiceClient();
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id,order_number,total_cents,status,email,customer_id")
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
      .select("id,status,provider_payment_id,raw_payload")
      .eq("order_id", order.id)
      .eq("provider", "payfast")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    paymentId = payment?.id;
    const metaAttribution = getStoredMetaAttribution(payment?.raw_payload);
    signatureValid = validSignature(data, paramString);
    const ipValid = await validPayFastIp(request, payFastConfig.ipHosts);
    amountValid = validPaymentAmount(order.total_cents, data.amount_gross);
    const serverConfirmed = await validServerConfirmation(
      paramString,
      payFastConfig.validationHost,
    );
    const isComplete = data.payment_status === "COMPLETE";
    const checksPassed =
      signatureValid && ipValid && amountValid && serverConfirmed && isComplete;

    await logItn({
      payload: {
        ...data,
        _payfast_environment: payFastConfig.mode,
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
            raw_payload: {
              ...data,
              _payfast_environment: payFastConfig.mode,
              _meta_attribution: metaAttribution,
            },
            updated_at: new Date().toISOString(),
          })
          .eq("id", paymentId);
      }

      return NextResponse.json({ received: true }, { status: 200 });
    }

    const verifiedOrder = order as VerifiedOrderRow;

    if (order.status === "paid" || payment?.status === "verified") {
      await sendMetaPurchaseForOrder({
        supabase,
        order: verifiedOrder,
        attribution: metaAttribution,
      });

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
          raw_payload: {
            ...data,
            _payfast_environment: payFastConfig.mode,
            _meta_attribution: metaAttribution,
          },
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

    await sendMetaPurchaseForOrder({
      supabase,
      order: {
        ...verifiedOrder,
        status: "paid",
      },
      attribution: metaAttribution,
    });

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
