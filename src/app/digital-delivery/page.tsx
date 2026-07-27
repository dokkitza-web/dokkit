import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { deliveryPolicy } from "@/data/legal-policies";

export const metadata: Metadata = {
  title: "Digital Delivery Policy | DokKit",
  description: deliveryPolicy.description,
  alternates: { canonical: deliveryPolicy.path },
};

export default function DigitalDeliveryPage() {
  return <LegalPage policy={deliveryPolicy} />;
}
