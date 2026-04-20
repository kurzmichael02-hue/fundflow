"use client"
import { useEffect } from "react"
import Link from "next/link"
import PublicNav from "@/components/PublicNav"
import PublicFooter from "@/components/PublicFooter"
import { RiArrowRightLine } from "react-icons/ri"

// About page, editorial rewrite.
// Old version used the same gradient/glow/rounded-2xl stack as the old
// landing. This one mirrors the new landing exactly: Fraunces display,
// mono kickers, hairline borders, one emerald accent.
//
// The team section used to include florid "entrepreneurial vision" bios
// that read like LinkedIn hype. Replaced with factual role + what each
// person actually does on the product.

const TEAM = [
  {
    initials: "TJ",
    name: "Taiwo Jeremiah",
    role: "Founder, CEO",
    handle: "@CryptonJay",
    bio: "Runs strategy, partnerships, investor relations. Sources the founders on the platform.",
  },
  {
    initials: "JO",
    name: "Joshua Oyerinde",
    role: "CTO",
    handle: "@Joshua",
    bio: "Owns the backend, database schema, and the Stripe billing integration. Keeps the auth surface honest.",
  },
  {
    initials: "MK",
    name: "Michael Kurz",
    role: "Technical Manager",
    handle: "@MichaelKurz",
    bio: "Builds and ships the frontend. Manages releases, handles the public landing + investor portal UI.",
  },
]

// Keep it to four values. More than that and it reads as corporate
// mission-statement filler instead of actual principles.
const VALUES: Array<{ num: string; title: string; body: string }> = [
  {
    num: "01",
    title: "Ship small, ship often.",
    body: "Production deploys land daily, not quarterly. The changelog is our roadmap. If it's in `main`, it's live within minutes.",
  },
  {
    num: "02",
    title: "Security is a default, not a feature.",
    body: "Server-side whitelists on every user-writable column. Stripe owns the billing state. No client can upgrade its own plan.",
  },
  {
    num: "03",
    title: "Built for the Web3 stack.",
    body: "Wallet connect is a first-class login path. Token rounds and SAFTs are in the data model, not bolted on with a tag system.",
  },
  {
    num: "04",
    title: "Founders first.",
    body: "Every feature is scoped by one question — does a Web3 founder close faster because of it? If no, it doesn't ship.",
  },
]

