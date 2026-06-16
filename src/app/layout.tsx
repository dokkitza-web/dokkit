import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
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
      <body className="min-h-full bg-[#f7f9f8] text-[#15201c]">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
