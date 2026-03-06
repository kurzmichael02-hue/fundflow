"use client"
import { useEffect, useState, useRef } from "react"
import Link from "next/link"

const TICKER = ["SEED $2.4M ▲", "SERIES-A $18M ▲", "PRE-SEED $800K ▲", "BRIDGE $5M ▲", "SERIES-B $40M ▲"]

function useTypingEffect(text: string, speed = 40) {
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

export default function Home() {
  const [time, setTime] = useState("")
  const [tickerPos, setTickerPos] = useState(0)
  const [hoverBtn, setHoverBtn] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const typed = useTypingEffect("Track investors. Close rounds. Ship faster.")

  useEffect(() => {
    const t = setInterval(() => {
      const now = new Date()
      setTime(now.toLocaleTimeString("en-US", { hour12: false }))
    }, 1000)
    const ticker = setInterval(() => setTickerPos(p => p - 1), 20)
    const mouse = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY })
    window.addEventListener("mousemove", mouse)
    return () => { clearInterval(t); clearInterval(ticker); window.removeEventListener("mousemove", mouse) }
  }, [])

  return (
    <main style={{
      background: "#080808",
      minHeight: "100vh",
      fontFamily: "'Courier New', Courier, monospace",
      color: "#e8e8e8",
      overflowX: "hidden",
      cursor: "crosshair"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400&family=Bebas+Neue&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        ::selection { background: #b4ff00; color: #080808; }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #080808; }
        ::-webkit-scrollbar-thumb { background: #b4ff00; }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .cursor { display: inline-block; width: 2px; height: 1em; background: #b4ff00; animation: blink 1s infinite; vertical-align: text-bottom; margin-left: 2px; }

        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        .scanline {
          position: fixed; left: 0; right: 0; height: 2px;
          background: linear-gradient(transparent, rgba(180,255,0,0.03), transparent);
          animation: scanline 8s linear infinite;
          pointer-events: none; z-index: 999;
        }

        @keyframes flicker {
          0%, 95%, 100% { opacity: 1; }
          96% { opacity: 0.8; }
          97% { opacity: 1; }
          98% { opacity: 0.9; }
        }
        body { animation: flicker 10s infinite; }

        .grid-line {
          position: fixed; inset: 0; pointer-events: none; z-index: 0;
          background-image:
            linear-gradient(rgba(180,255,0,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(180,255,0,0.02) 1px, transparent 1px);
          background-size: 80px 80px;
        }

        @keyframes slide-in {
          from { transform: translateX(-100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }

        .stat-block {
          border: 1px solid #1a1a1a;
          padding: 20px 24px;
          transition: all 0.15s;
          position: relative;
        }
        .stat-block:hover {
          border-color: #b4ff00;
          background: rgba(180,255,0,0.03);
        }
        .stat-block:hover::before {
          content: '▶';
          position: absolute;
          left: -12px;
          top: 50%;
          transform: translateY(-50%);
          color: #b4ff00;
          font-size: 10px;
        }

        .nav-link {
          color: #555;
          font-size: 11px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          text-decoration: none;
          transition: color 0.1s;
          padding: 4px 0;
          border-bottom: 1px solid transparent;
        }
        .nav-link:hover { color: #b4ff00; border-bottom-color: #b4ff00; }

        .feature-row {
          display: grid;
          grid-template-columns: 40px 1fr;
          gap: 20px;
          padding: 24px 0;
          border-top: 1px solid #111;
          align-items: start;
          transition: all 0.15s;
        }
        .feature-row:hover { background: rgba(180,255,0,0.02); margin: 0 -32px; padding-left: 32px; padding-right: 32px; }

        .terminal-box {
          background: #0a0a0a;
          border: 1px solid #1a1a1a;
          padding: 24px;
          font-size: 12px;
          line-height: 1.8;
          position: relative;
          overflow: hidden;
        }
        .terminal-box::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 28px;
          background: #111;
          border-bottom: 1px solid #1a1a1a;
        }
        .terminal-dots {
          position: absolute;
          top: 9px; left: 12px;
          display: flex; gap: 5px;
        }
        .dot { width: 9px; height: 9px; border-radius: 50%; }
        .terminal-content { margin-top: 20px; }

        .price-card {
          border: 1px solid #1a1a1a;
          padding: 32px;
          transition: all 0.2s;
        }
        .price-card:hover { border-color: #b4ff00; }
        .price-card.featured { border-color: #b4ff00; background: rgba(180,255,0,0.03); }

        .btn-main {
          display: inline-block;
          padding: 14px 36px;
          background: #b4ff00;
          color: #080808;
          font-family: 'Space Mono', monospace;
          font-weight: 700;
          font-size: 13px;
          letter-spacing: 0.05em;
          text-decoration: none;
          border: none;
          transition: all 0.1s;
          position: relative;
        }
        .btn-main:hover {
          background: #c8ff33;
          transform: translate(-2px, -2px);
          box-shadow: 4px 4px 0px #b4ff00;
        }
        .btn-main:active { transform: translate(0, 0); box-shadow: none; }

        .btn-ghost {
          display: inline-block;
          padding: 14px 36px;
          background: transparent;
          color: #555;
          font-family: 'Space Mono', monospace;
          font-size: 13px;
          letter-spacing: 0.05em;
          text-decoration: none;
          border: 1px solid #222;
          transition: all 0.1s;
        }
        .btn-ghost:hover { border-color: #555; color: #e8e8e8; }

        .number-big {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 72px;
          line-height: 1;
          color: #b4ff00;
          letter-spacing: 0.02em;
        }

        .section-label {
          font-size: 10px;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: #333;
          margin-bottom: 48px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .section-label::after {
          content: '';
          flex: 1;
          height: 1px;
          background: #1a1a1a;
        }

        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .marquee-inner {
          display: flex;
          gap: 48px;
          animation: marquee 20s linear infinite;
          white-space: nowrap;
        }

        .pipeline-col {
          min-width: 140px;
          border-right: 1px solid #111;
          padding-right: 20px;
        }
        .pipeline-item {
          background: #0f0f0f;
          border: 1px solid #1a1a1a;
          padding: 10px 12px;
          margin-bottom: 8px;
          font-size: 11px;
        }
      `}</style>

      <div className="scanline" />
      <div className="grid-line" />

      {/* TOP BAR */}
      <div style={{
        background: "#b4ff00", color: "#080808",
        padding: "6px 32px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        fontSize: 11, letterSpacing: "0.1em", fontWeight: 700,
        position: "relative", zIndex: 10
      }}>
        <span>FUNDFLOW TERMINAL v1.0</span>
        <span>NYSE: SEED ▲ 2.4% — NASDAQ: WEB3 ▲ 8.1% — {time} UTC</span>
        <span>● SYSTEM OPERATIONAL</span>
      </div>

      {/* TICKER */}
      <div style={{
        background: "#0d0d0d", borderBottom: "1px solid #1a1a1a",
        padding: "8px 0", overflow: "hidden",
        position: "relative", zIndex: 10
      }}>
        <div className="marquee-inner">
          {[...TICKER, ...TICKER].map((t, i) => (
            <span key={i} style={{ fontSize: 11, color: "#b4ff00", letterSpacing: "0.1em" }}>
              {t} &nbsp;/&nbsp;
            </span>
          ))}
        </div>
      </div>

      {/* NAV */}
      <nav style={{
        padding: "20px 64px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        borderBottom: "1px solid #111",
        position: "relative", zIndex: 10
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{
            width: 28, height: 28,
            background: "#b4ff00",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, fontWeight: 900, color: "#080808"
          }}>FF</div>
          <span style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: 22, letterSpacing: "0.1em", color: "#fff" }}>FUNDFLOW</span>
        </div>
        <div style={{ display: "flex", gap: 32 }}>
          {["Terminal", "Features", "Pricing", "Docs"].map(l => (
            <a key={l} href="#" className="nav-link">{l}</a>
          ))}
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <Link href="/login" className="btn-ghost" style={{ padding: "8px 20px", fontSize: 11 }}>LOGIN_</Link>
          <Link href="/register" className="btn-main" style={{ padding: "8px 20px", fontSize: 11 }}>ACCESS →</Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ padding: "80px 64px 64px", position: "relative", zIndex: 2 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "start" }}>
            <div>
              <div style={{
                fontSize: 10, letterSpacing: "0.3em", color: "#333",
                marginBottom: 32, textTransform: "uppercase"
              }}>// fundraising_os.exe — initialized</div>

              <h1 style={{
                fontFamily: "Bebas Neue, sans-serif",
                fontSize: "clamp(64px, 7vw, 96px)",
                lineHeight: 0.95,
                color: "#fff",
                letterSpacing: "0.02em",
                marginBottom: 32
              }}>
                CLOSE<br />
                YOUR<br />
                <span style={{ color: "#b4ff00" }}>ROUND.</span>
              </h1>

              <p style={{
                fontSize: 13, color: "#555", lineHeight: 1.9,
                marginBottom: 48, maxWidth: 420,
                borderLeft: "2px solid #b4ff00",
                paddingLeft: 16
              }}>
                {typed}<span className="cursor" />
              </p>

              <div style={{ display: "flex", gap: 12, marginBottom: 48 }}>
                <Link href="/register" className="btn-main">GET ACCESS →</Link>
                <Link href="/login" className="btn-ghost">LOGIN_</Link>
              </div>

              <div style={{ display: "flex", gap: 32, paddingTop: 32, borderTop: "1px solid #111" }}>
                {[["2,400+", "Founders"], ["$840M", "Tracked"], ["94%", "Close Rate"]].map(([val, label]) => (
                  <div key={label}>
                    <div style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: 28, color: "#b4ff00", letterSpacing: "0.05em" }}>{val}</div>
                    <div style={{ fontSize: 10, color: "#333", letterSpacing: "0.15em", textTransform: "uppercase" }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Terminal preview */}
            <div className="terminal-box" style={{ marginTop: 20 }}>
              <div className="terminal-dots">
                <div className="dot" style={{ background: "#333" }} />
                <div className="dot" style={{ background: "#333" }} />
                <div className="dot" style={{ background: "#b4ff00" }} />
              </div>
              <div className="terminal-content" style={{ color: "#555" }}>
                <div><span style={{ color: "#b4ff00" }}>$</span> fundflow --status</div>
                <br />
                <div style={{ color: "#333" }}>── Investors tracked: <span style={{ color: "#fff" }}>47</span></div>
                <div style={{ color: "#333" }}>── Pipeline stages: <span style={{ color: "#fff" }}>5</span></div>
                <div style={{ color: "#333" }}>── Active deals: <span style={{ color: "#b4ff00" }}>12</span></div>
                <div style={{ color: "#333" }}>── Meetings this week: <span style={{ color: "#fff" }}>3</span></div>
                <br />
                <div><span style={{ color: "#b4ff00" }}>$</span> pipeline --list</div>
                <br />
                {[
                  { name: "a16z", stage: "MEETING", val: "$5M", color: "#fbbf24" },
                  { name: "Paradigm", stage: "TERM_SHEET", val: "$12M", color: "#00c8ff" },
                  { name: "Sequoia", stage: "OUTREACH", val: "TBD", color: "#555" },
                  { name: "Coinbase Ventures", stage: "CLOSED ✓", val: "$2.4M", color: "#b4ff00" },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ color: "#888" }}>{item.name}</span>
                    <span style={{ color: item.color, fontSize: 11 }}>[{item.stage}]</span>
                    <span style={{ color: "#444" }}>{item.val}</span>
                  </div>
                ))}
                <br />
                <div><span style={{ color: "#b4ff00" }}>$</span> <span className="cursor" /></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS ROW */}
      <section style={{ borderTop: "1px solid #111", borderBottom: "1px solid #111", position: "relative", zIndex: 2 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)" }}>
          {[
            { num: "47ms", label: "Avg response time" },
            { num: "99.9%", label: "Uptime SLA" },
            { num: "2.4K", label: "Active founders" },
            { num: "$840M", label: "Funding tracked" },
          ].map((s, i) => (
            <div key={i} className="stat-block" style={{ borderLeft: i > 0 ? "1px solid #111" : "none" }}>
              <div className="number-big">{s.num}</div>
              <div style={{ fontSize: 11, color: "#333", letterSpacing: "0.15em", textTransform: "uppercase", marginTop: 8 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding: "80px 64px", position: "relative", zIndex: 2 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="section-label">01 — Core modules</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80 }}>
            <div>
              {[
                { n: "01", title: "Investor CRM", desc: "Every investor, their status, emails, notes, and follow-ups. Never lose a warm lead again." },
                { n: "02", title: "Kanban Pipeline", desc: "Outreach → Interested → Meeting → Term Sheet → Closed. Move deals forward in one click." },
                { n: "03", title: "Live Dashboard", desc: "Real-time stats. Total investors, active leads, meetings, and closed deals — all live." },
                { n: "04", title: "Secure by default", desc: "Your deal flow is your moat. End-to-end encrypted, zero third-party data sharing." },
              ].map(f => (
                <div key={f.n} className="feature-row">
                  <div style={{ fontSize: 10, color: "#b4ff00", letterSpacing: "0.1em", paddingTop: 2 }}>{f.n}</div>
                  <div>
                    <div style={{ fontSize: 14, color: "#fff", fontWeight: 700, marginBottom: 8, letterSpacing: "0.05em" }}>{f.title}</div>
                    <div style={{ fontSize: 12, color: "#444", lineHeight: 1.7 }}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pipeline visual */}
            <div>
              <div style={{
                border: "1px solid #1a1a1a", padding: "24px",
                background: "#0a0a0a", position: "relative"
              }}>
                <div style={{ fontSize: 10, color: "#333", letterSpacing: "0.2em", marginBottom: 20 }}>PIPELINE // LIVE VIEW</div>
                <div style={{ display: "flex", gap: 16, overflowX: "auto" }}>
                  {[
                    { label: "OUTREACH", color: "#333", items: ["a16z", "Multicoin"] },
                    { label: "MEETING", color: "#fbbf24", items: ["Paradigm"] },
                    { label: "CLOSED", color: "#b4ff00", items: ["Coinbase V."] },
                  ].map(col => (
                    <div key={col.label} className="pipeline-col">
                      <div style={{ fontSize: 9, color: col.color, letterSpacing: "0.2em", marginBottom: 12 }}>{col.label}</div>
                      {col.items.map(item => (
                        <div key={item} className="pipeline-item" style={{ color: "#555" }}>{item}</div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section style={{ padding: "80px 64px", borderTop: "1px solid #111", position: "relative", zIndex: 2 }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div className="section-label">02 — Pricing</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {[
              {
                name: "STARTER", price: "FREE", sub: "forever",
                features: ["25 investors max", "Pipeline tracking", "Basic dashboard", "Community support"],
                cta: "GET ACCESS →", featured: false
              },
              {
                name: "PRO", price: "$99", sub: "/month",
                features: ["Unlimited investors", "Advanced analytics", "Investor network", "Priority support", "API access"],
                cta: "START TRIAL →", featured: true
              },
            ].map(plan => (
              <div key={plan.name} className={`price-card ${plan.featured ? "featured" : ""}`}>
                <div style={{ fontSize: 10, color: plan.featured ? "#b4ff00" : "#333", letterSpacing: "0.2em", marginBottom: 16 }}>{plan.name}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 32 }}>
                  <span style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: 56, color: "#fff", letterSpacing: "0.02em" }}>{plan.price}</span>
                  <span style={{ color: "#333", fontSize: 12 }}>{plan.sub}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
                  {plan.features.map(f => (
                    <div key={f} style={{ display: "flex", gap: 12, fontSize: 12, color: "#555" }}>
                      <span style={{ color: "#b4ff00" }}>+</span> {f}
                    </div>
                  ))}
                </div>
                <Link href="/register" className={plan.featured ? "btn-main" : "btn-ghost"} style={{ display: "block", textAlign: "center" }}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "80px 64px 120px", borderTop: "1px solid #111", position: "relative", zIndex: 2 }}>
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
          <div style={{ fontSize: 10, color: "#333", letterSpacing: "0.3em", marginBottom: 24, textTransform: "uppercase" }}>// ready to ship?</div>
          <h2 style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: 80, color: "#fff", letterSpacing: "0.02em", lineHeight: 1, marginBottom: 16 }}>
            CLOSE YOUR<br /><span style={{ color: "#b4ff00" }}>FUNDING ROUND.</span>
          </h2>
          <p style={{ color: "#333", fontSize: 13, marginBottom: 48 }}>Join 2,400+ Web3 founders who track their investor pipeline on FundFlow.</p>
          <Link href="/register" className="btn-main" style={{ fontSize: 15, padding: "18px 56px" }}>GET ACCESS NOW →</Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        padding: "24px 64px",
        borderTop: "1px solid #111",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        background: "#050505"
      }}>
        <span style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: 18, letterSpacing: "0.1em", color: "#222" }}>FUNDFLOW</span>
        <span style={{ fontSize: 10, color: "#222", letterSpacing: "0.1em" }}>© 2026 — BUILT FOR WEB3 FOUNDERS</span>
        <span style={{ fontSize: 10, color: "#b4ff00", letterSpacing: "0.1em" }}>● LIVE</span>
      </footer>
    </main>
  )
}