export default function About() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add("is-in"); observer.unobserve(e.target) }
      }),
      { threshold: 0.12 }
    )
    document.querySelectorAll(".reveal").forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <main style={{ background: "#060608", color: "#e5e7eb", fontFamily: "'DM Sans', sans-serif" }}>
      <PublicNav />

      {/* ─── MASTHEAD ─── */}
      <section>
        <div className="max-w-[1180px] mx-auto px-6 md:px-10">
          <div className="flex items-center justify-between pt-10 md:pt-14 pb-8 md:pb-12"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <span className="mono" style={{ fontSize: 11, color: "#64748b", letterSpacing: "0.12em", textTransform: "uppercase" }}>
              About · Origin story · Team
            </span>
            <span className="mono hidden sm:inline" style={{ fontSize: 11, color: "#64748b", letterSpacing: "0.12em", textTransform: "uppercase" }}>
              Berlin · Lagos · Frankfurt
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pt-16 md:pt-24 pb-16 md:pb-24">
            <div className="md:col-span-3">
              <p className="mono" style={{ fontSize: 11, color: "#10b981", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                About
              </p>
            </div>
            <div className="md:col-span-9">
              <h1 className="serif text-white" style={{
                fontSize: "clamp(48px, 7vw, 100px)",
                lineHeight: 0.95,
                letterSpacing: "-0.045em",
                fontWeight: 500,
              }}>
                Built by founders,<br />
                for founders.
              </h1>
              <p style={{ fontSize: 18, color: "#94a3b8", marginTop: 32, maxWidth: 560, lineHeight: 1.6, fontWeight: 300 }}>
                FundFlow started as a spreadsheet. Then a Notion board. Then a Retool prototype.
                Now it's the CRM we wished existed when we were raising — one that understands
                token rounds, wallet-based identity, and the speed at which crypto moves.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── MISSION ─── two-column editorial */}
      <section style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-[1180px] mx-auto px-6 md:px-10 py-20 md:py-28">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
            <div className="md:col-span-3">
              <p className="mono" style={{ fontSize: 11, color: "#10b981", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                Why we built it
              </p>
            </div>
            <div className="md:col-span-9">
              <h2 className="serif text-white" style={{
                fontSize: "clamp(36px, 5vw, 64px)", lineHeight: 1, letterSpacing: "-0.04em", fontWeight: 500,
              }}>
                The blockchain is fast.<br />
                Fundraising isn't.
              </h2>
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-5 max-w-[720px]" style={{ fontSize: 16, color: "#94a3b8", lineHeight: 1.75 }}>
                <p>
                  Crypto settled a cross-chain swap in twelve seconds, but the round behind it still
                  ran on four spreadsheets, three WhatsApp threads, and a memory of who said what
                  at which dinner.
                </p>
                <p>
                  That mismatch is the whole problem FundFlow solves. One pipeline. One
                  public page. One funnel. The investor conversations stay in one place,
                  the analytics stay honest, and no warm intro falls out of your head.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── VALUES ─── numbered list, editorial */}
      <section style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-[1180px] mx-auto px-6 md:px-10 py-20 md:py-28">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-14">
            <div className="md:col-span-3">
              <p className="mono" style={{ fontSize: 11, color: "#10b981", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                What we believe
              </p>
            </div>
            <div className="md:col-span-9">
              <h2 className="serif text-white" style={{
                fontSize: "clamp(36px, 5vw, 64px)", lineHeight: 1, letterSpacing: "-0.04em", fontWeight: 500,
              }}>
                Four principles<br />
                we actually follow.
              </h2>
            </div>
          </div>

          <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            {VALUES.map(v => (
              <div key={v.num}
                className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 py-10 reveal"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="md:col-span-2">
                  <span className="serif" style={{ fontSize: 56, color: "rgba(255,255,255,0.08)", fontWeight: 500, letterSpacing: "-0.03em", lineHeight: 0.9 }}>
                    {v.num}
                  </span>
                </div>
                <div className="md:col-span-4">
                  <h3 className="serif text-white" style={{ fontSize: 26, lineHeight: 1.15, letterSpacing: "-0.02em", fontWeight: 500 }}>
                    {v.title}
                  </h3>
                </div>
                <div className="md:col-span-6">
                  <p style={{ fontSize: 16, color: "#94a3b8", lineHeight: 1.7 }}>
                    {v.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TEAM ─── three editorial portraits as rows */}
      <section style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-[1180px] mx-auto px-6 md:px-10 py-20 md:py-28">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-14">
            <div className="md:col-span-3">
              <p className="mono" style={{ fontSize: 11, color: "#10b981", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                The team
              </p>
            </div>
            <div className="md:col-span-9">
              <h2 className="serif text-white" style={{
                fontSize: "clamp(36px, 5vw, 64px)", lineHeight: 1, letterSpacing: "-0.04em", fontWeight: 500,
              }}>
                Three people<br />
                behind every release.
              </h2>
            </div>
          </div>

          <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            {TEAM.map(member => (
              <div key={member.name}
                className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 py-10 reveal items-start"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="md:col-span-2 flex items-start">
                  <div style={{
                    width: 56, height: 56,
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: "#e5e7eb",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 18, fontWeight: 500, letterSpacing: "-0.01em",
                    borderRadius: 2,
                  }} className="serif">
                    {member.initials}
                  </div>
                </div>
                <div className="md:col-span-4">
                  <h3 className="serif text-white" style={{ fontSize: 26, letterSpacing: "-0.02em", fontWeight: 500, lineHeight: 1.15 }}>
                    {member.name}
                  </h3>
                  <p className="mono mt-2" style={{ fontSize: 12, color: "#10b981", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                    {member.role}
                  </p>
                </div>
                <div className="md:col-span-5">
                  <p style={{ fontSize: 16, color: "#94a3b8", lineHeight: 1.7 }}>
                    {member.bio}
                  </p>
                </div>
                <div className="md:col-span-1 flex md:justify-end">
                  <span className="mono" style={{ fontSize: 12, color: "#64748b", letterSpacing: "0.02em" }}>
                    {member.handle}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── same goodbye structure as landing */}
      <section style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 100, paddingBottom: 100 }}>
        <div className="max-w-[1180px] mx-auto px-6 md:px-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-end">
            <div className="md:col-span-8">
              <p className="mono mb-5" style={{ fontSize: 11, color: "#10b981", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                Want to work with us?
              </p>
              <h2 className="serif text-white" style={{
                fontSize: "clamp(40px, 6vw, 80px)", lineHeight: 1, letterSpacing: "-0.045em", fontWeight: 500,
              }}>
                We're always<br />
                open to conversations.
              </h2>
            </div>
            <div className="md:col-span-4 flex flex-col gap-3">
              <Link href="/register" className="no-underline flex items-center justify-center gap-2"
                style={{
                  background: "#10b981", color: "#fff",
                  padding: "16px 24px", borderRadius: 2,
                  fontSize: 14, fontWeight: 600,
                }}>
                Start for free <RiArrowRightLine size={14} />
              </Link>
              <Link href="/contact" className="no-underline flex items-center justify-center gap-2"
                style={{
                  color: "#cbd5e1", padding: "14px 24px",
                  border: "1px solid rgba(255,255,255,0.14)", borderRadius: 2,
                  fontSize: 14, fontWeight: 500,
                }}>
                Get in touch →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </main>
  )
}
