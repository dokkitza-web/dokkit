const DEFAULT_SITE_URL = "http://localhost:3000";

export function getSiteUrl() {
  const rawValue = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (!rawValue) {
    return DEFAULT_SITE_URL;
  }

  const valueWithProtocol = /^https?:\/\//i.test(rawValue)
    ? rawValue
    : `https://${rawValue}`;

  try {
    const url = new URL(valueWithProtocol);
    return url.origin;
  } catch {
    return DEFAULT_SITE_URL;
  }
}

export function getSiteUrlObject() {
  return new URL(getSiteUrl());
}
