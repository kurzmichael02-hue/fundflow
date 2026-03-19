"use client"
import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import {
  RiDashboardLine, RiUserLine, RiFlowChart, RiShieldLine,
  RiGlobalLine, RiTeamLine, RiCheckLine, RiArrowRightLine,
  RiMenuLine, RiCloseLine, RiAddLine, RiSubtractLine,
} from "react-icons/ri"

const PIPELINE = [
  { label: "Outreach", color: "#6b7280", investors: ["Paradigm", "Multicoin"] },
  { label: "Meeting", color: "#f59e0b", investors: ["a16z Crypto"] },
  { label: "Term Sheet", color: "#10b981", investors: ["Coinbase Ventures"] },
]

const FAQS = [
  { q: "Is FundFlow really free to start?", a: "Yes — the Starter plan is completely free, no credit card required. You get up to 25 investors, full pipeline access, and basic analytics. Upgrade to Pro whenever you need more." },
  { q: "What's the difference between Free and Pro?", a: "The Free plan is limited to 25 investors. Pro gives you unlimited investors, advanced analytics, full investor network access, and priority support for $99/month." },
  { q: "Can I cancel my Pro subscription anytime?", a: "Yes, you can cancel anytime from your billing portal with one click. No contracts, no cancellation fees. Your account stays active until the end of the billing period." },
  { q: "Is my fundraising data secure?", a: "Yes. All data is stored on Supabase infrastructure hosted in the EU (Frankfurt) with encryption at rest and in transit. We never sell or share your data with third parties." },
  { q: "What is the Investor Portal?", a: "The Investor Portal is a separate login for VCs and investors. They can register, browse active deals from founders on the platform, and express interest directly — connecting both sides of the fundraising process." },
  { q: "Do you support Web3 / crypto payments?", a: "We currently accept card payments, PayPal, Google Pay, and SEPA via Stripe. Native crypto payments are on our roadmap." },
]

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("token"))
    const m = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY })
    window.addEventListener("mousemove", m)
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("animate-in"); observer.unobserve(e.target) } }),
      { threshold: 0.1 }
    )
    document.querySelectorAll(".scroll-reveal").forEach(el => observer.observe(el))
    return () => { window.removeEventListener("mousemove", m); observer.disconnect() }
  }, [])

  return (
    <main className="min-h-screen overflow-x-hidden text-slate-200" style={{ background: "#050508", fontFamily: "'Syne', sans-serif" }}>

      {/* Syne font */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        * { font-family: 'DM Sans', sans-serif; }
        h1, h2, h3, .syne { font-family: 'Syne', sans-serif; }
        .scroll-reveal { opacity: 0; transform: translateY(32px); transition: opacity 0.7s ease, transform 0.7s ease; }
        .scroll-reveal.animate-in { opacity: 1; transform: translateY(0); }
        @keyframes scroll-x { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-8px); } }
        @keyframes glow-pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.7; } }
        .card-hover { transition: transform 0.3s ease, border-color 0.3s ease; }
        .card-hover:hover { transform: translateY(-4px); }
      `}</style>

      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div style={{ position: "absolute", top: "-10%", left: "20%", width: "600px", height: "600px", borderRadius: "50%", background: "radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)", filter: "blur(60px)", animation: "glow-pulse 6s ease-in-out infinite" }} />
        <div style={{ position: "absolute", bottom: "10%", right: "10%", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(14,165,233,0.05) 0%, transparent 70%)", filter: "blur(60px)" }} />
        <div style={{ position: "fixed", width: "400px", height: "400px", borderRadius: "50%", pointerEvents: "none", background: "radial-gradient(circle, rgba(16,185,129,0.04) 0%, transparent 70%)", filter: "blur(40px)", left: mousePos.x, top: mousePos.y, transform: "translate(-50%, -50%)", transition: "left 0.2s ease, top 0.2s ease" }} className="hidden md:block" />
        {/* Grain */}
        <div style={{ position: "absolute", inset: 0, opacity: 0.03, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />
      </div>

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center"
        style={{ background: "rgba(5,5,8,0.8)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
        <div className="w-full max-w-6xl mx-auto px-6 md:px-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 no-underline">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-black text-white"
              style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}>FF</div>
            <span className="text-[17px] font-bold text-white syne tracking-tight">FundFlow</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            {[{ label: "Pricing", href: "#pricing" }, { label: "FAQ", href: "#faq" }, { label: "About", href: "/about" }].map(l => (
              <a key={l.label} href={l.href} className="text-sm font-medium no-underline transition-colors" style={{ color: "#64748b", fontFamily: "'DM Sans', sans-serif" }}
                onMouseEnter={e => (e.target as HTMLElement).style.color = "#e2e8f0"}
                onMouseLeave={e => (e.target as HTMLElement).style.color = "#64748b"}>
                {l.label}
              </a>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-2.5">
            {isLoggedIn ? (
              <Link href="/dashboard" className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white no-underline"
                style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}>
                Dashboard <RiArrowRightLine />
              </Link>
            ) : (
              <>
                <Link href="/login" className="px-4 py-2 rounded-lg text-sm font-medium text-slate-400 no-underline transition-all"
                  style={{ border: "1px solid rgba(255,255,255,0.07)" }}
                  onMouseEnter={e => { (e.target as HTMLElement).style.color = "#e2e8f0"; (e.target as HTMLElement).style.background = "rgba(255,255,255,0.04)" }}
                  onMouseLeave={e => { (e.target as HTMLElement).style.color = "#94a3b8"; (e.target as HTMLElement).style.background = "transparent" }}>
                  Login
                </Link>
                <Link href="/register" className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white no-underline transition-all"
                  style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}>
                  Get started <RiArrowRightLine />
                </Link>
              </>
            )}
          </div>
          <button onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg bg-transparent cursor-pointer"
            style={{ border: "1px solid rgba(255,255,255,0.08)", color: "#94a3b8" }}>
            {menuOpen ? <RiCloseLine size={20} /> : <RiMenuLine size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="fixed top-16 left-0 right-0 z-40 md:hidden" style={{ background: "rgba(5,5,8,0.98)", backdropFilter: "blur(24px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex flex-col px-6 py-4 gap-1">
            {[{ label: "Pricing", href: "#pricing" }, { label: "FAQ", href: "#faq" }, { label: "About", href: "/about" }].map(l => (
              <a key={l.label} href={l.href} onClick={() => setMenuOpen(false)}
                className="text-slate-400 text-base font-medium py-3 no-underline" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                {l.label}
              </a>
            ))}
            <div className="flex gap-2.5 mt-3">
              <Link href="/login" onClick={() => setMenuOpen(false)} className="flex-1 text-center py-3 rounded-lg text-sm font-medium text-slate-400 no-underline" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>Login</Link>
              <Link href="/register" onClick={() => setMenuOpen(false)} className="flex-1 text-center py-3 rounded-lg text-sm font-semibold text-white no-underline" style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}>Get started</Link>
            </div>
          </div>
        </div>
      )}

      {/* HERO */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 md:px-16 pt-36 md:pt-44 pb-16 md:pb-24">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium mb-8"
            style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", color: "#34d399" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Now in beta — free to start
          </div>

          <h1 className="syne font-black text-white mb-6 leading-[1.0]"
            style={{ fontSize: "clamp(44px,7vw,88px)", letterSpacing: "-0.04em" }}>
            Stop losing deals to{" "}
            <span style={{ display: "block", background: "linear-gradient(135deg, #10b981 0%, #34d399 50%, #6ee7b7 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              bad tracking.
            </span>
          </h1>

          <p className="text-slate-500 leading-relaxed mb-10 max-w-lg" style={{ fontSize: "17px", fontFamily: "'DM Sans', sans-serif", fontWeight: 300 }}>
            FundFlow is the investor CRM built for Web3 founders. Track every conversation, manage your pipeline, and close your round — all in one place.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mb-14">
            <Link href="/register"
              className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-white no-underline transition-all"
              style={{ background: "linear-gradient(135deg, #10b981, #059669)", fontSize: "15px", boxShadow: "0 0 40px rgba(16,185,129,0.2)" }}
              onMouseEnter={e => (e.target as HTMLElement).style.boxShadow = "0 0 60px rgba(16,185,129,0.35)"}
              onMouseLeave={e => (e.target as HTMLElement).style.boxShadow = "0 0 40px rgba(16,185,129,0.2)"}>
              Start for free <RiArrowRightLine size={16} />
            </Link>
            <Link href="/investor"
              className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-medium text-slate-400 no-underline transition-all"
              style={{ border: "1px solid rgba(255,255,255,0.08)", fontSize: "15px" }}
              onMouseEnter={e => { (e.target as HTMLElement).style.background = "rgba(255,255,255,0.04)"; (e.target as HTMLElement).style.color = "#e2e8f0" }}
              onMouseLeave={e => { (e.target as HTMLElement).style.background = "transparent"; (e.target as HTMLElement).style.color = "#94a3b8" }}>
              Investor Portal →
            </Link>
          </div>
        </div>

        {/* Pipeline Visual */}
        <div className="relative" style={{ animation: "float 6s ease-in-out infinite" }}>
          <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", boxShadow: "0 40px 100px rgba(0,0,0,0.6)" }}>
            {/* Browser bar */}
            <div className="flex items-center gap-2 px-4 py-3" style={{ background: "rgba(255,255,255,0.02)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              {["#ff5f57", "#ffbd2e", "#28ca41"].map((c, i) => <div key={i} className="w-2.5 h-2.5 rounded-full opacity-70" style={{ background: c }} />)}
              <p className="flex-1 text-center text-[11px] font-mono" style={{ color: "#334155" }}>app.fundflow.io/pipeline</p>
            </div>
            {/* Kanban */}
            <div className="p-5 md:p-6">
              <div className="flex items-center justify-between mb-5">
                <p className="syne font-bold text-white text-sm">Deal Pipeline</p>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.15)" }}>
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[11px] font-medium" style={{ color: "#34d399" }}>Live</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {PIPELINE.map((col) => (
                  <div key={col.label} className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.02)", border: `1px solid rgba(255,255,255,0.05)`, borderTop: `2px solid ${col.color}` }}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-semibold syne" style={{ color: col.color }}>{col.label}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: `${col.color}15`, color: col.color }}>{col.investors.length}</span>
                    </div>
                    <div className="flex flex-col gap-2">
                      {col.investors.map(inv => (
                        <div key={inv} className="rounded-lg px-2.5 py-2" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0"
                              style={{ background: `${col.color}25`, color: col.color }}>
                              {inv[0]}
                            </div>
                            <span className="text-[11px] font-medium truncate" style={{ color: "#cbd5e1" }}>{inv}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3 mt-4">
                {[
                  { label: "Total Investors", value: "47", color: "#38bdf8" },
                  { label: "Active Leads", value: "23", color: "#a78bfa" },
                  { label: "Deals Closed", value: "4", color: "#34d399" },
                ].map(s => (
                  <div key={s.label} className="rounded-xl p-3 text-center" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div className="syne font-bold text-white text-lg" style={{ color: s.color }}>{s.value}</div>
                    <div className="text-[10px] mt-0.5" style={{ color: "#475569" }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="overflow-hidden py-5 relative z-10" style={{ borderTop: "1px solid rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
        <div className="flex gap-12 whitespace-nowrap" style={{ animation: "scroll-x 25s linear infinite" }}>
          {[...Array(2)].map((_, ri) =>
            ["Investor CRM", "Pipeline Tracking", "Deal Flow", "Web3 Native", "Real-time Dashboard", "Investor Network", "Secure & Private"].map((item, i) => (
              <span key={`${ri}-${i}`} className="text-[11px] font-semibold tracking-widest uppercase flex items-center gap-12" style={{ color: "#1e293b" }}>
                {item} <span style={{ color: "#10b981", fontSize: "6px" }}>◆</span>
              </span>
            ))
          )}
        </div>
      </div>

      {/* HOW IT WORKS */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 md:px-16 py-20 md:py-28">
        <div className="text-center mb-16 scroll-reveal">
          <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#10b981", fontFamily: "'DM Sans', sans-serif" }}>How it works</p>
          <h2 className="syne font-black text-white" style={{ fontSize: "clamp(28px,4vw,48px)", letterSpacing: "-0.03em" }}>
            Three steps to close faster
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { step: "01", title: "Add your investors", desc: "Import or manually add every investor. Set status, deal size, notes — everything in one place.", color: "#10b981" },
            { step: "02", title: "Track your pipeline", desc: "Kanban board from Outreach to Closed. See your round progress update in real time.", color: "#38bdf8" },
            { step: "03", title: "Get inbound interest", desc: "Publish your project. Let VCs discover you and express interest directly through the portal.", color: "#a78bfa" },
          ].map((item, i) => (
            <div key={item.step} className="scroll-reveal card-hover rounded-2xl p-7 relative overflow-hidden"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", transitionDelay: `${i * 0.12}s` }}>
              <div className="syne font-black mb-5 leading-none select-none" style={{ fontSize: "72px", color: `${item.color}10`, letterSpacing: "-0.04em" }}>{item.step}</div>
              <h3 className="syne font-bold text-white mb-2" style={{ fontSize: "16px" }}>{item.title}</h3>
              <p style={{ fontSize: "13px", color: "#64748b", lineHeight: "1.7" }}>{item.desc}</p>
              <div className="absolute top-6 right-6 w-2 h-2 rounded-full" style={{ background: item.color, boxShadow: `0 0 8px ${item.color}` }} />
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="relative z-10 max-w-6xl mx-auto px-6 md:px-16 py-20 md:py-24" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <div className="text-center mb-16 scroll-reveal">
          <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#10b981" }}>Features</p>
          <h2 className="syne font-black text-white" style={{ fontSize: "clamp(28px,4vw,48px)", letterSpacing: "-0.03em" }}>
            Everything you need to<br />close your round
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
          ].map((f, i) => (
            <div key={f.title} className="scroll-reveal card-hover group rounded-2xl p-6"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", transitionDelay: `${i * 0.07}s` }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.15)", color: "#34d399" }}>
                {f.icon}
              </div>
              <h3 className="syne font-bold text-white mb-2" style={{ fontSize: "15px" }}>{f.title}</h3>
              <p style={{ fontSize: "13px", color: "#64748b", lineHeight: "1.7" }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="relative z-10 max-w-4xl mx-auto px-6 md:px-16 py-20 md:py-24" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <div className="text-center mb-14 scroll-reveal">
          <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#10b981" }}>Pricing</p>
          <h2 className="syne font-black text-white" style={{ fontSize: "clamp(28px,4vw,48px)", letterSpacing: "-0.03em" }}>Simple pricing</h2>
          <p className="mt-3" style={{ fontSize: "15px", color: "#64748b" }}>Start free. Upgrade when you&apos;re ready to scale.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { name: "Starter", price: "Free", period: "forever", desc: "For early-stage fundraising", features: ["Up to 25 investors", "Full pipeline view", "Basic analytics", "Email support"], cta: "Get started free", featured: false },
            { name: "Pro", price: "$99", period: "/month", desc: "For founders closing serious rounds", features: ["Unlimited investors", "Advanced analytics", "Investor network access", "API access", "Priority support"], cta: "Get started", featured: true }
          ].map((plan, i) => (
            <div key={plan.name} className="scroll-reveal card-hover rounded-2xl p-8"
              style={{
                background: plan.featured ? "rgba(16,185,129,0.05)" : "rgba(255,255,255,0.02)",
                border: plan.featured ? "1px solid rgba(16,185,129,0.2)" : "1px solid rgba(255,255,255,0.05)",
                boxShadow: plan.featured ? "0 0 60px rgba(16,185,129,0.08)" : "none",
                transitionDelay: `${i * 0.1}s`
              }}>
              {plan.featured && <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: "#10b981" }}>Most Popular</p>}
              <p className="syne font-bold text-white mb-2" style={{ fontSize: "16px" }}>{plan.name}</p>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="syne font-black text-white" style={{ fontSize: "44px", letterSpacing: "-0.03em" }}>{plan.price}</span>
                <span style={{ fontSize: "14px", color: "#64748b" }}>{plan.period}</span>
              </div>
              <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "24px" }}>{plan.desc}</p>
              <div className="flex flex-col gap-3 mb-7">
                {plan.features.map(f => (
                  <div key={f} className="flex items-center gap-2.5" style={{ fontSize: "14px", color: "#94a3b8" }}>
                    <RiCheckLine size={15} style={{ color: "#10b981", flexShrink: 0 }} /> {f}
                  </div>
                ))}
              </div>
              <Link href="/register"
                className="block text-center py-3 px-6 rounded-xl font-semibold no-underline transition-all"
                style={plan.featured
                  ? { background: "linear-gradient(135deg, #10b981, #059669)", color: "#fff", fontSize: "14px" }
                  : { border: "1px solid rgba(255,255,255,0.08)", color: "#94a3b8", fontSize: "14px" }}>
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="relative z-10 max-w-3xl mx-auto px-6 md:px-16 py-20 md:py-24" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <div className="text-center mb-14 scroll-reveal">
          <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#10b981" }}>FAQ</p>
          <h2 className="syne font-black text-white" style={{ fontSize: "clamp(28px,4vw,48px)", letterSpacing: "-0.03em" }}>Common questions</h2>
        </div>
        <div className="flex flex-col gap-2">
          {FAQS.map((faq, i) => (
            <div key={i} className="scroll-reveal rounded-2xl overflow-hidden transition-all"
              style={{
                background: openFaq === i ? "rgba(16,185,129,0.04)" : "rgba(255,255,255,0.02)",
                border: openFaq === i ? "1px solid rgba(16,185,129,0.15)" : "1px solid rgba(255,255,255,0.05)",
                transitionDelay: `${i * 0.04}s`
              }}>
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left cursor-pointer border-0 gap-4"
                style={{ background: "transparent" }}>
                <span className="syne font-semibold text-white" style={{ fontSize: "14px" }}>{faq.q}</span>
                <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: openFaq === i ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.05)", color: openFaq === i ? "#10b981" : "#64748b" }}>
                  {openFaq === i ? <RiSubtractLine size={13} /> : <RiAddLine size={13} />}
                </div>
              </button>
              {openFaq === i && (
                <div className="px-5 pb-5">
                  <p style={{ fontSize: "13px", color: "#64748b", lineHeight: "1.7" }}>{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 md:px-16 pb-24">
        <div className="scroll-reveal text-center rounded-2xl p-12 md:p-16 relative overflow-hidden"
          style={{ background: "rgba(16,185,129,0.04)", border: "1px solid rgba(16,185,129,0.12)" }}>
          <div className="absolute top-1/2 left-1/2 pointer-events-none rounded-full"
            style={{ width: "500px", height: "250px", transform: "translate(-50%, -50%)", background: "radial-gradient(ellipse, rgba(16,185,129,0.08), transparent 70%)", filter: "blur(40px)" }} />
          <p className="text-xs font-semibold uppercase tracking-widest mb-6 relative" style={{ color: "#10b981" }}>Ready to close?</p>
          <h2 className="syne font-black text-white mb-4 relative" style={{ fontSize: "clamp(28px,4vw,52px)", letterSpacing: "-0.03em", lineHeight: "1.05" }}>
            Start tracking your<br />investors today.
          </h2>
          <p className="mb-8 relative" style={{ fontSize: "15px", color: "#64748b" }}>Free to start. No credit card required.</p>
          <Link href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white no-underline relative transition-all"
            style={{ background: "linear-gradient(135deg, #10b981, #059669)", fontSize: "15px", boxShadow: "0 0 40px rgba(16,185,129,0.2)" }}>
            Start for free — no credit card <RiArrowRightLine size={16} />
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <div className="max-w-6xl mx-auto px-6 md:px-16 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-black text-white" style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}>FF</div>
                <span className="syne font-bold text-white" style={{ fontSize: "15px" }}>FundFlow</span>
              </div>
              <p style={{ fontSize: "12px", color: "#334155", lineHeight: "1.7", maxWidth: "200px" }}>The investor CRM built for Web3 founders. Close your round faster.</p>
              <div className="flex items-center gap-1.5 mt-4" style={{ fontSize: "12px", color: "#10b981" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                All systems operational
              </div>
            </div>
            <div>
              <p className="font-semibold uppercase tracking-widest mb-4" style={{ fontSize: "11px", color: "#334155" }}>Product</p>
              <div className="flex flex-col gap-2.5">
                {[{ label: "Home", href: "/" }, { label: "Pricing", href: "#pricing" }, { label: "FAQ", href: "#faq" }, { label: "About", href: "/about" }, { label: "Dashboard", href: "/dashboard" }].map(l => (
                  <a key={l.label} href={l.href} className="no-underline transition-colors" style={{ fontSize: "14px", color: "#475569" }}
                    onMouseEnter={e => (e.target as HTMLElement).style.color = "#e2e8f0"}
                    onMouseLeave={e => (e.target as HTMLElement).style.color = "#475569"}>
                    {l.label}
                  </a>
                ))}
              </div>
            </div>
            <div>
              <p className="font-semibold uppercase tracking-widest mb-4" style={{ fontSize: "11px", color: "#334155" }}>Investors</p>
              <div className="flex flex-col gap-2.5">
                {[{ label: "Investor Login", href: "/investor" }, { label: "Investor Register", href: "/investor/register" }, { label: "Deal Flow", href: "/investor/discover" }].map(l => (
                  <a key={l.label} href={l.href} className="no-underline transition-colors" style={{ fontSize: "14px", color: "#475569" }}
                    onMouseEnter={e => (e.target as HTMLElement).style.color = "#e2e8f0"}
                    onMouseLeave={e => (e.target as HTMLElement).style.color = "#475569"}>
                    {l.label}
                  </a>
                ))}
              </div>
            </div>
            <div>
              <p className="font-semibold uppercase tracking-widest mb-4" style={{ fontSize: "11px", color: "#334155" }}>Company</p>
              <div className="flex flex-col gap-2.5 mb-6">
                {[{ label: "Privacy Policy", href: "/privacy" }, { label: "Terms of Service", href: "/terms" }, { label: "Contact", href: "/contact" }].map(l => (
                  <a key={l.label} href={l.href} className="no-underline transition-colors" style={{ fontSize: "14px", color: "#475569" }}
                    onMouseEnter={e => (e.target as HTMLElement).style.color = "#e2e8f0"}
                    onMouseLeave={e => (e.target as HTMLElement).style.color = "#475569"}>
                    {l.label}
                  </a>
                ))}
              </div>
              <div className="flex items-center gap-3">
                {[
                  { href: "https://twitter.com/fundflow", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.213 5.567zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
                  { href: "https://t.me/fundflow", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.026 13.6l-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.832.959h.29z"/></svg> },
                  { href: "https://discord.gg/fundflow", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.032.055a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg> },
                ].map((s, i) => (
                  <a key={i} href={s.href} target="_blank" rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                    style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", color: "#475569" }}
                    onMouseEnter={e => { (e.target as HTMLElement).closest('a')!.style.color = "#e2e8f0"; (e.target as HTMLElement).closest('a')!.style.borderColor = "rgba(255,255,255,0.12)" }}
                    onMouseLeave={e => { (e.target as HTMLElement).closest('a')!.style.color = "#475569"; (e.target as HTMLElement).closest('a')!.style.borderColor = "rgba(255,255,255,0.06)" }}>
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
          <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-3" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
            <span style={{ fontSize: "12px", color: "#1e293b" }}>© 2026 FundFlow. All rights reserved.</span>
            <span style={{ fontSize: "12px", color: "#1e293b" }}>Built for Web3 founders.</span>
          </div>
        </div>
      </footer>

    </main>
  )
}
