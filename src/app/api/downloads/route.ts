import { NextResponse } from "next/server";
import { z } from "zod";
import {
  DOWNLOAD_LINK_TTL_SECONDS,
  createDownloadAccessToken,
  hashDownloadToken,
  verifyOrderAccessToken,
} from "@/lib/downloads";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

const downloadRequestSchema = z.object({
  orderNumber: z.string().trim().min(1).max(40),
  accessToken: z.string().trim().min(20).max(200),
  productFileId: z.uuid(),
});

type OrderItemRow = {
  id: string;
  product_id: string | null;
};

type ProductFileRow = {
  id: string;
  product_id: string;
  is_active: boolean;
};

function createDownloadUrl(request: Request, token: string) {
  const url = new URL(request.url);

  return `${url.origin}/api/downloads/${encodeURIComponent(token)}`;
}

export async function POST(request: Request) {
  const parsedBody = downloadRequestSchema.safeParse(await request.json());

  if (!parsedBody.success) {
    return NextResponse.json(
      { error: "Invalid download request." },
      { status: 400 },
    );
  }

  const { orderNumber, accessToken, productFileId } = parsedBody.data;
  const supabase = createSupabaseServiceClient();
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id,order_number,status")
    .eq("order_number", orderNumber)
    .single();

  if (orderError || !order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  if (
    !verifyOrderAccessToken({
      orderNumber: order.order_number,
      suppliedToken: accessToken,
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

  const { data: productFile, error: productFileError } = await supabase
    .from("product_files")
    .select("id,product_id,is_active")
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

  const downloadToken = createDownloadAccessToken();
  const expiresAt = new Date(
    Date.now() + DOWNLOAD_LINK_TTL_SECONDS * 1000,
  ).toISOString();
  const { error: linkError } = await supabase.from("download_links").insert({
    order_id: order.id,
    order_item_id: matchingOrderItem.id,
    product_file_id: productFileId,
    token_hash: hashDownloadToken(downloadToken),
    expires_at: expiresAt,
    max_uses: 3,
    used_count: 0,
  });

  if (linkError) {
    return NextResponse.json({ error: linkError.message }, { status: 500 });
  }

  return NextResponse.json({
    downloadUrl: createDownloadUrl(request, downloadToken),
    expiresAt,
  });
}
