"use client"
import { useState, useEffect, useRef, useMemo } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@supabase/supabase-js"
import AppNav from "@/components/AppNav"
import {
  RiArrowRightLine, RiBellLine, RiCheckboxCircleLine,
  RiRocketLine, RiAccountCircleLine, RiUserLine,
  RiArrowUpLine, RiCalendarEventLine,
} from "react-icons/ri"

// Dashboard — editorial "command center" layout.
// Replaces the previous 4-stat grid + 2 card panels with:
//   · a mono ticker strip that shows the numbers that actually matter,
//   · a serif hero metric (total committed),
//   · secondary stats as a hairline-bordered editorial table row,
//   · Focus + Activity columns that surface what the founder should do
//     next instead of just dumping lists.

type Status = "outreach" | "interested" | "meeting" | "term_sheet" | "closed"
type Investor = {
  id: string
  name: string
  company?: string | null
  email?: string | null
  status: Status
  deal_size?: string | null
  updated_at?: string | null
}
type Interest = {
  id: string
  investor_name?: string | null
  investor_email?: string | null
  projects?: { name?: string | null } | null
  created_at: string
}

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

// Parse the free-form deal_size string into a number. Same logic as the
// analytics page — keeps the hero committed-total honest even when
// founders type "$5M", "2.5M", or "€500.000".
function parseDealSize(raw: unknown): number {
  if (raw == null) return 0
  const s = String(raw).trim().toLowerCase()
  if (!s) return 0
  let mult = 1
  if (/\bb\b|billion/.test(s))        mult = 1_000_000_000
  else if (/\bm\b|million|mm\b/.test(s)) mult = 1_000_000
  else if (/\bk\b|thousand/.test(s))     mult = 1_000
  const onlyNums = s.replace(/[^0-9.,]/g, "")
  const hasCommaDecimal = /\d,\d{1,2}(?!\d)/.test(onlyNums) && !/\.\d/.test(onlyNums)
  const normalised = hasCommaDecimal
    ? onlyNums.replace(/\./g, "").replace(",", ".")
    : onlyNums.replace(/,/g, "")
  const num = parseFloat(normalised)
  return isNaN(num) ? 0 : num * mult
}

