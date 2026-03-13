"use client"
import { useRouter, usePathname } from "next/navigation"
import { useState, useRef, useEffect } from "react"
import { RiDashboardLine, RiUserLine, RiKanbanView, RiBarChartLine, RiAccountCircleLine, RiLogoutBoxLine, RiMenuLine, RiCloseLine, RiArrowDownSLine, RiDatabase2Line, RiListCheck2 } from "react-icons/ri"

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [investorsOpen, setInvestorsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setInvestorsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  function handleLogout() {
    localStorage.removeItem("token")
    router.push("/login")
  }

  const investorsActive = pathname === "/investors" || pathname === "/investors/database"

  return (
    <nav className="sticky top-0 z-50 border-b border-white/[0.06]"
      style={{ background: "rgba(4,7,15,0.85)", backdropFilter: "blur(12px)" }}>
      <div className="px-4 md:px-12 mx-auto max-w-6xl flex items-center justify-between h-14">

        {/* Logo */}
        <button onClick={() => router.push("/dashboard")}
          className="flex items-center gap-2.5 cursor-pointer bg-transparent border-0">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black text-white"
            style={{ background: "linear-gradient(135deg, #0ea5e9, #0284c7)" }}>FF</div>
          <span className="text-white font-semibold text-sm tracking-tight">FundFlow</span>
        </button>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">

          {/* Dashboard */}
          <button onClick={() => router.push("/dashboard")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer border-0 transition-all"
            style={{ background: pathname === "/dashboard" ? "rgba(14,165,233,0.1)" : "transparent", color: pathname === "/dashboard" ? "#38bdf8" : "#64748b" }}>
            <RiDashboardLine size={15} /> Dashboard
          </button>

          {/* Investors dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button onClick={() => setInvestorsOpen(!investorsOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer border-0 transition-all"
              style={{ background: investorsActive ? "rgba(14,165,233,0.1)" : "transparent", color: investorsActive ? "#38bdf8" : "#64748b" }}>
              <RiUserLine size={15} /> Investors
              <RiArrowDownSLine size={13} className={`transition-transform ${investorsOpen ? "rotate-180" : ""}`} />
            </button>

            {investorsOpen && (
              <div className="absolute top-full left-0 mt-1.5 w-44 rounded-2xl border border-white/[0.08] overflow-hidden shadow-xl"
                style={{ background: "rgba(8,12,24,0.98)", backdropFilter: "blur(16px)" }}>
                <div className="p-1.5 flex flex-col gap-0.5">
                  <button onClick={() => { router.push("/investors"); setInvestorsOpen(false) }}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium cursor-pointer border-0 text-left w-full transition-all hover:bg-white/[0.04]"
                    style={{ color: pathname === "/investors" ? "#38bdf8" : "#94a3b8", background: pathname === "/investors" ? "rgba(14,165,233,0.08)" : "transparent" }}>
                    <RiListCheck2 size={14} />
                    <div>
                      <p className="font-medium">My Investors</p>
                      <p className="text-[10px] text-slate-600 mt-0.5">Your CRM pipeline</p>
                    </div>
                  </button>
                  <button onClick={() => { router.push("/investors/database"); setInvestorsOpen(false) }}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium cursor-pointer border-0 text-left w-full transition-all hover:bg-white/[0.04]"
                    style={{ color: pathname === "/investors/database" ? "#38bdf8" : "#94a3b8", background: pathname === "/investors/database" ? "rgba(14,165,233,0.08)" : "transparent" }}>
                    <RiDatabase2Line size={14} />
                    <div>
                      <p className="font-medium">Database</p>
                      <p className="text-[10px] text-slate-600 mt-0.5">30 curated investors</p>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Pipeline */}
          <button onClick={() => router.push("/pipeline")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer border-0 transition-all"
            style={{ background: pathname === "/pipeline" ? "rgba(14,165,233,0.1)" : "transparent", color: pathname === "/pipeline" ? "#38bdf8" : "#64748b" }}>
            <RiKanbanView size={15} /> Pipeline
          </button>

          {/* Analytics */}
          <button onClick={() => router.push("/analytics")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer border-0 transition-all"
            style={{ background: pathname === "/analytics" ? "rgba(14,165,233,0.1)" : "transparent", color: pathname === "/analytics" ? "#38bdf8" : "#64748b" }}>
            <RiBarChartLine size={15} /> Analytics
          </button>

          {/* Profile */}
          <button onClick={() => router.push("/profile")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer border-0 transition-all"
            style={{ background: pathname === "/profile" ? "rgba(14,165,233,0.1)" : "transparent", color: pathname === "/profile" ? "#38bdf8" : "#64748b" }}>
            <RiAccountCircleLine size={15} /> Profile
          </button>

        </div>

        {/* Logout + hamburger */}
        <div className="flex items-center gap-2">
          <button onClick={handleLogout}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer border-0"
            style={{ background: "rgba(239,68,68,0.08)", color: "#f87171" }}>
            <RiLogoutBoxLine size={13} /> Logout
          </button>
          <button onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden flex items-center justify-center w-8 h-8 rounded-xl cursor-pointer border-0"
            style={{ background: "rgba(255,255,255,0.04)", color: "#94a3b8" }}>
            {menuOpen ? <RiCloseLine size={16} /> : <RiMenuLine size={16} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-white/[0.05] px-4 py-3 flex flex-col gap-1"
          style={{ background: "rgba(4,7,15,0.95)" }}>
          {[
            { label: "Dashboard", path: "/dashboard", icon: <RiDashboardLine size={15} /> },
            { label: "My Investors", path: "/investors", icon: <RiListCheck2 size={15} /> },
            { label: "Investor Database", path: "/investors/database", icon: <RiDatabase2Line size={15} /> },
            { label: "Pipeline", path: "/pipeline", icon: <RiKanbanView size={15} /> },
            { label: "Analytics", path: "/analytics", icon: <RiBarChartLine size={15} /> },
            { label: "Profile", path: "/profile", icon: <RiAccountCircleLine size={15} /> },
          ].map(item => (
            <button key={item.path} onClick={() => { router.push(item.path); setMenuOpen(false) }}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium cursor-pointer border-0 text-left"
              style={{ background: pathname === item.path ? "rgba(14,165,233,0.1)" : "transparent", color: pathname === item.path ? "#38bdf8" : "#94a3b8" }}>
              {item.icon} {item.label}
            </button>
          ))}
          <button onClick={handleLogout}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium cursor-pointer border-0 mt-1"
            style={{ background: "rgba(239,68,68,0.08)", color: "#f87171" }}>
            <RiLogoutBoxLine size={15} /> Logout
          </button>
        </div>
      )}
    </nav>
  )
}