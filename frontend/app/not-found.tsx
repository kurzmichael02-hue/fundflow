import Link from "next/link"

export default function NotFound() {
  return (
    <main style={{
      minHeight: "100vh",
      background: "#060608",
      color: "#e5e7eb",
      fontFamily: "'DM Sans', sans-serif",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{ maxWidth: 560, padding: "0 24px", textAlign: "left" }}>
        <div className="mono" style={{ fontSize: 11, color: "#64748b", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 24 }}>
          Error · 404 · Not found
        </div>
        <h1 className="serif" style={{
          color: "#fff",
          fontSize: "clamp(72px, 10vw, 140px)",
          lineHeight: 0.9,
          letterSpacing: "-0.05em",
          fontWeight: 500,
          marginBottom: 24,
        }}>
          Nothing<br />
          <span style={{ fontStyle: "italic", fontWeight: 400 }}>here.</span>
        </h1>
        <p style={{ fontSize: 17, color: "#94a3b8", lineHeight: 1.7, maxWidth: 440, marginBottom: 40 }}>
          The page you&apos;re looking for doesn&apos;t exist, or has moved. Head back to the home
          page, or straight to your dashboard if you&apos;re already a founder.
        </p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link href="/" className="no-underline"
            style={{
              background: "#10b981", color: "#fff",
              padding: "14px 22px", borderRadius: 2,
              fontSize: 14, fontWeight: 600,
            }}>
            Back to home →
          </Link>
          <Link href="/dashboard" className="no-underline"
            style={{
              color: "#cbd5e1", padding: "14px 22px",
              border: "1px solid rgba(255,255,255,0.12)", borderRadius: 2,
              fontSize: 14, fontWeight: 500,
            }}>
            Dashboard
          </Link>
        </div>
      </div>
    </main>
  )
}
