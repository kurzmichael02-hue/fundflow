"use client"
import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { ToastContainer, useToast } from "@/components/Toast"
import Navbar from "@/components/Navbar"

const STAGES = ["all", "pre-seed", "seed", "series-a", "series-b", "web3"]
const STAGE_LABELS: Record<string, string> = {
  "all": "All Stages", "pre-seed": "Pre-Seed", "seed": "Seed",
  "series-a": "Series A", "series-b": "Series B", "web3": "Web3 / Token"
}
const STAGE_COLORS: Record<string, string> = {
  "pre-seed": "#a78bfa", "seed": "#38bdf8", "series-a": "#fbbf24",
  "series-b": "#f87171", "web3": "#34d399"
}

function formatAmount(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${n}`
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-white/[0.06] overflow-hidden" style={{ background: "rgba(255,255,255,0.02)" }}>
      <div className="h-[2px] w-full" style={{ background: "rgba(255,255,255,0.06)" }} />
      <div className="p-5 flex flex-col gap-3">
        <div className="flex items-start justify-between">
          <div className="w-10 h-10 rounded-xl animate-pulse" style={{ background: "rgba(255,255,255,0.05)" }} />
          <div className="w-16 h-5 rounded-full animate-pulse" style={{ background: "rgba(255,255,255,0.05)" }} />
        </div>
        <div className="w-28 h-5 rounded animate-pulse" style={{ background: "rgba(255,255,255,0.05)" }} />
        <div className="w-full h-3 rounded animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} />
        <div className="w-3/4 h-3 rounded animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} />
        <div className="w-full h-1.5 rounded-full animate-pulse mt-2" style={{ background: "rgba(255,255,255,0.05)" }} />
        <div className="w-full h-9 rounded-xl animate-pulse mt-1" style={{ background: "rgba(255,255,255,0.04)" }} />
      </div>
    </div>
  )
}

export default function InvestorDiscoverPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState<any[]>([])
  const [activeStage, setActiveStage] = useState("all")
  const [search, setSearch] = useState("")
  const [expressed, setExpressed] = useState<Set<string>>(new Set())
  const [submitting, setSubmitting] = useState<string | null>(null)
  const { toasts, addToast, removeToast } = useToast()

  const [investorEmail, setInvestorEmail] = useState("")
  const [investorName, setInvestorName] = useState("")

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) { router.push("/investor"); return }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      setInvestorEmail(payload.email || "")
    } catch {}
    fetchProjects()
  }, [])

  async function fetchProjects() {
    try {
      const res = await fetch("/api/projects")
      const data = await res.json()
      setProjects(Array.isArray(data) ? data : [])
    } catch {
      setProjects([])
    } finally {
      setLoading(false)
    }
  }

  async function handleExpressInterest(project: any) {
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
      addToast(`Interest expressed in ${project.name}! The founder will be notified.`)
    } catch {
      addToast("Something went wrong. Try again.", "error")
    } finally {
      setSubmitting(null)
    }
  }

  const filtered = useMemo(() => {
    return projects.filter(p => {
      const matchStage = activeStage === "all" || p.stage === activeStage
      const matchSearch = search === "" ||
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.profiles?.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.tags?.some((t: string) => t.toLowerCase().includes(search.toLowerCase()))
      return matchStage && matchSearch
    })
  }, [projects, activeStage, search])

  return (
    <div className="min-h-screen text-slate-200" style={{ background: "#050508" }}>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <Navbar />

      <div className="px-4 md:px-12 py-8 max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border mb-4"
            style={{ background: "rgba(16,185,129,0.06)", borderColor: "rgba(16,185,129,0.15)" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 text-xs font-medium">{projects.length} active founder{projects.length !== 1 ? "s" : ""}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-1" style={{ fontFamily: "'Syne', sans-serif" }}>Deal Flow</h1>
          <p className="text-slate-500 text-sm">Curated Web3 founders actively raising. Express interest to connect directly.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by project, founder, or tag..."
              className="w-full rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-300 border border-white/[0.07] outline-none"
              style={{ background: "rgba(255,255,255,0.03)" }} />
          </div>
        </div>

        <div className="flex gap-2 mb-7 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {STAGES.map(s => (
            <button key={s} onClick={() => setActiveStage(s)}
              className="px-4 py-1.5 rounded-full text-[12px] font-medium whitespace-nowrap cursor-pointer border transition-all"
              style={{
                background: activeStage === s ? `${STAGE_COLORS[s] || "rgba(16,185,129,0.1)"}18` : "rgba(255,255,255,0.02)",
                color: activeStage === s ? (STAGE_COLORS[s] || "#10b981") : "#475569",
                borderColor: activeStage === s ? `${STAGE_COLORS[s] || "rgba(16,185,129,0.2)"}35` : "rgba(255,255,255,0.06)",
              }}>
              {STAGE_LABELS[s]}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          ) : filtered.length === 0 ? (
            <div className="col-span-3 text-center py-20 text-slate-600 text-sm rounded-2xl border border-white/[0.05]"
              style={{ background: "rgba(255,255,255,0.01)" }}>
              {projects.length === 0 ? "No projects published yet. Check back soon." : "No projects match your filters."}
              {projects.length > 0 && (
                <button onClick={() => { setSearch(""); setActiveStage("all") }}
                  className="ml-2 cursor-pointer bg-transparent border-0"
                  style={{ color: "#10b981" }}>
                  Clear
                </button>
              )}
            </div>
          ) : (
            filtered.map(project => {
              const pct = project.goal ? Math.min(100, Math.round((project.raised / project.goal) * 100)) : 0
              const stageColor = STAGE_COLORS[project.stage] || "#94a3b8"
              const isExpressed = expressed.has(project.id)
              const isSubmitting = submitting === project.id
              const founderName = project.profiles?.name || project.profiles?.company || "Founder"

              return (
                <div key={project.id}
                  className="rounded-2xl border border-white/[0.06] overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-0.5"
                  style={{ background: "rgba(255,255,255,0.02)" }}>
                  <div className="h-[2px] w-full" style={{ background: `linear-gradient(90deg, ${stageColor}, transparent)` }} />
                  <div className="p-5 flex flex-col flex-1 gap-4">
                    <div className="flex items-start justify-between">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
                        style={{ background: `${stageColor}15`, border: `1px solid ${stageColor}25`, color: stageColor }}>
                        {project.name?.[0]?.toUpperCase()}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                          style={{ background: `${stageColor}12`, color: stageColor, border: `1px solid ${stageColor}25` }}>
                          {STAGE_LABELS[project.stage] || project.stage}
                        </span>
                        {project.chain && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-mono"
                            style={{ background: "rgba(255,255,255,0.04)", color: "#64748b", border: "1px solid rgba(255,255,255,0.08)" }}>
                            {project.chain}
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-[15px] font-bold text-white tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>{project.name}</h3>
                      <p className="text-[12px] text-slate-600 mt-0.5">by {founderName}</p>
                    </div>

                    <p className="text-[12px] text-slate-500 leading-relaxed flex-1"
                      style={{ display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {project.description || "No description provided."}
                    </p>

                    {project.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {project.tags.map((tag: string) => (
                          <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full"
                            style={{ background: "rgba(255,255,255,0.04)", color: "#64748b", border: "1px solid rgba(255,255,255,0.07)" }}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {project.goal > 0 && (
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[11px] text-slate-600">Raised</span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[12px] text-white font-semibold">{formatAmount(project.raised || 0)}</span>
                            <span className="text-[11px] text-slate-600">/ {formatAmount(project.goal)}</span>
                          </div>
                        </div>
                        <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                          <div className="h-full rounded-full"
                            style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${stageColor}, ${stageColor}88)` }} />
                        </div>
                        <div className="text-[10px] text-slate-700 mt-1 text-right">{pct}% funded</div>
                      </div>
                    )}

                    <button onClick={() => handleExpressInterest(project)}
                      disabled={isExpressed || !!isSubmitting}
                      className="w-full py-2.5 rounded-xl text-[12px] font-semibold border transition-all"
                      style={{
                        background: isExpressed ? "rgba(16,185,129,0.08)" : `${stageColor}14`,
                        color: isExpressed ? "#10b981" : stageColor,
                        borderColor: isExpressed ? "rgba(16,185,129,0.2)" : `${stageColor}30`,
                        cursor: isExpressed || isSubmitting ? "default" : "pointer",
                        opacity: isSubmitting ? 0.6 : 1,
                      }}>
                      {isSubmitting ? "Sending..." : isExpressed ? "✓ Interest Expressed" : "Express Interest →"}
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {!loading && filtered.length > 0 && (
          <p className="text-center text-xs text-slate-700 mt-10">
            Showing {filtered.length} of {projects.length} founder{projects.length !== 1 ? "s" : ""} · More deals added weekly
          </p>
        )}
      </div>
    </div>
  )
}
