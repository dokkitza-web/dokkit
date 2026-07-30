import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const projectRoot = process.cwd();

test("pricing section follows the approved package-level recommendation", async () => {
  const source = await readFile(
    path.join(
      projectRoot,
      "src",
      "components",
      "admin-pack-pricing-section-client.tsx",
    ),
    "utf8",
  );

  assert.match(
    source,
    /How much admin support does your business need\?/,
  );
  assert.match(source, /Recommended for growing businesses/);
  assert.match(source, /Run jobs with less admin/);
  assert.match(source, /getLaunchOfferPricing/);
  assert.match(source, /View \{tier\.name\} packs/);
  assert.match(source, /Download after verified payment/);
  assert.doesNotMatch(source, /Most comprehensive/);
  assert.doesNotMatch(source, /Select industry first/);
});
