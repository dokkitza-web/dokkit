import { createHash, timingSafeEqual } from "node:crypto";
import { getServerEnv } from "@/lib/env";

export type PayfastCheckoutFields = Record<string, string>;

type BuildPayfastCheckoutInput = {
  orderNumber: string;
  productSlug: string;
  productName: string;
  productDescription: string;
  amountCents: number;
  customerName: string;
  customerEmail: string;
};

function encodePayfastValue(value: string) {
  return encodeURIComponent(value.trim()).replace(/%20/g, "+");
}

export function createPayfastSignature(
  fields: PayfastCheckoutFields,
  passphrase: string,
) {
  const pairs = Object.entries(fields)
    .filter(([, value]) => value !== "")
    .map(([key, value]) => `${key}=${encodePayfastValue(value)}`);

  if (passphrase) {
    pairs.push(`passphrase=${encodePayfastValue(passphrase)}`);
  }

  return createHash("md5").update(pairs.join("&")).digest("hex");
}

export function verifyPayfastSignature(
  fields: PayfastCheckoutFields,
  passphrase: string,
) {
  const { signature, ...unsignedFields } = fields;

  if (!signature) {
    return false;
  }

  const expectedSignature = createPayfastSignature(unsignedFields, passphrase);
  const submitted = Buffer.from(signature, "utf8");
  const expected = Buffer.from(expectedSignature, "utf8");

  return (
    submitted.length === expected.length && timingSafeEqual(submitted, expected)
  );
}

export function payfastAmountToCents(amount: string | undefined) {
  if (!amount) {
    return null;
  }

  const parsed = Number.parseFloat(amount);

  if (Number.isNaN(parsed)) {
    return null;
  }

  return Math.round(parsed * 100);
}

export async function validatePayfastData(
  fields: PayfastCheckoutFields,
  validateUrl: string,
) {
  const body = new URLSearchParams();

  for (const [key, value] of Object.entries(fields)) {
    body.append(key, value);
  }

  const response = await fetch(validateUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
  const text = (await response.text()).trim();

  return response.ok && text === "VALID";
}

function normalizeIpv4(ip: string) {
  return ip.trim().replace(/^::ffff:/, "");
}

function ipv4ToNumber(ip: string) {
  const parts = normalizeIpv4(ip).split(".");

  if (parts.length !== 4) {
    return null;
  }

  const numbers = parts.map((part) => Number.parseInt(part, 10));

  if (numbers.some((part) => Number.isNaN(part) || part < 0 || part > 255)) {
    return null;
  }

  return (
    ((numbers[0] * 256 + numbers[1]) * 256 + numbers[2]) * 256 +
    numbers[3]
  );
}

function cidrContains(ip: string, range: string) {
  const [baseIp, prefixValue] = range.split("/");
  const ipNumber = ipv4ToNumber(ip);
  const baseNumber = ipv4ToNumber(baseIp);

  if (ipNumber === null || baseNumber === null) {
    return false;
  }

  if (!prefixValue) {
    return ipNumber === baseNumber;
  }

  const prefix = Number.parseInt(prefixValue, 10);

  if (Number.isNaN(prefix) || prefix < 0 || prefix > 32) {
    return false;
  }

  const blockSize = 2 ** (32 - prefix);

  return (
    Math.floor(ipNumber / blockSize) === Math.floor(baseNumber / blockSize)
  );
}

export function isAllowedPayfastIp(ip: string | null, allowedIps: string) {
  if (!ip) {
    return false;
  }

  return allowedIps
    .split(",")
    .map((range) => range.trim())
    .filter(Boolean)
    .some((range) => cidrContains(ip, range));
}

export function getRequestIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return normalizeIpv4(forwardedFor.split(",")[0]);
  }

  return normalizeIpv4(
    request.headers.get("x-real-ip") ||
      request.headers.get("cf-connecting-ip") ||
      "",
  );
}

function splitCustomerName(customerName: string) {
  const parts = customerName.trim().split(/\s+/);

  return {
    firstName: parts[0] ?? "DokKit",
    lastName: parts.slice(1).join(" "),
  };
}

export function buildPayfastCheckout(input: BuildPayfastCheckoutInput) {
  const env = getServerEnv();
  const { firstName, lastName } = splitCustomerName(input.customerName);

  const fields: PayfastCheckoutFields = {
    merchant_id: env.payfastMerchantId,
    merchant_key: env.payfastMerchantKey,
    return_url: `${env.siteUrl}/checkout/success?order=${encodeURIComponent(
      input.orderNumber,
    )}`,
    cancel_url: `${env.siteUrl}/checkout/cancel?order=${encodeURIComponent(
      input.orderNumber,
    )}`,
    notify_url: `${env.siteUrl}/api/payfast/itn`,
    name_first: firstName,
    name_last: lastName,
    email_address: input.customerEmail,
    m_payment_id: input.orderNumber,
    amount: (input.amountCents / 100).toFixed(2),
    item_name: input.productName.slice(0, 100),
    item_description: input.productDescription.slice(0, 255),
    custom_str1: input.productSlug,
  };

  return {
    paymentUrl: env.payfastProcessUrl,
    fields: {
      ...fields,
      signature: createPayfastSignature(fields, env.payfastPassphrase),
    },
  };
}
