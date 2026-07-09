"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/supabase/admin";

const productDetailsSchema = z.object({
  productId: z.uuid(),
  industryId: z.string().trim(),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  name: z.string().trim().min(2).max(160),
  description: z.string().trim().min(5).max(1000),
  packageTier: z.enum(["", "starter", "professional", "complete"]),
  price: z.string().trim(),
  documentCount: z.coerce.number().int().min(0).max(999),
  workbookCount: z.coerce.number().int().min(0).max(999),
  pdfCount: z.coerce.number().int().min(0).max(999),
});

const packageTierPricingSchema = z.object({
  tierKey: z.enum(["starter", "professional", "complete"]),
  name: z.string().trim().min(2).max(80),
  summary: z.string().trim().min(5).max(500),
  price: z.string().trim(),
  documentCount: z.coerce.number().int().min(0).max(999),
  workbookCount: z.coerce.number().int().min(0).max(999),
  pdfCount: z.coerce.number().int().min(0).max(999),
});

function parsePriceCents(value: string) {
  const normalizedValue = value.replace(",", ".");

  if (!/^\d+(?:\.\d{1,2})?$/.test(normalizedValue)) {
    throw new Error("Enter a valid price, for example 249 or 249.00.");
  }

  return Math.round(Number(normalizedValue) * 100);
}

function formatRedirectError(error: unknown) {
  return encodeURIComponent(
    error instanceof Error ? error.message : "The admin update failed.",
  );
}

function revalidateCatalogue() {
  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath("/packages");
  revalidatePath("/single-documents");
  revalidatePath("/industries");
}

export async function updateProductDetails(formData: FormData) {
  const parsed = productDetailsSchema.safeParse({
    productId: formData.get("productId"),
    industryId: formData.get("industryId") ?? "",
    slug: formData.get("slug"),
    name: formData.get("name"),
    description: formData.get("description"),
    packageTier: formData.get("packageTier") ?? "",
    price: formData.get("price"),
    documentCount: formData.get("documentCount"),
    workbookCount: formData.get("workbookCount"),
    pdfCount: formData.get("pdfCount"),
  });

  const productId =
    typeof formData.get("productId") === "string"
      ? String(formData.get("productId"))
      : "";

  if (!parsed.success) {
    redirect(`/admin/products/${productId}?error=invalid-product`);
  }

  try {
    const { supabase } = await requireAdmin();
    const priceCents = parsePriceCents(parsed.data.price);
    const industryId = parsed.data.industryId || null;
    const packageTier = parsed.data.packageTier || null;
    const isLive = formData.get("isLive") === "on";
    const { error } = await supabase
      .from("products")
      .update({
        industry_id: industryId,
        slug: parsed.data.slug,
        name: parsed.data.name,
        description: parsed.data.description,
        package_tier: packageTier,
        price_cents: priceCents,
        document_count: parsed.data.documentCount,
        workbook_count: parsed.data.workbookCount,
        pdf_count: parsed.data.pdfCount,
        is_live: isLive,
        updated_at: new Date().toISOString(),
      })
      .eq("id", parsed.data.productId);

    if (error) {
      throw new Error(error.message);
    }

    revalidateCatalogue();
    revalidatePath(`/admin/products/${parsed.data.productId}`);
  } catch (error) {
    redirect(
      `/admin/products/${productId}?error=${formatRedirectError(error)}`,
    );
  }

  redirect(`/admin/products/${parsed.data.productId}?updated=product`);
}

export async function updatePackageTierPricing(formData: FormData) {
  const parsed = packageTierPricingSchema.safeParse({
    tierKey: formData.get("tierKey"),
    name: formData.get("name"),
    summary: formData.get("summary"),
    price: formData.get("price"),
    documentCount: formData.get("documentCount"),
    workbookCount: formData.get("workbookCount"),
    pdfCount: formData.get("pdfCount"),
  });
  const productId =
    typeof formData.get("productId") === "string"
      ? String(formData.get("productId"))
      : "";

  if (!parsed.success) {
    redirect(`/admin/products/${productId}?error=invalid-tier`);
  }

  try {
    const { supabase } = await requireAdmin();
    const priceCents = parsePriceCents(parsed.data.price);
    const isLive = formData.get("isLive") === "on";
    const now = new Date().toISOString();
    const { error: tierError } = await supabase
      .from("package_tiers")
      .update({
        name: parsed.data.name,
        summary: parsed.data.summary,
        price_cents: priceCents,
        document_count: parsed.data.documentCount,
        workbook_count: parsed.data.workbookCount,
        pdf_count: parsed.data.pdfCount,
        is_live: isLive,
        updated_at: now,
      })
      .eq("tier_key", parsed.data.tierKey);

    if (tierError) {
      throw new Error(tierError.message);
    }

    const { error: productsError } = await supabase
      .from("products")
      .update({
        price_cents: priceCents,
        document_count: parsed.data.documentCount,
        workbook_count: parsed.data.workbookCount,
        pdf_count: parsed.data.pdfCount,
        is_live: isLive,
        updated_at: now,
      })
      .eq("product_type", "industry_package")
      .eq("package_tier", parsed.data.tierKey);

    if (productsError) {
      throw new Error(productsError.message);
    }

    revalidateCatalogue();
    revalidatePath(`/admin/products/${productId}`);
  } catch (error) {
    redirect(
      `/admin/products/${productId}?error=${formatRedirectError(error)}`,
    );
  }

  redirect(`/admin/products/${productId}?updated=tier`);
}
