"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import {
  RiAddLine,
  RiEditLine,
  RiDeleteBinLine,
  RiCheckLine,
  RiCloseLine,
  RiUserLine,
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

export default function InvestorsPage() {
  const router = useRouter()
  const [investors, setInvestors] = useState<Investor[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<Investor>>({})
  const [saving, setSaving] = useState(false)

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
    setEditForm({
      name: inv.name,
      email: inv.email,
      company: inv.company,
      status: inv.status,
      amount: inv.amount,
      notes: inv.notes,
    })
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

  function cancelEdit() {
    setEditingId(null)
    setEditForm({})
  }

  if (loading) return (
    <div className="min-h-screen bg-[#04070f] flex items-center justify-center">
      <div className="flex items-center gap-3 text-slate-500 text-sm">
        <div className="w-4 h-4 rounded-full border-2 border-sky-500 border-t-transparent animate-spin" />
        Loading investors...
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#04070f] text-slate-200 px-4 md:px-12 py-10">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Investors</h1>
            <p className="text-sm text-slate-500 mt-0.5">{investors.length} investor{investors.length !== 1 ? "s" : ""} in your pipeline</p>
          </div>
          <button
            onClick={() => { setShowForm(!showForm); setEditingId(null) }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:-translate-y-px hover:shadow-[0_8px_24px_rgba(14,165,233,0.3)] cursor-pointer border-0"
            style={{ background: "linear-gradient(135deg, #0ea5e9, #0284c7)" }}>
            <RiAddLine size={16} /> Add Investor
          </button>
        </div>

        {/* Add form */}
        {showForm && (
          <div className="rounded-2xl border border-white/[0.08] p-6 mb-6 transition-all"
            style={{ background: "rgba(255,255,255,0.02)" }}>
            <p className="text-sm font-semibold text-white mb-4">New Investor</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { key: "name", placeholder: "Full name *" },
                { key: "email", placeholder: "Email address" },
                { key: "company", placeholder: "Company / Fund" },
                { key: "amount", placeholder: "Target amount ($)" },
              ].map(f => (
                <input
                  key={f.key}
                  placeholder={f.placeholder}
                  value={(form as any)[f.key]}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  className="rounded-xl px-3.5 py-2.5 text-sm text-slate-200 border border-white/[0.08] outline-none focus:border-sky-500/40 transition-colors"
                  style={{ background: "rgba(255,255,255,0.04)" }}
                />
              ))}
              <select
                value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value })}
                className="rounded-xl px-3.5 py-2.5 text-sm border border-white/[0.08] outline-none focus:border-sky-500/40 transition-colors"
                style={{ background: "rgba(14,7,15,0.9)", color: STATUS_STYLES[form.status]?.color || "#e2e8f0" }}>
                {STATUS_OPTIONS.map(s => (
                  <option key={s} value={s}>{STATUS_STYLES[s].label}</option>
                ))}
              </select>
              <input
                placeholder="Notes"
                value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })}
                className="rounded-xl px-3.5 py-2.5 text-sm text-slate-200 border border-white/[0.08] outline-none focus:border-sky-500/40 transition-colors"
                style={{ background: "rgba(255,255,255,0.04)" }}
              />
            </div>
            <div className="flex gap-2.5 mt-4">
              <button
                onClick={handleAdd}
                disabled={saving || !form.name.trim()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 transition-all cursor-pointer border-0"
                style={{ background: "linear-gradient(135deg, #0ea5e9, #0284c7)" }}>
                <RiCheckLine size={15} /> {saving ? "Saving..." : "Save investor"}
              </button>
              <button
                onClick={() => { setShowForm(false); setForm(EMPTY_FORM) }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-slate-400 border border-white/[0.08] hover:bg-white/5 transition-all cursor-pointer"
                style={{ background: "transparent" }}>
                <RiCloseLine size={15} /> Cancel
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="rounded-2xl border border-white/[0.06] overflow-hidden"
          style={{ background: "rgba(255,255,255,0.015)" }}>

          {/* Table header */}
          <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_auto] gap-4 px-5 py-3 border-b border-white/[0.05]"
            style={{ background: "rgba(255,255,255,0.02)" }}>
            {["Investor", "Company", "Status", "Amount", ""].map((h, i) => (
              <span key={i} className="text-[11px] text-slate-600 uppercase tracking-widest font-medium">{h}</span>
            ))}
          </div>

          {/* Rows */}
          {investors.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-slate-700 border border-white/[0.06]"
                style={{ background: "rgba(255,255,255,0.02)" }}>
                <RiUserLine size={22} />
              </div>
              <p className="text-sm text-slate-600">No investors yet.</p>
              <p className="text-xs text-slate-700">Click "Add Investor" to get started.</p>
            </div>
          ) : (
            investors.map((inv, idx) => (
              <div
                key={inv.id}
                className={`grid grid-cols-[2fr_1.5fr_1fr_1fr_auto] gap-4 px-5 py-4 items-center transition-all hover:bg-white/[0.02] ${idx !== investors.length - 1 ? "border-b border-white/[0.04]" : ""}`}>

                {editingId === inv.id ? (
                  // EDIT MODE
                  <>
                    <input
                      value={editForm.name || ""}
                      onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                      className="rounded-lg px-3 py-1.5 text-sm text-slate-200 border border-sky-500/30 outline-none col-span-1"
                      style={{ background: "rgba(14,165,233,0.06)" }}
                    />
                    <input
                      value={editForm.company || ""}
                      onChange={e => setEditForm({ ...editForm, company: e.target.value })}
                      className="rounded-lg px-3 py-1.5 text-sm text-slate-200 border border-white/[0.08] outline-none"
                      style={{ background: "rgba(255,255,255,0.04)" }}
                    />
                    <select
                      value={editForm.status || "outreach"}
                      onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                      className="rounded-lg px-2 py-1.5 text-xs border border-white/[0.08] outline-none"
                      style={{ background: "rgba(14,7,15,0.9)", color: STATUS_STYLES[editForm.status || "outreach"]?.color }}>
                      {STATUS_OPTIONS.map(s => (
                        <option key={s} value={s}>{STATUS_STYLES[s].label}</option>
                      ))}
                    </select>
                    <input
                      value={editForm.amount || ""}
                      onChange={e => setEditForm({ ...editForm, amount: e.target.value as any })}
                      placeholder="Amount"
                      className="rounded-lg px-3 py-1.5 text-sm text-slate-200 border border-white/[0.08] outline-none"
                      style={{ background: "rgba(255,255,255,0.04)" }}
                    />
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleSaveEdit(inv.id)}
                        disabled={saving}
                        className="flex items-center justify-center w-8 h-8 rounded-lg text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/10 transition-all cursor-pointer"
                        style={{ background: "rgba(16,185,129,0.06)" }}
                        title="Save">
                        <RiCheckLine size={15} />
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-500 border border-white/[0.08] hover:bg-white/5 transition-all cursor-pointer"
                        style={{ background: "transparent" }}
                        title="Cancel">
                        <RiCloseLine size={15} />
                      </button>
                    </div>
                  </>
                ) : (
                  // VIEW MODE
                  <>
                    <div className="min-w-0">
                      <p className="text-[13px] text-slate-200 font-medium truncate">{inv.name}</p>
                      {inv.email && <p className="text-[11px] text-slate-600 truncate">{inv.email}</p>}
                    </div>
                    <p className="text-[13px] text-slate-500 truncate">{inv.company || "—"}</p>
                    <div>
                      <span
                        className="text-[11px] px-2.5 py-1 rounded-full font-medium"
                        style={{
                          background: STATUS_STYLES[inv.status]?.bg || "rgba(107,114,128,0.12)",
                          color: STATUS_STYLES[inv.status]?.color || "#9ca3af",
                          border: `1px solid ${STATUS_STYLES[inv.status]?.border || "rgba(107,114,128,0.25)"}`,
                        }}>
                        {STATUS_STYLES[inv.status]?.label || inv.status}
                      </span>
                    </div>
                    <p className="text-[13px] text-slate-300 font-medium">
                      {inv.amount ? `$${Number(inv.amount).toLocaleString()}` : "—"}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => startEdit(inv)}
                        className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-500 border border-white/[0.08] hover:text-sky-400 hover:border-sky-500/20 hover:bg-sky-500/5 transition-all cursor-pointer"
                        style={{ background: "transparent" }}
                        title="Edit">
                        <RiEditLine size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(inv.id)}
                        className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-500 border border-white/[0.08] hover:text-red-400 hover:border-red-500/20 hover:bg-red-500/5 transition-all cursor-pointer"
                        style={{ background: "transparent" }}
                        title="Delete">
                        <RiDeleteBinLine size={14} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  )
}