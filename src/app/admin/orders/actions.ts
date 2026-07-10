"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  getClearedOrderIds,
  saveClearedOrderIds,
} from "@/app/admin/orders/cleared-orders";
import { requireAdmin } from "@/lib/supabase/admin";

const orderActionSchema = z.object({
  orderId: z.uuid(),
});

function getOrderId(formData: FormData) {
  const parsed = orderActionSchema.safeParse({
    orderId: formData.get("orderId"),
  });

  return parsed.success ? parsed.data.orderId : null;
}

async function ensureOrderExists(
  supabase: Awaited<ReturnType<typeof requireAdmin>>["supabase"],
  orderId: string,
) {
  const { data, error } = await supabase
    .from("orders")
    .select("id")
    .eq("id", orderId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("Order not found.");
  }
}

export async function clearOrderFromDashboard(formData: FormData) {
  const orderId = getOrderId(formData);

  if (!orderId) {
    redirect("/admin/orders?error=invalid-order");
  }

  try {
    const { supabase } = await requireAdmin();

    await ensureOrderExists(supabase, orderId);

    const clearedOrderIds = await getClearedOrderIds(supabase);
    await saveClearedOrderIds(supabase, [...clearedOrderIds, orderId]);

    revalidatePath("/admin");
    revalidatePath("/admin/orders");
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to clear order.";

    redirect(`/admin/orders?error=${encodeURIComponent(message)}`);
  }

  redirect("/admin/orders?cleared=1");
}

export async function restoreOrderToDashboard(formData: FormData) {
  const orderId = getOrderId(formData);

  if (!orderId) {
    redirect("/admin/orders?view=cleared&error=invalid-order");
  }

  try {
    const { supabase } = await requireAdmin();
    const clearedOrderIds = await getClearedOrderIds(supabase);

    await saveClearedOrderIds(
      supabase,
      clearedOrderIds.filter((clearedOrderId) => clearedOrderId !== orderId),
    );

    revalidatePath("/admin");
    revalidatePath("/admin/orders");
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to restore order.";

    redirect(
      `/admin/orders?view=cleared&error=${encodeURIComponent(message)}`,
    );
  }

  redirect("/admin/orders?view=cleared&restored=1");
}
