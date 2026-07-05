import { createHash, randomBytes } from "node:crypto";
import { getDownloadEnv } from "@/lib/env";
import { sendEmail } from "@/lib/email";

type SupabaseAdminClient = ReturnType<
  typeof import("@/lib/supabase-admin").createSupabaseAdminClient
>;

type CustomerRow = {
  id: string | null;
  email: string;
  full_name: string | null;
};

type OrderRow = {
  id: string;
  order_number: string;
  email: string;
  customer_id: string | null;
};

type OrderItemRow = {
  id: string;
  product_id: string | null;
  product_snapshot: {
    name?: string;
    slug?: string;
  };
};

type ProductFileRow = {
  id: string;
  storage_bucket: string;
  storage_path: string;
};

type DownloadLinkEmailItem = {
  productName: string;
  downloadUrl: string;
  expiresAt: string;
};

function tokenHash(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function createDownloadToken() {
  return randomBytes(32).toString("base64url");
}

function addHours(date: Date, hours: number) {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function buildDownloadEmail(
  order: OrderRow,
  customer: CustomerRow | null,
  links: DownloadLinkEmailItem[],
) {
  const greeting = customer?.full_name
    ? `Hi ${customer.full_name}`
    : "Hi there";
  const subject = `Your DokKit download links for ${order.order_number}`;
  const htmlLinks = links
    .map(
      (link) => `
        <li>
          <strong>${escapeHtml(link.productName)}</strong><br />
          <a href="${escapeHtml(link.downloadUrl)}">${escapeHtml(
            link.downloadUrl,
          )}</a><br />
          <small>Expires: ${escapeHtml(
            new Date(link.expiresAt).toLocaleString("en-ZA"),
          )}</small>
        </li>
      `,
    )
    .join("");
  const textLinks = links
    .map(
      (link) =>
        `${link.productName}\n${link.downloadUrl}\nExpires: ${new Date(
          link.expiresAt,
        ).toLocaleString("en-ZA")}`,
    )
    .join("\n\n");

  return {
    subject,
    html: `
      <div>
        <p>${escapeHtml(greeting)},</p>
        <p>Thank you for your DokKit order. Your secure download link${
          links.length === 1 ? " is" : "s are"
        } below.</p>
        <ul>${htmlLinks}</ul>
        <p>Order reference: <strong>${escapeHtml(order.order_number)}</strong></p>
        <p>If you did not make this purchase, please reply to this email.</p>
      </div>
    `,
    text: `${greeting},\n\nThank you for your DokKit order. Your secure download link${
      links.length === 1 ? " is" : "s are"
    } below.\n\n${textLinks}\n\nOrder reference: ${order.order_number}`,
  };
}

export async function createDownloadLinksForOrder(
  supabase: SupabaseAdminClient,
  orderId: string,
) {
  const env = getDownloadEnv();
  const expiresAt = addHours(new Date(), env.downloadLinkTtlHours).toISOString();
  const { data: orderItems, error: orderItemsError } = await supabase
    .from("order_items")
    .select("id, product_id, product_snapshot")
    .eq("order_id", orderId)
    .returns<OrderItemRow[]>();

  if (orderItemsError) {
    throw orderItemsError;
  }

  const links: DownloadLinkEmailItem[] = [];

  for (const item of orderItems ?? []) {
    if (!item.product_id) {
      throw new Error(`Order item ${item.id} has no product.`);
    }

    const { data: productFile, error: productFileError } = await supabase
      .from("product_files")
      .select("id, storage_bucket, storage_path")
      .eq("product_id", item.product_id)
      .eq("file_kind", "zip")
      .eq("is_active", true)
      .limit(1)
      .single<ProductFileRow>();

    if (productFileError || !productFile) {
      throw new Error(`No active ZIP file for order item ${item.id}.`);
    }

    const token = createDownloadToken();
    const { error: linkError } = await supabase.from("download_links").insert({
      order_id: orderId,
      order_item_id: item.id,
      product_file_id: productFile.id,
      token_hash: tokenHash(token),
      expires_at: expiresAt,
      max_uses: env.downloadLinkMaxUses,
    });

    if (linkError) {
      throw linkError;
    }

    links.push({
      productName: item.product_snapshot.name || "DokKit document pack",
      downloadUrl: `${env.siteUrl}/api/download/${token}`,
      expiresAt,
    });
  }

  return links;
}

export async function sendDownloadEmailForOrder(
  supabase: SupabaseAdminClient,
  order: OrderRow,
) {
  const { data: existingEmail } = await supabase
    .from("email_logs")
    .select("id")
    .eq("order_id", order.id)
    .eq("template_key", "order-download")
    .eq("status", "sent")
    .maybeSingle();

  if (existingEmail) {
    return { status: "skipped" as const };
  }

  const { data: customer } = order.customer_id
    ? await supabase
        .from("customers")
        .select("id, email, full_name")
        .eq("id", order.customer_id)
        .maybeSingle<CustomerRow>()
    : { data: null };
  const links = await createDownloadLinksForOrder(supabase, order.id);
  const email = buildDownloadEmail(order, customer, links);
  const { data: emailLog } = await supabase
    .from("email_logs")
    .insert({
      order_id: order.id,
      customer_id: order.customer_id,
      provider: "resend",
      template_key: "order-download",
      recipient: order.email,
      subject: email.subject,
      status: "queued",
    })
    .select("id")
    .single();

  if (!emailLog) {
    throw new Error("Could not create email log.");
  }

  try {
    const providerMessageId = await sendEmail({
      to: order.email,
      subject: email.subject,
      html: email.html,
      text: email.text,
    });

    await supabase
      .from("email_logs")
      .update({
        provider_message_id: providerMessageId,
        status: "sent",
        sent_at: new Date().toISOString(),
      })
      .eq("id", emailLog.id);

    return { status: "sent" as const };
  } catch (error) {
    await supabase
      .from("email_logs")
      .update({
        status: "failed",
        error_message:
          error instanceof Error ? error.message : "Could not send email.",
      })
      .eq("id", emailLog.id);

    return { status: "failed" as const };
  }
}
