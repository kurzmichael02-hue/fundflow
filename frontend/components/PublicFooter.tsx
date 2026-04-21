"use client"
import Link from "next/link"
import Logo from "@/components/Logo"

// Colophon-style footer. Set in the three typefaces the landing uses —
// Fraunces for the wordmark, DM Sans for links, JetBrains Mono for the
// credit line. No logo mark, no newsletter signup, no "all systems
// operational" pulsing dot — it's a footer, not a marketing event.
const COLS: Array<{ title: string; links: Array<{ l: string; h: string }> }> = [
  { title: "Product",   links: [{ l: "Pricing", h: "/#pricing" }, { l: "FAQ", h: "/#faq" }, { l: "Dashboard", h: "/dashboard" }] },
  { title: "Investors", links: [{ l: "Sign in", h: "/investor" }, { l: "Register", h: "/investor/register" }, { l: "Deal flow", h: "/investor/discover" }] },
  { title: "Company",   links: [{ l: "About", h: "/about" }, { l: "Contact", h: "/contact" }, { l: "Privacy", h: "/privacy" }, { l: "Terms", h: "/terms" }] },
]

const SOCIAL = [
  {
    href: "https://twitter.com/fundflow", label: "Twitter",
    icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.213 5.567zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
  },
  {
    href: "https://t.me/fundflow", label: "Telegram",
    icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.026 13.6l-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.832.959h.29z"/></svg>,
  },
]

export default function PublicFooter() {
  return (
    <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="max-w-[1180px] mx-auto px-6 md:px-10 pt-14 pb-10">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2">
            <div className="flex items-baseline gap-3 mb-3">
              <Logo size="sm" href="/" />
              <span className="mono" style={{ fontSize: 10, color: "#64748b", letterSpacing: "0.08em", textTransform: "uppercase" }}>Beta · v0.1</span>
            </div>
            <p style={{ fontSize: 13, color: "#64748b", maxWidth: 280, lineHeight: 1.6 }}>
              The investor CRM for Web3 founders. Built in Berlin, hosted in Frankfurt.
            </p>
            <div className="mono flex items-center gap-1.5 mt-5" style={{ fontSize: 11, color: "#34d399", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981" }} />
              All systems operational
            </div>
          </div>

          {COLS.map(col => (
            <div key={col.title}>
              <p className="mono mb-4" style={{ fontSize: 11, color: "#64748b", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                {col.title}
              </p>
              <div className="flex flex-col gap-2.5">
                {col.links.map(l => (
                  <Link key={l.l} href={l.h} className="no-underline" style={{ fontSize: 14, color: "#94a3b8" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
                    onMouseLeave={e => (e.currentTarget.style.color = "#94a3b8")}>
                    {l.l}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pt-8"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <span className="mono" style={{ fontSize: 11, color: "#64748b", letterSpacing: "0.06em" }}>
            © 2026 FundFlow · Set in Fraunces, DM Sans, JetBrains Mono
          </span>
          <div className="flex items-center gap-5">
            {SOCIAL.map(s => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                aria-label={s.label} className="no-underline" style={{ color: "#64748b" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#e5e7eb")}
                onMouseLeave={e => (e.currentTarget.style.color = "#64748b")}>
                {s.icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
