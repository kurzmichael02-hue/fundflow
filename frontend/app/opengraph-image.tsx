import { ImageResponse } from "next/og"

// Default Open Graph image for the landing page (and any page that doesn't
// override it). 1200x630 — the size every social platform expects, no
// cropping in feeds.
//
// Designed in the same editorial language as the live site: Fraunces-style
// serif headline, monospace kicker, hairline emerald accent, deep dark
// background. Self-rendered via Next's Edge ImageResponse so we don't ship
// a static PNG that drifts out of sync with the brand.

export const runtime = "edge"
export const alt = "FundFlow — Investor CRM for Web3 founders"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function OpengraphImage() {
  // Fraunces and JetBrains Mono are loaded from the Google Fonts CDN — the
  // edge runtime fetches them once at render time and the result is cached
  // by the platform.
  const [serif, mono] = await Promise.all([
    fetch("https://fonts.gstatic.com/s/fraunces/v37/6NUh8FyLNQOQZAnv9bYEvDiIdE9Eb-9_Ahq8qnA8WLQ.woff", { cache: "force-cache" })
      .then(r => r.ok ? r.arrayBuffer() : null).catch(() => null),
    fetch("https://fonts.gstatic.com/s/jetbrainsmono/v24/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yKxjPVmUsaaDhw.woff", { cache: "force-cache" })
      .then(r => r.ok ? r.arrayBuffer() : null).catch(() => null),
  ])

  const fonts = [
    serif ? { name: "Fraunces", data: serif as ArrayBuffer, weight: 500 as const, style: "normal" as const } : null,
    mono  ? { name: "Mono",     data: mono  as ArrayBuffer, weight: 400 as const, style: "normal" as const } : null,
  ].filter(Boolean) as Array<{ name: string; data: ArrayBuffer; weight: 500 | 400; style: "normal" }>

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%",
          background: "#060608",
          color: "#e5e7eb",
          padding: "72px 80px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          fontFamily: "Mono, monospace",
        }}
      >
        {/* Top strip — wordmark + issue */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 18 }}>
            <span style={{ fontFamily: "Serif", fontSize: 36, color: "#fff", letterSpacing: "-0.02em", fontWeight: 500 }}>
              FundFlow
            </span>
            <span style={{ fontSize: 14, color: "#64748b", letterSpacing: "0.12em", textTransform: "uppercase" }}>
              Beta · v0.1
            </span>
          </div>
          <span style={{ fontSize: 14, color: "#64748b", letterSpacing: "0.12em", textTransform: "uppercase" }}>
            Issue 01 · Spring 2026
          </span>
        </div>

        {/* Hero block */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: 16, color: "#10b981", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 28 }}>
            The investor CRM for Web3 founders
          </span>
          <div style={{
            fontFamily: "Serif",
            color: "#fff",
            fontSize: 124,
            lineHeight: 0.95,
            letterSpacing: "-0.045em",
            fontWeight: 500,
            display: "flex",
            flexDirection: "column",
          }}>
            <span>Raise the</span>
            round.
          </div>
        </div>

        {/* Footer strip */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          paddingTop: 28,
          borderTop: "1px solid rgba(255,255,255,0.1)",
          fontSize: 16, color: "#64748b", letterSpacing: "0.06em",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981" }} />
            <span style={{ color: "#34d399", textTransform: "uppercase", letterSpacing: "0.12em" }}>Live</span>
          </div>
          <span>fundflow-omega.vercel.app</span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: fonts.length > 0 ? fonts : undefined,
    },
  )
}
