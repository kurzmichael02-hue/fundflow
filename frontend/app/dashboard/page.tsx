"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { api } from "@/lib/api"

export default function DashboardPage() {
  const router = useRouter()
  const [investors, setInvestors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) { router.push("/login"); return }
    api.getInvestors().then(data => { setInvestors(data); setLoading(false) }).catch(() => { setLoading(false) })
  }, [])

  const stats = {
    total: investors.length,
    active: investors.filter(i => ["interested", "meeting", "term_sheet"].includes(i.status)).length,
    closed: investors.filter(i => i.status === "closed").length,
    outreach: investors.filter(i => i.status === "outreach").length,
  }

  if (loading) return <div style={{ color: "#fff", padding: 40, background: "#04070f", minHeight: "100vh" }}>Loading...</div>

  return (
    <div style={{ minHeight: "100vh", background: "#04070f", color: "#e2e8f0" }}>
      {/* NAV */}
      <nav style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "0 48px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 26, height: 26, borderRadius: 6, background: "linear-gradient(135deg, #0ea5e9, #0284c7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: "#fff" }}>FF</div>
          <span style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>FundFlow</span>
        </div>
        <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
          {[["Dashboard", "/dashboard"], ["Investors", "/investors"], ["Pipeline", "/pipeline"]].map(([l, h]) => (
            <Link key={l} href={h} style={{ fontSize: 13, color: h === "/dashboard" ? "#fff" : "#64748b", textDecoration: "none", fontWeight: h === "/dashboard" ? 600 : 400 }}>{l}</Link>
          ))}
          <button onClick={() => { localStorage.removeItem("token"); router.push("/") }}
            style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444", borderRadius: 6, padding: "6px 14px", fontSize: 12, cursor: "pointer" }}>
            Logout
          </button>
        </div>
      </nav>

      <div style={{ padding: "40px 48px", maxWidth: 1100, margin: "0 auto" }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 32 }}>Dashboard</h1>

        {/* STATS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 40 }}>
          {[
            { label: "Total Investors", val: stats.total, color: "#0ea5e9" },
            { label: "Active Leads", val: stats.active, color: "#f59e0b" },
            { label: "Deals Closed", val: stats.closed, color: "#10b981" },
            { label: "Outreach", val: stats.outreach, color: "#8b5cf6" },
          ].map(s => (
            <div key={s.label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "20px 24px" }}>
              <div style={{ fontSize: 11, color: "#475569", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</div>
              <div style={{ fontSize: 36, fontWeight: 700, color: s.color, letterSpacing: "-0.02em" }}>{s.val}</div>
            </div>
          ))}
        </div>

        {/* RECENT INVESTORS */}
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600 }}>Recent Investors</h2>
            <Link href="/investors" style={{ fontSize: 12, color: "#0ea5e9", textDecoration: "none" }}>View all →</Link>
          </div>

          {investors.length === 0 ? (
            <div style={{ textAlign: "center", color: "#475569", padding: "40px 0", fontSize: 14 }}>
              No investors yet. <Link href="/investors" style={{ color: "#0ea5e9" }}>Add your first one →</Link>
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  {["Name", "Company", "Status", "Amount"].map(h => (
                    <th key={h} style={{ padding: "8px 12px", fontSize: 11, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "left" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {investors.slice(0, 8).map(inv => (
                  <tr key={inv.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                    <td style={{ padding: "12px", fontSize: 13, color: "#e2e8f0", fontWeight: 500 }}>{inv.name}</td>
                    <td style={{ padding: "12px", fontSize: 13, color: "#64748b" }}>{inv.company || "—"}</td>
                    <td style={{ padding: "12px" }}>
                      <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 100, background: "rgba(14,165,233,0.1)", color: "#0ea5e9", border: "1px solid rgba(14,165,233,0.2)" }}>
                        {inv.status}
                      </span>
                    </td>
                    <td style={{ padding: "12px", fontSize: 13, color: "#e2e8f0" }}>{inv.amount ? `$${inv.amount}` : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}