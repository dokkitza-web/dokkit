import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export const runtime = "nodejs";

type DownloadRouteContext = {
  params: Promise<{ token: string }>;
};

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
  storage_bucket: string;
  storage_path: string;
};

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function getRequestIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  return (
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    null
  );
}

export async function GET(request: Request, context: DownloadRouteContext) {
  const { token } = await context.params;

  if (!token || token.length < 20) {
    return NextResponse.json({ error: "Download not found." }, { status: 404 });
  }

  const supabase = createSupabaseAdminClient();
  const { data: downloadLink } = await supabase
    .from("download_links")
    .select(
      "id, order_id, product_file_id, expires_at, max_uses, used_count, revoked_at",
    )
    .eq("token_hash", hashToken(token))
    .maybeSingle<DownloadLinkRow>();

  if (
    !downloadLink ||
    downloadLink.revoked_at ||
    new Date(downloadLink.expires_at).getTime() <= Date.now() ||
    downloadLink.used_count >= downloadLink.max_uses ||
    !downloadLink.product_file_id
  ) {
    return NextResponse.json({ error: "Download not found." }, { status: 404 });
  }

  const { data: productFile } = await supabase
    .from("product_files")
    .select("storage_bucket, storage_path")
    .eq("id", downloadLink.product_file_id)
    .single<ProductFileRow>();

  if (!productFile) {
    return NextResponse.json({ error: "Download not found." }, { status: 404 });
  }

  const { data: signedUrl, error: signedUrlError } = await supabase.storage
    .from(productFile.storage_bucket)
    .createSignedUrl(productFile.storage_path, 10 * 60);

  if (signedUrlError || !signedUrl?.signedUrl) {
    return NextResponse.json(
      { error: "Download could not be prepared." },
      { status: 500 },
    );
  }

  await supabase
    .from("download_links")
    .update({ used_count: downloadLink.used_count + 1 })
    .eq("id", downloadLink.id);
  await supabase.from("download_events").insert({
    download_link_id: downloadLink.id,
    order_id: downloadLink.order_id,
    ip_address: getRequestIp(request),
    user_agent: request.headers.get("user-agent"),
  });

  return NextResponse.redirect(signedUrl.signedUrl, 302);
}
