import { NextResponse } from "next/server";
import { z } from "zod";
import { POLICY_BUNDLE_VERSION } from "@/data/legal-policies";
import {
  CONSENT_COOKIE_NAME,
  createConsentKey,
  hashConsentKey,
  readCookie,
} from "@/lib/consent";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

const consentSchema = z.object({
  analytics: z.boolean(),
  marketing: z.boolean(),
});

function getClientIp(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    null
  );
}

export async function POST(request: Request) {
  const parsedBody = consentSchema.safeParse(await request.json());

  if (!parsedBody.success) {
    return NextResponse.json({ saved: false }, { status: 400 });
  }

  const existingKey = readCookie(request, CONSENT_COOKIE_NAME);
  const consentKey = existingKey ?? createConsentKey();
  const supabase = createSupabaseServiceClient();
  const { error } = await supabase.from("consent_records").insert({
    consent_key_hash: hashConsentKey(consentKey),
    analytics_allowed: parsedBody.data.analytics,
    marketing_allowed: parsedBody.data.marketing,
    policy_bundle_version: POLICY_BUNDLE_VERSION,
    ip_address: getClientIp(request),
    user_agent: request.headers.get("user-agent")?.slice(0, 1000) ?? null,
  });

  if (error) {
    return NextResponse.json({ saved: false }, { status: 503 });
  }

  const response = NextResponse.json({ saved: true });

  if (!existingKey) {
    response.cookies.set(CONSENT_COOKIE_NAME, consentKey, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 365 * 24 * 60 * 60,
    });
  }

  return response;
}
