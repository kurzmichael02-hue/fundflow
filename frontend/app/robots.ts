import { MetadataRoute } from "next"

// Explicit robots.txt — Next.js generates a permissive default if you skip
// this file, but it's nice to spell out exactly what we want indexed and
// where the sitemap lives. Disallows the API routes (no point indexing
// JSON), the authed app shell, and the password-recovery flow.
const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://fundflow-omega.vercel.app"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/dashboard",
          "/investors",
          "/pipeline",
          "/analytics",
          "/profile",
          "/forgot-password",
          "/reset-password",
        ],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  }
}
