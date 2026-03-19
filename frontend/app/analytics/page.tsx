"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/Navbar"
import { RiBarChartLine, RiArrowRightLine, RiTrophyLine, RiTimeLine, RiFundsLine } from "react-icons/ri"

const STAGES = [
  { key: "outreach",   label: "Outreach",   color: "#9ca3af" },
  { key: "interested", label: "Interested", color: "#a78bfa" },
  { key: "meeting",    label: "Meeting",    color: "#fbbf24" },
  { key: "term_sheet", label: "Term Sheet", color: "#38bdf8" },
  { key: "closed",     label: "Closed",     color: "#34d399" },
]

export default function AnalyticsPage() {
  const router = useRouter()
  const [investors, setInvestors] = useState<any[]>([])
  const [interests, setInterests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) { router.push("/login"); return }
    fetchAll(token)
  }, [])

  async function fetchAll(token: string) {
    try {
      const [invRes, intRes] = await Promise.all([
        fetch("/api/investors", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/interests", { headers: { Authorization: `Bearer ${token}` } }),
      ])
      const invData = await invRes.json()
      const intData = await intRes.json()
      setInvestors(Array.isArray(invData) ? invData : [])
      setInterests(Array.isArray(intData) ? intData : [])
    } catch {
      router.push("/login")
    } finally {
      setLoading(false)
    }
  }

  // Pipeline funnel counts
  const funnelData = STAGES.map(s => ({
    ...s,
    count: investors.filter(i => i.status === s.key).length,
  }))
  const maxCount = Math.max(...funnelData.map(s => s.count), 1)

  // Conversion rate: outreach → closed
  const total = investors.length
  const closed = investors.filter(i => i.status === "closed").length
  const conversionRate = total > 0 ? ((closed / total) * 100).toFixed(1) : "0.0"

  // Response rate: moved past outreach
  const movedOn = investors.filter(i => i.status !== "outreach").length
  const responseRate = total > 0 ? ((movedOn / total) * 100).toFixed(1) : "0.0"

  // Total raised from closed deals
  const totalRaised = investors
  .filter(i => i.status === "closed" && i.deal_size)
  .reduce((sum, i) => {
    const num = parseFloat(i.deal_size?.replace(/[^0-9.]/g, "") || "0")
    return sum + (isNaN(num) ? 0 : num)
  }, 0)

  // Top investors by amount
  const topInvestors = [...investors]
  .filter(i => i.deal_size)
  .sort((a, b) => {
    const aNum = parseFloat(a.deal_size?.replace(/[^0-9.]/g, "") || "0")
    const bNum = parseFloat(b.deal_size?.replace(/[^0-9.]/g, "") || "0")
    return bNum - aNum
  })
  .slice(0, 5)

  // Interests over last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d.toISOString().split("T")[0]
  })
  const interestsByDay = last7Days.map(day => ({
    day: new Date(day).toLocaleDateString("en", { weekday: "short" }),
    count: interests.filter(int => int.created_at?.startsWith(day)).length,
  }))
  const maxInterests = Math.max(...interestsByDay.map(d => d.count), 1)

  if (loading) return (
    <div className="min-h-screen bg-[#050508] flex items-center justify-center">
      <div className="flex items-center gap-3 text-slate-500 text-sm">
        <div className="w-4 h-4 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
        Loading...
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#050508] text-slate-200">
      <Navbar />
      <div className="px-4 md:px-12 py-8 max-w-5xl mx-auto">

        <div className="mb-7">
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">Analytics</h1>
          <p className="text-xs text-slate-500 mt-0.5">Pipeline performance & fundraising insights</p>
        </div>

        {/* Top stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Total in Pipeline", value: total, sub: "investors tracked", icon: <RiBarChartLine size={16} />, color: "#38bdf8" },
            { label: "Conversion Rate", value: `${conversionRate}%`, sub: "outreach → closed", icon: <RiTrophyLine size={16} />, color: "#34d399" },
            { label: "Response Rate", value: `${responseRate}%`, sub: "moved past outreach", icon: <RiArrowRightLine size={16} />, color: "#a78bfa" },
            { label: "Total Raised", value: totalRaised > 0 ? `$${(totalRaised / 1000).toFixed(0)}k` : "$0", sub: "from closed deals", icon: <RiFundsLine size={16} />, color: "#fbbf24" },
          ].map(s => (
            <div key={s.label} className="rounded-2xl border border-white/[0.06] p-4"
              style={{ background: "rgba(255,255,255,0.02)" }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] text-slate-600 uppercase tracking-wider font-medium">{s.label}</span>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: `${s.color}15`, color: s.color }}>
                  {s.icon}
                </div>
              </div>
              <div className="text-2xl font-bold text-white" style={{ letterSpacing: "-0.02em" }}>{s.value}</div>
              <div className="text-[11px] text-slate-600 mt-0.5">{s.sub}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">

          {/* Pipeline Funnel */}
          <div className="rounded-2xl border border-white/[0.06] overflow-hidden" style={{ background: "rgba(255,255,255,0.02)" }}>
            <div className="px-5 py-4 border-b border-white/[0.05]" style={{ background: "rgba(255,255,255,0.02)" }}>
              <h2 className="text-[13px] font-semibold text-white">Pipeline Funnel</h2>
              <p className="text-[11px] text-slate-600 mt-0.5">Investors by stage</p>
            </div>
            <div className="p-5 flex flex-col gap-3">
              {funnelData.map((stage, idx) => (
                <div key={stage.key}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-500">{String(idx + 1).padStart(2, "0")}</span>
                      <span className="text-[12px] text-slate-300 font-medium">{stage.label}</span>
                    </div>
                    <span className="text-[12px] font-bold" style={{ color: stage.color }}>{stage.count}</span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.04)" }}>
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${(stage.count / maxCount) * 100}%`,
                        background: stage.color,
                        opacity: 0.8,
                        minWidth: stage.count > 0 ? "4px" : "0",
                      }} />
                  </div>
                  {idx < funnelData.length - 1 && stage.count > 0 && funnelData[idx + 1].count > 0 && (
                    <div className="text-[10px] text-slate-700 mt-1 text-right">
                      {((funnelData[idx + 1].count / stage.count) * 100).toFixed(0)}% → next stage
                    </div>
                  )}
                </div>
              ))}
              {total === 0 && (
                <p className="text-xs text-slate-700 text-center py-4">No investors in pipeline yet</p>
              )}
            </div>
          </div>

          {/* Deal Flow Interests — last 7 days */}
          <div className="rounded-2xl border border-white/[0.06] overflow-hidden" style={{ background: "rgba(255,255,255,0.02)" }}>
            <div className="px-5 py-4 border-b border-white/[0.05]" style={{ background: "rgba(255,255,255,0.02)" }}>
              <h2 className="text-[13px] font-semibold text-white">Investor Interest</h2>
              <p className="text-[11px] text-slate-600 mt-0.5">Deal flow signals — last 7 days</p>
            </div>
            <div className="p-5">
              <div className="flex items-end gap-2 h-28">
                {interestsByDay.map(d => (
                  <div key={d.day} className="flex-1 flex flex-col items-center gap-1.5">
                    <div className="w-full rounded-t-lg transition-all duration-700 relative group"
                      style={{
                        height: `${Math.max((d.count / maxInterests) * 96, d.count > 0 ? 8 : 2)}px`,
                        background: d.count > 0 ? "rgba(16,185,129,0.4)" : "rgba(255,255,255,0.04)",
                        border: d.count > 0 ? "1px solid rgba(16,185,129,0.3)" : "1px solid rgba(255,255,255,0.06)",
                      }}>
                      {d.count > 0 && (
                        <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-emerald-400">
                          {d.count}
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-600">{d.day}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-white/[0.04] flex items-center justify-between">
                <span className="text-[11px] text-slate-600">Total interests received</span>
                <span className="text-[13px] font-bold text-white">{interests.length}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Top Investors by Amount */}
        <div className="rounded-2xl border border-white/[0.06] overflow-hidden" style={{ background: "rgba(255,255,255,0.02)" }}>
          <div className="px-5 py-4 border-b border-white/[0.05]" style={{ background: "rgba(255,255,255,0.02)" }}>
            <h2 className="text-[13px] font-semibold text-white">Top Investors by Deal Size</h2>
            <p className="text-[11px] text-slate-600 mt-0.5">Ranked by committed amount</p>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {topInvestors.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-10">
                <RiTimeLine size={20} className="text-slate-700" />
                <p className="text-xs text-slate-700">No deal sizes tracked yet</p>
                <p className="text-[11px] text-slate-800">Add amounts to your investors to see rankings</p>
              </div>
            ) : topInvestors.map((inv, idx) => {
              const statusColors: Record<string, string> = {
  outreach: "#9ca3af", interested: "#a78bfa", meeting: "#fbbf24",
  term_sheet: "#38bdf8", closed: "#34d399"
}
const statusColor = statusColors[inv.status] || "#9ca3af"
              return (
                <div key={inv.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.02]">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-[11px] text-slate-700 w-5 flex-shrink-0">#{idx + 1}</span>
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ background: `${statusColor}20`, color: statusColor }}>
                      {inv.name?.[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] text-slate-200 font-medium truncate">{inv.name}</p>
                      <p className="text-[11px] text-slate-600 truncate">{inv.company || inv.email || "—"}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-3">
                    <p className="text-[13px] font-bold text-white">{inv.deal_size}</p>
                    <p className="text-[10px]" style={{ color: statusColor }}>{inv.status?.replace("_", " ")}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </div>
  )
}
