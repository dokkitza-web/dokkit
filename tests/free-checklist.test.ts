import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const projectRoot = process.cwd();
const freeDownloadRoot = path.join(
  projectRoot,
  "public",
  "downloads",
  "free",
);
const previewRoot = path.join(
  projectRoot,
  "public",
  "images",
  "free-checklist",
);

test("free checklist publishes the approved PDF, Word file and six previews", async () => {
  const pdf = await readFile(
    path.join(
      freeDownloadRoot,
      "DokKit-Free-Small-Business-Administration-Readiness-Checklist-Fillable.pdf",
    ),
  );
  const docx = await readFile(
    path.join(
      freeDownloadRoot,
      "DokKit-Free-Small-Business-Administration-Readiness-Checklist.docx",
    ),
  );

  assert.equal(pdf.subarray(0, 4).toString("ascii"), "%PDF");
  assert.equal(docx.subarray(0, 2).toString("ascii"), "PK");

  for (let page = 1; page <= 6; page += 1) {
    const preview = await readFile(path.join(previewRoot, `page-${page}.png`));
    assert.deepEqual(
      [...preview.subarray(0, 8)],
      [137, 80, 78, 71, 13, 10, 26, 10],
    );
  }
});

test("free checklist page links to both approved download formats", async () => {
  const pageSource = await readFile(
    path.join(
      projectRoot,
      "src",
      "app",
      "free-business-admin-checklist",
      "page.tsx",
    ),
    "utf8",
  );

  assert.match(
    pageSource,
    /DokKit-Free-Small-Business-Administration-Readiness-Checklist-Fillable\.pdf/,
  );
  assert.match(
    pageSource,
    /DokKit-Free-Small-Business-Administration-Readiness-Checklist\.docx/,
  );
});
