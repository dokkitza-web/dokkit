import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

const cancelSchema = z.object({
  orderNumber: z.string().trim().min(1).max(40),
});

export async function POST(request: Request) {
  const parsedBody = cancelSchema.safeParse(await request.json());

  if (!parsedBody.success) {
    return NextResponse.json({ error: "Invalid order number." }, { status: 400 });
  }

  const supabase = createSupabaseServiceClient();
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id,status,order_number")
    .eq("order_number", parsedBody.data.orderNumber)
    .single();

  if (orderError || !order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  if (order.status === "paid") {
    return NextResponse.json({
      orderNumber: order.order_number,
      status: "paid",
      message: "Order is already paid and was not cancelled.",
    });
  }

  if (order.status === "pending_payment") {
    const now = new Date().toISOString();

    await supabase
      .from("orders")
      .update({
        status: "cancelled",
        updated_at: now,
      })
      .eq("id", order.id);

    await supabase
      .from("payments")
      .update({
        status: "failed",
        updated_at: now,
      })
      .eq("order_id", order.id)
      .eq("provider", "payfast")
      .eq("status", "initiated");
  }

  return NextResponse.json({
    orderNumber: order.order_number,
    status: order.status === "pending_payment" ? "cancelled" : order.status,
  });
}
