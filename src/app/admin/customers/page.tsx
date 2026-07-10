import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { formatPrice } from "@/data/catalogue";
import { requireAdmin } from "@/lib/supabase/admin";

export const metadata = {
  title: "Admin customers | DokKit",
  description: "Review DokKit customer records and order activity.",
};

type CustomerRow = {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
};

type OrderRow = {
  id: string;
  customer_id: string | null;
  email: string;
  status: string;
  total_cents: number;
  paid_at: string | null;
  created_at: string;
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

function getCustomerOrders(customer: CustomerRow, orders: OrderRow[]) {
  return orders.filter(
    (order) =>
      order.customer_id === customer.id ||
      order.email.toLowerCase() === customer.email.toLowerCase(),
  );
}

function getLatestOrder(orders: OrderRow[]) {
  return [...orders].sort(
    (left, right) =>
      new Date(right.created_at).getTime() - new Date(left.created_at).getTime(),
  )[0];
}

export default async function AdminCustomersPage({
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
  const { data: customers, error: customersError } = await supabase
    .from("customers")
    .select("id,email,full_name,phone,created_at,updated_at")
    .order("created_at", { ascending: false })
    .limit(100);
  const customerRows = (customers ?? []) as CustomerRow[];
  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("id,customer_id,email,status,total_cents,paid_at,created_at")
    .order("created_at", { ascending: false })
    .limit(500);
  const orderRows = (orders ?? []) as OrderRow[];
  const filteredCustomers = customerRows.filter((customer) => {
    const customerOrders = getCustomerOrders(customer, orderRows);
    const paidOrders = customerOrders.filter((order) => order.status === "paid");
    const matchesQuery = query
      ? [customer.email, customer.full_name ?? "", customer.phone ?? ""]
          .join(" ")
          .toLowerCase()
          .includes(query)
      : true;
    const matchesStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "paid"
          ? paidOrders.length > 0
          : paidOrders.length === 0;

    return matchesQuery && matchesStatus;
  });
  const customersWithPaidOrders = customerRows.filter((customer) =>
    getCustomerOrders(customer, orderRows).some((order) => order.status === "paid"),
  ).length;
  const paidRevenueCents = orderRows
    .filter((order) => order.status === "paid")
    .reduce((total, order) => total + order.total_cents, 0);
  const pendingOrderCount = orderRows.filter(
    (order) => order.status === "pending_payment",
  ).length;

  return (
    <AdminShell
      email={user.email ?? "Admin user"}
      eyebrow="Customer records"
      title="Customers"
      description="Review customer contact details, order history, payment status, and repeat-purchase activity."
      actions={
        <Link
          href="/admin/orders"
          className="rounded-full bg-[#ff6a00] px-4 py-2 text-sm font-black text-white transition hover:bg-[#d95400]"
        >
          Review orders
        </Link>
      }
    >
      {[customersError, ordersError].filter(Boolean).length ? (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          {[customersError, ordersError]
            .map((error) => error?.message)
            .filter(Boolean)
            .join(" ")}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["Customers", customerRows.length.toString()],
          ["Paid customers", customersWithPaidOrders.toString()],
          ["Pending orders", pendingOrderCount.toString()],
          ["Paid revenue", formatPrice(paidRevenueCents)],
        ].map(([label, value]) => (
          <article
            key={label}
            className="rounded-[1.5rem] border border-black/10 bg-white p-5 shadow-sm"
          >
            <p className="text-sm font-bold text-[#5f5f66]">{label}</p>
            <p className="mt-3 text-3xl font-black text-[#111111]">{value}</p>
          </article>
        ))}
      </div>

      <div className="mt-8 rounded-[1.5rem] border border-black/10 bg-white shadow-sm">
        <form className="grid gap-3 border-b border-black/10 p-4 lg:grid-cols-[1fr_220px_auto]">
          <label className="grid gap-2 text-sm font-bold text-[#111111]">
            Search customers
            <input
              name="q"
              defaultValue={query}
              placeholder="Search name, email, or phone"
              className="rounded-2xl border border-[#cfc7bd] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#ff6a00] focus:ring-2 focus:ring-[#ffd8bd]"
            />
          </label>
          <label className="grid gap-2 text-sm font-bold text-[#111111]">
            Purchase status
            <select
              name="status"
              defaultValue={statusFilter}
              className="rounded-2xl border border-[#cfc7bd] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#ff6a00] focus:ring-2 focus:ring-[#ffd8bd]"
            >
              <option value="all">All customers</option>
              <option value="paid">Has paid order</option>
              <option value="unpaid">No paid orders</option>
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
              href="/admin/customers"
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
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Orders</th>
                <th className="px-4 py-3">Paid value</th>
                <th className="px-4 py-3">Latest order</th>
                <th className="px-4 py-3">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filteredCustomers.map((customer) => {
                const customerOrders = getCustomerOrders(customer, orderRows);
                const paidOrders = customerOrders.filter(
                  (order) => order.status === "paid",
                );
                const latestOrder = getLatestOrder(customerOrders);
                const customerPaidValueCents = paidOrders.reduce(
                  (total, order) => total + order.total_cents,
                  0,
                );

                return (
                  <tr key={customer.id} className="transition hover:bg-[#fff4eb]">
                    <td className="px-4 py-3">
                      <p className="font-black text-[#111111]">
                        {customer.full_name || "Name not captured"}
                      </p>
                      <p className="mt-1 break-all text-xs text-[#5f5f66]">
                        {customer.email}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-[#5f5f66]">
                      {customer.phone || "-"}
                    </td>
                    <td className="px-4 py-3 text-[#5f5f66]">
                      <p className="font-black text-[#111111]">
                        {paidOrders.length} paid / {customerOrders.length} total
                      </p>
                      <p className="mt-1 text-xs">
                        {customerOrders.filter((order) => order.status === "pending_payment").length}{" "}
                        pending
                      </p>
                    </td>
                    <td className="px-4 py-3 font-black text-[#ff6a00]">
                      {formatPrice(customerPaidValueCents)}
                    </td>
                    <td className="px-4 py-3 text-xs text-[#5f5f66]">
                      {latestOrder ? (
                        <>
                          <p className="font-bold text-[#111111]">
                            {latestOrder.status}
                          </p>
                          <p className="mt-1">
                            {formatDate(latestOrder.created_at)}
                          </p>
                        </>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-[#5f5f66]">
                      {formatDate(customer.created_at)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredCustomers.length === 0 ? (
          <div className="p-8 text-sm font-bold text-[#5f5f66]">
            No customers match the selected filters.
          </div>
        ) : null}
      </div>
    </AdminShell>
  );
}
