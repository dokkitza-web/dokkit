import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { formatPrice } from "@/data/catalogue";
import { requireAdmin } from "@/lib/supabase/admin";

export const metadata = {
  title: "Admin categories | DokKit",
  description: "Review DokKit industry categories and linked products.",
};

type IndustryRow = {
  id: string;
  slug: string;
  name: string;
  summary: string;
  display_order: number;
  is_live: boolean;
  created_at: string;
  updated_at: string;
};

type ProductRow = {
  id: string;
  industry_id: string | null;
  product_type: string;
  package_tier: string | null;
  price_cents: number;
  is_live: boolean;
};

type ProductFileRow = {
  id: string;
  product_id: string;
  is_active: boolean;
};

function formatDate(value: string) {
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

function getCategoryStats({
  industryId,
  products,
  files,
}: {
  industryId: string;
  products: ProductRow[];
  files: ProductFileRow[];
}) {
  const categoryProducts = products.filter(
    (product) => product.industry_id === industryId,
  );
  const productIds = new Set(categoryProducts.map((product) => product.id));
  const linkedFiles = files.filter((file) => productIds.has(file.product_id));
  const liveProducts = categoryProducts.filter((product) => product.is_live);
  const revenueValueCents = liveProducts.reduce(
    (total, product) => total + product.price_cents,
    0,
  );

  return {
    totalProducts: categoryProducts.length,
    liveProducts: liveProducts.length,
    packageProducts: categoryProducts.filter(
      (product) => product.product_type === "industry_package",
    ).length,
    singleProducts: categoryProducts.filter(
      (product) => product.product_type === "single_document",
    ).length,
    activeFiles: linkedFiles.filter((file) => file.is_active).length,
    revenueValueCents,
  };
}

export default async function AdminCategoriesPage({
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
  const [
    { data: industries, error: industriesError },
    { data: products, error: productsError },
    { data: files, error: filesError },
  ] = await Promise.all([
    supabase
      .from("industries")
      .select(
        "id,slug,name,summary,display_order,is_live,created_at,updated_at",
      )
      .order("display_order", { ascending: true })
      .order("name", { ascending: true }),
    supabase
      .from("products")
      .select("id,industry_id,product_type,package_tier,price_cents,is_live"),
    supabase.from("product_files").select("id,product_id,is_active"),
  ]);
  const industryRows = (industries ?? []) as IndustryRow[];
  const productRows = (products ?? []) as ProductRow[];
  const fileRows = (files ?? []) as ProductFileRow[];
  const filteredIndustries = industryRows.filter((industry) => {
    const matchesQuery = query
      ? [industry.name, industry.slug, industry.summary]
          .join(" ")
          .toLowerCase()
          .includes(query)
      : true;
    const matchesStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "live"
          ? industry.is_live
          : !industry.is_live;

    return matchesQuery && matchesStatus;
  });
  const liveIndustryCount = industryRows.filter(
    (industry) => industry.is_live,
  ).length;
  const liveProductCount = productRows.filter((product) => product.is_live).length;
  const activeFileCount = fileRows.filter((file) => file.is_active).length;

  return (
    <AdminShell
      email={user.email ?? "Admin user"}
      eyebrow="Catalogue categories"
      title="Categories"
      description="Review industry categories, live status, attached products, and available template files."
      actions={
        <Link
          href="/admin/products"
          className="rounded-full bg-[#ff6a00] px-4 py-2 text-sm font-black text-white transition hover:bg-[#d95400]"
        >
          Manage templates
        </Link>
      }
    >
      {[industriesError, productsError, filesError].filter(Boolean).length ? (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          {[industriesError, productsError, filesError]
            .map((error) => error?.message)
            .filter(Boolean)
            .join(" ")}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["Total categories", industryRows.length.toString()],
          ["Live categories", liveIndustryCount.toString()],
          ["Live products", liveProductCount.toString()],
          ["Active files", activeFileCount.toString()],
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
            Search categories
            <input
              name="q"
              defaultValue={query}
              placeholder="Search name, slug, or summary"
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
              <option value="live">Live</option>
              <option value="draft">Draft</option>
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
              href="/admin/categories"
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
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Products</th>
                <th className="px-4 py-3">Active files</th>
                <th className="px-4 py-3">Live value</th>
                <th className="px-4 py-3">Updated</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filteredIndustries.map((industry) => {
                const stats = getCategoryStats({
                  industryId: industry.id,
                  products: productRows,
                  files: fileRows,
                });

                return (
                  <tr key={industry.id} className="transition hover:bg-[#fff4eb]">
                    <td className="max-w-md px-4 py-3">
                      <p className="font-black text-[#111111]">
                        {industry.name}
                      </p>
                      <p className="mt-1 text-xs text-[#5f5f66]">
                        {industry.slug}
                      </p>
                      <p className="mt-2 line-clamp-2 text-xs leading-5 text-[#5f5f66]">
                        {industry.summary}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-[#5f5f66]">
                      <p className="font-black text-[#111111]">
                        {stats.liveProducts} live / {stats.totalProducts} total
                      </p>
                      <p className="mt-1 text-xs">
                        {stats.packageProducts} packs, {stats.singleProducts}{" "}
                        single
                      </p>
                    </td>
                    <td className="px-4 py-3 font-black text-[#ff6a00]">
                      {stats.activeFiles}
                    </td>
                    <td className="px-4 py-3 font-black text-[#111111]">
                      {formatPrice(stats.revenueValueCents)}
                    </td>
                    <td className="px-4 py-3 text-xs text-[#5f5f66]">
                      {formatDate(industry.updated_at)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          industry.is_live
                            ? "rounded-full bg-[#fff4eb] px-3 py-1 text-xs font-black text-[#ff6a00]"
                            : "rounded-full bg-[#f6f4f1] px-3 py-1 text-xs font-black text-[#5f5f66]"
                        }
                      >
                        {industry.is_live ? "Live" : "Draft"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredIndustries.length === 0 ? (
          <div className="p-8 text-sm font-bold text-[#5f5f66]">
            No categories match the selected filters.
          </div>
        ) : null}
      </div>
    </AdminShell>
  );
}
