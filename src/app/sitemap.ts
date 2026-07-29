import type { MetadataRoute } from "next";
import { industries } from "@/data/catalogue";
import { getSiteUrl } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  const staticPaths = [
    "",
    "/industries",
    "/packages",
    "/single-documents",
    "/free-business-admin-checklist",
    "/launch-offer",
    "/terms",
    "/licence",
    "/digital-delivery",
    "/refunds",
    "/privacy",
    "/contact",
  ];

  return [
    ...staticPaths.map((path) => ({
      url: `${siteUrl}${path}`,
      changeFrequency: "monthly" as const,
      priority: path === "" ? 1 : path.startsWith("/industries") ? 0.9 : 0.7,
    })),
    ...industries.map((industry) => ({
      url: `${siteUrl}/industries/${industry.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
