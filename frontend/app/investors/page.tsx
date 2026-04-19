"use client"
import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import AppNav from "@/components/AppNav"
import { ToastContainer, useToast } from "@/components/Toast"
import ConfirmDialog from "@/components/ConfirmDialog"
import {
  RiAddLine, RiSearchLine, RiEditLine, RiDeleteBinLine,
  RiCheckLine, RiCloseLine, RiDownloadLine, RiUserLine,
  RiStickyNoteLine, RiTimeLine, RiArrowRightSLine,
} from "react-icons/ri"

// Investors — the CRM list and detail drawer.
// Editorial redesign: hairline-bordered table, mono status labels, no
// colour fills on rows, no rounded cards. The detail panel drops the
// rounded-2xl look for a sharp side-drawer; the mobile version becomes a
// full bottom sheet with a semantic backdrop.

type Status = "outreach" | "interested" | "meeting" | "term_sheet" | "closed"
type Investor = {
  id: string
  name: string
  company?: string | null
  email?: string | null
  status: Status
  deal_size?: string | null
  notes?: string | null
  updated_at?: string | null
}

const STATUSES: Status[] = ["outreach", "interested", "meeting", "term_sheet", "closed"]

const STATUS_COLOR: Record<Status, string> = {
  outreach:   "#9ca3af",
  interested: "#a78bfa",
  meeting:    "#fbbf24",
  term_sheet: "#38bdf8",
  closed:     "#34d399",
}
const STATUS_LABEL: Record<Status, string> = {
  outreach:   "Outreach",
  interested: "Interested",
  meeting:    "Meeting",
  term_sheet: "Term Sheet",
  closed:     "Closed",
}

const EMPTY_FORM = { name: "", company: "", email: "", status: "outreach" as Status, deal_size: "", notes: "" }

