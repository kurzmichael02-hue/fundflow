"use client"
import { useState, useEffect, useMemo, useCallback, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import AppNav from "@/components/AppNav"
import { ToastContainer, useToast } from "@/components/Toast"
import ConfirmDialog from "@/components/ConfirmDialog"
import {
  RiAddLine, RiSearchLine, RiEditLine, RiDeleteBinLine,
  RiCheckLine, RiCloseLine, RiDownloadLine, RiUserLine,
  RiStickyNoteLine, RiTimeLine, RiCheckboxBlankLine, RiCheckboxLine,
  RiHistoryLine, RiArrowRightLine, RiEditBoxLine, RiAddCircleLine,
  RiCoinLine,
} from "react-icons/ri"

// Investors page — editorial CRM with shareable filters and bulk operations.
// What's new in this iteration:
//   · search / statusFilter / open detail are stored in the URL, so a
//     founder can paste a link and land on the same view a colleague did.
//   · Multi-select with shift-click range. Action bar slides in when
//     anything is selected — bulk status change or bulk delete.
//   · Add form + CSV export can be triggered from the URL (?new=1, ?export=1)
//     so the command palette can deep-link straight into them.

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

export default function InvestorsPageWrapper() {
  // useSearchParams must run inside a Suspense boundary in App Router.
  return (
    <Suspense fallback={<InitialShell />}>
      <InvestorsPage />
    </Suspense>
  )
}

function InitialShell() {
  return (
    <div style={{ minHeight: "100vh", background: "#060608" }}>
      <AppNav />
    </div>
  )
}

function InvestorsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toasts, addToast, removeToast } = useToast()

  // ── Read initial state from the URL so deep links work ────────────────
  const initialSearch = searchParams.get("q") || ""
  const initialStatus = (searchParams.get("status") || "all") as Status | "all"
  const initialOpenId = searchParams.get("inv") || null

  const [investors, setInvestors] = useState<Investor[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(initialSearch)
  const [statusFilter, setStatusFilter] = useState<Status | "all">(STATUSES.includes(initialStatus as Status) || initialStatus === "all" ? initialStatus : "all")
  const [showAdd, setShowAdd] = useState(searchParams.get("new") === "1")
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [editData, setEditData] = useState<Partial<Investor>>({})

  const [selectedInv, setSelectedInv] = useState<Investor | null>(null)
  const [panelNotes, setPanelNotes] = useState("")
  const [savingNotes, setSavingNotes] = useState(false)

  const [pendingDelete, setPendingDelete] = useState<{ ids: string[]; label: string } | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Multi-select state. lastSelectedId keeps a "shift anchor" so shift-click
  // can select a range like a normal data table.
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null)
  const [bulkStatusOpen, setBulkStatusOpen] = useState(false)
  const [bulkBusy, setBulkBusy] = useState(false)

  // ── Sync state into the URL (replace, don't push, so back button works) ─
  const writeUrl = useCallback((next: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())
    for (const [k, v] of Object.entries(next)) {
      if (v == null || v === "") params.delete(k)
      else params.set(k, v)
    }
    const qs = params.toString()
    router.replace(qs ? `?${qs}` : "?", { scroll: false })
  }, [router, searchParams])

  // Whenever search / status / open-id change locally, push to the URL.
  useEffect(() => {
    writeUrl({
      q: search || null,
      status: statusFilter === "all" ? null : statusFilter,
      inv: selectedInv?.id || null,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter, selectedInv?.id])

  // ── Initial fetch ─────────────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) { router.push("/login"); return }
    fetchInvestors(token)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Once the list arrives, open the detail panel if the URL pointed at one,
  // and trigger the export action if ?export=1 was set.
  useEffect(() => {
    if (loading || investors.length === 0) return
    if (initialOpenId) {
      const target = investors.find(i => i.id === initialOpenId)
      if (target && !selectedInv) {
        setSelectedInv(target)
        setPanelNotes(target.notes || "")
      }
    }
    if (searchParams.get("export") === "1") {
      // Trigger the export and clear the flag so a refresh doesn't re-fire.
      handleExportCSV()
      writeUrl({ export: null })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, investors])

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
      writeUrl({ new: null })
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
    setPendingDelete({ ids: [id], label: name })
  }
  function requestBulkDelete() {
    if (selectedIds.size === 0) return
    setPendingDelete({
      ids: Array.from(selectedIds),
      label: `${selectedIds.size} investor${selectedIds.size === 1 ? "" : "s"}`,
    })
  }

  async function confirmDelete() {
    if (!pendingDelete) return
    const { ids } = pendingDelete
    setDeleting(true)
    const token = localStorage.getItem("token")!
    try {
      // Parallel DELETE for the bulk case. If a single one fails we show
      // a toast but still drop the successes from local state.
      const results = await Promise.allSettled(ids.map(id =>
        fetch(`/api/investors?id=${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }).then(r => r.ok ? id : Promise.reject(new Error(`Failed for ${id}`)))
      ))
      const succeeded = new Set(
        results
          .filter((r): r is PromiseFulfilledResult<string> => r.status === "fulfilled")
          .map(r => r.value)
      )
      const failedCount = results.length - succeeded.size

      setInvestors(prev => prev.filter(i => !succeeded.has(i.id)))
      if (selectedInv && succeeded.has(selectedInv.id)) closePanel()
      setSelectedIds(prev => {
        const next = new Set(prev)
        for (const id of succeeded) next.delete(id)
        return next
      })

      if (failedCount === 0) {
        addToast(ids.length === 1 ? `${pendingDelete.label} deleted` : `${succeeded.size} deleted`)
      } else {
        addToast(`${succeeded.size} deleted, ${failedCount} failed`, failedCount === ids.length ? "error" : "info")
      }
      setPendingDelete(null)
    } finally {
      setDeleting(false)
    }
  }

  async function handleBulkStatusChange(newStatus: Status) {
    if (selectedIds.size === 0) return
    setBulkBusy(true)
    setBulkStatusOpen(false)
    const token = localStorage.getItem("token")!
    const ids = Array.from(selectedIds)
    try {
      const results = await Promise.allSettled(ids.map(id =>
        fetch(`/api/investors?id=${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ status: newStatus }),
        }).then(async r => {
          if (!r.ok) throw new Error(`Failed for ${id}`)
          return r.json() as Promise<Investor>
        })
      ))
      const updated = new Map<string, Investor>()
      for (const r of results) {
        if (r.status === "fulfilled") updated.set(r.value.id, r.value)
      }
      setInvestors(prev => prev.map(i => updated.get(i.id) || i))
      if (selectedInv && updated.has(selectedInv.id)) {
        setSelectedInv(updated.get(selectedInv.id)!)
      }
      const failed = ids.length - updated.size
      addToast(failed === 0
        ? `${updated.size} moved to ${STATUS_LABEL[newStatus]}`
        : `${updated.size} moved, ${failed} failed`,
        failed > 0 && failed === ids.length ? "error" : "success")
    } finally {
      setBulkBusy(false)
    }
  }

  function handleExportCSV() {
    // Export honours filter + selection: if anything is selected, export
    // only those rows; otherwise export the visible (filtered) set.
    const rows = selectedIds.size > 0
      ? investors.filter(i => selectedIds.has(i.id))
      : filtered
    const headers = ["Name", "Company", "Email", "Status", "Deal Size", "Notes"]
    const cells = rows.map(i => [i.name, i.company || "", i.email || "", i.status, i.deal_size || "", i.notes || ""])
    const escapeCell = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`
    const csv = [headers, ...cells].map(r => r.map(escapeCell).join(",")).join("\r\n")
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `investors-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    addToast(`CSV exported (${rows.length})`)
  }

  // ── Filtering ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => investors.filter(inv => {
    const q = search.toLowerCase()
    const matchSearch = !q ||
      inv.name?.toLowerCase().includes(q) ||
      inv.company?.toLowerCase().includes(q) ||
      inv.email?.toLowerCase().includes(q)
    const matchStatus = statusFilter === "all" || inv.status === statusFilter
    return matchSearch && matchStatus
  }), [investors, search, statusFilter])

  // ── Selection helpers ────────────────────────────────────────────────
  const allFilteredSelected = filtered.length > 0 && filtered.every(i => selectedIds.has(i.id))
  const someFilteredSelected = !allFilteredSelected && filtered.some(i => selectedIds.has(i.id))

  function toggleAllFiltered() {
    if (allFilteredSelected) {
      setSelectedIds(prev => {
        const next = new Set(prev)
        for (const i of filtered) next.delete(i.id)
        return next
      })
    } else {
      setSelectedIds(prev => {
        const next = new Set(prev)
        for (const i of filtered) next.add(i.id)
        return next
      })
    }
  }

  function toggleOne(id: string, e?: React.MouseEvent) {
    // Shift-click selects the range from the last clicked row to this one.
    if (e?.shiftKey && lastSelectedId && lastSelectedId !== id) {
      const startIdx = filtered.findIndex(i => i.id === lastSelectedId)
      const endIdx = filtered.findIndex(i => i.id === id)
      if (startIdx !== -1 && endIdx !== -1) {
        const [from, to] = startIdx < endIdx ? [startIdx, endIdx] : [endIdx, startIdx]
        const range = filtered.slice(from, to + 1).map(i => i.id)
        setSelectedIds(prev => {
          const next = new Set(prev)
          for (const r of range) next.add(r)
          return next
        })
        setLastSelectedId(id)
        return
      }
    }
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
    setLastSelectedId(id)
  }

  function clearSelection() {
    setSelectedIds(new Set())
    setLastSelectedId(null)
  }

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

  const selectionCount = selectedIds.size

  return (
    <main style={{ minHeight: "100vh", background: "#060608", color: "#e5e7eb", fontFamily: "'DM Sans', sans-serif" }}>
      <AppNav />
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="max-w-[1280px] mx-auto px-6 md:px-10">

        {/* ── Ticker ── */}
        <div className="flex items-center justify-between flex-wrap gap-3 pt-8 pb-6"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="mono flex items-center gap-x-5 gap-y-2 flex-wrap" style={{ fontSize: 11, color: "#64748b", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            <span>Investors</span>
            <span style={{ color: "#334155" }}>·</span>
            <span><span style={{ color: "#e5e7eb" }}>{investors.length}</span> total</span>
            <span style={{ color: "#334155" }}>·</span>
            <span>{filtered.length} shown</span>
            {selectionCount > 0 && (
              <>
                <span style={{ color: "#334155" }}>·</span>
                <span><span style={{ color: "#10b981" }}>{selectionCount}</span> selected</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleExportCSV}
              className="mono flex items-center gap-1.5 cursor-pointer"
              style={{
                fontSize: 11, color: "#94a3b8", letterSpacing: "0.08em", textTransform: "uppercase",
                padding: "8px 14px",
                background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 2,
              }}>
              <RiDownloadLine size={12} /> Export CSV {selectionCount > 0 && <span style={{ color: "#10b981" }}>· {selectionCount}</span>}
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
                <button type="button"
                  onClick={() => { setShowAdd(false); setForm(EMPTY_FORM); writeUrl({ new: null }) }}
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

        {/* ── Bulk action bar — slides in when anything is selected ── */}
        {selectionCount > 0 && (
          <section className="sticky top-[64px] z-30 grid grid-cols-1 md:grid-cols-[auto_1fr_auto] items-center gap-3 py-3 px-4 my-1"
            style={{
              background: "#0a0a0d",
              border: "1px solid rgba(16,185,129,0.25)",
              borderLeft: "2px solid #10b981",
              borderRadius: 2,
            }}>
            <div className="mono flex items-center gap-3" style={{ fontSize: 11, color: "#cbd5e1", letterSpacing: "0.06em" }}>
              <span style={{ color: "#10b981", fontWeight: 600 }}>{selectionCount}</span> selected
              <button onClick={clearSelection}
                className="mono"
                style={{ fontSize: 10, color: "#475569", background: "transparent", border: 0, cursor: "pointer", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Clear
              </button>
            </div>
            <div />
            <div className="flex items-center gap-2 flex-wrap">
              <div style={{ position: "relative" }}>
                <button onClick={() => setBulkStatusOpen(v => !v)} disabled={bulkBusy}
                  className="mono cursor-pointer flex items-center gap-1.5"
                  style={{
                    padding: "8px 14px", fontSize: 11,
                    color: "#cbd5e1", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500,
                    background: "transparent", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 2,
                    opacity: bulkBusy ? 0.5 : 1,
                  }}>
                  {bulkBusy ? "Working..." : "Move to..."}
                </button>
                {bulkStatusOpen && (
                  <div style={{
                    position: "absolute", top: "calc(100% + 4px)", right: 0, minWidth: 180,
                    background: "#060608", border: "1px solid rgba(255,255,255,0.1)",
                    boxShadow: "0 18px 36px rgba(0,0,0,0.5)", padding: 4, zIndex: 40,
                  }}>
                    {STATUSES.map(s => (
                      <button key={s} onClick={() => handleBulkStatusChange(s)}
                        className="mono w-full text-left cursor-pointer flex items-center gap-2"
                        style={{
                          padding: "8px 12px", fontSize: 10,
                          color: STATUS_COLOR[s], letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500,
                          background: "transparent", border: 0,
                        }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: STATUS_COLOR[s] }} />
                        {STATUS_LABEL[s]}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={requestBulkDelete} disabled={bulkBusy}
                className="mono cursor-pointer flex items-center gap-1.5"
                style={{
                  padding: "8px 14px", fontSize: 11,
                  color: "#f87171", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500,
                  background: "transparent", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 2,
                  opacity: bulkBusy ? 0.5 : 1,
                }}>
                <RiDeleteBinLine size={11} /> Delete
              </button>
            </div>
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
                gridTemplateColumns: "32px 2fr 1fr 1fr 2fr 100px",
                fontSize: 10, color: "#475569", letterSpacing: "0.12em", textTransform: "uppercase",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
                paddingLeft: 0, paddingRight: 16,
              }}>
              <button onClick={toggleAllFiltered}
                aria-label={allFilteredSelected ? "Deselect all" : "Select all"}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "flex-start",
                  background: "transparent", border: 0, cursor: "pointer",
                  color: allFilteredSelected || someFilteredSelected ? "#10b981" : "#475569",
                  paddingLeft: 16,
                }}>
                {allFilteredSelected
                  ? <RiCheckboxLine size={14} />
                  : someFilteredSelected
                    ? <PartialCheckboxIcon />
                    : <RiCheckboxBlankLine size={14} />}
              </button>
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
              const isChecked = selectedIds.has(inv.id)
              return (
                <div key={inv.id}
                  className="grid gap-4 items-center py-4 cursor-pointer"
                  style={{
                    gridTemplateColumns: "32px 2fr 1fr 1fr 2fr 100px",
                    background: isSelected ? "rgba(16,185,129,0.04)" : isChecked ? "rgba(16,185,129,0.02)" : "transparent",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                    borderLeft: isSelected ? "2px solid #10b981" : isChecked ? "2px solid rgba(16,185,129,0.4)" : "2px solid transparent",
                    paddingLeft: 14,
                    paddingRight: 16,
                    transition: "background 120ms, border-color 120ms",
                  }}
                  onClick={() => !isEditing && openPanel(inv)}>
                  <button
                    onClick={e => { e.stopPropagation(); toggleOne(inv.id, e) }}
                    aria-label={isChecked ? `Deselect ${inv.name}` : `Select ${inv.name}`}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "flex-start",
                      background: "transparent", border: 0, cursor: "pointer",
                      color: isChecked ? "#10b981" : "#475569",
                      paddingLeft: 0,
                    }}>
                    {isChecked ? <RiCheckboxLine size={14} /> : <RiCheckboxBlankLine size={14} />}
                  </button>

                  <div className="min-w-0 flex items-center gap-3">
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: color, flexShrink: 0 }} />
                    <div className="min-w-0">
                      {isEditing ? (
                        <input value={editData.name || ""} onChange={e => setEditData({ ...editData, name: e.target.value })}
                          onClick={e => e.stopPropagation()} style={ROW_INPUT} />
                      ) : (
                        <div style={{ fontSize: 14, color: "#e5e7eb", fontWeight: 500 }} className="truncate">{inv.name}</div>
                      )}
                      {isEditing ? (
                        <input value={editData.company || ""} onChange={e => setEditData({ ...editData, company: e.target.value })}
                          onClick={e => e.stopPropagation()} placeholder="Company"
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
            const isChecked = selectedIds.has(inv.id)
            return (
              <div key={inv.id}
                className="grid grid-cols-[24px_1fr_auto] gap-3 items-center py-4 cursor-pointer"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <button onClick={e => { e.stopPropagation(); toggleOne(inv.id) }}
                  aria-label={isChecked ? `Deselect ${inv.name}` : `Select ${inv.name}`}
                  style={{
                    display: "flex", alignItems: "center",
                    background: "transparent", border: 0, cursor: "pointer",
                    color: isChecked ? "#10b981" : "#475569",
                  }}>
                  {isChecked ? <RiCheckboxLine size={14} /> : <RiCheckboxBlankLine size={14} />}
                </button>
                <div onClick={() => openPanel(inv)} className="flex items-center gap-3 min-w-0">
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
        title={pendingDelete && pendingDelete.ids.length > 1 ? "Delete investors" : "Delete investor"}
        message={pendingDelete
          ? `Remove ${pendingDelete.label} from your pipeline? This can't be undone.`
          : ""}
        confirmLabel={pendingDelete && pendingDelete.ids.length > 1 ? `Delete ${pendingDelete.ids.length}` : "Delete"}
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

function PartialCheckboxIcon() {
  return (
    <span style={{
      width: 14, height: 14,
      display: "inline-flex", alignItems: "center", justifyContent: "center",
    }}>
      <span style={{ width: 8, height: 1.5, background: "currentColor" }} />
    </span>
  )
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

type InvestorEvent = {
  id: string
  event_type: string
  payload: Record<string, unknown> | null
  created_at: string
}

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

  // Lazy-load timeline events whenever the open investor changes. Bounded
  // to 50 server-side; we don't paginate yet because most pipelines are
  // months-old and even an active deal won't accumulate 50 events.
  const [events, setEvents] = useState<InvestorEvent[]>([])
  const [eventsLoading, setEventsLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    setEventsLoading(true)
    const token = localStorage.getItem("token")
    fetch(`/api/investors/${inv.id}/events`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })
      .then(r => r.ok ? r.json() : [])
      .then(d => { if (!cancelled) setEvents(Array.isArray(d) ? d : []) })
      .catch(() => { if (!cancelled) setEvents([]) })
      .finally(() => { if (!cancelled) setEventsLoading(false) })
    return () => { cancelled = true }
  }, [inv.id])

  return (
    <>
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

          <Timeline events={events} loading={eventsLoading} />

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

// Render a relative timestamp like "2h ago" or fallback to a date if it's
// older than a week. Used in the timeline column under each event.
function relTime(iso: string): string {
  const diff = Math.max(0, Date.now() - new Date(iso).getTime())
  const m = Math.floor(diff / 60_000)
  if (m < 1) return "just now"
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d}d ago`
  return new Date(iso).toLocaleDateString("en", { month: "short", day: "numeric" })
}

function eventDescriptor(event: InvestorEvent): { icon: React.ReactNode; label: React.ReactNode; color: string } {
  const payload = (event.payload || {}) as Record<string, unknown>
  switch (event.event_type) {
    case "created": {
      const status = String(payload.status || "outreach") as Status
      const c = STATUS_COLOR[status] || "#10b981"
      return {
        icon: <RiAddCircleLine size={12} />,
        color: c,
        label: <>Added to pipeline as <span className="mono" style={{ color: c }}>{STATUS_LABEL[status] || status}</span></>,
      }
    }
    case "status_changed": {
      const from = String(payload.from || "")
      const to = String(payload.to || "")
      const cTo = STATUS_COLOR[to as Status] || "#10b981"
      const cFrom = STATUS_COLOR[from as Status] || "#64748b"
      return {
        icon: <RiArrowRightLine size={12} />,
        color: cTo,
        label: (
          <>
            Moved from <span className="mono" style={{ color: cFrom }}>{STATUS_LABEL[from as Status] || from || "—"}</span>
            {" "}→{" "}
            <span className="mono" style={{ color: cTo }}>{STATUS_LABEL[to as Status] || to}</span>
          </>
        ),
      }
    }
    case "notes_updated": {
      const length = Number(payload.length || 0)
      return {
        icon: <RiEditBoxLine size={12} />,
        color: "#94a3b8",
        label: <>Notes updated{length > 0 ? <span className="mono" style={{ color: "#475569", marginLeft: 6 }}>{length} chars</span> : ""}</>,
      }
    }
    case "deal_size_changed": {
      const from = payload.from ? String(payload.from) : "—"
      const to = payload.to ? String(payload.to) : "—"
      return {
        icon: <RiCoinLine size={12} />,
        color: "#fbbf24",
        label: (
          <>
            Deal size <span className="mono" style={{ color: "#94a3b8" }}>{from}</span>
            {" "}→{" "}
            <span className="mono" style={{ color: "#fff" }}>{to}</span>
          </>
        ),
      }
    }
    case "renamed": {
      return {
        icon: <RiEditLine size={12} />,
        color: "#94a3b8",
        label: <>Renamed to <span className="mono" style={{ color: "#fff" }}>{String(payload.to || "")}</span></>,
      }
    }
    default:
      return {
        icon: <RiHistoryLine size={12} />,
        color: "#64748b",
        label: <>{event.event_type}</>,
      }
  }
}

function Timeline({ events, loading }: { events: InvestorEvent[]; loading: boolean }) {
  return (
    <div>
      <div className="mono flex items-center gap-2 mb-3" style={{ fontSize: 10, color: "#475569", letterSpacing: "0.12em", textTransform: "uppercase" }}>
        <RiHistoryLine size={11} /> Timeline
      </div>
      {loading ? (
        <div className="mono py-4" style={{ fontSize: 10, color: "#475569", letterSpacing: "0.06em" }}>
          Loading events...
        </div>
      ) : events.length === 0 ? (
        <div className="mono py-4" style={{ fontSize: 11, color: "#475569", letterSpacing: "0.04em" }}>
          No events yet — changes will appear here as you make them.
        </div>
      ) : (
        <ol style={{ listStyle: "none", padding: 0, margin: 0, position: "relative" }}>
          {/* Vertical hairline that ties the timeline together visually. */}
          <div style={{
            position: "absolute", left: 6, top: 6, bottom: 6, width: 1,
            background: "rgba(255,255,255,0.06)",
          }} />
          {events.map(e => {
            const d = eventDescriptor(e)
            return (
              <li key={e.id} style={{ position: "relative", paddingLeft: 22, paddingBottom: 14 }}>
                <span style={{
                  position: "absolute", left: 2, top: 4, width: 9, height: 9,
                  borderRadius: "50%",
                  background: "#060608",
                  border: `1.5px solid ${d.color}`,
                }} />
                <div style={{ fontSize: 12, color: "#cbd5e1", lineHeight: 1.5, display: "flex", alignItems: "baseline", gap: 6 }}>
                  <span style={{ color: d.color, position: "relative", top: 1 }}>{d.icon}</span>
                  <span>{d.label}</span>
                </div>
                <div className="mono" style={{ fontSize: 10, color: "#475569", letterSpacing: "0.04em", marginTop: 2 }}>
                  {relTime(e.created_at)}
                </div>
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}
