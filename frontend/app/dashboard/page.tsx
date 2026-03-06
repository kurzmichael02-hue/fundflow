"use client"
import { useEffect, useState, useRef } from "react"
import Link from "next/link"

function useTypingEffect(text: string, speed = 35) {
  const [displayed, setDisplayed] = useState("")
  useEffect(() => {
    setDisplayed("")
    let i = 0
    const interval = setInterval(() => {
      if (i < text.length) { setDisplayed(text.slice(0, i + 1)); i++ }
      else clearInterval(interval)
    }, speed)
    return () => clearInterval(interval)
  }, [text])
  return displayed
}

const INVESTORS = [
  { name: "Andreessen Horowitz", stage: "Term Sheet", amount: "$12M", color: "#0ea5e9" },
  { name: "Paradigm", stage: "Meeting", amount: "$8M", color: "#f59e0b" },
  { name: "Sequoia Capital", stage: "Interested", amount: "$5M", color: "#8b5cf6" },
  { name: "Coinbase Ventures", stage: "Closed", amount: "$2.4M", color: "#10b981" },
  { name: "Multicoin Capital", stage: "Outreach", amount: "TBD", color: "#6b7280" },
]

export default function Home() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [time, setTime] = useState("")
  const [visible, setVisible] = useState(false)
  const typed = useTypingEffect("The CRM built for founders who close.")

  useEffect(() => {
    setTimeout(() => setVisible(true), 100)
    const t = setInterval(() => {
      const now = new Date()
      setTime(now.toLocaleTimeString("en-US", { hour12: false }))
    }, 1000)
    const m = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY })
    window.addEventListener("mousemove", m)
    return () => { clearInterval(t); window.removeEventListener("mousemove", m) }
  }, [])

  return (
    <main style={{ background: "#04070f", minHeight: "100vh", overflowX: "hidden", color: "#e2e8f0" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Cal+Sans&family=JetBrains+Mono:wght@400;500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', sans-serif; }
        ::selection { background: rgba(14,165,233,0.3); color: #fff; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(14,165,233,0.3); border-radius: 2px; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes scroll-x {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .animate-fade-up { animation: fadeUp 0.7s ease forwards; }
        .animate-fade-in { animation: fadeIn 1s ease forwards; }
        .animate-float { animation: float 4s ease-in-out infinite; }

        .cursor-blink { animation: blink 1s infinite; }

        .glow-text {
          background: linear-gradient(135deg, #ffffff 0%, #0ea5e9 50%, #38bdf8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .glow-border {
          border: 1px solid rgba(14,165,233,0.2);
          transition: all 0.25s ease;
        }
        .glow-border:hover {
          border-color: rgba(14,165,233,0.5);
          box-shadow: 0 0 20px rgba(14,165,233,0.08), inset 0 0 20px rgba(14,165,233,0.03);
        }

        .btn-primary {
          background: linear-gradient(135deg, #0ea5e9, #0284c7);
          color: white;
          padding: 13px 32px;
          border-radius: 10px;
          font-weight: 600;
          font-size: 14px;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
          letter-spacing: -0.01em;
        }
        .btn-primary:hover {
          background: linear-gradient(135deg, #38bdf8, #0ea5e9);
          transform: translateY(-1px);
          box-shadow: 0 12px 32px rgba(14,165,233,0.35);
        }

        .btn-secondary {
          background: rgba(255,255,255,0.04);
          color: #94a3b8;
          padding: 13px 32px;
          border-radius: 10px;
          font-size: 14px;
          border: 1px solid rgba(255,255,255,0.07);
          cursor: pointer;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
          letter-spacing: -0.01em;
        }
        .btn-secondary:hover {
          background: rgba(255,255,255,0.07);
          color: #e2e8f0;
          border-color: rgba(255,255,255,0.12);
        }

        .card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          padding: 28px;
          transition: all 0.25s ease;
          position: relative;
          overflow: hidden;
        }
        .card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(14,165,233,0.04), transparent 60%);
          opacity: 0;
          transition: opacity 0.25s;
        }
        .card:hover::before { opacity: 1; }
        .card:hover {
          border-color: rgba(14,165,233,0.2);
          transform: translateY(-3px);
          box-shadow: 0 16px 40px rgba(0,0,0,0.3);
        }

        .badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 14px;
          border-radius: 100px;
          font-size: 12px;
          font-weight: 500;
          background: rgba(14,165,233,0.08);
          border: 1px solid rgba(14,165,233,0.2);
          color: #38bdf8;
          letter-spacing: 0.01em;
        }

        .stat-num {
          font-size: 52px;
          font-weight: 700;
          letter-spacing: -0.03em;
          line-height: 1;
          background: linear-gradient(135deg, #fff, #0ea5e9);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .nav-link {
          color: #64748b;
          font-size: 14px;
          text-decoration: none;
          transition: color 0.2s;
          font-weight: 500;
        }
        .nav-link:hover { color: #e2e8f0; }

        .investor-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          border-radius: 10px;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.05);
          transition: all 0.2s;
          margin-bottom: 8px;
        }
        .investor-row:hover {
          background: rgba(14,165,233,0.05);
          border-color: rgba(14,165,233,0.15);
        }

        .stage-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          display: inline-block;
          margin-right: 6px;
        }

        .noise-overlay {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 1;
          opacity: 0.025;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        }

        .marquee { animation: scroll-x 25s linear infinite; display: flex; gap: 48px; white-space: nowrap; }

        .feature-icon {
          width: 42px;
          height: 42px;
          border-radius: 10px;
          background: rgba(14,165,233,0.1);
          border: 1px solid rgba(14,165,233,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          margin-bottom: 16px;
        }

        .pricing-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px;
          padding: 36px;
          transition: all 0.25s;
        }
        .pricing-card.featured {
          background: rgba(14,165,233,0.06);
          border-color: rgba(14,165,233,0.3);
          box-shadow: 0 0 60px rgba(14,165,233,0.1);
        }
        .pricing-card:hover { transform: translateY(-4px); }
      `}</style>

      <div className="noise-overlay" />

      {/* Ambient glow */}
      <div style={{
        position: "fixed", top: "10%", left: "30%",
        width: 600, height: 600,
        background: "radial-gradient(circle, rgba(14,165,233,0.07) 0%, transparent 70%)",
        pointerEvents: "none", zIndex: 0, filter: "blur(40px)"
      }} />
      <div style={{
        position: "fixed", bottom: "10%", right: "20%",
        width: 400, height: 400,
        background: "radial-gradient(circle, rgba(56,189,248,0.05) 0%, transparent 70%)",
        pointerEvents: "none", zIndex: 0, filter: "blur(60px)"
      }} />

      {/* Mouse follow glow */}
      <div style={{
        position: "fixed",
        width: 500, height: 500,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(14,165,233,0.04) 0%, transparent 70%)",
        pointerEvents: "none", zIndex: 0,
        left: mousePos.x, top: mousePos.y,
        transform: "translate(-50%, -50%)",
        transition: "left 0.15s ease, top 0.15s ease",
        filter: "blur(20px)"
      }} />

      {/* NAV */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        padding: "0 64px",
        height: 64,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "rgba(4,7,15,0.8)",
        backdropFilter: "blur(24px)",
        borderBottom: "1px solid rgba(255,255,255,0.05)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: "linear-gradient(135deg, #0ea5e9, #0284c7)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px"
          }}>FF</div>
          <span style={{ fontSize: 17, fontWeight: 700, color: "#fff", letterSpacing: "-0.02em" }}>FundFlow</span>
        </div>

        <div style={{ display: "flex", gap: 36 }}>
          {["Features", "Pipeline", "Pricing", "About"].map(l => (
            <a key={l} href="#" className="nav-link">{l}</a>
          ))}
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ fontSize: 11, color: "#334155", fontFamily: "JetBrains Mono, monospace", marginRight: 8 }}>{time}</div>
          <Link href="/login" className="btn-secondary" style={{ padding: "8px 20px", fontSize: 13 }}>Login</Link>
          <Link href="/register" className="btn-primary" style={{ padding: "8px 20px", fontSize: 13 }}>Get started →</Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{
        padding: "160px 64px 100px",
        position: "relative", zIndex: 2,
        maxWidth: 1200, margin: "0 auto"
      }}>
        <div style={{ maxWidth: 760, opacity: visible ? 1 : 0, transition: "opacity 0.5s ease" }}>
          <div className="badge" style={{ marginBottom: 28 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#0ea5e9", display: "inline-block", animation: "pulse 2s infinite" }} />
            Now in beta — free to start
          </div>

          <h1 style={{
            fontSize: "clamp(52px, 6vw, 80px)",
            fontWeight: 700,
            letterSpacing: "-0.04em",
            lineHeight: 1.05,
            color: "#fff",
            marginBottom: 24,
            animation: "fadeUp 0.8s ease forwards"
          }}>
            The investor CRM<br />
            <span className="glow-text">built for Web3.</span>
          </h1>

          <p style={{
            fontSize: 18,
            color: "#64748b",
            lineHeight: 1.7,
            maxWidth: 520,
            marginBottom: 40,
            animation: "fadeUp 0.8s 0.1s ease both"
          }}>
            {typed}
            <span className="cursor-blink" style={{ display: "inline-block", width: 2, height: "1.1em", background: "#0ea5e9", marginLeft: 2, verticalAlign: "text-bottom" }} />
          </p>

          <div style={{ display: "flex", gap: 12, marginBottom: 64, animation: "fadeUp 0.8s 0.2s ease both" }}>
            <Link href="/register" className="btn-primary">Start for free →</Link>
            <Link href="/login" className="btn-secondary">View demo ▶</Link>
          </div>

          {/* Social proof */}
          <div style={{
            display: "flex", alignItems: "center", gap: 20,
            animation: "fadeUp 0.8s 0.3s ease both"
          }}>
            <div style={{ display: "flex" }}>
              {["#0ea5e9", "#8b5cf6", "#10b981", "#f59e0b"].map((c, i) => (
                <div key={i} style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: c, border: "2px solid #04070f",
                  marginLeft: i > 0 ? -10 : 0
                }} />
              ))}
            </div>
            <div style={{ fontSize: 13, color: "#64748b" }}>
              <span style={{ color: "#e2e8f0", fontWeight: 600 }}>2,400+ founders</span> track their pipeline on FundFlow
            </div>
          </div>
        </div>

        {/* DASHBOARD PREVIEW */}
        <div style={{
          marginTop: 80,
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 20,
          overflow: "hidden",
          animation: "fadeUp 0.8s 0.4s ease both",
          boxShadow: "0 40px 100px rgba(0,0,0,0.5), 0 0 0 1px rgba(14,165,233,0.05)"
        }}>
          {/* Window bar */}
          <div style={{
            padding: "14px 20px",
            background: "rgba(255,255,255,0.02)",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
            display: "flex", alignItems: "center", gap: 8
          }}>
            {["#ff5f57", "#ffbd2e", "#28ca41"].map((c, i) => (
              <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: c, opacity: 0.7 }} />
            ))}
            <div style={{
              flex: 1, textAlign: "center",
              fontSize: 11, color: "#334155",
              fontFamily: "JetBrains Mono, monospace"
            }}>app.fundflow.io/dashboard</div>
          </div>

          {/* Dashboard content */}
          <div style={{ padding: 28 }}>
            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
              {[
                { label: "Total Investors", val: "47", icon: "👥", delta: "+12 this week" },
                { label: "Active Leads", val: "23", icon: "⚡", delta: "+5 today" },
                { label: "Meetings", val: "8", icon: "📅", delta: "3 this week" },
                { label: "Deals Closed", val: "4", icon: "✅", delta: "$22.4M raised" },
              ].map(s => (
                <div key={s.label} style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 12, padding: "16px 20px"
                }}>
                  <div style={{ fontSize: 10, color: "#475569", marginBottom: 8, letterSpacing: "0.05em", textTransform: "uppercase" }}>{s.label}</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: "#fff", letterSpacing: "-0.02em", marginBottom: 4 }}>{s.val}</div>
                  <div style={{ fontSize: 11, color: "#0ea5e9" }}>{s.delta}</div>
                </div>
              ))}
            </div>

            {/* Investor list */}
            <div style={{ fontSize: 12, color: "#475569", marginBottom: 12, letterSpacing: "0.05em", textTransform: "uppercase" }}>Recent Investors</div>
            {INVESTORS.map(inv => (
              <div key={inv.name} className="investor-row">
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: `${inv.color}20`,
                    border: `1px solid ${inv.color}40`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 700, color: inv.color
                  }}>{inv.name[0]}</div>
                  <div>
                    <div style={{ fontSize: 13, color: "#e2e8f0", fontWeight: 500 }}>{inv.name}</div>
                    <div style={{ fontSize: 11, color: "#475569" }}>{inv.amount}</div>
                  </div>
                </div>
                <div style={{
                  fontSize: 11, padding: "3px 10px", borderRadius: 100,
                  background: `${inv.color}15`, color: inv.color,
                  border: `1px solid ${inv.color}30`, fontWeight: 500
                }}>
                  <span className="stage-dot" style={{ background: inv.color }} />
                  {inv.stage}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div style={{ overflow: "hidden", padding: "32px 0", borderTop: "1px solid rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.04)", position: "relative", zIndex: 2 }}>
        <div className="marquee">
          {[...Array(2)].map((_, ri) =>
            ["Investor CRM", "Pipeline Tracking", "Deal Flow Analytics", "Web3 Native", "Secure & Private", "Real-time Dashboard", "Investor Network"].map((item, i) => (
              <span key={`${ri}-${i}`} style={{ fontSize: 13, color: "#1e293b", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 48 }}>
                {item} <span style={{ color: "#0ea5e9", fontSize: 8 }}>●</span>
              </span>
            ))
          )}
        </div>
      </div>

      {/* FEATURES */}
      <section style={{ padding: "100px 64px", position: "relative", zIndex: 2 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 72 }}>
            <div className="badge" style={{ marginBottom: 20 }}>Features</div>
            <h2 style={{ fontSize: 48, fontWeight: 700, color: "#fff", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
              Everything you need to<br />
              <span className="glow-text">close your round faster</span>
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {[
              { icon: "🎯", title: "Investor CRM", desc: "Track every investor, their status, email history, notes, and next steps in one clean view." },
              { icon: "📊", title: "Kanban Pipeline", desc: "Visualize your entire deal flow. Drag investors from Outreach to Closed in seconds." },
              { icon: "⚡", title: "Live Dashboard", desc: "Real-time metrics on your fundraise. Know exactly where your round stands at all times." },
              { icon: "🌐", title: "Web3 Native", desc: "Built specifically for crypto and Web3 founders. We understand token rounds, SAFTs, and more." },
              { icon: "🤝", title: "Investor Network", desc: "Discover investors actively deploying capital into Web3 projects like yours." },
              { icon: "🔒", title: "Enterprise Security", desc: "Your deal flow is your competitive advantage. Bank-grade encryption keeps it safe." },
            ].map(f => (
              <div key={f.title} className="card">
                <div className="feature-icon">{f.icon}</div>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: "#fff", marginBottom: 10, letterSpacing: "-0.01em" }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section style={{ padding: "100px 64px", borderTop: "1px solid rgba(255,255,255,0.04)", position: "relative", zIndex: 2 }}>
        <div style={{ maxWidth: 820, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div className="badge" style={{ marginBottom: 20 }}>Pricing</div>
            <h2 style={{ fontSize: 48, fontWeight: 700, color: "#fff", letterSpacing: "-0.03em" }}>
              Simple, <span className="glow-text">transparent pricing</span>
            </h2>
            <p style={{ color: "#475569", marginTop: 12, fontSize: 16 }}>Start free. Upgrade when you're ready to scale.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
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
              <div key={plan.name} className={`pricing-card ${plan.featured ? "featured" : ""}`}>
                {plan.featured && (
                  <div style={{ fontSize: 11, color: "#0ea5e9", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12, fontWeight: 600 }}>Most Popular</div>
                )}
                <div style={{ fontSize: 16, fontWeight: 600, color: "#fff", marginBottom: 6 }}>{plan.name}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 8 }}>
                  <span style={{ fontSize: 44, fontWeight: 700, color: "#fff", letterSpacing: "-0.03em" }}>{plan.price}</span>
                  <span style={{ fontSize: 14, color: "#475569" }}>{plan.period}</span>
                </div>
                <p style={{ fontSize: 13, color: "#475569", marginBottom: 28 }}>{plan.desc}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
                  {plan.features.map(f => (
                    <div key={f} style={{ display: "flex", gap: 10, fontSize: 14, color: "#94a3b8", alignItems: "center" }}>
                      <span style={{ color: "#0ea5e9", fontSize: 16, lineHeight: 1 }}>✓</span> {f}
                    </div>
                  ))}
                </div>
                <Link href="/register" className={plan.featured ? "btn-primary" : "btn-secondary"} style={{ display: "block", textAlign: "center", padding: "13px 24px" }}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "100px 64px 120px", position: "relative", zIndex: 2 }}>
        <div style={{
          maxWidth: 800, margin: "0 auto", textAlign: "center",
          padding: "72px 48px", borderRadius: 24,
          background: "rgba(14,165,233,0.05)",
          border: "1px solid rgba(14,165,233,0.15)",
          position: "relative", overflow: "hidden"
        }}>
          <div style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            width: 600, height: 300,
            background: "radial-gradient(ellipse, rgba(14,165,233,0.1), transparent 70%)",
            pointerEvents: "none"
          }} />
          <div className="badge" style={{ marginBottom: 24, position: "relative" }}>Ready to close?</div>
          <h2 style={{ fontSize: 52, fontWeight: 700, color: "#fff", letterSpacing: "-0.03em", marginBottom: 16, position: "relative" }}>
            Start tracking your<br />
            <span className="glow-text">investors today.</span>
          </h2>
          <p style={{ color: "#475569", marginBottom: 40, fontSize: 16, position: "relative" }}>
            Join 2,400+ Web3 founders who closed their round with FundFlow.
          </p>
          <Link href="/register" className="btn-primary" style={{ fontSize: 15, padding: "16px 48px", position: "relative" }}>
            Start for free — no credit card →
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        padding: "28px 64px",
        borderTop: "1px solid rgba(255,255,255,0.04)",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        position: "relative", zIndex: 2
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 24, height: 24, borderRadius: 6,
            background: "linear-gradient(135deg, #0ea5e9, #0284c7)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 9, fontWeight: 800, color: "#fff"
          }}>FF</div>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>FundFlow</span>
        </div>
        <span style={{ fontSize: 12, color: "#1e293b" }}>© 2026 FundFlow. Built for Web3 founders.</span>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#0ea5e9" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#0ea5e9", display: "inline-block", animation: "pulse 2s infinite" }} />
          All systems operational
        </div>
      </footer>
    </main>
  )
}