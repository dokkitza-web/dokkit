export function requiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function optionalEnv(name: string, fallback: string): string {
  return process.env[name] || fallback;
}

function optionalIntegerEnv(name: string, fallback: number): number {
  const value = process.env[name];

  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);

  if (Number.isNaN(parsed)) {
    throw new Error(`Environment variable ${name} must be a number.`);
  }

  return parsed;
}

function defaultPayfastValidateUrl(processUrl: string) {
  return processUrl.includes("sandbox")
    ? "https://sandbox.payfast.co.za/eng/query/validate"
    : "https://www.payfast.co.za/eng/query/validate";
}

export function getServerEnv() {
  const siteUrl = requiredEnv("NEXT_PUBLIC_SITE_URL").replace(/\/$/, "");
  const payfastProcessUrl = optionalEnv(
    "PAYFAST_PROCESS_URL",
    "https://sandbox.payfast.co.za/eng/process",
  );

  return {
    siteUrl,
    supabaseUrl: requiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
    supabaseServiceRoleKey: requiredEnv("SUPABASE_SERVICE_ROLE_KEY"),
    payfastMerchantId: requiredEnv("PAYFAST_MERCHANT_ID"),
    payfastMerchantKey: requiredEnv("PAYFAST_MERCHANT_KEY"),
    payfastPassphrase: optionalEnv("PAYFAST_PASSPHRASE", ""),
    payfastProcessUrl,
    payfastValidateUrl: optionalEnv(
      "PAYFAST_VALIDATE_URL",
      defaultPayfastValidateUrl(payfastProcessUrl),
    ),
    payfastAllowedIps: optionalEnv(
      "PAYFAST_ALLOWED_IPS",
      "197.97.145.144/28,41.74.179.192/27,102.216.36.0/28,102.216.36.128/28,144.126.193.139",
    ),
    payfastRequireIpMatch:
      optionalEnv("PAYFAST_REQUIRE_IP_MATCH", "true") !== "false",
  };
}

export function getEmailEnv() {
  return {
    resendApiKey: requiredEnv("RESEND_API_KEY"),
    resendFromEmail: requiredEnv("RESEND_FROM_EMAIL"),
  };
}

export function getDownloadEnv() {
  return {
    siteUrl: requiredEnv("NEXT_PUBLIC_SITE_URL").replace(/\/$/, ""),
    downloadLinkTtlHours: optionalIntegerEnv("DOWNLOAD_LINK_TTL_HOURS", 168),
    downloadLinkMaxUses: optionalIntegerEnv("DOWNLOAD_LINK_MAX_USES", 5),
  };
}
