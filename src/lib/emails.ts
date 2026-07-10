import type { SupabaseClient } from "@supabase/supabase-js";
import {
  VAT_INCLUDED_SUMMARY_LABEL,
  formatPrice,
  getVatPortionCents,
} from "@/data/catalogue";
import { getSiteUrl } from "@/lib/site-url";

type EmailOrderItem = {
  name: string;
  quantity: number;
  totalCents: number;
};

type SendEmailInput = {
  supabase: SupabaseClient;
  orderId: string;
  customerId?: string | null;
  to: string;
  templateKey: string;
  subject: string;
  html: string;
  text: string;
};

type ResendResponse = {
  id?: string;
  message?: string;
  name?: string;
  error?: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderItemsHtml(items: EmailOrderItem[]) {
  return items
    .map(
      (item) => `
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #e5ece8;">
            <strong>${escapeHtml(item.name)}</strong><br />
            <span style="color:#5f5f66;">Quantity: ${item.quantity}</span>
          </td>
          <td style="padding:12px 0;border-bottom:1px solid #e5ece8;text-align:right;">
            ${formatPrice(item.totalCents)}
          </td>
        </tr>
      `,
    )
    .join("");
}

function renderItemsText(items: EmailOrderItem[]) {
  return items
    .map(
      (item) =>
        `- ${item.name} x ${item.quantity}: ${formatPrice(item.totalCents)}`,
    )
    .join("\n");
}

function renderEmailLayout({
  title,
  intro,
  actionLabel,
  actionUrl,
  children,
}: {
  title: string;
  intro: string;
  actionLabel: string;
  actionUrl: string;
  children: string;
}) {
  return `
    <!doctype html>
    <html>
      <body style="margin:0;background:#f6f4f1;color:#111111;font-family:Arial,sans-serif;">
        <div style="margin:0 auto;max-width:640px;padding:32px 20px;">
          <div style="background:#ffffff;border:1px solid #ece7df;border-radius:10px;padding:28px;">
            <p style="margin:0 0 12px;color:#ff6a00;font-size:12px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;">
              DokKit
            </p>
            <h1 style="margin:0 0 16px;font-size:28px;line-height:1.2;">
              ${escapeHtml(title)}
            </h1>
            <p style="margin:0 0 24px;color:#5f5f66;font-size:15px;line-height:1.7;">
              ${escapeHtml(intro)}
            </p>
            ${children}
            <p style="margin:28px 0 0;">
              <a href="${escapeHtml(actionUrl)}" style="display:inline-block;background:#ff6a00;color:#ffffff;text-decoration:none;font-weight:700;border-radius:6px;padding:13px 18px;">
                ${escapeHtml(actionLabel)}
              </a>
            </p>
            <p style="margin:28px 0 0;color:#5f5f66;font-size:12px;line-height:1.6;">
              If the button does not open, copy and paste this link into your browser:<br />
              <a href="${escapeHtml(actionUrl)}" style="color:#ff6a00;">${escapeHtml(actionUrl)}</a>
            </p>
          </div>
          <p style="margin:18px 0 0;color:#6b7772;font-size:12px;line-height:1.6;text-align:center;">
            DokKit sends this email because an order was placed on the DokKit website.
          </p>
        </div>
      </body>
    </html>
  `;
}

async function wasEmailAlreadySent({
  supabase,
  orderId,
  templateKey,
}: {
  supabase: SupabaseClient;
  orderId: string;
  templateKey: string;
}) {
  const { data } = await supabase
    .from("email_logs")
    .select("id")
    .eq("order_id", orderId)
    .eq("template_key", templateKey)
    .eq("status", "sent")
    .limit(1)
    .maybeSingle();

  return Boolean(data);
}

export async function sendTransactionalEmail({
  supabase,
  orderId,
  customerId,
  to,
  templateKey,
  subject,
  html,
  text,
}: SendEmailInput) {
  if (await wasEmailAlreadySent({ supabase, orderId, templateKey })) {
    return { sent: true, skipped: true };
  }

  const { data: log } = await supabase
    .from("email_logs")
    .insert({
      order_id: orderId,
      customer_id: customerId ?? null,
      provider: "resend",
      template_key: templateKey,
      recipient: to,
      subject,
      status: "queued",
    })
    .select("id")
    .single();

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !from) {
    if (log?.id) {
      await supabase
        .from("email_logs")
        .update({
          status: "failed",
          error_message: "Missing RESEND_API_KEY or RESEND_FROM_EMAIL.",
        })
        .eq("id", log.id);
    }

    return { sent: false, skipped: false };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        html,
        text,
        reply_to: process.env.RESEND_REPLY_TO || undefined,
      }),
    });
    const payload = (await response.json().catch(() => ({}))) as ResendResponse;

    if (!response.ok || !payload.id) {
      const message =
        payload.message ??
        payload.error ??
        payload.name ??
        `Resend returned HTTP ${response.status}.`;

      if (log?.id) {
        await supabase
          .from("email_logs")
          .update({
            status: "failed",
            error_message: message,
          })
          .eq("id", log.id);
      }

      return { sent: false, skipped: false };
    }

    if (log?.id) {
      await supabase
        .from("email_logs")
        .update({
          status: "sent",
          provider_message_id: payload.id,
          sent_at: new Date().toISOString(),
        })
        .eq("id", log.id);
    }

    return { sent: true, skipped: false };
  } catch (error) {
    if (log?.id) {
      await supabase
        .from("email_logs")
        .update({
          status: "failed",
          error_message:
            error instanceof Error ? error.message : "Unknown email error.",
        })
        .eq("id", log.id);
    }

    return { sent: false, skipped: false };
  }
}

