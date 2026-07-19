import type { Metadata } from "next";
import { AnalyticsProvider } from "@/components/analytics-provider";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getSiteUrlObject } from "@/lib/site-url";
import "./globals.css";

const siteTitle =
  "DokKit | Word and Excel templates for South African small businesses";
const siteDescription =
  "Editable Word templates and Excel workbooks for South African small businesses, including industry-specific packs for quotes, invoices, forms, trackers and admin.";

export const metadata: Metadata = {
  metadataBase: getSiteUrlObject(),
  title: siteTitle,
  description: siteDescription,
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/dokkit-icon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/dokkit-icon-96.png", sizes: "96x96", type: "image/png" },
      { url: "/dokkit-icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: ["/favicon.ico"],
  },
  openGraph: {
    title: siteTitle,
    description: siteDescription,
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
        <AnalyticsProvider>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </AnalyticsProvider>
      </body>
    </html>
  );
}
