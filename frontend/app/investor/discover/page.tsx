"use client"
import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { ToastContainer, useToast } from "@/components/Toast"

const STAGES = ["all", "pre-seed", "seed", "series-a", "series-b", "web3"]
const STAGE_LABELS: Record<string, string> = {
  "all": "All Stages", "pre-seed": "Pre-Seed", "seed": "Seed",
  "series-a": "Series A", "series-b": "Series B", "web3": "Web3 / Token"
}
const STAGE_COLORS: Record<string, string> = {
  "pre-seed": "#a78bfa", "seed": "#38bdf8", "series-a": "#fbbf24",
  "series-b": "#f87171", "web3": "#34d399"
}

// Placeholder founder cards using real Supabase profiles
// In a real app this would come from a "projects" table
const MOCK_PROJECTS = [
  { id: "1", name: "NovaPay", founder: "Alex Rivera", stage: "seed", goal: 2500000, raised: 1800000, description: "Decentralized cross-border payments for emerging markets using ZK proofs.", tags: ["DeFi", "ZK", "Payments"], chain: "ETH" },
  { id: "2", name: "ChainMind", founder: "Priya Sharma", stage: "pre-seed", goal: 800000, raised: 240000, description: "AI-powered smart contract auditing with real-time vulnerability detection.", tags: ["AI", "Security", "B2B"], chain: "SOL" },
  { id: "3", name: "VaultDAO", founder: "Marcus Webb", stage: "web3", goal: 5000000, raised: 3100000, description: "Community-governed treasury management for DAOs with multi-sig and yield strategies.", tags: ["DAO", "Treasury", "DeFi"], chain: "ARB" },
  { id: "4", name: "GridX", founder: "Sofia Chen", stage: "series-a", goal: 12000000, raised: 7400000, description: "Blockchain-native energy trading infrastructure for renewable certificates.", tags: ["RWA", "Climate", "Energy"], chain: "BASE" },
  { id: "5", name: "PulseID", founder: "Jordan Adeyemi", stage: "seed", goal: 3000000, raised: 900000, description: "Self-sovereign identity for Web3 — one wallet, verified everywhere.", tags: ["Identity", "Privacy", "B2C"], chain: "ETH" },
  { id: "6", name: "DeepMesh", founder: "Yuki Tanaka", stage: "pre-seed", goal: 600000, raised: 120000, description: "Decentralized GPU compute marketplace for AI model training at scale.", tags: ["AI", "Compute", "DePIN"], chain: "SOL" },
]

