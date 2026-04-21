"use client"
import { useEffect, useRef, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import {
  RiDashboardLine, RiUserLine, RiKanbanView, RiBarChartLine,
  RiAccountCircleLine, RiLogoutBoxLine, RiMenuLine, RiCloseLine,
  RiDatabase2Line, RiListCheck2, RiArrowDownSLine, RiSearchLine,
} from "react-icons/ri"
import CommandPalette from "@/components/CommandPalette"
import ShortcutsCheatsheet from "@/components/ShortcutsCheatsheet"
import Logo from "@/components/Logo"

// AppNav — the masthead shown to authenticated users across /dashboard,
// /investors, /pipeline, /analytics, /profile.
//
// Same editorial language as PublicNav (serif wordmark, mono links, hairline
// border) but carries a logged-in navigation set plus the plan badge and a
// user menu with sign-out. Separate component so we can put logged-in-only
// concerns here without polluting the public masthead.

type Section = { label: string; href: string; icon: React.ReactNode }

const SECTIONS: Section[] = [
  { label: "Dashboard",  href: "/dashboard",  icon: <RiDashboardLine size={14} /> },
  { label: "Pipeline",   href: "/pipeline",   icon: <RiKanbanView   size={14} /> },
  { label: "Analytics",  href: "/analytics",  icon: <RiBarChartLine size={14} /> },
  { label: "Profile",    href: "/profile",    icon: <RiAccountCircleLine size={14} /> },
]

// Investors lives behind a dropdown because there are two destinations —
// the user's own CRM list and the curated directory — and conflating them
// costs more than the extra click.
const INVESTOR_LINKS = [
  { label: "My Investors",  sub: "Your CRM pipeline",       href: "/investors",          icon: <RiListCheck2   size={13} /> },
  { label: "Directory",     sub: "Curated funds",           href: "/investors/database", icon: <RiDatabase2Line size={13} /> },
]

export default function AppNav() {
  const router = useRouter()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [investorsOpen, setInvestorsOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)
  const [plan, setPlan] = useState<string | null>(null)
  const [email, setEmail] = useState<string | null>(null)
  const investorsRef = useRef<HTMLDivElement>(null)
  const userRef = useRef<HTMLDivElement>(null)

  // Close either dropdown on outside click.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (investorsRef.current && !investorsRef.current.contains(e.target as Node)) {
        setInvestorsOpen(false)
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setUserOpen(false)
      }
    }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [])

  // Linear-style "g + letter" navigation. Press g, then within 1.5s press
  // d/i/p/a/r/f to jump. Ignored when a form element has focus so typing
  // "goose" into a field doesn't accidentally bounce you to the dashboard.
  useEffect(() => {
    const shortcuts: Record<string, string> = {
      d: "/dashboard",
      i: "/investors",
      p: "/pipeline",
      a: "/analytics",
      r: "/investors/database",
      f: "/profile",
    }
    let gPending = false
    let timer: ReturnType<typeof setTimeout> | null = null

    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null
      const tag = target?.tagName
      const editable = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target?.isContentEditable
      if (editable) return
      // Don't fight Cmd+K or any modified key combos.
      if (e.metaKey || e.ctrlKey || e.altKey) return

      if (!gPending && e.key === "g") {
        gPending = true
        timer = setTimeout(() => { gPending = false }, 1500)
        return
      }
      if (gPending) {
        const dest = shortcuts[e.key.toLowerCase()]
        gPending = false
        if (timer) { clearTimeout(timer); timer = null }
        if (dest) {
          e.preventDefault()
          router.push(dest)
        }
      }
    }
    window.addEventListener("keydown", onKey)
    return () => {
      window.removeEventListener("keydown", onKey)
      if (timer) clearTimeout(timer)
    }
  }, [router])

  // Pull plan + email once so the badge and user menu can render.
  // If the token is rejected (401) we sign the user out — otherwise the
  // nav shows a logged-in shell with no real session and every other
  // page would 401 right after.
  //
  // We re-fetch when the tab regains visibility too. Without that, a user
  // who upgrades via Stripe Checkout (redirects off-site, webhook lands,
  // redirects back) would see the old "Free" plan badge in the nav until
  // they hard-reload. Same cost as the mount fetch, runs at most once per
  // tab-switch.
  useEffect(() => {
    function loadProfile() {
      const token = localStorage.getItem("token")
      if (!token) return
      fetch("/api/profile", { headers: { Authorization: `Bearer ${token}` } })
        .then(async r => {
          if (r.status === 401) {
            localStorage.removeItem("token")
            localStorage.removeItem("user_type")
            router.push("/login")
            return null
          }
          return r.ok ? r.json() : null
        })
        .then(d => {
          if (!d) return
          setPlan(d.plan || "free")
          setEmail(d.email || null)
        })
        .catch(() => {})
    }
    loadProfile()

    function onVisibility() {
      if (document.visibilityState === "visible") loadProfile()
    }
    document.addEventListener("visibilitychange", onVisibility)
    return () => document.removeEventListener("visibilitychange", onVisibility)
  }, [router])

  const investorsActive = pathname === "/investors" || pathname === "/investors/database"

  function handleLogout() {
    localStorage.removeItem("token")
    localStorage.removeItem("user_type")
    router.push("/login")
  }

  function linkStyle(active: boolean): React.CSSProperties {
    return {
      fontSize: 12,
      color: active ? "#fff" : "#94a3b8",
      letterSpacing: "0.04em",
      textTransform: "uppercase",
      display: "flex",
      alignItems: "center",
      gap: 8,
      padding: "8px 0",
      borderBottom: active ? "1px solid #10b981" : "1px solid transparent",
      textDecoration: "none",
      fontFamily: "'JetBrains Mono', ui-monospace, monospace",
    }
  }

  return (
    <>
      <nav style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "#060608",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 flex items-center justify-between" style={{ height: 64 }}>

          {/* ── Left: wordmark + plan */}
          <div className="flex items-baseline gap-3">
            <Logo size="sm" href="/dashboard" />
            <span className="mono" style={{ fontSize: 10, color: plan === "pro" ? "#10b981" : "#64748b", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              {plan === "pro" ? "Pro" : "Free"}
            </span>
          </div>

          {/* ── Centre: section links */}
          <div className="hidden md:flex items-center" style={{ gap: 28 }}>
            {SECTIONS.map((s, i) => {
              const active = pathname === s.href
              // Inject investors dropdown between Dashboard and Pipeline.
              const afterDashboard = i === 1
              return (
                <div key={s.href} className="flex items-center" style={{ gap: 28 }}>
                  {afterDashboard && (
                    <div ref={investorsRef} style={{ position: "relative" }}>
                      <button onClick={() => setInvestorsOpen(!investorsOpen)}
                        style={{
                          ...linkStyle(investorsActive),
                          background: "transparent",
                          border: 0,
                          borderBottom: investorsActive ? "1px solid #10b981" : "1px solid transparent",
                          cursor: "pointer",
                        }}>
                        <RiUserLine size={14} />
                        Investors
                        <RiArrowDownSLine size={12} style={{ transform: investorsOpen ? "rotate(180deg)" : "none", transition: "transform 120ms" }} />
                      </button>
                      {investorsOpen && (
                        <div style={{
                          position: "absolute", top: "calc(100% + 1px)", left: 0, minWidth: 220,
                          background: "#060608",
                          border: "1px solid rgba(255,255,255,0.08)",
                          boxShadow: "0 24px 48px rgba(0,0,0,0.6)",
                          padding: 6,
                        }}>
                          {INVESTOR_LINKS.map(i => {
                            const a = pathname === i.href
                            return (
                              <Link key={i.href} href={i.href} onClick={() => setInvestorsOpen(false)}
                                className="no-underline"
                                style={{
                                  display: "flex", alignItems: "flex-start", gap: 10,
                                  padding: "10px 12px",
                                  background: a ? "rgba(16,185,129,0.06)" : "transparent",
                                  borderLeft: a ? "2px solid #10b981" : "2px solid transparent",
                                }}>
                                <span style={{ color: a ? "#10b981" : "#94a3b8", marginTop: 3 }}>{i.icon}</span>
                                <div>
                                  <div style={{ fontSize: 13, color: a ? "#fff" : "#e5e7eb", fontWeight: 500 }}>{i.label}</div>
                                  <div className="mono" style={{ fontSize: 10, color: "#64748b", marginTop: 2, letterSpacing: "0.04em" }}>{i.sub}</div>
                                </div>
                              </Link>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  <Link href={s.href} style={linkStyle(active)}>
                    {s.icon}
                    {s.label}
                  </Link>
                </div>
              )
            })}
          </div>

          {/* ── Right: command palette trigger + user menu */}
          <div className="flex items-center gap-2">
            {/* Command palette trigger. Desktop only — on mobile the space
                is worth saving and power users there aren't reaching for
                ⌘K on a touchscreen anyway. */}
            <button
              onClick={() => window.dispatchEvent(new CustomEvent("open-command-palette"))}
              className="hidden md:flex items-center gap-2 cursor-pointer"
              style={{
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.08)",
                padding: "6px 10px 6px 10px",
                borderRadius: 2,
                color: "#94a3b8",
              }}
              aria-label="Open command palette"
              title="Command palette"
            >
              <RiSearchLine size={12} />
              <span className="mono" style={{ fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Search
              </span>
              <kbd className="mono" style={{
                fontSize: 10, color: "#64748b", letterSpacing: "0.04em",
                padding: "1px 5px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 2,
              }}>
                ⌘K
              </kbd>
            </button>

            <div ref={userRef} className="hidden md:block" style={{ position: "relative" }}>
              <button onClick={() => setUserOpen(!userOpen)}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  background: "transparent", border: "1px solid rgba(255,255,255,0.08)",
                  padding: "6px 10px", cursor: "pointer",
                  borderRadius: 2,
                }}>
                <span style={{
                  width: 22, height: 22,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: "rgba(16,185,129,0.1)", color: "#34d399",
                  fontSize: 10, fontWeight: 600, borderRadius: 2,
                  fontFamily: "'Fraunces', serif",
                }}>
                  {email ? email[0]?.toUpperCase() : "—"}
                </span>
                <RiArrowDownSLine size={12} style={{ color: "#64748b", transform: userOpen ? "rotate(180deg)" : "none", transition: "transform 120ms" }} />
              </button>
              {userOpen && (
                <div style={{
                  position: "absolute", top: "calc(100% + 1px)", right: 0, minWidth: 240,
                  background: "#060608",
                  border: "1px solid rgba(255,255,255,0.08)",
                  boxShadow: "0 24px 48px rgba(0,0,0,0.6)",
                }}>
                  <div style={{ padding: "14px 14px 12px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    <div className="mono" style={{ fontSize: 10, color: "#64748b", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>
                      Signed in as
                    </div>
                    <div style={{ fontSize: 13, color: "#e5e7eb", wordBreak: "break-all" }}>{email || "—"}</div>
                  </div>
                  <button onClick={() => { setUserOpen(false); router.push("/profile") }}
                    style={{
                      width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: 10,
                      padding: "10px 14px", fontSize: 13, color: "#cbd5e1",
                      background: "transparent", border: 0, cursor: "pointer",
                    }}>
                    <RiAccountCircleLine size={14} style={{ color: "#64748b" }} />
                    Profile
                  </button>
                  <button onClick={handleLogout}
                    style={{
                      width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: 10,
                      padding: "10px 14px", fontSize: 13, color: "#f87171",
                      background: "transparent", border: 0, cursor: "pointer",
                      borderTop: "1px solid rgba(255,255,255,0.06)",
                    }}>
                    <RiLogoutBoxLine size={14} />
                    Sign out
                  </button>
                </div>
              )}
            </div>

            <button onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden flex items-center justify-center cursor-pointer"
              style={{ background: "transparent", width: 36, height: 36, color: "#94a3b8", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 2 }}
              aria-label="Toggle menu">
              {menuOpen ? <RiCloseLine size={18} /> : <RiMenuLine size={18} />}
            </button>
          </div>
        </div>
      </nav>

      <CommandPalette />
      <ShortcutsCheatsheet />

      {menuOpen && (
        <div className="md:hidden" style={{ background: "#060608", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="px-6 py-5 flex flex-col gap-3">
            {[
              { label: "Dashboard",            href: "/dashboard",           icon: <RiDashboardLine size={14} /> },
              { label: "My Investors",         href: "/investors",           icon: <RiListCheck2 size={14} /> },
              { label: "Investor Directory",   href: "/investors/database",  icon: <RiDatabase2Line size={14} /> },
              { label: "Pipeline",             href: "/pipeline",            icon: <RiKanbanView size={14} /> },
              { label: "Analytics",            href: "/analytics",           icon: <RiBarChartLine size={14} /> },
              { label: "Profile",              href: "/profile",             icon: <RiAccountCircleLine size={14} /> },
            ].map(s => {
              const active = pathname === s.href
              return (
                <Link key={s.href} href={s.href} onClick={() => setMenuOpen(false)}
                  className="no-underline mono" style={{
                    display: "flex", alignItems: "center", gap: 10,
                    fontSize: 13,
                    color: active ? "#fff" : "#cbd5e1",
                    letterSpacing: "0.04em", textTransform: "uppercase",
                    padding: "6px 0",
                  }}>
                  <span style={{ color: active ? "#10b981" : "#64748b" }}>{s.icon}</span>
                  {s.label}
                </Link>
              )
            })}
            <button onClick={handleLogout}
              className="mono mt-2"
              style={{
                display: "flex", alignItems: "center", gap: 10,
                fontSize: 13, color: "#f87171",
                letterSpacing: "0.04em", textTransform: "uppercase",
                background: "transparent", border: 0, cursor: "pointer",
                padding: "10px 0", borderTop: "1px solid rgba(255,255,255,0.06)",
              }}>
              <RiLogoutBoxLine size={14} />
              Sign out
            </button>
          </div>
        </div>
      )}
    </>
  )
}
