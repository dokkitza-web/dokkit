#!/usr/bin/env node
import { createClient } from "@supabase/supabase-js";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const archiveRoot =
  "C:/Elzano Cox/Projects/dokkit-template-production/03_PACKAGED_PRODUCTS/05_WEBSITE_UPLOAD";
const storageBucket = "product-files";
const versionLabel = "v1";

const industry = {
  slug: "human-resources",
  name: "Human Resources",
  summary:
    "South African HR templates for hiring, onboarding, employee records, performance, discipline, leave, and exits.",
  why: "Small employers need consistent employee records and fair, repeatable HR processes without building every document from scratch.",
  display_order: 9,
  is_live: true,
};

const products = [
  {
    slug: "human-resources-essential",
    name: "South African HR Essential Package",
    description:
      "A practical editable HR starter library for hiring, onboarding, employee information, payroll records, leave administration, attendance, core policies, and employee exits.",
    productType: "industry_package",
    packageTier: "starter",
    priceCents: 89900,
    documentCount: 20,
    archiveName: "DokKit_HR_Essential_Package_v1.zip",
    storagePath:
      "product-packs/human-resources/essential/v1/DokKit_HR_Essential_Package_v1.zip",
    metadata: { formats: ["DOCX"], tier_label: "Essential" },
  },
  {
    slug: "human-resources-complete",
    name: "South African HR Complete Package",
    description:
      "A comprehensive editable HR administration library covering employment, onboarding, employee records, performance, training, discipline, grievances, incapacity, termination, and retrenchment processes.",
    productType: "industry_package",
    packageTier: "complete",
    priceCents: 199900,
    documentCount: 53,
    archiveName: "DokKit_HR_Complete_Package_v1.zip",
    storagePath:
      "product-packs/human-resources/complete/v1/DokKit_HR_Complete_Package_v1.zip",
    metadata: { formats: ["DOCX"], tier_label: "Complete" },
  },
  {
    slug: "permanent-employment-agreement-template",
    name: "South African Permanent Employment Agreement Template",
    description:
      "Editable Word agreement for recording a permanent employee's role, remuneration, working arrangements, leave, conduct, confidentiality, and signatures.",
    productType: "single_document",
    priceCents: 14900,
    documentCount: 1,
    archiveName: "DokKit_Permanent_Employment_Agreement_Template_v1.zip",
    storagePath:
      "single-documents/permanent-employment-agreement-template/v1/DokKit_Permanent_Employment_Agreement_Template_v1.zip",
  },
  {
    slug: "fixed-term-employment-contract-template",
    name: "South African Fixed-Term Employment Agreement Template",
    description:
      "Editable Word agreement for a defined period, project, or event, including the fixed-term basis, appointment details, remuneration, leave, confidentiality, and termination administration.",
    productType: "single_document",
    priceCents: 14900,
    documentCount: 1,
    archiveName: "DokKit_Fixed_Term_Employment_Agreement_Template_v1.zip",
    versionLabel: "v2",
    storagePath:
      "single-documents/fixed-term-employment-contract-template/v2/DokKit_Fixed_Term_Employment_Agreement_Template_v1.zip",
  },
  {
    slug: "job-description-template",
    name: "Job Description Template for South African Small Businesses",
    description:
      "Define a role's purpose, responsibilities, reporting lines, authority, objective requirements, and measurable outputs before hiring or reviewing an employee.",
    productType: "single_document",
    priceCents: 7900,
    documentCount: 1,
    archiveName: "DokKit_Job_Description_Template_v1.zip",
    storagePath:
      "single-documents/job-description-template/v1/DokKit_Job_Description_Template_v1.zip",
  },
  {
    slug: "employee-onboarding-checklist-template",
    name: "Employee Onboarding Checklist Template",
    description:
      "Track pre-start, first-day, payroll, policy, safety, privacy, equipment, and early-employment actions for a new employee.",
    productType: "single_document",
    priceCents: 6900,
    documentCount: 1,
    archiveName: "DokKit_Employee_Onboarding_Checklist_Template_v1.zip",
    storagePath:
      "single-documents/employee-onboarding-checklist-template/v1/DokKit_Employee_Onboarding_Checklist_Template_v1.zip",
  },
  {
    slug: "employee-timesheet-template",
    name: "Employee Timesheet Template",
    description:
      "Record employee working time, task or project allocation, reporting period details, and manager approval in an editable Word format.",
    productType: "single_document",
    priceCents: 4900,
    documentCount: 1,
    archiveName: "DokKit_Employee_Timesheet_Template_v1.zip",
    storagePath:
      "single-documents/employee-timesheet-template/v1/DokKit_Employee_Timesheet_Template_v1.zip",
  },
  {
    slug: "leave-application-form-template",
    name: "Leave Application Form Template",
    description:
      "Give employees a structured way to request leave and managers a clear place to approve, decline, and route the request for recordkeeping or payroll action.",
    productType: "single_document",
    priceCents: 4900,
    documentCount: 1,
    archiveName: "DokKit_Leave_Application_Form_Template_v1.zip",
    storagePath:
      "single-documents/leave-application-form-template/v1/DokKit_Leave_Application_Form_Template_v1.zip",
  },
  {
    slug: "disciplinary-code-and-procedure-template",
    name: "Disciplinary Code and Procedure Template",
    description:
      "A practical framework for workplace rules, corrective action, formal hearings, warnings, dismissals, and recordkeeping, subject to a fair assessment of each case.",
    productType: "single_document",
    priceCents: 24900,
    documentCount: 1,
    archiveName: "DokKit_Disciplinary_Code_and_Procedure_Template_v1.zip",
    storagePath:
      "single-documents/disciplinary-code-and-procedure-template/v1/DokKit_Disciplinary_Code_and_Procedure_Template_v1.zip",
  },
].map((product) => ({
  packageTier: null,
  workbookCount: 0,
  pdfCount: 0,
  versionLabel,
  metadata: {
    formats: ["DOCX"],
    previewImageSrc: `/images/previews/single-documents/${product.slug}.png`,
  },
  ...product,
}));

