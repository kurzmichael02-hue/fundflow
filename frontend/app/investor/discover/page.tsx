"use client"
import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import AppNav from "@/components/AppNav"
import { ToastContainer, useToast } from "@/components/Toast"
import { RiSearchLine, RiArrowRightLine } from "react-icons/ri"

// Investor-side Discover — editorial deal flow page.
// Replaces the glossy 3-column card grid with a dense editorial list of
// founders, one row per project with mono meta and sharp borders.

type Project = {
  id: string
  name: string
  description?: string | null
  stage?: string | null
  chain?: string | null
  goal?: number | null
  raised?: number | null
  tags?: string[] | null
  profiles?: { name?: string | null; company?: string | null } | null
}

const STAGES = ["all", "pre-seed", "seed", "series-a", "series-b", "web3"] as const
const STAGE_LABELS: Record<string, string> = {
  "all": "All",
  "pre-seed": "Pre-Seed",
  "seed": "Seed",
  "series-a": "Series A",
  "series-b": "Series B",
  "web3": "Web3",
}
const STAGE_COLORS: Record<string, string> = {
  "pre-seed": "#a78bfa",
  "seed":     "#38bdf8",
  "series-a": "#fbbf24",
  "series-b": "#f87171",
  "web3":     "#34d399",
}

