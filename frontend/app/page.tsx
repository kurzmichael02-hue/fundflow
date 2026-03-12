"use client"
import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import {
  RiDashboardLine,
  RiUserLine,
  RiFlowChart,
  RiShieldLine,
  RiGlobalLine,
  RiTeamLine,
  RiCheckLine,
  RiArrowRightLine,
  RiMenuLine,
  RiCloseLine,
  RiPlayCircleLine,
} from "react-icons/ri"

const TYPING_PHRASES = [
  "Investor CRM",
  "built for Web3.",
  "Deal Flow OS.",
  "Fundraising Hub.",
]

const INVESTORS = [
  { name: "Andreessen Horowitz", company: "a16z Crypto", stage: "Term Sheet", amount: "$12M", color: "#0ea5e9" },
  { name: "Paradigm", company: "Crypto VC", stage: "Meeting", amount: "$8M", color: "#f59e0b" },
  { name: "Sequoia Capital", company: "Multi-stage", stage: "Interested", amount: "$5M", color: "#8b5cf6" },
  { name: "Coinbase Ventures", company: "Strategic", stage: "Closed", amount: "$2.4M", color: "#10b981" },
  { name: "Multicoin Capital", company: "Web3 Fund", stage: "Outreach", amount: "TBD", color: "#6b7280" },
]