function loadEnvFiles() {
  for (const filename of [".env", ".env.local"]) {
    const filePath = path.join(projectRoot, filename);
    if (!fs.existsSync(filePath)) continue;

    for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const separator = trimmed.indexOf("=");
      if (separator < 1) continue;
      const key = trimmed.slice(0, separator).trim();
      let value = trimmed.slice(separator + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (process.env[key] === undefined) process.env[key] = value;
    }
  }
}

function requireEnv(...names) {
  for (const name of names) {
    if (process.env[name]) return process.env[name];
  }
  throw new Error(`Missing ${names.join(" or ")}.`);
}

function prepareProducts() {
  return products.map((product) => {
    const archivePath = path.join(archiveRoot, product.archiveName);
    if (!fs.existsSync(archivePath)) {
      throw new Error(`Missing archive: ${archivePath}`);
    }
    const buffer = fs.readFileSync(archivePath);
    return {
      ...product,
      archivePath,
      buffer,
      checksum: crypto.createHash("sha256").update(buffer).digest("hex"),
    };
  });
}

function requestedSlugs(argv) {
  const argument = argv.find((item) => item.startsWith("--slug="));
  if (!argument) return [];

  return argument
    .slice("--slug=".length)
    .split(",")
    .map((slug) => slug.trim())
    .filter(Boolean);
}

async function upsertProduct(supabase, industryId, product) {
  const { data, error } = await supabase
    .from("products")
    .upsert(
      {
        industry_id:
          product.productType === "industry_package" ? industryId : null,
        slug: product.slug,
        name: product.name,
        description: product.description,
        product_type: product.productType,
        package_tier: product.packageTier,
        price_cents: product.priceCents,
        document_count: product.documentCount,
        workbook_count: product.workbookCount,
        pdf_count: product.pdfCount,
        metadata: product.metadata,
        is_live: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "slug" },
    )
    .select("id,slug,name")
    .single();
  if (error) throw error;

  const { error: uploadError } = await supabase.storage
    .from(storageBucket)
    .upload(product.storagePath, product.buffer, {
      contentType: "application/zip",
      upsert: true,
    });
  if (uploadError) throw uploadError;

  const { error: inactiveError } = await supabase
    .from("product_files")
    .update({ is_active: false })
    .eq("product_id", data.id);
  if (inactiveError) throw inactiveError;

  const { error: fileError } = await supabase.from("product_files").insert({
    product_id: data.id,
    file_kind: "zip",
    version_label: product.versionLabel,
    storage_bucket: storageBucket,
    storage_path: product.storagePath,
    checksum: product.checksum,
    is_active: true,
  });
  if (fileError) throw fileError;

  return {
    slug: data.slug,
    name: data.name,
    priceCents: product.priceCents,
    storagePath: product.storagePath,
    checksum: product.checksum,
  };
}

