"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/Navbar"
import { ToastContainer, useToast } from "@/components/Toast"
import {
  RiAddLine, RiSearchLine, RiEditLine, RiDeleteBinLine,
  RiCheckLine, RiCloseLine, RiDownloadLine, RiUserLine
} from "react-icons/ri"

const STATUSES = ["outreach", "interested", "meeting", "term_sheet", "closed"]
const STATUS_STYLES: Record<string, { bg: string; color: string; border: string; label: string }> = {
  outreach:   { bg: "rgba(107,114,128,0.12)", color: "#9ca3af", border: "rgba(107,114,128,0.25)", label: "Outreach" },
  interested: { bg: "rgba(139,92,246,0.12)",  color: "#a78bfa", border: "rgba(139,92,246,0.25)", label: "Interested" },
  meeting:    { bg: "rgba(245,158,11,0.12)",  color: "#fbbf24", border: "rgba(245,158,11,0.25)", label: "Meeting" },
  term_sheet: { bg: "rgba(14,165,233,0.12)",  color: "#38bdf8", border: "rgba(14,165,233,0.25)", label: "Term Sheet" },
  closed:     { bg: "rgba(16,185,129,0.12)",  color: "#34d399", border: "rgba(16,185,129,0.25)", label: "Closed" },
}

const EMPTY_FORM = { name: "", company: "", email: "", status: "outreach", deal_size: "", notes: "" }

