import { AdminPackPricingSection } from "@/components/admin-pack-pricing-section";
import {
  getCatalogueIndustries,
  getCataloguePackageTiers,
} from "@/lib/supabase/catalogue";

export const metadata = {
  title: "Package comparison | DokKit",
  description:
    "Compare DokKit Starter, Professional, and Complete Word and Excel template packages.",
};

export const revalidate = 300;

export default async function PackagesPage() {
  const [industries, packageTiers] = await Promise.all([
    getCatalogueIndustries(),
    getCataloguePackageTiers(),
  ]);

  return (
    <AdminPackPricingSection
      headingLevel="h1"
      industries={industries}
      packageTiers={packageTiers}
    />
  );
}
