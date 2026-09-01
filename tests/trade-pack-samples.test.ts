import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { tradePacks } from "../src/data/trade-packs";

test("trade pack cards use the approved file counts", () => {
  assert.deepEqual(
    Object.fromEntries(
      tradePacks.map((pack) => [
        pack.slug,
        [pack.documentCount, pack.workbookCount, pack.pdfCount],
      ]),
    ),
    {
      "electrical-contractor-pack": [4, 1, 5],
      "plumbing-contractor-pack": [5, 1, 6],
      "solar-installer-pack": [5, 1, 6],
      "electric-fence-installer-pack": [5, 1, 6],
    },
  );
});

test("every live trade pack has four separate, watermarked preview images", () => {
  assert.equal(tradePacks.length, 4);

  for (const pack of tradePacks) {
    assert.equal(pack.samples.length, 4, `${pack.slug} needs four samples`);
    for (const sample of pack.samples) {
      assert.match(sample.previewImageSrc, /^\/samples\/trade-packs\//);
      assert.match(sample.previewImageSrc, /-sample\.png$/);
      assert.doesNotMatch(sample.previewImageSrc, /\.(docx|xlsx|zip)$/i);
      assert.equal(
        existsSync(join(process.cwd(), "public", sample.previewImageSrc)),
        true,
        `${sample.previewImageSrc} is missing`,
      );
    }
  }
});

test("sample previews use the accessible modal and never link to delivery assets", () => {
  const preview = readFileSync(
    join(process.cwd(), "src/components/trade-pack-sample-preview.tsx"),
    "utf8",
  );
  const detailPage = readFileSync(
    join(process.cwd(), "src/app/packages/[slug]/page.tsx"),
    "utf8",
  );
  const generator = readFileSync(
    join(process.cwd(), "tools/generate_trade_pack_samples.py"),
    "utf8",
  );

  assert.match(preview, /role="dialog"/);
  assert.match(preview, /event\.key === "Escape"/);
  assert.match(preview, /aria-modal="true"/);
  assert.match(preview, /This is a watermarked sample/);
  assert.match(detailPage, /id="preview-the-pack"/);
  assert.match(detailPage, /TradePackSamplePreview/);
  assert.match(generator, /DOKKIT SAMPLE - NOT FOR USE/);
  assert.match(generator, /actual protected trade-pack templates/);
});
