"use client"
import { useRouter, usePathname } from "next/navigation"
import { useState } from "react"
import { RiDashboardLine, RiUserLine, RiKanbanView, RiBarChartLine, RiAccountCircleLine, RiLogoutBoxLine, RiMenuLine, RiCloseLine } from "react-icons/ri"

const NAV_ITEMS = [
  { label: "Dashboard", path: "/dashboard", icon: <RiDashboardLine size={15} /> },
  { label: "Investors",  path: "/investors",  icon: <RiUserLine size={15} /> },
  { label: "Pipeline",   path: "/pipeline",   icon: <RiKanbanView size={15} /> },
  { label: "Analytics",  path: "/analytics",  icon: <RiBarChartLine size={15} /> },
  { label: "Profile",    path: "/profile",    icon: <RiAccountCircleLine size={15} /> },
]

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  function handleLogout() {
    localStorage.removeItem("token")
    router.push("/login")
  }

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
          {NAV_ITEMS.map(item => {
            const active = pathname === item.path
            return (
              <button key={item.path} onClick={() => router.push(item.path)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer border-0 transition-all"
                style={{
                  background: active ? "rgba(14,165,233,0.1)" : "transparent",
                  color: active ? "#38bdf8" : "#64748b",
                }}>
                {item.icon}
                {item.label}
              </button>
            )
          })}
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
          {NAV_ITEMS.map(item => {
            const active = pathname === item.path
            return (
              <button key={item.path} onClick={() => { router.push(item.path); setMenuOpen(false) }}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium cursor-pointer border-0 text-left"
                style={{
                  background: active ? "rgba(14,165,233,0.1)" : "transparent",
                  color: active ? "#38bdf8" : "#94a3b8",
                }}>
                {item.icon}
                {item.label}
              </button>
            )
          })}
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