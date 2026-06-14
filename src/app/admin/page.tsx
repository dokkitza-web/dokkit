import Link from "next/link";
import { AdminNav } from "@/components/admin-nav";
import { requireAdmin } from "@/lib/supabase/admin";

export const metadata = {
  title: "Admin dashboard | DokKit",
  description: "Owner-only DokKit admin dashboard.",
};

const countCards = [
  { table: "industries", label: "Industries" },
  { table: "products", label: "Products" },
  { table: "orders", label: "Orders" },
  { table: "customers", label: "Customers" },
  { table: "product_files", label: "Product files" },
  { table: "payments", label: "Payments" },
  { table: "email_logs", label: "Email logs" },
];

async function getCount(
  supabase: Awaited<ReturnType<typeof requireAdmin>>["supabase"],
  table: string,
) {
  const { count, error } = await supabase
    .from(table)
    .select("*", { count: "exact", head: true });

  if (error) {
    return {
      count: 0,
      error: error.message,
    };
  }

  return {
    count: count ?? 0,
    error: null,
  };
}

export default async function AdminDashboardPage() {
  const { supabase, user } = await requireAdmin();
  const counts = await Promise.all(
    countCards.map(async (card) => ({
      ...card,
      ...(await getCount(supabase, card.table)),
    })),
  );

  return (
    <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
      <AdminNav email={user.email ?? "Admin user"} />

      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#147d64]">
          Owner dashboard
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">
          Admin overview
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-[#53615b]">
          This is the first protected admin area. Today it verifies owner-only
          access and reads the live Supabase tables.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {counts.map((card) => (
          <article
            key={card.table}
            className="rounded-lg border border-[#dfe7e2] bg-white p-5 shadow-sm"
          >
            <p className="text-sm font-medium text-[#53615b]">{card.label}</p>
            <p className="mt-3 text-4xl font-semibold text-[#15201c]">
              {card.count}
            </p>
            {card.error ? (
              <p className="mt-3 text-xs text-red-700">{card.error}</p>
            ) : null}
          </article>
        ))}
      </div>

      <div className="mt-8 rounded-lg border border-[#dfe7e2] bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Next admin modules</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {[
            "Product editing and pricing",
            "Download file QA and version cleanup",
            "Refund and cancellation workflows",
            "Customer account access",
          ].map((item) => (
            <div key={item} className="rounded-md bg-[#f7f9f8] px-4 py-3 text-sm">
              {item}
            </div>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/admin/orders"
            className="inline-flex rounded-md bg-[#147d64] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0f604d]"
          >
            Review orders
          </Link>
          <Link
            href="/admin/products"
            className="inline-flex rounded-md border border-[#dfe7e2] px-5 py-3 text-sm font-semibold text-[#15201c] transition hover:border-[#147d64]"
          >
            Review products
          </Link>
        </div>
      </div>
    </section>
  );
}