export default function InvestorsPage() {
  const router = useRouter()
  const { toasts, addToast, removeToast } = useToast()

  const [investors, setInvestors] = useState<Investor[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all")
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [editData, setEditData] = useState<Partial<Investor>>({})

  const [selectedInv, setSelectedInv] = useState<Investor | null>(null)
  const [panelNotes, setPanelNotes] = useState("")
  const [savingNotes, setSavingNotes] = useState(false)

  const [pendingDelete, setPendingDelete] = useState<{ id: string; name: string } | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) { router.push("/login"); return }
    fetchInvestors(token)
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  function openPanel(inv: Investor) {
    setSelectedInv(inv)
    setPanelNotes(inv.notes || "")
  }
  function closePanel() {
    setSelectedInv(null)
    setPanelNotes("")
  }

  async function handleSaveNotes() {
    if (!selectedInv) return
    setSavingNotes(true)
    const token = localStorage.getItem("token")!
    try {
      const res = await fetch(`/api/investors?id=${selectedInv.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ notes: panelNotes }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setInvestors(prev => prev.map(i => i.id === selectedInv.id ? data : i))
      setSelectedInv(data)
      addToast("Notes saved")
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Failed to save notes", "error")
    } finally {
      setSavingNotes(false)
    }
  }

  async function handlePanelStatusChange(newStatus: Status) {
    if (!selectedInv) return
    const token = localStorage.getItem("token")!
    try {
      const res = await fetch(`/api/investors?id=${selectedInv.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setInvestors(prev => prev.map(i => i.id === selectedInv.id ? data : i))
      setSelectedInv(data)
      addToast(`Moved to ${STATUS_LABEL[newStatus]}`)
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Failed to update", "error")
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
          addToast("Free plan limit reached — upgrade to Pro for unlimited", "error")
        } else {
          throw new Error(data.error)
        }
        return
      }
      setInvestors(prev => [data, ...prev])
      setForm(EMPTY_FORM)
      setShowAdd(false)
      addToast(`${data.name} added`)
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Failed to add investor", "error")
    } finally {
      setSaving(false)
    }
  }

  function handleEdit(inv: Investor) {
    setEditId(inv.id)
    setEditData({
      name: inv.name,
      company: inv.company || "",
      email: inv.email || "",
      status: inv.status,
      deal_size: inv.deal_size || "",
      notes: inv.notes || "",
    })
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
      addToast("Investor updated")
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Failed to update", "error")
    }
  }

  function requestDelete(id: string, name: string) {
    setPendingDelete({ id, name })
  }
  async function confirmDelete() {
    if (!pendingDelete) return
    const { id, name } = pendingDelete
    setDeleting(true)
    const token = localStorage.getItem("token")!
    try {
      const res = await fetch(`/api/investors?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error("Failed to delete")
      setInvestors(prev => prev.filter(i => i.id !== id))
      if (selectedInv?.id === id) closePanel()
      addToast(`${name} deleted`)
      setPendingDelete(null)
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Failed to delete", "error")
    } finally {
      setDeleting(false)
    }
  }

  function handleExportCSV() {
    const headers = ["Name", "Company", "Email", "Status", "Deal Size", "Notes"]
    const rows = filtered.map(i => [i.name, i.company || "", i.email || "", i.status, i.deal_size || "", i.notes || ""])
    const escapeCell = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`
    const csv = [headers, ...rows].map(r => r.map(escapeCell).join(",")).join("\r\n")
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `investors-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    addToast("CSV exported")
  }

  const filtered = useMemo(() => investors.filter(inv => {
    const q = search.toLowerCase()
    const matchSearch = !q ||
      inv.name?.toLowerCase().includes(q) ||
      inv.company?.toLowerCase().includes(q) ||
      inv.email?.toLowerCase().includes(q)
    const matchStatus = statusFilter === "all" || inv.status === statusFilter
    return matchSearch && matchStatus
  }), [investors, search, statusFilter])

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#060608" }}>
      <AppNav />
      <div className="max-w-[1280px] mx-auto px-6 md:px-10 py-20 flex items-center gap-3">
        <div style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid #10b981", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
        <span className="mono" style={{ fontSize: 11, color: "#64748b", letterSpacing: "0.08em", textTransform: "uppercase" }}>Loading investors...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  )

  return (
    <main style={{ minHeight: "100vh", background: "#060608", color: "#e5e7eb", fontFamily: "'DM Sans', sans-serif" }}>
      <AppNav />
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="max-w-[1280px] mx-auto px-6 md:px-10">

        {/* ── Ticker strip ── */}
        <div className="flex items-center justify-between flex-wrap gap-3 pt-8 pb-6"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="mono flex items-center gap-x-5 gap-y-2 flex-wrap" style={{ fontSize: 11, color: "#64748b", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            <span>Investors</span>
            <span style={{ color: "#334155" }}>·</span>
            <span><span style={{ color: "#e5e7eb" }}>{investors.length}</span> total</span>
            <span style={{ color: "#334155" }}>·</span>
            <span>{filtered.length} shown</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleExportCSV}
              className="mono flex items-center gap-1.5 cursor-pointer"
              style={{
                fontSize: 11, color: "#94a3b8", letterSpacing: "0.08em", textTransform: "uppercase",
                padding: "8px 14px",
                background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 2,
              }}>
              <RiDownloadLine size={12} /> Export CSV
            </button>
            <button onClick={() => setShowAdd(true)}
              className="mono flex items-center gap-1.5 cursor-pointer"
              style={{
                fontSize: 11, color: "#fff", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600,
                padding: "8px 14px",
                background: "#10b981", border: 0, borderRadius: 2,
              }}>
              <RiAddLine size={12} /> Add investor
            </button>
          </div>
        </div>

        {/* ── Masthead ── */}
        <section className="pt-10 md:pt-14 pb-8">
          <p className="mono mb-3" style={{ fontSize: 11, color: "#10b981", letterSpacing: "0.12em", textTransform: "uppercase" }}>
            § Your pipeline
          </p>
          <h1 className="serif text-white" style={{
            fontSize: "clamp(40px, 5.5vw, 72px)", lineHeight: 0.95, letterSpacing: "-0.045em", fontWeight: 500,
          }}>
            The <span style={{ fontStyle: "italic", fontWeight: 400 }}>data room.</span>
          </h1>
        </section>

        {/* ── Filters ── */}
        <section className="flex flex-col md:flex-row items-stretch md:items-center gap-4 pb-6"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ position: "relative", flex: 1 }}>
            <RiSearchLine size={14} style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", color: "#475569" }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, company, or email..."
              style={{
                width: "100%",
                background: "transparent",
                border: 0,
                borderBottom: "1px solid rgba(255,255,255,0.12)",
                color: "#e5e7eb",
                fontSize: 14,
                outline: "none",
                padding: "10px 0 10px 22px",
                fontFamily: "inherit",
              }} />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(["all", ...STATUSES] as const).map(s => {
              const active = statusFilter === s
              const color = s === "all" ? "#10b981" : STATUS_COLOR[s as Status]
              const label = s === "all" ? "All" : STATUS_LABEL[s as Status]
              return (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className="mono cursor-pointer"
                  style={{
                    padding: "6px 12px",
                    fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500,
                    color: active ? color : "#64748b",
                    background: active ? `${color}12` : "transparent",
                    border: `1px solid ${active ? color + "40" : "rgba(255,255,255,0.08)"}`,
                    borderRadius: 2,
                  }}>
                  {label}
                </button>
              )
            })}
          </div>
        </section>

        {/* ── Add form drawer ── */}
        {showAdd && (
          <section className="py-6" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="mono mb-4" style={{ fontSize: 10, color: "#10b981", letterSpacing: "0.12em", textTransform: "uppercase" }}>
              § New entry
            </div>
            <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {[
                { label: "Name *",      value: form.name,       key: "name",       required: true,  placeholder: "Elena Kolomeitseva" },
                { label: "Company",     value: form.company,    key: "company",    required: false, placeholder: "Dragonfly" },
                { label: "Email",       value: form.email,      key: "email",      required: false, placeholder: "elena@dragonfly.xyz", type: "email" },
                { label: "Deal size",   value: form.deal_size,  key: "deal_size",  required: false, placeholder: "$500k" },
              ].map(f => (
                <div key={f.key}>
                  <label className="mono" style={{ fontSize: 10, color: "#475569", letterSpacing: "0.12em", textTransform: "uppercase", display: "block", marginBottom: 8 }}>
                    {f.label}
                  </label>
                  <input required={f.required} type={f.type || "text"}
                    value={f.value}
                    onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    placeholder={f.placeholder}
                    style={{
                      width: "100%", background: "transparent",
                      border: 0, borderBottom: "1px solid rgba(255,255,255,0.12)",
                      color: "#e5e7eb", fontSize: 14, outline: "none",
                      padding: "8px 0", fontFamily: "inherit",
                    }} />
                </div>
              ))}
              <div>
                <label className="mono" style={{ fontSize: 10, color: "#475569", letterSpacing: "0.12em", textTransform: "uppercase", display: "block", marginBottom: 8 }}>
                  Status
                </label>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as Status })}
                  style={{
                    width: "100%", background: "#060608",
                    border: 0, borderBottom: "1px solid rgba(255,255,255,0.12)",
                    color: "#e5e7eb", fontSize: 14, outline: "none",
                    padding: "8px 0", fontFamily: "inherit", cursor: "pointer",
                  }}>
                  {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                </select>
              </div>
              <div>
                <label className="mono" style={{ fontSize: 10, color: "#475569", letterSpacing: "0.12em", textTransform: "uppercase", display: "block", marginBottom: 8 }}>
                  Notes
                </label>
                <input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                  placeholder="Met at ETH Berlin, interested in DeFi"
                  style={{
                    width: "100%", background: "transparent",
                    border: 0, borderBottom: "1px solid rgba(255,255,255,0.12)",
                    color: "#e5e7eb", fontSize: 14, outline: "none",
                    padding: "8px 0", fontFamily: "inherit",
                  }} />
              </div>
              <div className="sm:col-span-2 flex gap-2 justify-end mt-3">
                <button type="button" onClick={() => { setShowAdd(false); setForm(EMPTY_FORM) }}
                  className="mono cursor-pointer"
                  style={{
                    padding: "9px 16px", fontSize: 10,
                    color: "#94a3b8", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500,
                    background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 2,
                  }}>
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="mono cursor-pointer"
                  style={{
                    padding: "9px 16px", fontSize: 10,
                    color: "#fff", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600,
                    background: "#10b981", border: 0, borderRadius: 2,
                    opacity: saving ? 0.6 : 1,
                  }}>
                  {saving ? "Adding..." : "Add investor"}
                </button>
              </div>
            </form>
          </section>
        )}

        {/* ── Table (desktop) ── */}
        <section
          className={`hidden md:block transition-[max-width,margin-right] duration-300`}
          style={{
            maxWidth: selectedInv ? "calc(100% - 420px)" : "100%",
            marginRight: selectedInv ? 420 : 0,
          }}>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            {/* header row */}
            <div className="grid gap-4 items-center py-3 mono"
              style={{
                gridTemplateColumns: "2fr 1fr 1fr 2fr 100px",
                fontSize: 10, color: "#475569", letterSpacing: "0.12em", textTransform: "uppercase",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
              }}>
              <span>Investor</span>
              <span>Status</span>
              <span>Deal size</span>
              <span>Notes</span>
              <span />
            </div>

            {filtered.length === 0 ? (
              <div className="py-20 text-center">
                <RiUserLine size={18} style={{ color: "#334155" }} />
                <p className="mono mt-4" style={{ fontSize: 11, color: "#475569", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  No investors found
                </p>
              </div>
            ) : filtered.map(inv => {
              const color = STATUS_COLOR[inv.status]
              const isEditing = editId === inv.id
              const isSelected = selectedInv?.id === inv.id
              return (
                <div key={inv.id}
                  onClick={() => !isEditing && openPanel(inv)}
                  className="grid gap-4 items-center py-4 cursor-pointer"
                  style={{
                    gridTemplateColumns: "2fr 1fr 1fr 2fr 100px",
                    background: isSelected ? "rgba(16,185,129,0.04)" : "transparent",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                    borderLeft: isSelected ? "2px solid #10b981" : "2px solid transparent",
                    paddingLeft: isSelected ? 14 : 16,
                    paddingRight: 16,
                    transition: "background 120ms, border-color 120ms, padding-left 120ms",
                  }}>
                  <div className="min-w-0 flex items-center gap-3">
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: color, flexShrink: 0 }} />
                    <div className="min-w-0">
                      {isEditing ? (
                        <input value={editData.name || ""} onChange={e => setEditData({ ...editData, name: e.target.value })}
                          onClick={e => e.stopPropagation()}
                          style={ROW_INPUT} />
                      ) : (
                        <div style={{ fontSize: 14, color: "#e5e7eb", fontWeight: 500 }} className="truncate">{inv.name}</div>
                      )}
                      {isEditing ? (
                        <input value={editData.company || ""} onChange={e => setEditData({ ...editData, company: e.target.value })}
                          onClick={e => e.stopPropagation()}
                          placeholder="Company"
                          style={{ ...ROW_INPUT, marginTop: 4, fontSize: 11, color: "#64748b" }} />
                      ) : (
                        <div className="mono truncate" style={{ fontSize: 10, color: "#64748b", letterSpacing: "0.04em", marginTop: 2 }}>
                          {inv.company || inv.email || "—"}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="min-w-0">
                    {isEditing ? (
                      <select value={editData.status} onChange={e => setEditData({ ...editData, status: e.target.value as Status })}
                        onClick={e => e.stopPropagation()} style={{ ...ROW_INPUT, color: "#e5e7eb" }}>
                        {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                      </select>
                    ) : (
                      <span className="mono" style={{ fontSize: 11, color, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                        {STATUS_LABEL[inv.status]}
                      </span>
                    )}
                  </div>

                  <div className="min-w-0">
                    {isEditing ? (
                      <input value={editData.deal_size || ""} onChange={e => setEditData({ ...editData, deal_size: e.target.value })}
                        onClick={e => e.stopPropagation()} style={ROW_INPUT} />
                    ) : (
                      <span className="mono" style={{ fontSize: 12, color: "#cbd5e1" }}>{inv.deal_size || "—"}</span>
                    )}
                  </div>

                  <div className="min-w-0 pr-2">
                    {isEditing ? (
                      <input value={editData.notes || ""} onChange={e => setEditData({ ...editData, notes: e.target.value })}
                        onClick={e => e.stopPropagation()} style={ROW_INPUT} />
                    ) : (
                      <span style={{ fontSize: 12, color: "#64748b" }} className="truncate block">{inv.notes || "—"}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 justify-end" onClick={e => e.stopPropagation()}>
                    {isEditing ? (
                      <>
                        <IconBtn onClick={() => handleSaveEdit(inv.id)} icon={<RiCheckLine size={13} />} color="#10b981" />
                        <IconBtn onClick={() => setEditId(null)} icon={<RiCloseLine size={13} />} color="#64748b" />
                      </>
                    ) : (
                      <>
                        <IconBtn onClick={() => handleEdit(inv)} icon={<RiEditLine size={12} />} color="#64748b" />
                        <IconBtn onClick={() => requestDelete(inv.id, inv.name)} icon={<RiDeleteBinLine size={12} />} color="#64748b" danger />
                        <RiArrowRightSLine size={14} style={{ color: "#334155" }} />
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* ── Mobile list ── */}
        <section className="md:hidden py-6 flex flex-col gap-1">
          {filtered.length === 0 ? (
            <div className="py-20 text-center">
              <RiUserLine size={18} style={{ color: "#334155" }} />
              <p className="mono mt-4" style={{ fontSize: 11, color: "#475569", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                No investors found
              </p>
            </div>
          ) : filtered.map(inv => {
            const color = STATUS_COLOR[inv.status]
            return (
              <div key={inv.id} onClick={() => openPanel(inv)}
                className="cursor-pointer grid grid-cols-[1fr_auto] gap-4 items-center py-4"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="flex items-center gap-3 min-w-0">
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: color, flexShrink: 0 }} />
                  <div className="min-w-0">
                    <div style={{ fontSize: 14, color: "#e5e7eb", fontWeight: 500 }} className="truncate">{inv.name}</div>
                    <div className="mono truncate" style={{ fontSize: 10, color: "#64748b", letterSpacing: "0.04em", marginTop: 2 }}>
                      {inv.company || inv.email || "—"}
                    </div>
                  </div>
                </div>
                <span className="mono flex-shrink-0" style={{ fontSize: 10, color, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  {STATUS_LABEL[inv.status]}
                </span>
              </div>
            )
          })}
        </section>

        <div style={{ height: 80 }} />
      </div>

      {/* ── Detail drawer ── */}
      {selectedInv && <DetailDrawer inv={selectedInv} onClose={closePanel}
        panelNotes={panelNotes} setPanelNotes={setPanelNotes}
        savingNotes={savingNotes} onSaveNotes={handleSaveNotes}
        onStatusChange={handlePanelStatusChange}
        onDelete={() => requestDelete(selectedInv.id, selectedInv.name)} />}

      <ConfirmDialog
        open={!!pendingDelete}
        variant="danger"
        title="Delete investor"
        message={pendingDelete ? `Remove ${pendingDelete.name} from your pipeline? This can't be undone.` : ""}
        confirmLabel="Delete"
        cancelLabel="Keep"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => !deleting && setPendingDelete(null)}
      />
    </main>
  )
}

