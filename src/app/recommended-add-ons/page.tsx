import { RecommendedAddOnsPage } from "@/app/recommended-add-ons/recommended-add-ons-page";
import { getCatalogueSingleDocuments } from "@/lib/supabase/catalogue";

export const metadata = {
  title: "Recommended add-ons | DokKit",
  description:
    "Review recommended DokKit single templates before continuing to checkout.",
};

export const revalidate = 300;

export default async function Page() {
  const singleDocuments = await getCatalogueSingleDocuments();

  return <RecommendedAddOnsPage singleDocuments={singleDocuments} />;
}