function formatAmount(n: number) {
  if (!n || n <= 0) return "$0"
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`
  if (n >= 1_000_000)     return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)         return `$${(n / 1_000).toFixed(0)}k`
  return `$${n}`
}

export default function InvestorDiscoverPage() {
  const router = useRouter()
  const { toasts, addToast, removeToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState<Project[]>([])
  const [activeStage, setActiveStage] = useState<string>("all")
  const [search, setSearch] = useState("")
  const [expressed, setExpressed] = useState<Set<string>>(new Set())
  const [submitting, setSubmitting] = useState<string | null>(null)

  const [investorEmail, setInvestorEmail] = useState("")
  const [investorName, setInvestorName] = useState("")

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) { router.push("/investor"); return }
    try {
      const raw = token.split(".")[1]
      const norm = raw.replace(/-/g, "+").replace(/_/g, "/")
      const padded = norm + "=".repeat((4 - norm.length % 4) % 4)
      const payload = JSON.parse(atob(padded))
      setInvestorEmail(payload.email || "")
      setInvestorName(payload.user_metadata?.name || "")
    } catch {}
    fetchProjects()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function fetchProjects() {
    try {
      const res = await fetch("/api/projects")
      // /api/projects GET is public — 401 here would be unexpected, but if
      // it does happen treat it as "session is broken" and bounce so the
      // user can re-auth instead of staring at an empty deal flow.
      if (res.status === 401) {
        localStorage.removeItem("token")
        localStorage.removeItem("user_type")
        router.push("/investor")
        return
      }
      const data = await res.json()
      setProjects(Array.isArray(data) ? data : [])
    } catch {
      setProjects([])
    } finally {
      setLoading(false)
    }
  }

  async function handleExpressInterest(project: Project) {
    if (expressed.has(project.id) || submitting) return
    setSubmitting(project.id)
    try {
      const res = await fetch("/api/interests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: project.id,
          investor_email: investorEmail || "anonymous",
          investor_name: investorName || investorEmail || "Investor",
        }),
      })
      if (!res.ok) throw new Error("Failed")
      setExpressed(prev => new Set([...prev, project.id]))
      addToast(`Interest sent to ${project.profiles?.name || "the founder"}`)
    } catch {
      addToast("Something went wrong. Try again.", "error")
    } finally {
      setSubmitting(null)
    }
  }

  const filtered = useMemo(() => projects.filter(p => {
    const matchStage = activeStage === "all" || p.stage === activeStage
    const q = search.toLowerCase()
    const matchSearch = !q ||
      p.name?.toLowerCase().includes(q) ||
      p.profiles?.name?.toLowerCase().includes(q) ||
      p.tags?.some(t => t.toLowerCase().includes(q))
    return matchStage && matchSearch
  }), [projects, activeStage, search])

  return (
    <main style={{ minHeight: "100vh", background: "#060608", color: "#e5e7eb", fontFamily: "'DM Sans', sans-serif" }}>
      <AppNav />
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="max-w-[1280px] mx-auto px-6 md:px-10">

        {/* ── Ticker ── */}
        <div className="flex items-center justify-between flex-wrap gap-3 pt-8 pb-6"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="mono flex items-center gap-x-5 gap-y-2 flex-wrap" style={{ fontSize: 11, color: "#64748b", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            <span>Deal flow</span>
            <span style={{ color: "#475569" }}>·</span>
            <span><span style={{ color: "#e5e7eb" }}>{projects.length}</span> live</span>
            <span style={{ color: "#475569" }}>·</span>
            <span>{filtered.length} shown</span>
          </div>
          <span className="mono flex items-center gap-1.5" style={{ fontSize: 11, color: "#34d399", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981" }} />
            Live
          </span>
        </div>

        {/* ── Masthead ── */}
        <section className="pt-10 md:pt-14 pb-8">
          <p className="mono mb-3" style={{ fontSize: 11, color: "#10b981", letterSpacing: "0.12em", textTransform: "uppercase" }}>
            Active founders
          </p>
          <h1 className="serif text-white" style={{
            fontSize: "clamp(40px, 5.5vw, 72px)", lineHeight: 0.95, letterSpacing: "-0.045em", fontWeight: 500,
          }}>
            Web3 rounds worth a look.
          </h1>
          <p style={{ fontSize: 16, color: "#94a3b8", marginTop: 20, maxWidth: 560, lineHeight: 1.6 }}>
            Curated projects that founders chose to publish. Filter by stage and sector, tap
            Express Interest — the founder gets an email immediately.
          </p>
        </section>

        {/* ── Filters ── */}
        <section className="flex flex-col md:flex-row items-stretch md:items-center gap-4 pb-5"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ position: "relative", flex: 1 }}>
            <RiSearchLine size={14} style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by project, founder, or tag..."
              style={{
                width: "100%",
                background: "transparent", border: 0,
                borderBottom: "1px solid rgba(255,255,255,0.18)",
                color: "#e5e7eb", fontSize: 14, outline: "none",
                padding: "10px 0 10px 22px", fontFamily: "inherit",
              }} />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {STAGES.map(s => {
              const active = activeStage === s
              const color = s === "all" ? "#10b981" : STAGE_COLORS[s]
              return (
                <button key={s} onClick={() => setActiveStage(s)}
                  className="mono cursor-pointer"
                  style={{
                    padding: "6px 12px",
                    fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500,
                    color: active ? color : "#64748b",
                    background: active ? `${color}12` : "transparent",
                    border: `1px solid ${active ? color + "40" : "rgba(255,255,255,0.08)"}`,
                    borderRadius: 2,
                  }}>
                  {STAGE_LABELS[s]}
                </button>
              )
            })}
          </div>
        </section>

        {/* ── Deal list ── */}
        <section className="pt-2 pb-20">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center">
              <p className="mono" style={{ fontSize: 11, color: "#64748b", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                {projects.length === 0 ? "No projects published yet" : "No projects match"}
              </p>
              {projects.length > 0 && (
                <button onClick={() => { setSearch(""); setActiveStage("all") }}
                  className="mono mt-3 cursor-pointer"
                  style={{ fontSize: 11, color: "#10b981", letterSpacing: "0.08em", textTransform: "uppercase", background: "transparent", border: 0 }}>
                  Clear filters →
                </button>
              )}
            </div>
          ) : (
            filtered.map(project => {
              const stageColor = STAGE_COLORS[project.stage || ""] || "#94a3b8"
              const pct = project.goal ? Math.min(100, Math.round(((project.raised || 0) / project.goal) * 100)) : 0
              const isExpressed = expressed.has(project.id)
              const isSubmitting = submitting === project.id
              const founderName = project.profiles?.name || project.profiles?.company || "Founder"
              return (
                <article key={project.id}
                  className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 py-8 items-start"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                  <div className="md:col-span-2">
                    <div className="flex items-center gap-2 mb-2">
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: stageColor }} />
                      <span className="mono" style={{ fontSize: 10, color: stageColor, letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500 }}>
                        {STAGE_LABELS[project.stage || ""] || project.stage}
                      </span>
                    </div>
                    <span className="mono" style={{ fontSize: 10, color: "#64748b", letterSpacing: "0.04em" }}>
                      {project.chain}
                    </span>
                  </div>

                  <div className="md:col-span-6">
                    <h3 className="serif text-white mb-1" style={{ fontSize: 26, fontWeight: 500, letterSpacing: "-0.02em", lineHeight: 1.15 }}>
                      {project.name}
                    </h3>
                    <p className="mono mb-3" style={{ fontSize: 11, color: "#64748b", letterSpacing: "0.04em" }}>
                      by {founderName}
                    </p>
                    <p style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.65, maxWidth: 540 }}>
                      {project.description || "No description provided."}
                    </p>
                    {project.tags && project.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-4">
                        {project.tags.map(t => (
                          <span key={t} className="mono" style={{
                            fontSize: 10, color: "#94a3b8", letterSpacing: "0.04em",
                            padding: "3px 8px",
                            background: "rgba(255,255,255,0.02)",
                            border: "1px solid rgba(255,255,255,0.06)", borderRadius: 2,
                          }}>{t}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-4 flex flex-col gap-4">
                    {project.goal && project.goal > 0 && (
                      <div>
                        <div className="flex items-baseline justify-between mb-2">
                          <span className="mono" style={{ fontSize: 10, color: "#64748b", letterSpacing: "0.12em", textTransform: "uppercase" }}>Raised</span>
                          <div className="flex items-baseline gap-1.5">
                            <span className="serif" style={{ fontSize: 20, color: "#fff", fontWeight: 500, letterSpacing: "-0.02em" }}>
                              {formatAmount(project.raised || 0)}
                            </span>
                            <span className="mono" style={{ fontSize: 10, color: "#64748b" }}>/ {formatAmount(project.goal)}</span>
                          </div>
                        </div>
                        <div style={{ height: 2, background: "rgba(255,255,255,0.06)" }}>
                          <div style={{ width: `${pct}%`, height: "100%", background: stageColor, transition: "width 600ms ease" }} />
                        </div>
                        <div className="mono mt-1.5 text-right" style={{ fontSize: 10, color: "#475569", letterSpacing: "0.04em" }}>
                          {pct}% funded
                        </div>
                      </div>
                    )}
                    <button onClick={() => handleExpressInterest(project)}
                      disabled={isExpressed || !!isSubmitting}
                      className="mono cursor-pointer flex items-center justify-center gap-2"
                      style={{
                        padding: "12px 18px", fontSize: 11,
                        letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600,
                        color: isExpressed ? "#34d399" : "#fff",
                        background: isExpressed ? "rgba(16,185,129,0.1)" : "#10b981",
                        border: isExpressed ? "1px solid rgba(16,185,129,0.3)" : "0",
                        borderRadius: 2,
                        cursor: isExpressed || isSubmitting ? "default" : "pointer",
                        opacity: isSubmitting ? 0.6 : 1,
                      }}>
                      {isSubmitting ? "Sending..." : isExpressed ? "✓ Interest sent" : <>Express interest <RiArrowRightLine size={12} /></>}
                    </button>
                  </div>
                </article>
              )
            })
          )}
        </section>
      </div>
    </main>
  )
}

function SkeletonRow() {
  const skel: React.CSSProperties = { background: "rgba(255,255,255,0.04)", borderRadius: 2 }
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-10 py-8 animate-pulse"
      style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
      <div className="md:col-span-2"><div style={{ ...skel, width: 80, height: 14 }} /></div>
      <div className="md:col-span-6">
        <div style={{ ...skel, width: 200, height: 28, marginBottom: 10 }} />
        <div style={{ ...skel, width: 120, height: 12, marginBottom: 14 }} />
        <div style={{ ...skel, width: "100%", height: 12, marginBottom: 6 }} />
        <div style={{ ...skel, width: "80%", height: 12 }} />
      </div>
      <div className="md:col-span-4">
        <div style={{ ...skel, width: "100%", height: 2, marginBottom: 14 }} />
        <div style={{ ...skel, width: "100%", height: 40 }} />
      </div>
    </div>
  )
}
