import type { Metadata } from "next";
import { RecommendedAddOnsPage } from "@/app/recommended-add-ons/recommended-add-ons-page";
import {
  getIncludedSingleDocumentSlugs,
  packageManifests,
} from "@/data/package-manifests";
import { getCatalogueSingleDocuments } from "@/lib/supabase/catalogue";

export const metadata: Metadata = {
  title: "Recommended add-ons | DokKit",
  description:
    "Review recommended DokKit single templates before continuing to checkout.",
  robots: { index: false, follow: true },
};

export const revalidate = 300;

export default async function Page() {
  const singleDocuments = await getCatalogueSingleDocuments();
  const packageInclusions = Object.fromEntries(
    packageManifests.map((manifest) => [
      manifest.slug,
      getIncludedSingleDocumentSlugs(manifest),
    ]),
  );

  return (
    <RecommendedAddOnsPage
      singleDocuments={singleDocuments}
      packageInclusions={packageInclusions}
    />
  );
}
