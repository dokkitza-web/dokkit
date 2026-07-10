import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import {
  VAT_INCLUDED_SUMMARY_LABEL,
  formatPrice,
  getVatPortionCents,
} from "@/data/catalogue";
import { requireAdmin } from "@/lib/supabase/admin";

export const metadata = {
  title: "Admin payments | DokKit",
  description: "Review DokKit PayFast payment records.",
};

type PaymentRow = {
  id: string;
  order_id: string;
  provider: string;
  provider_payment_id: string | null;
  status: string;
  amount_cents: number;
  raw_payload: Record<string, unknown> | null;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
};

type OrderRow = {
  id: string;
  order_number: string;
  email: string;
  status: string;
  total_cents: number;
  currency: string;
};

function formatDate(value?: string | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-ZA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getSearchParam(
  searchParams: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = searchParams[key];

  return Array.isArray(value) ? value[0] : value;
}

function getPayloadText(
  payload: Record<string, unknown> | null,
  key: string,
) {
  const value = payload?.[key];

  return typeof value === "string" ? value : null;
}

function getStatusClass(status: string) {
  if (status === "verified") {
    return "bg-[#fff4eb] text-[#ff6a00]";
  }

  if (status === "initiated") {
    return "bg-amber-50 text-amber-800";
  }

  return "bg-red-50 text-red-700";
}

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = await searchParams;
  const query = (getSearchParam(resolvedSearchParams, "q") ?? "")
    .trim()
    .toLowerCase();
  const statusFilter = getSearchParam(resolvedSearchParams, "status") ?? "all";
  const { supabase, user } = await requireAdmin();
  const { data: payments, error: paymentsError } = await supabase
    .from("payments")
    .select(
      "id,order_id,provider,provider_payment_id,status,amount_cents,raw_payload,verified_at,created_at,updated_at",
    )
    .order("created_at", { ascending: false })
    .limit(100);
  const paymentRows = (payments ?? []) as PaymentRow[];
  const orderIds = [...new Set(paymentRows.map((payment) => payment.order_id))];
  const { data: orders, error: ordersError } = orderIds.length
    ? await supabase
        .from("orders")
        .select("id,order_number,email,status,total_cents,currency")
        .in("id", orderIds)
    : { data: [], error: null };
  const orderById = new Map(
    ((orders ?? []) as OrderRow[]).map((order) => [order.id, order]),
  );
  const filteredPayments = paymentRows.filter((payment) => {
    const order = orderById.get(payment.order_id);
    const environment =
      getPayloadText(payment.raw_payload, "_payfast_environment") ?? "";
    const matchesQuery = query
      ? [
          payment.provider,
          payment.provider_payment_id ?? "",
          payment.status,
          environment,
          order?.order_number ?? "",
          order?.email ?? "",
        ]
          .join(" ")
          .toLowerCase()
          .includes(query)
      : true;
    const matchesStatus =
      statusFilter === "all" ? true : payment.status === statusFilter;

    return matchesQuery && matchesStatus;
  });
  const verifiedPayments = paymentRows.filter(
    (payment) => payment.status === "verified",
  );
  const verifiedTotalCents = verifiedPayments.reduce(
    (total, payment) => total + payment.amount_cents,
    0,
  );
  const failedPaymentCount = paymentRows.filter((payment) =>
    ["invalid", "failed"].includes(payment.status),
  ).length;

  return (
    <AdminShell
      email={user.email ?? "Admin user"}
      eyebrow="Payment operations"
      title="Payments"
      description="Review PayFast payment attempts, verified payments, environments, amounts, and linked orders."
      actions={
        <Link
          href="/admin/orders"
          className="rounded-full bg-[#ff6a00] px-4 py-2 text-sm font-black text-white transition hover:bg-[#d95400]"
        >
          Review orders
        </Link>
      }
    >
      {[paymentsError, ordersError].filter(Boolean).length ? (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          {[paymentsError, ordersError]
            .map((error) => error?.message)
            .filter(Boolean)
            .join(" ")}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["Payment records", paymentRows.length.toString()],
          ["Verified", verifiedPayments.length.toString()],
          ["Failed / invalid", failedPaymentCount.toString()],
          ["Verified total", formatPrice(verifiedTotalCents)],
        ].map(([label, value]) => (
          <article
            key={label}
            className="rounded-[1.5rem] border border-black/10 bg-white p-5 shadow-sm"
          >
            <p className="text-sm font-bold text-[#5f5f66]">{label}</p>
            <p className="mt-3 text-3xl font-black text-[#111111]">{value}</p>
            {label === "Verified total" ? (
              <p className="mt-1 text-xs font-bold text-[#5f5f66]">
                {VAT_INCLUDED_SUMMARY_LABEL}:{" "}
                {formatPrice(getVatPortionCents(verifiedTotalCents))}
              </p>
            ) : null}
          </article>
        ))}
      </div>

      <div className="mt-8 rounded-[1.5rem] border border-black/10 bg-white shadow-sm">
        <form className="grid gap-3 border-b border-black/10 p-4 lg:grid-cols-[1fr_220px_auto]">
          <label className="grid gap-2 text-sm font-bold text-[#111111]">
            Search payments
            <input
              name="q"
              defaultValue={query}
              placeholder="Search order, email, PayFast ID, or environment"
              className="rounded-2xl border border-[#cfc7bd] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#ff6a00] focus:ring-2 focus:ring-[#ffd8bd]"
            />
          </label>
          <label className="grid gap-2 text-sm font-bold text-[#111111]">
            Status
            <select
              name="status"
              defaultValue={statusFilter}
              className="rounded-2xl border border-[#cfc7bd] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#ff6a00] focus:ring-2 focus:ring-[#ffd8bd]"
            >
              <option value="all">All status</option>
              <option value="initiated">Initiated</option>
              <option value="verified">Verified</option>
              <option value="invalid">Invalid</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </label>
          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="rounded-full bg-[#111111] px-5 py-3 text-sm font-black text-white transition hover:bg-[#2b2b2b]"
            >
              Filter
            </button>
            <Link
              href="/admin/payments"
              className="rounded-full border border-black/10 px-5 py-3 text-sm font-black text-[#111111] transition hover:border-[#ff6a00] hover:text-[#ff6a00]"
            >
              Reset
            </Link>
          </div>
        </form>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-black/10 text-sm">
            <thead className="bg-[#111111] text-left text-xs font-black uppercase tracking-[0.14em] text-white/70">
              <tr>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Environment</th>
                <th className="px-4 py-3">Verified</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filteredPayments.map((payment) => {
                const order = orderById.get(payment.order_id);
                const environment =
                  getPayloadText(payment.raw_payload, "_payfast_environment") ??
                  "-";
                const payfastStatus =
                  getPayloadText(payment.raw_payload, "payment_status") ?? "-";

                return (
                  <tr key={payment.id} className="transition hover:bg-[#fff4eb]">
                    <td className="px-4 py-3">
                      <p className="font-black text-[#111111]">
                        {payment.provider.toUpperCase()}
                      </p>
                      <p className="mt-1 break-all text-xs text-[#5f5f66]">
                        {payment.provider_payment_id ?? "No PayFast ID yet"}
                      </p>
                      <p className="mt-1 text-xs text-[#5f5f66]">
                        Created {formatDate(payment.created_at)}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-black text-[#111111]">
                        {order?.order_number ?? "Unknown order"}
                      </p>
                      <p className="mt-1 break-all text-xs text-[#5f5f66]">
                        {order?.email ?? "-"}
                      </p>
                      <p className="mt-1 text-xs text-[#5f5f66]">
                        Order status: {order?.status ?? "-"}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-black text-[#ff6a00]">
                        {formatPrice(payment.amount_cents)}
                      </p>
                      <p className="mt-1 text-xs text-[#5f5f66]">
                        {VAT_INCLUDED_SUMMARY_LABEL}:{" "}
                        {formatPrice(getVatPortionCents(payment.amount_cents))}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-[#5f5f66]">
                      <p className="font-bold text-[#111111]">{environment}</p>
                      <p className="mt-1 text-xs">PayFast: {payfastStatus}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#5f5f66]">
                      {formatDate(payment.verified_at)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-black ${getStatusClass(payment.status)}`}
                      >
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredPayments.length === 0 ? (
          <div className="p-8 text-sm font-bold text-[#5f5f66]">
            No payments match the selected filters.
          </div>
        ) : null}
      </div>
    </AdminShell>
  );
}
