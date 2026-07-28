import {
  AdminPackPricingSectionClient,
  type PricingIndustry,
} from "@/components/admin-pack-pricing-section-client";
import type { Industry, PackageTier } from "@/data/catalogue";
import { getCatalogueIndustryPackageProducts } from "@/lib/supabase/catalogue";

export async function AdminPackPricingSection({
  headingLevel = "h2",
  industries,
  packageTiers,
}: {
  headingLevel?: "h1" | "h2";
  industries: Industry[];
  packageTiers: PackageTier[];
}) {
  const pricingIndustries: PricingIndustry[] = await Promise.all(
    industries.map(async (industry) => ({
      slug: industry.slug,
      name: industry.name,
      products: await getCatalogueIndustryPackageProducts(industry.slug),
    })),
  );

  return (
    <AdminPackPricingSectionClient
      headingLevel={headingLevel}
      industries={pricingIndustries}
      packageTiers={packageTiers}
    />
  );
}
