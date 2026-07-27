import crypto from "node:crypto";

export const DOWNLOAD_LINK_TTL_SECONDS = 10 * 60;
export const SUPABASE_SIGNED_URL_TTL_SECONDS = 60;
export const ORDER_ACCESS_TTL_SECONDS = 7 * 24 * 60 * 60;
export const ORDER_DOWNLOAD_LIMIT = 5;
export const ACCESS_REISSUE_SUPPORT_SECONDS = 365 * 24 * 60 * 60;

function getDownloadTokenSecret() {
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

function getEncryptionKey() {
  return crypto.createHash("sha256").update(getDownloadTokenSecret()).digest();
}

export function createOrderAccessToken() {
  return crypto.randomBytes(24).toString("base64url");
}

export function verifyOrderAccessToken({
  suppliedToken,
  storedHash,
}: {
  suppliedToken?: string | null;
  storedHash?: string | null;
}) {
  return verifyDownloadAccessToken({ suppliedToken, storedHash });
}

export function createDownloadAccessToken() {
  return crypto.randomBytes(32).toString("base64url");
}

export function hashDownloadToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function encryptDownloadAccessToken(token: string) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getEncryptionKey(), iv);
  const ciphertext = Buffer.concat([
    cipher.update(token, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return [
    iv.toString("base64url"),
    authTag.toString("base64url"),
    ciphertext.toString("base64url"),
  ].join(".");
}

export function decryptDownloadAccessToken(ciphertextValue?: string | null) {
  if (!ciphertextValue) {
    return null;
  }

  const [ivValue, authTagValue, encryptedValue] = ciphertextValue.split(".");

  if (!ivValue || !authTagValue || !encryptedValue) {
    return null;
  }

  try {
    const decipher = crypto.createDecipheriv(
      "aes-256-gcm",
      getEncryptionKey(),
      Buffer.from(ivValue, "base64url"),
    );
    decipher.setAuthTag(Buffer.from(authTagValue, "base64url"));

    return Buffer.concat([
      decipher.update(Buffer.from(encryptedValue, "base64url")),
      decipher.final(),
    ]).toString("utf8");
  } catch {
    return null;
  }
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

export function createOrderAccessCookieName(orderNumber: string) {
  const suffix = crypto
    .createHash("sha256")
    .update(orderNumber)
    .digest("hex")
    .slice(0, 16);

  return `dokkit_order_access_${suffix}`;
}

export function getOrderAccessTokenFromRequest(
  request: Request,
  orderNumber: string,
) {
  const cookieName = createOrderAccessCookieName(orderNumber);
  const cookieHeader = request.headers.get("cookie") ?? "";

  for (const part of cookieHeader.split(";")) {
    const [rawName, ...rawValue] = part.trim().split("=");

    if (rawName === cookieName) {
      try {
        return decodeURIComponent(rawValue.join("="));
      } catch {
        return null;
      }
    }
  }

  return null;
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