export default function InvestorsPage() {
  const router = useRouter()
  const { toasts, addToast, removeToast } = useToast()

  const [investors, setInvestors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [editData, setEditData] = useState<any>({})

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) { router.push("/login"); return }
    fetchInvestors(token)
  }, [])

  async function fetchInvestors(token: string) {
    try {
      const res = await fetch("/api/investors", { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      setInvestors(Array.isArray(data) ? data : [])
    } catch {
      addToast("Failed to load investors", "error")
    } finally {
      setLoading(false)
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const token = localStorage.getItem("token")!
    try {
      const res = await fetch("/api/investors", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        if (data.limit) {
          addToast("Free plan limit reached — upgrade to Pro for unlimited investors", "error")
        } else {
          throw new Error(data.error)
        }
        return
      }
      setInvestors(prev => [data, ...prev])
      setForm(EMPTY_FORM)
      setShowAdd(false)
      addToast(`${data.name} added!`)
    } catch (err: any) {
      addToast(err.message || "Failed to add investor", "error")
    } finally {
      setSaving(false)
    }
  }

  async function handleEdit(inv: any) {
    setEditId(inv.id)
    setEditData({ name: inv.name, company: inv.company || "", email: inv.email || "", status: inv.status, deal_size: inv.deal_size || "", notes: inv.notes || "" })
  }

  async function handleSaveEdit(id: string) {
    const token = localStorage.getItem("token")!
    try {
      const res = await fetch(`/api/investors?id=${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(editData),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setInvestors(prev => prev.map(i => i.id === id ? data : i))
      setEditId(null)
      addToast("Investor updated!")
    } catch (err: any) {
      addToast(err.message || "Failed to update", "error")
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete ${name}?`)) return
    const token = localStorage.getItem("token")!
    try {
      const res = await fetch(`/api/investors?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error("Failed to delete")
      setInvestors(prev => prev.filter(i => i.id !== id))
      addToast(`${name} deleted`)
    } catch (err: any) {
      addToast(err.message || "Failed to delete", "error")
    }
  }

  function handleExportCSV() {
    const headers = ["Name", "Company", "Email", "Status", "Deal Size", "Notes"]
    const rows = filtered.map(i => [i.name, i.company || "", i.email || "", i.status, i.deal_size || "", i.notes || ""])
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "investors.csv"
    a.click()
    URL.revokeObjectURL(url)
    addToast("CSV exported!")
  }

  const filtered = investors.filter(inv => {
    const matchSearch = !search ||
      inv.name?.toLowerCase().includes(search.toLowerCase()) ||
      inv.company?.toLowerCase().includes(search.toLowerCase()) ||
      inv.email?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === "all" || inv.status === statusFilter
    return matchSearch && matchStatus
  })

  if (loading) return (
    <div className="min-h-screen bg-[#04070f] flex items-center justify-center">
      <div className="flex items-center gap-3 text-slate-500 text-sm">
        <div className="w-4 h-4 rounded-full border-2 border-sky-500 border-t-transparent animate-spin" />
        Loading...
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#04070f] text-slate-200">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <Navbar />
      <div className="px-4 md:px-12 py-8 max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-6 flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">Investors</h1>
            <p className="text-xs text-slate-500 mt-0.5">{investors.length} investors in your pipeline</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium cursor-pointer border transition-all"
              style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)", color: "#64748b" }}>
              <RiDownloadLine size={13} /> Export CSV
            </button>
            <button onClick={() => setShowAdd(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white cursor-pointer border-0"
              style={{ background: "linear-gradient(135deg, #0ea5e9, #0284c7)" }}>
              <RiAddLine size={15} /> Add Investor
            </button>
          </div>
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <RiSearchLine size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, company or email..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-slate-200 border border-white/[0.08] outline-none"
              style={{ background: "rgba(255,255,255,0.03)" }} />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {["all", ...STATUSES].map(s => {
              const st = STATUS_STYLES[s]
              return (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer border transition-all"
                  style={{
                    background: statusFilter === s ? (st ? st.bg : "rgba(14,165,233,0.15)") : "rgba(255,255,255,0.03)",
                    borderColor: statusFilter === s ? (st ? st.border : "rgba(14,165,233,0.4)") : "rgba(255,255,255,0.07)",
                    color: statusFilter === s ? (st ? st.color : "#38bdf8") : "#64748b",
                  }}>
                  {s === "all" ? "All" : STATUS_STYLES[s]?.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Add Form */}
        {showAdd && (
          <div className="rounded-2xl border border-sky-500/20 p-5 mb-5"
            style={{ background: "rgba(14,165,233,0.04)" }}>
            <h3 className="text-sm font-semibold text-white mb-4">Add New Investor</h3>
            <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Name *" className="rounded-xl px-4 py-2.5 text-sm text-slate-200 border border-white/[0.08] outline-none"
                style={{ background: "rgba(255,255,255,0.03)" }} />
              <input value={form.company} onChange={e => setForm({ ...form, company: e.target.value })}
                placeholder="Company" className="rounded-xl px-4 py-2.5 text-sm text-slate-200 border border-white/[0.08] outline-none"
                style={{ background: "rgba(255,255,255,0.03)" }} />
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="Email" className="rounded-xl px-4 py-2.5 text-sm text-slate-200 border border-white/[0.08] outline-none"
                style={{ background: "rgba(255,255,255,0.03)" }} />
              <input value={form.deal_size} onChange={e => setForm({ ...form, deal_size: e.target.value })}
                placeholder="Deal size (e.g. $500k)" className="rounded-xl px-4 py-2.5 text-sm text-slate-200 border border-white/[0.08] outline-none"
                style={{ background: "rgba(255,255,255,0.03)" }} />
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                className="rounded-xl px-4 py-2.5 text-sm text-slate-200 border border-white/[0.08] outline-none"
                style={{ background: "rgba(255,255,255,0.03)" }}>
                {STATUSES.map(s => <option key={s} value={s}>{STATUS_STYLES[s]?.label}</option>)}
              </select>
              <input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                placeholder="Notes" className="rounded-xl px-4 py-2.5 text-sm text-slate-200 border border-white/[0.08] outline-none"
                style={{ background: "rgba(255,255,255,0.03)" }} />
              <div className="sm:col-span-2 flex gap-2 justify-end mt-1">
                <button type="button" onClick={() => { setShowAdd(false); setForm(EMPTY_FORM) }}
                  className="px-4 py-2 rounded-xl text-sm text-slate-400 cursor-pointer border border-white/[0.08] bg-transparent">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-white cursor-pointer border-0 disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg, #0ea5e9, #0284c7)" }}>
                  {saving ? "Adding..." : "Add Investor"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Table — desktop */}
        <div className="hidden md:block rounded-2xl border border-white/[0.06] overflow-hidden"
          style={{ background: "rgba(255,255,255,0.02)" }}>
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.05]" style={{ background: "rgba(255,255,255,0.02)" }}>
                {["Investor", "Status", "Deal Size", "Notes", ""].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-[11px] text-slate-600 uppercase tracking-wider font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filtered.length === 0 ? (
                <tr><td colSpan={5}>
                  <div className="flex flex-col items-center gap-2 py-12">
                    <RiUserLine size={20} className="text-slate-700" />
                    <p className="text-xs text-slate-700">No investors found</p>
                  </div>
                </td></tr>
              ) : filtered.map(inv => {
                const s = STATUS_STYLES[inv.status] || STATUS_STYLES.outreach
                const isEditing = editId === inv.id
                return (
                  <tr key={inv.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0"
                          style={{ background: `${s.color}20`, color: s.color }}>
                          {inv.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          {isEditing ? (
                            <input value={editData.name} onChange={e => setEditData({ ...editData, name: e.target.value })}
                              className="rounded-lg px-2 py-1 text-sm text-white border border-sky-500/30 outline-none w-32"
                              style={{ background: "rgba(14,165,233,0.08)" }} />
                          ) : (
                            <p className="text-[13px] text-slate-200 font-medium">{inv.name}</p>
                          )}
                          {isEditing ? (
                            <input value={editData.company} onChange={e => setEditData({ ...editData, company: e.target.value })}
                              className="rounded-lg px-2 py-1 text-xs text-slate-400 border border-white/[0.08] outline-none w-32 mt-1"
                              style={{ background: "rgba(255,255,255,0.03)" }} />
                          ) : (
                            <p className="text-[11px] text-slate-600">{inv.company || inv.email || "—"}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      {isEditing ? (
                        <select value={editData.status} onChange={e => setEditData({ ...editData, status: e.target.value })}
                          className="rounded-lg px-2 py-1 text-xs border border-white/[0.08] outline-none"
                          style={{ background: "rgba(255,255,255,0.05)", color: "#94a3b8" }}>
                          {STATUSES.map(s => <option key={s} value={s}>{STATUS_STYLES[s]?.label}</option>)}
                        </select>
                      ) : (
                        <span className="text-[11px] px-2.5 py-1 rounded-full font-medium"
                          style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
                          {s.label}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      {isEditing ? (
                        <input value={editData.deal_size} onChange={e => setEditData({ ...editData, deal_size: e.target.value })}
                          className="rounded-lg px-2 py-1 text-xs border border-white/[0.08] outline-none w-24"
                          style={{ background: "rgba(255,255,255,0.03)", color: "#94a3b8" }} />
                      ) : (
                        <span className="text-[13px] text-slate-400">{inv.deal_size || "—"}</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 max-w-[200px]">
                      {isEditing ? (
                        <input value={editData.notes} onChange={e => setEditData({ ...editData, notes: e.target.value })}
                          className="rounded-lg px-2 py-1 text-xs border border-white/[0.08] outline-none w-full"
                          style={{ background: "rgba(255,255,255,0.03)", color: "#94a3b8" }} />
                      ) : (
                        <span className="text-[11px] text-slate-600 truncate block">{inv.notes || "—"}</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5 justify-end">
                        {isEditing ? (
                          <>
                            <button onClick={() => handleSaveEdit(inv.id)}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-emerald-400 hover:bg-emerald-400/10 cursor-pointer border-0 bg-transparent transition-colors">
                              <RiCheckLine size={14} />
                            </button>
                            <button onClick={() => setEditId(null)}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:bg-white/5 cursor-pointer border-0 bg-transparent transition-colors">
                              <RiCloseLine size={14} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => handleEdit(inv)}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-300 cursor-pointer border-0 bg-transparent transition-colors">
                              <RiEditLine size={13} />
                            </button>
                            <button onClick={() => handleDelete(inv.id, inv.name)}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 hover:text-red-400 cursor-pointer border-0 bg-transparent transition-colors">
                              <RiDeleteBinLine size={13} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden flex flex-col gap-3">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12">
              <RiUserLine size={20} className="text-slate-700" />
              <p className="text-xs text-slate-700">No investors found</p>
            </div>
          ) : filtered.map(inv => {
            const s = STATUS_STYLES[inv.status] || STATUS_STYLES.outreach
            return (
              <div key={inv.id} className="rounded-2xl border border-white/[0.06] p-4"
                style={{ background: "rgba(255,255,255,0.02)" }}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
                      style={{ background: `${s.color}20`, color: s.color }}>
                      {inv.name?.[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-white truncate">{inv.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{inv.company || inv.email || "—"}</p>
                    </div>
                  </div>
                  <span className="text-[11px] px-2.5 py-1 rounded-full font-medium flex-shrink-0"
                    style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
                    {s.label}
                  </span>
                </div>
                {inv.deal_size && <p className="text-[11px] text-slate-500 mb-1">Deal: {inv.deal_size}</p>}
                {inv.notes && <p className="text-[11px] text-slate-600 mb-3 line-clamp-2">{inv.notes}</p>}
                <div className="flex items-center gap-2 pt-2 border-t border-white/[0.05]">
                  <button onClick={() => handleEdit(inv)}
                    className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-300 cursor-pointer border-0 bg-transparent transition-colors">
                    <RiEditLine size={12} /> Edit
                  </button>
                  <button onClick={() => handleDelete(inv.id, inv.name)}
                    className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-red-400 cursor-pointer border-0 bg-transparent transition-colors ml-auto">
                    <RiDeleteBinLine size={12} /> Delete
                  </button>
                </div>
              </div>
            )
          })}
        </div>

      </div>
    </div>
  )
}