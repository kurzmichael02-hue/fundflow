import { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://fundflow.io", lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: "https://fundflow.io/about", lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: "https://fundflow.io/login", lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: "https://fundflow.io/register", lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: "https://fundflow.io/privacy", lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: "https://fundflow.io/terms", lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ]
}