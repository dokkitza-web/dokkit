import type { SupabaseClient } from "@supabase/supabase-js";

type PayFastPaymentRow = {
  status: string;
  raw_payload: Record<string, unknown> | null;
  verified_at: string | null;
};

export async function hasVerifiedLivePayFastPayment({
  supabase,
  orderId,
}: {
  supabase: SupabaseClient;
  orderId: string;
}) {
  const { data: payment, error } = await supabase
    .from("payments")
    .select("status,raw_payload,verified_at")
    .eq("order_id", orderId)
    .eq("provider", "payfast")
    .eq("status", "verified")
    .order("verified_at", { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  const verifiedPayment = payment as PayFastPaymentRow | null;

  return verifiedPayment?.raw_payload?._payfast_environment === "live";
}