export async function sendOrderConfirmationEmail({
  supabase,
  orderId,
  customerId,
  orderNumber,
  to,
  totalCents,
  items,
  accessToken,
}: {
  supabase: SupabaseClient;
  orderId: string;
  customerId?: string | null;
  orderNumber: string;
  to: string;
  totalCents: number;
  items: EmailOrderItem[];
  accessToken: string;
}) {
  const orderUrl = `${getSiteUrl()}/checkout/success?order=${encodeURIComponent(orderNumber)}&access=${encodeURIComponent(accessToken)}`;
  const subject = `DokKit order ${orderNumber} received`;
  const vatPortionCents = getVatPortionCents(totalCents);
  const html = renderEmailLayout({
    title: "Order received",
    intro:
      "Thank you for your DokKit order. We have created your order and are waiting for PayFast to confirm payment.",
    actionLabel: "View order status",
    actionUrl: orderUrl,
    children: `
      <p style="margin:0 0 12px;font-size:15px;"><strong>Order:</strong> ${escapeHtml(orderNumber)}</p>
      <table style="width:100%;border-collapse:collapse;margin-top:12px;font-size:14px;">
        ${renderItemsHtml(items)}
        <tr>
          <td style="padding:14px 0 0;font-weight:700;">Total</td>
          <td style="padding:14px 0 0;text-align:right;font-weight:700;">${formatPrice(totalCents)}</td>
        </tr>
        <tr>
          <td style="padding:6px 0 0;color:#5f5f66;font-size:12px;">${VAT_INCLUDED_SUMMARY_LABEL}</td>
          <td style="padding:6px 0 0;color:#5f5f66;font-size:12px;text-align:right;">${formatPrice(vatPortionCents)}</td>
        </tr>
      </table>
    `,
  });
  const text = [
    "DokKit order received",
    "",
    `Order: ${orderNumber}`,
    `Total: ${formatPrice(totalCents)}`,
    `${VAT_INCLUDED_SUMMARY_LABEL}: ${formatPrice(vatPortionCents)}`,
    "",
    renderItemsText(items),
    "",
    "View order status:",
    orderUrl,
  ].join("\n");

  return sendTransactionalEmail({
    supabase,
    orderId,
    customerId,
    to,
    templateKey: "order_confirmation",
    subject,
    html,
    text,
  });
}

