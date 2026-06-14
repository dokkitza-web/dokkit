import crypto from "node:crypto";

export const DOWNLOAD_LINK_TTL_SECONDS = 10 * 60;
export const SUPABASE_SIGNED_URL_TTL_SECONDS = 60;

export function createDownloadAccessToken() {
  return crypto.randomBytes(32).toString("base64url");
}

export function hashDownloadToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function verifyDownloadAccessToken({
  suppliedToken,
  storedHash,
}: {
  suppliedToken?: string | null;
  storedHash?: string | null;
}) {
  if (!suppliedToken || !storedHash) {
    return false;
  }

  const suppliedHash = hashDownloadToken(suppliedToken);

  return crypto.timingSafeEqual(
    Buffer.from(suppliedHash, "hex"),
    Buffer.from(storedHash, "hex"),
  );
}

export function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const firstForwardedIp = forwardedFor?.split(",")[0]?.trim();

  return firstForwardedIp || realIp || null;
}

export function createDownloadFileName({
  productSlug,
  fileKind,
  versionLabel,
}: {
  productSlug: string;
  fileKind: string;
  versionLabel: string;
}) {
  const cleanSlug = productSlug
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const cleanVersion = versionLabel
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${cleanSlug || "dokkit-file"}-${cleanVersion || "v1"}.${fileKind}`;
}
