"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import PublicNav from "@/components/PublicNav"
import PublicFooter from "@/components/PublicFooter"
import {
  RiCheckLine, RiArrowRightLine,
  RiAddLine, RiSubtractLine,
  RiWallet3Line, RiQrCodeLine, RiPencilLine,
  RiFlashlightLine, RiDownloadLine,
  RiMailLine, RiRadioButtonLine,
} from "react-icons/ri"

// ─────────────────────────────────────────────────────────────────────────────
// Design direction (April 2026 rewrite)
//
// Old landing used the familiar dark-emerald-gradient-glow SaaS-template stack:
// mouse-follow glow, grain overlay, gradient text, pulsing dots, rounded-2xl
// everywhere. That stack reads as AI-boilerplate in 2026, especially for a
// product targeting founders and VCs who read Paradigm / Variant / a16z.
//
// New direction:
//   · Editorial / magazine rhythm — asymmetric, left-aligned, text-led.
//   · Fraunces (serif, optical size) for display. Dignified, not fintech-loud.
//   · JetBrains Mono for kickers, dates, URLs, numbers — "the facts".
//   · DM Sans for body copy. No change there.
//   · Almost no color — dark background + off-white text. Emerald shows up
//     in exactly three places: the accent rule under the masthead, the
//     primary CTA, and the status dots on the mocks.
//   · No gradients on text. No glows. No mouse-tracking ambient. No grain.
//     No pulsing dots. No transform-on-hover card lift.
//   · Hard hairline borders (rgba white 4%) instead of soft shadows.
// ─────────────────────────────────────────────────────────────────────────────

