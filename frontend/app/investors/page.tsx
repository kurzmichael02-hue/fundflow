"use client"
import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import Navbar from "@/components/Navbar"
import {
  RiAddLine,
  RiEditLine,
  RiDeleteBinLine,
  RiCheckLine,
  RiCloseLine,
  RiUserLine,
  RiSearchLine,
  RiFilterLine,
  RiDownloadLine,
} from "react-icons/ri"

interface Investor {
  id: string
  name: string
  email: string
  company: string
  status: string
  amount: number
  notes: string
}

const STATUS_OPTIONS = ["outreach", "interested", "meeting", "term_sheet", "closed"]

const STATUS_STYLES: Record<string, { bg: string; color: string; border: string; label: string }> = {
  outreach:   { bg: "rgba(107,114,128,0.12)", color: "#9ca3af", border: "rgba(107,114,128,0.25)", label: "Outreach" },
  interested: { bg: "rgba(139,92,246,0.12)",  color: "#a78bfa", border: "rgba(139,92,246,0.25)", label: "Interested" },
  meeting:    { bg: "rgba(245,158,11,0.12)",  color: "#fbbf24", border: "rgba(245,158,11,0.25)", label: "Meeting" },
  term_sheet: { bg: "rgba(14,165,233,0.12)",  color: "#38bdf8", border: "rgba(14,165,233,0.25)", label: "Term Sheet" },
  closed:     { bg: "rgba(16,185,129,0.12)",  color: "#34d399", border: "rgba(16,185,129,0.25)", label: "Closed" },
}

const EMPTY_FORM = { name: "", email: "", company: "", status: "outreach", amount: "", notes: "" }

