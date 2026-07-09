import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getSiteUrlObject } from "@/lib/site-url";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: getSiteUrlObject(),
  title: "DokKit | South African business document template packages",
  description:
    "Downloadable and editable business document template packages for South African small businesses.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "DokKit | South African business document template packages",
    description:
      "Downloadable and editable business document template packages for South African small businesses.",
    url: "/",
    siteName: "DokKit",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-[#f6f4f1] text-[#111111]">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
