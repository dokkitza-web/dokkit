import Link from "next/link";
import type { PackageTierKey } from "@/data/catalogue";
import {
  getCatalogueIndustries,
  getCatalogueIndustryPackageProducts,
} from "@/lib/supabase/catalogue";

export const metadata = {
  title: "Industries | DokKit",
  description:
    "Browse DokKit Word template and Excel workbook packages by industry.",
};

export const revalidate = 300;

function isPackageTierKey(value?: string): value is PackageTierKey {
  return ["starter", "professional", "complete"].includes(value ?? "");
}

export default async function IndustriesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = await searchParams;
  const tierParam = resolvedSearchParams.tier;
  const selectedTierValue = Array.isArray(tierParam) ? tierParam[0] : tierParam;
  const selectedTier = isPackageTierKey(selectedTierValue)
    ? selectedTierValue
    : null;
  const selectedTierLabel = selectedTier
    ? selectedTier.charAt(0).toUpperCase() + selectedTier.slice(1)
    : null;
  const industries = await getCatalogueIndustries();
  const tierProducts = selectedTier
    ? await Promise.all(
        industries.map(async (industry) => ({
          industrySlug: industry.slug,
          product: (
            await getCatalogueIndustryPackageProducts(industry.slug)
          ).find((product) => product.key === selectedTier),
        })),
      )
    : [];
  const productSlugByIndustry = new Map(
    tierProducts.map(({ industrySlug, product }) => [
      industrySlug,
      product?.slug,
    ]),
  );

  return (
    <section className="bg-[#fffaf5]">
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-20">
      <div className="max-w-3xl">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ff6a00]">
          Catalogue
        </p>
        <h1 className="mt-3 text-4xl font-black text-[#111111] sm:mt-4 sm:text-5xl">
          Industry packages
        </h1>
        <p className="mt-4 text-base leading-7 text-[#5f5f66] sm:text-lg sm:leading-8">
          Choose from editable Word document and Excel workbook packages built
          for practical South African small-business administration. Available
          package levels vary by category.
        </p>
        {selectedTier ? (
          <p className="mt-5 inline-flex rounded-md border border-[#ffb77a] bg-white px-4 py-2 text-sm font-black text-[#a63d00]">
            {selectedTierLabel} level selected
          </p>
        ) : null}
      </div>
      <div className="mt-7 grid gap-3 sm:mt-10 sm:gap-4 md:grid-cols-2 xl:grid-cols-3">
        {industries.map((industry) => {
          const selectedProductSlug = productSlugByIndustry.get(industry.slug);

          return (
            <Link
              key={industry.slug}
              href={
                selectedProductSlug
                  ? `/industries/${industry.slug}#${selectedProductSlug}`
                  : `/industries/${industry.slug}`
              }
              className="group rounded-md border border-black/10 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-[#ff6a00] hover:shadow-xl sm:p-6"
            >
              <p className="w-fit rounded-full bg-[#111111] px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-white group-hover:bg-[#ff6a00]">
                Category {industry.rank.toString().padStart(2, "0")}
              </p>
              <h2 className="mt-5 text-xl font-black">{industry.name}</h2>
              <p className="mt-3 text-sm leading-6 text-[#5f5f66]">
                {industry.summary}
              </p>
              <p className="mt-4 flex min-h-11 items-center text-sm font-black text-[#a63d00] sm:mt-5">
                {selectedTier
                  ? selectedProductSlug
                    ? `View ${selectedTierLabel} pack`
                    : `${selectedTierLabel} not available - compare packs`
                  : "Compare packages"}
              </p>
            </Link>
          );
        })}
      </div>
      </div>
    </section>
  );
}
