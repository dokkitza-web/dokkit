import crypto from "node:crypto";

type PayFastFields = Record<string, string>;

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
  email,
  amountCents,
  itemName,
}: {
  orderNumber: string;
  email: string;
  amountCents: number;
  itemName: string;
}): PayFastPaymentPayload {
  const merchantId = process.env.PAYFAST_MERCHANT_ID;
  const merchantKey = process.env.PAYFAST_MERCHANT_KEY;
  const processUrl =
    process.env.PAYFAST_PROCESS_URL || "https://sandbox.payfast.co.za/eng/process";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

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
    return_url: `${siteUrl}/checkout/success?order=${encodeURIComponent(orderNumber)}`,
    cancel_url: `${siteUrl}/checkout/cancelled?order=${encodeURIComponent(orderNumber)}`,
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
    processUrl,
    fields,
  };
}
