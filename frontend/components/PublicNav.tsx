"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { RiMenuLine, RiCloseLine, RiArrowRightLine } from "react-icons/ri"

// The editorial masthead shared by every public-facing page.
// Kept deliberately flat: hairline bottom border, no backdrop-blur, no
// gradient logo mark — the serif wordmark + mono beta strip carry it.
const LINKS: Array<{ label: string; href: string }> = [
  { label: "Product",  href: "/#features" },
  { label: "Pricing",  href: "/#pricing" },
  { label: "FAQ",      href: "/#faq" },
  { label: "About",    href: "/about" },
  { label: "Contact",  href: "/contact" },
]

export default function PublicNav() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("token"))
  }, [])

  function isActive(href: string) {
    if (href.startsWith("/#")) return false
    return pathname === href
  }

  return (
    <>
      <nav style={{ position: "sticky", top: 0, zIndex: 50, background: "#060608", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-[1180px] mx-auto px-6 md:px-10 flex items-center justify-between" style={{ height: 64 }}>
          <Link href="/" className="flex items-baseline gap-3 no-underline">
            <span className="serif text-white" style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em" }}>FundFlow</span>
            <span className="mono" style={{ fontSize: 10, color: "#475569", letterSpacing: "0.08em", textTransform: "uppercase" }}>Beta · v0.1</span>
          </Link>

          <div className="hidden md:flex items-center" style={{ gap: 32 }}>
            {LINKS.map(l => {
              const active = isActive(l.href)
              return (
                <Link key={l.label} href={l.href} className="mono no-underline"
                  style={{
                    fontSize: 12,
                    color: active ? "#fff" : "#94a3b8",
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
                  onMouseLeave={e => (e.currentTarget.style.color = active ? "#fff" : "#94a3b8")}>
                  {l.label}
                </Link>
              )
            })}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn ? (
              <Link href="/dashboard" className="no-underline flex items-center gap-1.5"
                style={{ fontSize: 13, color: "#fff", padding: "8px 14px", background: "#10b981", borderRadius: 2, fontWeight: 600 }}>
                Dashboard <RiArrowRightLine size={13} />
              </Link>
            ) : (
              <>
                <Link href="/login" className="no-underline"
                  style={{ fontSize: 13, color: "#cbd5e1", padding: "8px 14px" }}>
                  Sign in
                </Link>
                <Link href="/register" className="no-underline flex items-center gap-1.5"
                  style={{ fontSize: 13, color: "#fff", padding: "8px 14px", background: "#10b981", borderRadius: 2, fontWeight: 600 }}>
                  Start free <RiArrowRightLine size={13} />
                </Link>
              </>
            )}
          </div>

          <button onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden flex items-center justify-center cursor-pointer"
            style={{ background: "transparent", width: 36, height: 36, color: "#94a3b8", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 2 }}
            aria-label="Toggle menu">
            {menuOpen ? <RiCloseLine size={18} /> : <RiMenuLine size={18} />}
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="md:hidden" style={{ background: "#060608", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="px-6 py-5 flex flex-col gap-4">
            {LINKS.map(l => (
              <Link key={l.label} href={l.href} onClick={() => setMenuOpen(false)} className="mono no-underline"
                style={{ fontSize: 13, color: "#cbd5e1", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                {l.label}
              </Link>
            ))}
            <div className="flex gap-2 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              {isLoggedIn ? (
                <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="flex-1 text-center no-underline"
                  style={{ fontSize: 13, color: "#fff", padding: "10px 0", background: "#10b981", borderRadius: 2, fontWeight: 600 }}>
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMenuOpen(false)} className="flex-1 text-center no-underline"
                    style={{ fontSize: 13, color: "#cbd5e1", padding: "10px 0", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 2 }}>
                    Sign in
                  </Link>
                  <Link href="/register" onClick={() => setMenuOpen(false)} className="flex-1 text-center no-underline"
                    style={{ fontSize: 13, color: "#fff", padding: "10px 0", background: "#10b981", borderRadius: 2, fontWeight: 600 }}>
                    Start free
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
