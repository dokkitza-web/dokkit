import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyOrderAccessToken } from "@/lib/downloads";
import { hasVerifiedLivePayFastPayment } from "@/lib/payment-verification";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

const orderQuerySchema = z.object({
  order: z.string().trim().min(1).max(40),
  access: z.string().trim().min(20).max(200).optional().or(z.literal("")),
});

type OrderItemRow = {
  id: string;
  product_id: string | null;
  quantity: number;
  total_cents: number;
  product_snapshot: {
    name?: string;
    slug?: string;
  };
};

type ProductFileRow = {
  id: string;
  product_id: string;
  file_kind: string;
  version_label: string;
  checksum: string | null;
  created_at: string;
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsedQuery = orderQuerySchema.safeParse({
    order: url.searchParams.get("order"),
    access: url.searchParams.get("access") ?? "",
  });

  if (!parsedQuery.success) {
    return NextResponse.json({ error: "Invalid order number." }, { status: 400 });
  }

  const supabase = createSupabaseServiceClient();
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id,order_number,status,total_cents,paid_at,created_at")
    .eq("order_number", parsedQuery.data.order)
    .single();

  if (orderError || !order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .select("id,product_id,quantity,total_cents,product_snapshot")
    .eq("order_id", order.id);

  if (itemsError) {
    return NextResponse.json({ error: itemsError.message }, { status: 500 });
  }

  const orderItems = (items ?? []) as OrderItemRow[];
  let hasLivePayment = false;

  if (order.status === "paid") {
    try {
      hasLivePayment = await hasVerifiedLivePayFastPayment({
        supabase,
        orderId: order.id,
      });
    } catch (error) {
      return NextResponse.json(
        {
          error:
            error instanceof Error
              ? error.message
              : "Could not verify payment status.",
        },
        { status: 500 },
      );
    }
  }

  const downloadsUnlocked =
    order.status === "paid" &&
    hasLivePayment &&
    verifyOrderAccessToken({
      orderNumber: order.order_number,
      suppliedToken: parsedQuery.data.access,
    });
  const productIds = [
    ...new Set(
      orderItems
        .map((item) => item.product_id)
        .filter((productId): productId is string => Boolean(productId)),
    ),
  ];
  let filesByProductId = new Map<string, ProductFileRow[]>();

  if (downloadsUnlocked && productIds.length) {
    const { data: files, error: filesError } = await supabase
      .from("product_files")
      .select("id,product_id,file_kind,version_label,checksum,created_at")
      .in("product_id", productIds)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (filesError) {
      return NextResponse.json({ error: filesError.message }, { status: 500 });
    }

    filesByProductId = (files ?? []).reduce((fileMap, file) => {
      const productFiles = fileMap.get(file.product_id) ?? [];

      productFiles.push(file as ProductFileRow);
      fileMap.set(file.product_id, productFiles);

      return fileMap;
    }, new Map<string, ProductFileRow[]>());
  }

  return NextResponse.json({
    orderNumber: order.order_number,
    status: order.status,
    totalCents: order.total_cents,
    paidAt: order.paid_at,
    createdAt: order.created_at,
    downloadsUnlocked,
    items: orderItems.map((item) => {
      const snapshot = item.product_snapshot;

      return {
        name: snapshot.name ?? "DokKit product",
        slug: snapshot.slug ?? "",
        quantity: item.quantity,
        totalCents: item.total_cents,
        files: item.product_id
          ? (filesByProductId.get(item.product_id) ?? []).map((file) => ({
              id: file.id,
              kind: file.file_kind,
              versionLabel: file.version_label,
              checksum: file.checksum,
              createdAt: file.created_at,
            }))
          : [],
      };
    }),
  });
}
