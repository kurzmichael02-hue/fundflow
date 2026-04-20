"use client"
import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import AppNav from "@/components/AppNav"
import { RiArrowUpLine, RiArrowDownLine, RiSubtractLine } from "react-icons/ri"

// Analytics — editorial "terminal" styling.
// Numbers in Fraunces serif, labels + dates in mono, hairline rows.
// Reads like a financial terminal or an editorial statistical spread,
// not a generic SaaS dashboard.

type Status = "outreach" | "interested" | "meeting" | "term_sheet" | "closed"
type Investor = {
  id: string
  name: string
  company?: string | null
  email?: string | null
  status: Status
  deal_size?: string | null
}
type Interest = {
  id: string
  created_at: string
}

const STAGES: Array<{ key: Status; label: string; color: string }> = [
  { key: "outreach",   label: "Outreach",   color: "#9ca3af" },
  { key: "interested", label: "Interested", color: "#a78bfa" },
  { key: "meeting",    label: "Meeting",    color: "#fbbf24" },
  { key: "term_sheet", label: "Term Sheet", color: "#38bdf8" },
  { key: "closed",     label: "Closed",     color: "#34d399" },
]

function parseDealSize(raw: unknown): number {
  if (raw == null) return 0
  const s = String(raw).trim().toLowerCase()
  if (!s) return 0
  let mult = 1
  if (/\bb\b|billion/.test(s))          mult = 1_000_000_000
  else if (/\bm\b|million|mm\b/.test(s)) mult = 1_000_000
  else if (/\bk\b|thousand/.test(s))     mult = 1_000
  const only = s.replace(/[^0-9.,]/g, "")
  const hasCommaDecimal = /\d,\d{1,2}(?!\d)/.test(only) && !/\.\d/.test(only)
  const norm = hasCommaDecimal ? only.replace(/\./g, "").replace(",", ".") : only.replace(/,/g, "")
  const n = parseFloat(norm)
  return isNaN(n) ? 0 : n * mult
}

