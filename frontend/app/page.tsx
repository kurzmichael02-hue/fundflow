"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import {
  RiCheckLine, RiArrowRightLine,
  RiMenuLine, RiCloseLine, RiAddLine, RiSubtractLine,
  RiWallet3Line, RiQrCodeLine, RiPencilLine,
  RiFlashlightLine, RiDownloadLine,
  RiMailLine, RiRadioButtonLine,
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
    document.querySelectorAll(".bounce-reveal, .scroll-reveal").forEach(el => observer.observe(el))
    return () => { window.removeEventListener("mousemove", m); observer.disconnect() }
  }, [])

  return (
    <main className="min-h-screen overflow-x-hidden text-slate-200" style={{ background: "#050508", fontFamily: "'Syne', sans-serif" }}>

      {/* Fonts are loaded globally via globals.css — only keyframes + helper
          classes live here since they're specific to this landing page. */}
      <style>{`
        * { font-family: 'DM Sans', sans-serif; }
        h1, h2, h3, .syne { font-family: 'Syne', sans-serif; }
        .bounce-reveal { opacity: 0; transform: translateY(40px) scale(0.96); transition: opacity 0.6s cubic-bezier(0.16,1,0.3,1), transform 0.6s cubic-bezier(0.16,1,0.3,1); }
        .bounce-reveal.animate-in { opacity: 1; transform: translateY(0) scale(1); }
        @keyframes bounce-in { 0% { opacity: 0; transform: translateY(50px) scale(0.94); } 60% { transform: translateY(-6px) scale(1.01); } 100% { opacity: 1; transform: translateY(0) scale(1); } }
        .bounce-reveal.animate-in { animation: bounce-in 0.7s cubic-bezier(0.16,1,0.3,1) forwards; }
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

      {/* DEEP DIVES — four surfaces, one round.
          Each section shows one feature with a real UI mockup instead of an
          icon. Alternates sides so the rhythm breaks up the scroll. */}
      <section id="features" className="relative z-10 max-w-6xl mx-auto px-6 md:px-16 pt-20 md:pt-28 pb-8"
        style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#10b981" }}>What&apos;s inside</p>
          <h2 className="syne font-black text-white" style={{ fontSize: "clamp(32px,5vw,56px)", letterSpacing: "-0.04em", lineHeight: 1.02 }}>
            Four surfaces.<br />
            <span style={{ background: "linear-gradient(135deg, #10b981 0%, #6ee7b7 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              One round.
            </span>
          </h2>
          <p className="mt-5 text-slate-500 leading-relaxed max-w-lg" style={{ fontSize: "15px" }}>
            Not a generic CRM with a crypto sticker on it. Each of these is a distinct view with its own job — the private side for tracking, the public side for getting found.
          </p>
        </div>
      </section>

      {/* 01 — PIPELINE */}
      <DeepDive
        kicker="01 · Pipeline"
        accent="#10b981"
        headline={<>Drag a deal<br />through every stage.</>}
        body="The Kanban view of every investor you've talked to, grouped by status. Optimistic drag-and-drop, notes stay attached, nothing gets lost in a spreadsheet named final_v3_FINAL.xlsx."
        bullets={[
          "Outreach → Closed in five moves",
          "Per-card status, deal size, email, notes",
          "Mobile-native — tabs on phone, columns on desktop",
        ]}
        visual={<KanbanMock />}
      />

      {/* 02 — DEAL ROOM */}
      <DeepDive
        kicker="02 · Deal room"
        accent="#34d399"
        reverse
        headline={<>A public page<br />investors can find you on.</>}
        body="Publish your project once. It shows up on the investor side of FundFlow where VCs filter by stage, chain, and sector. When someone taps Express Interest you get an email, a realtime badge on the dashboard, and a row in the interests table."
        bullets={[
          "Stage · chain · tags · goal · raised",
          "One-click Express Interest — dedup'd per email",
          "Resend email to the founder on every signal",
        ]}
        visual={<DealRoomMock />}
      />

      {/* 03 — SIGNAL */}
      <DeepDive
        kicker="03 · Signal"
        accent="#a78bfa"
        headline={<>Know where<br />the round actually stands.</>}
        body="The analytics page turns your pipeline into a funnel with real percentages — not vanity metrics. Conversion from outreach to close, response rate, total committed, and the top cheques ranked by size."
        bullets={[
          "Outreach → Closed conversion funnel",
          "Scale-aware $k/$M/$B parsing — $5M is five million, not five",
          "Weekly interest signal chart from the deal room",
        ]}
        visual={<SignalMock />}
      />

      {/* 04 — IDENTITY */}
      <DeepDive
        kicker="04 · Identity"
        accent="#38bdf8"
        reverse
        headline={<>Web3-native<br />from day one.</>}
        body="Wallet connect is a first-class login method, not a retrofit. Pair your address to your profile via MetaMask, WalletConnect, or paste. Then browse the curated investor directory — 30+ funds tagged by sector, stage, check size, and Web3 focus."
        bullets={[
          "MetaMask + WalletConnect v2 + manual paste",
          "Curated directory — check size, sector, location",
          "Add any fund to your pipeline in one tap",
        ]}
        visual={<IdentityMock />}
      />

      {/* Also included — the boring stuff still worth mentioning. */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 md:px-16 pt-10 pb-20 md:pb-28">
        <div className="rounded-2xl border px-6 py-5 md:px-8 md:py-6 flex flex-col md:flex-row items-start md:items-center gap-5 md:gap-8 flex-wrap"
          style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.05)" }}>
          <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "#64748b" }}>Also included</span>
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            {[
              { icon: <RiRadioButtonLine size={13} />, label: "Realtime sync" },
              { icon: <RiDownloadLine size={13} />, label: "CSV export (RFC 4180)" },
              { icon: <RiMailLine size={13} />, label: "Email notifications" },
              { icon: <RiFlashlightLine size={13} />, label: "25 investors free, no card" },
            ].map(item => (
              <span key={item.label} className="flex items-center gap-2 text-[13px]" style={{ color: "#94a3b8" }}>
                <span style={{ color: "#10b981" }}>{item.icon}</span>
                {item.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="relative z-10 max-w-4xl mx-auto px-6 md:px-16 py-20 md:py-24" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <div className="text-center mb-14 bounce-reveal">
          <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#10b981" }}>Pricing</p>
          <h2 className="syne font-black text-white" style={{ fontSize: "clamp(28px,4vw,48px)", letterSpacing: "-0.03em" }}>Simple pricing</h2>
          <p className="mt-3" style={{ fontSize: "15px", color: "#64748b" }}>Start free. Upgrade when you&apos;re ready to scale.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { name: "Starter", price: "Free", period: "forever", desc: "For early-stage fundraising", features: ["Up to 25 investors", "Full pipeline view", "Basic analytics", "Email support"], cta: "Get started free", featured: false },
            { name: "Pro", price: "$99", period: "/month", desc: "For founders closing serious rounds", features: ["Unlimited investors", "Advanced analytics", "Investor network access", "API access", "Priority support"], cta: "Get started", featured: true }
          ].map((plan, i) => (
            <div key={plan.name} className="bounce-reveal card-hover rounded-2xl p-8"
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
        <div className="text-center mb-14 bounce-reveal">
          <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#10b981" }}>FAQ</p>
          <h2 className="syne font-black text-white" style={{ fontSize: "clamp(28px,4vw,48px)", letterSpacing: "-0.03em" }}>Common questions</h2>
        </div>
        <div className="flex flex-col gap-2">
          {FAQS.map((faq, i) => (
            <div key={i} className="bounce-reveal rounded-2xl overflow-hidden transition-all"
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
        <div className="bounce-reveal text-center rounded-2xl p-12 md:p-16 relative overflow-hidden"
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

// ─────────────────────────────────────────────────────────────────────────────
// DEEP-DIVE section layout. One feature per section; alternates sides based
// on `reverse`. Keeping this local to the landing page — it's bespoke to this
// file and wouldn't be used anywhere else.
// ─────────────────────────────────────────────────────────────────────────────
function DeepDive({
  kicker, accent, headline, body, bullets, visual, reverse,
}: {
  kicker: string
  accent: string
  headline: React.ReactNode
  body: string
  bullets: string[]
  visual: React.ReactNode
  reverse?: boolean
}) {
  return (
    <section className="relative z-10 max-w-6xl mx-auto px-6 md:px-16 py-14 md:py-20">
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center ${reverse ? "md:[&>div:first-child]:order-2" : ""}`}>
        {/* Copy */}
        <div className="bounce-reveal">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-widest mb-5"
            style={{ background: `${accent}12`, border: `1px solid ${accent}25`, color: accent }}>
            <span className="w-1 h-1 rounded-full" style={{ background: accent }} />
            {kicker}
          </div>
          <h3 className="syne font-black text-white leading-[1.02] mb-5"
            style={{ fontSize: "clamp(28px,3.6vw,44px)", letterSpacing: "-0.035em" }}>
            {headline}
          </h3>
          <p className="text-slate-500 leading-relaxed mb-6" style={{ fontSize: "15px" }}>
            {body}
          </p>
          <ul className="flex flex-col gap-2.5">
            {bullets.map(b => (
              <li key={b} className="flex items-start gap-2.5 text-[14px]" style={{ color: "#94a3b8" }}>
                <RiCheckLine size={14} style={{ color: accent, marginTop: 4, flexShrink: 0 }} />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Product UI mock */}
        <div className="bounce-reveal" style={{ transitionDelay: "0.15s" }}>
          {visual}
        </div>
      </div>
    </section>
  )
}

// Frame that wraps every mock in a subtle browser-chrome — keeps the
// landing feeling consistent with the hero pipeline visual.
function MockFrame({ subtitle, children }: { subtitle: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.06)",
        boxShadow: "0 30px 80px rgba(0,0,0,0.5)",
      }}>
      <div className="flex items-center gap-2 px-4 py-3"
        style={{ background: "rgba(255,255,255,0.02)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
        {["#ff5f57", "#ffbd2e", "#28ca41"].map((c, i) => (
          <div key={i} className="w-2.5 h-2.5 rounded-full opacity-70" style={{ background: c }} />
        ))}
        <p className="flex-1 text-center text-[11px] font-mono" style={{ color: "#334155" }}>{subtitle}</p>
      </div>
      <div className="p-4 md:p-5">{children}</div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 01 — Pipeline mock. Five columns, a handful of realistic cards, one card
// visually lifted to imply drag-and-drop.
// ─────────────────────────────────────────────────────────────────────────────
function KanbanMock() {
  const cols: Array<{ label: string; color: string; cards: Array<{ name: string; deal: string; dragging?: boolean }> }> = [
    { label: "Outreach",   color: "#9ca3af", cards: [{ name: "Paradigm", deal: "$5M" }, { name: "Multicoin", deal: "$2M" }] },
    { label: "Interested", color: "#a78bfa", cards: [{ name: "Variant", deal: "$1M" }] },
    { label: "Meeting",    color: "#fbbf24", cards: [{ name: "a16z Crypto", deal: "$10M", dragging: true }] },
    { label: "Term Sheet", color: "#38bdf8", cards: [{ name: "Coinbase V.", deal: "$3M" }] },
    { label: "Closed",     color: "#34d399", cards: [{ name: "Dragonfly", deal: "$2.5M" }] },
  ]
  return (
    <MockFrame subtitle="app.fundflow.io/pipeline">
      <div className="flex items-center justify-between mb-4">
        <p className="syne font-bold text-white text-[13px]">Deal pipeline</p>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full"
          style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.15)" }}>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-medium" style={{ color: "#34d399" }}>Live</span>
        </div>
      </div>
      <div className="grid grid-cols-5 gap-2">
        {cols.map(col => (
          <div key={col.label} className="rounded-xl p-2"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderTop: `2px solid ${col.color}` }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] font-semibold truncate syne" style={{ color: col.color }}>{col.label}</span>
              <span className="text-[9px] px-1 rounded" style={{ background: `${col.color}15`, color: col.color }}>{col.cards.length}</span>
            </div>
            <div className="flex flex-col gap-1.5">
              {col.cards.map(card => (
                <div key={card.name} className="rounded-md p-1.5 transition-transform"
                  style={{
                    background: card.dragging ? `${col.color}18` : "rgba(255,255,255,0.03)",
                    border: card.dragging ? `1px solid ${col.color}60` : "1px solid rgba(255,255,255,0.06)",
                    boxShadow: card.dragging ? `0 8px 24px ${col.color}25, 0 0 0 1px ${col.color}35` : "none",
                    transform: card.dragging ? "translate(2px, -4px) rotate(-1.5deg)" : "none",
                  }}>
                  <div className="text-[9px] font-medium truncate" style={{ color: "#cbd5e1" }}>{card.name}</div>
                  <div className="text-[8px] mt-0.5" style={{ color: col.color }}>{card.deal}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {/* Optimistic-move hint */}
      <div className="mt-3 flex items-center gap-2 text-[10px]" style={{ color: "#475569" }}>
        <span className="inline-block w-1 h-1 rounded-full bg-amber-400" />
        a16z Crypto · moving to Term Sheet
      </div>
    </MockFrame>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 02 — Deal Room mock. One published project card as an investor sees it.
// ─────────────────────────────────────────────────────────────────────────────
function DealRoomMock() {
  const goal = 2_500_000
  const raised = 1_600_000
  const pct = Math.round((raised / goal) * 100)
  return (
    <MockFrame subtitle="app.fundflow.io/investor/discover">
      <div className="flex items-center justify-between mb-4">
        <p className="syne font-bold text-white text-[13px]">Deal flow</p>
        <span className="text-[10px]" style={{ color: "#475569" }}>30 founders raising</span>
      </div>
      <div className="rounded-xl overflow-hidden"
        style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="h-[2px] w-full" style={{ background: "linear-gradient(90deg, #10b981, transparent)" }} />
        <div className="p-4 flex flex-col gap-3">
          <div className="flex items-start justify-between">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-[12px] font-bold"
              style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.25)", color: "#34d399" }}>
              N
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                style={{ background: "rgba(56,189,248,0.1)", color: "#38bdf8", border: "1px solid rgba(56,189,248,0.2)" }}>Seed</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono"
                style={{ background: "rgba(255,255,255,0.04)", color: "#64748b", border: "1px solid rgba(255,255,255,0.08)" }}>Base</span>
            </div>
          </div>
          <div>
            <h4 className="syne font-bold text-white text-[14px] tracking-tight">NovaPay</h4>
            <p className="text-[11px] mt-0.5" style={{ color: "#64748b" }}>by Elena K. · Stealth fintech</p>
          </div>
          <p className="text-[11px] leading-relaxed" style={{ color: "#94a3b8" }}>
            Stablecoin payroll rails for remote-first teams — send USDC to 40+ countries, recipients never see a wallet.
          </p>
          <div className="flex flex-wrap gap-1">
            {["DeFi", "Payments", "B2B"].map(t => (
              <span key={t} className="text-[9px] px-1.5 py-0.5 rounded-full"
                style={{ background: "rgba(255,255,255,0.04)", color: "#64748b", border: "1px solid rgba(255,255,255,0.07)" }}>{t}</span>
            ))}
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px]" style={{ color: "#475569" }}>Raised</span>
              <div className="flex items-center gap-1">
                <span className="text-[11px] font-semibold text-white">$1.6M</span>
                <span className="text-[10px]" style={{ color: "#475569" }}>/ $2.5M</span>
              </div>
            </div>
            <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
              <div className="h-full rounded-full"
                style={{ width: `${pct}%`, background: "linear-gradient(90deg, #10b981, #34d399)" }} />
            </div>
            <div className="text-[9px] mt-1 text-right" style={{ color: "#334155" }}>{pct}% funded</div>
          </div>
          <button className="w-full py-2 rounded-lg text-[11px] font-semibold mt-1 border-0 cursor-default flex items-center justify-center gap-1.5"
            style={{ background: "rgba(16,185,129,0.12)", color: "#10b981" }}>
            Express interest <RiArrowRightLine size={11} />
          </button>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2 text-[10px]" style={{ color: "#475569" }}>
        <span className="inline-block w-1 h-1 rounded-full bg-emerald-400" />
        Elena will get an email the moment you tap
      </div>
    </MockFrame>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 03 — Signal mock. Funnel bars + a small "top deals" list.
// ─────────────────────────────────────────────────────────────────────────────
function SignalMock() {
  const funnel = [
    { label: "Outreach",   count: 47, color: "#9ca3af", pct: 100 },
    { label: "Interested", count: 23, color: "#a78bfa", pct: 49 },
    { label: "Meeting",    count: 12, color: "#fbbf24", pct: 26 },
    { label: "Term Sheet", count:  6, color: "#38bdf8", pct: 13 },
    { label: "Closed",     count:  4, color: "#34d399", pct:  9 },
  ]
  return (
    <MockFrame subtitle="app.fundflow.io/analytics">
      <div className="flex items-center justify-between mb-4">
        <p className="syne font-bold text-white text-[13px]">Pipeline funnel</p>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px]" style={{ color: "#475569" }}>Conversion</span>
          <span className="text-[11px] font-bold" style={{ color: "#34d399" }}>8.5%</span>
        </div>
      </div>
      <div className="flex flex-col gap-2.5 mb-4">
        {funnel.map((s, i) => (
          <div key={s.label}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono" style={{ color: "#334155" }}>{String(i + 1).padStart(2, "0")}</span>
                <span className="text-[10px] font-medium" style={{ color: "#cbd5e1" }}>{s.label}</span>
              </div>
              <span className="text-[10px] font-bold" style={{ color: s.color }}>{s.count}</span>
            </div>
            <div className="h-1 rounded-full" style={{ background: "rgba(255,255,255,0.04)" }}>
              <div className="h-full rounded-full"
                style={{ width: `${s.pct}%`, background: s.color, opacity: 0.8 }} />
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-lg p-2.5"
        style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
        <p className="text-[9px] font-semibold uppercase tracking-widest mb-2" style={{ color: "#475569" }}>Total committed</p>
        <div className="flex items-baseline gap-1.5">
          <span className="syne font-black text-white" style={{ fontSize: "22px", letterSpacing: "-0.02em" }}>$12.5M</span>
          <span className="text-[10px]" style={{ color: "#34d399" }}>+ $4.2M this month</span>
        </div>
      </div>
    </MockFrame>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 04 — Identity mock. Wallet connect options stacked over one directory row.
// ─────────────────────────────────────────────────────────────────────────────
function IdentityMock() {
  return (
    <MockFrame subtitle="app.fundflow.io/profile">
      <p className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: "#475569" }}>Connect wallet</p>
      <div className="flex flex-col gap-1.5 mb-5">
        {[
          { icon: <RiWallet3Line size={14} />, label: "MetaMask",       hint: "Browser extension", color: "#fbbf24" },
          { icon: <RiQrCodeLine size={14} />,  label: "WalletConnect",  hint: "QR · any wallet",   color: "#38bdf8" },
          { icon: <RiPencilLine size={14} />,  label: "Paste address",  hint: "Any 0x…",           color: "#94a3b8" },
        ].map(w => (
          <div key={w.label} className="flex items-center gap-2.5 px-3 py-2 rounded-lg"
            style={{ background: `${w.color}08`, border: `1px solid ${w.color}20`, color: w.color }}>
            {w.icon}
            <span className="text-[11px] font-medium">{w.label}</span>
            <span className="ml-auto text-[9px]" style={{ color: "#475569" }}>{w.hint}</span>
          </div>
        ))}
      </div>

      <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: "#475569" }}>From the directory</p>
      <div className="rounded-lg p-3"
        style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold flex-shrink-0"
              style={{ background: "rgba(251,191,36,0.15)", color: "#fbbf24" }}>
              D
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-white truncate">Dragonfly Capital</p>
              <p className="text-[9px] truncate" style={{ color: "#64748b" }}>Haseeb Qureshi · San Francisco</p>
            </div>
          </div>
          <span className="text-[9px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5 flex-shrink-0"
            style={{ background: "rgba(251,191,36,0.08)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.15)" }}>
            <RiFlashlightLine size={9} /> Web3
          </span>
        </div>
        <div className="flex items-center gap-1 mb-2">
          <span className="text-[9px]" style={{ color: "#475569" }}>Check:</span>
          <span className="text-[10px] font-medium text-white">$250k — $5M</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {["DeFi", "Infra"].map(s => (
              <span key={s} className="text-[9px] px-1.5 py-0.5 rounded-full"
                style={{ background: "rgba(16,185,129,0.06)", color: "#10b981", border: "1px solid rgba(16,185,129,0.12)" }}>{s}</span>
            ))}
          </div>
          <button className="flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-semibold border-0 cursor-default"
            style={{ background: "rgba(16,185,129,0.12)", color: "#10b981" }}>
            <RiAddLine size={9} /> Add
          </button>
        </div>
      </div>
    </MockFrame>
  )
}
