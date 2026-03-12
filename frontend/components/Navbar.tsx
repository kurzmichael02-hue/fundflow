"use client"
import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import {
  RiDashboardLine,
  RiTeamLine,
  RiFlowChart,
  RiUserLine,
  RiLogoutBoxLine,
  RiMenuLine,
  RiCloseLine,
} from "react-icons/ri"

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  function handleLogout() {
    localStorage.removeItem("token")
    router.push("/")
  }

  const links = [
    { label: "Dashboard", href: "/dashboard", icon: <RiDashboardLine size={16} /> },
    { label: "Investors", href: "/investors", icon: <RiTeamLine size={16} /> },
    { label: "Pipeline", href: "/pipeline", icon: <RiFlowChart size={16} /> },
    { label: "Profile", href: "/profile", icon: <RiUserLine size={16} /> },
  ]

  return (
    <>
      <nav className="border-b border-white/[0.06] px-4 md:px-12 h-[60px] flex items-center justify-between sticky top-0 z-50"
        style={{ background: "rgba(4,7,15,0.95)", backdropFilter: "blur(20px)" }}>

        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 no-underline" onClick={() => setMenuOpen(false)}>
          <div className="w-[26px] h-[26px] rounded-md flex items-center justify-center text-[10px] font-black text-white shrink-0"
            style={{ background: "linear-gradient(135deg, #0ea5e9, #0284c7)" }}>FF</div>
          <span className="text-[15px] font-bold text-white">FundFlow</span>
        </Link>

        {/* Desktop Nav links */}
        <div className="hidden md:flex items-center gap-1">
          {links.map(l => {
            const active = pathname === l.href
            return (
              <Link key={l.label} href={l.href}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all no-underline"
                style={{
                  color: active ? "#fff" : "#64748b",
                  background: active ? "rgba(255,255,255,0.06)" : "transparent",
                }}>
                <span style={{ color: active ? "#0ea5e9" : "#475569" }}>{l.icon}</span>
                {l.label}
              </Link>
            )
          })}
        </div>

        {/* Desktop Logout */}
        <button onClick={handleLogout}
          className="hidden md:flex items-center gap-1.5 text-[12px] text-red-400 border border-red-500/20 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-all cursor-pointer"
          style={{ background: "rgba(239,68,68,0.06)" }}>
          <RiLogoutBoxLine size={13} /> Logout
        </button>

        {/* Mobile hamburger */}
        <button onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg text-slate-400 cursor-pointer border-0"
          style={{ background: "rgba(255,255,255,0.04)" }}>
          {menuOpen ? <RiCloseLine size={20} /> : <RiMenuLine size={20} />}
        </button>
      </nav>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-40 pt-[60px]"
          style={{ background: "rgba(4,7,15,0.98)", backdropFilter: "blur(20px)" }}>
          <div className="flex flex-col p-6 gap-2">
            {links.map(l => {
              const active = pathname === l.href
              return (
                <Link key={l.label} href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-[15px] font-medium no-underline transition-all"
                  style={{
                    color: active ? "#fff" : "#64748b",
                    background: active ? "rgba(14,165,233,0.08)" : "rgba(255,255,255,0.02)",
                    border: active ? "1px solid rgba(14,165,233,0.15)" : "1px solid rgba(255,255,255,0.04)",
                  }}>
                  <span style={{ color: active ? "#0ea5e9" : "#475569" }}>{l.icon}</span>
                  {l.label}
                </Link>
              )
            })}

            <div className="mt-4 pt-4 border-t border-white/[0.06]">
              <button onClick={() => { setMenuOpen(false); handleLogout() }}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-[15px] font-medium text-red-400 cursor-pointer border-0"
                style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.12)" }}>
                <RiLogoutBoxLine size={16} /> Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}