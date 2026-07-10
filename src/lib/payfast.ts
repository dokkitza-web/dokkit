import crypto from "node:crypto";
import { getSiteUrl } from "@/lib/site-url";

type PayFastFields = Record<string, string>;
type PayFastMode = "live" | "sandbox";

const LIVE_PAYFAST_PROCESS_URL = "https://www.payfast.co.za/eng/process";
const LIVE_PAYFAST_HOSTS = [
  "www.payfast.co.za",
  "w1w.payfast.co.za",
  "w2w.payfast.co.za",
];
const SANDBOX_PAYFAST_HOST = "sandbox.payfast.co.za";

export type PayFastPaymentPayload =
  | {
      mode: "payfast";
      processUrl: string;
      fields: PayFastFields;
    }
  | {
      mode: "configuration_required";
      message: string;
    };

export type PayFastRuntimeConfig =
  | {
      ok: true;
      mode: PayFastMode;
      processUrl: string;
      validationHost: string;
      ipHosts: string[];
    }
  | {
      ok: false;
      message: string;
    };

function isLiveSiteUrl() {
  try {
    const hostname = new URL(getSiteUrl()).hostname.toLowerCase();

    return hostname === "dokkit.co.za" || hostname === "www.dokkit.co.za";
  } catch {
    return false;
  }
}

function isProductionRuntime() {
  return process.env.VERCEL_ENV === "production" || isLiveSiteUrl();
}

function sandboxAllowed() {
  return process.env.PAYFAST_ALLOW_SANDBOX === "true" && !isProductionRuntime();
}

export function getPayFastRuntimeConfig(): PayFastRuntimeConfig {
  const configuredProcessUrl =
    process.env.PAYFAST_PROCESS_URL?.trim() || LIVE_PAYFAST_PROCESS_URL;

  let processUrl: URL;

  try {
    processUrl = new URL(configuredProcessUrl);
  } catch {
    return {
      ok: false,
      message:
        "PayFast process URL is invalid. Use the live PayFast process URL for production checkout.",
    };
  }

  const hostname = processUrl.hostname.toLowerCase();
  const isSandbox = hostname === SANDBOX_PAYFAST_HOST;
  const isLiveHost = LIVE_PAYFAST_HOSTS.includes(hostname);

  if (!isSandbox && !isLiveHost) {
    return {
      ok: false,
      message:
        "PayFast process URL must point to the live PayFast payment gateway.",
    };
  }

  if (isSandbox && !sandboxAllowed()) {
    return {
      ok: false,
      message:
        "Sandbox PayFast payments are disabled for this site. Use live PayFast credentials and the live PayFast process URL.",
    };
  }

  if (isProductionRuntime() && process.env.PAYFAST_SKIP_IP_CHECK === "true") {
    return {
      ok: false,
      message:
        "PayFast IP verification cannot be skipped on the live site.",
    };
  }

  return {
    ok: true,
    mode: isSandbox ? "sandbox" : "live",
    processUrl: processUrl.toString(),
    validationHost: isSandbox ? SANDBOX_PAYFAST_HOST : "www.payfast.co.za",
    ipHosts: isSandbox ? [SANDBOX_PAYFAST_HOST] : LIVE_PAYFAST_HOSTS,
  };
}

function encodePayFastValue(value: string) {
  return encodeURIComponent(value.trim()).replace(/%20/g, "+");
}

function createSignature(fields: PayFastFields, passphrase?: string) {
  const query = Object.entries(fields)
    .filter(([key, value]) => key !== "signature" && value !== "")
    .map(([key, value]) => `${key}=${encodePayFastValue(value)}`)
    .join("&");

  const signatureSource = passphrase
    ? `${query}&passphrase=${encodePayFastValue(passphrase)}`
    : query;

  return crypto.createHash("md5").update(signatureSource).digest("hex");
}

export function createPayFastPayment({
  orderNumber,
  orderAccessToken,
  email,
  amountCents,
  itemName,
}: {
  orderNumber: string;
  orderAccessToken: string;
  email: string;
  amountCents: number;
  itemName: string;
}): PayFastPaymentPayload {
  const merchantId = process.env.PAYFAST_MERCHANT_ID;
  const merchantKey = process.env.PAYFAST_MERCHANT_KEY;
  const runtimeConfig = getPayFastRuntimeConfig();
  const siteUrl = getSiteUrl();

  if (!runtimeConfig.ok) {
    return {
      mode: "configuration_required",
      message: runtimeConfig.message,
    };
  }

  if (!merchantId || !merchantKey) {
    return {
      mode: "configuration_required",
      message:
        "Order created, but PayFast credentials are not configured yet. Add PAYFAST_MERCHANT_ID and PAYFAST_MERCHANT_KEY.",
    };
  }

  const amount = (amountCents / 100).toFixed(2);
  const fields: PayFastFields = {
    merchant_id: merchantId,
    merchant_key: merchantKey,
    return_url: `${siteUrl}/checkout/success?order=${encodeURIComponent(orderNumber)}&access=${encodeURIComponent(orderAccessToken)}`,
    cancel_url: `${siteUrl}/checkout/cancelled?order=${encodeURIComponent(orderNumber)}&access=${encodeURIComponent(orderAccessToken)}`,
    notify_url: `${siteUrl}/api/payfast/itn`,
    email_address: email,
    m_payment_id: orderNumber,
    amount,
    item_name: itemName.slice(0, 100),
    item_description: `DokKit order ${orderNumber}`.slice(0, 255),
  };

  fields.signature = createSignature(fields, process.env.PAYFAST_PASSPHRASE);

  return {
    mode: "payfast",
    processUrl: runtimeConfig.processUrl,
    fields,
  };
}
