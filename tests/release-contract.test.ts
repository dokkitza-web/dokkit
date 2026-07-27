import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

function source(path: string) {
  return readFileSync(join(process.cwd(), path), "utf8");
}

test("checkout requires approved acceptance and a server-verified total", () => {
  const api = source("src/app/api/checkout/route.ts");
  const page = source("src/app/checkout/checkout-page.tsx");

  assert.match(api, /policyAccepted:\s*z\.literal\(true\)/);
  assert.match(api, /quotedTotalCents !== totalCents/);
  assert.match(api, /policy_bundle_version:\s*POLICY_BUNDLE_VERSION/);
  assert.match(api, /checkout_attempt_id:\s*checkoutAttemptId/);
  assert.match(page, /type="checkbox"/);
  assert.match(page, /required/);
  assert.match(page, /Pay securely with PayFast —/);
  assert.doesNotMatch(page, /useState\(true\).*policyAccepted/);
});

test("payment and download URLs do not expose the order access code", () => {
  const payfast = source("src/lib/payfast.ts");
  const emails = source("src/lib/emails.ts");
  const downloads = source("src/app/api/downloads/route.ts");

  assert.doesNotMatch(payfast, /[?&]access=/);
  assert.doesNotMatch(emails, /[?&]access=/);
  assert.doesNotMatch(downloads, /api\/downloads\/\$\{/);
  assert.equal(
    existsSync(join(process.cwd(), "src/app/api/downloads/[token]/route.ts")),
    false,
  );
});

test("migration atomically finalises payment and claims order downloads", () => {
  const migration = source(
    "supabase/migrations/202607270001_approved_legal_policy.sql",
  );

  assert.match(migration, /finalise_verified_payfast_order/);
  assert.match(migration, /claim_authorised_download/);
  assert.match(migration, /access_expires_at/);
  assert.match(migration, /successful_downloads/);
  assert.match(migration, /download_limit = 5/);
  assert.match(migration, /download_access_token_hash/);
  assert.match(migration, /download_access_token_ciphertext/);
  assert.match(migration, /email_logs_order_template_sent_idx/);
  assert.match(migration, /interval '7 days'/);
  assert.match(
    migration,
    /status in \('pending_payment', 'cancelled', 'failed'\)/,
  );
  assert.match(migration, /record_order_refund_status/);
  assert.match(migration, /consent_records/);
});

test("Meta server events require the latest recorded marketing consent", () => {
  const metaRoute = source("src/app/api/analytics/meta/route.ts");
  const itnRoute = source("src/app/api/payfast/itn/route.ts");

  assert.match(metaRoute, /hasMarketingConsent/);
  assert.match(metaRoute, /consent_records/);
  assert.match(metaRoute, /marketing_allowed/);
  assert.match(itnRoute, /consent_key_hash/);
  assert.match(itnRoute, /marketing_allowed !== true/);
  assert.doesNotMatch(metaRoute, /email_address|phone_number|accessToken/);
});

test("admin operations support 12-month reissue and auditable refund updates", () => {
  const actions = source("src/app/admin/orders/actions.ts");

  assert.match(actions, /setUTCFullYear/);
  assert.match(actions, /order_access_reissued/);
  assert.match(actions, /record_order_refund_status/);
  assert.match(actions, /sendRefundStatusEmail/);
});

test("legal pages are discoverable and provide a print-friendly version", () => {
  const sitemap = source("src/app/sitemap.ts");
  const robots = source("src/app/robots.ts");
  const styles = source("src/app/globals.css");

  for (const route of [
    "/terms",
    "/licence",
    "/digital-delivery",
    "/refunds",
    "/privacy",
    "/contact",
  ]) {
    assert.match(sitemap, new RegExp(route.replace("/", "\\/")));
  }

  assert.match(robots, /sitemap/i);
  assert.match(styles, /@media print/);
  assert.match(styles, /\.legal-page/);
});

test("product pages carry the approved purchase information box", () => {
  const industryPage = source("src/app/industries/[slug]/page.tsx");
  const singleDocumentsPage = source("src/app/single-documents/page.tsx");
  const informationBox = source("src/components/product-information-box.tsx");

  assert.match(industryPage, /ProductInformationBox/);
  assert.match(singleDocumentsPage, /ProductInformationBox/);
  assert.match(informationBox, /PRODUCT_INFORMATION_COPY/);
  assert.match(informationBox, /\/licence/);
  assert.match(informationBox, /\/digital-delivery/);
  assert.match(informationBox, /\/refunds/);
});
