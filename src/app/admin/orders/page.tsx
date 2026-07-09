import { AdminShell } from "@/components/admin-shell";
import { formatPrice } from "@/data/catalogue";
import { requireAdmin } from "@/lib/supabase/admin";

export const metadata = {
  title: "Admin orders | DokKit",
  description: "Review DokKit orders, payments, emails, and downloads.",
};

type OrderStatus = "pending_payment" | "paid" | "failed" | "cancelled" | "refunded";

type OrderRow = {
  id: string;
  order_number: string;
  email: string;
  customer_id: string | null;
  status: OrderStatus;
  total_cents: number;
  currency: string;
  paid_at: string | null;
  created_at: string;
};

type CustomerRow = {
  id: string;
  full_name: string | null;
  phone: string | null;
  email: string;
};

type OrderItemRow = {
  order_id: string;
  quantity: number;
  total_cents: number;
  product_snapshot: {
    name?: string;
    slug?: string;
    product_type?: string;
    package_tier?: string | null;
  };
};

type PaymentRow = {
  order_id: string;
  provider: string;
  provider_payment_id: string | null;
  status: string;
  amount_cents: number;
  verified_at: string | null;
  created_at: string;
};

type EmailLogRow = {
  order_id: string | null;
  template_key: string;
  recipient: string;
  subject: string;
  status: string;
  error_message: string | null;
  created_at: string;
  sent_at: string | null;
};

type ItnLogRow = {
  order_id: string | null;
  signature_valid: boolean | null;
  amount_valid: boolean | null;
  status_text: string | null;
  processed_at: string | null;
  created_at: string;
};

type DownloadEventRow = {
  order_id: string | null;
  created_at: string;
};

function groupByOrderId<T extends { order_id: string | null }>(rows: T[]) {
  return rows.reduce((map, row) => {
    if (!row.order_id) {
      return map;
    }

    const existingRows = map.get(row.order_id) ?? [];

    existingRows.push(row);
    map.set(row.order_id, existingRows);

    return map;
  }, new Map<string, T[]>());
}

function groupCustomers(rows: CustomerRow[]) {
  return new Map(rows.map((customer) => [customer.id, customer]));
}

