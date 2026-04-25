"use client"
import { useState, useEffect, useMemo, useCallback, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import AppNav from "@/components/AppNav"
import { ToastContainer, useToast } from "@/components/Toast"
import ConfirmDialog from "@/components/ConfirmDialog"
import CsvImportDialog from "@/components/CsvImportDialog"
import FollowUpPill from "@/components/FollowUpPill"
import UpgradeModal, { UpgradeReason } from "@/components/UpgradeModal"
import { useTimeTick } from "@/lib/useTimeTick"
import { requireToken } from "@/lib/api"
import {
  RiAddLine, RiSearchLine, RiEditLine, RiDeleteBinLine,
  RiCheckLine, RiCloseLine, RiDownloadLine, RiUploadLine, RiUserLine,
  RiStickyNoteLine, RiTimeLine, RiCheckboxBlankLine, RiCheckboxLine,
  RiHistoryLine, RiArrowRightLine, RiEditBoxLine, RiAddCircleLine,
  RiCoinLine, RiArrowUpSLine, RiArrowDownSLine,
  RiAlarmLine, RiMailSendLine, RiCalendarScheduleLine,
  RiQuillPenLine, RiFileCopyLine, RiCalculatorLine,
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
  next_follow_up_at?: string | null
  last_contacted_at?: string | null
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
  // Same loader the page uses for its real loading state, so the Suspense
  // boundary doesn't flash a blank page while useSearchParams hydrates.
  return (
    <div style={{ minHeight: "100vh", background: "#060608" }}>
      <AppNav />
      <div className="max-w-[1280px] mx-auto px-6 md:px-10 py-20 flex items-center gap-3">
        <div style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid #10b981", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
        <span className="mono" style={{ fontSize: 11, color: "#64748b", letterSpacing: "0.08em", textTransform: "uppercase" }}>
          Loading investors...
        </span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
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
  // Reminder filter: null = off, "overdue" = next_follow_up_at in the past,
  // "today" = within end-of-day. Deep-linked from the dashboard Focus blocks.
  type ReminderFilter = null | "overdue" | "today"
  const initialReminder: ReminderFilter =
    searchParams.get("overdue") === "1" ? "overdue"
    : searchParams.get("today") === "1" ? "today"
    : null

  const [investors, setInvestors] = useState<Investor[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(initialSearch)
  const [statusFilter, setStatusFilter] = useState<Status | "all">(STATUSES.includes(initialStatus as Status) || initialStatus === "all" ? initialStatus : "all")
  const [reminderFilter, setReminderFilter] = useState<ReminderFilter>(initialReminder)
  // Keep the overdue/today predicate + row pills in sync with the wall clock.
  const tick = useTimeTick()
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

  // CSV import + table sort
  const [csvOpen, setCsvOpen] = useState(false)
  type SortKey = "name" | "status" | "deal_size" | "updated_at"
  const [sortKey, setSortKey] = useState<SortKey | null>(null)
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")

  // Upgrade modal — fires when the free-plan cap blocks an action.
  // `reason` drives the modal's copy so it lands in-context instead of
  // reading like a generic pricing-page pop-up.
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const [upgradeReason, setUpgradeReason] = useState<UpgradeReason>("generic")

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

  // Whenever search / status / open-id / reminder change locally, push to the URL.
  useEffect(() => {
    writeUrl({
      q: search || null,
      status: statusFilter === "all" ? null : statusFilter,
      inv: selectedInv?.id || null,
      overdue: reminderFilter === "overdue" ? "1" : null,
      today:   reminderFilter === "today"   ? "1" : null,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter, selectedInv?.id, reminderFilter])

  // Reverse direction — if the URL changes out from under us (e.g. the
  // command palette router.pushes /investors?overdue=1 while the user is
  // already on this page), pull the new filter into state. Without this
  // the deep link silently no-ops because state was seeded once at mount.
  // Guarded so it doesn't fight the writer effect above.
  useEffect(() => {
    const urlReminder: ReminderFilter =
      searchParams.get("overdue") === "1" ? "overdue"
      : searchParams.get("today") === "1" ? "today"
      : null
    if (urlReminder !== reminderFilter) setReminderFilter(urlReminder)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

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
      } else if (!target) {
        // Deep link points at an investor that no longer exists (deleted,
        // or someone else's id pasted). Surface it instead of just silently
        // opening nothing — and clear the param so a refresh doesn't keep
        // showing the toast.
        addToast("That investor isn't in your pipeline anymore", "info")
        writeUrl({ inv: null })
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
      if (res.status === 401) {
        localStorage.removeItem("token")
        localStorage.removeItem("user_type")
        router.push("/login")
        return
      }
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
    const token = requireToken(router.push)
    if (!token) { setSavingNotes(false); return }
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
    const token = requireToken(router.push)
    if (!token) return
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

  // Follow-up reminder — `iso` is the target timestamp, or null to clear.
  // Works for both quick-set ("in 3 days") and the custom date picker.
  async function handlePanelFollowUp(iso: string | null) {
    if (!selectedInv) return
    const token = requireToken(router.push)
    if (!token) return
    try {
      const res = await fetch(`/api/investors?id=${selectedInv.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ next_follow_up_at: iso }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setInvestors(prev => prev.map(i => i.id === selectedInv.id ? data : i))
      setSelectedInv(data)
      addToast(iso ? "Reminder set" : "Reminder cleared")
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Failed to update", "error")
    }
  }

  // Log an outreach touch. Stamps last_contacted_at = now. If the current
  // reminder is already in the past (i.e. this is the follow-up you were
  // supposed to do), we clear it in the same PATCH — otherwise the red
  // pill would linger after the founder's done the thing. If the reminder
  // is still in the future we leave it alone: they might be pinging early
  // and still want the nudge.
  async function handlePanelLogContact() {
    if (!selectedInv) return
    const token = requireToken(router.push)
    if (!token) return
    const nextAt = selectedInv.next_follow_up_at
    const isOverdue = nextAt && new Date(nextAt).getTime() < Date.now()
    const body: Record<string, unknown> = { last_contacted_at: new Date().toISOString() }
    if (isOverdue) body.next_follow_up_at = null

    try {
      const res = await fetch(`/api/investors?id=${selectedInv.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setInvestors(prev => prev.map(i => i.id === selectedInv.id ? data : i))
      setSelectedInv(data)
      addToast(isOverdue ? "Logged — reminder cleared" : "Logged as contacted")
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Failed to log touch", "error")
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const token = requireToken(router.push)
    if (!token) { setSaving(false); return }
    try {
      const res = await fetch("/api/investors", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        if (data.limit) {
          // Cap hit. Caller WANTED to add — don't just tell them "no".
          // Pop the upgrade modal with the right in-context copy and the
          // checkout button right there.
          setUpgradeReason("investor-cap")
          setUpgradeOpen(true)
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
    const token = requireToken(router.push)
    if (!token) return
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
    const token = requireToken(router.push)
    if (!token) { setDeleting(false); return }
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
    const token = requireToken(router.push)
    if (!token) { setBulkBusy(false); return }
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

  // Status order so a sort by status reads outreach → closed in ascending,
  // not alphabetical (which would sort interested before meeting etc).
  const STATUS_ORDER: Record<Status, number> = useMemo(() => ({
    outreach: 0, interested: 1, meeting: 2, term_sheet: 3, closed: 4,
  }), [])

  // Free-form deal_size string ("$5M", "500k") gets coerced to a number for
  // sorting only — same parser idea as analytics, lighter touch here.
  function sortValue(inv: Investor, key: SortKey): string | number {
    switch (key) {
      case "name":       return (inv.name || "").toLowerCase()
      case "status":     return STATUS_ORDER[inv.status]
      case "deal_size": {
        const s = String(inv.deal_size || "").toLowerCase()
        if (!s) return -1
        let mult = 1
        if (/\bb\b|billion/.test(s))      mult = 1e9
        else if (/\bm\b|million/.test(s)) mult = 1e6
        else if (/\bk\b|thousand/.test(s)) mult = 1e3
        const n = parseFloat(s.replace(/[^0-9.]/g, ""))
        return isNaN(n) ? -1 : n * mult
      }
      case "updated_at": return inv.updated_at ? new Date(inv.updated_at).getTime() : 0
    }
  }

  // ── Filtering + sorting ───────────────────────────────────────────────
  const filtered = useMemo(() => {
    // Compute the end-of-today boundary once per render, not per row.
    const now = Date.now()
    const endOfToday = new Date()
    endOfToday.setHours(23, 59, 59, 999)
    const todayMax = endOfToday.getTime()

    const matched = investors.filter(inv => {
      const q = search.toLowerCase()
      const matchSearch = !q ||
        inv.name?.toLowerCase().includes(q) ||
        inv.company?.toLowerCase().includes(q) ||
        inv.email?.toLowerCase().includes(q)
      const matchStatus = statusFilter === "all" || inv.status === statusFilter

      let matchReminder = true
      if (reminderFilter) {
        const t = inv.next_follow_up_at ? new Date(inv.next_follow_up_at).getTime() : NaN
        if (isNaN(t)) matchReminder = false
        else if (reminderFilter === "overdue") matchReminder = t < now
        else if (reminderFilter === "today")   matchReminder = t >= now && t <= todayMax
      }

      return matchSearch && matchStatus && matchReminder
    })
    if (!sortKey) return matched
    const sorted = [...matched].sort((a, b) => {
      const va = sortValue(a, sortKey)
      const vb = sortValue(b, sortKey)
      if (va < vb) return sortDir === "asc" ? -1 : 1
      if (va > vb) return sortDir === "asc" ? 1 : -1
      return 0
    })
    return sorted
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [investors, search, statusFilter, reminderFilter, sortKey, sortDir, STATUS_ORDER, tick])

  function toggleSort(key: SortKey) {
    if (sortKey !== key) {
      setSortKey(key)
      setSortDir("asc")
    } else if (sortDir === "asc") {
      setSortDir("desc")
    } else {
      // Third click clears the sort and goes back to insertion order.
      setSortKey(null)
      setSortDir("asc")
    }
  }

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
            <span style={{ color: "#475569" }}>·</span>
            <span><span style={{ color: "#e5e7eb" }}>{investors.length}</span> total</span>
            <span style={{ color: "#475569" }}>·</span>
            <span>{filtered.length} shown</span>
            {reminderFilter && (
              <>
                <span style={{ color: "#475569" }}>·</span>
                <span style={{ color: reminderFilter === "overdue" ? "#f87171" : "#fbbf24" }}>
                  Filter: {reminderFilter === "overdue" ? "Overdue" : "Due today"}
                </span>
              </>
            )}
            {selectionCount > 0 && (
              <>
                <span style={{ color: "#475569" }}>·</span>
                <span><span style={{ color: "#10b981" }}>{selectionCount}</span> selected</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setCsvOpen(true)}
              className="mono flex items-center gap-1.5 cursor-pointer"
              style={{
                fontSize: 11, color: "#94a3b8", letterSpacing: "0.08em", textTransform: "uppercase",
                padding: "8px 14px",
                background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 2,
              }}>
              <RiUploadLine size={12} /> Import CSV
            </button>
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
            Your pipeline
          </p>
          <h1 className="serif text-white" style={{
            fontSize: "clamp(40px, 5.5vw, 72px)", lineHeight: 0.95, letterSpacing: "-0.045em", fontWeight: 500,
          }}>
            The data room.
          </h1>
        </section>

        {/* ── Filters ── */}
        <section className="flex flex-col md:flex-row items-stretch md:items-center gap-4 pb-6"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ position: "relative", flex: 1 }}>
            <RiSearchLine size={14} style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, company, or email..."
              style={{
                width: "100%",
                background: "transparent",
                border: 0,
                borderBottom: "1px solid rgba(255,255,255,0.18)",
                color: "#e5e7eb",
                fontSize: 14,
                outline: "none",
                padding: "10px 0 10px 22px",
                fontFamily: "inherit",
              }} />
          </div>
          <div className="flex flex-wrap gap-1.5 items-center">
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
            {/* Separator — reminder chips are conceptually a second axis,
                so a hair of whitespace makes the grouping read correctly. */}
            <span style={{ width: 8 }} />
            {([
              { key: "overdue" as const, label: "Overdue",   color: "#f87171" },
              { key: "today"   as const, label: "Due today", color: "#fbbf24" },
            ]).map(r => {
              const active = reminderFilter === r.key
              return (
                <button key={r.key} onClick={() => setReminderFilter(active ? null : r.key)}
                  className="mono cursor-pointer flex items-center gap-1.5"
                  style={{
                    padding: "6px 12px",
                    fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500,
                    color: active ? r.color : "#64748b",
                    background: active ? `${r.color}12` : "transparent",
                    border: `1px solid ${active ? r.color + "40" : "rgba(255,255,255,0.08)"}`,
                    borderRadius: 2,
                  }}>
                  <RiAlarmLine size={10} /> {r.label}
                </button>
              )
            })}
          </div>
        </section>

        {/* ── Add form drawer ── */}
        {showAdd && (
          <section className="py-6" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="mono mb-4" style={{ fontSize: 10, color: "#10b981", letterSpacing: "0.12em", textTransform: "uppercase" }}>
              New entry
            </div>
            <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {[
                { label: "Name *",      value: form.name,       key: "name",       required: true,  placeholder: "Elena Kolomeitseva" },
                { label: "Company",     value: form.company,    key: "company",    required: false, placeholder: "Dragonfly" },
                { label: "Email",       value: form.email,      key: "email",      required: false, placeholder: "elena@dragonfly.xyz", type: "email" },
                { label: "Deal size",   value: form.deal_size,  key: "deal_size",  required: false, placeholder: "$500k" },
              ].map(f => (
                <div key={f.key}>
                  <label className="mono" style={{ fontSize: 10, color: "#64748b", letterSpacing: "0.12em", textTransform: "uppercase", display: "block", marginBottom: 8 }}>
                    {f.label}
                  </label>
                  <input required={f.required} type={f.type || "text"}
                    value={f.value}
                    onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    placeholder={f.placeholder}
                    style={{
                      width: "100%", background: "transparent",
                      border: 0, borderBottom: "1px solid rgba(255,255,255,0.18)",
                      color: "#e5e7eb", fontSize: 14, outline: "none",
                      padding: "8px 0", fontFamily: "inherit",
                    }} />
                </div>
              ))}
              <div>
                <label className="mono" style={{ fontSize: 10, color: "#64748b", letterSpacing: "0.12em", textTransform: "uppercase", display: "block", marginBottom: 8 }}>
                  Status
                </label>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as Status })}
                  style={{
                    width: "100%", background: "#060608",
                    border: 0, borderBottom: "1px solid rgba(255,255,255,0.18)",
                    color: "#e5e7eb", fontSize: 14, outline: "none",
                    padding: "8px 0", fontFamily: "inherit", cursor: "pointer",
                  }}>
                  {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                </select>
              </div>
              <div>
                <label className="mono" style={{ fontSize: 10, color: "#64748b", letterSpacing: "0.12em", textTransform: "uppercase", display: "block", marginBottom: 8 }}>
                  Notes
                </label>
                <input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                  placeholder="Met at ETH Berlin, interested in DeFi"
                  style={{
                    width: "100%", background: "transparent",
                    border: 0, borderBottom: "1px solid rgba(255,255,255,0.18)",
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
                style={{ fontSize: 10, color: "#64748b", background: "transparent", border: 0, cursor: "pointer", letterSpacing: "0.08em", textTransform: "uppercase" }}>
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
                fontSize: 10, color: "#64748b", letterSpacing: "0.12em", textTransform: "uppercase",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
                paddingLeft: 0, paddingRight: 16,
              }}>
              <button onClick={toggleAllFiltered}
                aria-label={allFilteredSelected ? "Deselect all" : "Select all"}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "flex-start",
                  background: "transparent", border: 0, cursor: "pointer",
                  color: allFilteredSelected || someFilteredSelected ? "#10b981" : "#64748b",
                  paddingLeft: 16,
                }}>
                {allFilteredSelected
                  ? <RiCheckboxLine size={14} />
                  : someFilteredSelected
                    ? <PartialCheckboxIcon />
                    : <RiCheckboxBlankLine size={14} />}
              </button>
              <SortHeader label="Investor"  active={sortKey === "name"}       dir={sortDir} onClick={() => toggleSort("name")} />
              <SortHeader label="Status"    active={sortKey === "status"}     dir={sortDir} onClick={() => toggleSort("status")} />
              <SortHeader label="Deal size" active={sortKey === "deal_size"}  dir={sortDir} onClick={() => toggleSort("deal_size")} />
              <span>Notes</span>
              <SortHeader label="Updated"   active={sortKey === "updated_at"} dir={sortDir} onClick={() => toggleSort("updated_at")} alignRight />
            </div>

            {filtered.length === 0 ? (
              <div className="py-20 text-center">
                <RiUserLine size={18} style={{ color: "#475569" }} />
                <p className="mono mt-4" style={{ fontSize: 11, color: "#64748b", letterSpacing: "0.08em", textTransform: "uppercase" }}>
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
                      color: isChecked ? "#10b981" : "#64748b",
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
                        <div className="flex items-center gap-2 min-w-0">
                          <span style={{ fontSize: 14, color: "#e5e7eb", fontWeight: 500 }} className="truncate">{inv.name}</span>
                          <FollowUpPill at={inv.next_follow_up_at || null} />
                        </div>
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
              <RiUserLine size={18} style={{ color: "#475569" }} />
              <p className="mono mt-4" style={{ fontSize: 11, color: "#64748b", letterSpacing: "0.08em", textTransform: "uppercase" }}>
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
                    color: isChecked ? "#10b981" : "#64748b",
                  }}>
                  {isChecked ? <RiCheckboxLine size={14} /> : <RiCheckboxBlankLine size={14} />}
                </button>
                <div onClick={() => openPanel(inv)} className="flex items-center gap-3 min-w-0">
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: color, flexShrink: 0 }} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <span style={{ fontSize: 14, color: "#e5e7eb", fontWeight: 500 }} className="truncate">{inv.name}</span>
                      <FollowUpPill at={inv.next_follow_up_at || null} />
                    </div>
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
        onFollowUpSet={handlePanelFollowUp}
        onLogContact={handlePanelLogContact}
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

      <CsvImportDialog
        open={csvOpen}
        onClose={() => setCsvOpen(false)}
        onImported={(count) => {
          // Reload the list so the new rows appear without a manual refresh.
          // Cheaper than refetching during the import — we just do it once
          // when the dialog finishes, then the user can dismiss when ready.
          if (count > 0) {
            const token = localStorage.getItem("token")
            if (token) fetchInvestors(token)
            addToast(`${count} investor${count === 1 ? "" : "s"} imported`)
          }
        }}
        onCapHit={() => {
          // CSV dialog flags when a row bounced off the plan cap — we
          // close it and let the upgrade modal take over in-context.
          setCsvOpen(false)
          setUpgradeReason("bulk-import-cap")
          setUpgradeOpen(true)
        }}
      />

      <UpgradeModal
        open={upgradeOpen}
        reason={upgradeReason}
        onClose={() => setUpgradeOpen(false)}
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

// Column header that doubles as a sort toggle. Cycle is asc → desc → off,
// matching how every linear/airtable-style table behaves.
function SortHeader({
  label, active, dir, onClick, alignRight,
}: {
  label: string
  active: boolean
  dir: "asc" | "desc"
  onClick: () => void
  alignRight?: boolean
}) {
  return (
    <button onClick={onClick}
      className="mono cursor-pointer flex items-center gap-1.5"
      style={{
        background: "transparent", border: 0, padding: 0,
        color: active ? "#10b981" : "#64748b",
        fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase",
        justifyContent: alignRight ? "flex-end" : "flex-start",
      }}>
      {label}
      {active && (dir === "asc"
        ? <RiArrowUpSLine size={12} />
        : <RiArrowDownSLine size={12} />)}
    </button>
  )
}

// Tiny shortcut into the tokenomics modeler with the cheque pre-filled
// from this investor's deal_size. Only shown on term-sheet investors —
// that's the actual moment a founder wants to model SAFT terms. The
// parse here mirrors the analytics + dashboard parser so $5M / 5M /
// 5,000,000 all collapse to 5_000_000.
function SaftJumpLink({ dealSize }: { dealSize: string }) {
  const cheque = useMemo(() => {
    const s = String(dealSize || "").trim().toLowerCase()
    if (!s) return 0
    let mult = 1
    if (/\bb\b|billion/.test(s))            mult = 1_000_000_000
    else if (/\bm\b|million|mm\b/.test(s))  mult = 1_000_000
    else if (/\bk\b|thousand/.test(s))      mult = 1_000
    const onlyNums = s.replace(/[^0-9.,]/g, "")
    const hasCommaDecimal = /\d,\d{1,2}(?!\d)/.test(onlyNums) && !/\.\d/.test(onlyNums)
    const normalised = hasCommaDecimal
      ? onlyNums.replace(/\./g, "").replace(",", ".")
      : onlyNums.replace(/,/g, "")
    const n = parseFloat(normalised)
    return isNaN(n) ? 0 : n * mult
  }, [dealSize])

  const href = cheque > 0 ? `/tokenomics?saft=1&cheque=${Math.round(cheque)}` : "/tokenomics?saft=1"

  return (
    <a href={href}
      className="mono flex items-center justify-between gap-2 no-underline"
      style={{
        padding: "10px 14px",
        fontSize: 11, color: "#a78bfa",
        letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 500,
        background: "rgba(167,139,250,0.05)",
        border: "1px solid rgba(167,139,250,0.25)",
        borderRadius: 2,
      }}>
      <span className="flex items-center gap-2">
        <RiCalculatorLine size={12} />
        Run SAFT math {cheque > 0 ? `for ${dealSize}` : ""}
      </span>
      <span style={{ color: "#64748b", fontSize: 9 }}>→ /tokenomics</span>
    </a>
  )
}

// Draft-opener block. Sits above the Notes textarea in the detail drawer.
// Click "Draft opener" → POST to /api/investors/{id}/draft-opener → render
// three email variants with copy buttons. One of the few moments in a
// CRM where the tool actually saves the founder time, not just tracks it.
//
// Deliberately low-key in naming: the button says "Draft opener", not
// "AI-powered magic drafts". The feature works, it doesn't need to
// announce itself.
type DraftVariant = { tone: "direct" | "warm" | "technical"; subject: string; body: string }
function DraftOpenerBlock({ investorId }: { investorId: string }) {
  const [loading, setLoading] = useState(false)
  const [variants, setVariants] = useState<DraftVariant[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null)

  async function handleDraft() {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`/api/investors/${investorId}/draft-opener`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" },
        body: "{}",
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        setError(data?.error || `Draft failed (${res.status})`)
        return
      }
      setVariants(data?.variants || [])
    } catch {
      setError("Network hiccup. Try again.")
    } finally {
      setLoading(false)
    }
  }

  async function copyVariant(idx: number, v: DraftVariant) {
    const text = `Subject: ${v.subject}\n\n${v.body}`
    try {
      await navigator.clipboard.writeText(text)
      setCopiedIdx(idx)
      setTimeout(() => setCopiedIdx(prev => (prev === idx ? null : prev)), 1800)
    } catch {
      // Clipboard API blocked (insecure context or denied permission) —
      // fall back to a selection so the founder can cmd+C themselves.
      setError("Clipboard blocked. Select the text and copy manually.")
    }
  }

  const TONE_COPY: Record<DraftVariant["tone"], { label: string; color: string }> = {
    direct:    { label: "Direct",    color: "#38bdf8" },
    warm:      { label: "Warm",      color: "#fbbf24" },
    technical: { label: "Technical", color: "#a78bfa" },
  }

  return (
    <div>
      <div className="mono flex items-center gap-2 mb-3" style={{ fontSize: 10, color: "#64748b", letterSpacing: "0.12em", textTransform: "uppercase" }}>
        <RiQuillPenLine size={11} /> Draft opener
      </div>

      {!variants && (
        <>
          <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 12, lineHeight: 1.5 }}>
            Three short cold-outreach emails tailored to this investor and your project. Pick one, tweak, send.
          </p>
          <button onClick={handleDraft} disabled={loading}
            className="mono flex items-center gap-2"
            style={{
              padding: "8px 14px", fontSize: 10,
              color: loading ? "#64748b" : "#10b981",
              letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600,
              background: "transparent",
              border: `1px solid ${loading ? "rgba(255,255,255,0.1)" : "rgba(16,185,129,0.35)"}`,
              borderRadius: 2, cursor: loading ? "not-allowed" : "pointer",
            }}>
            <RiQuillPenLine size={11} />
            {loading ? "Drafting three variants..." : "Draft three openers"}
          </button>
        </>
      )}

      {variants && (
        <div className="flex flex-col gap-3">
          {variants.map((v, i) => {
            const t = TONE_COPY[v.tone]
            const copied = copiedIdx === i
            return (
              <div key={i}
                style={{
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderLeft: `2px solid ${t.color}`,
                  padding: "14px 16px",
                  borderRadius: 2,
                  background: "rgba(255,255,255,0.015)",
                }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="mono" style={{
                    fontSize: 9, color: t.color,
                    letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 600,
                  }}>
                    {t.label}
                  </span>
                  <button onClick={() => copyVariant(i, v)}
                    className="mono flex items-center gap-1.5"
                    style={{
                      padding: "3px 8px", fontSize: 9,
                      color: copied ? "#34d399" : "#94a3b8",
                      letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500,
                      background: "transparent",
                      border: `1px solid ${copied ? "rgba(16,185,129,0.35)" : "rgba(255,255,255,0.1)"}`,
                      borderRadius: 2, cursor: "pointer",
                    }}>
                    {copied ? <><RiCheckLine size={10} /> Copied</> : <><RiFileCopyLine size={10} /> Copy</>}
                  </button>
                </div>
                <div style={{ fontSize: 12, color: "#cbd5e1", fontWeight: 500, marginBottom: 8, lineHeight: 1.4 }}>
                  {v.subject}
                </div>
                <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.65, whiteSpace: "pre-wrap" }}>
                  {v.body}
                </div>
              </div>
            )
          })}
          <button onClick={() => { setVariants(null); setError(null); setCopiedIdx(null) }}
            className="mono self-start"
            style={{
              padding: "6px 10px", fontSize: 9,
              color: "#64748b", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500,
              background: "transparent", border: 0, cursor: "pointer",
            }}>
            ← regenerate
          </button>
        </div>
      )}

      {error && (
        <div className="mono mt-3" style={{
          fontSize: 11, color: "#f87171", letterSpacing: "0.04em",
          padding: "8px 12px",
          background: "rgba(239,68,68,0.06)",
          border: "1px solid rgba(239,68,68,0.2)",
          borderRadius: 2,
        }}>
          {error}
        </div>
      )}
    </div>
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
  onStatusChange, onFollowUpSet, onLogContact, onDelete,
}: {
  inv: Investor
  onClose: () => void
  panelNotes: string
  setPanelNotes: (s: string) => void
  savingNotes: boolean
  onSaveNotes: () => void
  onStatusChange: (s: Status) => void
  onFollowUpSet: (iso: string | null) => void
  onLogContact: () => void
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
            <div className="mono mb-3" style={{ fontSize: 10, color: "#64748b", letterSpacing: "0.12em", textTransform: "uppercase" }}>
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
                <div className="mono mb-1.5" style={{ fontSize: 10, color: "#64748b", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                  {f.label}
                </div>
                <div style={{ fontSize: 13, color: "#e5e7eb" }} className="truncate">{f.value}</div>
              </div>
            ))}
          </div>

          {/* Contextual SAFT shortcut. Only shows when the investor is on
              term-sheet — that's the moment a founder actually wants the
              math. Pre-fills the cheque field from this row's deal_size. */}
          {inv.status === "term_sheet" && (
            <SaftJumpLink dealSize={inv.deal_size || ""} />
          )}

          {inv.updated_at && (
            <div className="mono flex items-center gap-2" style={{ fontSize: 10, color: "#64748b", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              <RiTimeLine size={11} />
              Last updated {new Date(inv.updated_at).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}
              {inv.last_contacted_at && (
                <>
                  <span style={{ color: "#475569" }}>·</span>
                  Pinged {relTime(inv.last_contacted_at)}
                </>
              )}
            </div>
          )}

          <FollowUpBlock
            nextAt={inv.next_follow_up_at || null}
            onSet={onFollowUpSet}
            onLogContact={onLogContact}
          />

          <DraftOpenerBlock investorId={inv.id} />

          <div>
            <div className="mono flex items-center gap-2 mb-3" style={{ fontSize: 10, color: "#64748b", letterSpacing: "0.12em", textTransform: "uppercase" }}>
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

// Follow-up reminder block. Shows the current reminder state (if any),
// a row of quick-set presets, a native date picker for arbitrary dates,
// and a "log a touch" button that stamps last_contacted_at = now.
// The presets drop the user into the same PATCH the date picker uses.
function FollowUpBlock({
  nextAt, onSet, onLogContact,
}: {
  nextAt: string | null
  onSet: (iso: string | null) => void
  onLogContact: () => void
}) {
  const [showPicker, setShowPicker] = useState(false)
  const [customVal, setCustomVal] = useState("")

  // "+N days at 9am" — 9am local reads as a human-friendly "first thing
  // tomorrow" default instead of the current second.
  function atNineAm(offsetDays: number): string {
    const d = new Date()
    d.setDate(d.getDate() + offsetDays)
    d.setHours(9, 0, 0, 0)
    return d.toISOString()
  }

  // Current-state copy — color-coded so overdue pops red.
  const stateMeta = (() => {
    if (!nextAt) return null
    const t = new Date(nextAt).getTime()
    if (isNaN(t)) return null
    const diff = t - Date.now()
    if (diff < 0) {
      const h = Math.floor(-diff / 3_600_000)
      const d = Math.floor(h / 24)
      return {
        color: "#f87171",
        copy: d >= 1 ? `Overdue · ${d}d late` : h >= 1 ? `Overdue · ${h}h late` : "Overdue",
      }
    }
    const h = Math.floor(diff / 3_600_000)
    const d = Math.floor(h / 24)
    if (d >= 1) return { color: "#cbd5e1", copy: `In ${d}d` }
    if (h >= 1) return { color: "#fbbf24", copy: `In ${h}h` }
    const m = Math.max(1, Math.floor(diff / 60_000))
    return { color: "#fbbf24", copy: `In ${m}m` }
  })()

  const PRESET_STYLE: React.CSSProperties = {
    padding: "6px 10px", fontSize: 10,
    color: "#cbd5e1", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500,
    background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 2,
    cursor: "pointer",
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="mono flex items-center gap-2" style={{ fontSize: 10, color: "#64748b", letterSpacing: "0.12em", textTransform: "uppercase" }}>
          <RiAlarmLine size={11} /> Follow-up
        </div>
        {stateMeta && (
          <div className="mono flex items-center gap-2" style={{ fontSize: 10, color: stateMeta.color, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            <span>{stateMeta.copy}</span>
            <button onClick={() => onSet(null)}
              aria-label="Clear reminder"
              style={{
                background: "transparent", border: 0, cursor: "pointer",
                color: "#64748b", padding: 0,
              }}>
              <RiCloseLine size={12} />
            </button>
          </div>
        )}
      </div>

      {nextAt && (
        <div className="mb-3" style={{ fontSize: 12, color: "#cbd5e1" }}>
          Reminder set for{" "}
          <span className="mono" style={{ color: "#e5e7eb" }}>
            {new Date(nextAt).toLocaleString("en", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
          </span>
        </div>
      )}

      <div className="flex flex-wrap gap-1.5">
        <button onClick={() => onSet(atNineAm(1))} style={PRESET_STYLE}>Tomorrow</button>
        <button onClick={() => onSet(atNineAm(3))} style={PRESET_STYLE}>In 3 days</button>
        <button onClick={() => onSet(atNineAm(7))} style={PRESET_STYLE}>Next week</button>
        <button onClick={() => setShowPicker(v => !v)}
          style={{ ...PRESET_STYLE, color: showPicker ? "#10b981" : "#cbd5e1", borderColor: showPicker ? "rgba(16,185,129,0.3)" : "rgba(255,255,255,0.1)" }}>
          <RiCalendarScheduleLine size={11} style={{ display: "inline", marginRight: 4, verticalAlign: "-2px" }} />
          Custom
        </button>
      </div>

      {showPicker && (
        <div className="mt-3 flex items-center gap-2">
          <input type="datetime-local"
            value={customVal}
            onChange={e => setCustomVal(e.target.value)}
            style={{
              flex: 1,
              background: "transparent", color: "#e5e7eb",
              border: "1px solid rgba(255,255,255,0.12)", borderRadius: 2,
              padding: "6px 8px", fontSize: 12,
              fontFamily: "inherit",
              colorScheme: "dark",
            }} />
          <button onClick={() => {
            if (!customVal) return
            const d = new Date(customVal)
            if (isNaN(d.getTime())) return
            onSet(d.toISOString())
            setShowPicker(false)
            setCustomVal("")
          }}
            className="mono"
            style={{
              padding: "7px 12px", fontSize: 10,
              color: "#fff", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600,
              background: "#10b981", border: 0, borderRadius: 2, cursor: "pointer",
            }}>
            Set
          </button>
        </div>
      )}

      <button onClick={onLogContact}
        className="mono mt-3 flex items-center gap-1.5"
        style={{
          padding: "7px 12px", fontSize: 10,
          color: "#94a3b8", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500,
          background: "transparent", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 2,
          cursor: "pointer",
        }}>
        <RiMailSendLine size={11} /> Log a touch
      </button>
    </div>
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
        label: <>Notes updated{length > 0 ? <span className="mono" style={{ color: "#64748b", marginLeft: 6 }}>{length} chars</span> : ""}</>,
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
    case "follow_up_set": {
      const at = payload.at ? new Date(String(payload.at)) : null
      return {
        icon: <RiAlarmLine size={12} />,
        color: "#fbbf24",
        label: (
          <>
            Reminder set for{" "}
            <span className="mono" style={{ color: "#fff" }}>
              {at ? at.toLocaleDateString("en", { month: "short", day: "numeric" }) : "—"}
            </span>
          </>
        ),
      }
    }
    case "follow_up_rescheduled": {
      const from = payload.from ? new Date(String(payload.from)) : null
      const to   = payload.to   ? new Date(String(payload.to))   : null
      return {
        icon: <RiAlarmLine size={12} />,
        color: "#fbbf24",
        label: (
          <>
            Reminder moved{" "}
            <span className="mono" style={{ color: "#94a3b8" }}>
              {from ? from.toLocaleDateString("en", { month: "short", day: "numeric" }) : "—"}
            </span>{" "}→{" "}
            <span className="mono" style={{ color: "#fff" }}>
              {to ? to.toLocaleDateString("en", { month: "short", day: "numeric" }) : "—"}
            </span>
          </>
        ),
      }
    }
    case "follow_up_cleared": {
      return {
        icon: <RiCloseLine size={12} />,
        color: "#64748b",
        label: <>Reminder cleared</>,
      }
    }
    case "contacted": {
      return {
        icon: <RiMailSendLine size={12} />,
        color: "#34d399",
        label: <>Logged a touch</>,
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
      <div className="mono flex items-center gap-2 mb-3" style={{ fontSize: 10, color: "#64748b", letterSpacing: "0.12em", textTransform: "uppercase" }}>
        <RiHistoryLine size={11} /> Timeline
      </div>
      {loading ? (
        <div className="mono py-4" style={{ fontSize: 10, color: "#64748b", letterSpacing: "0.06em" }}>
          Loading events...
        </div>
      ) : events.length === 0 ? (
        <div className="mono py-4" style={{ fontSize: 11, color: "#64748b", letterSpacing: "0.04em" }}>
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
                <div className="mono" style={{ fontSize: 10, color: "#64748b", letterSpacing: "0.04em", marginTop: 2 }}>
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