const FAQS = [
  { q: "Is FundFlow really free to start?", a: "Yes. Starter is free forever up to 25 investors. Full pipeline, basic analytics, no card required. Upgrade to Pro when you need more seats." },
  { q: "What's the difference between Free and Pro?", a: "Free caps at 25 investors. Pro is $99/month, gives you unlimited investors, advanced analytics, the curated investor directory, and priority support." },
  { q: "Can I cancel my Pro subscription anytime?", a: "Yes — one click from the Stripe billing portal. No contracts, no cancellation fees. Access stays active until the end of the period you already paid for." },
  { q: "Is my fundraising data secure?", a: "Data is stored on Supabase in Frankfurt (EU). Encryption at rest and in transit. Server writes to sensitive columns (plan, Stripe IDs) are locked behind a whitelist and the Stripe webhook. We don't sell or share your data." },
  { q: "What is the Investor Portal?", a: "A separate entry point for VCs. They register, browse active deals from founders on the platform, and tap Express Interest to signal you. You get an email immediately and a realtime badge on the dashboard." },
  { q: "Do you support Web3 / crypto payments?", a: "Card, PayPal, Google Pay, and SEPA via Stripe today. Native crypto checkout is on the roadmap — wallet login is already live on the profile page." },
]

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  useEffect(() => {
    // Fade-in-on-scroll for elements marked with .reveal
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

      {/* ─── HERO ─── editorial masthead + asymmetric split */}
      <section>
        <div className="max-w-[1180px] mx-auto px-6 md:px-10">
          {/* Issue strip */}
          <div className="flex items-center justify-between pt-10 md:pt-14 pb-8 md:pb-12"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <span className="mono" style={{ fontSize: 11, color: "#64748b", letterSpacing: "0.12em", textTransform: "uppercase" }}>
              Issue 01 · Spring 2026
            </span>
            <span className="mono hidden sm:inline" style={{ fontSize: 11, color: "#64748b", letterSpacing: "0.12em", textTransform: "uppercase" }}>
              Investor CRM · Built for Web3
            </span>
            <span className="mono flex items-center gap-1.5" style={{ fontSize: 11, color: "#34d399", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981" }} />
              Live
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] gap-10 lg:gap-20 pt-12 md:pt-20 pb-16 md:pb-24 items-start">
            {/* Left column — editorial block */}
            <div>
              <h1 className="serif text-white" style={{
                fontSize: "clamp(56px, 8.5vw, 120px)",
                lineHeight: 0.92,
                letterSpacing: "-0.045em",
                fontWeight: 500,
              }}>
                Raise the<br />
                <span style={{ fontStyle: "italic", fontWeight: 400 }}>round.</span>
              </h1>
              <p style={{
                fontSize: 18, lineHeight: 1.55, color: "#94a3b8",
                marginTop: 28, maxWidth: 480, fontWeight: 300,
              }}>
                FundFlow is a private pipeline for every investor you're talking to, and a public
                page where the rest of them can find you. Drop the spreadsheet, stop losing
                deals to bad tracking.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mt-10">
                <Link href="/register" className="no-underline flex items-center justify-center gap-2"
                  style={{
                    background: "#10b981", color: "#fff",
                    padding: "14px 22px", borderRadius: 2,
                    fontSize: 14, fontWeight: 600,
                  }}>
                  Start for free <RiArrowRightLine size={14} />
                </Link>
                <Link href="/investor" className="no-underline flex items-center justify-center gap-2"
                  style={{
                    color: "#e5e7eb", padding: "14px 22px",
                    border: "1px solid rgba(255,255,255,0.12)", borderRadius: 2,
                    fontSize: 14, fontWeight: 500,
                  }}>
                  Investor portal →
                </Link>
              </div>

              <div className="mono flex flex-wrap gap-x-8 gap-y-2 mt-10"
                style={{ fontSize: 11, color: "#475569", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                <span>Free up to 25 investors</span>
                <span>·</span>
                <span>No credit card</span>
                <span>·</span>
                <span>EU-hosted</span>
              </div>
            </div>

            {/* Right column — pipeline visual, subtler than before */}
            <div className="reveal">
              <HeroPipeline />
            </div>
          </div>
        </div>
      </section>

      {/* ─── TRUST LINE ─── single mono row, no logo wall ─── */}
      <section style={{ borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-[1180px] mx-auto px-6 md:px-10 py-5 flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-10">
          <span className="mono" style={{ fontSize: 11, color: "#475569", letterSpacing: "0.12em", textTransform: "uppercase" }}>
            In use
          </span>
          <div className="mono flex flex-wrap gap-x-7 gap-y-2" style={{ fontSize: 12, color: "#94a3b8" }}>
            <span>Web3 founders raising pre-seed through Series A</span>
            <span style={{ color: "#334155" }}>·</span>
            <span>Solo GPs</span>
            <span style={{ color: "#334155" }}>·</span>
            <span>Emerging fund managers</span>
          </div>
        </div>
      </section>

      {/* ─── SECTION INTRO — "What's inside" ─── */}
      <section id="features" style={{ paddingTop: 100, paddingBottom: 40 }}>
        <div className="max-w-[1180px] mx-auto px-6 md:px-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-3">
              <p className="mono" style={{ fontSize: 11, color: "#10b981", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                § The product
              </p>
            </div>
            <div className="md:col-span-9">
              <h2 className="serif text-white" style={{
                fontSize: "clamp(36px, 5vw, 64px)", lineHeight: 1, letterSpacing: "-0.04em", fontWeight: 500,
              }}>
                Four surfaces.<br />
                <span style={{ fontStyle: "italic", fontWeight: 400, color: "#cbd5e1" }}>One round.</span>
              </h2>
              <p style={{ fontSize: 17, lineHeight: 1.6, color: "#94a3b8", marginTop: 24, maxWidth: 560, fontWeight: 300 }}>
                Not a generic CRM with a crypto sticker on it. Each of these is a distinct
                view with its own job — the private side for tracking, the public side for
                getting found, and the numbers to tell you if the round is actually moving.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── DEEP DIVES ─── four full-width sections with product mocks */}
      <DeepDive
        number="01"
        kicker="Pipeline"
        headline={<>Drag a deal<br /><em style={{ fontWeight: 400 }}>through every stage.</em></>}
        body="The Kanban view of every investor you've talked to, grouped by status. Optimistic drag-and-drop, notes stay attached, nothing gets lost in a spreadsheet named final_v3_FINAL.xlsx."
        bullets={[
          "Outreach → Closed in five moves",
          "Per-card status, deal size, email, notes",
          "Mobile tabs on phone, columns on desktop",
        ]}
        visual={<KanbanMock />}
      />

      <DeepDive
        number="02"
        kicker="Deal room"
        reverse
        headline={<>A public page<br /><em style={{ fontWeight: 400 }}>investors can find you on.</em></>}
        body="Publish your project once. It shows up on the investor side where VCs filter by stage, chain, and sector. When someone taps Express Interest you get an email, a realtime badge on the dashboard, and a row in the interests table."
        bullets={[
          "Stage · chain · tags · goal · raised",
          "One-click Express Interest — dedup'd per email",
          "Resend email to the founder on every signal",
        ]}
        visual={<DealRoomMock />}
      />

      <DeepDive
        number="03"
        kicker="Signal"
        headline={<>Know where<br /><em style={{ fontWeight: 400 }}>the round actually stands.</em></>}
        body="The analytics page turns your pipeline into a funnel with real percentages — not vanity metrics. Conversion from outreach to close, response rate, total committed, and the top cheques ranked by size."
        bullets={[
          "Outreach → Closed conversion funnel",
          "Scale-aware $k/$M/$B parsing — $5M is five million, not five",
          "Weekly interest signal chart from the deal room",
        ]}
        visual={<SignalMock />}
      />

      <DeepDive
        number="04"
        kicker="Identity"
        reverse
        headline={<>Web3-native<br /><em style={{ fontWeight: 400 }}>from day one.</em></>}
        body="Wallet connect is a first-class login method, not a retrofit. Pair your address to your profile via MetaMask, WalletConnect, or paste. Then browse the curated investor directory — 30+ funds tagged by sector, stage, check size, and Web3 focus."
        bullets={[
          "MetaMask + WalletConnect v2 + manual paste",
          "Curated directory — check size, sector, location",
          "Add any fund to your pipeline in one tap",
        ]}
        visual={<IdentityMock />}
      />

      {/* ─── ALSO INCLUDED ─── single hairline row ─── */}
      <section style={{ marginTop: 40 }}>
        <div className="max-w-[1180px] mx-auto px-6 md:px-10">
          <div className="py-6 flex flex-wrap gap-x-10 gap-y-3 items-center"
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <span className="mono" style={{ fontSize: 11, color: "#475569", letterSpacing: "0.12em", textTransform: "uppercase" }}>
              Also included
            </span>
            {[
              { icon: <RiRadioButtonLine size={13} />, label: "Realtime sync" },
              { icon: <RiDownloadLine size={13} />, label: "CSV export (RFC 4180)" },
              { icon: <RiMailLine size={13} />, label: "Email notifications" },
              { icon: <RiFlashlightLine size={13} />, label: "Password recovery" },
            ].map(item => (
              <span key={item.label} className="flex items-center gap-2" style={{ fontSize: 13, color: "#cbd5e1" }}>
                <span style={{ color: "#10b981" }}>{item.icon}</span>
                {item.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ─── one table, no twin-cards ─── */}
      <section id="pricing" style={{ paddingTop: 100, paddingBottom: 100 }}>
        <div className="max-w-[1180px] mx-auto px-6 md:px-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-14">
            <div className="md:col-span-3">
              <p className="mono" style={{ fontSize: 11, color: "#10b981", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                § Pricing
              </p>
            </div>
            <div className="md:col-span-9">
              <h2 className="serif text-white" style={{
                fontSize: "clamp(36px, 5vw, 64px)", lineHeight: 1, letterSpacing: "-0.04em", fontWeight: 500,
              }}>
                Free until<br />
                <span style={{ fontStyle: "italic", fontWeight: 400, color: "#cbd5e1" }}>you're serious.</span>
              </h2>
            </div>
          </div>

          {/* Pricing grid — two plans as rows in a shared table, not twin cards */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            {[
              {
                name: "Starter",
                price: "$0",
                cadence: "Forever",
                desc: "Everything you need to run a first round.",
                featured: false,
                features: [
                  "Up to 25 investors",
                  "Full pipeline + Kanban",
                  "Public deal-flow page",
                  "Basic analytics",
                  "Email notifications",
                ],
                cta: "Start free",
              },
              {
                name: "Pro",
                price: "$99",
                cadence: "per month",
                desc: "For founders closing serious rounds.",
                featured: true,
                features: [
                  "Unlimited investors",
                  "Advanced analytics + funnel",
                  "Curated investor directory",
                  "API access (coming soon)",
                  "Priority support",
                ],
                cta: "Upgrade to Pro",
              },
            ].map((plan) => (
              <div key={plan.name}
                className="grid grid-cols-1 md:grid-cols-12 gap-6 py-10"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="md:col-span-3 flex flex-col gap-2">
                  <p className="mono" style={{
                    fontSize: 11, color: plan.featured ? "#10b981" : "#64748b",
                    letterSpacing: "0.12em", textTransform: "uppercase",
                  }}>
                    {plan.name}{plan.featured && " · Recommended"}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="serif text-white" style={{ fontSize: 56, fontWeight: 500, letterSpacing: "-0.03em", lineHeight: 1 }}>
                      {plan.price}
                    </span>
                    <span className="mono" style={{ fontSize: 12, color: "#64748b", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                      {plan.cadence}
                    </span>
                  </div>
                  <p style={{ fontSize: 14, color: "#94a3b8", maxWidth: 240, marginTop: 4 }}>{plan.desc}</p>
                </div>
                <div className="md:col-span-6">
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-start gap-2.5" style={{ fontSize: 14, color: "#cbd5e1" }}>
                        <RiCheckLine size={14} style={{ color: "#10b981", marginTop: 4, flexShrink: 0 }} />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="md:col-span-3 flex md:justify-end items-start">
                  <Link href="/register" className="no-underline flex items-center justify-center gap-2 w-full md:w-auto"
                    style={{
                      background: plan.featured ? "#10b981" : "transparent",
                      color: plan.featured ? "#fff" : "#e5e7eb",
                      border: plan.featured ? "1px solid #10b981" : "1px solid rgba(255,255,255,0.14)",
                      padding: "12px 20px", borderRadius: 2,
                      fontSize: 13, fontWeight: 600,
                    }}>
                    {plan.cta} <RiArrowRightLine size={13} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── editorial, full-width divider-based ─── */}
      <section id="faq" style={{ paddingTop: 60, paddingBottom: 120 }}>
        <div className="max-w-[1180px] mx-auto px-6 md:px-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-14">
            <div className="md:col-span-3">
              <p className="mono" style={{ fontSize: 11, color: "#10b981", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                § FAQ
              </p>
            </div>
            <div className="md:col-span-9">
              <h2 className="serif text-white" style={{
                fontSize: "clamp(36px, 5vw, 64px)", lineHeight: 1, letterSpacing: "-0.04em", fontWeight: 500,
              }}>
                Questions,<br />
                <span style={{ fontStyle: "italic", fontWeight: 400, color: "#cbd5e1" }}>honestly answered.</span>
              </h2>
            </div>
          </div>

          <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            {FAQS.map((faq, i) => {
              const open = openFaq === i
              return (
                <div key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                  <button onClick={() => setOpenFaq(open ? null : i)}
                    className="w-full flex items-start gap-6 text-left cursor-pointer"
                    style={{ background: "transparent", border: 0, padding: "28px 0" }}>
                    <span className="mono" style={{ fontSize: 12, color: "#475569", letterSpacing: "0.08em", marginTop: 6, minWidth: 32 }}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="serif flex-1" style={{ fontSize: 22, fontWeight: 500, letterSpacing: "-0.02em", color: open ? "#fff" : "#e5e7eb", lineHeight: 1.3 }}>
                      {faq.q}
                    </span>
                    <span style={{ color: open ? "#10b981" : "#64748b", marginTop: 8 }}>
                      {open ? <RiSubtractLine size={18} /> : <RiAddLine size={18} />}
                    </span>
                  </button>
                  {open && (
                    <div className="grid grid-cols-1 md:grid-cols-[32px_1fr_18px] gap-6 pb-8">
                      <span />
                      <p style={{ fontSize: 16, color: "#94a3b8", lineHeight: 1.7, maxWidth: 720 }}>
                        {faq.a}
                      </p>
                      <span />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── no neon box, just a full-width editorial footer-lead ─── */}
      <section style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 120, paddingBottom: 120 }}>
        <div className="max-w-[1180px] mx-auto px-6 md:px-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-end">
            <div className="md:col-span-8">
              <p className="mono mb-5" style={{ fontSize: 11, color: "#10b981", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                § Ready when you are
              </p>
              <h2 className="serif text-white" style={{
                fontSize: "clamp(48px, 7vw, 96px)", lineHeight: 0.95, letterSpacing: "-0.045em", fontWeight: 500,
              }}>
                Start tracking<br />
                <span style={{ fontStyle: "italic", fontWeight: 400, color: "#cbd5e1" }}>your round today.</span>
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
                Talk to us →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </main>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// HERO pipeline — compact version of the kanban, sits in the hero right column.
// Kept minimal: 3 stages, tight cards, no browser chrome this time — the
// chrome appears on the deep-dive mocks further down, so doubling it here
// would feel repetitive.
// ─────────────────────────────────────────────────────────────────────────────
function HeroPipeline() {
  const cols: Array<{ label: string; color: string; items: Array<{ name: string; size: string }> }> = [
    { label: "Outreach",   color: "#94a3b8", items: [{ name: "Paradigm", size: "$5M" }, { name: "Multicoin", size: "$2M" }] },
    { label: "Meeting",    color: "#fbbf24", items: [{ name: "a16z Crypto", size: "$10M" }] },
    { label: "Term Sheet", color: "#10b981", items: [{ name: "Coinbase V.", size: "$3M" }] },
  ]
  return (
    <div style={{ border: "1px solid rgba(255,255,255,0.08)", background: "#0a0a0d", borderRadius: 2 }}>
      <div className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <span className="mono" style={{ fontSize: 10, color: "#64748b", letterSpacing: "0.08em", textTransform: "uppercase" }}>
          app · pipeline
        </span>
        <span className="mono flex items-center gap-1.5" style={{ fontSize: 10, color: "#34d399", letterSpacing: "0.08em", textTransform: "uppercase" }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#10b981" }} />
          Live
        </span>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-3 gap-2">
          {cols.map(col => (
            <div key={col.label} style={{ borderTop: `1px solid ${col.color}55`, paddingTop: 10 }}>
              <div className="flex items-center justify-between mb-2.5">
                <span className="mono" style={{ fontSize: 10, color: col.color, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  {col.label}
                </span>
                <span className="mono" style={{ fontSize: 10, color: "#475569" }}>{col.items.length}</span>
              </div>
              <div className="flex flex-col gap-1.5">
                {col.items.map(c => (
                  <div key={c.name} style={{
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    padding: "8px 10px", borderRadius: 2,
                  }}>
                    <div style={{ fontSize: 12, color: "#e5e7eb", fontWeight: 500 }}>{c.name}</div>
                    <div className="mono" style={{ fontSize: 10, color: col.color, marginTop: 2 }}>{c.size}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer stats row */}
        <div className="grid grid-cols-3 gap-2 mt-5 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          {[
            { label: "Total", value: "47" },
            { label: "Active", value: "23" },
            { label: "Closed", value: "4" },
          ].map(s => (
            <div key={s.label}>
              <div className="mono" style={{ fontSize: 10, color: "#475569", letterSpacing: "0.08em", textTransform: "uppercase" }}>{s.label}</div>
              <div className="serif" style={{ fontSize: 24, color: "#fff", fontWeight: 500, letterSpacing: "-0.02em", marginTop: 2 }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// DEEP-DIVE section — full-width alternating text + mock visual.
// Numbered in Fraunces (display serif) so the "01/02/03/04" carries visual
// weight instead of being a decorative badge.
// ─────────────────────────────────────────────────────────────────────────────
function DeepDive({
  number, kicker, headline, body, bullets, visual, reverse,
}: {
  number: string
  kicker: string
  headline: React.ReactNode
  body: string
  bullets: string[]
  visual: React.ReactNode
  reverse?: boolean
}) {
  return (
    <section style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="max-w-[1180px] mx-auto px-6 md:px-10 py-20 md:py-28">
        <div className={`grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 items-start ${reverse ? "md:[&>div:first-child]:order-2" : ""}`}>
          <div className="md:col-span-6 reveal">
            <div className="flex items-baseline gap-5 mb-8">
              <span className="serif" style={{ fontSize: 64, color: "rgba(255,255,255,0.08)", fontWeight: 500, letterSpacing: "-0.03em", lineHeight: 0.9 }}>
                {number}
              </span>
              <span className="mono" style={{ fontSize: 11, color: "#10b981", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                § {kicker}
              </span>
            </div>
            <h3 className="serif text-white" style={{
              fontSize: "clamp(32px, 4.5vw, 56px)",
              lineHeight: 1,
              letterSpacing: "-0.04em",
              fontWeight: 500,
            }}>
              {headline}
            </h3>
            <p style={{ fontSize: 17, lineHeight: 1.6, color: "#94a3b8", marginTop: 24, maxWidth: 520, fontWeight: 300 }}>
              {body}
            </p>
            <ul className="flex flex-col gap-3 mt-8">
              {bullets.map(b => (
                <li key={b} className="flex items-start gap-3" style={{ fontSize: 15, color: "#cbd5e1" }}>
                  <RiCheckLine size={15} style={{ color: "#10b981", marginTop: 4, flexShrink: 0 }} />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-6 reveal" style={{ transitionDelay: "0.15s" }}>
            {visual}
          </div>
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared mock frame — minimal chrome, mono URL strip.
// ─────────────────────────────────────────────────────────────────────────────
function MockFrame({ subtitle, children }: { subtitle: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: "#0a0a0d",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 2,
    }}>
      <div className="flex items-center gap-3 px-4 py-3"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex gap-1.5">
          {["#ff5f57", "#ffbd2e", "#28ca41"].map((c, i) => (
            <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: c, opacity: 0.5 }} />
          ))}
        </div>
        <p className="mono text-center flex-1" style={{ fontSize: 10, color: "#475569", letterSpacing: "0.04em" }}>{subtitle}</p>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

// ── 01 Kanban ─────────────────────────────────────────────────────────────────
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
        <span className="mono" style={{ fontSize: 11, color: "#cbd5e1", letterSpacing: "0.08em", textTransform: "uppercase" }}>Deal pipeline</span>
        <span className="mono" style={{ fontSize: 10, color: "#475569" }}>7 deals · $23.5M ACV</span>
      </div>
      <div className="grid grid-cols-5 gap-2">
        {cols.map(col => (
          <div key={col.label} style={{ borderTop: `1px solid ${col.color}55`, paddingTop: 8 }}>
            <div className="flex items-center justify-between mb-2">
              <span className="mono truncate" style={{ fontSize: 9, color: col.color, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                {col.label}
              </span>
              <span className="mono" style={{ fontSize: 9, color: "#475569" }}>{col.cards.length}</span>
            </div>
            <div className="flex flex-col gap-1.5">
              {col.cards.map(card => (
                <div key={card.name} style={{
                  background: card.dragging ? `${col.color}14` : "rgba(255,255,255,0.02)",
                  border: card.dragging ? `1px solid ${col.color}70` : "1px solid rgba(255,255,255,0.06)",
                  padding: "6px 8px", borderRadius: 2,
                  transform: card.dragging ? "translate(2px, -3px) rotate(-1.2deg)" : "none",
                  boxShadow: card.dragging ? `0 6px 18px ${col.color}25` : "none",
                }}>
                  <div style={{ fontSize: 10, color: "#e5e7eb", fontWeight: 500 }}>{card.name}</div>
                  <div className="mono" style={{ fontSize: 9, color: col.color, marginTop: 2 }}>{card.deal}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mono flex items-center gap-2 mt-4 pt-3"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)", fontSize: 10, color: "#64748b", letterSpacing: "0.04em" }}>
        <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#fbbf24" }} />
        a16z Crypto — moving to Term Sheet
      </div>
    </MockFrame>
  )
}

// ── 02 Deal Room ─────────────────────────────────────────────────────────────
function DealRoomMock() {
  const goal = 2_500_000
  const raised = 1_600_000
  const pct = Math.round((raised / goal) * 100)
  return (
    <MockFrame subtitle="app.fundflow.io/investor/discover">
      <div className="flex items-center justify-between mb-4">
        <span className="mono" style={{ fontSize: 11, color: "#cbd5e1", letterSpacing: "0.08em", textTransform: "uppercase" }}>Deal flow</span>
        <span className="mono" style={{ fontSize: 10, color: "#475569" }}>30 founders raising</span>
      </div>
      <div style={{ background: "#0d0d10", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 2 }}>
        <div style={{ height: 1, background: "linear-gradient(90deg, #10b981 0%, transparent 100%)" }} />
        <div className="p-4 flex flex-col gap-3">
          <div className="flex items-start justify-between">
            <div style={{
              width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center",
              background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.25)",
              color: "#34d399", fontSize: 13, fontWeight: 600, borderRadius: 2,
            }}>N</div>
            <div className="flex items-center gap-1.5">
              <span className="mono" style={{ fontSize: 10, color: "#38bdf8", padding: "3px 8px", background: "rgba(56,189,248,0.08)", border: "1px solid rgba(56,189,248,0.2)", borderRadius: 2, letterSpacing: "0.04em", textTransform: "uppercase" }}>Seed</span>
              <span className="mono" style={{ fontSize: 10, color: "#94a3b8", padding: "3px 8px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 2 }}>Base</span>
            </div>
          </div>
          <div>
            <h4 className="serif" style={{ fontSize: 18, color: "#fff", fontWeight: 500, letterSpacing: "-0.02em" }}>NovaPay</h4>
            <p className="mono" style={{ fontSize: 10, color: "#64748b", marginTop: 2, letterSpacing: "0.02em" }}>by Elena K. · Stealth fintech</p>
          </div>
          <p style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.6 }}>
            Stablecoin payroll rails for remote-first teams — send USDC to 40+ countries, recipients never see a wallet.
          </p>
          <div className="flex flex-wrap gap-1">
            {["DeFi", "Payments", "B2B"].map(t => (
              <span key={t} className="mono" style={{ fontSize: 9, color: "#94a3b8", padding: "2px 6px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 2 }}>{t}</span>
            ))}
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="mono" style={{ fontSize: 10, color: "#64748b", letterSpacing: "0.04em", textTransform: "uppercase" }}>Raised</span>
              <div className="flex items-baseline gap-1.5">
                <span className="serif" style={{ fontSize: 16, color: "#fff", fontWeight: 500, letterSpacing: "-0.02em" }}>$1.6M</span>
                <span className="mono" style={{ fontSize: 10, color: "#475569" }}>/ $2.5M</span>
              </div>
            </div>
            <div style={{ height: 2, background: "rgba(255,255,255,0.06)" }}>
              <div style={{ height: "100%", width: `${pct}%`, background: "#10b981" }} />
            </div>
            <div className="mono" style={{ fontSize: 9, color: "#334155", marginTop: 4, textAlign: "right", letterSpacing: "0.04em" }}>{pct}% funded</div>
          </div>
          <button style={{
            width: "100%", padding: "10px 0", cursor: "default",
            background: "#10b981", color: "#fff", border: 0,
            fontSize: 12, fontWeight: 600, borderRadius: 2, marginTop: 4,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          }}>
            Express interest <RiArrowRightLine size={12} />
          </button>
        </div>
      </div>
      <div className="mono flex items-center gap-2 mt-3 pt-3"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)", fontSize: 10, color: "#64748b", letterSpacing: "0.04em" }}>
        <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#10b981" }} />
        Elena gets an email the moment you tap
      </div>
    </MockFrame>
  )
}

// ── 03 Signal ─────────────────────────────────────────────────────────────────
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
        <span className="mono" style={{ fontSize: 11, color: "#cbd5e1", letterSpacing: "0.08em", textTransform: "uppercase" }}>Pipeline funnel</span>
        <span className="mono flex items-baseline gap-1.5" style={{ fontSize: 10, color: "#475569", letterSpacing: "0.04em" }}>
          Conversion <span className="serif" style={{ fontSize: 14, color: "#10b981", fontWeight: 500 }}>8.5%</span>
        </span>
      </div>
      <div className="flex flex-col gap-3 mb-4">
        {funnel.map((s, i) => (
          <div key={s.label}>
            <div className="flex items-baseline justify-between mb-1">
              <div className="flex items-baseline gap-3">
                <span className="mono" style={{ fontSize: 10, color: "#334155" }}>{String(i + 1).padStart(2, "0")}</span>
                <span style={{ fontSize: 12, color: "#cbd5e1" }}>{s.label}</span>
              </div>
              <span className="serif" style={{ fontSize: 15, color: s.color, fontWeight: 500, letterSpacing: "-0.02em" }}>{s.count}</span>
            </div>
            <div style={{ height: 2, background: "rgba(255,255,255,0.05)" }}>
              <div style={{ height: "100%", width: `${s.pct}%`, background: s.color, opacity: 0.85 }} />
            </div>
          </div>
        ))}
      </div>
      <div className="pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="mono" style={{ fontSize: 10, color: "#475569", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>Total committed</div>
        <div className="flex items-baseline gap-3">
          <span className="serif" style={{ fontSize: 28, color: "#fff", fontWeight: 500, letterSpacing: "-0.02em", lineHeight: 1 }}>$12.5M</span>
          <span className="mono" style={{ fontSize: 11, color: "#10b981", letterSpacing: "0.02em" }}>+$4.2M this month</span>
        </div>
      </div>
    </MockFrame>
  )
}

// ── 04 Identity ──────────────────────────────────────────────────────────────
function IdentityMock() {
  return (
    <MockFrame subtitle="app.fundflow.io/profile">
      <span className="mono" style={{ fontSize: 10, color: "#475569", letterSpacing: "0.08em", textTransform: "uppercase" }}>Connect wallet</span>
      <div className="flex flex-col gap-1.5 mt-3 mb-6">
        {[
          { icon: <RiWallet3Line size={14} />, label: "MetaMask",      hint: "Browser extension",  color: "#fbbf24" },
          { icon: <RiQrCodeLine size={14} />,  label: "WalletConnect", hint: "QR · any wallet",    color: "#38bdf8" },
          { icon: <RiPencilLine size={14} />,  label: "Paste address", hint: "Any 0x…",            color: "#94a3b8" },
        ].map(w => (
          <div key={w.label} className="flex items-center gap-2.5" style={{
            padding: "8px 12px", background: `${w.color}08`, border: `1px solid ${w.color}20`,
            color: w.color, borderRadius: 2,
          }}>
            {w.icon}
            <span style={{ fontSize: 12, fontWeight: 500 }}>{w.label}</span>
            <span className="mono ml-auto" style={{ fontSize: 9, color: "#475569", letterSpacing: "0.04em" }}>{w.hint}</span>
          </div>
        ))}
      </div>

      <span className="mono" style={{ fontSize: 10, color: "#475569", letterSpacing: "0.08em", textTransform: "uppercase" }}>From the directory</span>
      <div className="mt-2" style={{ padding: 12, background: "#0d0d10", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 2 }}>
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div style={{
              width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
              background: "rgba(251,191,36,0.14)", color: "#fbbf24",
              fontSize: 12, fontWeight: 600, borderRadius: 2,
            }}>D</div>
            <div className="min-w-0">
              <p style={{ fontSize: 12, color: "#fff", fontWeight: 500 }}>Dragonfly Capital</p>
              <p className="mono" style={{ fontSize: 9, color: "#64748b", marginTop: 1, letterSpacing: "0.02em" }}>Haseeb Qureshi · San Francisco</p>
            </div>
          </div>
          <span className="mono flex items-center gap-1" style={{ fontSize: 9, color: "#fbbf24", padding: "2px 6px", background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)", borderRadius: 2, letterSpacing: "0.04em", textTransform: "uppercase" }}>
            <RiFlashlightLine size={9} /> Web3
          </span>
        </div>
        <div className="flex items-baseline gap-2 mb-3">
          <span className="mono" style={{ fontSize: 9, color: "#475569", letterSpacing: "0.08em", textTransform: "uppercase" }}>Check</span>
          <span className="serif" style={{ fontSize: 13, color: "#fff", fontWeight: 500 }}>$250k — $5M</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {["DeFi", "Infra"].map(s => (
              <span key={s} className="mono" style={{ fontSize: 9, color: "#10b981", padding: "2px 6px", background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.14)", borderRadius: 2 }}>{s}</span>
            ))}
          </div>
          <button className="mono flex items-center gap-1" style={{
            fontSize: 10, color: "#10b981", padding: "3px 8px",
            background: "rgba(16,185,129,0.1)", border: 0, borderRadius: 2,
            letterSpacing: "0.04em", textTransform: "uppercase", cursor: "default", fontWeight: 600,
          }}>
            <RiAddLine size={10} /> Add
          </button>
        </div>
      </div>
    </MockFrame>
  )
}
