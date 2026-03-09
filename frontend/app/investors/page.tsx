"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"

interface Investor {
  id: string
  name: string
  email: string
  company: string
  status: string
  amount: number
  notes: string
}

export default function InvestorsPage() {
  const router = useRouter()
  const [investors, setInvestors] = useState<Investor[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: "", email: "", company: "", status: "outreach", amount: "", notes: "" })

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) { router.push("/login"); return }
    fetchInvestors()
  }, [])

  async function fetchInvestors() {
    try {
      const data = await api.getInvestors()
      setInvestors(data)
    } catch {
      router.push("/login")
    } finally {
      setLoading(false)
    }
  }

  async function handleAdd() {
    try {
      await api.addInvestor({ ...form, amount: Number(form.amount) })
      setForm({ name: "", email: "", company: "", status: "outreach", amount: "", notes: "" })
      setShowForm(false)
      fetchInvestors()
    } catch (err: any) {
      alert(err.message)
    }
  }

  async function handleDelete(id: string) {
    try {
      await api.deleteInvestor(id)
      fetchInvestors()
    } catch (err: any) {
      alert(err.message)
    }
  }

  if (loading) return <div style={{ color: "#fff", padding: 40 }}>Loading...</div>

  return (
    <div style={{ minHeight: "100vh", background: "#080c14", color: "#e6edf3", padding: "40px 48px" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <h1 style={{ fontSize: 24, fontWeight: 600 }}>Investors</h1>
          <button onClick={() => setShowForm(!showForm)}
            style={{ background: "#58a6ff", color: "#0d1117", border: "none", borderRadius: 6, padding: "8px 18px", fontWeight: 600, cursor: "pointer" }}>
            + Add Investor
          </button>
        </div>

        {showForm && (
          <div style={{ background: "#0d1117", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: 24, marginBottom: 24 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {["name", "email", "company", "amount"].map(field => (
                <input key={field} placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                  value={(form as any)[field]}
                  onChange={e => setForm({ ...form, [field]: e.target.value })}
                  style={{ background: "#161b22", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, padding: "8px 12px", color: "#e6edf3", fontSize: 14 }} />
              ))}
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                style={{ background: "#161b22", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, padding: "8px 12px", color: "#e6edf3", fontSize: 14 }}>
                <option value="outreach">Outreach</option>
                <option value="interested">Interested</option>
                <option value="meeting">Meeting</option>
                <option value="term_sheet">Term Sheet</option>
                <option value="closed">Closed</option>
              </select>
              <input placeholder="Notes" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                style={{ background: "#161b22", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, padding: "8px 12px", color: "#e6edf3", fontSize: 14 }} />
            </div>
            <button onClick={handleAdd}
              style={{ marginTop: 16, background: "#58a6ff", color: "#0d1117", border: "none", borderRadius: 6, padding: "8px 18px", fontWeight: 600, cursor: "pointer" }}>
              Save
            </button>
          </div>
        )}

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", textAlign: "left" }}>
              {["Name", "Company", "Status", "Amount", ""].map(h => (
                <th key={h} style={{ padding: "8px 12px", fontSize: 11, color: "#7d8590", textTransform: "uppercase", letterSpacing: "0.08em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {investors.map(inv => (
              <tr key={inv.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                <td style={{ padding: "12px", fontSize: 13, color: "#e6edf3", fontWeight: 500 }}>{inv.name}</td>
                <td style={{ padding: "12px", fontSize: 13, color: "#7d8590" }}>{inv.company}</td>
                <td style={{ padding: "12px" }}>
                  <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 100, background: "rgba(88,166,255,0.1)", color: "#58a6ff", border: "1px solid rgba(88,166,255,0.2)" }}>
                    {inv.status}
                  </span>
                </td>
                <td style={{ padding: "12px", fontSize: 13, color: "#e6edf3" }}>{inv.amount ? `$${inv.amount}` : "—"}</td>
                <td style={{ padding: "12px" }}>
                  <button onClick={() => handleDelete(inv.id)}
                    style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 4, color: "#7d8590", padding: "4px 10px", fontSize: 12, cursor: "pointer" }}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {investors.length === 0 && (
          <div style={{ textAlign: "center", color: "#7d8590", padding: 60, fontSize: 14 }}>No investors yet. Add your first one.</div>
        )}
      </div>
    </div>
  )
}