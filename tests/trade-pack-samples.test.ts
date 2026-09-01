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

test("every live trade pack previews each original Word document and the workbook Start Here sheet", () => {
  assert.equal(tradePacks.length, 4);

  for (const pack of tradePacks) {
    assert.equal(
      pack.samples.length,
      pack.documentCount + pack.workbookCount,
      `${pack.slug} needs a preview for every original template`,
    );
    const workbookSample = pack.samples.find((sample) => sample.id === "admin-workbook");
    assert.ok(workbookSample, `${pack.slug} needs a workbook preview`);
    assert.match(workbookSample.title, /Start Here/);
    assert.match(workbookSample.description, /Start Here/);
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
  assert.match(generator, /private" \/ "product-packs/);
  assert.match(detailPage, /Preview every original template before you buy/);
});

test("the homepage exposes every trade pack through an accessible real-file preview selector", () => {
  const homepage = readFileSync(join(process.cwd(), "src/app/page.tsx"), "utf8");
  const homepagePreviews = readFileSync(
    join(process.cwd(), "src/components/homepage-trade-pack-previews.tsx"),
    "utf8",
  );

  assert.match(homepage, /id="real-file-previews"/);
  assert.match(homepage, /See exactly what you are buying/);
  assert.match(homepage, /HomepageTradePackPreviews packs=\{homepagePreviewPacks\}/);
  assert.match(homepagePreviews, /role="tablist"/);
  assert.match(homepagePreviews, /role="tab"/);
  assert.match(homepagePreviews, /role="tabpanel"/);
  assert.match(homepagePreviews, /event\.key === "ArrowRight"/);
  assert.match(homepagePreviews, /tabIndex=\{isSelected \? 0 : -1\}/);
  assert.match(homepagePreviews, /TradePackSamplePreview pack=\{selectedPack\}/);
  assert.match(homepagePreviews, /selectedPack\.samples\.length/);
});
