"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type ProductOption = {
  id: string;
  slug: string;
  name: string;
  productType: string;
  packageTier: string | null;
};

type FileKind = "zip" | "docx" | "xlsx" | "pdf";

const fileKindConfig: Record<
  FileKind,
  { accept: string; contentType: string; label: string }
> = {
  zip: {
    accept: ".zip",
    contentType: "application/zip",
    label: "ZIP package",
  },
  docx: {
    accept: ".docx",
    contentType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    label: "DOCX template",
  },
  xlsx: {
    accept: ".xlsx",
    contentType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    label: "XLSX workbook",
  },
  pdf: {
    accept: ".pdf",
    contentType: "application/pdf",
    label: "PDF reference",
  },
};

const maxFileSizeBytes = 100 * 1024 * 1024;

function formatProductType(value: string) {
  return value
    .split("_")
    .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatBytes(bytes: number) {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }

  if (bytes >= 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${bytes} B`;
}

function createSafeFileName(name: string) {
  const dotIndex = name.lastIndexOf(".");
  const baseName = dotIndex > -1 ? name.slice(0, dotIndex) : name;
  const extension = dotIndex > -1 ? name.slice(dotIndex + 1) : "";
  const safeBaseName =
    baseName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "dokkit-file";

  return extension
    ? `${safeBaseName}.${extension.toLowerCase()}`
    : safeBaseName;
}

async function createSha256Checksum(file: File) {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);

  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function createStoragePath({
  productSlug,
  fileKind,
  fileName,
}: {
  productSlug: string;
  fileKind: FileKind;
  fileName: string;
}) {
  const randomPart =
    typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : Math.random().toString(16).slice(2);

  return `products/${productSlug}/${fileKind}/${Date.now()}-${randomPart}-${fileName}`;
}

export function AdminFileUploadForm({
  products,
}: {
  products: ProductOption[];
}) {
  const router = useRouter();
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [fileKind, setFileKind] = useState<FileKind>("zip");
  const [versionLabel, setVersionLabel] = useState("v1");
  const [isActive, setIsActive] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const selectedProduct = useMemo(
    () => products.find((product) => product.id === productId),
    [productId, products],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const file = formData.get("file");

    if (!(file instanceof File) || !file.name) {
      setError("Choose a file to upload.");
      return;
    }

    if (!selectedProduct) {
      setError("Choose a product to attach this file to.");
      return;
    }

    const expectedExtension = `.${fileKind}`;

    if (!file.name.toLowerCase().endsWith(expectedExtension)) {
      setError(`This upload type expects a ${expectedExtension} file.`);
      return;
    }

    if (file.size > maxFileSizeBytes) {
      setError("The file is larger than the 100 MB product-file limit.");
      return;
    }

    setIsUploading(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError("Your admin session has expired. Please sign in again.");
        return;
      }

      const safeFileName = createSafeFileName(file.name);
      const storagePath = createStoragePath({
        productSlug: selectedProduct.slug,
        fileKind,
        fileName: safeFileName,
      });
      const checksum = await createSha256Checksum(file);
      const { error: uploadError } = await supabase.storage
        .from("product-files")
        .upload(storagePath, file, {
          cacheControl: "3600",
          contentType: fileKindConfig[fileKind].contentType,
          upsert: false,
        });

      if (uploadError) {
        setError(uploadError.message);
        return;
      }

      const { error: insertError } = await supabase.from("product_files").insert({
        product_id: selectedProduct.id,
        file_kind: fileKind,
        version_label: versionLabel.trim() || "v1",
        storage_bucket: "product-files",
        storage_path: storagePath,
        checksum,
        is_active: isActive,
        uploaded_by: user.id,
      });

      if (insertError) {
        await supabase.storage.from("product-files").remove([storagePath]);
        setError(insertError.message);
        return;
      }

      event.currentTarget.reset();
      setVersionLabel("v1");
      setIsActive(true);
      setMessage(
        `${file.name} uploaded and attached to ${selectedProduct.name}.`,
      );
      router.refresh();
    } finally {
      setIsUploading(false);
    }
  }

  if (!products.length) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
        Add products before uploading files.
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-[#dfe7e2] bg-white p-6 shadow-sm"
    >
      <h2 className="text-xl font-semibold">Upload product file</h2>
      <p className="mt-2 text-sm leading-6 text-[#53615b]">
        Files upload to the private Supabase bucket and are immediately linked
        to the selected product for paid-order downloads.
      </p>

      <div className="mt-6 grid gap-5">
        <label className="grid gap-2 text-sm font-medium text-[#15201c]">
          Product
          <select
            value={productId}
            onChange={(event) => setProductId(event.target.value)}
            className="rounded-md border border-[#b9c8c0] bg-white px-4 py-3 text-base outline-none transition focus:border-[#147d64] focus:ring-2 focus:ring-[#c8eadf]"
          >
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} - {formatProductType(product.productType)}
                {product.packageTier ? ` - ${product.packageTier}` : ""}
              </option>
            ))}
          </select>
        </label>

        <div className="grid gap-5 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium text-[#15201c]">
            File type
            <select
              value={fileKind}
              onChange={(event) => setFileKind(event.target.value as FileKind)}
              className="rounded-md border border-[#b9c8c0] bg-white px-4 py-3 text-base outline-none transition focus:border-[#147d64] focus:ring-2 focus:ring-[#c8eadf]"
            >
              {(Object.keys(fileKindConfig) as FileKind[]).map((kind) => (
                <option key={kind} value={kind}>
                  {fileKindConfig[kind].label}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm font-medium text-[#15201c]">
            Version label
            <input
              type="text"
              value={versionLabel}
              onChange={(event) => setVersionLabel(event.target.value)}
              maxLength={40}
              className="rounded-md border border-[#b9c8c0] bg-white px-4 py-3 text-base outline-none transition focus:border-[#147d64] focus:ring-2 focus:ring-[#c8eadf]"
            />
          </label>
        </div>

        <label className="grid gap-2 text-sm font-medium text-[#15201c]">
          File
          <input
            key={fileKind}
            name="file"
            type="file"
            accept={fileKindConfig[fileKind].accept}
            required
            className="rounded-md border border-dashed border-[#b9c8c0] bg-[#f7f9f8] px-4 py-4 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-[#147d64] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
          />
          <span className="text-xs text-[#53615b]">
            Maximum size: {formatBytes(maxFileSizeBytes)}. Accepted file:
            {" "}
            {fileKindConfig[fileKind].accept}
          </span>
        </label>

        <label className="flex items-center gap-3 text-sm font-medium text-[#15201c]">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(event) => setIsActive(event.target.checked)}
            className="h-4 w-4 accent-[#147d64]"
          />
          Make this file active for customer downloads
        </label>
      </div>

      {error ? (
        <p className="mt-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {message ? (
        <p className="mt-5 rounded-md border border-[#c8eadf] bg-[#eef8f4] px-4 py-3 text-sm text-[#0f604d]">
          {message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isUploading}
        className="mt-6 rounded-md bg-[#147d64] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0f604d] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isUploading ? "Uploading..." : "Upload and attach file"}
      </button>
    </form>
  );
}
