"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { api } from "@/lib/api"
import Navbar from "@/components/Navbar"
import {
  RiUserLine,
  RiDashboardLine,
  RiTeamLine,
  RiCheckLine,
} from "react-icons/ri"

const STATUS_STYLES: Record<string, { bg: string; color: string; border: string; label: string }> = {
  outreach:   { bg: "rgba(107,114,128,0.12)", color: "#9ca3af", border: "rgba(107,114,128,0.25)", label: "Outreach" },
  interested: { bg: "rgba(139,92,246,0.12)",  color: "#a78bfa", border: "rgba(139,92,246,0.25)", label: "Interested" },
  meeting:    { bg: "rgba(245,158,11,0.12)",  color: "#fbbf24", border: "rgba(245,158,11,0.25)", label: "Meeting" },
  term_sheet: { bg: "rgba(14,165,233,0.12)",  color: "#38bdf8", border: "rgba(14,165,233,0.25)", label: "Term Sheet" },
  closed:     { bg: "rgba(16,185,129,0.12)",  color: "#34d399", border: "rgba(16,185,129,0.25)", label: "Closed" },
}

const AVATAR_COLORS = ["#0ea5e9", "#f59e0b", "#8b5cf6", "#10b981", "#ef4444", "#ec4899", "#14b8a6"]

export default function DashboardPage() {
  const router = useRouter()
  const [investors, setInvestors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) { router.push("/login"); return }
    api.getInvestors().then(data => { setInvestors(data); setLoading(false) }).catch(() => { setLoading(false) })
  }, [])

  const stats = {
    total: investors.length,
    active: investors.filter(i => ["interested", "meeting", "term_sheet"].includes(i.status)).length,
    closed: investors.filter(i => i.status === "closed").length,
    outreach: investors.filter(i => i.status === "outreach").length,
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
    <div className="min-h-screen bg-[#04070f] text-slate-200">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 md:px-12 py-10">
        <h1 className="text-2xl font-bold text-white tracking-tight mb-8">Dashboard</h1>

        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Total Investors", val: stats.total, sub: `${stats.total} total`, icon: <RiUserLine size={13} />, color: "#0ea5e9" },
            { label: "Active Leads", val: stats.active, sub: `${stats.active} active`, icon: <RiTeamLine size={13} />, color: "#f59e0b" },
            { label: "Meetings", val: investors.filter(i => i.status === "meeting").length, sub: "scheduled", icon: <RiDashboardLine size={13} />, color: "#8b5cf6" },
            { label: "Deals Closed", val: stats.closed, sub: `${stats.closed} closed`, icon: <RiCheckLine size={13} />, color: "#10b981" },
          ].map(s => (
            <div key={s.label} className="rounded-2xl p-5 border border-white/[0.06]"
              style={{ background: "rgba(255,255,255,0.03)" }}>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-600 uppercase tracking-widest mb-3">
                <span style={{ color: `${s.color}80` }}>{s.icon}</span>
                {s.label}
              </div>
              <div className="text-[36px] font-bold tracking-tight text-white mb-1">{s.val}</div>
              <div className="text-[11px]" style={{ color: s.color }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* RECENT INVESTORS */}
        <div className="rounded-2xl border border-white/[0.06] overflow-hidden"
          style={{ background: "rgba(255,255,255,0.02)" }}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.05]">
            <h2 className="text-[13px] font-semibold text-slate-500 uppercase tracking-widest">Recent Investors</h2>
            <Link href="/investors" className="text-[12px] text-sky-400 no-underline hover:text-sky-300 transition-colors">
              View all →
            </Link>
          </div>

          {investors.length === 0 ? (
            <div className="text-center py-16 text-slate-600 text-sm">
              No investors yet.{" "}
              <Link href="/investors" className="text-sky-400 no-underline">Add your first one →</Link>
            </div>
          ) : (
            <div className="flex flex-col">
              {investors.slice(0, 8).map((inv, idx) => {
                const avatarColor = AVATAR_COLORS[idx % AVATAR_COLORS.length]
                const initials = inv.name ? inv.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) : "?"
                const status = STATUS_STYLES[inv.status] || STATUS_STYLES.outreach

                return (
                  <div key={inv.id}
                    className={`flex items-center justify-between px-5 py-4 transition-all hover:bg-white/[0.02] ${idx !== Math.min(investors.length, 8) - 1 ? "border-b border-white/[0.04]" : ""}`}>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-[12px] font-bold text-white shrink-0"
                        style={{ background: avatarColor }}>
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] text-slate-200 font-medium truncate">{inv.name}</p>
                        <p className="text-[11px] text-slate-600 truncate">{inv.amount ? `$${Number(inv.amount).toLocaleString()}` : "TBD"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium shrink-0"
                      style={{ background: status.bg, color: status.color, border: `1px solid ${status.border}` }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: status.color }} />
                      {status.label}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}