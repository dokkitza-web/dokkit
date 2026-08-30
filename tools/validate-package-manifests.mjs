#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const manifestPath = path.join(
  projectRoot,
  "src",
  "data",
  "package-manifests.generated.json",
);

const manifests = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const supportedFormats = new Set(["DOCX", "XLSX", "PDF", "TXT"]);
const tiers = ["starter", "professional", "complete"];
const normaliseFilename = (value) =>
  path
    .basename(value)
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/^\d+[_\s-]+/, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\b(starter|professional|complete|essential|v\d+)\b/g, "")
    .trim();

const errors = [];
const slugs = new Set();

for (const manifest of manifests) {
  if (!manifest.slug || slugs.has(manifest.slug)) {
    errors.push(
      `Duplicate or missing product slug: ${manifest.slug || "(missing)"}`,
    );
  }
  slugs.add(manifest.slug);

  if (
    !manifest.industrySlug ||
    !tiers.includes(manifest.tierKey) ||
    !Number.isInteger(manifest.priceCents) ||
    manifest.priceCents <= 0
  ) {
    errors.push(`${manifest.slug}: missing industry, tier, or valid price.`);
  }

  if (!Array.isArray(manifest.files) || !manifest.files.length) {
    errors.push(`${manifest.slug}: manifest has no files.`);
    continue;
  }

  const filePaths = new Set();
  for (const file of manifest.files) {
    const pathKey = file.path?.toLowerCase();
    if (!pathKey || filePaths.has(pathKey)) {
      errors.push(
        `${manifest.slug}: duplicate or missing filename ${
          file.path || "(missing)"
        }.`,
      );
    }
    filePaths.add(pathKey);

    if (!file.name || !file.group || !supportedFormats.has(file.format)) {
      errors.push(
        `${manifest.slug}: incomplete file record for ${
          file.path || "(missing)"
        }.`,
      );
    }
  }
}

for (const industrySlug of new Set(
  manifests.map((item) => item.industrySlug),
)) {
  const industryManifests = manifests.filter(
    (item) => item.industrySlug === industrySlug,
  );
  const byTier = new Map(
    industryManifests.map((manifest) => [manifest.tierKey, manifest]),
  );
  const lowerTier =
    byTier.get("starter") ??
    industryManifests.find((manifest) => manifest.tierLabel === "Essential");
  const professional = byTier.get("professional");
  const complete = byTier.get("complete");

  const assertIncludes = (parent, child) => {
    if (!parent || !child) return;
    const parentFiles = new Set(
      parent.files.map((file) => normaliseFilename(file.path)),
    );
    const missing = child.files
      .map((file) => normaliseFilename(file.path))
      .filter((file) => !parentFiles.has(file));
    if (missing.length) {
      errors.push(
        `${parent.slug}: does not include ${missing.length} file(s) from ${
          child.slug
        }: ${missing.join(", ")}.`,
      );
    }
  };

  assertIncludes(professional, lowerTier);
  assertIncludes(complete, professional ?? lowerTier);
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  const fileCount = manifests.reduce(
    (total, manifest) => total + manifest.files.length,
    0,
  );
  console.log(
    `Validated ${manifests.length} package manifests containing ${fileCount} files.`,
  );
}
