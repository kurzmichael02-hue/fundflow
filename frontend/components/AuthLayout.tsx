"use client"
import Link from "next/link"
import PublicNav from "@/components/PublicNav"

// Shared editorial shell used by every auth page (founder + investor
// login/register/forgot/reset). Left column carries the kicker/title/intro,
// right column is whatever the page hands over as children.
// Kept as one file — the helper field/button/input styles travel with it.

export function AuthShell({
  kicker, title, intro, side, children,
}: {
  kicker: string
  title: React.ReactNode
  intro: string
  side: "founder" | "investor"
  children: React.ReactNode
}) {
  return (
    <main style={{ background: "#060608", color: "#e5e7eb", fontFamily: "'DM Sans', sans-serif", minHeight: "100vh" }}>
      <PublicNav />
      <section>
        <div className="max-w-[1180px] mx-auto px-6 md:px-10">
          <div className="flex items-center justify-between pt-10 md:pt-14 pb-8 md:pb-12"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <span className="mono" style={{ fontSize: 11, color: "#64748b", letterSpacing: "0.12em", textTransform: "uppercase" }}>
              {side === "founder" ? "Founder portal" : "Investor portal"}
            </span>
            <Link
              href={side === "founder" ? "/investor" : "/login"}
              className="mono no-underline"
              style={{ fontSize: 11, color: "#94a3b8", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              {side === "founder" ? "Investor? →" : "Founder? →"}
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 pt-16 md:pt-24 pb-20 md:pb-28 items-start">
            <div className="md:col-span-6">
              <p className="mono mb-5" style={{ fontSize: 11, color: "#10b981", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                {kicker}
              </p>
              <h1 className="serif text-white" style={{
                fontSize: "clamp(44px, 6vw, 80px)",
                lineHeight: 0.95,
                letterSpacing: "-0.045em",
                fontWeight: 500,
              }}>
                {title}
              </h1>
              <p style={{ fontSize: 17, color: "#94a3b8", lineHeight: 1.7, marginTop: 28, maxWidth: 420, fontWeight: 300 }}>
                {intro}
              </p>
            </div>
            <div className="md:col-span-6">
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.14)", paddingTop: 40 }}>
                {children}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export function AuthField({
  label, aside, children,
}: {
  label: string
  aside?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 10 }}>
        <label className="mono" style={{ fontSize: 10, color: "#64748b", letterSpacing: "0.12em", textTransform: "uppercase" }}>
          {label}
        </label>
        {aside}
      </div>
      {children}
    </div>
  )
}

// Underline-style input matches the contact form and every other editorial
// input on the public side. Kept as an exported style object rather than a
// component so pages can add paddingRight for icon buttons etc.
export const AUTH_INPUT: React.CSSProperties = {
  width: "100%",
  background: "transparent",
  border: 0,
  borderBottom: "1px solid rgba(255,255,255,0.18)",
  color: "#e5e7eb",
  fontSize: 15,
  outline: "none",
  padding: "10px 0",
  boxSizing: "border-box",
  fontFamily: "inherit",
}

export const PW_TOGGLE: React.CSSProperties = {
  position: "absolute",
  right: 0, top: "50%", transform: "translateY(-50%)",
  background: "none", border: "none", color: "#64748b",
  cursor: "pointer", display: "flex", alignItems: "center", padding: 4,
}

export const AUTH_SUBMIT: React.CSSProperties = {
  background: "#10b981",
  color: "#fff",
  padding: "14px 24px",
  borderRadius: 2,
  fontSize: 14, fontWeight: 600,
  border: 0,
  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
  alignSelf: "flex-start",
  marginTop: 4,
}

export const AUTH_ERROR: React.CSSProperties = {
  fontSize: 13, color: "#f87171",
  padding: "12px 14px",
  background: "rgba(248,113,113,0.06)",
  border: "1px solid rgba(248,113,113,0.2)",
  borderRadius: 2,
}