function exportToCSV(investors: Investor[]) {
  const headers = ["Name", "Email", "Company", "Status", "Amount", "Notes"]
  const rows = investors.map(inv => [
    inv.name || "",
    inv.email || "",
    inv.company || "",
    STATUS_STYLES[inv.status]?.label || inv.status,
    inv.amount ? String(inv.amount) : "",
    inv.notes || "",
  ])
  const csv = [headers, ...rows].map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(",")).join("\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `fundflow-investors-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function InvestorsPage() {
  const router = useRouter()
  const [investors, setInvestors] = useState<Investor[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<Investor>>({})
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")

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
    if (!form.name.trim()) return
    setSaving(true)
    try {
      await api.addInvestor({ ...form, amount: Number(form.amount) })
      setForm(EMPTY_FORM)
      setShowForm(false)
      fetchInvestors()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this investor?")) return
    try {
      await api.deleteInvestor(id)
      fetchInvestors()
    } catch (err: any) {
      alert(err.message)
    }
  }

  function startEdit(inv: Investor) {
    setEditingId(inv.id)
    setEditForm({ name: inv.name, email: inv.email, company: inv.company, status: inv.status, amount: inv.amount, notes: inv.notes })
  }

  async function handleSaveEdit(id: string) {
    setSaving(true)
    try {
      await api.updateInvestor(id, { ...editForm, amount: Number(editForm.amount) })
      setEditingId(null)
      fetchInvestors()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setSaving(false)
    }
  }

  const filtered = useMemo(() => {
    return investors.filter(inv => {
      const matchSearch = search === "" ||
        inv.name?.toLowerCase().includes(search.toLowerCase()) ||
        inv.company?.toLowerCase().includes(search.toLowerCase()) ||
        inv.email?.toLowerCase().includes(search.toLowerCase())
      const matchStatus = filterStatus === "all" || inv.status === filterStatus
      return matchSearch && matchStatus
    })
  }, [investors, search, filterStatus])

  if (loading) return (
    <div className="min-h-screen bg-[#04070f] flex items-center justify-center">
      <div className="flex items-center gap-3 text-slate-500 text-sm">
        <div className="w-4 h-4 rounded-full border-2 border-sky-500 border-t-transparent animate-spin" />
        Loading investors...
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#04070f] text-slate-200">
      <Navbar />
      <div className="px-4 md:px-12 py-8 max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">Investors</h1>
            <p className="text-xs md:text-sm text-slate-500 mt-0.5">{investors.length} investor{investors.length !== 1 ? "s" : ""} in your pipeline</p>
          </div>
          <div className="flex items-center gap-2">
            {investors.length > 0 && (
              <button
                onClick={() => exportToCSV(filtered.length > 0 ? filtered : investors)}
                className="flex items-center gap-1.5 px-3 py-2 md:py-2.5 rounded-xl text-xs md:text-sm font-medium text-slate-400 border border-white/[0.08] cursor-pointer transition-all hover:text-slate-200"
                style={{ background: "rgba(255,255,255,0.03)" }}>
                <RiDownloadLine size={14} /> Export
              </button>
            )}
            <button
              onClick={() => { setShowForm(!showForm); setEditingId(null) }}
              className="flex items-center gap-1.5 px-3 md:px-4 py-2 md:py-2.5 rounded-xl text-xs md:text-sm font-semibold text-white cursor-pointer border-0"
              style={{ background: "linear-gradient(135deg, #0ea5e9, #0284c7)" }}>
              <RiAddLine size={15} /> Add Investor
            </button>
          </div>
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-2.5 mb-5">
          <div className="relative flex-1">
            <RiSearchLine size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, company or email..."
              className="w-full rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-300 border border-white/[0.07] outline-none"
              style={{ background: "rgba(255,255,255,0.03)" }}
            />
          </div>
          <div className="relative">
            <RiFilterLine size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="rounded-xl pl-9 pr-4 py-2.5 text-sm border border-white/[0.07] outline-none cursor-pointer"
              style={{ background: "rgba(255,255,255,0.03)", color: filterStatus === "all" ? "#64748b" : STATUS_STYLES[filterStatus]?.color }}>
              <option value="all">All statuses</option>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_STYLES[s].label}</option>)}
            </select>
          </div>
        </div>

        {/* Add form */}
        {showForm && (
          <div className="rounded-2xl border border-white/[0.08] p-4 md:p-6 mb-5"
            style={{ background: "rgba(255,255,255,0.02)" }}>
            <p className="text-sm font-semibold text-white mb-4">New Investor</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { key: "name", placeholder: "Full name *" },
                { key: "email", placeholder: "Email address" },
                { key: "company", placeholder: "Company / Fund" },
                { key: "amount", placeholder: "Target amount ($)" },
              ].map(f => (
                <input key={f.key} placeholder={f.placeholder} value={(form as any)[f.key]}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  className="rounded-xl px-3.5 py-2.5 text-sm text-slate-200 border border-white/[0.08] outline-none"
                  style={{ background: "rgba(255,255,255,0.04)" }} />
              ))}
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                className="rounded-xl px-3.5 py-2.5 text-sm border border-white/[0.08] outline-none"
                style={{ background: "rgba(14,7,15,0.9)", color: STATUS_STYLES[form.status]?.color || "#e2e8f0" }}>
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_STYLES[s].label}</option>)}
              </select>
              <input placeholder="Notes" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                className="rounded-xl px-3.5 py-2.5 text-sm text-slate-200 border border-white/[0.08] outline-none"
                style={{ background: "rgba(255,255,255,0.04)" }} />
            </div>
            <div className="flex gap-2.5 mt-4">
              <button onClick={handleAdd} disabled={saving || !form.name.trim()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 cursor-pointer border-0"
                style={{ background: "linear-gradient(135deg, #0ea5e9, #0284c7)" }}>
                <RiCheckLine size={15} /> {saving ? "Saving..." : "Save"}
              </button>
              <button onClick={() => { setShowForm(false); setForm(EMPTY_FORM) }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-slate-400 border border-white/[0.08] cursor-pointer"
                style={{ background: "transparent" }}>
                <RiCloseLine size={15} /> Cancel
              </button>
            </div>
          </div>
        )}

        {/* No results */}
        {filtered.length === 0 && investors.length > 0 && (
          <div className="text-center py-12 text-slate-600 text-sm rounded-2xl border border-white/[0.05]"
            style={{ background: "rgba(255,255,255,0.01)" }}>
            No investors match your search.{" "}
            <button onClick={() => { setSearch(""); setFilterStatus("all") }} className="text-sky-400 cursor-pointer bg-transparent border-0">Clear filters</button>
          </div>
        )}

        {/* Desktop table */}
        {filtered.length > 0 && (
          <div className="hidden md:block rounded-2xl border border-white/[0.06] overflow-hidden"
            style={{ background: "rgba(255,255,255,0.015)" }}>
            <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_auto] gap-4 px-5 py-3 border-b border-white/[0.05]"
              style={{ background: "rgba(255,255,255,0.02)" }}>
              {["Investor", "Company", "Status", "Amount", ""].map((h, i) => (
                <span key={i} className="text-[11px] text-slate-600 uppercase tracking-widest font-medium">{h}</span>
              ))}
            </div>
            {filtered.map((inv, idx) => (
              <div key={inv.id}
                className={`grid grid-cols-[2fr_1.5fr_1fr_1fr_auto] gap-4 px-5 py-4 items-center hover:bg-white/[0.02] ${idx !== filtered.length - 1 ? "border-b border-white/[0.04]" : ""}`}>
                {editingId === inv.id ? (
                  <>
                    <input value={editForm.name || ""} onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                      className="rounded-lg px-3 py-1.5 text-sm text-slate-200 border border-sky-500/30 outline-none"
                      style={{ background: "rgba(14,165,233,0.06)" }} />
                    <input value={editForm.company || ""} onChange={e => setEditForm({ ...editForm, company: e.target.value })}
                      className="rounded-lg px-3 py-1.5 text-sm text-slate-200 border border-white/[0.08] outline-none"
                      style={{ background: "rgba(255,255,255,0.04)" }} />
                    <select value={editForm.status || "outreach"} onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                      className="rounded-lg px-2 py-1.5 text-xs border border-white/[0.08] outline-none"
                      style={{ background: "rgba(14,7,15,0.9)", color: STATUS_STYLES[editForm.status || "outreach"]?.color }}>
                      {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_STYLES[s].label}</option>)}
                    </select>
                    <input value={editForm.amount || ""} onChange={e => setEditForm({ ...editForm, amount: e.target.value as any })}
                      placeholder="Amount" className="rounded-lg px-3 py-1.5 text-sm text-slate-200 border border-white/[0.08] outline-none"
                      style={{ background: "rgba(255,255,255,0.04)" }} />
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => handleSaveEdit(inv.id)} disabled={saving}
                        className="flex items-center justify-center w-8 h-8 rounded-lg text-emerald-400 border border-emerald-500/20 cursor-pointer"
                        style={{ background: "rgba(16,185,129,0.06)" }}>
                        <RiCheckLine size={15} />
                      </button>
                      <button onClick={() => { setEditingId(null); setEditForm({}) }}
                        className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-500 border border-white/[0.08] cursor-pointer"
                        style={{ background: "transparent" }}>
                        <RiCloseLine size={15} />
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="min-w-0">
                      <p className="text-[13px] text-slate-200 font-medium truncate">{inv.name}</p>
                      {inv.email && <p className="text-[11px] text-slate-600 truncate">{inv.email}</p>}
                    </div>
                    <p className="text-[13px] text-slate-500 truncate">{inv.company || "—"}</p>
                    <div>
                      <span className="text-[11px] px-2.5 py-1 rounded-full font-medium"
                        style={{ background: STATUS_STYLES[inv.status]?.bg, color: STATUS_STYLES[inv.status]?.color, border: `1px solid ${STATUS_STYLES[inv.status]?.border}` }}>
                        {STATUS_STYLES[inv.status]?.label || inv.status}
                      </span>
                    </div>
                    <p className="text-[13px] text-slate-300 font-medium">{inv.amount ? `$${Number(inv.amount).toLocaleString()}` : "—"}</p>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => startEdit(inv)}
                        className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-500 border border-white/[0.08] hover:text-sky-400 cursor-pointer"
                        style={{ background: "transparent" }}>
                        <RiEditLine size={14} />
                      </button>
                      <button onClick={() => handleDelete(inv.id)}
                        className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-500 border border-white/[0.08] hover:text-red-400 cursor-pointer"
                        style={{ background: "transparent" }}>
                        <RiDeleteBinLine size={14} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Mobile cards */}
        {filtered.length > 0 && (
          <div className="md:hidden flex flex-col gap-3">
            {filtered.map(inv => {
              const status = STATUS_STYLES[inv.status] || STATUS_STYLES.outreach
              return (
                <div key={inv.id} className="rounded-2xl border border-white/[0.06] p-4"
                  style={{ background: "rgba(255,255,255,0.02)" }}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-[14px] text-white font-semibold">{inv.name}</p>
                      {inv.company && <p className="text-[12px] text-slate-500 mt-0.5">{inv.company}</p>}
                      {inv.email && <p className="text-[11px] text-slate-600 mt-0.5">{inv.email}</p>}
                    </div>
                    <div className="flex items-center gap-1.5 ml-3">
                      <button onClick={() => startEdit(inv)}
                        className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-500 border border-white/[0.08] cursor-pointer"
                        style={{ background: "transparent" }}>
                        <RiEditLine size={14} />
                      </button>
                      <button onClick={() => handleDelete(inv.id)}
                        className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-500 border border-white/[0.08] cursor-pointer"
                        style={{ background: "transparent" }}>
                        <RiDeleteBinLine size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] px-2.5 py-1 rounded-full font-medium"
                      style={{ background: status.bg, color: status.color, border: `1px solid ${status.border}` }}>
                      {status.label}
                    </span>
                    <span className="text-[13px] text-slate-300 font-medium">
                      {inv.amount ? `$${Number(inv.amount).toLocaleString()}` : "—"}
                    </span>
                  </div>
                  {editingId === inv.id && (
                    <div className="mt-4 pt-4 border-t border-white/[0.06] flex flex-col gap-2.5">
                      <input value={editForm.name || ""} onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                        placeholder="Name" className="rounded-lg px-3 py-2 text-sm text-slate-200 border border-sky-500/30 outline-none w-full"
                        style={{ background: "rgba(14,165,233,0.06)" }} />
                      <input value={editForm.company || ""} onChange={e => setEditForm({ ...editForm, company: e.target.value })}
                        placeholder="Company" className="rounded-lg px-3 py-2 text-sm text-slate-200 border border-white/[0.08] outline-none w-full"
                        style={{ background: "rgba(255,255,255,0.04)" }} />
                      <select value={editForm.status || "outreach"} onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                        className="rounded-lg px-3 py-2 text-sm border border-white/[0.08] outline-none w-full"
                        style={{ background: "rgba(14,7,15,0.9)", color: STATUS_STYLES[editForm.status || "outreach"]?.color }}>
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_STYLES[s].label}</option>)}
                      </select>
                      <input value={editForm.amount || ""} onChange={e => setEditForm({ ...editForm, amount: e.target.value as any })}
                        placeholder="Amount" className="rounded-lg px-3 py-2 text-sm text-slate-200 border border-white/[0.08] outline-none w-full"
                        style={{ background: "rgba(255,255,255,0.04)" }} />
                      <div className="flex gap-2">
                        <button onClick={() => handleSaveEdit(inv.id)} disabled={saving}
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer border-0"
                          style={{ background: "linear-gradient(135deg, #0ea5e9, #0284c7)" }}>
                          <RiCheckLine size={14} /> Save
                        </button>
                        <button onClick={() => { setEditingId(null); setEditForm({}) }}
                          className="flex-1 py-2.5 rounded-xl text-sm text-slate-400 border border-white/[0.08] cursor-pointer"
                          style={{ background: "transparent" }}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Empty state */}
        {investors.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-16 text-center rounded-2xl border border-white/[0.06]"
            style={{ background: "rgba(255,255,255,0.015)" }}>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-slate-700 border border-white/[0.06]"
              style={{ background: "rgba(255,255,255,0.02)" }}>
              <RiUserLine size={22} />
            </div>
            <p className="text-sm text-slate-600">No investors yet.</p>
          </div>
        )}

      </div>
    </div>
  )
}