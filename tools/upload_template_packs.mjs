#!/usr/bin/env node
import { createClient } from "@supabase/supabase-js";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const defaultConfigPath = path.join(projectRoot, "supabase", "template-packs.json");

function loadEnvFiles() {
  const values = {};

  for (const filename of [".env", ".env.local"]) {
    const filePath = path.join(projectRoot, filename);

    if (!fs.existsSync(filePath)) {
      continue;
    }

    Object.assign(values, parseEnvFile(fs.readFileSync(filePath, "utf8")));
  }

  for (const [key, value] of Object.entries(values)) {
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function parseEnvFile(contents) {
  const result = {};

  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const envLine = trimmed.startsWith("export ") ? trimmed.slice(7).trim() : trimmed;
    const separatorIndex = envLine.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = envLine.slice(0, separatorIndex).trim();
    let value = envLine.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      const quote = value[0];
      value = value.slice(1, -1);

      if (quote === '"') {
        value = value
          .replaceAll("\\n", "\n")
          .replaceAll("\\r", "\r")
          .replaceAll("\\t", "\t")
          .replaceAll('\\"', '"')
          .replaceAll("\\\\", "\\");
      }
    }

    result[key] = value;
  }

  return result;
}

function parseArgs(argv) {
  const options = {
    execute: false,
    configPath: defaultConfigPath,
    slugs: [],
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--help" || arg === "-h") {
      options.help = true;
      continue;
    }

    if (arg === "--execute") {
      options.execute = true;
      continue;
    }

    if (arg === "--config") {
      const value = argv[index + 1];

      if (!value) {
        throw new Error("--config requires a path.");
      }

      options.configPath = path.resolve(value);
      index += 1;
      continue;
    }

    if (arg.startsWith("--config=")) {
      options.configPath = path.resolve(arg.slice("--config=".length));
      continue;
    }

    if (arg === "--slug") {
      const value = argv[index + 1];

      if (!value) {
        throw new Error("--slug requires a comma-separated value.");
      }

      options.slugs.push(...splitCsv(value));
      index += 1;
      continue;
    }

    if (arg.startsWith("--slug=")) {
      options.slugs.push(...splitCsv(arg.slice("--slug=".length)));
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  options.slugs = [...new Set(options.slugs)];
  return options;
}

function splitCsv(value) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function printHelp() {
  console.log(`
Upload packaged DokKit template packs to Supabase.

Usage:
  node tools/upload_template_packs.mjs [options]

Required environment:
  NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL
  SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SECRET_KEY

Options:
  --execute            Actually upload and write product_files rows. Without this, runs a dry run.
  --slug=a,b           Limit to specific product slugs.
  --config=path        Template pack manifest. Default: supabase/template-packs.json
  --help               Show this help.

Run npm run packs:package before uploading.
`);
}

function requireFirstEnv(names) {
  for (const name of names) {
    const value = process.env[name];

    if (value) {
      return value;
    }
  }

  throw new Error(`Missing ${names.join(" or ")}. Add it to .env.local or export it in the shell.`);
}

function loadConfig(configPath) {
  return JSON.parse(fs.readFileSync(configPath, "utf8"));
}

function selectedPacks(config, slugs) {
  const packs = config.packs ?? [];

  if (slugs.length === 0) {
    return packs;
  }

  return packs.filter((pack) => slugs.includes(pack.slug));
}

function archivePathFor(config, pack) {
  return path.join(projectRoot, config.outputDir ?? ".localappdata/product-packs", pack.archiveName);
}

function checksum(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

async function getProduct(supabase, slug) {
  const { data, error } = await supabase
    .from("products")
    .select("id, slug, name")
    .eq("slug", slug)
    .single();

  if (error) {
    throw new Error(`Product "${slug}" was not found. Run supabase/rebuild_business_template_packs.sql first.`);
  }

  return data;
}

async function uploadPack(supabase, config, pack, archivePath, buffer, hash) {
  const bucket = config.storageBucket ?? "product-files";
  const versionLabel = config.versionLabel ?? "v1";
  const product = await getProduct(supabase, pack.slug);

  const { error: uploadError } = await supabase.storage.from(bucket).upload(pack.storagePath, buffer, {
    contentType: "application/zip",
    upsert: true,
  });

  if (uploadError) {
    throw new Error(`Could not upload ${pack.archiveName}: ${uploadError.message}`);
  }

  const { error: inactiveError } = await supabase
    .from("product_files")
    .update({ is_active: false })
    .eq("product_id", product.id)
    .eq("file_kind", "zip");

  if (inactiveError) {
    throw inactiveError;
  }

  const { error: insertError } = await supabase.from("product_files").insert({
    product_id: product.id,
    file_kind: "zip",
    version_label: versionLabel,
    storage_bucket: bucket,
    storage_path: pack.storagePath,
    checksum: hash,
    is_active: true,
  });

  if (insertError) {
    throw insertError;
  }

  const { error: updateProductError } = await supabase
    .from("products")
    .update({
      name: pack.name,
      description: pack.description,
      price_cents: pack.priceCents,
      document_count: pack.documentCount,
      workbook_count: pack.workbookCount,
      pdf_count: pack.pdfCount,
      is_live: true,
    })
    .eq("id", product.id);

  if (updateProductError) {
    throw updateProductError;
  }

  return {
    product: product.slug,
    archive: archivePath,
    storagePath: pack.storagePath,
    checksum: hash,
  };
}

async function main() {
  loadEnvFiles();

  const options = parseArgs(process.argv.slice(2));

  if (options.help) {
    printHelp();
    return;
  }

  const config = loadConfig(options.configPath);
  const packs = selectedPacks(config, options.slugs);

  if (packs.length === 0) {
    throw new Error("No template packs matched the requested slug filter.");
  }

  const prepared = packs.map((pack) => {
    const archivePath = archivePathFor(config, pack);

    if (!fs.existsSync(archivePath)) {
      throw new Error(`Missing archive for ${pack.slug}: ${archivePath}. Run npm run packs:package first.`);
    }

    const buffer = fs.readFileSync(archivePath);

    return {
      pack,
      archivePath,
      buffer,
      hash: checksum(buffer),
    };
  });

  console.log(options.execute ? "EXECUTE MODE" : "DRY RUN");
  console.log("");

  for (const item of prepared) {
    console.log(`- ${item.pack.slug}`);
    console.log(`  archive: ${item.archivePath}`);
    console.log(`  size: ${item.buffer.length} bytes`);
    console.log(`  bucket: ${config.storageBucket ?? "product-files"}`);
    console.log(`  path: ${item.pack.storagePath}`);
    console.log(`  sha256: ${item.hash}`);
  }

  if (!options.execute) {
    console.log("");
    console.log("No changes were made. Add --execute to upload these packs.");
    return;
  }

  const supabaseUrl = requireFirstEnv(["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_URL"]);
  const serviceRoleKey = requireFirstEnv(["SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_SECRET_KEY"]);
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const uploaded = [];

  for (const item of prepared) {
    uploaded.push(await uploadPack(supabase, config, item.pack, item.archivePath, item.buffer, item.hash));
  }

  console.log("");
  console.log("Upload complete.");
  console.log(JSON.stringify(uploaded, null, 2));
}

main().catch((error) => {
  console.error("");
  console.error(`Upload failed: ${error.message}`);
  process.exitCode = 1;
});
