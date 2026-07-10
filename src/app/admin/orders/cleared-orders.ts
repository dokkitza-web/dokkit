import type { SupabaseClient } from "@supabase/supabase-js";

export const CLEARED_ORDERS_SETTINGS_KEY = "admin_cleared_orders";

type ClearedOrdersSettings = {
  orderIds?: unknown;
};

export async function getClearedOrderIds(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("settings")
    .select("value")
    .eq("key", CLEARED_ORDERS_SETTINGS_KEY)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  const value = data?.value as ClearedOrdersSettings | null;

  if (!Array.isArray(value?.orderIds)) {
    return [];
  }

  return value.orderIds.filter(
    (orderId): orderId is string => typeof orderId === "string",
  );
}

export async function saveClearedOrderIds(
  supabase: SupabaseClient,
  orderIds: string[],
) {
  const uniqueOrderIds = [...new Set(orderIds)];
  const { error } = await supabase.from("settings").upsert(
    {
      key: CLEARED_ORDERS_SETTINGS_KEY,
      value: {
        orderIds: uniqueOrderIds,
        updatedAt: new Date().toISOString(),
      },
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "key",
    },
  );

  if (error) {
    throw new Error(error.message);
  }
}
