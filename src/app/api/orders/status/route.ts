import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

const orderQuerySchema = z.object({
  order: z.string().trim().min(1).max(40),
});

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsedQuery = orderQuerySchema.safeParse({
    order: url.searchParams.get("order"),
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
    .select("quantity,total_cents,product_snapshot")
    .eq("order_id", order.id);

  if (itemsError) {
    return NextResponse.json({ error: itemsError.message }, { status: 500 });
  }

  return NextResponse.json({
    orderNumber: order.order_number,
    status: order.status,
    totalCents: order.total_cents,
    paidAt: order.paid_at,
    createdAt: order.created_at,
    items: (items ?? []).map((item) => {
      const snapshot = item.product_snapshot as {
        name?: string;
        slug?: string;
      };

      return {
        name: snapshot.name ?? "DokKit product",
        slug: snapshot.slug ?? "",
        quantity: item.quantity,
        totalCents: item.total_cents,
      };
    }),
  });
}
