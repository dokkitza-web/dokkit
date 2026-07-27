import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { privacyPolicy } from "@/data/legal-policies";

export const metadata: Metadata = {
  title: "Privacy and Cookies Policy | DokKit",
  description: privacyPolicy.description,
  alternates: { canonical: privacyPolicy.path },
};

export default function PrivacyPage() {
  return <LegalPage policy={privacyPolicy} />;
}
