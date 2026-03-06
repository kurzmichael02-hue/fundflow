"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import api from "@/lib/api"

export default function DashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState({ total: 0, active: 0, meetings: 0, closed: 0 })

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) { router.push("/login"); return }

    api.get("/investors", { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        const investors = res.data
        setStats({
          total: investors.length,
          active: investors.filter((i: any) => i.status === "interested" || i.status === "outreach").length,
          meetings: investors.filter((i: any) => i.status === "meeting").length,
          closed: investors.filter((i: any) => i.status === "closed").length,
        })
      })
      .catch(() => { router.push("/login") })
  }, [])

  const handleLogout = () => {
    localStorage.clear()
    router.push("/login")
  }

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white">
      <nav className="border-b border-gray-800 px-8 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-cyan-500">FundFlow</h1>
        <div className="flex items-center gap-6">
          <a href="/dashboard" className="text-white text-sm font-semibold">Dashboard</a>
          <a href="/investors" className="text-gray-400 hover:text-white transition text-sm">Investors</a>
          <a href="/pipeline" className="text-gray-400 hover:text-white transition text-sm">Pipeline</a>
          <button onClick={handleLogout} className="bg-red-500 hover:bg-red-400 text-white text-sm px-4 py-2 rounded-lg transition">Logout</button>
        </div>
      </nav>

      <div className="px-8 py-8">
        <h2 className="text-2xl font-bold mb-6">Welcome back 👋</h2>
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Investors", value: stats.total },
            { label: "Active Leads", value: stats.active },
            { label: "Meetings Booked", value: stats.meetings },
            { label: "Deals Closed", value: stats.closed },
          ].map((stat) => (
            <div key={stat.label} className="bg-[#111118] border border-gray-800 rounded-xl p-5">
              <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-white">{stat.value}</p>
            </div>
          ))}
        </div>
        <div className="bg-[#111118] border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <p className="text-gray-500 text-sm">No activity yet. Start by adding investors to your pipeline.</p>
        </div>
      </div>
    </main>
  )
}
