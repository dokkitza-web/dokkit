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

const packagedWorkbookSingleDocumentSlugs = [
  "business-financial-income-statement-template",
  "crm-tracker",
  "income-and-expense-tracker",
  "invoice-workbook-template",
];

const standaloneDocumentMatchers: Record<string, RegExp[]> = {
  "permanent-employment-agreement-template": [
    /\bpermanent employment agreement\b/i,
  ],
  "fixed-term-employment-contract-template": [
    /\bfixed term employment agreement\b/i,
  ],
  "job-description-template": [/\bjob description\b/i],
  "employee-onboarding-checklist-template": [
    /\bemployee onboarding checklist\b/i,
  ],
  "employee-timesheet-template": [/\btimesheet template\b/i],
  "leave-application-form-template": [/\bleave application form\b/i],
  "disciplinary-code-and-procedure-template": [
    /\bdisciplinary code and procedure\b/i,
  ],
  "general-service-agreement-template": [/\bservice agreement\b/i],
  "joint-venture-structure-agreement-template": [
    /\bjoint venture structure agreement\b/i,
  ],
  "master-quotation-template": [/\bquotation\b/i],
  "non-disclosure-agreement-template": [
    /\bnon disclosure agreement\b/i,
  ],
  "popia-privacy-policy-statement-template": [
    /\bprivacy (?:notice|policy)\b/i,
  ],
  "terms-and-conditions-template": [/\bterms and conditions\b/i],
  "invoice-workbook-template": [/\binvoice template\b/i],
  "vat-compliant-invoice-template": [/\binvoice template\b/i],
  "vat-ready-purchase-order-template": [/\bpurchase order\b/i],
};

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

export function getIncludedSingleDocumentSlugs(manifest: PackageManifest) {
  const includedSlugs = new Set<string>();
  const fileNames = manifest.files.map((file) => file.name);

  Object.entries(standaloneDocumentMatchers).forEach(([slug, matchers]) => {
    if (
      fileNames.some((fileName) =>
        matchers.some((matcher) => matcher.test(fileName)),
      )
    ) {
      includedSlugs.add(slug);
    }
  });

  if (manifest.files.some((file) => file.format === "XLSX")) {
    packagedWorkbookSingleDocumentSlugs.forEach((slug) =>
      includedSlugs.add(slug),
    );
  }

  return [...includedSlugs];
}
