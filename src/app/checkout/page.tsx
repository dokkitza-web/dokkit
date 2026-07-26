import type { Metadata } from "next";
import { CheckoutPage } from "@/app/checkout/checkout-page";

export const metadata: Metadata = {
  title: "Checkout | DokKit",
  description: "Complete your DokKit order securely through PayFast.",
  robots: { index: false, follow: true },
};

export default function Page() {
  return <CheckoutPage />;
}
