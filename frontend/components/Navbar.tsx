"use client"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import {
  RiDashboardLine,
  RiTeamLine,
  RiFlowChart,
  RiUserLine,
  RiLogoutBoxLine,
} from "react-icons/ri"

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()

  function handleLogout() {
    localStorage.removeItem("token")
    router.push("/")
  }

  const links = [
    { label: "Dashboard", href: "/dashboard", icon: <RiDashboardLine size={14} /> },
    { label: "Investors", href: "/investors", icon: <RiTeamLine size={14} /> },
    { label: "Pipeline", href: "/pipeline", icon: <RiFlowChart size={14} /> },
    { label: "Profile", href: "/profile", icon: <RiUserLine size={14} /> },
  ]

  return (
    <nav className="border-b border-white/[0.06] px-6 md:px-12 h-[60px] flex items-center justify-between sticky top-0 z-50"
      style={{ background: "rgba(4,7,15,0.92)", backdropFilter: "blur(20px)" }}>

      {/* Logo */}
      <Link href="/dashboard" className="flex items-center gap-2.5 no-underline">
        <div className="w-[26px] h-[26px] rounded-md flex items-center justify-center text-[10px] font-black text-white shrink-0"
          style={{ background: "linear-gradient(135deg, #0ea5e9, #0284c7)" }}>FF</div>
        <span className="text-[15px] font-bold text-white">FundFlow</span>
      </Link>

      {/* Nav links */}
      <div className="flex items-center gap-1">
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

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-1.5 text-[12px] text-red-400 border border-red-500/20 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-all cursor-pointer"
        style={{ background: "rgba(239,68,68,0.06)" }}>
        <RiLogoutBoxLine size={13} /> Logout
      </button>
    </nav>
  )
}