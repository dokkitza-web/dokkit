import { createClient } from "@supabase/supabase-js";
import {
  getFallbackIndustryPackageProducts,
  getSingleDocumentPreviewImageSrc,
  industries as fallbackIndustries,
  packageTiers as fallbackPackageTiers,
  readyIndustries,
  singleDocuments as fallbackSingleDocuments,
  type Industry,
  type IndustryPackageProduct,
  type PackageTier,
  type PackageTierKey,
  type SingleDocument,
} from "@/data/catalogue";

type IndustryRow = {
  slug: string;
  name: string;
  summary: string;
  why: string;
  display_order: number;
};

type PackageTierRow = {
  tier_key: string;
  name: string;
  summary: string;
  price_cents: number;
  document_count: number;
  workbook_count: number;
  pdf_count: number;
  display_order: number;
};

type ProductRow = {
  slug: string;
  name: string;
  description: string;
  price_cents: number;
  metadata: {
    formats?: string[];
    previewImageSrc?: string;
  } | null;
};

type IndustryPackageProductRow = {
  slug: string;
  name: string;
  description: string;
  package_tier: string | null;
  price_cents: number;
  document_count: number;
  workbook_count: number;
  pdf_count: number;
  metadata: {
    formats?: string[];
  } | null;
};

const fallbackIndustryBySlug = new Map(
  fallbackIndustries.map((industry) => [industry.slug, industry]),
);

const fallbackPackageTierByKey = new Map(
  fallbackPackageTiers.map((tier) => [tier.key, tier]),
);

const singleDocumentOrder = new Map(
  fallbackSingleDocuments.map((document, index) => [document.slug, index]),
);

const packageTierOrder = new Map<PackageTierKey, number>(
  fallbackPackageTiers.map((tier, index) => [tier.key, index]),
);

function createCatalogueClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function orderByKnownSingleDocuments(a: SingleDocument, b: SingleDocument) {
  const aOrder = singleDocumentOrder.get(a.slug) ?? Number.MAX_SAFE_INTEGER;
  const bOrder = singleDocumentOrder.get(b.slug) ?? Number.MAX_SAFE_INTEGER;

  if (aOrder !== bOrder) {
    return aOrder - bOrder;
  }

  return a.name.localeCompare(b.name);
}

function getLaunchFormats(formats?: string[]) {
  const editableFormats = (formats?.length ? formats : ["DOCX"]).filter(
    (format) => format.toUpperCase() !== "PDF",
  );

  return editableFormats.length ? editableFormats : ["DOCX"];
}

export async function getCatalogueIndustries(): Promise<Industry[]> {
  const supabase = createCatalogueClient();

  if (!supabase) {
    return readyIndustries;
  }

  const { data, error } = await supabase
    .from("industries")
    .select("slug,name,summary,why,display_order")
    .eq("is_live", true)
    .order("display_order", { ascending: true });

  if (error || !data?.length) {
    console.warn("Using fallback industries catalogue.", error?.message);
    return readyIndustries;
  }

  return (data as IndustryRow[]).map((row, index) => {
    const fallback = fallbackIndustryBySlug.get(row.slug);

    return {
      rank: row.display_order || index + 1,
      slug: row.slug,
      name: row.name,
      summary: row.summary,
      why: row.why,
      featuredDocuments: fallback?.featuredDocuments ?? [],
      useCases: fallback?.useCases ?? [],
    };
  });
}

export async function getCatalogueIndustryBySlug(slug: string) {
  const industries = await getCatalogueIndustries();

  return industries.find((industry) => industry.slug === slug);
}

export async function getCataloguePackageTiers(): Promise<PackageTier[]> {
  const supabase = createCatalogueClient();

  if (!supabase) {
    return fallbackPackageTiers;
  }

  const { data, error } = await supabase
    .from("package_tiers")
    .select(
      "tier_key,name,summary,price_cents,document_count,workbook_count,pdf_count,display_order",
    )
    .eq("is_live", true)
    .order("display_order", { ascending: true });

  if (error || !data?.length) {
    console.warn("Using fallback package tiers.", error?.message);
    return fallbackPackageTiers;
  }

  return (data as PackageTierRow[]).map((row) => {
    const key = row.tier_key as PackageTierKey;
    const fallback = fallbackPackageTierByKey.get(key);

    return {
      key,
      name: row.name,
      priceCents: row.price_cents,
      summary: row.summary,
      bestFor: fallback?.bestFor ?? "",
      documentCount: row.document_count,
      workbookCount: row.workbook_count,
      pdfCount: row.pdf_count,
      includes: fallback?.includes ?? [],
    };
  });
}

export async function getCatalogueIndustryPackageProducts(
  industrySlug: string,
): Promise<IndustryPackageProduct[]> {
  const fallbackProducts = getFallbackIndustryPackageProducts(industrySlug);
  const supabase = createCatalogueClient();

  if (!supabase) {
    return fallbackProducts;
  }

  const expectedSlugs = fallbackPackageTiers.map(
    (tier) => `${industrySlug}-${tier.key}`,
  );
  const { data, error } = await supabase
    .from("products")
    .select(
      "slug,name,description,package_tier,price_cents,document_count,workbook_count,pdf_count,metadata",
    )
    .eq("is_live", true)
    .eq("product_type", "industry_package")
    .in("slug", expectedSlugs);

  if (error || !data?.length) {
    console.warn(
      `Using fallback package products for ${industrySlug}.`,
      error?.message,
    );
    return fallbackProducts;
  }

  const productsByTier = new Map(
    (data as IndustryPackageProductRow[])
      .filter((row) => row.package_tier)
      .map((row) => [row.package_tier as PackageTierKey, row]),
  );

  return fallbackProducts
    .map((fallbackProduct) => {
      const row = productsByTier.get(fallbackProduct.key);

      if (!row) {
        return fallbackProduct;
      }

      return {
        key: fallbackProduct.key,
        slug: row.slug,
        name: row.name,
        description: row.description,
        priceCents: row.price_cents,
        documentCount: row.document_count,
        workbookCount: row.workbook_count,
        pdfCount: row.pdf_count,
        fileFormats: getLaunchFormats(row.metadata?.formats),
      };
    })
    .sort(
      (a, b) =>
        (packageTierOrder.get(a.key) ?? Number.MAX_SAFE_INTEGER) -
        (packageTierOrder.get(b.key) ?? Number.MAX_SAFE_INTEGER),
    );
}

export async function getCatalogueSingleDocuments(): Promise<SingleDocument[]> {
  const supabase = createCatalogueClient();

  if (!supabase) {
    return fallbackSingleDocuments;
  }

  const { data, error } = await supabase
    .from("products")
    .select("slug,name,description,price_cents,metadata")
    .eq("is_live", true)
    .eq("product_type", "single_document")
    .order("name", { ascending: true });

  if (error || !data?.length) {
    console.warn("Using fallback single documents.", error?.message);
    return fallbackSingleDocuments;
  }

  return (data as ProductRow[])
    .map((row) => ({
      slug: row.slug,
      name: row.name,
      description: row.description,
      priceCents: row.price_cents,
      fileFormats: getLaunchFormats(row.metadata?.formats),
      previewImageSrc:
        row.metadata?.previewImageSrc ??
        getSingleDocumentPreviewImageSrc(row.slug),
    }))
    .sort(orderByKnownSingleDocuments);
}
