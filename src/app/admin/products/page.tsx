import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { formatPrice } from "@/data/catalogue";
import { requireAdmin } from "@/lib/supabase/admin";

export const metadata = {
  title: "Admin products | DokKit",
  description: "Manage DokKit products from Supabase.",
};

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  product_type: string;
  package_tier: string | null;
  price_cents: number;
  is_live: boolean;
  product_files:
    | {
        id: string;
        is_active: boolean;
      }[]
    | null;
  industries:
    | {
        name: string;
      }
    | {
        name: string;
      }[]
    | null;
};

function formatProductType(value: string) {
  return value
    .split("_")
    .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1))
    .join(" ");
}

function getIndustryName(industry: ProductRow["industries"]) {
  if (Array.isArray(industry)) {
    return industry[0]?.name ?? "-";
  }

  return industry?.name ?? "-";
}

function getSearchParam(
  searchParams: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = searchParams[key];

  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = await searchParams;
  const query = (getSearchParam(resolvedSearchParams, "q") ?? "")
    .trim()
    .toLowerCase();
  const typeFilter = getSearchParam(resolvedSearchParams, "type") ?? "all";
  const statusFilter = getSearchParam(resolvedSearchParams, "status") ?? "all";
  const { supabase, user } = await requireAdmin();
  const { data: products, error } = await supabase
    .from("products")
    .select(
      "id,slug,name,product_type,package_tier,price_cents,is_live,industries(name),product_files(id,is_active)",
    )
    .order("product_type", { ascending: true })
    .order("name", { ascending: true });
  const productRows = ((products ?? []) as ProductRow[]).filter((product) => {
    const matchesQuery = query
      ? [product.name, product.slug, getIndustryName(product.industries)]
          .join(" ")
          .toLowerCase()
          .includes(query)
      : true;
    const matchesType =
      typeFilter === "all" ? true : product.product_type === typeFilter;
    const matchesStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "live"
          ? product.is_live
          : !product.is_live;

    return matchesQuery && matchesType && matchesStatus;
  });

  return (
    <AdminShell
      email={user.email ?? "Admin user"}
      eyebrow="Catalogue admin"
      title="Templates"
      description="Review product records, open the editor, adjust pricing, and manage live catalogue status."
      actions={
        <Link
          href="/admin/files"
          className="rounded-full bg-[#ff6a00] px-4 py-2 text-sm font-black text-white transition hover:bg-[#d95400]"
        >
          Upload file
        </Link>
      }
    >
      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          {error.message}
        </div>
      ) : (
        <div className="rounded-[1.5rem] border border-black/10 bg-white shadow-sm">
          <form className="grid gap-3 border-b border-black/10 p-4 lg:grid-cols-[1fr_220px_180px_auto]">
            <label className="grid gap-2 text-sm font-bold text-[#111111]">
              Search templates
              <input
                name="q"
                defaultValue={query}
                placeholder="Search by name, slug, or industry"
                className="rounded-2xl border border-[#cfc7bd] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#ff6a00] focus:ring-2 focus:ring-[#ffd8bd]"
              />
            </label>
            <label className="grid gap-2 text-sm font-bold text-[#111111]">
              Type
              <select
                name="type"
                defaultValue={typeFilter}
                className="rounded-2xl border border-[#cfc7bd] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#ff6a00] focus:ring-2 focus:ring-[#ffd8bd]"
              >
                <option value="all">All types</option>
                <option value="industry_package">Industry packages</option>
                <option value="single_document">Single documents</option>
              </select>
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
                href="/admin/products"
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
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Industry</th>
                  <th className="px-4 py-3">Tier</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Files</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {productRows.map((product) => (
                  <tr key={product.id} className="transition hover:bg-[#fff4eb]">
                    <td className="px-4 py-3">
                      <p className="font-black text-[#111111]">
                        {product.name}
                      </p>
                      <p className="mt-1 text-xs text-[#5f5f66]">
                        {product.slug}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-[#5f5f66]">
                      {formatProductType(product.product_type)}
                    </td>
                    <td className="px-4 py-3 text-[#5f5f66]">
                      {getIndustryName(product.industries)}
                    </td>
                    <td className="px-4 py-3 text-[#5f5f66]">
                      {product.package_tier ?? "-"}
                    </td>
                    <td className="px-4 py-3 font-black text-[#ff6a00]">
                      {formatPrice(product.price_cents)}
                    </td>
                    <td className="px-4 py-3 text-[#5f5f66]">
                      {product.product_files?.filter((file) => file.is_active)
                        .length ?? 0}{" "}
                      active / {product.product_files?.length ?? 0} total
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          product.is_live
                            ? "rounded-full bg-[#fff4eb] px-3 py-1 text-xs font-black text-[#ff6a00]"
                            : "rounded-full bg-[#f6f4f1] px-3 py-1 text-xs font-black text-[#5f5f66]"
                        }
                      >
                        {product.is_live ? "Live" : "Draft"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="rounded-full border border-black/10 px-3 py-2 text-xs font-black text-[#111111] transition hover:border-[#ff6a00] hover:text-[#ff6a00]"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {productRows.length === 0 ? (
            <div className="p-8 text-sm font-bold text-[#5f5f66]">
              No templates match the selected filters.
            </div>
          ) : null}
        </div>
      )}
    </AdminShell>
  );
}
