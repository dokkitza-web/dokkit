import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import { formatPrice } from "@/data/catalogue";
import {
  updatePackageTierPricing,
  updateProductDetails,
} from "@/app/admin/products/actions";
import {
  deleteProductFile,
  updateProductFileStatus,
} from "@/app/admin/files/actions";
import { requireAdmin } from "@/lib/supabase/admin";

type ProductType = "industry_package" | "single_document";
type PackageTierKey = "starter" | "professional" | "complete";

type ProductRow = {
  id: string;
  industry_id: string | null;
  slug: string;
  name: string;
  description: string;
  product_type: ProductType;
  package_tier: PackageTierKey | null;
  price_cents: number;
  document_count: number;
  workbook_count: number;
  pdf_count: number;
  is_live: boolean;
  created_at: string;
  updated_at: string;
};

type IndustryRow = {
  id: string;
  name: string;
  slug: string;
};

type PackageTierRow = {
  tier_key: PackageTierKey;
  name: string;
  summary: string;
  price_cents: number;
  document_count: number;
  workbook_count: number;
  pdf_count: number;
  is_live: boolean;
};

type ProductFileRow = {
  id: string;
  file_kind: string;
  version_label: string;
  storage_bucket: string;
  storage_path: string;
  checksum: string | null;
  is_active: boolean;
  created_at: string;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-ZA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatProductType(value: string) {
  return value
    .split("_")
    .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatPriceInput(cents: number) {
  return (cents / 100).toFixed(2);
}

function getSearchParam(
  searchParams: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = searchParams[key];

  return Array.isArray(value) ? value[0] : value;
}

function StatusMessage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const updated = getSearchParam(searchParams, "updated");
  const error = getSearchParam(searchParams, "error");

  if (error) {
    return (
      <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {error === "invalid-product" || error === "invalid-tier"
          ? "Check the form values and try again."
          : decodeURIComponent(error)}
      </div>
    );
  }

  if (!updated) {
    return null;
  }

  const message =
    updated === "tier"
      ? "Package tier pricing updated across the catalogue and checkout products."
      : "Product details updated.";

  return (
    <div className="mb-6 rounded-lg border border-[#ffd8bd] bg-[#fff4eb] p-4 text-sm text-[#d95400]">
      {message}
    </div>
  );
}

export default async function AdminProductEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const { supabase, user } = await requireAdmin();
  const [
    { data: product, error: productError },
    { data: industries },
    { data: files },
  ] = await Promise.all([
    supabase
      .from("products")
      .select(
        "id,industry_id,slug,name,description,product_type,package_tier,price_cents,document_count,workbook_count,pdf_count,is_live,created_at,updated_at",
      )
      .eq("id", id)
      .single(),
    supabase.from("industries").select("id,name,slug").order("name"),
    supabase
      .from("product_files")
      .select(
        "id,file_kind,version_label,storage_bucket,storage_path,checksum,is_active,created_at",
      )
      .eq("product_id", id)
      .order("created_at", { ascending: false }),
  ]);

  if (productError || !product) {
    notFound();
  }

  const productRow = product as ProductRow;
  const industryRows = (industries ?? []) as IndustryRow[];
  const fileRows = (files ?? []) as ProductFileRow[];
  const { data: packageTier } = productRow.package_tier
    ? await supabase
        .from("package_tiers")
        .select(
          "tier_key,name,summary,price_cents,document_count,workbook_count,pdf_count,is_live",
        )
        .eq("tier_key", productRow.package_tier)
        .maybeSingle()
    : { data: null };
  const packageTierRow = packageTier as PackageTierRow | null;

  return (
    <AdminShell
      email={user.email ?? "Admin user"}
      eyebrow="Product editor"
      title={productRow.name}
      description={`${formatProductType(productRow.product_type)} | Created ${formatDate(productRow.created_at)} | Updated ${formatDate(productRow.updated_at)}`}
      actions={
        <Link
          href="/admin/products"
          className="inline-flex rounded-full border border-black/10 px-5 py-2.5 text-sm font-black text-[#111111] transition hover:border-[#ff6a00] hover:text-[#ff6a00]"
        >
          Back to products
        </Link>
      }
    >

      <StatusMessage searchParams={resolvedSearchParams} />

      <div className="grid gap-8 xl:grid-cols-[1fr_0.9fr]">
        <form
          action={updateProductDetails}
          className="rounded-[1.5rem] border border-black/10 bg-white p-6 shadow-sm"
        >
          <input type="hidden" name="productId" value={productRow.id} />
          {productRow.product_type === "industry_package" && productRow.is_live ? (
            <input type="hidden" name="isLive" value="on" />
          ) : null}
          <h2 className="text-xl font-black">Catalogue details</h2>
          <p className="mt-2 text-sm leading-6 text-[#5f5f66]">
            These fields control how this product is named, attached, and shown
            in admin and checkout records.
          </p>

          <div className="mt-6 grid gap-5">
            <label className="grid gap-2 text-sm font-bold text-[#111111]">
              Product name
              <input
                name="name"
                defaultValue={productRow.name}
                required
                maxLength={160}
                className="rounded-2xl border border-[#cfc7bd] bg-white px-4 py-3 text-base outline-none transition focus:border-[#ff6a00] focus:ring-2 focus:ring-[#ffd8bd]"
              />
            </label>

            <label className="grid gap-2 text-sm font-bold text-[#111111]">
              Slug
              <input
                name="slug"
                defaultValue={productRow.slug}
                required
                pattern="[a-z0-9]+(-[a-z0-9]+)*"
                maxLength={120}
                className="rounded-2xl border border-[#cfc7bd] bg-white px-4 py-3 text-base outline-none transition focus:border-[#ff6a00] focus:ring-2 focus:ring-[#ffd8bd]"
              />
            </label>

            <label className="grid gap-2 text-sm font-bold text-[#111111]">
              Description
              <textarea
                name="description"
                defaultValue={productRow.description}
                required
                rows={5}
                maxLength={1000}
                className="rounded-2xl border border-[#cfc7bd] bg-white px-4 py-3 text-base outline-none transition focus:border-[#ff6a00] focus:ring-2 focus:ring-[#ffd8bd]"
              />
            </label>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-bold text-[#111111]">
                Industry
                <select
                  name="industryId"
                  defaultValue={productRow.industry_id ?? ""}
                  className="rounded-2xl border border-[#cfc7bd] bg-white px-4 py-3 text-base outline-none transition focus:border-[#ff6a00] focus:ring-2 focus:ring-[#ffd8bd]"
                >
                  <option value="">No industry</option>
                  {industryRows.map((industry) => (
                    <option key={industry.id} value={industry.id}>
                      {industry.name}
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid gap-2 text-sm font-bold text-[#111111]">
                Package tier
                <input
                  type="hidden"
                  name="packageTier"
                  value={productRow.package_tier ?? ""}
                />
                <div className="rounded-2xl border border-[#ece7df] bg-[#f6f4f1] px-4 py-3 text-base text-[#5f5f66]">
                  {productRow.package_tier ?? "None"}
                </div>
              </div>
            </div>

            {productRow.product_type === "single_document" ? (
              <>
                <label className="grid gap-2 text-sm font-bold text-[#111111]">
                  Price in rand
                  <input
                    name="price"
                    defaultValue={formatPriceInput(productRow.price_cents)}
                    required
                    inputMode="decimal"
                    className="rounded-2xl border border-[#cfc7bd] bg-white px-4 py-3 text-base outline-none transition focus:border-[#ff6a00] focus:ring-2 focus:ring-[#ffd8bd]"
                  />
                </label>

                <div className="grid gap-5 md:grid-cols-3">
                  <label className="grid gap-2 text-sm font-bold text-[#111111]">
                    DOCX count
                    <input
                      name="documentCount"
                      type="number"
                      min="0"
                      max="999"
                      defaultValue={productRow.document_count}
                      className="rounded-2xl border border-[#cfc7bd] bg-white px-4 py-3 text-base outline-none transition focus:border-[#ff6a00] focus:ring-2 focus:ring-[#ffd8bd]"
                    />
                  </label>
                  <label className="grid gap-2 text-sm font-bold text-[#111111]">
                    XLSX count
                    <input
                      name="workbookCount"
                      type="number"
                      min="0"
                      max="999"
                      defaultValue={productRow.workbook_count}
                      className="rounded-2xl border border-[#cfc7bd] bg-white px-4 py-3 text-base outline-none transition focus:border-[#ff6a00] focus:ring-2 focus:ring-[#ffd8bd]"
                    />
                  </label>
                  <label className="grid gap-2 text-sm font-bold text-[#111111]">
                    PDF count (coming soon)
                    <input
                      name="pdfCount"
                      type="number"
                      min="0"
                      max="999"
                      defaultValue={productRow.pdf_count}
                      className="rounded-2xl border border-[#cfc7bd] bg-white px-4 py-3 text-base outline-none transition focus:border-[#ff6a00] focus:ring-2 focus:ring-[#ffd8bd]"
                    />
                  </label>
                </div>

                <label className="flex items-center gap-3 text-sm font-bold text-[#111111]">
                  <input
                    name="isLive"
                    type="checkbox"
                    defaultChecked={productRow.is_live}
                    className="h-4 w-4 accent-[#ff6a00]"
                  />
                  Product is live
                </label>
              </>
            ) : (
              <>
                <input
                  type="hidden"
                  name="price"
                  value={formatPriceInput(productRow.price_cents)}
                />
                <input
                  type="hidden"
                  name="documentCount"
                  value={productRow.document_count}
                />
                <input
                  type="hidden"
                  name="workbookCount"
                  value={productRow.workbook_count}
                />
                <input type="hidden" name="pdfCount" value={productRow.pdf_count} />
                <div className="rounded-md bg-[#f6f4f1] p-4 text-sm text-[#5f5f66]">
                  This package product currently checks out at{" "}
                  <strong className="text-[#111111]">
                    {formatPrice(productRow.price_cents)}
                  </strong>
                  . Use the tier pricing panel to change package prices.
                </div>
              </>
            )}
          </div>

          <button
            type="submit"
            className="mt-6 rounded-full bg-[#ff6a00] px-5 py-3 text-sm font-black text-white transition hover:bg-[#d95400]"
          >
            Save product
          </button>
        </form>

        <div className="grid gap-8">
          {packageTierRow ? (
            <form
              action={updatePackageTierPricing}
              className="rounded-[1.5rem] border border-black/10 bg-white p-6 shadow-sm"
            >
              <input type="hidden" name="productId" value={productRow.id} />
              <input
                type="hidden"
                name="tierKey"
                value={packageTierRow.tier_key}
              />
              <h2 className="text-xl font-black">Package tier pricing</h2>
              <p className="mt-2 text-sm leading-6 text-[#5f5f66]">
                Updates the public package card and every checkout product in
                the {packageTierRow.name} tier.
              </p>

              <div className="mt-6 grid gap-5">
                <label className="grid gap-2 text-sm font-bold text-[#111111]">
                  Tier name
                  <input
                    name="name"
                    defaultValue={packageTierRow.name}
                    required
                    maxLength={80}
                    className="rounded-2xl border border-[#cfc7bd] bg-white px-4 py-3 text-base outline-none transition focus:border-[#ff6a00] focus:ring-2 focus:ring-[#ffd8bd]"
                  />
                </label>

                <label className="grid gap-2 text-sm font-bold text-[#111111]">
                  Tier summary
                  <textarea
                    name="summary"
                    defaultValue={packageTierRow.summary}
                    required
                    rows={4}
                    maxLength={500}
                    className="rounded-2xl border border-[#cfc7bd] bg-white px-4 py-3 text-base outline-none transition focus:border-[#ff6a00] focus:ring-2 focus:ring-[#ffd8bd]"
                  />
                </label>

                <label className="grid gap-2 text-sm font-bold text-[#111111]">
                  Tier price in rand
                  <input
                    name="price"
                    defaultValue={formatPriceInput(packageTierRow.price_cents)}
                    required
                    inputMode="decimal"
                    className="rounded-2xl border border-[#cfc7bd] bg-white px-4 py-3 text-base outline-none transition focus:border-[#ff6a00] focus:ring-2 focus:ring-[#ffd8bd]"
                  />
                </label>

                <div className="grid gap-5 md:grid-cols-3">
                  <label className="grid gap-2 text-sm font-bold text-[#111111]">
                    DOCX
                    <input
                      name="documentCount"
                      type="number"
                      min="0"
                      max="999"
                      defaultValue={packageTierRow.document_count}
                      className="rounded-2xl border border-[#cfc7bd] bg-white px-4 py-3 text-base outline-none transition focus:border-[#ff6a00] focus:ring-2 focus:ring-[#ffd8bd]"
                    />
                  </label>
                  <label className="grid gap-2 text-sm font-bold text-[#111111]">
                    XLSX
                    <input
                      name="workbookCount"
                      type="number"
                      min="0"
                      max="999"
                      defaultValue={packageTierRow.workbook_count}
                      className="rounded-2xl border border-[#cfc7bd] bg-white px-4 py-3 text-base outline-none transition focus:border-[#ff6a00] focus:ring-2 focus:ring-[#ffd8bd]"
                    />
                  </label>
                  <label className="grid gap-2 text-sm font-bold text-[#111111]">
                    PDF (coming soon)
                    <input
                      name="pdfCount"
                      type="number"
                      min="0"
                      max="999"
                      defaultValue={packageTierRow.pdf_count}
                      className="rounded-2xl border border-[#cfc7bd] bg-white px-4 py-3 text-base outline-none transition focus:border-[#ff6a00] focus:ring-2 focus:ring-[#ffd8bd]"
                    />
                  </label>
                </div>

                <label className="flex items-center gap-3 text-sm font-bold text-[#111111]">
                  <input
                    name="isLive"
                    type="checkbox"
                    defaultChecked={packageTierRow.is_live}
                    className="h-4 w-4 accent-[#ff6a00]"
                  />
                  Tier is live
                </label>
              </div>

              <button
                type="submit"
                className="mt-6 rounded-full bg-[#111111] px-5 py-3 text-sm font-black text-white transition hover:bg-[#2b2b2b]"
              >
                Save tier pricing
              </button>
            </form>
          ) : null}

          <section className="rounded-[1.5rem] border border-black/10 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-xl font-black">Attached files</h2>
                <p className="mt-2 text-sm leading-6 text-[#5f5f66]">
                  Manage template files for this product.
                </p>
              </div>
              <Link
                href="/admin/files"
                className="inline-flex rounded-full border border-black/10 px-4 py-2 text-sm font-black text-[#111111] transition hover:border-[#ff6a00] hover:text-[#ff6a00]"
              >
                Upload file
              </Link>
            </div>

            {fileRows.length ? (
              <div className="mt-6 grid gap-4">
                {fileRows.map((file) => (
                  <article
                    key={file.id}
                    className="rounded-2xl border border-black/10 p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="font-black text-[#111111]">
                          {file.file_kind.toUpperCase()} {file.version_label}
                        </p>
                        <p className="mt-1 text-xs text-[#5f5f66]">
                          {formatDate(file.created_at)}
                        </p>
                      </div>
                      <span
                        className={
                          file.is_active
                            ? "w-fit rounded-full bg-[#fff4eb] px-3 py-1 text-xs font-black text-[#ff6a00]"
                            : "w-fit rounded-full bg-[#f2f0ed] px-3 py-1 text-xs font-black text-[#6b625a]"
                        }
                      >
                        {file.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <p className="mt-3 break-all text-xs text-[#5f5f66]">
                      {file.storage_bucket}/{file.storage_path}
                    </p>
                    {file.checksum ? (
                      <p className="mt-2 truncate font-mono text-xs text-[#5f5f66]">
                        {file.checksum}
                      </p>
                    ) : null}

                    <div className="mt-4 flex flex-wrap gap-3">
                      <form action={updateProductFileStatus}>
                        <input type="hidden" name="fileId" value={file.id} />
                        <input
                          type="hidden"
                          name="productId"
                          value={productRow.id}
                        />
                        <input
                          type="hidden"
                          name="isActive"
                          value={file.is_active ? "false" : "true"}
                        />
                        <button
                          type="submit"
                          className="rounded-full border border-black/10 px-3 py-2 text-xs font-black text-[#111111] transition hover:border-[#ff6a00] hover:text-[#ff6a00]"
                        >
                          {file.is_active ? "Deactivate" : "Activate"}
                        </button>
                      </form>

                      <form action={deleteProductFile}>
                        <input type="hidden" name="fileId" value={file.id} />
                        <input
                          type="hidden"
                          name="productId"
                          value={productRow.id}
                        />
                        <button
                          type="submit"
                          className="rounded-full border border-red-200 px-3 py-2 text-xs font-black text-red-700 transition hover:border-red-400 hover:bg-red-50"
                        >
                          Delete permanently
                        </button>
                      </form>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="mt-5 rounded-2xl bg-[#f6f4f1] p-5 text-sm text-[#5f5f66]">
                No files attached to this product yet.
              </div>
            )}
          </section>
        </div>
      </div>
    </AdminShell>
  );
}
