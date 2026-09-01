import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

test("mobile cookie consent stays compact without removing privacy choices", () => {
  const provider = readFileSync(
    join(process.cwd(), "src/components/analytics-provider.tsx"),
    "utf8",
  );

  assert.match(provider, /Essential storage runs the cart and checkout/);
  assert.match(provider, /Analytics and\s+marketing only run with your permission/);
  assert.match(provider, /className="text-xs leading-4 text-\[#5f5f66\] sm:hidden"/);
  assert.match(provider, /className="hidden sm:block"/);
  assert.match(provider, /safe-area-inset-bottom/);
  assert.match(provider, />\s*Essential only\s*</);
  assert.match(provider, />\s*Manage\s*</);
  assert.match(provider, />\s*Accept all\s*</);
});
