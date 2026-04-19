import { MetadataRoute } from "next"

// Single source of truth for the public base URL. Matches metadataBase in
// layout.tsx so sitemap, OG tags and canonical links never drift apart.
const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://fundflow-omega.vercel.app"

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  const routes: Array<{ path: string; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number }> = [
    { path: "",                    changeFrequency: "weekly",  priority: 1 },
    { path: "/about",              changeFrequency: "monthly", priority: 0.8 },
    { path: "/contact",            changeFrequency: "monthly", priority: 0.6 },
    { path: "/login",              changeFrequency: "monthly", priority: 0.5 },
    { path: "/register",           changeFrequency: "monthly", priority: 0.7 },
    { path: "/investor",           changeFrequency: "monthly", priority: 0.6 },
    { path: "/investor/register",  changeFrequency: "monthly", priority: 0.6 },
    { path: "/privacy",            changeFrequency: "yearly",  priority: 0.3 },
    { path: "/terms",              changeFrequency: "yearly",  priority: 0.3 },
  ]
  return routes.map(r => ({
    url: `${BASE}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }))
}