import { AdminPackPricingSectionClient } from "@/components/admin-pack-pricing-section-client";
import type { Industry, PackageTier } from "@/data/catalogue";

export async function AdminPackPricingSection({
  headingLevel = "h2",
  industries,
  packageTiers,
}: {
  headingLevel?: "h1" | "h2";
  industries: Industry[];
  packageTiers: PackageTier[];
}) {
  void industries;

  return (
    <AdminPackPricingSectionClient
      headingLevel={headingLevel}
      packageTiers={packageTiers}
    />
  );
}