export async function sendDownloadReadyEmail({
  supabase,
  orderId,
  customerId,
  orderNumber,
  to,
  totalCents,
  items,
  accessToken,
}: {
  supabase: SupabaseClient;
  orderId: string;
  customerId?: string | null;
  orderNumber: string;
  to: string;
  totalCents: number;
  items: EmailOrderItem[];
  accessToken: string;
}) {
  const downloadUrl = `${getSiteUrl()}/checkout/success?order=${encodeURIComponent(orderNumber)}&access=${encodeURIComponent(accessToken)}`;
  const subject = `Your DokKit downloads are ready`;
  const vatPortionCents = getVatPortionCents(totalCents);
  const html = renderEmailLayout({
    title: "Your downloads are ready",
    intro:
      "PayFast has confirmed your payment. Open your secure DokKit order page to download the files attached to your purchase.",
    actionLabel: "Open secure downloads",
    actionUrl: downloadUrl,
    children: `
      <p style="margin:0 0 12px;font-size:15px;"><strong>Order:</strong> ${escapeHtml(orderNumber)}</p>
      <table style="width:100%;border-collapse:collapse;margin-top:12px;font-size:14px;">
        ${renderItemsHtml(items)}
        <tr>
          <td style="padding:14px 0 0;font-weight:700;">Paid total</td>
          <td style="padding:14px 0 0;text-align:right;font-weight:700;">${formatPrice(totalCents)}</td>
        </tr>
        <tr>
          <td style="padding:6px 0 0;color:#5f5f66;font-size:12px;">${VAT_INCLUDED_SUMMARY_LABEL}</td>
          <td style="padding:6px 0 0;color:#5f5f66;font-size:12px;text-align:right;">${formatPrice(vatPortionCents)}</td>
        </tr>
      </table>
    `,
  });
  const text = [
    "Your DokKit downloads are ready",
    "",
    `Order: ${orderNumber}`,
    `Paid total: ${formatPrice(totalCents)}`,
    `${VAT_INCLUDED_SUMMARY_LABEL}: ${formatPrice(vatPortionCents)}`,
    "",
    renderItemsText(items),
    "",
    "Open secure downloads:",
    downloadUrl,
  ].join("\n");

  return sendTransactionalEmail({
    supabase,
    orderId,
    customerId,
    to,
    templateKey: "download_ready",
    subject,
    html,
    text,
  });
}

export async function sendAdminPaidOrderNotificationEmail({
  supabase,
  orderId,
  customerId,
  orderNumber,
  customerEmail,
  totalCents,
  items,
}: {
  supabase: SupabaseClient;
  orderId: string;
  customerId?: string | null;
  orderNumber: string;
  customerEmail: string;
  totalCents: number;
  items: EmailOrderItem[];
}) {
  const adminEmail =
    process.env.ORDER_NOTIFICATION_EMAIL ||
    process.env.RESEND_REPLY_TO ||
    "support@dokkit.co.za";
  const adminUrl = `${getSiteUrl()}/admin/orders`;
  const subject = `New paid DokKit order: ${orderNumber}`;
  const vatPortionCents = getVatPortionCents(totalCents);
  const html = renderEmailLayout({
    title: "New paid order",
    intro:
      "PayFast has confirmed a DokKit payment. The customer download email has been queued from the website.",
    actionLabel: "Open admin orders",
    actionUrl: adminUrl,
    children: `
      <p style="margin:0 0 12px;font-size:15px;"><strong>Order:</strong> ${escapeHtml(orderNumber)}</p>
      <p style="margin:0 0 12px;font-size:15px;"><strong>Customer email:</strong> ${escapeHtml(customerEmail)}</p>
      <table style="width:100%;border-collapse:collapse;margin-top:12px;font-size:14px;">
        ${renderItemsHtml(items)}
        <tr>
          <td style="padding:14px 0 0;font-weight:700;">Paid total</td>
          <td style="padding:14px 0 0;text-align:right;font-weight:700;">${formatPrice(totalCents)}</td>
        </tr>
        <tr>
          <td style="padding:6px 0 0;color:#5f5f66;font-size:12px;">${VAT_INCLUDED_SUMMARY_LABEL}</td>
          <td style="padding:6px 0 0;color:#5f5f66;font-size:12px;text-align:right;">${formatPrice(vatPortionCents)}</td>
        </tr>
      </table>
    `,
  });
  const text = [
    "New paid DokKit order",
    "",
    `Order: ${orderNumber}`,
    `Customer email: ${customerEmail}`,
    `Paid total: ${formatPrice(totalCents)}`,
    `${VAT_INCLUDED_SUMMARY_LABEL}: ${formatPrice(vatPortionCents)}`,
    "",
    renderItemsText(items),
    "",
    "Open admin orders:",
    adminUrl,
  ].join("\n");

  return sendTransactionalEmail({
    supabase,
    orderId,
    customerId,
    to: adminEmail,
    templateKey: "admin_paid_order_notification",
    subject,
    html,
    text,
  });
}
