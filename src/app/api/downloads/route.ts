import { NextResponse } from "next/server";
import { z } from "zod";
import {
  DOWNLOAD_LINK_TTL_SECONDS,
  SUPABASE_SIGNED_URL_TTL_SECONDS,
  createDownloadFileName,
  createDownloadAccessToken,
  getOrderAccessTokenFromRequest,
  getClientIp,
  hashDownloadToken,
  verifyOrderAccessToken,
} from "@/lib/downloads";
import { hasVerifiedLivePayFastPayment } from "@/lib/payment-verification";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

const downloadRequestSchema = z.object({
  orderNumber: z.string().trim().min(1).max(40),
  productFileId: z.uuid(),
});

type OrderItemRow = {
  id: string;
  product_id: string | null;
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

export async function POST(request: Request) {
  const parsedBody = downloadRequestSchema.safeParse(await request.json());

  if (!parsedBody.success) {
    return NextResponse.json(
      { error: "Invalid download request." },
      { status: 400 },
    );
  }

  const { orderNumber, productFileId } = parsedBody.data;
  const supabase = createSupabaseServiceClient();
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select(
      "id,order_number,status,access_expires_at,download_limit,successful_downloads,download_access_token_hash",
    )
    .eq("order_number", orderNumber)
    .single();

  if (orderError || !order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  if (
    !verifyOrderAccessToken({
      suppliedToken: getOrderAccessTokenFromRequest(
        request,
        order.order_number,
      ),
      storedHash: order.download_access_token_hash,
    })
  ) {
    return NextResponse.json(
      { error: "This download link is not valid for the order." },
      { status: 403 },
    );
  }

  if (order.status !== "paid") {
    return NextResponse.json(
      { error: "Downloads unlock after PayFast verifies payment." },
      { status: 409 },
    );
  }

  if (
    !order.access_expires_at ||
    new Date(order.access_expires_at).getTime() <= Date.now()
  ) {
    return NextResponse.json(
      {
        error:
          "Secure access has expired. Contact support with the order number and payment email.",
      },
      { status: 410 },
    );
  }

  if (order.successful_downloads >= order.download_limit) {
    return NextResponse.json(
      {
        error:
          "This order has reached its five successful download attempts. Contact support if you need reasonable assistance.",
      },
      { status: 429 },
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
    .eq("id", productFileId)
    .eq("is_active", true)
    .single();

  if (productFileError || !productFile) {
    return NextResponse.json(
      { error: "Download file not found." },
      { status: 404 },
    );
  }

  const { data: orderItems, error: orderItemsError } = await supabase
    .from("order_items")
    .select("id,product_id")
    .eq("order_id", order.id);

  if (orderItemsError) {
    return NextResponse.json(
      { error: orderItemsError.message },
      { status: 500 },
    );
  }

  const matchingOrderItem = (orderItems as OrderItemRow[] | null)?.find(
    (item) => item.product_id === (productFile as ProductFileRow).product_id,
  );

  if (!matchingOrderItem) {
    return NextResponse.json(
      { error: "This file is not part of the paid order." },
      { status: 403 },
    );
  }

  const file = productFile as ProductFileRow;
  const { data: product } = await supabase
    .from("products")
    .select("slug")
    .eq("id", file.product_id)
    .maybeSingle();

  if (!product?.slug) {
    return NextResponse.json(
      { error: "The requested Product is not available." },
      { status: 404 },
    );
  }

  const downloadToken = createDownloadAccessToken();
  const expiresAt = new Date(
    Date.now() + DOWNLOAD_LINK_TTL_SECONDS * 1000,
  ).toISOString();
  const { data: downloadLink, error: linkError } = await supabase
    .from("download_links")
    .insert({
      order_id: order.id,
      order_item_id: matchingOrderItem.id,
      product_file_id: productFileId,
      token_hash: hashDownloadToken(downloadToken),
      expires_at: expiresAt,
      max_uses: 1,
      used_count: 0,
    })
    .select("id")
    .single();

  if (linkError || !downloadLink) {
    return NextResponse.json(
      { error: linkError?.message ?? "Could not authorise this download." },
      { status: 500 },
    );
  }

  const downloadFileName = createDownloadFileName({
    productSlug: product.slug,
    fileKind: file.file_kind,
    versionLabel: file.version_label,
  });
  const { data: signedUrl, error: signedUrlError } = await supabase.storage
    .from(file.storage_bucket)
    .createSignedUrl(file.storage_path, SUPABASE_SIGNED_URL_TTL_SECONDS, {
      download: downloadFileName,
    });

  if (signedUrlError || !signedUrl?.signedUrl) {
    return NextResponse.json(
      { error: "Could not prepare the requested file." },
      { status: 500 },
    );
  }

  const { data: claimRows, error: claimError } = await supabase.rpc(
    "claim_authorised_download",
    {
      p_order_id: order.id,
      p_download_link_id: downloadLink.id,
      p_ip_address: getClientIp(request),
      p_user_agent: request.headers.get("user-agent")?.slice(0, 1000) ?? "",
    },
  );
  const claim = Array.isArray(claimRows) ? claimRows[0] : claimRows;

  if (claimError || !claim?.claimed) {
    const status =
      claim?.error_code === "access_expired"
        ? 410
        : claim?.error_code === "download_limit_reached"
          ? 429
          : 403;

    return NextResponse.json(
      {
        error:
          status === 410
            ? "Secure access has expired. Contact support with the order number and payment email."
            : status === 429
              ? "This order has reached its five successful download attempts."
              : "This download is not available.",
      },
      { status },
    );
  }

  return NextResponse.json({
    downloadUrl: signedUrl.signedUrl,
    expiresAt,
    remainingDownloads: claim.remaining_downloads,
  });
}
