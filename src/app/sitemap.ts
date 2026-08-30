import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  const staticPaths = [
    "",
    "/packages",
    "/free-business-admin-checklist",
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
      priority: path === "" ? 1 : path === "/packages" ? 0.9 : 0.7,
    })),
  ];
}
