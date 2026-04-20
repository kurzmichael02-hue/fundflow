"use client"
import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { api, isUnauthorized, clearSessionAndRedirect } from "@/lib/api"
import AppNav from "@/components/AppNav"
import { ToastContainer, useToast } from "@/components/Toast"
import { RiArrowRightLine } from "react-icons/ri"

// Pipeline — Kanban of investors by status.
// Editorial restyle: sharp borders, mono column headers, cards that read
// as rows of facts rather than glossy panels. On mobile, tabs switch
// between columns to keep the dense layout usable.

type Status = "outreach" | "interested" | "meeting" | "term_sheet" | "closed"
type Investor = {
  id: string
  name: string
  company?: string | null
  email?: string | null
  status: Status
  deal_size?: string | null
}

const COLUMNS: Array<{ key: Status; label: string; color: string }> = [
  { key: "outreach",   label: "Outreach",   color: "#9ca3af" },
  { key: "interested", label: "Interested", color: "#a78bfa" },
  { key: "meeting",    label: "Meeting",    color: "#fbbf24" },
  { key: "term_sheet", label: "Term Sheet", color: "#38bdf8" },
  { key: "closed",     label: "Closed",     color: "#34d399" },
]

export default function PipelinePage() {
  const router = useRouter()
  const [investors, setInvestors] = useState<Investor[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<Status>("outreach")
  const { toasts, addToast, removeToast } = useToast()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) { router.push("/login"); return }
    api.getInvestors()
      .then((data: Investor[]) => { setInvestors(data); setLoading(false) })
      .catch((err) => {
        // Only bounce to login on a real auth failure. Anything else
        // (Supabase down, network blip, JWT secret mis-set on the server)
        // gets a toast — bouncing on every error is what created the
        // login-loop bug.
        if (isUnauthorized(err)) {
          clearSessionAndRedirect((p) => router.push(p))
          return
        }
        addToast(err instanceof Error ? err.message : "Failed to load pipeline", "error")
        setLoading(false)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function moveInvestor(id: string, newStatus: Status) {
    const prev = investors
    setInvestors(list => list.map(i => i.id === id ? { ...i, status: newStatus } : i))
    try {
      await api.updateInvestor(id, { status: newStatus })
      addToast(`Moved to ${COLUMNS.find(c => c.key === newStatus)?.label}`)
    } catch (err) {
      setInvestors(prev)
      if (isUnauthorized(err)) {
        clearSessionAndRedirect((p) => router.push(p))
        return
      }
      addToast(err instanceof Error ? err.message : "Failed to move", "error")
    }
  }

  const stats = useMemo(() => ({
    total: investors.length,
    active: investors.filter(i => ["interested", "meeting", "term_sheet"].includes(i.status)).length,
    closed: investors.filter(i => i.status === "closed").length,
  }), [investors])

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#060608" }}>
      <AppNav />
      <div className="max-w-[1280px] mx-auto px-6 md:px-10 py-20 flex items-center gap-3">
        <div style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid #10b981", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
        <span className="mono" style={{ fontSize: 11, color: "#64748b", letterSpacing: "0.08em", textTransform: "uppercase" }}>Loading pipeline...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  )

  return (
    <main style={{ minHeight: "100vh", background: "#060608", color: "#e5e7eb", fontFamily: "'DM Sans', sans-serif" }}>
      <AppNav />
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="max-w-[1280px] mx-auto px-6 md:px-10">

        {/* ── Ticker ── */}
        <div className="flex items-center justify-between flex-wrap gap-3 pt-8 pb-6"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="mono flex items-center gap-x-5 gap-y-2 flex-wrap" style={{ fontSize: 11, color: "#64748b", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            <span>Pipeline</span>
            <span style={{ color: "#475569" }}>·</span>
            <span><span style={{ color: "#e5e7eb" }}>{stats.total}</span> total</span>
            <span style={{ color: "#475569" }}>·</span>
            <span><span style={{ color: "#a78bfa" }}>{stats.active}</span> active</span>
            <span style={{ color: "#475569" }}>·</span>
            <span><span style={{ color: "#34d399" }}>{stats.closed}</span> closed</span>
          </div>
        </div>

        {/* ── Masthead ── */}
        <section className="pt-10 md:pt-14 pb-8">
          <p className="mono mb-3" style={{ fontSize: 11, color: "#10b981", letterSpacing: "0.12em", textTransform: "uppercase" }}>
            Deal flow
          </p>
          <h1 className="serif text-white" style={{
            fontSize: "clamp(40px, 5.5vw, 72px)", lineHeight: 0.95, letterSpacing: "-0.045em", fontWeight: 500,
          }}>
            Every deal, one column at a time.
          </h1>
        </section>

        {investors.length === 0 ? (
          <PipelineEmpty />
        ) : (
          <>
            {/* ── Desktop: 5 columns ── */}
            <section className="hidden md:grid grid-cols-5 gap-0"
              style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
              {COLUMNS.map((col, i) => (
                <PipelineColumn key={col.key} col={col} investors={investors}
                  moveInvestor={moveInvestor}
                  leftBorder={i > 0} />
              ))}
            </section>

            {/* ── Mobile: tabs + single column ── */}
            <section className="md:hidden py-2">
              <div className="flex gap-1.5 overflow-x-auto pb-3" style={{ scrollbarWidth: "none" }}>
                {COLUMNS.map(col => {
                  const active = activeTab === col.key
                  const count = investors.filter(i => i.status === col.key).length
                  return (
                    <button key={col.key} onClick={() => setActiveTab(col.key)}
                      className="mono cursor-pointer whitespace-nowrap"
                      style={{
                        padding: "6px 10px",
                        fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 500,
                        color: active ? col.color : "#64748b",
                        background: active ? `${col.color}14` : "transparent",
                        border: `1px solid ${active ? col.color + "40" : "rgba(255,255,255,0.08)"}`,
                        borderRadius: 2,
                      }}>
                      {col.label} <span style={{ opacity: 0.6 }}>· {count}</span>
                    </button>
                  )
                })}
              </div>
              {COLUMNS.filter(c => c.key === activeTab).map(col => (
                <PipelineColumn key={col.key} col={col} investors={investors}
                  moveInvestor={moveInvestor} mobile />
              ))}
            </section>
          </>
        )}

        <div style={{ height: 80 }} />
      </div>
    </main>
  )
}

// Editorial empty state — shown when there are no investors yet. Doesn't
// pretend the kanban is populated and doesn't show stub illustrations.
function PipelineEmpty() {
  return (
    <section className="py-16 md:py-24" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
        <div className="md:col-span-7">
          <p className="mono mb-5" style={{ fontSize: 11, color: "#10b981", letterSpacing: "0.12em", textTransform: "uppercase" }}>
            Empty pipeline
          </p>
          <h2 className="serif text-white" style={{
            fontSize: "clamp(32px, 4.5vw, 56px)", lineHeight: 1, letterSpacing: "-0.04em", fontWeight: 500,
          }}>
            Nothing in the funnel yet.
          </h2>
          <p style={{ fontSize: 16, color: "#94a3b8", marginTop: 20, maxWidth: 480, lineHeight: 1.65 }}>
            Add a few investors first — they&apos;ll show up here as cards you can drag from
            Outreach all the way to Closed. The board mirrors your CRM, so anything you
            change here lives in the data room too.
          </p>
          <div className="flex flex-wrap gap-3 mt-8">
            <Link href="/investors?new=1" className="mono no-underline flex items-center gap-1.5"
              style={{
                fontSize: 11, color: "#fff", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600,
                padding: "10px 18px", background: "#10b981", borderRadius: 2,
              }}>
              Add an investor <RiArrowRightLine size={12} />
            </Link>
            <Link href="/investors/database" className="mono no-underline flex items-center gap-1.5"
              style={{
                fontSize: 11, color: "#cbd5e1", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500,
                padding: "10px 18px", background: "transparent",
                border: "1px solid rgba(255,255,255,0.12)", borderRadius: 2,
              }}>
              Browse the directory →
            </Link>
          </div>
        </div>
        <div className="md:col-span-5">
          <div className="mono mb-3" style={{ fontSize: 10, color: "#64748b", letterSpacing: "0.12em", textTransform: "uppercase" }}>
            What this view does
          </div>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {[
              "Five columns — Outreach to Closed",
              "Drag and drop, or change status from a card",
              "Optimistic moves, rolls back if the server says no",
              "Mobile collapses to one column with tabs",
            ].map(t => (
              <li key={t} className="flex items-start gap-3 py-2.5" style={{
                fontSize: 14, color: "#cbd5e1",
                borderTop: "1px solid rgba(255,255,255,0.06)",
              }}>
                <span className="mono" style={{ fontSize: 10, color: "#64748b", marginTop: 4 }}>—</span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

function PipelineColumn({
  col, investors, moveInvestor, leftBorder, mobile,
}: {
  col: { key: Status; label: string; color: string }
  investors: Investor[]
  moveInvestor: (id: string, s: Status) => void
  leftBorder?: boolean
  mobile?: boolean
}) {
  const rows = investors.filter(i => i.status === col.key)
  return (
    <div style={{
      borderLeft: leftBorder ? "1px solid rgba(255,255,255,0.06)" : "none",
      padding: mobile ? "16px 0" : "20px 16px",
      minHeight: mobile ? "auto" : 360,
      borderTop: `2px solid ${col.color}`,
    }}>
      {!mobile && (
        <div className="flex items-center justify-between mb-5">
          <span className="mono" style={{ fontSize: 10, color: col.color, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600 }}>
            {col.label}
          </span>
          <span className="mono" style={{ fontSize: 10, color: "#64748b", letterSpacing: "0.04em" }}>
            {rows.length}
          </span>
        </div>
      )}
      <div className="flex flex-col gap-2">
        {rows.map(inv => (
          <PipelineCard key={inv.id} inv={inv} color={col.color} moveInvestor={moveInvestor} />
        ))}
        {rows.length === 0 && !mobile && (
          <div className="mono text-center py-10" style={{ fontSize: 10, color: "#475569", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Empty
          </div>
        )}
      </div>
    </div>
  )
}

function PipelineCard({
  inv, color, moveInvestor,
}: {
  inv: Investor
  color: string
  moveInvestor: (id: string, s: Status) => void
}) {
  return (
    <div style={{
      background: "#0a0a0d",
      border: "1px solid rgba(255,255,255,0.06)",
      padding: "12px 14px",
      borderRadius: 2,
    }}>
      <div style={{ fontSize: 13, color: "#e5e7eb", fontWeight: 500, lineHeight: 1.3 }}>
        {inv.name}
      </div>
      <div className="mono mt-1" style={{ fontSize: 10, color: "#64748b", letterSpacing: "0.04em" }}>
        {inv.company || inv.email || "—"}
      </div>
      {inv.deal_size && (
        <div className="mono mt-2" style={{ fontSize: 11, color, fontWeight: 500, letterSpacing: "0.02em" }}>
          {inv.deal_size}
        </div>
      )}
      <select value={inv.status}
        onChange={e => moveInvestor(inv.id, e.target.value as Status)}
        className="mono mt-3 cursor-pointer"
        style={{
          width: "100%",
          fontSize: 10,
          letterSpacing: "0.06em", textTransform: "uppercase",
          color: "#94a3b8",
          background: "#060608",
          border: "1px solid rgba(255,255,255,0.08)",
          padding: "6px 8px",
          outline: "none",
          fontFamily: "inherit",
          borderRadius: 2,
        }}>
        {COLUMNS.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
      </select>
    </div>
  )
}
