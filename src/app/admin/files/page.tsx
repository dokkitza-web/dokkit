import { AdminNav } from "@/components/admin-nav";
import { requireAdmin } from "@/lib/supabase/admin";
import { updateProductFileStatus } from "@/app/admin/files/actions";
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

export default async function AdminFilesPage() {
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
          "id,file_kind,version_label,storage_bucket,storage_path,checksum,is_active,created_at,products(id,slug,name)",
        )
        .order("created_at", { ascending: false })
        .limit(100),
    ]);
  const productRows = (products ?? []) as ProductRow[];
  const fileRows = (files ?? []) as ProductFileRow[];

  return (
    <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
      <AdminNav email={user.email ?? "Admin user"} />

      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#147d64]">
          Product files
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">
          Upload and attach files
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-[#53615b]">
          Attach ZIP, DOCX, XLSX, and PDF files to products. Active files appear
          automatically in the customer&apos;s secure download panel after a
          paid PayFast order.
        </p>
      </div>

      {productsError ? (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-5 text-sm text-red-700">
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

      <div className="mt-8 rounded-lg border border-[#dfe7e2] bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Attached files</h2>
            <p className="mt-2 text-sm leading-6 text-[#53615b]">
              Most recent 100 file records. Deactivating a file hides it from
              future secure download lists.
            </p>
          </div>
          <p className="text-sm font-semibold text-[#147d64]">
            {fileRows.filter((file) => file.is_active).length} active /{" "}
            {fileRows.length} total
          </p>
        </div>

        {filesError ? (
          <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            {filesError.message}
          </div>
        ) : fileRows.length ? (
          <div className="mt-6 overflow-hidden rounded-lg border border-[#dfe7e2]">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#dfe7e2] text-sm">
                <thead className="bg-[#f7f9f8] text-left text-xs font-semibold uppercase tracking-[0.14em] text-[#53615b]">
                  <tr>
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">File</th>
                    <th className="px-4 py-3">Storage path</th>
                    <th className="px-4 py-3">Checksum</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eef2ef]">
                  {fileRows.map((file) => (
                    <tr key={file.id}>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-[#15201c]">
                          {getProductName(file.products)}
                        </p>
                        <p className="mt-1 text-xs text-[#53615b]">
                          {getProductSlug(file.products)}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-[#15201c]">
                          {formatFileKind(file.file_kind)} {file.version_label}
                        </p>
                        <p className="mt-1 text-xs text-[#53615b]">
                          {formatDate(file.created_at)}
                        </p>
                      </td>
                      <td className="max-w-xs px-4 py-3">
                        <p className="truncate text-xs text-[#53615b]">
                          {file.storage_bucket}/{file.storage_path}
                        </p>
                      </td>
                      <td className="max-w-[180px] px-4 py-3">
                        <p className="truncate font-mono text-xs text-[#53615b]">
                          {file.checksum ?? "-"}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            file.is_active
                              ? "rounded-full bg-[#eef5f2] px-3 py-1 text-xs font-semibold text-[#147d64]"
                              : "rounded-full bg-[#f2f0ed] px-3 py-1 text-xs font-semibold text-[#6b625a]"
                          }
                        >
                          {file.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <form action={updateProductFileStatus}>
                          <input type="hidden" name="fileId" value={file.id} />
                          <input
                            type="hidden"
                            name="isActive"
                            value={file.is_active ? "false" : "true"}
                          />
                          <button
                            type="submit"
                            className="rounded-md border border-[#dfe7e2] px-3 py-2 text-xs font-semibold text-[#15201c] transition hover:border-[#147d64]"
                          >
                            {file.is_active ? "Deactivate" : "Activate"}
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="mt-5 rounded-lg bg-[#f7f9f8] p-5 text-sm text-[#53615b]">
            No product files uploaded yet.
          </div>
        )}
      </div>
    </section>
  );
}
