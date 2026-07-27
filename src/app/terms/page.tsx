import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { termsPolicy } from "@/data/legal-policies";

export const metadata: Metadata = {
  title: "Website Terms and Conditions | DokKit",
  description: termsPolicy.description,
  alternates: { canonical: termsPolicy.path },
};

export default function TermsPage() {
  return <LegalPage policy={termsPolicy} />;
}
