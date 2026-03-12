"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { api } from "@/lib/api"
import Navbar from "@/components/Navbar"

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
            { label: "Total Investors", val: stats.total, color: "#0ea5e9" },
            { label: "Active Leads", val: stats.active, color: "#f59e0b" },
            { label: "Deals Closed", val: stats.closed, color: "#10b981" },
            { label: "Outreach", val: stats.outreach, color: "#8b5cf6" },
          ].map(s => (
            <div key={s.label} className="rounded-2xl p-5 border border-white/[0.06]"
              style={{ background: "rgba(255,255,255,0.03)" }}>
              <div className="text-[11px] text-slate-600 uppercase tracking-widest mb-3">{s.label}</div>
              <div className="text-[36px] font-bold tracking-tight" style={{ color: s.color }}>{s.val}</div>
            </div>
          ))}
        </div>

        {/* RECENT INVESTORS */}
        <div className="rounded-2xl border border-white/[0.06] overflow-hidden"
          style={{ background: "rgba(255,255,255,0.02)" }}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.05]">
            <h2 className="text-[15px] font-semibold text-white">Recent Investors</h2>
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
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-white/[0.05]">
                  {["Name", "Company", "Status", "Amount"].map(h => (
                    <th key={h} className="px-5 py-3 text-[11px] text-slate-600 uppercase tracking-widest text-left font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {investors.slice(0, 8).map(inv => (
                  <tr key={inv.id} className="border-b border-white/[0.03] hover:bg-white/[0.01] transition-colors">
                    <td className="px-5 py-3.5 text-[13px] text-slate-200 font-medium">{inv.name}</td>
                    <td className="px-5 py-3.5 text-[13px] text-slate-500">{inv.company || "—"}</td>
                    <td className="px-5 py-3.5">
                      <span className="text-[11px] px-2.5 py-1 rounded-full"
                        style={{ background: "rgba(14,165,233,0.1)", color: "#0ea5e9", border: "1px solid rgba(14,165,233,0.2)" }}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-[13px] text-slate-300">{inv.amount ? `$${Number(inv.amount).toLocaleString()}` : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}