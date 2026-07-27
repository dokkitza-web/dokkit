import crypto from "node:crypto";

export const CONSENT_COOKIE_NAME = "dokkit_consent_record";

export function createConsentKey() {
  return crypto.randomBytes(24).toString("base64url");
}

export function hashConsentKey(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export function readCookie(request: Request, name: string) {
  const cookieHeader = request.headers.get("cookie") ?? "";

  for (const part of cookieHeader.split(";")) {
    const [rawName, ...rawValue] = part.trim().split("=");

    if (rawName === name) {
      try {
        return decodeURIComponent(rawValue.join("="));
      } catch {
        return null;
      }
    }
  }

  return null;
}
