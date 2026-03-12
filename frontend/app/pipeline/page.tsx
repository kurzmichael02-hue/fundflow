"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import Navbar from "@/components/Navbar"

type Status = "outreach" | "interested" | "meeting" | "term_sheet" | "closed"

const COLUMNS: { key: Status; label: string; color: string }[] = [
  { key: "outreach", label: "Outreach", color: "#6b7280" },
  { key: "interested", label: "Interested", color: "#3b82f6" },
  { key: "meeting", label: "Meeting", color: "#f59e0b" },
  { key: "term_sheet", label: "Term Sheet", color: "#8b5cf6" },
  { key: "closed", label: "Closed", color: "#10b981" },
]

export default function PipelinePage() {
  const router = useRouter()
  const [investors, setInvestors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) { router.push("/login"); return }
    api.getInvestors().then(data => { setInvestors(data); setLoading(false) }).catch(() => router.push("/login"))
  }, [])

  async function moveInvestor(id: string, newStatus: Status) {
    setInvestors(prev => prev.map(i => i.id === id ? { ...i, status: newStatus } : i))
    try {
      await api.updateInvestor(id, { status: newStatus })
    } catch (err: any) {
      alert(err.message)
      api.getInvestors().then(data => setInvestors(data))
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-[#04070f] flex items-center justify-center">
      <div className="flex items-center gap-3 text-slate-500 text-sm">
        <div className="w-4 h-4 rounded-full border-2 border-sky-500 border-t-transparent animate-spin" />
        Loading...
      </div>
    </div>
  )

  return (
    <main className="min-h-screen bg-[#04070f] text-slate-200">
      <Navbar />

      <div className="px-4 md:px-12 py-8">
        <h2 className="text-2xl font-bold text-white tracking-tight mb-6">Pipeline</h2>

        {/* Desktop: 5 columns grid */}
        <div className="hidden md:grid md:grid-cols-5 gap-4">
          {COLUMNS.map(col => (
            <PipelineColumn key={col.key} col={col} investors={investors} moveInvestor={moveInvestor} />
          ))}
        </div>

        {/* Mobile: horizontal scroll */}
        <div className="md:hidden -mx-4 px-4">
          <div className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory"
            style={{ scrollbarWidth: "none" }}>
            {COLUMNS.map(col => (
              <div key={col.key} className="snap-start shrink-0 w-[80vw]">
                <PipelineColumn col={col} investors={investors} moveInvestor={moveInvestor} />
              </div>
            ))}
          </div>
          {/* Scroll hint */}
          <p className="text-center text-[11px] text-slate-700 mt-2">← swipe to see all stages →</p>
        </div>
      </div>
    </main>
  )
}

function PipelineColumn({ col, investors, moveInvestor }: {
  col: typeof COLUMNS[0]
  investors: any[]
  moveInvestor: (id: string, status: Status) => void
}) {
  const colInvestors = investors.filter(i => i.status === col.key)

  return (
    <div className="rounded-2xl p-4 border border-white/[0.05] min-h-[200px]"
      style={{ background: "rgba(255,255,255,0.02)", borderTop: `2px solid ${col.color}` }}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-[13px] font-semibold" style={{ color: col.color }}>{col.label}</span>
        <span className="text-[11px] px-2 py-0.5 rounded-full text-slate-500 border border-white/[0.06]"
          style={{ background: "rgba(255,255,255,0.04)" }}>
          {colInvestors.length}
        </span>
      </div>

      <div className="flex flex-col gap-2.5">
        {colInvestors.map(inv => (
          <div key={inv.id} className="rounded-xl p-3 border border-white/[0.06]"
            style={{ background: "rgba(255,255,255,0.03)" }}>
            <div className="text-[13px] font-medium text-slate-200 mb-0.5">{inv.name}</div>
            <div className="text-[11px] text-slate-600 mb-3">{inv.company || "—"}</div>
            <select value={inv.status} onChange={e => moveInvestor(inv.id, e.target.value as Status)}
              className="w-full rounded-lg text-[11px] px-2 py-1.5 border border-white/[0.08] outline-none cursor-pointer"
              style={{ background: "#0a0d14", color: "#94a3b8" }}>
              {COLUMNS.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
            </select>
          </div>
        ))}
        {colInvestors.length === 0 && (
          <div className="text-[11px] text-slate-800 text-center py-6">Empty</div>
        )}
      </div>
    </div>
  )
}