import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  outputFileTracingIncludes: {
    "/api/free-checklist/download": ["./private/free-checklist/**/*"],
  },
};

export default nextConfig;
