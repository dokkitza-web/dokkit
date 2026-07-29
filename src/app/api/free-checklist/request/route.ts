import { NextResponse } from "next/server";
import { z } from "zod";
import { POLICY_BUNDLE_VERSION } from "@/data/legal-policies";
import { createFreeChecklistToken } from "@/lib/free-checklist-downloads";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

const requestSchema = z.object({
  fullName: z.string().trim().min(2).max(100),
  businessName: z.string().trim().min(2).max(140),
  email: z.email().max(254),
  province: z.string().trim().min(2).max(50),
  industry: z.string().trim().min(2).max(120),
  selectedFormat: z.enum(["pdf", "docx"]),
  privacyAccepted: z.literal(true),
  marketingConsent: z.boolean().default(false),
  website: z.string().max(0).optional(),
  utmSource: z.string().trim().max(120).optional(),
  utmMedium: z.string().trim().max(120).optional(),
  utmCampaign: z.string().trim().max(120).optional(),
});

function cleanOptionalValue(value?: string) {
  return value || null;
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Please check the form and try again." },
      { status: 400 },
    );
  }

  const parsedBody = requestSchema.safeParse(body);

  if (!parsedBody.success || parsedBody.data.website) {
    return NextResponse.json(
      { error: "Please complete all required fields correctly." },
      { status: 400 },
    );
  }

  const data = parsedBody.data;
  const supabase = createSupabaseServiceClient();
  const normalizedEmail = data.email.trim().toLowerCase();
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const { count } = await supabase
    .from("free_checklist_leads")
    .select("id", { count: "exact", head: true })
    .eq("email", normalizedEmail)
    .gte("created_at", tenMinutesAgo);

  if ((count ?? 0) >= 5) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a few minutes and try again." },
      { status: 429 },
    );
  }

  const { data: lead, error } = await supabase
    .from("free_checklist_leads")
    .insert({
      full_name: data.fullName,
      business_name: data.businessName,
      email: normalizedEmail,
      province: data.province,
      industry: data.industry,
      selected_format: data.selectedFormat,
      marketing_consent: data.marketingConsent,
      privacy_accepted_at: new Date().toISOString(),
      policy_bundle_version: POLICY_BUNDLE_VERSION,
      source_path: "/free-business-admin-checklist",
      utm_source: cleanOptionalValue(data.utmSource),
      utm_medium: cleanOptionalValue(data.utmMedium),
      utm_campaign: cleanOptionalValue(data.utmCampaign),
    })
    .select("id")
    .single();

  if (error || !lead) {
    console.error("Unable to save free checklist request.", error);

    return NextResponse.json(
      { error: "The download could not be prepared. Please try again shortly." },
      { status: 503 },
    );
  }

  const pdfToken = createFreeChecklistToken({
    leadId: lead.id,
    format: "pdf",
  });
  const docxToken = createFreeChecklistToken({
    leadId: lead.id,
    format: "docx",
  });

  return NextResponse.json(
    {
      downloads: {
        pdf: `/api/free-checklist/download?token=${encodeURIComponent(pdfToken)}`,
        docx: `/api/free-checklist/download?token=${encodeURIComponent(docxToken)}`,
      },
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
