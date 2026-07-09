"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/supabase/admin";

const fileStatusSchema = z.object({
  fileId: z.uuid(),
  productId: z.uuid().optional(),
  isActive: z.enum(["true", "false"]),
});

const fileDeleteSchema = z.object({
  fileId: z.uuid(),
  productId: z.uuid().optional(),
});

export async function updateProductFileStatus(formData: FormData) {
  const parsed = fileStatusSchema.safeParse({
    fileId: formData.get("fileId"),
    productId: formData.get("productId") || undefined,
    isActive: formData.get("isActive"),
  });

  if (!parsed.success) {
    return;
  }

  const { supabase } = await requireAdmin();

  await supabase
    .from("product_files")
    .update({
      is_active: parsed.data.isActive === "true",
    })
    .eq("id", parsed.data.fileId);

  revalidatePath("/admin/files");
  revalidatePath("/admin/products");

  if (parsed.data.productId) {
    revalidatePath(`/admin/products/${parsed.data.productId}`);
  }
}

export async function deleteProductFile(formData: FormData) {
  const parsed = fileDeleteSchema.safeParse({
    fileId: formData.get("fileId"),
    productId: formData.get("productId") || undefined,
  });

  if (!parsed.success) {
    return;
  }

  const { supabase } = await requireAdmin();
  const { data: file } = await supabase
    .from("product_files")
    .select("id,storage_bucket,storage_path")
    .eq("id", parsed.data.fileId)
    .single();

  if (!file) {
    return;
  }

  const { error: storageError } = await supabase.storage
    .from(file.storage_bucket)
    .remove([file.storage_path]);

  if (storageError) {
    throw new Error(storageError.message);
  }

  const { error: deleteError } = await supabase
    .from("product_files")
    .delete()
    .eq("id", parsed.data.fileId);

  if (deleteError) {
    throw new Error(deleteError.message);
  }

  revalidatePath("/admin/files");
  revalidatePath("/admin/products");

  if (parsed.data.productId) {
    revalidatePath(`/admin/products/${parsed.data.productId}`);
  }
}
