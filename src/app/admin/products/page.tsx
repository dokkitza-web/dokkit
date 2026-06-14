import { AdminNav } from "@/components/admin-nav";
import { formatPrice } from "@/data/catalogue";
import { requireAdmin } from "@/lib/supabase/admin";

export const metadata = {
  title: "Admin products | DokKit",
  description: "View DokKit products from Supabase.",
};

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  product_type: string;
  package_tier: string | null;
  price_cents: number;
  is_live: boolean;
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

export default async function AdminProductsPage() {
  const { supabase, user } = await requireAdmin();
  const { data: products, error } = await supabase
    .from("products")
    .select(
      "id,slug,name,product_type,package_tier,price_cents,is_live,industries(name)",
    )
    .order("product_type", { ascending: true })
    .order("name", { ascending: true });

  return (
    <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
      <AdminNav email={user.email ?? "Admin user"} />

      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#147d64]">
          Catalogue admin
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">
          Products
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-[#53615b]">
          Read-only view of the seeded Supabase products. Editing and uploads
          come next.
        </p>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          {error.message}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-[#dfe7e2] bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#dfe7e2] text-sm">
              <thead className="bg-[#f7f9f8] text-left text-xs font-semibold uppercase tracking-[0.14em] text-[#53615b]">
                <tr>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Industry</th>
                  <th className="px-4 py-3">Tier</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eef2ef]">
                {(products as ProductRow[] | null)?.map((product) => (
                  <tr key={product.id}>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-[#15201c]">
                        {product.name}
                      </p>
                      <p className="mt-1 text-xs text-[#53615b]">
                        {product.slug}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-[#53615b]">
                      {formatProductType(product.product_type)}
                    </td>
                    <td className="px-4 py-3 text-[#53615b]">
                      {getIndustryName(product.industries)}
                    </td>
                    <td className="px-4 py-3 text-[#53615b]">
                      {product.package_tier ?? "-"}
                    </td>
                    <td className="px-4 py-3 font-semibold text-[#147d64]">
                      {formatPrice(product.price_cents)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-[#eef5f2] px-3 py-1 text-xs font-semibold text-[#147d64]">
                        {product.is_live ? "Live" : "Draft"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