function formatDate(value?: string | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-ZA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getStatusClass(status: string) {
  if (status === "paid" || status === "verified" || status === "sent") {
    return "bg-[#fff4eb] text-[#ff6a00]";
  }

  if (status === "pending_payment" || status === "initiated" || status === "queued") {
    return "bg-amber-50 text-amber-800";
  }

  return "bg-red-50 text-red-700";
}

function getOrderSummary(orders: OrderRow[]) {
  return {
    total: orders.length,
    paid: orders.filter((order) => order.status === "paid").length,
    pending: orders.filter((order) => order.status === "pending_payment").length,
    revenueCents: orders
      .filter((order) => order.status === "paid")
      .reduce((total, order) => total + order.total_cents, 0),
  };
}

function getLatest<T extends { created_at: string }>(rows: T[]) {
  return [...rows].sort(
    (left, right) =>
      new Date(right.created_at).getTime() - new Date(left.created_at).getTime(),
  )[0];
}

export default async function AdminOrdersPage() {
  const { supabase, user } = await requireAdmin();
  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select(
      "id,order_number,email,customer_id,status,total_cents,currency,paid_at,created_at",
    )
    .order("created_at", { ascending: false })
    .limit(50);
  const orderRows = (orders ?? []) as OrderRow[];
  const orderIds = orderRows.map((order) => order.id);
  const customerIds = [
    ...new Set(
      orderRows
        .map((order) => order.customer_id)
        .filter((customerId): customerId is string => Boolean(customerId)),
    ),
  ];
  const [
    { data: customers },
    { data: orderItems },
    { data: payments },
    { data: emailLogs },
    { data: itnLogs },
    { data: downloadEvents },
  ] =
    orderIds.length > 0
      ? await Promise.all([
          customerIds.length
            ? supabase
                .from("customers")
                .select("id,full_name,phone,email")
                .in("id", customerIds)
            : Promise.resolve({ data: [] }),
          supabase
            .from("order_items")
            .select("order_id,quantity,total_cents,product_snapshot")
            .in("order_id", orderIds),
          supabase
            .from("payments")
            .select(
              "order_id,provider,provider_payment_id,status,amount_cents,verified_at,created_at",
            )
            .in("order_id", orderIds),
          supabase
            .from("email_logs")
            .select(
              "order_id,template_key,recipient,subject,status,error_message,created_at,sent_at",
            )
            .in("order_id", orderIds),
          supabase
            .from("payfast_itn_logs")
            .select(
              "order_id,signature_valid,amount_valid,status_text,processed_at,created_at",
            )
            .in("order_id", orderIds),
          supabase
            .from("download_events")
            .select("order_id,created_at")
            .in("order_id", orderIds),
        ])
      : [
          { data: [] },
          { data: [] },
          { data: [] },
          { data: [] },
          { data: [] },
          { data: [] },
        ];
  const summary = getOrderSummary(orderRows);
  const customerById = groupCustomers((customers ?? []) as CustomerRow[]);
  const itemsByOrderId = groupByOrderId((orderItems ?? []) as OrderItemRow[]);
  const paymentsByOrderId = groupByOrderId((payments ?? []) as PaymentRow[]);
  const emailsByOrderId = groupByOrderId((emailLogs ?? []) as EmailLogRow[]);
  const itnsByOrderId = groupByOrderId((itnLogs ?? []) as ItnLogRow[]);
  const downloadsByOrderId = groupByOrderId(
    (downloadEvents ?? []) as DownloadEventRow[],
  );

  return (
    <AdminShell
      email={user.email ?? "Admin user"}
      eyebrow="Order operations"
      title="Orders"
      description="Review recent orders, PayFast verification, email delivery, and secure download activity from one owner-only screen."
    >
      <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-[1.5rem] border border-black/10 bg-white p-5 shadow-sm">
          <p className="text-sm font-bold text-[#5f5f66]">Recent orders</p>
          <p className="mt-3 text-3xl font-black">{summary.total}</p>
        </article>
        <article className="rounded-[1.5rem] border border-black/10 bg-white p-5 shadow-sm">
          <p className="text-sm font-bold text-[#5f5f66]">Paid</p>
          <p className="mt-3 text-3xl font-black text-[#ff6a00]">
            {summary.paid}
          </p>
        </article>
        <article className="rounded-[1.5rem] border border-black/10 bg-white p-5 shadow-sm">
          <p className="text-sm font-bold text-[#5f5f66]">Pending</p>
          <p className="mt-3 text-3xl font-black text-amber-700">
            {summary.pending}
          </p>
        </article>
        <article className="rounded-[1.5rem] border border-black/10 bg-white p-5 shadow-sm">
          <p className="text-sm font-bold text-[#5f5f66]">Paid revenue</p>
          <p className="mt-3 text-3xl font-black">
            {formatPrice(summary.revenueCents)}
          </p>
        </article>
      </div>

      {ordersError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          {ordersError.message}
        </div>
      ) : orderRows.length ? (
        <div className="grid gap-5">
          {orderRows.map((order) => {
            const customer = order.customer_id
              ? customerById.get(order.customer_id)
              : null;
            const items = itemsByOrderId.get(order.id) ?? [];
            const payment = getLatest(paymentsByOrderId.get(order.id) ?? []);
            const emails = emailsByOrderId.get(order.id) ?? [];
            const latestItn = getLatest(itnsByOrderId.get(order.id) ?? []);
            const downloads = downloadsByOrderId.get(order.id) ?? [];

            return (
              <article
                key={order.id}
                className="rounded-[1.5rem] border border-black/10 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-xl font-semibold">
                        {order.order_number}
                      </h2>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(order.status)}`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-[#5f5f66]">
                      Created {formatDate(order.created_at)} | Paid{" "}
                      {formatDate(order.paid_at)}
                    </p>
                  </div>
                  <div className="text-left lg:text-right">
                    <p className="text-sm text-[#5f5f66]">Total</p>
                    <p className="mt-1 text-2xl font-black text-[#ff6a00]">
                      {formatPrice(order.total_cents)}
                    </p>
                    <p className="mt-1 text-xs text-[#5f5f66]">
                      {order.currency}
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 lg:grid-cols-[1.1fr_1fr_1fr]">
                  <div className="rounded-2xl bg-[#f6f4f1] p-4">
                    <p className="text-sm font-black">Customer</p>
                    <p className="mt-2 text-sm text-[#111111]">
                      {customer?.full_name ?? "Name not captured"}
                    </p>
                    <p className="mt-1 text-sm text-[#5f5f66]">{order.email}</p>
                    {customer?.phone ? (
                      <p className="mt-1 text-sm text-[#5f5f66]">
                        {customer.phone}
                      </p>
                    ) : null}
                  </div>

                  <div className="rounded-2xl bg-[#f6f4f1] p-4">
                    <p className="text-sm font-black">Payment</p>
                    {payment ? (
                      <>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(payment.status)}`}
                          >
                            {payment.status}
                          </span>
                          <span className="text-xs text-[#5f5f66]">
                            {payment.provider}
                          </span>
                        </div>
                        <p className="mt-2 text-xs text-[#5f5f66]">
                          Verified: {formatDate(payment.verified_at)}
                        </p>
                        {payment.provider_payment_id ? (
                          <p className="mt-1 break-all text-xs text-[#5f5f66]">
                            PayFast ID: {payment.provider_payment_id}
                          </p>
                        ) : null}
                      </>
                    ) : (
                      <p className="mt-2 text-sm text-[#5f5f66]">
                        No payment row found.
                      </p>
                    )}
                  </div>

                  <div className="rounded-2xl bg-[#f6f4f1] p-4">
                    <p className="text-sm font-black">Activity</p>
                    <p className="mt-2 text-sm text-[#5f5f66]">
                      Emails: {emails.length}
                    </p>
                    <p className="mt-1 text-sm text-[#5f5f66]">
                      Downloads: {downloads.length}
                    </p>
                    <p className="mt-1 text-sm text-[#5f5f66]">
                      Latest ITN: {latestItn?.status_text ?? "-"}
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 lg:grid-cols-2">
                  <div className="rounded-2xl border border-black/10 p-4">
                    <p className="text-sm font-black">Purchased products</p>
                    <div className="mt-3 grid gap-3">
                      {items.length ? (
                        items.map((item) => (
                          <div
                            key={`${order.id}-${item.product_snapshot.slug ?? item.total_cents}`}
                            className="flex justify-between gap-4 text-sm"
                          >
                            <div>
                              <p className="font-medium">
                                {item.product_snapshot.name ?? "DokKit product"}
                              </p>
                              <p className="mt-1 text-xs text-[#5f5f66]">
                                Qty {item.quantity}
                                {item.product_snapshot.package_tier
                                  ? ` | ${item.product_snapshot.package_tier}`
                                  : ""}
                              </p>
                            </div>
                            <p className="font-semibold">
                              {formatPrice(item.total_cents)}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-[#5f5f66]">
                          No order items found.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-black/10 p-4">
                    <p className="text-sm font-black">Email delivery</p>
                    <div className="mt-3 grid gap-3">
                      {emails.length ? (
                        emails.map((email) => (
                          <div
                            key={`${email.template_key}-${email.created_at}`}
                            className="text-sm"
                          >
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(email.status)}`}
                              >
                                {email.status}
                              </span>
                              <span className="font-medium">
                                {email.template_key}
                              </span>
                            </div>
                            <p className="mt-1 text-xs text-[#5f5f66]">
                              To {email.recipient} | Sent{" "}
                              {formatDate(email.sent_at)}
                            </p>
                            {email.error_message ? (
                              <p className="mt-1 text-xs text-red-700">
                                {email.error_message}
                              </p>
                            ) : null}
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-[#5f5f66]">
                          No email logs found.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="rounded-[1.5rem] border border-black/10 bg-white p-6 text-sm text-[#5f5f66] shadow-sm">
          No orders yet.
        </div>
      )}
    </AdminShell>
  );
}
