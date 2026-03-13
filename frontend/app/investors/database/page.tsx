"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/Navbar"
import { ToastContainer, useToast } from "@/components/Toast"
import { RiSearchLine, RiAddLine, RiExternalLinkLine, RiCheckLine, RiGlobalLine, RiFlashlightLine } from "react-icons/ri"

const STAGE_FILTERS = ["All", "pre-seed", "seed", "series-a", "series-b"]
const SECTOR_FILTERS = ["All", "DeFi", "Web3", "Infrastructure", "SaaS", "AI", "NFT", "Gaming", "Protocol", "B2B"]

export default function InvestorDatabasePage() {
  const router = useRouter()
  const { toasts, addToast, removeToast } = useToast()

  const [directory, setDirectory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [stageFilter, setStageFilter] = useState("All")
  const [sectorFilter, setSectorFilter] = useState("All")
  const [web3Only, setWeb3Only] = useState(false)
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set())
  const [addingId, setAddingId] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) { router.push("/login"); return }
    fetchDirectory()
  }, [])

  async function fetchDirectory() {
    try {
      const res = await fetch("/api/investor-directory")
      const data = await res.json()
      setDirectory(Array.isArray(data) ? data : [])
    } catch {
      addToast("Failed to load directory", "error")
    } finally {
      setLoading(false)
    }
  }

  async function handleAddToPipeline(inv: any) {
    setAddingId(inv.id)
    const token = localStorage.getItem("token")!
    try {
      const res = await fetch("/api/investors", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: inv.name,
          company: inv.firm,
          email: "",
          status: "outreach",
          notes: `From investor database. Focus: ${inv.sector?.join(", ")}. Check size: $${Number(inv.check_size_min).toLocaleString()} - $${Number(inv.check_size_max).toLocaleString()}`,
        }),
      })
      if (!res.ok) throw new Error("Failed")
      setAddedIds(prev => new Set([...prev, inv.id]))
      addToast(`${inv.name} added to your pipeline!`)
    } catch {
      addToast("Failed to add to pipeline", "error")
    } finally {
      setAddingId(null)
    }
  }

  const filtered = directory.filter(inv => {
    const matchSearch = !search ||
      inv.name?.toLowerCase().includes(search.toLowerCase()) ||
      inv.firm?.toLowerCase().includes(search.toLowerCase())
    const matchStage = stageFilter === "All" || inv.stage?.includes(stageFilter)
    const matchSector = sectorFilter === "All" || inv.sector?.includes(sectorFilter)
    const matchWeb3 = !web3Only || inv.web3_focus
    return matchSearch && matchStage && matchSector && matchWeb3
  })

  if (loading) return (
    <div className="min-h-screen bg-[#04070f] flex items-center justify-center">
      <div className="flex items-center gap-3 text-slate-500 text-sm">
        <div className="w-4 h-4 rounded-full border-2 border-sky-500 border-t-transparent animate-spin" />
        Loading...
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#04070f] text-slate-200">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <Navbar />
      <div className="px-4 md:px-12 py-8 max-w-5xl mx-auto">

        <div className="mb-7 flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">Investor Database</h1>
            <p className="text-xs text-slate-500 mt-0.5">{directory.length} curated investors — add any to your pipeline</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 mb-6">
          {/* Search */}
          <div className="relative">
            <RiSearchLine size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or firm..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-slate-200 border border-white/[0.08] outline-none"
              style={{ background: "rgba(255,255,255,0.03)" }} />
          </div>

          {/* Filter pills */}
          <div className="flex flex-wrap gap-2 items-center">
            <div className="flex flex-wrap gap-1.5">
              {STAGE_FILTERS.map(s => (
                <button key={s} onClick={() => setStageFilter(s)}
                  className="px-3 py-1 rounded-full text-xs font-medium cursor-pointer border transition-all"
                  style={{
                    background: stageFilter === s ? "rgba(14,165,233,0.15)" : "rgba(255,255,255,0.03)",
                    borderColor: stageFilter === s ? "rgba(14,165,233,0.4)" : "rgba(255,255,255,0.07)",
                    color: stageFilter === s ? "#38bdf8" : "#64748b",
                  }}>
                  {s === "All" ? "All Stages" : s}
                </button>
              ))}
            </div>
            <div className="w-px h-4 bg-white/[0.08] hidden sm:block" />
            <div className="flex flex-wrap gap-1.5">
              {SECTOR_FILTERS.map(s => (
                <button key={s} onClick={() => setSectorFilter(s)}
                  className="px-3 py-1 rounded-full text-xs font-medium cursor-pointer border transition-all"
                  style={{
                    background: sectorFilter === s ? "rgba(167,139,250,0.15)" : "rgba(255,255,255,0.03)",
                    borderColor: sectorFilter === s ? "rgba(167,139,250,0.4)" : "rgba(255,255,255,0.07)",
                    color: sectorFilter === s ? "#a78bfa" : "#64748b",
                  }}>
                  {s === "All" ? "All Sectors" : s}
                </button>
              ))}
            </div>
            <button onClick={() => setWeb3Only(!web3Only)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium cursor-pointer border transition-all"
              style={{
                background: web3Only ? "rgba(251,191,36,0.1)" : "rgba(255,255,255,0.03)",
                borderColor: web3Only ? "rgba(251,191,36,0.3)" : "rgba(255,255,255,0.07)",
                color: web3Only ? "#fbbf24" : "#64748b",
              }}>
              <RiFlashlightLine size={12} /> Web3 Only
            </button>
          </div>
          <p className="text-[11px] text-slate-600">{filtered.length} investors found</p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map(inv => {
            const added = addedIds.has(inv.id)
            const adding = addingId === inv.id
            return (
              <div key={inv.id} className="rounded-2xl border border-white/[0.06] p-5 hover:border-white/[0.1] transition-all"
                style={{ background: "rgba(255,255,255,0.02)" }}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                      style={{ background: inv.web3_focus ? "rgba(251,191,36,0.15)" : "rgba(14,165,233,0.15)", color: inv.web3_focus ? "#fbbf24" : "#38bdf8" }}>
                      {inv.name?.[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-white truncate">{inv.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{inv.firm}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {inv.website && (
                      <a href={inv.website} target="_blank" rel="noopener noreferrer"
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-400 transition-colors"
                        style={{ background: "rgba(255,255,255,0.04)" }}>
                        <RiExternalLinkLine size={13} />
                      </a>
                    )}
                    <button onClick={() => !added && handleAddToPipeline(inv)} disabled={added || adding}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer border-0 transition-all disabled:cursor-default"
                      style={{
                        background: added ? "rgba(16,185,129,0.1)" : "rgba(14,165,233,0.12)",
                        color: added ? "#34d399" : "#38bdf8",
                      }}>
                      {adding ? (
                        <div className="w-3 h-3 rounded-full border border-sky-400 border-t-transparent animate-spin" />
                      ) : added ? (
                        <><RiCheckLine size={12} /> Added</>
                      ) : (
                        <><RiAddLine size={12} /> Add</>
                      )}
                    </button>
                  </div>
                </div>

                {/* Check size */}
                <div className="flex items-center gap-1.5 mb-3">
                  <span className="text-[11px] text-slate-600">Check size:</span>
                  <span className="text-[11px] font-medium text-white">
                    ${Number(inv.check_size_min).toLocaleString()} – ${Number(inv.check_size_max).toLocaleString()}
                  </span>
                  {inv.web3_focus && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full ml-auto"
                      style={{ background: "rgba(251,191,36,0.08)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.15)" }}>
                      <RiFlashlightLine size={10} /> Web3
                    </span>
                  )}
                </div>

                {/* Sectors */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {inv.sector?.slice(0, 4).map((s: string) => (
                    <span key={s} className="text-[10px] px-2 py-0.5 rounded-full"
                      style={{ background: "rgba(255,255,255,0.04)", color: "#64748b", border: "1px solid rgba(255,255,255,0.07)" }}>
                      {s}
                    </span>
                  ))}
                </div>

                {/* Stages + location */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {inv.stage?.map((s: string) => (
                      <span key={s} className="text-[10px] px-2 py-0.5 rounded-full"
                        style={{ background: "rgba(14,165,233,0.06)", color: "#38bdf8", border: "1px solid rgba(14,165,233,0.12)" }}>
                        {s}
                      </span>
                    ))}
                  </div>
                  {inv.location && (
                    <div className="flex items-center gap-1 text-[10px] text-slate-700">
                      <RiGlobalLine size={11} />
                      {inv.location}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-slate-600 text-sm">No investors match your filters</p>
          </div>
        )}
      </div>
    </div>
  )
}