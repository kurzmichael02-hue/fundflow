"use client"
import { useEffect, useState } from "react"
import Link from "next/link"

export default function About() {
  const [visible, setVisible] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    setTimeout(() => setVisible(true), 100)
    const m = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY })
    window.addEventListener("mousemove", m)
    return () => window.removeEventListener("mousemove", m)
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
    {
      icon: "⚡",
      title: "Speed over perfection",
      desc: "We ship fast, iterate faster. Web3 moves at the speed of blocks — so do we.",
    },
    {
      icon: "🔒",
      title: "Security first",
      desc: "Your deal flow is your most valuable asset. We treat it that way.",
    },
    {
      icon: "🌐",
      title: "Built for Web3",
      desc: "Not a CRM with a crypto skin. Purpose-built for token rounds, SAFTs, and on-chain fundraising.",
    },
    {
      icon: "🤝",
      title: "Founder-obsessed",
      desc: "Every feature starts with one question: does this help founders close faster?",
    },
  ]

  return (
    <main style={{ background: "#04070f", minHeight: "100vh", color: "#e2e8f0", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', sans-serif; }
        ::selection { background: rgba(14,165,233,0.3); color: #fff; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(14,165,233,0.3); border-radius: 2px; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }

        .fade-up { animation: fadeUp 0.7s ease forwards; }
        .delay-1 { animation-delay: 0.1s; opacity: 0; }
        .delay-2 { animation-delay: 0.2s; opacity: 0; }
        .delay-3 { animation-delay: 0.3s; opacity: 0; }
        .delay-4 { animation-delay: 0.4s; opacity: 0; }
        .delay-5 { animation-delay: 0.5s; opacity: 0; }

        .glow-text {
          background: linear-gradient(135deg, #ffffff 0%, #0ea5e9 50%, #38bdf8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .nav-link {
          color: #64748b;
          font-size: 14px;
          text-decoration: none;
          transition: color 0.2s;
          font-weight: 500;
        }
        .nav-link:hover { color: #e2e8f0; }

        .btn-primary {
          background: linear-gradient(135deg, #0ea5e9, #0284c7);
          color: white;
          padding: 10px 24px;
          border-radius: 10px;
          font-weight: 600;
          font-size: 13px;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
        }
        .btn-primary:hover {
          background: linear-gradient(135deg, #38bdf8, #0ea5e9);
          transform: translateY(-1px);
          box-shadow: 0 12px 32px rgba(14,165,233,0.35);
        }

        .btn-ghost {
          background: rgba(255,255,255,0.04);
          color: #94a3b8;
          padding: 10px 24px;
          border-radius: 10px;
          font-size: 13px;
          border: 1px solid rgba(255,255,255,0.07);
          cursor: pointer;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
        }
        .btn-ghost:hover {
          background: rgba(255,255,255,0.07);
          color: #e2e8f0;
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
        }

        .team-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 20px;
          padding: 32px;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        .team-card::before {
          content: '';
          position: absolute;
          inset: 0;
          opacity: 0;
          transition: opacity 0.3s;
          border-radius: 20px;
        }
        .team-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 24px 60px rgba(0,0,0,0.4);
        }
        .team-card:hover::before { opacity: 1; }

        .value-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          padding: 28px;
          transition: all 0.25s ease;
        }
        .value-card:hover {
          border-color: rgba(14,165,233,0.2);
          background: rgba(14,165,233,0.03);
          transform: translateY(-3px);
        }

        .stat-block {
          text-align: center;
          padding: 40px 24px;
          border-right: 1px solid rgba(255,255,255,0.05);
        }
        .stat-block:last-child { border-right: none; }

        .noise-overlay {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 1;
          opacity: 0.025;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        }
      `}</style>

      <div className="noise-overlay" />

      {/* Ambient glow */}
      <div style={{
        position: "fixed", top: "5%", left: "20%",
        width: 700, height: 700,
        background: "radial-gradient(circle, rgba(14,165,233,0.06) 0%, transparent 70%)",
        pointerEvents: "none", zIndex: 0, filter: "blur(60px)"
      }} />
      <div style={{
        position: "fixed", bottom: "10%", right: "10%",
        width: 400, height: 400,
        background: "radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 70%)",
        pointerEvents: "none", zIndex: 0, filter: "blur(60px)"
      }} />

      {/* Mouse glow */}
      <div style={{
        position: "fixed",
        width: 400, height: 400,
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
        padding: "0 64px", height: 64,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "rgba(4,7,15,0.85)",
        backdropFilter: "blur(24px)",
        borderBottom: "1px solid rgba(255,255,255,0.05)"
      }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: "linear-gradient(135deg, #0ea5e9, #0284c7)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, fontWeight: 800, color: "#fff"
          }}>FF</div>
          <span style={{ fontSize: 17, fontWeight: 700, color: "#fff", letterSpacing: "-0.02em" }}>FundFlow</span>
        </Link>

        <div style={{ display: "flex", gap: 36 }}>
          <Link href="/#features" className="nav-link">Features</Link>
          <Link href="/pipeline" className="nav-link">Pipeline</Link>
          <Link href="/#pricing" className="nav-link">Pricing</Link>
          <Link href="/about" className="nav-link" style={{ color: "#e2e8f0" }}>About</Link>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <Link href="/login" className="btn-ghost">Login</Link>
          <Link href="/register" className="btn-primary">Get started →</Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{
        padding: "160px 64px 100px",
        maxWidth: 1100, margin: "0 auto",
        position: "relative", zIndex: 2
      }}>
        <div style={{ maxWidth: 700, opacity: visible ? 1 : 0, transition: "opacity 0.4s ease" }}>
          <div className="badge fade-up" style={{ marginBottom: 24 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#0ea5e9", display: "inline-block", animation: "pulse 2s infinite" }} />
            Our story
          </div>
          <h1 className="fade-up delay-1" style={{
            fontSize: "clamp(48px, 6vw, 72px)",
            fontWeight: 700, letterSpacing: "-0.04em",
            lineHeight: 1.05, color: "#fff", marginBottom: 24
          }}>
            Built by founders,<br />
            <span className="glow-text">for founders.</span>
          </h1>
          <p className="fade-up delay-2" style={{
            fontSize: 18, color: "#64748b", lineHeight: 1.75,
            maxWidth: 560, marginBottom: 40
          }}>
            FundFlow was born out of frustration. We watched brilliant Web3 founders lose deals not because their projects weren't good enough — but because they had no system to manage their investor relationships.
          </p>
          <p className="fade-up delay-3" style={{
            fontSize: 18, color: "#64748b", lineHeight: 1.75,
            maxWidth: 560
          }}>
            So we built the tool we wished existed. A CRM that actually understands Web3 — token rounds, SAFTs, wallet-based identity, and the speed at which crypto moves.
          </p>
        </div>
      </section>

      {/* STATS */}
      <section style={{
        borderTop: "1px solid rgba(255,255,255,0.05)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        background: "rgba(255,255,255,0.01)",
        position: "relative", zIndex: 2
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4, 1fr)" }}>
          {[
            { num: "2,400+", label: "Founders onboarded" },
            { num: "$840M", label: "Funding tracked" },
            { num: "94%", label: "Faster deal flow" },
            { num: "99.9%", label: "Uptime guaranteed" },
          ].map((s, i) => (
            <div key={i} className="stat-block">
              <div style={{
                fontSize: 44, fontWeight: 700, letterSpacing: "-0.03em",
                background: "linear-gradient(135deg, #fff, #0ea5e9)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                marginBottom: 8
              }}>{s.num}</div>
              <div style={{ fontSize: 14, color: "#475569" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* MISSION */}
      <section style={{ padding: "100px 64px", maxWidth: 1100, margin: "0 auto", position: "relative", zIndex: 2 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
          <div>
            <div className="badge" style={{ marginBottom: 20 }}>Our mission</div>
            <h2 style={{
              fontSize: 42, fontWeight: 700, letterSpacing: "-0.03em",
              color: "#fff", lineHeight: 1.15, marginBottom: 24
            }}>
              Make fundraising as efficient as the blockchain itself.
            </h2>
            <p style={{ fontSize: 16, color: "#475569", lineHeight: 1.8, marginBottom: 20 }}>
              The blockchain promised to democratize finance. But fundraising still runs on spreadsheets, scattered emails, and memory. That's the problem we're solving.
            </p>
            <p style={{ fontSize: 16, color: "#475569", lineHeight: 1.8 }}>
              FundFlow gives every Web3 founder — from pre-seed to Series A — the same deal flow infrastructure that top-tier startups use. No excuses. No lost leads.
            </p>
          </div>

          {/* Visual element */}
          <div style={{
            background: "rgba(14,165,233,0.04)",
            border: "1px solid rgba(14,165,233,0.12)",
            borderRadius: 20, padding: 40,
            animation: "float 5s ease-in-out infinite"
          }}>
            <div style={{ marginBottom: 24, fontSize: 13, color: "#475569", letterSpacing: "0.05em", textTransform: "uppercase" }}>Live pipeline activity</div>
            {[
              { action: "Deal moved to Term Sheet", investor: "Paradigm", time: "2m ago", color: "#0ea5e9" },
              { action: "New investor added", investor: "a16z Crypto", time: "15m ago", color: "#10b981" },
              { action: "Meeting scheduled", investor: "Coinbase Ventures", time: "1h ago", color: "#8b5cf6" },
              { action: "Round closed", investor: "Multicoin Capital", time: "3h ago", color: "#f59e0b" },
            ].map((a, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "12px 0",
                borderBottom: i < 3 ? "1px solid rgba(255,255,255,0.04)" : "none"
              }}>
                <div style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: a.color, flexShrink: 0,
                  boxShadow: `0 0 8px ${a.color}`
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: "#e2e8f0", fontWeight: 500 }}>{a.action}</div>
                  <div style={{ fontSize: 11, color: "#475569" }}>{a.investor}</div>
                </div>
                <div style={{ fontSize: 11, color: "#334155", fontFamily: "JetBrains Mono, monospace" }}>{a.time}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section style={{
        padding: "80px 64px",
        borderTop: "1px solid rgba(255,255,255,0.05)",
        position: "relative", zIndex: 2
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div className="badge" style={{ marginBottom: 20 }}>What we believe</div>
            <h2 style={{
              fontSize: 42, fontWeight: 700, letterSpacing: "-0.03em",
              color: "#fff", lineHeight: 1.15
            }}>Our values</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
            {values.map((v, i) => (
              <div key={i} className="value-card">
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: "rgba(14,165,233,0.08)",
                  border: "1px solid rgba(14,165,233,0.15)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 20, marginBottom: 16
                }}>{v.icon}</div>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: "#fff", marginBottom: 10, letterSpacing: "-0.01em" }}>{v.title}</h3>
                <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.7 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TEAM */}
      <section style={{
        padding: "80px 64px 100px",
        borderTop: "1px solid rgba(255,255,255,0.05)",
        position: "relative", zIndex: 2
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div className="badge" style={{ marginBottom: 20 }}>The team</div>
            <h2 style={{
              fontSize: 42, fontWeight: 700, letterSpacing: "-0.03em",
              color: "#fff", lineHeight: 1.15
            }}>
              The people behind<br />
              <span className="glow-text">FundFlow</span>
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            {team.map((member, i) => (
              <div key={i} className="team-card" style={{ ["--card-color" as string]: member.color }}>
                <div style={{
                  position: "absolute", inset: 0, borderRadius: 20,
                  background: `linear-gradient(135deg, ${member.color}08, transparent 60%)`,
                  opacity: 0, transition: "opacity 0.3s"
                }} className="card-glow" />

                {/* Avatar */}
                <div style={{
                  width: 64, height: 64, borderRadius: 16,
                  background: `${member.color}15`,
                  border: `1px solid ${member.color}30`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 20, fontWeight: 700, color: member.color,
                  marginBottom: 20, letterSpacing: "-0.02em"
                }}>{member.initial}</div>

                <div style={{ marginBottom: 4 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: "#fff", letterSpacing: "-0.02em" }}>{member.name}</h3>
                </div>
                <div style={{
                  fontSize: 12, fontWeight: 600, color: member.color,
                  letterSpacing: "0.05em", textTransform: "uppercase",
                  marginBottom: 16
                }}>{member.role}</div>

                <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.75, marginBottom: 20 }}>{member.bio}</p>

                <div style={{
                  fontSize: 12, color: "#334155",
                  fontFamily: "JetBrains Mono, monospace"
                }}>{member.handle}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{
        padding: "80px 64px 120px",
        position: "relative", zIndex: 2
      }}>
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
          <div className="badge" style={{ marginBottom: 24, position: "relative" }}>Ready to start?</div>
          <h2 style={{
            fontSize: 48, fontWeight: 700, color: "#fff",
            letterSpacing: "-0.03em", marginBottom: 16,
            position: "relative"
          }}>
            Join the founders<br />
            <span className="glow-text">closing deals on FundFlow.</span>
          </h2>
          <p style={{ color: "#475569", marginBottom: 40, fontSize: 16, position: "relative" }}>
            Free to start. No credit card required. Set up in minutes.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", position: "relative" }}>
            <Link href="/register" className="btn-primary" style={{ fontSize: 15, padding: "14px 40px" }}>
              Start for free →
            </Link>
            <Link href="/#features" className="btn-ghost" style={{ fontSize: 15, padding: "14px 40px" }}>
              See features
            </Link>
          </div>
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