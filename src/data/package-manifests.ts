import generatedManifests from "@/data/package-manifests.generated.json";
import type { PackageTierKey } from "@/data/catalogue";

export type PackageManifestFile = {
  path: string;
  name: string;
  format: "DOCX" | "XLSX" | "PDF";
  group: string;
};

export type PackageManifest = {
  slug: string;
  industrySlug: string;
  tierKey: PackageTierKey;
  tierLabel: string;
  name: string;
  priceCents: number;
  sourceArchive: string;
  files: PackageManifestFile[];
};

export type PackageManifestGroup = {
  name: string;
  files: PackageManifestFile[];
};

const tierOrder = new Map<PackageTierKey, number>([
  ["starter", 0],
  ["professional", 1],
  ["complete", 2],
]);

export const packageManifests = generatedManifests as PackageManifest[];

export function getIndustryPackageManifests(industrySlug: string) {
  return packageManifests
    .filter((manifest) => manifest.industrySlug === industrySlug)
    .sort(
      (left, right) =>
        (tierOrder.get(left.tierKey) ?? Number.MAX_SAFE_INTEGER) -
        (tierOrder.get(right.tierKey) ?? Number.MAX_SAFE_INTEGER),
    );
}

export function getPackageManifestGroups(
  manifest: PackageManifest,
): PackageManifestGroup[] {
  const groups = new Map<string, PackageManifestFile[]>();

  manifest.files.forEach((file) => {
    const groupFiles = groups.get(file.group) ?? [];
    groupFiles.push(file);
    groups.set(file.group, groupFiles);
  });

  return [...groups.entries()].map(([name, files]) => ({ name, files }));
}

export function getPackageManifestCounts(manifest: PackageManifest) {
  const countFormat = (format: PackageManifestFile["format"]) =>
    manifest.files.filter((file) => file.format === format).length;

  return {
    fileCount: manifest.files.length,
    documentCount: countFormat("DOCX"),
    workbookCount: countFormat("XLSX"),
    pdfCount: countFormat("PDF"),
  };
}
