import { NextResponse } from "next/server";
import {
  SUPABASE_SIGNED_URL_TTL_SECONDS,
  createDownloadFileName,
  getClientIp,
  hashDownloadToken,
} from "@/lib/downloads";
import { hasVerifiedLivePayFastPayment } from "@/lib/payment-verification";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

type DownloadLinkRow = {
  id: string;
  order_id: string;
  product_file_id: string | null;
  expires_at: string;
  max_uses: number;
  used_count: number;
  revoked_at: string | null;
};

type ProductFileRow = {
  id: string;
  product_id: string;
  file_kind: string;
  version_label: string;
  storage_bucket: string;
  storage_path: string;
  is_active: boolean;
};

function isExpired(expiresAt: string) {
  return new Date(expiresAt).getTime() <= Date.now();
}

function getFileNameFromPath(path: string) {
  return path.split("/").filter(Boolean).at(-1) ?? "dokkit-download";
}

async function logDownloadEvent({
  request,
  downloadLinkId,
  orderId,
}: {
  request: Request;
  downloadLinkId: string;
  orderId: string;
}) {
  const supabase = createSupabaseServiceClient();

  await supabase.from("download_events").insert({
    download_link_id: downloadLinkId,
    order_id: orderId,
    ip_address: getClientIp(request),
    user_agent: request.headers.get("user-agent"),
  });
}

export async function GET(
  request: Request,
  context: { params: Promise<{ token: string }> },
) {
  const { token } = await context.params;

  if (!token || token.length < 20 || token.length > 200) {
    return NextResponse.json({ error: "Invalid download link." }, { status: 400 });
  }

  const supabase = createSupabaseServiceClient();
  const { data: link, error: linkError } = await supabase
    .from("download_links")
    .select(
      "id,order_id,product_file_id,expires_at,max_uses,used_count,revoked_at",
    )
    .eq("token_hash", hashDownloadToken(token))
    .single();

  if (linkError || !link) {
    return NextResponse.json({ error: "Download link not found." }, { status: 404 });
  }

  const downloadLink = link as DownloadLinkRow;

  if (downloadLink.revoked_at || isExpired(downloadLink.expires_at)) {
    return NextResponse.json(
      { error: "This download link has expired. Request a fresh link." },
      { status: 410 },
    );
  }

  if (downloadLink.used_count >= downloadLink.max_uses) {
    return NextResponse.json(
      { error: "This download link has already been used." },
      { status: 429 },
    );
  }

  if (!downloadLink.product_file_id) {
    return NextResponse.json(
      { error: "This download is no longer attached to a file." },
      { status: 404 },
    );
  }

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id,status")
    .eq("id", downloadLink.order_id)
    .single();

  if (orderError || !order || order.status !== "paid") {
    return NextResponse.json(
      { error: "Downloads are available only for paid orders." },
      { status: 403 },
    );
  }

  const hasLivePayment = await hasVerifiedLivePayFastPayment({
    supabase,
    orderId: order.id,
  });

  if (!hasLivePayment) {
    return NextResponse.json(
      { error: "Downloads require a verified live PayFast payment." },
      { status: 403 },
    );
  }

  const { data: productFile, error: productFileError } = await supabase
    .from("product_files")
    .select(
      "id,product_id,file_kind,version_label,storage_bucket,storage_path,is_active",
    )
    .eq("id", downloadLink.product_file_id)
    .eq("is_active", true)
    .single();

  if (productFileError || !productFile) {
    return NextResponse.json(
      { error: "The requested file is not available." },
      { status: 404 },
    );
  }

  const file = productFile as ProductFileRow;
  const { data: product } = await supabase
    .from("products")
    .select("slug")
    .eq("id", file.product_id)
    .maybeSingle();
  const downloadFileName = product?.slug
    ? createDownloadFileName({
        productSlug: product.slug,
        fileKind: file.file_kind,
        versionLabel: file.version_label,
      })
    : getFileNameFromPath(file.storage_path);

  const { data: signedUrl, error: signedUrlError } = await supabase.storage
    .from(file.storage_bucket)
    .createSignedUrl(file.storage_path, SUPABASE_SIGNED_URL_TTL_SECONDS, {
      download: downloadFileName,
    });

  if (signedUrlError || !signedUrl?.signedUrl) {
    return NextResponse.json(
      { error: signedUrlError?.message ?? "Could not create signed URL." },
      { status: 500 },
    );
  }

  const { error: updateError } = await supabase
    .from("download_links")
    .update({
      used_count: downloadLink.used_count + 1,
    })
    .eq("id", downloadLink.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  await logDownloadEvent({
    request,
    downloadLinkId: downloadLink.id,
    orderId: downloadLink.order_id,
  });

  return NextResponse.redirect(signedUrl.signedUrl);
}