function formatUsd(n: number): string {
  if (n <= 0) return "$0"
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(n >= 10_000_000_000 ? 0 : 1)}B`
  if (n >= 1_000_000)     return `$${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)}M`
  if (n >= 1_000)         return `$${(n / 1_000).toFixed(0)}k`
  return `$${n.toFixed(0)}`
}

export default function AnalyticsPage() {
  const router = useRouter()
  const [investors, setInvestors] = useState<Investor[]>([])
  const [interests, setInterests] = useState<Interest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) { router.push("/login"); return }
    fetchAll(token)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function fetchAll(token: string) {
    try {
      const [invRes, intRes] = await Promise.all([
        fetch("/api/investors", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/interests", { headers: { Authorization: `Bearer ${token}` } }),
      ])
      if (invRes.status === 401 || intRes.status === 401) {
        localStorage.removeItem("token")
        localStorage.removeItem("user_type")
        router.push("/login")
        return
      }
      const invData = await invRes.json()
      const intData = await intRes.json()
      setInvestors(Array.isArray(invData) ? invData : [])
      setInterests(Array.isArray(intData) ? intData : [])
    } catch {
      // Network or parse error — leave the page empty, don't redirect.
    } finally {
      setLoading(false)
    }
  }

  // ── Derived ────────────────────────────────────────────────────────────
  const funnel = useMemo(() =>
    STAGES.map(s => ({ ...s, count: investors.filter(i => i.status === s.key).length })),
    [investors]
  )
  const maxCount = useMemo(() => Math.max(...funnel.map(s => s.count), 1), [funnel])
  const total = investors.length
  const closed = investors.filter(i => i.status === "closed").length
  const conversionRate = total > 0 ? ((closed / total) * 100).toFixed(1) : "0.0"
  const movedPastOutreach = investors.filter(i => i.status !== "outreach").length
  const responseRate = total > 0 ? ((movedPastOutreach / total) * 100).toFixed(1) : "0.0"
  const totalCommitted = investors
    .filter(i => i.status === "closed" && i.deal_size)
    .reduce((sum, i) => sum + parseDealSize(i.deal_size), 0)
  const avgDealSize = closed > 0 ? totalCommitted / closed : 0

  const topInvestors = useMemo(() => [...investors]
    .filter(i => i.deal_size)
    .sort((a, b) => parseDealSize(b.deal_size) - parseDealSize(a.deal_size))
    .slice(0, 6), [investors])

  // 7-day interest chart
  const last7 = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (6 - i))
      return d.toISOString().split("T")[0]
    })
  }, [])
  const interestsByDay = useMemo(() => last7.map(day => ({
    day,
    label: new Date(day).toLocaleDateString("en", { weekday: "short" }),
    count: interests.filter(it => it.created_at?.startsWith(day)).length,
  })), [last7, interests])
  const maxInterests = Math.max(...interestsByDay.map(d => d.count), 1)
  const totalInterests = interests.length

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#060608" }}>
      <AppNav />
      <div className="max-w-[1280px] mx-auto px-6 md:px-10 py-20 flex items-center gap-3">
        <div style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid #10b981", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
        <span className="mono" style={{ fontSize: 11, color: "#64748b", letterSpacing: "0.08em", textTransform: "uppercase" }}>Loading numbers...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  )

  return (
    <main style={{ minHeight: "100vh", background: "#060608", color: "#e5e7eb", fontFamily: "'DM Sans', sans-serif" }}>
      <AppNav />

      <div className="max-w-[1280px] mx-auto px-6 md:px-10">

        {/* ── Ticker ── */}
        <div className="flex items-center justify-between flex-wrap gap-3 pt-8 pb-6"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="mono flex items-center gap-x-5 gap-y-2 flex-wrap" style={{ fontSize: 11, color: "#64748b", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            <span>Analytics</span>
            <span style={{ color: "#475569" }}>·</span>
            <span>{new Date().toLocaleDateString("en", { month: "short", day: "numeric" })}</span>
            <span style={{ color: "#475569" }}>·</span>
            <span><span style={{ color: "#34d399" }}>{conversionRate}%</span> conversion</span>
          </div>
        </div>

        {/* ── Masthead + hero numbers ── */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-10 pt-10 md:pt-14 pb-10 items-end">
          <div className="md:col-span-6">
            <p className="mono mb-3" style={{ fontSize: 11, color: "#10b981", letterSpacing: "0.12em", textTransform: "uppercase" }}>
              § Signal
            </p>
            <h1 className="serif text-white" style={{
              fontSize: "clamp(40px, 5.5vw, 72px)", lineHeight: 0.95, letterSpacing: "-0.045em", fontWeight: 500,
            }}>
              The honest <span style={{ fontStyle: "italic", fontWeight: 400 }}>numbers.</span>
            </h1>
            <p style={{ fontSize: 16, color: "#94a3b8", marginTop: 20, maxWidth: 480, lineHeight: 1.6 }}>
              Every investor you&apos;ve added, where they sit in the funnel, how fast the round is
              moving, and what was committed. No vanity metrics.
            </p>
          </div>
          <div className="md:col-span-6 grid grid-cols-2 gap-x-8 gap-y-6 md:text-right">
            <HeroStat label="Conversion" value={`${conversionRate}%`} hint={`${closed} / ${total}`} trend={parseFloat(conversionRate) >= 5 ? "up" : "flat"} />
            <HeroStat label="Response rate" value={`${responseRate}%`} hint={`${movedPastOutreach} moved on`} trend="flat" />
            <HeroStat label="Committed" value={formatUsd(totalCommitted)} hint={`${closed} closed`} trend={closed > 0 ? "up" : "flat"} />
            <HeroStat label="Avg deal size" value={formatUsd(avgDealSize)} hint="closed only" trend="flat" />
          </div>
        </section>

        {/* ── Funnel ── full width, editorial */}
        <section className="py-12" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="flex items-baseline justify-between mb-8">
            <p className="mono" style={{ fontSize: 11, color: "#10b981", letterSpacing: "0.12em", textTransform: "uppercase" }}>
              § Funnel
            </p>
            <span className="mono" style={{ fontSize: 10, color: "#64748b", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Stage → next stage
            </span>
          </div>

          <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            {funnel.map((s, idx) => {
              const nextCount = idx < funnel.length - 1 ? funnel[idx + 1].count : null
              const conv = (nextCount != null && s.count > 0)
                ? Math.round((nextCount / s.count) * 100)
                : null
              const width = (s.count / maxCount) * 100
              return (
                <div key={s.key} className="grid grid-cols-[60px_1fr_80px_140px] md:grid-cols-[80px_1fr_100px_180px] gap-4 items-center py-4"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <span className="mono" style={{ fontSize: 11, color: "#475569", letterSpacing: "0.08em" }}>
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <div style={{ fontSize: 13, color: "#e5e7eb", marginBottom: 6 }}>{s.label}</div>
                    <div style={{ height: 2, background: "rgba(255,255,255,0.04)", position: "relative" }}>
                      <div style={{ width: `${width}%`, height: "100%", background: s.color, opacity: 0.9, transition: "width 600ms ease" }} />
                    </div>
                  </div>
                  <span className="serif text-right md:text-left" style={{ fontSize: 26, color: s.color, fontWeight: 500, letterSpacing: "-0.02em", lineHeight: 1 }}>
                    {s.count}
                  </span>
                  <span className="mono text-right" style={{ fontSize: 10, color: conv != null ? "#94a3b8" : "#475569", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                    {conv != null ? `${conv}% → next` : "—"}
                  </span>
                </div>
              )
            })}
          </div>

          {total === 0 && (
            <div className="py-12 text-center mono" style={{ fontSize: 11, color: "#64748b", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Nothing in the pipeline yet
            </div>
          )}
        </section>

        {/* ── Two-column: interest chart + top deals ── */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-10 py-12"
          style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>

          <div className="md:col-span-6">
            <div className="flex items-baseline justify-between mb-8">
              <p className="mono" style={{ fontSize: 11, color: "#10b981", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                § Inbound signal
              </p>
              <span className="mono" style={{ fontSize: 10, color: "#64748b", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Last 7 days · {totalInterests} total
              </span>
            </div>

            <div className="flex items-end gap-2" style={{ height: 140 }}>
              {interestsByDay.map(d => (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-2" style={{ height: "100%" }}>
                  <div className="flex-1 w-full relative" style={{ display: "flex", alignItems: "flex-end" }}>
                    <div style={{
                      width: "100%",
                      height: `${Math.max((d.count / maxInterests) * 100, d.count > 0 ? 8 : 2)}%`,
                      background: d.count > 0 ? "#10b981" : "rgba(255,255,255,0.04)",
                      opacity: d.count > 0 ? 0.85 : 1,
                      transition: "height 600ms ease",
                    }} />
                    {d.count > 0 && (
                      <span className="mono absolute" style={{ top: -18, left: "50%", transform: "translateX(-50%)", fontSize: 10, color: "#34d399", letterSpacing: "0.04em", fontWeight: 600 }}>
                        {d.count}
                      </span>
                    )}
                  </div>
                  <span className="mono" style={{ fontSize: 10, color: "#64748b", letterSpacing: "0.04em" }}>{d.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-6">
            <div className="flex items-baseline justify-between mb-8">
              <p className="mono" style={{ fontSize: 11, color: "#10b981", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                § Top cheques
              </p>
              <span className="mono" style={{ fontSize: 10, color: "#64748b", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                By deal size
              </span>
            </div>

            {topInvestors.length === 0 ? (
              <div className="py-10 mono" style={{ fontSize: 11, color: "#64748b", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                No deal sizes tracked
              </div>
            ) : (
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                {topInvestors.map((inv, i) => {
                  const stage = STAGES.find(s => s.key === inv.status)
                  return (
                    <div key={inv.id}
                      className="grid grid-cols-[30px_1fr_auto] gap-3 items-center py-3"
                      style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                      <span className="mono" style={{ fontSize: 11, color: "#475569", letterSpacing: "0.04em" }}>
                        #{String(i + 1).padStart(2, "0")}
                      </span>
                      <div className="min-w-0">
                        <div style={{ fontSize: 13, color: "#e5e7eb" }} className="truncate">{inv.name}</div>
                        <div className="mono truncate" style={{ fontSize: 10, color: "#64748b", letterSpacing: "0.04em", marginTop: 2 }}>
                          {inv.company || inv.email || "—"}
                          {stage && <span style={{ marginLeft: 8, color: stage.color }}>· {stage.label}</span>}
                        </div>
                      </div>
                      <span className="mono flex-shrink-0" style={{ fontSize: 13, color: "#fff", fontWeight: 500 }}>
                        {inv.deal_size}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </section>

        <div style={{ height: 80 }} />
      </div>
    </main>
  )
}

function HeroStat({ label, value, hint, trend }: {
  label: string
  value: string
  hint: string
  trend: "up" | "down" | "flat"
}) {
  const trendIcon =
    trend === "up"   ? <RiArrowUpLine size={11} /> :
    trend === "down" ? <RiArrowDownLine size={11} /> :
                       <RiSubtractLine size={11} />
  const trendColor =
    trend === "up"   ? "#34d399" :
    trend === "down" ? "#f87171" :
                       "#64748b"
  return (
    <div>
      <div className="mono" style={{ fontSize: 10, color: "#64748b", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6 }}>
        {label}
      </div>
      <div className="serif text-white" style={{ fontSize: 34, fontWeight: 500, letterSpacing: "-0.02em", lineHeight: 1 }}>
        {value}
      </div>
      <div className="mono flex md:justify-end items-center gap-1.5 mt-2" style={{ fontSize: 10, color: trendColor, letterSpacing: "0.04em" }}>
        {trendIcon} <span style={{ color: "#64748b" }}>{hint}</span>
      </div>
    </div>
  )
}