function formatUsd(n: number): string {
  if (n <= 0) return "$0"
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(n >= 10_000_000_000 ? 0 : 1)}B`
  if (n >= 1_000_000)     return `$${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)}M`
  if (n >= 1_000)         return `$${(n / 1_000).toFixed(0)}k`
  return `$${n.toFixed(0)}`
}

function relTime(iso: string): string {
  const now = Date.now()
  const then = new Date(iso).getTime()
  const diff = Math.max(0, now - then)
  const s = Math.floor(diff / 1000)
  if (s < 60) return `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d}d ago`
  return new Date(iso).toLocaleDateString("en", { month: "short", day: "numeric" })
}

export default function DashboardPage() {
  const router = useRouter()
  const [investors, setInvestors] = useState<Investor[]>([])
  const [interests, setInterests] = useState<Interest[]>([])
  const [loading, setLoading] = useState(true)
  const [live, setLive] = useState(false)
  const [plan, setPlan] = useState("free")
  const [upgrading, setUpgrading] = useState(false)
  const [userEmail, setUserEmail] = useState("")
  const channelsRef = useRef<Array<{ unsubscribe: () => void }>>([])

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) { router.push("/login"); return }
    fetchAll(token)
    setupRealtime(token)
    return () => { channelsRef.current.forEach(c => c.unsubscribe()) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function fetchAll(token: string) {
    try {
      const [invRes, intRes, profileRes] = await Promise.all([
        fetch("/api/investors", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/interests", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/profile",   { headers: { Authorization: `Bearer ${token}` } }),
      ])
      const invData = await invRes.json()
      const intData = await intRes.json()
      const profileData = await profileRes.json()
      setInvestors(Array.isArray(invData) ? invData : [])
      setInterests(Array.isArray(intData) ? intData : [])
      setPlan(profileData?.plan || "free")
      setUserEmail(profileData?.email || "")
    } catch {
      router.push("/login")
    } finally {
      setLoading(false)
    }
  }

  async function handleUpgrade() {
    setUpgrading(true)
    const token = localStorage.getItem("token")!
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ email: userEmail }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else setUpgrading(false)
    } catch { setUpgrading(false) }
  }

  async function handleManageBilling() {
    setUpgrading(true)
    const token = localStorage.getItem("token")!
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else setUpgrading(false)
    } catch { setUpgrading(false) }
  }

  function setupRealtime(token: string) {
    let userId: string | null = null
    try {
      const raw = token.split(".")[1]
      const norm = raw.replace(/-/g, "+").replace(/_/g, "/")
      const padded = norm + "=".repeat((4 - norm.length % 4) % 4)
      userId = JSON.parse(atob(padded)).sub
    } catch { return }
    if (!userId) return

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    )

    const invChannel = supabase
      .channel("investors-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "investors", filter: `user_id=eq.${userId}` }, payload => {
        if (payload.eventType === "INSERT") setInvestors(prev => [payload.new as Investor, ...prev])
        else if (payload.eventType === "UPDATE") setInvestors(prev => prev.map(i => i.id === (payload.new as Investor).id ? payload.new as Investor : i))
        else if (payload.eventType === "DELETE") setInvestors(prev => prev.filter(i => i.id !== (payload.old as Investor).id))
      })
      .subscribe(status => { if (status === "SUBSCRIBED") setLive(true) })

    const intChannel = supabase
      .channel("interests-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "interests" }, async () => {
        const t = localStorage.getItem("token")!
        const res = await fetch("/api/interests", { headers: { Authorization: `Bearer ${t}` } })
        const data = await res.json()
        if (Array.isArray(data)) setInterests(data)
      })
      .subscribe()

    channelsRef.current = [invChannel, intChannel]
  }

  // ── Derived stats ───────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total: investors.length,
    active: investors.filter(i => ["interested", "meeting", "term_sheet"].includes(i.status)).length,
    meetings: investors.filter(i => i.status === "meeting").length,
    closed: investors.filter(i => i.status === "closed").length,
  }), [investors])

  const totalCommitted = useMemo(() =>
    investors
      .filter(i => i.status === "closed")
      .reduce((sum, i) => sum + parseDealSize(i.deal_size), 0),
    [investors]
  )

  const pendingTermSheets = useMemo(() =>
    investors.filter(i => i.status === "term_sheet"),
    [investors]
  )
  const stalledOutreach = useMemo(() => {
    const cutoff = Date.now() - 14 * 24 * 60 * 60 * 1000
    return investors
      .filter(i => i.status === "outreach" && (!i.updated_at || new Date(i.updated_at).getTime() < cutoff))
      .slice(0, 4)
  }, [investors])
  const freshInterests = useMemo(() => interests.slice(0, 5), [interests])

  // ── Loading ────────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#060608" }}>
      <AppNav />
      <div className="max-w-[1280px] mx-auto px-6 md:px-10 py-20 flex items-center gap-3">
        <div style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid #10b981", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
        <span className="mono" style={{ fontSize: 11, color: "#64748b", letterSpacing: "0.08em", textTransform: "uppercase" }}>
          Loading your pipeline...
        </span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  )

  const today = new Date().toLocaleDateString("en", { weekday: "long", month: "long", day: "numeric" })

  return (
    <main style={{ minHeight: "100vh", background: "#060608", color: "#e5e7eb", fontFamily: "'DM Sans', sans-serif" }}>
      <AppNav />

      <div className="max-w-[1280px] mx-auto px-6 md:px-10">

        {/* ── Ticker strip ─── mono facts bar, Bloomberg-style */}
        <div className="flex items-center justify-between flex-wrap gap-3 pt-8 pb-6"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="mono flex items-center gap-x-6 gap-y-2 flex-wrap" style={{ fontSize: 11, color: "#64748b", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            <span>Dashboard</span>
            <span style={{ color: "#334155" }}>·</span>
            <span>{today}</span>
            <span style={{ color: "#334155" }}>·</span>
            <span><span style={{ color: "#e5e7eb" }}>{stats.total}</span> investors</span>
            <span style={{ color: "#334155" }}>·</span>
            <span><span style={{ color: "#10b981" }}>{formatUsd(totalCommitted)}</span> committed</span>
          </div>
          {live && (
            <div className="mono flex items-center gap-1.5" style={{ fontSize: 11, color: "#34d399", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981" }} />
              Live sync
            </div>
          )}
        </div>

        {/* ── Masthead + hero metric ─── */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-10 pt-10 md:pt-14 pb-10 md:pb-14 items-end">
          <div className="md:col-span-7">
            <p className="mono mb-3" style={{ fontSize: 11, color: "#10b981", letterSpacing: "0.12em", textTransform: "uppercase" }}>
              § Overview
            </p>
            <h1 className="serif text-white" style={{
              fontSize: "clamp(40px, 5.5vw, 72px)", lineHeight: 0.95, letterSpacing: "-0.045em", fontWeight: 500,
            }}>
              Good morning, {userEmail ? <span style={{ fontStyle: "italic", fontWeight: 400 }}>{userEmail.split("@")[0]}</span> : "founder"}.
            </h1>
            <p style={{ fontSize: 16, color: "#94a3b8", marginTop: 20, maxWidth: 520, lineHeight: 1.6 }}>
              {investors.length === 0
                ? "Nothing in the pipeline yet. Add your first investor to get moving."
                : `${stats.active} active leads, ${stats.meetings} meetings scheduled, ${stats.closed} deals closed so far.`}
            </p>
          </div>

          <div className="md:col-span-5 md:text-right">
            <p className="mono mb-2" style={{ fontSize: 10, color: "#475569", letterSpacing: "0.12em", textTransform: "uppercase" }}>
              Committed this round
            </p>
            <div className="serif" style={{ fontSize: "clamp(56px, 7vw, 96px)", lineHeight: 0.9, color: "#fff", fontWeight: 500, letterSpacing: "-0.04em" }}>
              {formatUsd(totalCommitted)}
            </div>
            <div className="mono mt-3 flex md:justify-end items-center gap-2" style={{ fontSize: 11, color: "#34d399", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              <RiArrowUpLine size={12} />
              {stats.closed} {stats.closed === 1 ? "deal" : "deals"} closed
            </div>
          </div>
        </section>

        {/* ── Secondary stats ─── editorial hairline row, no cards */}
        <section style={{ borderTop: "1px solid rgba(255,255,255,0.08)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="grid grid-cols-2 md:grid-cols-4" style={{ background: "transparent" }}>
            {[
              { label: "Investors",    value: stats.total },
              { label: "Active leads", value: stats.active },
              { label: "Meetings",     value: stats.meetings },
              { label: "Closed",       value: stats.closed },
            ].map((s, i) => (
              <div key={s.label}
                style={{
                  padding: "24px 20px",
                  borderLeft: i > 0 ? "1px solid rgba(255,255,255,0.06)" : "none",
                }}>
                <div className="mono" style={{ fontSize: 10, color: "#475569", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6 }}>
                  {s.label}
                </div>
                <div className="serif" style={{ fontSize: 34, color: "#fff", fontWeight: 500, letterSpacing: "-0.02em", lineHeight: 1 }}>
                  {s.value}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Plan banner ─── */}
        {plan === "free" ? (
          <section className="my-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            style={{ border: "1px solid rgba(16,185,129,0.2)", padding: "20px 24px", borderRadius: 2, background: "rgba(16,185,129,0.04)" }}>
            <div>
              <div className="mono mb-1.5" style={{ fontSize: 10, color: "#34d399", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                Starter plan · {stats.total} / 25 investors
              </div>
              <div className="serif text-white" style={{ fontSize: 20, fontWeight: 500, letterSpacing: "-0.01em" }}>
                Upgrade to Pro for unlimited.
              </div>
            </div>
            <button onClick={handleUpgrade} disabled={upgrading}
              className="mono"
              style={{
                background: "#10b981", color: "#fff",
                padding: "10px 18px", fontSize: 11,
                letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600,
                border: 0, borderRadius: 2,
                cursor: upgrading ? "not-allowed" : "pointer",
                opacity: upgrading ? 0.6 : 1,
                display: "flex", alignItems: "center", gap: 8,
              }}>
              {upgrading ? "Redirecting..." : <>Upgrade · $99/mo <RiArrowRightLine size={12} /></>}
            </button>
          </section>
        ) : (
          <section className="my-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            style={{ border: "1px solid rgba(255,255,255,0.08)", padding: "20px 24px", borderRadius: 2 }}>
            <div>
              <div className="mono mb-1.5 flex items-center gap-2" style={{ fontSize: 10, color: "#34d399", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                <RiCheckboxCircleLine size={12} /> Pro plan · Unlimited
              </div>
              <div className="serif text-white" style={{ fontSize: 20, fontWeight: 500, letterSpacing: "-0.01em" }}>
                You&apos;re on Pro — advanced analytics and directory unlocked.
              </div>
            </div>
            <button onClick={handleManageBilling} disabled={upgrading}
              className="mono"
              style={{
                color: "#cbd5e1", padding: "10px 18px", fontSize: 11,
                letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500,
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.12)", borderRadius: 2,
                cursor: upgrading ? "not-allowed" : "pointer",
                opacity: upgrading ? 0.6 : 1,
              }}>
              {upgrading ? "Redirecting..." : "Manage billing"}
            </button>
          </section>
        )}

        {/* ── Onboarding: shown only when pipeline is empty ─── */}
        {investors.length === 0 && (
          <section className="py-10">
            <div className="mono mb-6" style={{ fontSize: 11, color: "#10b981", letterSpacing: "0.12em", textTransform: "uppercase" }}>
              § First moves
            </div>
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
              {[
                { n: "01", title: "Add your first investor",   sub: "Start building your pipeline",                        icon: <RiUserLine size={14} />,           href: "/investors" },
                { n: "02", title: "Complete your profile",     sub: "Company info and wallet address",                     icon: <RiAccountCircleLine size={14} />,  href: "/profile" },
                { n: "03", title: "Publish your project",      sub: "Let VCs find you on the deal flow",                   icon: <RiRocketLine size={14} />,         href: "/profile" },
              ].map(s => (
                <button key={s.n} onClick={() => router.push(s.href)}
                  className="w-full grid grid-cols-1 md:grid-cols-12 gap-4 py-5 items-center text-left cursor-pointer"
                  style={{ background: "transparent", border: 0, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                  <div className="md:col-span-1 serif" style={{ fontSize: 32, color: "rgba(255,255,255,0.12)", fontWeight: 500, lineHeight: 0.9, letterSpacing: "-0.02em" }}>
                    {s.n}
                  </div>
                  <div className="md:col-span-10 flex items-center gap-4">
                    <span style={{ color: "#10b981" }}>{s.icon}</span>
                    <div>
                      <div className="serif" style={{ fontSize: 18, color: "#fff", fontWeight: 500, letterSpacing: "-0.01em" }}>{s.title}</div>
                      <div className="mono" style={{ fontSize: 11, color: "#64748b", letterSpacing: "0.04em", marginTop: 4 }}>{s.sub}</div>
                    </div>
                  </div>
                  <div className="md:col-span-1 md:text-right">
                    <RiArrowRightLine size={14} style={{ color: "#475569" }} />
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* ── Focus + Activity columns ─── */}
        {investors.length > 0 && (
          <section className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-14 py-12">

            {/* Focus — what needs attention */}
            <div className="md:col-span-7">
              <div className="flex items-baseline justify-between mb-6">
                <p className="mono" style={{ fontSize: 11, color: "#10b981", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                  § Focus today
                </p>
                <span className="mono" style={{ fontSize: 10, color: "#475569", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  Ranked by impact
                </span>
              </div>

              <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                {pendingTermSheets.length > 0 && (
                  <FocusBlock
                    kicker={`${pendingTermSheets.length} on term sheet`}
                    title="Investors on term sheet — close these."
                    body="Each of these is one signature away from Closed. Follow up, remove friction, move them."
                    accent="#38bdf8"
                    items={pendingTermSheets.slice(0, 3).map(i => ({
                      label: i.name,
                      sub: i.company || i.email || "—",
                      meta: i.deal_size || "",
                    }))}
                    href="/pipeline"
                  />
                )}

                {freshInterests.length > 0 && (
                  <FocusBlock
                    kicker={`${freshInterests.length} fresh signal${freshInterests.length === 1 ? "" : "s"}`}
                    title="Investors tapped Express Interest."
                    body="They came to your deal-room page and asked to talk. Reach out before the momentum fades."
                    accent="#10b981"
                    items={freshInterests.slice(0, 3).map(it => ({
                      label: it.investor_name && it.investor_name !== "Investor"
                        ? it.investor_name
                        : it.investor_email || "Anonymous",
                      sub: `Interested in ${it.projects?.name || "your project"}`,
                      meta: relTime(it.created_at),
                    }))}
                  />
                )}

                {stalledOutreach.length > 0 && (
                  <FocusBlock
                    kicker={`${stalledOutreach.length} cold`}
                    title="Outreach that's gone quiet."
                    body="No movement in two weeks. Either revive with a second touch or mark as dead and clear the deck."
                    accent="#9ca3af"
                    items={stalledOutreach.slice(0, 3).map(i => ({
                      label: i.name,
                      sub: i.company || i.email || "—",
                      meta: i.updated_at ? relTime(i.updated_at) : "No touches",
                    }))}
                    href="/pipeline"
                  />
                )}

                {pendingTermSheets.length === 0 && freshInterests.length === 0 && stalledOutreach.length === 0 && (
                  <div className="py-14 text-center">
                    <div className="mono" style={{ fontSize: 11, color: "#475569", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                      Nothing urgent
                    </div>
                    <div className="serif mt-2" style={{ fontSize: 22, color: "#cbd5e1", fontWeight: 500, letterSpacing: "-0.01em" }}>
                      You&apos;re on top of it.
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Activity stream — recent investors + interests */}
            <div className="md:col-span-5">
              <div className="flex items-baseline justify-between mb-6">
                <p className="mono" style={{ fontSize: 11, color: "#10b981", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                  § Recent
                </p>
                <button onClick={() => router.push("/investors")}
                  className="mono no-underline cursor-pointer"
                  style={{ background: "transparent", border: 0, fontSize: 10, color: "#94a3b8", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  View all →
                </button>
              </div>

              <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                {investors.slice(0, 6).map(inv => (
                  <div key={inv.id}
                    className="grid grid-cols-[1fr_auto] gap-4 py-3.5 items-center"
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    <div className="flex items-center gap-3 min-w-0">
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: STATUS_COLOR[inv.status] }} />
                      <div className="min-w-0">
                        <div style={{ fontSize: 13, color: "#e5e7eb", fontWeight: 500 }} className="truncate">
                          {inv.name}
                        </div>
                        <div className="mono truncate" style={{ fontSize: 10, color: "#64748b", letterSpacing: "0.04em", marginTop: 2 }}>
                          {inv.company || inv.email || "—"}
                        </div>
                      </div>
                    </div>
                    <div className="mono flex-shrink-0 text-right" style={{ fontSize: 10, color: STATUS_COLOR[inv.status], letterSpacing: "0.06em", textTransform: "uppercase" }}>
                      {STATUS_LABEL[inv.status]}
                    </div>
                  </div>
                ))}
              </div>

              {/* Interests sub-list */}
              {interests.length > 0 && (
                <div className="mt-10">
                  <div className="flex items-baseline justify-between mb-5">
                    <p className="mono flex items-center gap-2" style={{ fontSize: 11, color: "#10b981", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                      <RiBellLine size={12} /> Inbound signals
                    </p>
                    <span className="mono" style={{ fontSize: 10, color: "#475569", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                      {interests.length} total
                    </span>
                  </div>
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                    {interests.slice(0, 4).map(it => {
                      const who = it.investor_name && it.investor_name !== "Investor" ? it.investor_name : it.investor_email
                      return (
                        <div key={it.id} className="grid grid-cols-[1fr_auto] gap-4 py-3 items-center"
                          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                          <div className="flex items-center gap-3 min-w-0">
                            <RiCalendarEventLine size={12} style={{ color: "#10b981" }} />
                            <div className="min-w-0">
                              <div style={{ fontSize: 12, color: "#cbd5e1" }} className="truncate">{who}</div>
                              <div className="mono truncate" style={{ fontSize: 10, color: "#64748b", letterSpacing: "0.04em", marginTop: 2 }}>
                                → {it.projects?.name || "your project"}
                              </div>
                            </div>
                          </div>
                          <div className="mono" style={{ fontSize: 10, color: "#475569", letterSpacing: "0.04em" }}>
                            {relTime(it.created_at)}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        <div style={{ height: 80 }} />
      </div>
    </main>
  )
}

// Focus block — a single "do this" unit in the Focus column.
// Kicker (mono count + label) + serif title + one-line description + up to
// three items + optional "go to pipeline" link.
function FocusBlock({
  kicker, title, body, accent, items, href,
}: {
  kicker: string
  title: string
  body: string
  accent: string
  items: Array<{ label: string; sub: string; meta: string }>
  href?: string
}) {
  return (
    <div className="py-8" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
      <div className="flex items-baseline gap-3 mb-3">
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: accent }} />
        <span className="mono" style={{ fontSize: 11, color: accent, letterSpacing: "0.08em", textTransform: "uppercase" }}>
          {kicker}
        </span>
      </div>
      <h3 className="serif text-white mb-2" style={{ fontSize: 24, fontWeight: 500, letterSpacing: "-0.02em", lineHeight: 1.2 }}>
        {title}
      </h3>
      <p style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.7, marginBottom: 20, maxWidth: 520 }}>
        {body}
      </p>
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        {items.map((it, i) => (
          <div key={i} className="grid grid-cols-[1fr_auto] gap-4 py-2.5 items-center"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
            <div className="min-w-0">
              <span style={{ fontSize: 13, color: "#e5e7eb", fontWeight: 500, marginRight: 10 }}>{it.label}</span>
              <span className="mono" style={{ fontSize: 11, color: "#64748b", letterSpacing: "0.04em" }}>{it.sub}</span>
            </div>
            <div className="mono flex-shrink-0" style={{ fontSize: 11, color: accent, letterSpacing: "0.04em", textTransform: "uppercase" }}>
              {it.meta}
            </div>
          </div>
        ))}
      </div>
      {href && (
        <a href={href} className="mono no-underline mt-4 inline-flex items-center gap-1.5"
          style={{ fontSize: 11, color: accent, letterSpacing: "0.08em", textTransform: "uppercase" }}>
          Open pipeline <RiArrowRightLine size={11} />
        </a>
      )}
    </div>
  )
}
