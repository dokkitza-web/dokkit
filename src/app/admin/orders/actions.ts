"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  getClearedOrderIds,
  saveClearedOrderIds,
} from "@/app/admin/orders/cleared-orders";
import { requireAdmin } from "@/lib/supabase/admin";
import {
  createOrderAccessToken,
  decryptDownloadAccessToken,
  encryptDownloadAccessToken,
  hashDownloadToken,
} from "@/lib/downloads";
import {
  sendDownloadReadyEmail,
  sendRefundStatusEmail,
} from "@/lib/emails";

const orderActionSchema = z.object({
  orderId: z.uuid(),
});
const refundActionSchema = orderActionSchema.extend({
  refundStatus: z.enum([
    "requested",
    "approved",
    "initiated",
    "completed",
    "declined",
  ]),
  reason: z.string().trim().max(1000).optional().or(z.literal("")),
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

export async function reissueOrderAccess(formData: FormData) {
  const orderId = getOrderId(formData);

  if (!orderId) {
    redirect("/admin/orders?error=invalid-order");
  }

  try {
    const { supabase, user } = await requireAdmin();
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(
        "id,order_number,email,customer_id,status,paid_at,total_cents,access_reissue_count,download_access_token_ciphertext",
      )
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      throw new Error(orderError?.message ?? "Order not found.");
    }

    if (order.status !== "paid" || !order.paid_at) {
      throw new Error("Only a verified paid order can receive renewed access.");
    }

    const supportDeadline = new Date(order.paid_at);
    supportDeadline.setUTCFullYear(supportDeadline.getUTCFullYear() + 1);

    if (supportDeadline.getTime() < Date.now()) {
      throw new Error(
        "The approved 12-month access-support period has ended for this order.",
      );
    }

    const { data: orderItems, error: itemsError } = await supabase
      .from("order_items")
      .select("product_id,quantity,total_cents,product_snapshot")
      .eq("order_id", order.id);

    if (itemsError) {
      throw new Error(itemsError.message);
    }

    const productIds = [
      ...new Set(
        (orderItems ?? [])
          .map((item) => item.product_id)
          .filter((productId): productId is string => Boolean(productId)),
      ),
    ];

    if (!productIds.length) {
      throw new Error("No purchased Product files are linked to this order.");
    }

    const { count: activeFileCount, error: filesError } = await supabase
      .from("product_files")
      .select("id", { count: "exact", head: true })
      .in("product_id", productIds)
      .eq("is_active", true);

    if (filesError || !activeFileCount) {
      throw new Error(
        filesError?.message ??
          "The purchased Product is not technically available.",
      );
    }

    const accessToken =
      decryptDownloadAccessToken(order.download_access_token_ciphertext) ??
      createOrderAccessToken();
    const reissueCount = (order.access_reissue_count ?? 0) + 1;
    const issuedAt = new Date();
    const expiresAt = new Date(issuedAt.getTime() + 7 * 24 * 60 * 60 * 1000);
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        access_issued_at: issuedAt.toISOString(),
        access_expires_at: expiresAt.toISOString(),
        successful_downloads: 0,
        access_reissue_count: reissueCount,
        access_reissued_at: issuedAt.toISOString(),
        download_access_token_hash: hashDownloadToken(accessToken),
        download_access_token_ciphertext:
          encryptDownloadAccessToken(accessToken),
        updated_at: issuedAt.toISOString(),
      })
      .eq("id", order.id);

    if (updateError) {
      throw new Error(updateError.message);
    }

    const { error: auditError } = await supabase.from("audit_logs").insert({
      actor_id: user.id,
      action: "order_access_reissued",
      entity_type: "order",
      entity_id: order.id,
      metadata: {
        order_number: order.order_number,
        reissue_count: reissueCount,
        access_expires_at: expiresAt.toISOString(),
      },
    });

    if (auditError) {
      throw new Error(auditError.message);
    }

    const emailResult = await sendDownloadReadyEmail({
      supabase,
      orderId: order.id,
      customerId: order.customer_id,
      orderNumber: order.order_number,
      to: order.email,
      totalCents: order.total_cents,
      accessToken,
      templateKey: `download_access_reissued_${reissueCount}`,
      items: (orderItems ?? []).map((item) => ({
        name: item.product_snapshot?.name ?? "DokKit Product",
        quantity: item.quantity,
        totalCents: item.total_cents,
      })),
    });

    if (!emailResult.sent) {
      throw new Error(
        "Access was renewed, but the customer email could not be sent. Review the email log immediately.",
      );
    }

    revalidatePath("/admin/orders");
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to reissue access.";

    redirect(`/admin/orders?error=${encodeURIComponent(message)}`);
  }

  redirect("/admin/orders?reissued=1");
}

export async function recordRefundStatus(formData: FormData) {
  const parsed = refundActionSchema.safeParse({
    orderId: formData.get("orderId"),
    refundStatus: formData.get("refundStatus"),
    reason: formData.get("reason"),
  });

  if (!parsed.success) {
    redirect("/admin/orders?error=invalid-refund-update");
  }

  try {
    const { supabase } = await requireAdmin();
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id,order_number,email,customer_id")
      .eq("id", parsed.data.orderId)
      .single();

    if (orderError || !order) {
      throw new Error(orderError?.message ?? "Order not found.");
    }

    const { error: refundError } = await supabase.rpc(
      "record_order_refund_status",
      {
        p_order_id: order.id,
        p_refund_status: parsed.data.refundStatus,
        p_reason: parsed.data.reason ?? "",
      },
    );

    if (refundError) {
      throw new Error(refundError.message);
    }

    const emailResult = await sendRefundStatusEmail({
      supabase,
      orderId: order.id,
      customerId: order.customer_id,
      orderNumber: order.order_number,
      to: order.email,
      refundStatus: parsed.data.refundStatus,
      reason: parsed.data.reason,
    });

    if (!emailResult.sent) {
      throw new Error(
        "The refund status was recorded, but the customer email failed. Review the email log and retry the same status.",
      );
    }

    const { error: notificationError } = await supabase
      .from("orders")
      .update({
        refund_customer_notified_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", order.id);

    if (notificationError) {
      throw new Error(notificationError.message);
    }

    revalidatePath("/admin");
    revalidatePath("/admin/orders");
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to record the refund status.";

    redirect(`/admin/orders?error=${encodeURIComponent(message)}`);
  }

  redirect("/admin/orders?refund-updated=1");
}