async function verifyPublishedProducts(supabase, prepared) {
  const slugs = prepared.map((product) => product.slug);
  const { data: productRows, error: productError } = await supabase
    .from("products")
    .select(
      "id,slug,name,price_cents,document_count,workbook_count,pdf_count,is_live",
    )
    .in("slug", slugs);
  if (productError) throw productError;

  const rowsBySlug = new Map(productRows.map((row) => [row.slug, row]));
  const productIds = productRows.map((row) => row.id);
  const { data: fileRows, error: fileError } = await supabase
    .from("product_files")
    .select(
      "product_id,file_kind,version_label,storage_bucket,storage_path,checksum,is_active",
    )
    .in("product_id", productIds)
    .eq("is_active", true);
  if (fileError) throw fileError;

  const verified = [];
  for (const expected of prepared) {
    const product = rowsBySlug.get(expected.slug);
    if (!product || !product.is_live) {
      throw new Error(`${expected.slug} is missing or not live.`);
    }
    if (
      product.name !== expected.name ||
      product.price_cents !== expected.priceCents ||
      product.document_count !== expected.documentCount ||
      product.workbook_count !== expected.workbookCount ||
      product.pdf_count !== expected.pdfCount
    ) {
      throw new Error(`${expected.slug} catalogue values do not match.`);
    }

    const activeFiles = fileRows.filter((file) => file.product_id === product.id);
    if (activeFiles.length !== 1) {
      throw new Error(
        `${expected.slug} has ${activeFiles.length} active download files instead of 1.`,
      );
    }

    const file = activeFiles[0];
    const { data: downloaded, error: downloadError } = await supabase.storage
      .from(file.storage_bucket)
      .download(file.storage_path);
    if (downloadError) throw downloadError;
    const downloadedBuffer = Buffer.from(await downloaded.arrayBuffer());
    const downloadedChecksum = crypto
      .createHash("sha256")
      .update(downloadedBuffer)
      .digest("hex");
    if (
      downloadedChecksum !== expected.checksum ||
      file.checksum !== expected.checksum
    ) {
      throw new Error(`${expected.slug} checksum verification failed.`);
    }

    verified.push({
      slug: expected.slug,
      bytes: downloadedBuffer.length,
      checksum: downloadedChecksum,
      activeFiles: activeFiles.length,
    });
  }

  return verified;
}

async function main() {
  const execute = process.argv.includes("--execute");
  const verify = process.argv.includes("--verify");
  const slugs = requestedSlugs(process.argv.slice(2));
  loadEnvFiles();
  const allPrepared = prepareProducts();
  const prepared = slugs.length
    ? allPrepared.filter((product) => slugs.includes(product.slug))
    : allPrepared;

  if (!prepared.length) {
    throw new Error("No HR products matched the requested slug filter.");
  }

  console.log(execute ? "EXECUTE MODE" : verify ? "VERIFY MODE" : "DRY RUN");
  for (const product of prepared) {
    console.log(
      `${product.slug}: R${(product.priceCents / 100).toFixed(2)} | ${product.buffer.length} bytes | ${product.storagePath}`,
    );
  }

  if (!execute && !verify) {
    console.log("No changes made. Add --execute to publish the products.");
    return;
  }

  const supabase = createClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_URL"),
    requireEnv("SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_SECRET_KEY"),
    { auth: { persistSession: false, autoRefreshToken: false } },
  );

  let industryRow = null;
  const uploaded = [];
  if (execute) {
    const { data, error: industryError } = await supabase
      .from("industries")
      .upsert(
        { ...industry, updated_at: new Date().toISOString() },
        { onConflict: "slug" },
      )
      .select("id,slug,name")
      .single();
    if (industryError) throw industryError;
    industryRow = data;

    for (const product of prepared) {
      uploaded.push(await upsertProduct(supabase, industryRow.id, product));
    }
  }

  const verified = await verifyPublishedProducts(supabase, prepared);
  console.log(
    JSON.stringify({ industry: industryRow, uploaded, verified }, null, 2),
  );
}

main().catch((error) => {
  console.error(`HR product upload failed: ${error.message}`);
  process.exitCode = 1;
});
