#!/usr/bin/env node
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const defaultPackBuckets = ["product-files", "generated-zips", "admin-uploads"];

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

    if (!key) {
      continue;
    }

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
    deleteProducts: false,
    includeSingleDocuments: false,
    purgePackBuckets: false,
    slugs: [],
    buckets: defaultPackBuckets,
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

    if (arg === "--delete-products") {
      options.deleteProducts = true;
      continue;
    }

    if (arg === "--include-single-documents") {
      options.includeSingleDocuments = true;
      continue;
    }

    if (arg === "--purge-pack-buckets") {
      options.purgePackBuckets = true;
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

    if (arg === "--bucket") {
      const value = argv[index + 1];

      if (!value) {
        throw new Error("--bucket requires a comma-separated value.");
      }

      options.buckets = splitCsv(value);
      index += 1;
      continue;
    }

    if (arg.startsWith("--bucket=")) {
      options.buckets = splitCsv(arg.slice("--bucket=".length));
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  options.slugs = [...new Set(options.slugs)];
  options.buckets = [...new Set(options.buckets)];

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
Reset uploaded Supabase template-pack files.

Usage:
  node tools/reset_supabase_template_packs.mjs [options]

Required environment:
  NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL
  SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SECRET_KEY

Options:
  --execute                    Actually delete/update data. Without this, runs a dry run.
  --delete-products            Delete matching products. Default keeps products and marks them not live.
  --include-single-documents   Include products with product_type = single_document.
  --slug=a,b                   Limit to specific product slugs.
  --purge-pack-buckets         Delete every object in the selected storage buckets.
  --bucket=a,b                 Buckets to purge with --purge-pack-buckets.
                               Default: ${defaultPackBuckets.join(", ")}
  --help                       Show this help.

Default scope:
  - Matches products with product_type = industry_package.
  - Deletes linked product_files rows and their storage objects.
  - Marks matched products is_live = false unless --delete-products is passed.
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

function chunk(items, size) {
  const chunks = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
}

function uniqueFileRefs(files) {
  const refsByKey = new Map();

  for (const file of files) {
    const key = `${file.storage_bucket}/${file.storage_path}`;
    refsByKey.set(key, {
      bucket: file.storage_bucket,
      path: file.storage_path,
    });
  }

  return [...refsByKey.values()];
}

async function selectProducts(supabase, options) {
  const productTypes = ["industry_package"];

  if (options.includeSingleDocuments) {
    productTypes.push("single_document");
  }

  let query = supabase
    .from("products")
    .select("id, slug, name, product_type, is_live")
    .in("product_type", productTypes)
    .order("product_type")
    .order("slug");

  if (options.slugs.length > 0) {
    query = query.in("slug", options.slugs);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data ?? [];
}

async function selectProductFiles(supabase, productIds) {
  if (productIds.length === 0) {
    return [];
  }

  const files = [];

  for (const ids of chunk(productIds, 100)) {
    const { data, error } = await supabase
      .from("product_files")
      .select("id, product_id, file_kind, version_label, storage_bucket, storage_path, is_active")
      .in("product_id", ids)
      .order("storage_bucket")
      .order("storage_path");

    if (error) {
      throw error;
    }

    files.push(...(data ?? []));
  }

  return files;
}

async function listBucketObjects(supabase, bucket, prefix = "") {
  const objects = [];
  let offset = 0;

  while (true) {
    const { data, error } = await supabase.storage.from(bucket).list(prefix, {
      limit: 1000,
      offset,
      sortBy: { column: "name", order: "asc" },
    });

    if (error) {
      throw new Error(`Could not list bucket "${bucket}": ${error.message}`);
    }

    const items = data ?? [];

    for (const item of items) {
      const objectPath = prefix ? `${prefix}/${item.name}` : item.name;

      if (item.id || item.metadata) {
        objects.push({ bucket, path: objectPath });
      } else {
        objects.push(...(await listBucketObjects(supabase, bucket, objectPath)));
      }
    }

    if (items.length < 1000) {
      break;
    }

    offset += items.length;
  }

  return objects;
}

async function removeStorageObjects(supabase, refs) {
  let removed = 0;

  for (const [bucket, paths] of groupPathsByBucket(refs)) {
    for (const pathChunk of chunk(paths, 100)) {
      const { error } = await supabase.storage.from(bucket).remove(pathChunk);

      if (error) {
        throw new Error(`Could not remove files from "${bucket}": ${error.message}`);
      }

      removed += pathChunk.length;
    }
  }

  return removed;
}

function groupPathsByBucket(refs) {
  const groups = new Map();

  for (const ref of refs) {
    if (!groups.has(ref.bucket)) {
      groups.set(ref.bucket, []);
    }

    groups.get(ref.bucket).push(ref.path);
  }

  return groups.entries();
}

async function deleteProductFiles(supabase, fileIds) {
  if (fileIds.length === 0) {
    return 0;
  }

  let deleted = 0;

  for (const ids of chunk(fileIds, 100)) {
    const { error } = await supabase.from("product_files").delete().in("id", ids);

    if (error) {
      throw error;
    }

    deleted += ids.length;
  }

  return deleted;
}

async function updateProducts(supabase, productIds, options) {
  if (productIds.length === 0) {
    return 0;
  }

  let changed = 0;

  for (const ids of chunk(productIds, 100)) {
    const query = options.deleteProducts
      ? supabase.from("products").delete().in("id", ids)
      : supabase.from("products").update({ is_live: false }).in("id", ids);

    const { error } = await query;

    if (error) {
      throw error;
    }

    changed += ids.length;
  }

  return changed;
}

function printPlan(products, files, storageRefs, options) {
  const linkedRefs = uniqueFileRefs(files);
  const productTypeCounts = countBy(products, "product_type");

  console.log(options.execute ? "EXECUTE MODE" : "DRY RUN");
  console.log("");
  console.log(`Matched products: ${products.length}`);

  for (const [type, count] of Object.entries(productTypeCounts)) {
    console.log(`  ${type}: ${count}`);
  }

  if (products.length > 0) {
    console.log("");
    console.log("Products:");

    for (const product of products.slice(0, 30)) {
      const live = product.is_live ? "live" : "not live";
      console.log(`  - ${product.slug} (${product.product_type}, ${live})`);
    }

    if (products.length > 30) {
      console.log(`  ...and ${products.length - 30} more`);
    }
  }

  console.log("");
  console.log(`Linked product_files rows: ${files.length}`);
  console.log(`Linked storage objects: ${linkedRefs.length}`);

  if (options.purgePackBuckets) {
    console.log(`Bucket purge objects: ${storageRefs.length}`);
    console.log(`Bucket purge scope: ${options.buckets.join(", ")}`);
  }

  console.log("");
  console.log(
    options.deleteProducts
      ? "Product action: delete matching product rows"
      : "Product action: keep product rows and mark them is_live = false",
  );

  if (!options.execute) {
    console.log("");
    console.log("No changes were made. Add --execute to perform this reset.");
  }
}

function countBy(items, key) {
  return items.reduce((counts, item) => {
    const value = item[key];
    counts[value] = (counts[value] ?? 0) + 1;
    return counts;
  }, {});
}

async function main() {
  loadEnvFiles();

  const options = parseArgs(process.argv.slice(2));

  if (options.help) {
    printHelp();
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

  const products = await selectProducts(supabase, options);
  const productIds = products.map((product) => product.id);
  const files = await selectProductFiles(supabase, productIds);
  const linkedStorageRefs = uniqueFileRefs(files);
  const bucketStorageRefs = [];

  if (options.purgePackBuckets) {
    for (const bucket of options.buckets) {
      bucketStorageRefs.push(...(await listBucketObjects(supabase, bucket)));
    }
  }

  const allStorageRefs = [
    ...new Map(
      [...linkedStorageRefs, ...bucketStorageRefs].map((ref) => [
        `${ref.bucket}/${ref.path}`,
        ref,
      ]),
    ).values(),
  ];

  printPlan(products, files, bucketStorageRefs, options);

  if (!options.execute) {
    return;
  }

  console.log("");
  console.log("Deleting storage objects...");
  const removedStorageObjects = await removeStorageObjects(supabase, allStorageRefs);

  console.log("Deleting product_files rows...");
  const deletedFileRows = await deleteProductFiles(
    supabase,
    files.map((file) => file.id),
  );

  console.log(options.deleteProducts ? "Deleting products..." : "Marking products not live...");
  const changedProducts = await updateProducts(supabase, productIds, options);

  console.log("");
  console.log("Reset complete.");
  console.log(`Removed storage objects: ${removedStorageObjects}`);
  console.log(`Deleted product_files rows: ${deletedFileRows}`);
  console.log(
    options.deleteProducts
      ? `Deleted products: ${changedProducts}`
      : `Marked products not live: ${changedProducts}`,
  );
}

main().catch((error) => {
  console.error("");
  console.error(`Reset failed: ${error.message}`);
  process.exitCode = 1;
});
