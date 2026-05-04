import { ImageResponse } from "next/og"

// Default Open Graph image for the landing page (and any page that doesn't
// override it). 1200x630 — the size every social platform expects, no
// cropping in feeds.
//
// Mono-only OG card. Same JetBrains Mono everywhere — no display serif,
// no editorial vibe. Reads as a Bloomberg-terminal frame the moment a
// recipient hovers the link in Slack/Discord/Telegram.

export const runtime = "edge"
export const alt = "fundflow — CRM for Web3 founders raising rounds"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function OpengraphImage() {
  // Two weights of JetBrains Mono — 500 for the body, 700 for the
  // wordmark and headline. Single font family means consistent metrics
  // across every block of text on the card.
  const [monoRegular, monoBold] = await Promise.all([
    fetch("https://fonts.gstatic.com/s/jetbrainsmono/v24/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yKxjPVmUsaaDhw.woff", { cache: "force-cache" })
      .then(r => r.ok ? r.arrayBuffer() : null).catch(() => null),
    fetch("https://fonts.gstatic.com/s/jetbrainsmono/v24/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8VLA.woff", { cache: "force-cache" })
      .then(r => r.ok ? r.arrayBuffer() : null).catch(() => null),
  ])

  const fonts = [
    monoRegular ? { name: "Mono", data: monoRegular as ArrayBuffer, weight: 500 as const, style: "normal" as const } : null,
    monoBold    ? { name: "Mono", data: monoBold    as ArrayBuffer, weight: 700 as const, style: "normal" as const } : null,
  ].filter(Boolean) as Array<{ name: string; data: ArrayBuffer; weight: 500 | 700; style: "normal" }>

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%",
          background: "#060608",
          color: "#e5e7eb",
          padding: "64px 72px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          fontFamily: "Mono, monospace",
        }}
      >
        {/* Top: wordmark + faked block timestamp (computed at render time) */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 4 }}>
            <span style={{ fontFamily: "Mono", fontWeight: 700, fontSize: 36, color: "#fff", letterSpacing: "-0.04em" }}>
              fundflow
            </span>
            <div style={{ width: 10, height: 10, borderRadius: 9999, background: "#10b981", marginBottom: 4 }} />
          </div>
          <span style={{ fontSize: 14, color: "#64748b", letterSpacing: "0.04em" }}>
            BLOCK {Math.floor(((Date.now() / 1000) - 1438269973) / 12).toLocaleString("en-US")}
          </span>
        </div>

        {/* Hero — mono headline, two lines, status pill underneath */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{
            fontSize: 14, color: "#10b981",
            letterSpacing: "0.12em", textTransform: "uppercase",
            marginBottom: 24, fontWeight: 700,
          }}>
            ● CRM · WEB3 FOUNDERS · RAISING
          </span>
          <div style={{
            fontFamily: "Mono", fontWeight: 700,
            color: "#fff",
            fontSize: 92,
            lineHeight: 1.0,
            letterSpacing: "-0.05em",
            display: "flex",
            flexDirection: "column",
          }}>
            <span>your pipeline,</span>
            <span style={{ color: "#94a3b8" }}>and the VCs</span>
            <span>who find it.</span>
          </div>
        </div>

        {/* Footer strip — like the bottom of a terminal */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          paddingTop: 24,
          borderTop: "1px solid rgba(255,255,255,0.08)",
          fontSize: 15, color: "#64748b", letterSpacing: "0.04em",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#10b981" }} />
            <span style={{ color: "#34d399", textTransform: "uppercase", letterSpacing: "0.1em" }}>LIVE · BETA</span>
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