function formatAmount(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${n}`
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-white/[0.05] overflow-hidden"
      style={{ background: "rgba(255,255,255,0.02)" }}>
      <div className="h-2 w-full" style={{ background: "linear-gradient(90deg, rgba(255,255,255,0.04), rgba(255,255,255,0.08), rgba(255,255,255,0.04))", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
      <div className="p-5 flex flex-col gap-3">
        <div className="flex items-start justify-between">
          <div className="w-10 h-10 rounded-xl shimmer-box" />
          <div className="w-16 h-5 rounded-full shimmer-box" />
        </div>
        <div className="w-28 h-5 rounded shimmer-box" />
        <div className="w-full h-3 rounded shimmer-box" />
        <div className="w-3/4 h-3 rounded shimmer-box" />
        <div className="flex gap-2 mt-1">
          <div className="w-12 h-5 rounded-full shimmer-box" />
          <div className="w-16 h-5 rounded-full shimmer-box" />
        </div>
        <div className="mt-2">
          <div className="w-full h-1.5 rounded-full shimmer-box" />
        </div>
        <div className="w-full h-9 rounded-xl shimmer-box mt-1" />
      </div>
    </div>
  )
}

export default function InvestorDiscoverPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState<typeof MOCK_PROJECTS>([])
  const [activeStage, setActiveStage] = useState("all")
  const [search, setSearch] = useState("")
  const [expressed, setExpressed] = useState<Set<string>>(new Set())
  const { toasts, addToast, removeToast } = useToast()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) { router.push("/investor"); return }
    // Simulate fetch
    setTimeout(() => { setProjects(MOCK_PROJECTS); setLoading(false) }, 1200)
  }, [])

  const filtered = useMemo(() => {
    return projects.filter(p => {
      const matchStage = activeStage === "all" || p.stage === activeStage
      const matchSearch = search === "" ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.founder.toLowerCase().includes(search.toLowerCase()) ||
        p.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
      return matchStage && matchSearch
    })
  }, [projects, activeStage, search])

  function handleExpressInterest(project: typeof MOCK_PROJECTS[0]) {
    if (expressed.has(project.id)) return
    setExpressed(prev => new Set([...prev, project.id]))
    addToast(`Interest expressed in ${project.name}!`)
  }

  function handleLogout() {
    localStorage.removeItem("token")
    localStorage.removeItem("user_type")
    router.push("/investor")
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-slate-200" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <style>{`
        @keyframes shimmer { 0% { background-position: -200% 0 } 100% { background-position: 200% 0 } }
        .shimmer-box { background: linear-gradient(90deg, rgba(255,255,255,0.03), rgba(255,255,255,0.07), rgba(255,255,255,0.03)); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
        .card-hover { transition: transform 200ms ease, box-shadow 200ms ease, border-color 200ms ease; }
        .card-hover:hover { transform: translateY(-2px); box-shadow: 0 16px 48px rgba(0,0,0,0.4); }
      `}</style>

      {/* Navbar */}
      <nav className="sticky top-0 z-40 border-b border-white/[0.05]" style={{ background: "rgba(9,9,11,0.85)", backdropFilter: "blur(20px)" }}>
        <div className="max-w-6xl mx-auto px-4 md:px-8 flex items-center justify-between h-14">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #10b981, #0ea5e9)" }}>
              <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
                <path d="M9 2L15.5 6V12L9 16L2.5 12V6L9 2Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M9 6L12 8V12L9 14L6 12V8L9 6Z" fill="white" fillOpacity="0.6"/>
              </svg>
            </div>
            <span className="text-white font-semibold text-sm tracking-tight">FundFlow</span>
            <span className="hidden sm:inline-flex items-center gap-1 ml-2 px-2 py-0.5 rounded-full border text-[10px] font-medium"
              style={{ background: "rgba(16,185,129,0.08)", borderColor: "rgba(16,185,129,0.2)", color: "#10b981" }}>
              <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" /> Investor
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-xs text-slate-600">{expressed.size} interests expressed</span>
            <button onClick={handleLogout}
              className="text-xs text-slate-500 hover:text-slate-300 cursor-pointer bg-transparent border-0 transition-colors">
              Sign out
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-10">

        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border mb-4"
            style={{ background: "rgba(16,185,129,0.06)", borderColor: "rgba(16,185,129,0.15)" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 text-xs font-medium">{projects.length} active founders</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2" style={{ letterSpacing: "-0.03em" }}>
            Deal Flow
          </h1>
          <p className="text-slate-500 text-sm">Curated Web3 founders actively raising. Express interest to connect directly.</p>
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by project, founder, or tag..."
              className="w-full rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-300 border border-white/[0.07] outline-none"
              style={{ background: "rgba(255,255,255,0.02)" }} />
          </div>
        </div>

        {/* Stage pills */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {STAGES.map(s => (
            <button key={s} onClick={() => setActiveStage(s)}
              className="px-4 py-1.5 rounded-full text-[12px] font-medium whitespace-nowrap cursor-pointer border transition-all"
              style={{
                background: activeStage === s ? `${STAGE_COLORS[s] || "#fff"}14` : "rgba(255,255,255,0.02)",
                color: activeStage === s ? (STAGE_COLORS[s] || "#e2e8f0") : "#475569",
                borderColor: activeStage === s ? `${STAGE_COLORS[s] || "#fff"}30` : "rgba(255,255,255,0.06)",
              }}>
              {STAGE_LABELS[s]}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          ) : filtered.length === 0 ? (
            <div className="col-span-3 text-center py-20 text-slate-600 text-sm">
              No projects match your filters.
              <button onClick={() => { setSearch(""); setActiveStage("all") }}
                className="ml-2 text-sky-400 cursor-pointer bg-transparent border-0">Clear</button>
            </div>
          ) : (
            filtered.map(project => {
              const pct = Math.min(100, Math.round((project.raised / project.goal) * 100))
              const stageColor = STAGE_COLORS[project.stage] || "#94a3b8"
              const isExpressed = expressed.has(project.id)

              return (
                <div key={project.id} className="card-hover rounded-2xl border border-white/[0.06] overflow-hidden flex flex-col"
                  style={{ background: "rgba(255,255,255,0.02)" }}>
                  {/* Color top bar */}
                  <div className="h-[2px] w-full" style={{ background: `linear-gradient(90deg, ${stageColor}, transparent)` }} />

                  <div className="p-5 flex flex-col flex-1 gap-4">
                    {/* Header row */}
                    <div className="flex items-start justify-between">
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                        style={{ background: `linear-gradient(135deg, ${stageColor}30, ${stageColor}15)`, border: `1px solid ${stageColor}25`, color: stageColor }}>
                        {project.name[0]}
                      </div>
                      {/* Stage + Chain */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                          style={{ background: `${stageColor}12`, color: stageColor, border: `1px solid ${stageColor}25` }}>
                          {STAGE_LABELS[project.stage]}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-mono"
                          style={{ background: "rgba(255,255,255,0.04)", color: "#64748b", border: "1px solid rgba(255,255,255,0.08)" }}>
                          {project.chain}
                        </span>
                      </div>
                    </div>

                    {/* Title + Founder */}
                    <div>
                      <h3 className="text-[15px] font-bold text-white" style={{ letterSpacing: "-0.01em" }}>{project.name}</h3>
                      <p className="text-[12px] text-slate-600 mt-0.5">by {project.founder}</p>
                    </div>

                    {/* Description */}
                    <p className="text-[12px] text-slate-500 leading-relaxed flex-1" style={{ display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {project.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {project.tags.map(tag => (
                        <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full"
                          style={{ background: "rgba(255,255,255,0.04)", color: "#64748b", border: "1px solid rgba(255,255,255,0.07)" }}>
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Progress */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[11px] text-slate-600">Raised</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[12px] text-white font-semibold">{formatAmount(project.raised)}</span>
                          <span className="text-[11px] text-slate-600">/ {formatAmount(project.goal)}</span>
                        </div>
                      </div>
                      <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${stageColor}, ${stageColor}88)` }} />
                      </div>
                      <div className="text-[10px] text-slate-700 mt-1 text-right">{pct}% funded</div>
                    </div>

                    {/* CTA */}
                    <button onClick={() => handleExpressInterest(project)} disabled={isExpressed}
                      className="w-full py-2.5 rounded-xl text-[12px] font-semibold cursor-pointer border transition-all"
                      style={{
                        background: isExpressed ? "rgba(16,185,129,0.08)" : `${stageColor}14`,
                        color: isExpressed ? "#10b981" : stageColor,
                        borderColor: isExpressed ? "rgba(16,185,129,0.2)" : `${stageColor}30`,
                        cursor: isExpressed ? "default" : "pointer",
                      }}>
                      {isExpressed ? "✓ Interest Expressed" : "Express Interest →"}
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Footer note */}
        {!loading && filtered.length > 0 && (
          <p className="text-center text-xs text-slate-700 mt-10">
            Showing {filtered.length} of {projects.length} founders · More deals added weekly
          </p>
        )}
      </div>
    </div>
  )
}