const ROW_INPUT: React.CSSProperties = {
  width: "100%",
  background: "transparent",
  border: 0,
  borderBottom: "1px solid rgba(16,185,129,0.4)",
  color: "#e5e7eb",
  fontSize: 13,
  padding: "4px 0",
  outline: "none",
  fontFamily: "inherit",
}

function IconBtn({ icon, onClick, color, danger }: {
  icon: React.ReactNode; onClick: () => void; color: string; danger?: boolean
}) {
  const [hover, setHover] = useState(false)
  const hoverColor = danger ? "#f87171" : "#e5e7eb"
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: 26, height: 26,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: hover ? hoverColor : color,
        background: "transparent", border: 0, cursor: "pointer",
      }}>
      {icon}
    </button>
  )
}

// Detail drawer — sharp, hairline borders, no rounded cards.
// Desktop: 420px right-side panel that pushes the table.
// Mobile: full-screen bottom sheet above a backdrop.
function DetailDrawer({
  inv, onClose, panelNotes, setPanelNotes, savingNotes, onSaveNotes,
  onStatusChange, onDelete,
}: {
  inv: Investor
  onClose: () => void
  panelNotes: string
  setPanelNotes: (s: string) => void
  savingNotes: boolean
  onSaveNotes: () => void
  onStatusChange: (s: Status) => void
  onDelete: () => void
}) {
  const color = STATUS_COLOR[inv.status]
  return (
    <>
      {/* backdrop — only rendered on mobile */}
      <div className="md:hidden fixed inset-0 z-30"
        style={{ background: "rgba(2,4,10,0.6)" }}
        onClick={onClose} />
      <aside className="fixed z-40 flex flex-col
                       inset-x-0 bottom-0 top-16
                       md:inset-y-0 md:right-0 md:left-auto md:w-[420px] md:top-0 md:bottom-0"
        style={{
          background: "#060608",
          borderLeft: "1px solid rgba(255,255,255,0.08)",
          borderTop: "2px solid " + color,
        }}>
        <div className="flex items-start justify-between gap-3 px-6 py-5 md:pt-[72px]"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-3 min-w-0">
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />
            <div className="min-w-0">
              <div className="mono mb-1" style={{ fontSize: 10, color, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                {STATUS_LABEL[inv.status]}
              </div>
              <h2 className="serif text-white truncate" style={{ fontSize: 22, fontWeight: 500, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
                {inv.name}
              </h2>
              <div className="mono truncate" style={{ fontSize: 11, color: "#64748b", letterSpacing: "0.04em", marginTop: 2 }}>
                {inv.company || inv.email || "—"}
              </div>
            </div>
          </div>
          <button onClick={onClose}
            aria-label="Close"
            style={{
              width: 28, height: 28,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#64748b",
              background: "transparent", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 2, cursor: "pointer", flexShrink: 0,
            }}>
            <RiCloseLine size={14} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-7">
          <div>
            <div className="mono mb-3" style={{ fontSize: 10, color: "#475569", letterSpacing: "0.12em", textTransform: "uppercase" }}>
              Pipeline stage
            </div>
            <div className="flex flex-wrap gap-1.5">
              {STATUSES.map(s => {
                const active = inv.status === s
                const c = STATUS_COLOR[s]
                return (
                  <button key={s} onClick={() => onStatusChange(s)}
                    className="mono cursor-pointer"
                    style={{
                      padding: "6px 10px",
                      fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 500,
                      color: active ? c : "#64748b",
                      background: active ? `${c}14` : "transparent",
                      border: `1px solid ${active ? c + "40" : "rgba(255,255,255,0.08)"}`,
                      borderRadius: 2,
                    }}>
                    {STATUS_LABEL[s]}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Email",     value: inv.email || "—" },
              { label: "Deal size", value: inv.deal_size || "—" },
            ].map(f => (
              <div key={f.label}>
                <div className="mono mb-1.5" style={{ fontSize: 10, color: "#475569", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                  {f.label}
                </div>
                <div style={{ fontSize: 13, color: "#e5e7eb" }} className="truncate">{f.value}</div>
              </div>
            ))}
          </div>

          {inv.updated_at && (
            <div className="mono flex items-center gap-2" style={{ fontSize: 10, color: "#475569", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              <RiTimeLine size={11} />
              Last updated {new Date(inv.updated_at).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}
            </div>
          )}

          <div>
            <div className="mono flex items-center gap-2 mb-3" style={{ fontSize: 10, color: "#475569", letterSpacing: "0.12em", textTransform: "uppercase" }}>
              <RiStickyNoteLine size={11} /> Notes
            </div>
            <textarea value={panelNotes} onChange={e => setPanelNotes(e.target.value)}
              rows={8}
              placeholder="Notes, context, next steps..."
              style={{
                width: "100%",
                background: "transparent",
                color: "#e5e7eb",
                fontSize: 13, lineHeight: 1.6,
                outline: "none",
                padding: "10px 12px",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 2,
                resize: "vertical",
                fontFamily: "inherit",
              }} />
            <button onClick={onSaveNotes}
              disabled={savingNotes || panelNotes === (inv.notes || "")}
              className="mono mt-3"
              style={{
                width: "100%",
                padding: "10px 0", fontSize: 11,
                color: "#fff", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600,
                background: "#10b981", border: 0, borderRadius: 2,
                cursor: savingNotes ? "not-allowed" : "pointer",
                opacity: savingNotes || panelNotes === (inv.notes || "") ? 0.5 : 1,
              }}>
              {savingNotes ? "Saving..." : "Save notes"}
            </button>
          </div>

          <button onClick={onDelete}
            className="mono mt-auto"
            style={{
              padding: "10px 0", fontSize: 10,
              color: "#f87171", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500,
              background: "transparent", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 2,
              cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}>
            <RiDeleteBinLine size={11} /> Remove investor
          </button>
        </div>
      </aside>
    </>
  )
}
