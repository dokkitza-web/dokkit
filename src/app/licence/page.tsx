import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { licencePolicy } from "@/data/legal-policies";

export const metadata: Metadata = {
  title: "Template Licence | DokKit",
  description: licencePolicy.description,
  alternates: { canonical: licencePolicy.path },
};

export default function LicencePage() {
  return <LegalPage policy={licencePolicy} />;
}
