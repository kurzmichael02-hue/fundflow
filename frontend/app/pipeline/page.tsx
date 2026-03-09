"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"

type Status = "outreach" | "interested" | "meeting" | "term_sheet" | "closed"

const COLUMNS: { key: Status; label: string; color: string }[] = [
  { key: "outreach", label: "Outreach", color: "#6b7280" },
  { key: "interested", label: "Interested", color: "#3b82f6" },
  { key: "meeting", label: "Meeting", color: "#f59e0b" },
  { key: "term_sheet", label: "Term Sheet", color: "#8b5cf6" },
  { key: "closed", label: "Closed", color: "#10b981" },
]

export default function PipelinePage() {
  const router = useRouter()
  const [investors, setInvestors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) { router.push("/login"); return }
    api.getInvestors().then(data => { setInvestors(data); setLoading(false) }).catch(() => router.push("/login"))
  }, [])

  async function moveInvestor(id: string, status: Status) {
    setInvestors(prev => prev.map(i => i.id === id ? { ...i, status } : i))
  }

  if (loading) return <div style={{ color: "#fff", padding: 40 }}>Loading...</div>

  return (
    <main style={{ minHeight: "100vh", background: "#04070f", color: "#e2e8f0" }}>
      <nav style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "0 48px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 16, fontWeight: 700, color: "#0ea5e9" }}>FundFlow</span>
        <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
          {[["Dashboard", "/dashboard"], ["Investors", "/investors"], ["Pipeline", "/pipeline"]].map(([l, h]) => (
            <a key={l} href={h} style={{ fontSize: 13, color: h === "/pipeline" ? "#fff" : "#64748b", textDecoration: "none", fontWeight: h === "/pipeline" ? 600 : 400 }}>{l}</a>
          ))}
          <button onClick={() => { localStorage.removeItem("token"); router.push("/") }}
            style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444", borderRadius: 6, padding: "6px 14px", fontSize: 12, cursor: "pointer" }}>
            Logout
          </button>
        </div>
      </nav>

      <div style={{ padding: "40px 48px" }}>
        <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 32 }}>Pipeline</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16 }}>
          {COLUMNS.map(col => (
            <div key={col.key} style={{ background: "rgba(255,255,255,0.02)", borderRadius: 12, borderTop: `2px solid ${col.color}`, padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: col.color }}>{col.label}</span>
                <span style={{ fontSize: 11, background: "rgba(255,255,255,0.06)", borderRadius: 100, padding: "2px 8px", color: "#64748b" }}>
                  {investors.filter(i => i.status === col.key).length}
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {investors.filter(i => i.status === col.key).map(inv => (
                  <div key={inv.id} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: 12 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "#e2e8f0", marginBottom: 2 }}>{inv.name}</div>
                    <div style={{ fontSize: 11, color: "#475569", marginBottom: 10 }}>{inv.company || "—"}</div>
                    <select value={inv.status} onChange={e => moveInvestor(inv.id, e.target.value as Status)}
                      style={{ width: "100%", background: "#0d1117", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, color: "#94a3b8", fontSize: 11, padding: "4px 8px", outline: "none" }}>
                      {COLUMNS.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                    </select>
                  </div>
                ))}
                {investors.filter(i => i.status === col.key).length === 0 && (
                  <div style={{ fontSize: 11, color: "#1e293b", textAlign: "center", padding: "20px 0" }}>Empty</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}