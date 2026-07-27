import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { refundsPolicy } from "@/data/legal-policies";

export const metadata: Metadata = {
  title: "Refund and Remedy Policy | DokKit",
  description: refundsPolicy.description,
  alternates: { canonical: refundsPolicy.path },
};

export default function RefundsPage() {
  return <LegalPage policy={refundsPolicy} />;
}
