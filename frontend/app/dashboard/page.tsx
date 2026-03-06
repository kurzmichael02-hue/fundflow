"use client"
import { useEffect, useRef, useState } from "react"
import Link from "next/link"

export default function Home() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [scrollY, setScrollY] = useState(0)
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY })
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("mousemove", handleMouse)
    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("mousemove", handleMouse)
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  return (
    <main className="bg-[#030508] min-h-screen overflow-x-hidden" style={{ fontFamily: "'DM Mono', monospace" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@400;600;700;800;900&display=swap');

        * { box-sizing: border-box; }

        .glow-cursor {
          position: fixed;
          width: 400px;
          height: 400px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(0,255,200,0.06) 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
          transform: translate(-50%, -50%);
          transition: left 0.1s ease, top 0.1s ease;
        }

        .noise {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 1;
          opacity: 0.03;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        }

        .grid-bg {
          background-image: 
            linear-gradient(rgba(0,255,180,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,255,180,0.03) 1px, transparent 1px);
          background-size: 60px 60px;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(2deg); }
        }

        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(2.5); opacity: 0; }
        }

        @keyframes slide-up {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes scan {
          0% { top: 0%; }
          100% { top: 100%; }
        }

        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-slide-up { animation: slide-up 0.8s ease forwards; }

        .card-hover {
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        .card-hover::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(0,255,180,0.05), transparent);
          opacity: 0;
          transition: opacity 0.3s;
        }
        .card-hover:hover::before { opacity: 1; }
        .card-hover:hover { transform: translateY(-4px); border-color: rgba(0,255,180,0.3) !important; }

        .btn-glow:hover {
          box-shadow: 0 0 30px rgba(0,255,180,0.4), 0 0 60px rgba(0,255,180,0.2);
        }

        .stat-counter {
          font-family: 'Syne', sans-serif;
          font-size: 56px;
          font-weight: 900;
          background: linear-gradient(135deg, #00ffb4, #00c8ff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          border-radius: 100px;
          font-size: 11px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          border: 1px solid rgba(0,255,180,0.2);
          color: #00ffb4;
          background: rgba(0,255,180,0.05);
        }

        .hero-title {
          font-family: 'Syne', sans-serif;
          font-weight: 900;
          line-height: 1;
          letter-spacing: -0.03em;
        }

        .gradient-text {
          background: linear-gradient(135deg, #ffffff 0%, #00ffb4 50%, #00c8ff 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .scan-line {
          position: absolute;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(0,255,180,0.4), transparent);
          animation: scan 3s linear infinite;
        }

        .pipeline-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px;
          padding: 16px;
          transition: all 0.2s;
        }
        .pipeline-card:hover {
          background: rgba(0,255,180,0.04);
          border-color: rgba(0,255,180,0.2);
        }
      `}</style>

      {/* Cursor glow */}
      <div className="glow-cursor" style={{ left: mousePos.x, top: mousePos.y }} />
      <div className="noise" />

      {/* NAV */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "20px 64px",
        background: "rgba(3,5,8,0.8)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(0,255,180,0.08)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: "linear-gradient(135deg, #00ffb4, #00c8ff)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, fontWeight: 900, color: "#030508"
          }}>FF</div>
          <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 18, color: "#fff" }}>FundFlow</span>
        </div>
        <div style={{ display: "flex", gap: 40 }}>
          {["Features", "Pricing", "About"].map(item => (
            <a key={item} href="#" style={{ color: "#6b7b99", fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", transition: "color 0.2s" }}
              onMouseEnter={e => (e.target as HTMLElement).style.color = "#00ffb4"}
              onMouseLeave={e => (e.target as HTMLElement).style.color = "#6b7b99"}
            >{item}</a>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Link href="/login" style={{
            padding: "8px 20px", borderRadius: 8, fontSize: 13,
            border: "1px solid rgba(255,255,255,0.1)", color: "#c8d8f0",
            fontFamily: "DM Mono, monospace", transition: "all 0.2s"
          }}>Login</Link>
          <Link href="/register" className="btn-glow" style={{
            padding: "8px 20px", borderRadius: 8, fontSize: 13,
            background: "#00ffb4", color: "#030508", fontWeight: 600,
            fontFamily: "Syne, sans-serif", transition: "all 0.2s"
          }}>Get Started</Link>
        </div>
      </nav>

      {/* HERO */}
      <section ref={heroRef} className="grid-bg" style={{
        minHeight: "100vh", display: "flex", alignItems: "center",
        justifyContent: "center", padding: "120px 64px 80px",
        position: "relative"
      }}>
        {/* Floating orbs */}
        <div style={{
          position: "absolute", top: "20%", left: "10%",
          width: 300, height: 300, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,255,180,0.08), transparent)",
          filter: "blur(40px)", pointerEvents: "none"
        }} className="animate-float" />
        <div style={{
          position: "absolute", bottom: "20%", right: "10%",
          width: 400, height: 400, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,200,255,0.06), transparent)",
          filter: "blur(60px)", pointerEvents: "none",
          animationDelay: "2s"
        }} className="animate-float" />

        <div style={{ maxWidth: 900, textAlign: "center", position: "relative", zIndex: 2 }}>
          <div className="tag" style={{ marginBottom: 32 }}>
            <span style={{
              width: 6, height: 6, borderRadius: "50%",
              background: "#00ffb4", display: "inline-block",
              boxShadow: "0 0 8px #00ffb4"
            }} />
            Web3 Fundraising OS — Now Live
          </div>

          <h1 className="hero-title" style={{ fontSize: "clamp(56px, 8vw, 96px)", color: "#fff", marginBottom: 24 }}>
            Close your<br />
            <span className="gradient-text">funding round.</span><br />
            Not Excel sheets.
          </h1>

          <p style={{
            fontSize: 18, color: "#6b7b99", maxWidth: 560, margin: "0 auto 48px",
            lineHeight: 1.7, fontFamily: "DM Mono, monospace"
          }}>
            FundFlow is the CRM built for Web3 founders. Track investors, manage your pipeline, and close deals — all in one place.
          </p>

          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/register" className="btn-glow" style={{
              padding: "16px 40px", borderRadius: 12, fontSize: 16,
              background: "#00ffb4", color: "#030508", fontWeight: 700,
              fontFamily: "Syne, sans-serif", display: "flex", alignItems: "center", gap: 8,
              transition: "all 0.2s"
            }}>
              Start for free →
            </Link>
            <a href="#features" style={{
              padding: "16px 40px", borderRadius: 12, fontSize: 14,
              border: "1px solid rgba(255,255,255,0.1)", color: "#c8d8f0",
              fontFamily: "DM Mono, monospace", display: "flex", alignItems: "center", gap: 8,
              transition: "all 0.2s"
            }}>Watch demo ▶</a>
          </div>

          {/* Trust badges */}
          <div style={{ marginTop: 64, display: "flex", gap: 40, justifyContent: "center", alignItems: "center", flexWrap: "wrap" }}>
            {["No credit card", "Free to start", "Built for Web3"].map(badge => (
              <div key={badge} style={{ display: "flex", alignItems: "center", gap: 8, color: "#6b7b99", fontSize: 12 }}>
                <span style={{ color: "#00ffb4" }}>✓</span> {badge}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section style={{ padding: "80px 64px", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 40 }}>
          {[
            { value: "2,400+", label: "Founders using FundFlow" },
            { value: "$840M", label: "Funding tracked on platform" },
            { value: "94%", label: "Faster deal flow" },
          ].map(stat => (
            <div key={stat.label} style={{ textAlign: "center" }}>
              <div className="stat-counter">{stat.value}</div>
              <div style={{ color: "#6b7b99", fontSize: 13, marginTop: 8 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{ padding: "80px 64px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div className="tag" style={{ marginBottom: 16 }}>Features</div>
            <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: 48, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>
              Everything you need to<br />
              <span className="gradient-text">close your round</span>
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            {[
              {
                icon: "⚡",
                title: "Investor CRM",
                desc: "Track every investor, their status, notes, and follow-ups in one clean dashboard."
              },
              {
                icon: "🎯",
                title: "Pipeline Kanban",
                desc: "Drag & drop investors through your pipeline from Outreach to Closed."
              },
              {
                icon: "📊",
                title: "Live Analytics",
                desc: "Real-time stats on your deal flow, conversion rates, and pipeline health."
              },
              {
                icon: "🔗",
                title: "Web3 Native",
                desc: "Built specifically for crypto and Web3 projects. Understands your world."
              },
              {
                icon: "🤝",
                title: "Investor Network",
                desc: "Connect with investors actively looking for Web3 projects to fund."
              },
              {
                icon: "🔒",
                title: "Secure & Private",
                desc: "Your deal flow is your competitive advantage. We keep it locked down."
              },
            ].map(feature => (
              <div key={feature.title} className="card-hover" style={{
                padding: 28, borderRadius: 16,
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)"
              }}>
                <div style={{ fontSize: 28, marginBottom: 16 }}>{feature.icon}</div>
                <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 8 }}>
                  {feature.title}
                </h3>
                <p style={{ color: "#6b7b99", fontSize: 13, lineHeight: 1.7 }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PIPELINE PREVIEW */}
      <section style={{ padding: "80px 64px", background: "rgba(0,255,180,0.02)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
            <div>
              <div className="tag" style={{ marginBottom: 16 }}>Pipeline</div>
              <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: 42, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em", marginBottom: 20 }}>
                Your entire round,<br />
                <span className="gradient-text">at a glance.</span>
              </h2>
              <p style={{ color: "#6b7b99", fontSize: 15, lineHeight: 1.8, marginBottom: 32 }}>
                See exactly where every investor stands. Move deals forward with one click. Never lose track of a warm lead again.
              </p>
              <Link href="/register" style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "12px 28px", borderRadius: 10,
                background: "rgba(0,255,180,0.1)", color: "#00ffb4",
                border: "1px solid rgba(0,255,180,0.2)",
                fontFamily: "Syne, sans-serif", fontWeight: 600, fontSize: 14
              }}>Try it free →</Link>
            </div>

            {/* Pipeline visual mockup */}
            <div style={{ position: "relative" }}>
              <div style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 16, padding: 24, overflow: "hidden"
              }}>
                <div className="scan-line" />
                <div style={{ display: "flex", gap: 12, overflowX: "auto" }}>
                  {[
                    { label: "Outreach", color: "#6b7b99", count: 5 },
                    { label: "Interested", color: "#00c8ff", count: 3 },
                    { label: "Meeting", color: "#fbbf24", count: 2 },
                    { label: "Closed", color: "#00ffb4", count: 1 },
                  ].map(col => (
                    <div key={col.label} style={{ minWidth: 140 }}>
                      <div style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        marginBottom: 12, paddingBottom: 8,
                        borderBottom: `1px solid ${col.color}40`
                      }}>
                        <span style={{ fontSize: 11, color: col.color, textTransform: "uppercase", letterSpacing: "0.08em" }}>{col.label}</span>
                        <span style={{ fontSize: 11, background: `${col.color}20`, color: col.color, padding: "2px 8px", borderRadius: 100 }}>{col.count}</span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {Array.from({ length: col.count > 2 ? 2 : col.count }).map((_, i) => (
                          <div key={i} className="pipeline-card">
                            <div style={{ width: 60 + i * 20, height: 8, background: "rgba(255,255,255,0.1)", borderRadius: 4, marginBottom: 6 }} />
                            <div style={{ width: 40, height: 6, background: "rgba(255,255,255,0.05)", borderRadius: 4 }} />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section style={{ padding: "80px 64px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <div className="tag" style={{ marginBottom: 16 }}>Pricing</div>
          <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: 48, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em", marginBottom: 16 }}>
            Simple pricing.
          </h2>
          <p style={{ color: "#6b7b99", marginBottom: 48 }}>Start free. Scale when you're ready.</p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, maxWidth: 700, margin: "0 auto" }}>
            {[
              {
                name: "Starter", price: "Free", desc: "Perfect to get started",
                features: ["Up to 25 investors", "Pipeline tracking", "Basic analytics"],
                cta: "Get started", primary: false
              },
              {
                name: "Pro", price: "$99", desc: "For serious fundraisers",
                features: ["Unlimited investors", "Advanced analytics", "Investor network access", "Priority support"],
                cta: "Start free trial", primary: true
              },
            ].map(plan => (
              <div key={plan.name} className="card-hover" style={{
                padding: 32, borderRadius: 20,
                background: plan.primary ? "rgba(0,255,180,0.05)" : "rgba(255,255,255,0.02)",
                border: plan.primary ? "1px solid rgba(0,255,180,0.3)" : "1px solid rgba(255,255,255,0.06)",
                textAlign: "left"
              }}>
                <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, color: "#fff", marginBottom: 4 }}>{plan.name}</div>
                <div style={{ fontSize: 40, fontFamily: "Syne, sans-serif", fontWeight: 900, color: plan.primary ? "#00ffb4" : "#fff", marginBottom: 4 }}>
                  {plan.price}<span style={{ fontSize: 14, color: "#6b7b99", fontWeight: 400 }}>{plan.price !== "Free" ? "/mo" : ""}</span>
                </div>
                <div style={{ color: "#6b7b99", fontSize: 13, marginBottom: 24 }}>{plan.desc}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
                  {plan.features.map(f => (
                    <div key={f} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#c8d8f0" }}>
                      <span style={{ color: "#00ffb4", fontSize: 16 }}>✓</span> {f}
                    </div>
                  ))}
                </div>
                <Link href="/register" className={plan.primary ? "btn-glow" : ""} style={{
                  display: "block", textAlign: "center",
                  padding: "12px 24px", borderRadius: 10,
                  background: plan.primary ? "#00ffb4" : "rgba(255,255,255,0.05)",
                  color: plan.primary ? "#030508" : "#c8d8f0",
                  fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14,
                  border: plan.primary ? "none" : "1px solid rgba(255,255,255,0.1)",
                  transition: "all 0.2s"
                }}>{plan.cta}</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "80px 64px 120px" }}>
        <div style={{
          maxWidth: 800, margin: "0 auto", textAlign: "center",
          padding: "64px 48px", borderRadius: 24,
          background: "rgba(0,255,180,0.04)",
          border: "1px solid rgba(0,255,180,0.15)",
          position: "relative", overflow: "hidden"
        }}>
          <div style={{
            position: "absolute", top: "-50%", left: "50%", transform: "translateX(-50%)",
            width: 400, height: 400, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(0,255,180,0.08), transparent)",
            pointerEvents: "none"
          }} />
          <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: 48, fontWeight: 900, color: "#fff", marginBottom: 16, position: "relative" }}>
            Ready to close your<br /><span className="gradient-text">funding round?</span>
          </h2>
          <p style={{ color: "#6b7b99", marginBottom: 40, position: "relative" }}>Join thousands of Web3 founders managing their investor pipeline on FundFlow.</p>
          <Link href="/register" className="btn-glow" style={{
            display: "inline-flex", padding: "16px 48px", borderRadius: 12,
            background: "#00ffb4", color: "#030508",
            fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 16,
            position: "relative", transition: "all 0.2s"
          }}>Start for free — it's free →</Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        padding: "32px 64px", borderTop: "1px solid rgba(255,255,255,0.04)",
        display: "flex", justifyContent: "space-between", alignItems: "center"
      }}>
        <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, color: "#fff" }}>FundFlow</div>
        <div style={{ color: "#6b7b99", fontSize: 12 }}>© 2026 FundFlow. Built for Web3 founders.</div>
      </footer>
    </main>
  )
}