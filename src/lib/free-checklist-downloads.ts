import crypto from "node:crypto";

export const FREE_CHECKLIST_TOKEN_TTL_SECONDS = 15 * 60;

export type FreeChecklistFormat = "pdf" | "docx";

type FreeChecklistTokenPayload = {
  leadId: string;
  format: FreeChecklistFormat;
  expiresAt: number;
};

function getTokenSecret() {
  const secret =
    process.env.DOWNLOAD_TOKEN_ENCRYPTION_KEY ??
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!secret) {
    throw new Error(
      "Missing DOWNLOAD_TOKEN_ENCRYPTION_KEY or SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  return secret;
}

function sign(encodedPayload: string) {
  return crypto
    .createHmac("sha256", getTokenSecret())
    .update(encodedPayload)
    .digest("base64url");
}

export function createFreeChecklistToken({
  leadId,
  format,
  now = Date.now(),
}: {
  leadId: string;
  format: FreeChecklistFormat;
  now?: number;
}) {
  const payload: FreeChecklistTokenPayload = {
    leadId,
    format,
    expiresAt: Math.floor(now / 1000) + FREE_CHECKLIST_TOKEN_TTL_SECONDS,
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
    "base64url",
  );

  return `${encodedPayload}.${sign(encodedPayload)}`;
}

export function verifyFreeChecklistToken(
  token: string,
  now = Date.now(),
): FreeChecklistTokenPayload | null {
  const [encodedPayload, suppliedSignature, extraPart] = token.split(".");

  if (!encodedPayload || !suppliedSignature || extraPart) {
    return null;
  }

  const expectedSignature = sign(encodedPayload);
  const suppliedBuffer = Buffer.from(suppliedSignature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    suppliedBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(suppliedBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8"),
    ) as Partial<FreeChecklistTokenPayload>;

    if (
      typeof payload.leadId !== "string" ||
      !["pdf", "docx"].includes(payload.format ?? "") ||
      typeof payload.expiresAt !== "number" ||
      payload.expiresAt < Math.floor(now / 1000)
    ) {
      return null;
    }

    return payload as FreeChecklistTokenPayload;
  } catch {
    return null;
  }
}
