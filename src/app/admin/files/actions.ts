"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/supabase/admin";

const fileStatusSchema = z.object({
  fileId: z.uuid(),
  isActive: z.enum(["true", "false"]),
});

export async function updateProductFileStatus(formData: FormData) {
  const parsed = fileStatusSchema.safeParse({
    fileId: formData.get("fileId"),
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
}
