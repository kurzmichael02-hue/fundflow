"use client"
import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import AppNav from "@/components/AppNav"
import { ToastContainer, useToast } from "@/components/Toast"
import {
  RiSearchLine, RiAddLine, RiCheckLine,
  RiExternalLinkLine, RiFlashlightLine,
} from "react-icons/ri"

type Directory = {
  id: string
  name: string
  firm?: string | null
  sector?: string[] | null
  stage?: string[] | null
  check_size_min?: number | null
  check_size_max?: number | null
  web3_focus?: boolean | null
  location?: string | null
  website?: string | null
}

const STAGE_FILTERS = ["All", "pre-seed", "seed", "series-a", "series-b"] as const
const SECTOR_FILTERS = ["All", "DeFi", "Web3", "Infrastructure", "SaaS", "AI", "NFT", "Gaming", "Protocol", "B2B"] as const

export default function InvestorDatabasePage() {
  const router = useRouter()
  const { toasts, addToast, removeToast } = useToast()

  const [directory, setDirectory] = useState<Directory[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [stageFilter, setStageFilter] = useState<string>("All")
  const [sectorFilter, setSectorFilter] = useState<string>("All")
  const [web3Only, setWeb3Only] = useState(false)
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set())
  const [addingId, setAddingId] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) { router.push("/login"); return }
    fetchDirectory()
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  async function handleAddToPipeline(inv: Directory) {
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
          notes: `From directory. Focus: ${inv.sector?.join(", ") || "—"}. Check size: $${Number(inv.check_size_min || 0).toLocaleString()} – $${Number(inv.check_size_max || 0).toLocaleString()}.`,
        }),
      })
      if (!res.ok) throw new Error("Failed")
      setAddedIds(prev => new Set([...prev, inv.id]))
      addToast(`${inv.name} added to your pipeline`)
    } catch {
      addToast("Failed to add to pipeline", "error")
    } finally {
      setAddingId(null)
    }
  }

  const filtered = useMemo(() => directory.filter(inv => {
    const q = search.toLowerCase()
    const matchSearch = !q ||
      inv.name?.toLowerCase().includes(q) ||
      inv.firm?.toLowerCase().includes(q)
    const matchStage = stageFilter === "All" || inv.stage?.includes(stageFilter)
    const matchSector = sectorFilter === "All" || inv.sector?.includes(sectorFilter)
    const matchWeb3 = !web3Only || inv.web3_focus
    return matchSearch && matchStage && matchSector && matchWeb3
  }), [directory, search, stageFilter, sectorFilter, web3Only])

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#060608" }}>
      <AppNav />
      <div className="max-w-[1280px] mx-auto px-6 md:px-10 py-20 flex items-center gap-3">
        <div style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid #10b981", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
        <span className="mono" style={{ fontSize: 11, color: "#64748b", letterSpacing: "0.08em", textTransform: "uppercase" }}>Loading directory...</span>
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
            <span>Directory</span>
            <span style={{ color: "#334155" }}>·</span>
            <span><span style={{ color: "#e5e7eb" }}>{directory.length}</span> funds</span>
            <span style={{ color: "#334155" }}>·</span>
            <span>{filtered.length} shown</span>
          </div>
        </div>

        {/* ── Masthead ── */}
        <section className="pt-10 md:pt-14 pb-8">
          <p className="mono mb-3" style={{ fontSize: 11, color: "#10b981", letterSpacing: "0.12em", textTransform: "uppercase" }}>
            § Investor directory
          </p>
          <h1 className="serif text-white" style={{
            fontSize: "clamp(40px, 5.5vw, 72px)", lineHeight: 0.95, letterSpacing: "-0.045em", fontWeight: 500,
          }}>
            Curated funds, <span style={{ fontStyle: "italic", fontWeight: 400 }}>tagged honestly.</span>
          </h1>
          <p style={{ fontSize: 16, color: "#94a3b8", marginTop: 20, maxWidth: 560, lineHeight: 1.6 }}>
            Investors hand-picked by sector, stage, and cheque size. Tap Add to pull one
            straight into your pipeline as Outreach.
          </p>
        </section>

        {/* ── Filters ── */}
        <section className="pb-5 flex flex-col gap-4"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ position: "relative" }}>
            <RiSearchLine size={14} style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", color: "#475569" }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or firm..."
              style={{
                width: "100%",
                background: "transparent", border: 0,
                borderBottom: "1px solid rgba(255,255,255,0.12)",
                color: "#e5e7eb", fontSize: 14, outline: "none",
                padding: "10px 0 10px 22px", fontFamily: "inherit",
              }} />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="mono" style={{ fontSize: 10, color: "#475569", letterSpacing: "0.12em", textTransform: "uppercase" }}>Stage</span>
            {STAGE_FILTERS.map(s => {
              const active = stageFilter === s
              return (
                <button key={s} onClick={() => setStageFilter(s)}
                  className="mono cursor-pointer"
                  style={{
                    padding: "5px 10px",
                    fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500,
                    color: active ? "#10b981" : "#64748b",
                    background: active ? "rgba(16,185,129,0.08)" : "transparent",
                    border: `1px solid ${active ? "rgba(16,185,129,0.3)" : "rgba(255,255,255,0.08)"}`,
                    borderRadius: 2,
                  }}>
                  {s === "All" ? "All" : s}
                </button>
              )
            })}
            <span className="mono ml-4" style={{ fontSize: 10, color: "#475569", letterSpacing: "0.12em", textTransform: "uppercase" }}>Sector</span>
            {SECTOR_FILTERS.map(s => {
              const active = sectorFilter === s
              return (
                <button key={s} onClick={() => setSectorFilter(s)}
                  className="mono cursor-pointer"
                  style={{
                    padding: "5px 10px",
                    fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500,
                    color: active ? "#a78bfa" : "#64748b",
                    background: active ? "rgba(167,139,250,0.08)" : "transparent",
                    border: `1px solid ${active ? "rgba(167,139,250,0.3)" : "rgba(255,255,255,0.08)"}`,
                    borderRadius: 2,
                  }}>
                  {s === "All" ? "All" : s}
                </button>
              )
            })}
            <button onClick={() => setWeb3Only(!web3Only)}
              className="mono cursor-pointer flex items-center gap-1.5"
              style={{
                padding: "5px 10px", marginLeft: 16,
                fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500,
                color: web3Only ? "#fbbf24" : "#64748b",
                background: web3Only ? "rgba(251,191,36,0.08)" : "transparent",
                border: `1px solid ${web3Only ? "rgba(251,191,36,0.3)" : "rgba(255,255,255,0.08)"}`,
                borderRadius: 2,
              }}>
              <RiFlashlightLine size={10} /> Web3 only
            </button>
          </div>
        </section>

        {/* ── List ── */}
        <section className="py-2 pb-20">
          {filtered.length === 0 ? (
            <div className="py-20 text-center">
              <p className="mono" style={{ fontSize: 11, color: "#475569", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                No investors match
              </p>
            </div>
          ) : filtered.map(inv => {
            const added = addedIds.has(inv.id)
            const adding = addingId === inv.id
            return (
              <div key={inv.id}
                className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-8 py-6 items-start"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="md:col-span-4">
                  <div className="flex items-baseline gap-3 mb-1">
                    <h3 className="serif text-white" style={{ fontSize: 22, fontWeight: 500, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
                      {inv.name}
                    </h3>
                    {inv.web3_focus && (
                      <span className="mono" style={{ fontSize: 9, color: "#fbbf24", padding: "2px 6px", background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.25)", letterSpacing: "0.06em", textTransform: "uppercase", borderRadius: 2 }}>
                        Web3
                      </span>
                    )}
                  </div>
                  <div className="mono flex items-center gap-2 flex-wrap" style={{ fontSize: 11, color: "#64748b", letterSpacing: "0.04em" }}>
                    <span>{inv.firm}</span>
                    {inv.location && <><span style={{ color: "#334155" }}>·</span><span>{inv.location}</span></>}
                  </div>
                </div>

                <div className="md:col-span-3">
                  <div className="mono mb-1.5" style={{ fontSize: 10, color: "#475569", letterSpacing: "0.12em", textTransform: "uppercase" }}>Check size</div>
                  <div className="serif" style={{ fontSize: 18, color: "#fff", fontWeight: 500, letterSpacing: "-0.01em" }}>
                    ${Number(inv.check_size_min || 0).toLocaleString()} – ${Number(inv.check_size_max || 0).toLocaleString()}
                  </div>
                </div>

                <div className="md:col-span-3">
                  <div className="mono mb-1.5" style={{ fontSize: 10, color: "#475569", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                    Sector · Stage
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {[...(inv.sector?.slice(0, 3) || []), ...(inv.stage?.slice(0, 2) || [])].map(t => (
                      <span key={t} className="mono" style={{
                        fontSize: 10, color: "#94a3b8", letterSpacing: "0.04em",
                        padding: "2px 6px",
                        background: "rgba(255,255,255,0.02)",
                        border: "1px solid rgba(255,255,255,0.06)", borderRadius: 2,
                      }}>{t}</span>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2 flex md:flex-col items-end md:items-end gap-2">
                  {inv.website && (
                    <a href={inv.website} target="_blank" rel="noopener noreferrer"
                      className="mono no-underline flex items-center gap-1"
                      style={{ fontSize: 10, color: "#64748b", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                      <RiExternalLinkLine size={10} /> Site
                    </a>
                  )}
                  <button onClick={() => !added && handleAddToPipeline(inv)} disabled={added || adding}
                    className="mono cursor-pointer flex items-center gap-1.5"
                    style={{
                      padding: "7px 12px",
                      fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600,
                      color: added ? "#34d399" : "#fff",
                      background: added ? "rgba(16,185,129,0.1)" : "#10b981",
                      border: added ? "1px solid rgba(16,185,129,0.25)" : 0, borderRadius: 2,
                      opacity: adding ? 0.6 : 1,
                      cursor: added || adding ? "default" : "pointer",
                    }}>
                    {adding ? "Adding..." : added ? <><RiCheckLine size={10} /> Added</> : <><RiAddLine size={10} /> Add</>}
                  </button>
                </div>
              </div>
            )
          })}
        </section>
      </div>
    </main>
  )
}
