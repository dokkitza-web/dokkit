import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { requireAdmin } from "@/lib/supabase/admin";
import {
  deleteProductFile,
  updateProductFileStatus,
} from "@/app/admin/files/actions";
import { AdminFileUploadForm } from "@/app/admin/files/upload-form";

export const metadata = {
  title: "Admin files | DokKit",
  description: "Upload and attach DokKit product files.",
};

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  product_type: string;
  package_tier: string | null;
  is_live: boolean;
};

type ProductFileRow = {
  id: string;
  product_id: string;
  file_kind: string;
  version_label: string;
  storage_bucket: string;
  storage_path: string;
  checksum: string | null;
  is_active: boolean;
  created_at: string;
  products:
    | {
        id: string;
        slug: string;
        name: string;
      }
    | {
        id: string;
        slug: string;
        name: string;
      }[]
    | null;
};

function formatFileKind(value: string) {
  return value.toUpperCase();
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-ZA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getProductName(product: ProductFileRow["products"]) {
  if (Array.isArray(product)) {
    return product[0]?.name ?? "Unknown product";
  }

  return product?.name ?? "Unknown product";
}

function getProductSlug(product: ProductFileRow["products"]) {
  if (Array.isArray(product)) {
    return product[0]?.slug ?? "-";
  }

  return product?.slug ?? "-";
}

function getSearchParam(
  searchParams: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = searchParams[key];

  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminFilesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = await searchParams;
  const query = (getSearchParam(resolvedSearchParams, "q") ?? "")
    .trim()
    .toLowerCase();
  const kindFilter = getSearchParam(resolvedSearchParams, "kind") ?? "all";
  const statusFilter = getSearchParam(resolvedSearchParams, "status") ?? "all";
  const { supabase, user } = await requireAdmin();
  const [{ data: products, error: productsError }, { data: files, error: filesError }] =
    await Promise.all([
      supabase
        .from("products")
        .select("id,slug,name,product_type,package_tier,is_live")
        .order("product_type", { ascending: true })
        .order("name", { ascending: true }),
      supabase
        .from("product_files")
        .select(
          "id,product_id,file_kind,version_label,storage_bucket,storage_path,checksum,is_active,created_at,products(id,slug,name)",
        )
        .order("created_at", { ascending: false })
        .limit(100),
    ]);
  const productRows = (products ?? []) as ProductRow[];
  const fileRows = (files ?? []) as ProductFileRow[];
  const filteredFileRows = fileRows.filter((file) => {
    const matchesQuery = query
      ? [
          getProductName(file.products),
          getProductSlug(file.products),
          file.version_label,
          file.storage_path,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query)
      : true;
    const matchesKind = kindFilter === "all" ? true : file.file_kind === kindFilter;
    const matchesStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "active"
          ? file.is_active
          : !file.is_active;

    return matchesQuery && matchesKind && matchesStatus;
  });

  return (
    <AdminShell
      email={user.email ?? "Admin user"}
      eyebrow="Product files"
      title="Upload Templates"
      description="Attach ZIP, DOCX, and XLSX files to launch products. PDF uploads are kept for the coming-soon PDF reference format."
    >
      {productsError ? (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          {productsError.message}
        </div>
      ) : null}

      <AdminFileUploadForm
        products={productRows.map((product) => ({
          id: product.id,
          slug: product.slug,
          name: product.name,
          productType: product.product_type,
          packageTier: product.package_tier,
        }))}
      />

      <div className="mt-8 rounded-[1.5rem] border border-black/10 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-black">Attached files</h2>
            <p className="mt-2 text-sm leading-6 text-[#5f5f66]">
              Most recent 100 file records. Deactivating a file hides it from
              future secure download lists.
            </p>
          </div>
          <p className="rounded-full bg-[#fff4eb] px-4 py-2 text-sm font-black text-[#ff6a00]">
            {filteredFileRows.filter((file) => file.is_active).length} active /{" "}
            {filteredFileRows.length} shown
          </p>
        </div>

        {filesError ? (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            {filesError.message}
          </div>
        ) : fileRows.length ? (
          <div className="mt-6 overflow-hidden rounded-[1.25rem] border border-black/10">
            <form className="grid gap-3 border-b border-black/10 p-4 lg:grid-cols-[1fr_180px_180px_auto]">
              <label className="grid gap-2 text-sm font-bold text-[#111111]">
                Search files
                <input
                  name="q"
                  defaultValue={query}
                  placeholder="Search product, version, or path"
                  className="rounded-2xl border border-[#cfc7bd] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#ff6a00] focus:ring-2 focus:ring-[#ffd8bd]"
                />
              </label>
              <label className="grid gap-2 text-sm font-bold text-[#111111]">
                File type
                <select
                  name="kind"
                  defaultValue={kindFilter}
                  className="rounded-2xl border border-[#cfc7bd] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#ff6a00] focus:ring-2 focus:ring-[#ffd8bd]"
                >
                  <option value="all">All types</option>
                  <option value="zip">ZIP</option>
                  <option value="docx">DOCX</option>
                  <option value="xlsx">XLSX</option>
                  <option value="pdf">PDF (coming soon)</option>
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
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
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
                  href="/admin/files"
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
                    <th className="px-4 py-3">File</th>
                    <th className="px-4 py-3">Storage path</th>
                    <th className="px-4 py-3">Checksum</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {filteredFileRows.map((file) => (
                    <tr key={file.id} className="transition hover:bg-[#fff4eb]">
                      <td className="px-4 py-3">
                        <p className="font-black text-[#111111]">
                          {getProductName(file.products)}
                        </p>
                        <p className="mt-1 text-xs text-[#5f5f66]">
                          {getProductSlug(file.products)}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-black text-[#111111]">
                          {formatFileKind(file.file_kind)} {file.version_label}
                        </p>
                        <p className="mt-1 text-xs text-[#5f5f66]">
                          {formatDate(file.created_at)}
                        </p>
                      </td>
                      <td className="max-w-xs px-4 py-3">
                        <p className="truncate text-xs text-[#5f5f66]">
                          {file.storage_bucket}/{file.storage_path}
                        </p>
                      </td>
                      <td className="max-w-[180px] px-4 py-3">
                        <p className="truncate font-mono text-xs text-[#5f5f66]">
                          {file.checksum ?? "-"}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            file.is_active
                              ? "rounded-full bg-[#fff4eb] px-3 py-1 text-xs font-black text-[#ff6a00]"
                              : "rounded-full bg-[#f2f0ed] px-3 py-1 text-xs font-black text-[#6b625a]"
                          }
                        >
                          {file.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <form action={updateProductFileStatus}>
                            <input type="hidden" name="fileId" value={file.id} />
                            <input
                              type="hidden"
                              name="productId"
                              value={file.product_id}
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
                              value={file.product_id}
                            />
                            <button
                              type="submit"
                              className="rounded-full border border-red-200 px-3 py-2 text-xs font-black text-red-700 transition hover:border-red-400 hover:bg-red-50"
                            >
                              Delete
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredFileRows.length === 0 ? (
              <div className="p-8 text-sm font-bold text-[#5f5f66]">
                No uploaded files match the selected filters.
              </div>
            ) : null}
          </div>
        ) : (
          <div className="mt-5 rounded-2xl bg-[#f6f4f1] p-5 text-sm text-[#5f5f66]">
            No product files uploaded yet.
          </div>
        )}
      </div>
    </AdminShell>
  );
}
