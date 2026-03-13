"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import {
  RiMenuLine,
  RiCloseLine,
  RiArrowRightLine,
} from "react-icons/ri"

export default function About() {
  const [visible, setVisible] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    setTimeout(() => setVisible(true), 100)
  }, [])

  const team = [
    {
      name: "Taiwo Jeremiah",
      role: "Founder & CEO",
      handle: "@CryptonJay",
      bio: "Serial Web3 entrepreneur with a vision to make fundraising transparent, efficient, and accessible for the next generation of blockchain founders.",
      color: "#0ea5e9",
      initial: "TJ",
    },
    {
      name: "Joshua Oyerinde",
      role: "Chief Technology Officer",
      handle: "@Joshua",
      bio: "Full-stack engineer and security specialist. Architecting scalable, secure systems that power the future of Web3 fundraising infrastructure.",
      color: "#8b5cf6",
      initial: "JO",
    },
    {
      name: "Michael Kurz",
      role: "Technical Manager",
      handle: "@MichaelKurz",
      bio: "Systems architect and platform engineer. Turning complex technical challenges into clean, maintainable products that founders love to use.",
      color: "#10b981",
      initial: "MK",
    },
  ]

  const values = [
    { icon: "⚡", title: "Speed over perfection", desc: "We ship fast, iterate faster. Web3 moves at the speed of blocks — so do we." },
    { icon: "🔒", title: "Security first", desc: "Your deal flow is your most valuable asset. We treat it that way." },
    { icon: "🌐", title: "Built for Web3", desc: "Not a CRM with a crypto skin. Purpose-built for token rounds, SAFTs, and on-chain fundraising." },
    { icon: "🤝", title: "Founder-obsessed", desc: "Every feature starts with one question: does this help founders close faster?" },
  ]

  return (
    <main className="bg-[#04070f] min-h-screen text-slate-200 overflow-x-hidden">
      {/* Ambient */}
      <div className="fixed top-[5%] left-[20%] w-[700px] h-[700px] rounded-full pointer-events-none z-0 blur-[60px]"
        style={{ background: "radial-gradient(circle, rgba(14,165,233,0.06) 0%, transparent 70%)" }} />
      <div className="fixed bottom-[10%] right-[10%] w-[400px] h-[400px] rounded-full pointer-events-none z-0 blur-[60px]"
        style={{ background: "radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 70%)" }} />

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center border-b border-white/[0.05] px-5 md:px-16"
        style={{ background: "rgba(4,7,15,0.92)", backdropFilter: "blur(24px)" }}>
        <div className="w-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 no-underline">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-black text-white"
              style={{ background: "linear-gradient(135deg, #0ea5e9, #0284c7)" }}>FF</div>
            <span className="text-[17px] font-bold text-white tracking-tight">FundFlow</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {[{ label: "Features", href: "/#features" }, { label: "Pricing", href: "/#pricing" }, { label: "About", href: "/about" }].map(l => (
              <Link key={l.label} href={l.href}
                className="text-slate-500 text-sm font-medium hover:text-slate-200 transition-colors no-underline"
                style={l.href === "/about" ? { color: "#e2e8f0" } : {}}>
                {l.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2.5">
            <Link href="/login" className="px-4 py-2 rounded-lg text-sm font-medium text-slate-400 border border-white/[0.07] hover:text-slate-200 hover:bg-white/5 transition-all no-underline">Login</Link>
            <Link href="/register" className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white no-underline"
              style={{ background: "linear-gradient(135deg, #0ea5e9, #0284c7)" }}>Get started <RiArrowRightLine /></Link>
          </div>

          {/* Hamburger */}
          <button onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg border border-white/[0.08] text-slate-400 bg-transparent cursor-pointer">
            {menuOpen ? <RiCloseLine size={20} /> : <RiMenuLine size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="fixed top-16 left-0 right-0 z-40 border-b border-white/[0.06] md:hidden"
          style={{ background: "rgba(4,7,15,0.98)", backdropFilter: "blur(24px)" }}>
          <div className="flex flex-col px-6 py-4 gap-1">
            {[{ label: "Features", href: "/#features" }, { label: "Pricing", href: "/#pricing" }, { label: "About", href: "/about" }].map(l => (
              <Link key={l.label} href={l.href} onClick={() => setMenuOpen(false)}
                className="text-slate-400 text-base font-medium py-3 border-b border-white/[0.04] hover:text-slate-200 no-underline">
                {l.label}
              </Link>
            ))}
            <div className="flex gap-2.5 mt-3">
              <Link href="/login" onClick={() => setMenuOpen(false)}
                className="flex-1 text-center py-3 rounded-lg text-sm font-medium text-slate-400 border border-white/[0.08] no-underline">Login</Link>
              <Link href="/register" onClick={() => setMenuOpen(false)}
                className="flex-1 text-center py-3 rounded-lg text-sm font-semibold text-white no-underline"
                style={{ background: "linear-gradient(135deg, #0ea5e9, #0284c7)" }}>Get started</Link>
            </div>
          </div>
        </div>
      )}

      {/* HERO */}
      <section className="relative z-10 max-w-5xl mx-auto px-5 md:px-16 pt-28 md:pt-36 pb-12 md:pb-20"
        style={{ opacity: visible ? 1 : 0, transition: "opacity 0.4s ease" }}>
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium text-sky-400 border border-sky-500/20 mb-6"
            style={{ background: "rgba(14,165,233,0.08)" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
            Our story
          </div>
          <h1 className="text-[clamp(36px,6vw,72px)] font-bold tracking-[-0.04em] leading-[1.05] text-white mb-6">
            Built by founders,<br />
            <span style={{ background: "linear-gradient(135deg,#fff 0%,#0ea5e9 50%,#38bdf8 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              for founders.
            </span>
          </h1>
          <p className="text-base md:text-lg text-slate-500 leading-relaxed mb-5">
            FundFlow was born out of frustration. We watched brilliant Web3 founders lose deals not because their projects weren't good enough — but because they had no system to manage their investor relationships.
          </p>
          <p className="text-base md:text-lg text-slate-500 leading-relaxed">
            So we built the tool we wished existed. A CRM that actually understands Web3 — token rounds, SAFTs, wallet-based identity, and the speed at which crypto moves.
          </p>
        </div>
      </section>

      {/* STATS */}
      <div className="border-t border-b border-white/[0.05] relative z-10" style={{ background: "rgba(255,255,255,0.01)" }}>
        <div className="max-w-5xl mx-auto px-5 md:px-16 py-10 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { num: "2,400+", label: "Founders onboarded" },
            { num: "$840M", label: "Funding tracked" },
            { num: "94%", label: "Faster deal flow" },
            { num: "99.9%", label: "Uptime guaranteed" },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <div className="text-[32px] md:text-[44px] font-bold tracking-tight leading-none mb-2"
                style={{ background: "linear-gradient(135deg,#fff,#0ea5e9)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                {s.num}
              </div>
              <p className="text-sm text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* MISSION */}
      <section className="relative z-10 max-w-5xl mx-auto px-5 md:px-16 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-20 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium text-sky-400 border border-sky-500/20 mb-5"
              style={{ background: "rgba(14,165,233,0.08)" }}>Our mission</div>
            <h2 className="text-[clamp(28px,4vw,42px)] font-bold tracking-tight text-white leading-tight mb-6">
              Make fundraising as efficient as the blockchain itself.
            </h2>
            <p className="text-base text-slate-500 leading-relaxed mb-4">
              The blockchain promised to democratize finance. But fundraising still runs on spreadsheets, scattered emails, and memory. That's the problem we're solving.
            </p>
            <p className="text-base text-slate-500 leading-relaxed">
              FundFlow gives every Web3 founder — from pre-seed to Series A — the same deal flow infrastructure that top-tier startups use. No excuses. No lost leads.
            </p>
          </div>

          <div className="rounded-2xl p-6 border border-sky-500/[0.12]"
            style={{ background: "rgba(14,165,233,0.04)" }}>
            <p className="text-[11px] text-slate-600 uppercase tracking-widest mb-5">Live pipeline activity</p>
            <div className="flex flex-col">
              {[
                { action: "Deal moved to Term Sheet", investor: "Paradigm", time: "2m ago", color: "#0ea5e9" },
                { action: "New investor added", investor: "a16z Crypto", time: "15m ago", color: "#10b981" },
                { action: "Meeting scheduled", investor: "Coinbase Ventures", time: "1h ago", color: "#8b5cf6" },
                { action: "Round closed", investor: "Multicoin Capital", time: "3h ago", color: "#f59e0b" },
              ].map((a, i, arr) => (
                <div key={i} className={`flex items-center gap-3 py-3 ${i < arr.length - 1 ? "border-b border-white/[0.04]" : ""}`}>
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: a.color, boxShadow: `0 0 8px ${a.color}` }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-slate-200 font-medium">{a.action}</p>
                    <p className="text-[11px] text-slate-600">{a.investor}</p>
                  </div>
                  <span className="text-[11px] text-slate-700 shrink-0">{a.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="border-t border-white/[0.05] relative z-10 py-16 md:py-20">
        <div className="max-w-5xl mx-auto px-5 md:px-16">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium text-sky-400 border border-sky-500/20 mb-4"
              style={{ background: "rgba(14,165,233,0.08)" }}>What we believe</div>
            <h2 className="text-[clamp(28px,4vw,42px)] font-bold tracking-tight text-white">Our values</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {values.map((v, i) => (
              <div key={i} className="rounded-2xl p-6 border border-white/[0.06] hover:border-sky-500/20 transition-all"
                style={{ background: "rgba(255,255,255,0.02)" }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl border border-sky-500/15 mb-4"
                  style={{ background: "rgba(14,165,233,0.08)" }}>{v.icon}</div>
                <h3 className="text-[15px] font-semibold text-white mb-2">{v.title}</h3>
                <p className="text-[13px] text-slate-500 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TEAM */}
      <section className="border-t border-white/[0.05] relative z-10 py-16 md:py-20">
        <div className="max-w-5xl mx-auto px-5 md:px-16">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium text-sky-400 border border-sky-500/20 mb-4"
              style={{ background: "rgba(14,165,233,0.08)" }}>The team</div>
            <h2 className="text-[clamp(28px,4vw,42px)] font-bold tracking-tight text-white leading-tight">
              The people behind{" "}
              <span style={{ background: "linear-gradient(135deg,#fff 0%,#0ea5e9 50%,#38bdf8 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                FundFlow
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {team.map((member, i) => (
              <div key={i} className="rounded-2xl p-6 border border-white/[0.06] hover:-translate-y-1 transition-all"
                style={{ background: "rgba(255,255,255,0.02)" }}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold mb-5"
                  style={{ background: `${member.color}15`, border: `1px solid ${member.color}30`, color: member.color }}>
                  {member.initial}
                </div>
                <h3 className="text-[17px] font-bold text-white tracking-tight mb-1">{member.name}</h3>
                <p className="text-[11px] font-semibold uppercase tracking-widest mb-4" style={{ color: member.color }}>{member.role}</p>
                <p className="text-[13px] text-slate-500 leading-relaxed mb-4">{member.bio}</p>
                <p className="text-[12px] text-slate-700 font-mono">{member.handle}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-5 md:px-16 pb-20 md:pb-28">
        <div className="max-w-3xl mx-auto text-center rounded-2xl p-10 md:p-16 border border-sky-500/[0.15] relative overflow-hidden"
          style={{ background: "rgba(14,165,233,0.05)" }}>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[250px] pointer-events-none rounded-full blur-[60px]"
            style={{ background: "radial-gradient(ellipse, rgba(14,165,233,0.1), transparent 70%)" }} />
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium text-sky-400 border border-sky-500/20 mb-6 relative"
            style={{ background: "rgba(14,165,233,0.08)" }}>Ready to start?</div>
          <h2 className="text-[clamp(28px,4vw,48px)] font-bold text-white tracking-tight leading-tight mb-4 relative">
            Join the founders<br />
            <span style={{ background: "linear-gradient(135deg,#fff 0%,#0ea5e9 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              closing deals on FundFlow.
            </span>
          </h2>
          <p className="text-slate-500 mb-8 text-[15px] relative">Free to start. No credit card required. Set up in minutes.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center relative">
            <Link href="/register"
              className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-[15px] font-semibold text-white no-underline hover:-translate-y-px transition-all"
              style={{ background: "linear-gradient(135deg, #0ea5e9, #0284c7)" }}>
              Start for free <RiArrowRightLine size={16} />
            </Link>
            <Link href="/#features"
              className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-[15px] font-medium text-slate-400 border border-white/[0.08] hover:bg-white/5 hover:text-slate-200 transition-all no-underline">
              See features
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/[0.04] relative z-10 px-5 md:px-16 py-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md flex items-center justify-center text-[9px] font-black text-white"
              style={{ background: "linear-gradient(135deg, #0ea5e9, #0284c7)" }}>FF</div>
            <span className="text-sm font-semibold text-slate-700">FundFlow</span>
          </div>
          <span className="text-xs text-slate-700">© 2026 FundFlow. Built for Web3 founders.</span>
          <div className="flex items-center gap-1.5 text-xs text-sky-500">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
            All systems operational
          </div>
        </div>
      </footer>
    </main>
  )
}