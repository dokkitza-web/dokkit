import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { verifyFreeChecklistToken } from "@/lib/free-checklist-downloads";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const fileDetails = {
  pdf: {
    path: "DokKit-Free-Small-Business-Administration-Readiness-Checklist-Fillable.pdf",
    name: "DokKit-Free-Small-Business-Administration-Readiness-Checklist-Fillable.pdf",
    contentType: "application/pdf",
    downloadedColumn: "pdf_downloaded_at",
  },
  docx: {
    path: "DokKit-Free-Small-Business-Administration-Readiness-Checklist.docx",
    name: "DokKit-Free-Small-Business-Administration-Readiness-Checklist.docx",
    contentType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    downloadedColumn: "docx_downloaded_at",
  },
} as const;

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token");
  const payload = token ? verifyFreeChecklistToken(token) : null;

  if (!payload) {
    return NextResponse.json(
      { error: "This download link is invalid or has expired." },
      { status: 401 },
    );
  }

  const details = fileDetails[payload.format];
  const filePath = path.join(
    process.cwd(),
    "private",
    "free-checklist",
    details.path,
  );

  try {
    const file = await readFile(filePath);
    const supabase = createSupabaseServiceClient();
    const { error } = await supabase
      .from("free_checklist_leads")
      .update({ [details.downloadedColumn]: new Date().toISOString() })
      .eq("id", payload.leadId);

    if (error) {
      console.error("Unable to record free checklist download.", error);
    }

    return new NextResponse(file, {
      headers: {
        "Cache-Control": "private, no-store, max-age=0",
        "Content-Disposition": `attachment; filename="${details.name}"`,
        "Content-Length": file.length.toString(),
        "Content-Type": details.contentType,
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Unable to serve free checklist download.", error);

    return NextResponse.json(
      { error: "The file is temporarily unavailable." },
      { status: 503 },
    );
  }
}
