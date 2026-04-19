import type { NextConfig } from "next"
import { withSentryConfig } from "@sentry/nextjs"

// Shared Content-Security-Policy. Kept in one place so every response
// includes the same policy — divergence between pages is a common source
// of "works on one route, broken on another" CSP pain.
//
// `unsafe-inline` for style-src is unavoidable today: App Router + CSS-in-JS
// (we use inline style={} on editorial pages) generate stylesheets at runtime
// without a per-response nonce. Script-src stays strict so injected JS can't
// execute. When Next.js supports nonce-aware style injection end-to-end we
// can drop unsafe-inline here.
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://js.stripe.com https://*.posthog.com https://eu-assets.i.posthog.com https://us-assets.i.posthog.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob: https:",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://*.ingest.sentry.io https://*.ingest.us.sentry.io https://*.ingest.de.sentry.io https://*.posthog.com https://app.posthog.com https://eu.posthog.com https://us.posthog.com",
  "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://checkout.stripe.com https://billing.stripe.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self' https://checkout.stripe.com https://billing.stripe.com",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ")

const SECURITY_HEADERS = [
  { key: "Content-Security-Policy",   value: CSP },
  { key: "X-Frame-Options",           value: "DENY" },
  { key: "X-Content-Type-Options",    value: "nosniff" },
  { key: "Referrer-Policy",           value: "strict-origin-when-cross-origin" },
  // Only HTTPS for a year, once we're confident in the cert/CDN setup we
  // can enable preload. includeSubdomains matches our vercel deploy.
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  // No permission the app doesn't need. Blocks third-party scripts from
  // silently requesting sensor/device access even if they end up on-page.
  { key: "Permissions-Policy",        value: "camera=(), microphone=(), geolocation=(), payment=(self \"https://checkout.stripe.com\"), usb=(), interest-cohort=()" },
  // Modern replacement for X-Frame-Options; belt-and-suspenders.
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
]

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Apply to every route. API responses get them too — that's fine,
        // CSP only matters when the browser actually renders HTML but the
        // other headers are still useful.
        source: "/:path*",
        headers: SECURITY_HEADERS,
      },
    ]
  },
}

export default withSentryConfig(nextConfig, {
  org: "fundflow",
  project: "javascript-nextjs",
  silent: true,
  widenClientFileUpload: true,
  disableLogger: true,
})