const STAGE_COLORS: Record<string, string> = {
  "Term Sheet": "#0ea5e9",
  "Meeting": "#f59e0b",
  "Interested": "#8b5cf6",
  "Closed": "#10b981",
  "Outreach": "#6b7280",
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [visible, setVisible] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  // Typing animation
  const [typedText, setTypedText] = useState("")
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const typingRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setTimeout(() => setVisible(true), 100)
    setIsLoggedIn(!!localStorage.getItem("token"))
    const m = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY })
    window.addEventListener("mousemove", m)
    return () => window.removeEventListener("mousemove", m)
  }, [])

  useEffect(() => {
    const current = TYPING_PHRASES[phraseIndex]
    let speed = isDeleting ? 40 : 80

    if (!isDeleting && charIndex === current.length) {
      typingRef.current = setTimeout(() => setIsDeleting(true), 2000)
      return
    }
    if (isDeleting && charIndex === 0) {
      setIsDeleting(false)
      setPhraseIndex((i) => (i + 1) % TYPING_PHRASES.length)
      return
    }

    typingRef.current = setTimeout(() => {
      setTypedText(current.substring(0, isDeleting ? charIndex - 1 : charIndex + 1))
      setCharIndex((i) => (isDeleting ? i - 1 : i + 1))
    }, speed)

    return () => { if (typingRef.current) clearTimeout(typingRef.current) }
  }, [charIndex, isDeleting, phraseIndex])

  const navLinks = [
    { label: "Pricing", href: "#pricing" },
    { label: "About", href: "/about" },
  ]

  return (
    <main className="bg-[#04070f] min-h-screen overflow-x-hidden text-slate-200">
      {/* Noise overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`
        }}
      />

      {/* Ambient glow */}
      <div className="fixed top-[10%] left-[30%] w-[600px] h-[600px] pointer-events-none z-0 rounded-full blur-[60px]"
        style={{ background: "radial-gradient(circle, rgba(14,165,233,0.07) 0%, transparent 70%)" }} />
      <div className="fixed bottom-[10%] right-[10%] w-[400px] h-[400px] pointer-events-none z-0 rounded-full blur-[60px]"
        style={{ background: "radial-gradient(circle, rgba(56,189,248,0.05) 0%, transparent 70%)" }} />

      {/* Mouse glow desktop only */}
      <div
        className="fixed w-[500px] h-[500px] rounded-full pointer-events-none z-0 blur-[30px] hidden md:block"
        style={{
          background: "radial-gradient(circle, rgba(14,165,233,0.05) 0%, transparent 70%)",
          left: mousePos.x,
          top: mousePos.y,
          transform: "translate(-50%, -50%)",
          transition: "left 0.15s ease, top 0.15s ease",
        }}
      />

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center border-b border-white/5"
        style={{ background: "rgba(4,7,15,0.85)", backdropFilter: "blur(24px)" }}>
        <div className="w-full max-w-6xl mx-auto px-6 md:px-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 no-underline">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-black text-white shrink-0"
              style={{ background: "linear-gradient(135deg, #0ea5e9, #0284c7)" }}>FF</div>
            <span className="text-[17px] font-bold text-white tracking-tight">FundFlow</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(l => (
              <a key={l.label} href={l.href}
                className="text-slate-500 text-sm font-medium hover:text-slate-200 transition-colors no-underline">
                {l.label}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2.5">
            {isLoggedIn ? (
              <Link href="/dashboard"
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white no-underline"
                style={{ background: "linear-gradient(135deg, #0ea5e9, #0284c7)" }}>
                Dashboard <RiArrowRightLine />
              </Link>
            ) : (
              <>
                <Link href="/login"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-slate-400 border border-white/[0.07] hover:text-slate-200 hover:bg-white/5 transition-all no-underline">
                  Login
                </Link>
                <Link href="/register"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white no-underline transition-all hover:-translate-y-px"
                  style={{ background: "linear-gradient(135deg, #0ea5e9, #0284c7)" }}>
                  Get started <RiArrowRightLine />
                </Link>
              </>
            )}
          </div>

          {/* Hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg border border-white/[0.08] text-slate-400 hover:text-slate-200 transition-colors bg-transparent cursor-pointer"
          >
            {menuOpen ? <RiCloseLine size={20} /> : <RiMenuLine size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="fixed top-16 left-0 right-0 z-40 border-b border-white/[0.06] md:hidden"
          style={{ background: "rgba(4,7,15,0.98)", backdropFilter: "blur(24px)" }}>
          <div className="flex flex-col px-6 py-4 gap-1">
            {navLinks.map(l => (
              <a key={l.label} href={l.href}
                onClick={() => setMenuOpen(false)}
                className="text-slate-400 text-base font-medium py-3 border-b border-white/[0.04] hover:text-slate-200 transition-colors no-underline">
                {l.label}
              </a>
            ))}
            <div className="flex gap-2.5 mt-3">
              <Link href="/login" onClick={() => setMenuOpen(false)}
                className="flex-1 text-center py-3 rounded-lg text-sm font-medium text-slate-400 border border-white/[0.08] hover:bg-white/5 transition-all no-underline">
                Login
              </Link>
              <Link href="/register" onClick={() => setMenuOpen(false)}
                className="flex-1 text-center py-3 rounded-lg text-sm font-semibold text-white no-underline"
                style={{ background: "linear-gradient(135deg, #0ea5e9, #0284c7)" }}>
                Get started
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* HERO */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 md:px-16 pt-36 md:pt-40 pb-16 md:pb-24"
        style={{ opacity: visible ? 1 : 0, transition: "opacity 0.5s ease" }}>
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium text-sky-400 border border-sky-500/20 mb-7"
            style={{ background: "rgba(14,165,233,0.08)" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
            Now in beta — free to start
          </div>

          <h1 className="text-[clamp(40px,6vw,80px)] font-bold tracking-[-0.04em] leading-[1.05] text-white mb-6">
            The{" "}
            <span style={{
              background: "linear-gradient(135deg, #ffffff 0%, #0ea5e9 50%, #38bdf8 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              {typedText}
            </span>
            <span className="inline-block w-0.5 h-[0.85em] bg-sky-400 ml-1 align-bottom"
              style={{ animation: "blink 1s step-end infinite" }} />
          </h1>

          <p className="text-base md:text-lg text-slate-500 leading-relaxed max-w-lg mb-9">
            FundFlow gives Web3 founders one place to manage every investor relationship — track conversations, move deals through your pipeline, and close your round faster.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mb-12">
            <Link href="/register"
              className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-[15px] font-semibold text-white no-underline transition-all hover:-translate-y-px hover:shadow-[0_12px_32px_rgba(14,165,233,0.35)]"
              style={{ background: "linear-gradient(135deg, #0ea5e9, #0284c7)" }}>
              Start for free <RiArrowRightLine size={16} />
            </Link>
            <Link href="/login"
              className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-[15px] font-medium text-slate-400 border border-white/[0.08] hover:bg-white/5 hover:text-slate-200 transition-all no-underline">
              <RiPlayCircleLine size={16} /> View demo
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex">
              {["#0ea5e9", "#8b5cf6", "#10b981", "#f59e0b"].map((c, i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-[#04070f]"
                  style={{ background: c, marginLeft: i > 0 ? -10 : 0 }} />
              ))}
            </div>
            <p className="text-sm text-slate-500">
              <span className="text-slate-200 font-semibold">2,400+ founders</span> track their pipeline on FundFlow
            </p>
          </div>
        </div>

        {/* Dashboard mockup */}
        <div className="mt-16 rounded-2xl overflow-hidden border border-white/[0.07] shadow-[0_40px_100px_rgba(0,0,0,0.5)]"
          style={{ background: "rgba(255,255,255,0.02)" }}>
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5"
            style={{ background: "rgba(255,255,255,0.02)" }}>
            {["#ff5f57", "#ffbd2e", "#28ca41"].map((c, i) => (
              <div key={i} className="w-2.5 h-2.5 rounded-full opacity-70" style={{ background: c }} />
            ))}
            <p className="flex-1 text-center text-[11px] text-slate-600 font-mono">app.fundflow.io/dashboard</p>
          </div>

          <div className="p-4 md:p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
              {[
                { label: "Total Investors", val: "47", delta: "+12 this week", icon: <RiUserLine size={13} /> },
                { label: "Active Leads", val: "23", delta: "+5 today", icon: <RiDashboardLine size={13} /> },
                { label: "Meetings", val: "8", delta: "3 this week", icon: <RiTeamLine size={13} /> },
                { label: "Deals Closed", val: "4", delta: "$22.4M raised", icon: <RiCheckLine size={13} /> },
              ].map(s => (
                <div key={s.label} className="rounded-xl p-3.5 border border-white/[0.06]"
                  style={{ background: "rgba(255,255,255,0.03)" }}>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-600 uppercase tracking-widest mb-2">
                    <span className="text-sky-500/60">{s.icon}</span>
                    {s.label}
                  </div>
                  <div className="text-2xl font-bold text-white tracking-tight mb-1">{s.val}</div>
                  <div className="text-[11px] text-sky-400">{s.delta}</div>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-slate-600 uppercase tracking-widest mb-3">Recent Investors</p>
            <div className="flex flex-col gap-2">
              {INVESTORS.map(inv => (
                <div key={inv.name}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl border border-white/5 transition-all hover:border-sky-500/15"
                  style={{ background: "rgba(255,255,255,0.02)" }}>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                      style={{ background: `${inv.color}20`, border: `1px solid ${inv.color}40`, color: inv.color }}>
                      {inv.name[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] text-slate-200 font-medium truncate">{inv.name}</p>
                      <p className="text-[11px] text-slate-600">{inv.amount}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium shrink-0"
                    style={{
                      background: `${STAGE_COLORS[inv.stage]}15`,
                      color: STAGE_COLORS[inv.stage],
                      border: `1px solid ${STAGE_COLORS[inv.stage]}30`
                    }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: STAGE_COLORS[inv.stage] }} />
                    {inv.stage}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="overflow-hidden py-6 border-t border-b border-white/[0.04] relative z-10">
        <div className="flex gap-12 whitespace-nowrap" style={{ animation: "scroll-x 25s linear infinite" }}>
          {[...Array(2)].map((_, ri) =>
            ["Investor CRM", "Pipeline Tracking", "Deal Flow Analytics", "Web3 Native", "Secure & Private", "Real-time Dashboard", "Investor Network"].map((item, i) => (
              <span key={`${ri}-${i}`} className="text-[12px] text-slate-800 font-semibold tracking-widest uppercase flex items-center gap-12">
                {item} <span className="text-sky-500 text-[7px]">●</span>
              </span>
            ))
          )}
        </div>
      </div>

      {/* FEATURES */}
      <section id="features" className="relative z-10 max-w-6xl mx-auto px-6 md:px-16 py-20 md:py-24">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium text-sky-400 border border-sky-500/20 mb-4"
            style={{ background: "rgba(14,165,233,0.08)" }}>
            Features
          </div>
          <h2 className="text-[clamp(28px,4vw,44px)] font-bold text-white tracking-tight leading-tight">
            Everything you need to{" "}
            <span style={{
              background: "linear-gradient(135deg, #ffffff 0%, #0ea5e9 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>close your round faster</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: <RiUserLine size={18} />, title: "Investor CRM", desc: "Track every investor, their status, notes, and next steps in one clean view." },
            { icon: <RiFlowChart size={18} />, title: "Kanban Pipeline", desc: "Visualize your entire deal flow. Move investors from Outreach to Closed in one click." },
            { icon: <RiDashboardLine size={18} />, title: "Live Dashboard", desc: "Real-time metrics on your fundraise. Know exactly where your round stands." },
            { icon: <RiGlobalLine size={18} />, title: "Web3 Native", desc: "Built for crypto founders. Token rounds, SAFTs, and wallet login — all supported." },
            { icon: <RiTeamLine size={18} />, title: "Investor Network", desc: "Discover investors actively deploying capital into Web3 projects like yours." },
            { icon: <RiShieldLine size={18} />, title: "Enterprise Security", desc: "Your deal flow is your moat. Bank-grade encryption keeps it locked down." },
          ].map(f => (
            <div key={f.title}
              className="group rounded-2xl p-6 border border-white/[0.06] transition-all duration-300 hover:border-sky-500/20 hover:-translate-y-1 cursor-default"
              style={{ background: "rgba(255,255,255,0.02)" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sky-400 border border-sky-500/20 mb-4 group-hover:border-sky-500/40 transition-colors"
                style={{ background: "rgba(14,165,233,0.08)" }}>
                {f.icon}
              </div>
              <h3 className="text-[15px] font-semibold text-white mb-2 tracking-tight">{f.title}</h3>
              <p className="text-[13px] text-slate-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* STATS BAR */}
      <div className="border-t border-b border-white/5 relative z-10" style={{ background: "rgba(255,255,255,0.01)" }}>
        <div className="max-w-6xl mx-auto px-6 md:px-16 py-12 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0">
          {[
            { num: "2,400+", label: "Founders on platform" },
            { num: "$840M", label: "Funding tracked" },
            { num: "94%", label: "Faster deal flow" },
            { num: "99.9%", label: "Uptime SLA" },
          ].map((s, i) => (
            <div key={i} className="text-center md:border-r border-white/5 md:last:border-r-0 px-4">
              <div className="text-[36px] md:text-[44px] font-bold tracking-tight leading-none mb-2"
                style={{
                  background: "linear-gradient(135deg, #fff, #0ea5e9)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}>
                {s.num}
              </div>
              <p className="text-sm text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* PRICING */}
      <section id="pricing" className="relative z-10 max-w-4xl mx-auto px-6 md:px-16 py-20 md:py-24">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium text-sky-400 border border-sky-500/20 mb-4"
            style={{ background: "rgba(14,165,233,0.08)" }}>
            Pricing
          </div>
          <h2 className="text-[clamp(28px,4vw,44px)] font-bold text-white tracking-tight">
            Simple,{" "}
            <span style={{
              background: "linear-gradient(135deg, #ffffff 0%, #0ea5e9 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>transparent pricing</span>
          </h2>
          <p className="text-slate-500 mt-3 text-[15px]">Start free. Upgrade when you&apos;re ready to scale.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              name: "Starter", price: "Free", period: "forever",
              desc: "Perfect for early-stage fundraising",
              features: ["Up to 25 investors", "Full pipeline view", "Basic analytics", "Email support"],
              cta: "Get started free", featured: false
            },
            {
              name: "Pro", price: "$99", period: "/month",
              desc: "For founders closing serious rounds",
              features: ["Unlimited investors", "Advanced analytics", "Investor network access", "API access", "Priority support"],
              cta: "Start 14-day trial", featured: true
            }
          ].map(plan => (
            <div key={plan.name}
              className={`rounded-2xl p-8 border transition-all hover:-translate-y-1 ${plan.featured
                ? "border-sky-500/30 shadow-[0_0_60px_rgba(14,165,233,0.1)]"
                : "border-white/[0.07]"
                }`}
              style={{ background: plan.featured ? "rgba(14,165,233,0.06)" : "rgba(255,255,255,0.02)" }}>
              {plan.featured && (
                <p className="text-[11px] text-sky-400 font-semibold tracking-widest uppercase mb-3">Most Popular</p>
              )}
              <p className="text-base font-semibold text-white mb-2">{plan.name}</p>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-[42px] font-bold text-white tracking-tight">{plan.price}</span>
                <span className="text-sm text-slate-500">{plan.period}</span>
              </div>
              <p className="text-sm text-slate-500 mb-6">{plan.desc}</p>
              <div className="flex flex-col gap-3 mb-7">
                {plan.features.map(f => (
                  <div key={f} className="flex items-center gap-2.5 text-sm text-slate-400">
                    <RiCheckLine size={15} className="text-sky-400 shrink-0" /> {f}
                  </div>
                ))}
              </div>
              <Link href="/register"
                className={`block text-center py-3 px-6 rounded-xl text-sm font-semibold no-underline transition-all ${plan.featured
                  ? "text-white hover:shadow-[0_12px_32px_rgba(14,165,233,0.35)] hover:-translate-y-px"
                  : "text-slate-400 border border-white/[0.08] hover:bg-white/5 hover:text-slate-200"
                  }`}
                style={plan.featured ? { background: "linear-gradient(135deg, #0ea5e9, #0284c7)" } : {}}>
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 md:px-16 pb-24">
        <div className="text-center rounded-2xl p-12 md:p-16 border border-sky-500/15 relative overflow-hidden"
          style={{ background: "rgba(14,165,233,0.05)" }}>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[250px] pointer-events-none rounded-full blur-[60px]"
            style={{ background: "radial-gradient(ellipse, rgba(14,165,233,0.1), transparent 70%)" }} />
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium text-sky-400 border border-sky-500/20 mb-6 relative"
            style={{ background: "rgba(14,165,233,0.08)" }}>
            Ready to close?
          </div>
          <h2 className="text-[clamp(28px,4vw,48px)] font-bold text-white tracking-tight leading-tight mb-4 relative">
            Start tracking your{" "}
            <span style={{
              background: "linear-gradient(135deg, #ffffff 0%, #0ea5e9 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>investors today.</span>
          </h2>
          <p className="text-slate-500 mb-8 text-[15px] relative">
            Join 2,400+ Web3 founders who closed their round with FundFlow.
          </p>
          <Link href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-[15px] font-semibold text-white no-underline transition-all hover:-translate-y-px hover:shadow-[0_12px_32px_rgba(14,165,233,0.35)] relative"
            style={{ background: "linear-gradient(135deg, #0ea5e9, #0284c7)" }}>
            Start for free — no credit card <RiArrowRightLine size={16} />
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/[0.04] relative z-10">
        <div className="max-w-6xl mx-auto px-6 md:px-16 py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
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

      <style>{`
        @keyframes scroll-x {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </main>
  )
}