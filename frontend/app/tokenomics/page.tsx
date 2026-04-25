"use client"
import { useMemo, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import AppNav from "@/components/AppNav"
import { RiCoinLine, RiLockLine, RiShareLine, RiCheckLine } from "react-icons/ri"

// Tokenomics modeler — two jobs on one page:
//   1. Round modeler: plug in round size, FDV, investor allocation,
//      token supply → get price per token, tokens per $1k cheque, FDV at
//      full dilution, and the per-tranche vesting picture.
//   2. SAFT calculator: valuation cap + discount → effective price per
//      token and the tokens a given cheque buys. Standard industry
//      formula: token_price = min(round_price × (1 - discount), cap_price).
//
// Why this exists: InnMind sells this as a headline feature and we
// competed against them on day one without having it. It's pure math,
// no persistence, no backend — so the cost to ship is low and the moat
// it closes matters. URL query params drive the state, so a founder can
// share a link like /tokenomics?supply=1000000000&round=5000000&... and
// their co-founder sees the exact same model.
//
// All numbers are illustrative — the tool isn't legal or tax advice,
// and a disclaimer at the bottom says exactly that.

type Inputs = {
  totalSupply: number    // total token supply at TGE
  roundSize: number      // $ raised this round
  fdv: number            // fully-diluted valuation at round
  allocation: number     // % of total supply allocated to THIS round
  cliffMonths: number    // months until first unlock
  vestMonths: number     // months over which tokens linearly unlock
  // SAFT-specific
  saftEnabled: boolean
  valuationCap: number   // $ valuation cap on the SAFT
  discount: number       // % discount (0-30 typical)
  sampleCheque: number   // $ cheque to compute SAFT token output for
}

const DEFAULTS: Inputs = {
  totalSupply: 1_000_000_000,
  roundSize: 5_000_000,
  fdv: 50_000_000,
  allocation: 10,
  cliffMonths: 6,
  vestMonths: 24,
  saftEnabled: false,
  valuationCap: 50_000_000,
  discount: 20,
  sampleCheque: 500_000,
}

function parseNum(v: string | null, fallback: number): number {
  if (v == null) return fallback
  const n = Number(v)
  return Number.isFinite(n) && n >= 0 ? n : fallback
}

export default function TokenomicsPageWrapper() {
  return (
    <Suspense fallback={<Shell />}>
      <TokenomicsPage />
    </Suspense>
  )
}

function Shell() {
  return (
    <div style={{ minHeight: "100vh", background: "#060608" }}>
      <AppNav />
    </div>
  )
}

function TokenomicsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Seed state from URL so a shared link opens the same model. Any field
  // change writes back via router.replace, no navigation history pollution.
  const [inputs, setInputs] = useState<Inputs>(() => ({
    totalSupply:  parseNum(searchParams.get("supply"),     DEFAULTS.totalSupply),
    roundSize:    parseNum(searchParams.get("round"),      DEFAULTS.roundSize),
    fdv:          parseNum(searchParams.get("fdv"),        DEFAULTS.fdv),
    allocation:   parseNum(searchParams.get("alloc"),      DEFAULTS.allocation),
    cliffMonths:  parseNum(searchParams.get("cliff"),      DEFAULTS.cliffMonths),
    vestMonths:   parseNum(searchParams.get("vest"),       DEFAULTS.vestMonths),
    saftEnabled:  searchParams.get("saft") === "1",
    valuationCap: parseNum(searchParams.get("cap"),        DEFAULTS.valuationCap),
    discount:     parseNum(searchParams.get("disc"),       DEFAULTS.discount),
    sampleCheque: parseNum(searchParams.get("cheque"),     DEFAULTS.sampleCheque),
  }))
  const [copied, setCopied] = useState(false)

  function patch(update: Partial<Inputs>) {
    const next = { ...inputs, ...update }
    setInputs(next)
    const p = new URLSearchParams()
    if (next.totalSupply   !== DEFAULTS.totalSupply)   p.set("supply",  String(next.totalSupply))
    if (next.roundSize     !== DEFAULTS.roundSize)     p.set("round",   String(next.roundSize))
    if (next.fdv           !== DEFAULTS.fdv)           p.set("fdv",     String(next.fdv))
    if (next.allocation    !== DEFAULTS.allocation)    p.set("alloc",   String(next.allocation))
    if (next.cliffMonths   !== DEFAULTS.cliffMonths)   p.set("cliff",   String(next.cliffMonths))
    if (next.vestMonths    !== DEFAULTS.vestMonths)    p.set("vest",    String(next.vestMonths))
    if (next.saftEnabled)                              p.set("saft",    "1")
    if (next.valuationCap  !== DEFAULTS.valuationCap)  p.set("cap",     String(next.valuationCap))
    if (next.discount      !== DEFAULTS.discount)      p.set("disc",    String(next.discount))
    if (next.sampleCheque  !== DEFAULTS.sampleCheque)  p.set("cheque",  String(next.sampleCheque))
    const qs = p.toString()
    router.replace(qs ? `?${qs}` : "?", { scroll: false })
  }

  // Derived numbers. All of them fall out of the two relations:
  //   tokens_in_round = totalSupply × allocation%
  //   price_per_token = round_size / tokens_in_round
  //
  // Guard every division by zero — the inputs are all user-controlled
  // and an empty field renders as 0, which otherwise produces NaN/Inf.
  const m = useMemo(() => {
    const tokensInRound = inputs.totalSupply * (inputs.allocation / 100)
    const pricePerToken = tokensInRound > 0 ? inputs.roundSize / tokensInRound : 0
    const tokensPer1k = pricePerToken > 0 ? 1000 / pricePerToken : 0
    const fdvAtPrice = pricePerToken * inputs.totalSupply
    const implicitFdvDrift = inputs.fdv > 0 ? ((fdvAtPrice - inputs.fdv) / inputs.fdv) * 100 : 0

    // SAFT price: discounted round price, capped by the valuation cap.
    // Cap price = valuationCap / totalSupply. Effective price = min of
    // the two so the investor gets whichever is better for them.
    const capPricePerToken = inputs.totalSupply > 0 ? inputs.valuationCap / inputs.totalSupply : 0
    const discountedPrice = pricePerToken * (1 - inputs.discount / 100)
    const saftPrice = Math.min(discountedPrice, capPricePerToken)
    const saftTokens = saftPrice > 0 ? inputs.sampleCheque / saftPrice : 0
    const saftWinner: "cap" | "discount" = capPricePerToken < discountedPrice ? "cap" : "discount"

    // Vesting schedule (monthly). Cliff months produce zero; after
    // cliff, tokens unlock linearly over vestMonths. Aggregates to a
    // per-investor view using sampleCheque as the reference.
    const investorTokens = saftPrice > 0 ? inputs.sampleCheque / saftPrice : tokensPer1k * (inputs.sampleCheque / 1000)
    const totalVestMonths = inputs.cliffMonths + inputs.vestMonths
    const schedule: Array<{ month: number; cumulative: number; tgePct: number }> = []
    for (let month = 0; month <= totalVestMonths; month++) {
      let cumulative: number
      if (month <= inputs.cliffMonths) cumulative = 0
      else if (inputs.vestMonths <= 0) cumulative = investorTokens
      else {
        const elapsed = month - inputs.cliffMonths
        cumulative = Math.min(investorTokens, (elapsed / inputs.vestMonths) * investorTokens)
      }
      const tgePct = investorTokens > 0 ? (cumulative / investorTokens) * 100 : 0
      schedule.push({ month, cumulative, tgePct })
    }

    return {
      tokensInRound, pricePerToken, tokensPer1k, fdvAtPrice, implicitFdvDrift,
      capPricePerToken, discountedPrice, saftPrice, saftTokens, saftWinner,
      investorTokens, schedule, totalVestMonths,
    }
  }, [inputs])

  async function share() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // no-op — most browsers allow clipboard on HTTPS which Vercel gives us
    }
  }

  return (
    <main style={{ minHeight: "100vh", background: "#060608", color: "#e5e7eb", fontFamily: "'DM Sans', sans-serif" }}>
      <AppNav />

      <div className="max-w-[1180px] mx-auto px-6 md:px-10">

        {/* ── Ticker strip ── */}
        <div className="flex items-center justify-between flex-wrap gap-3 pt-8 pb-6"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="mono flex items-center gap-x-6 gap-y-2 flex-wrap" style={{ fontSize: 11, color: "#64748b", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            <span>Tools</span>
            <span style={{ color: "#475569" }}>·</span>
            <span>Tokenomics modeler</span>
            <span style={{ color: "#475569" }}>·</span>
            <span>Round + SAFT math</span>
          </div>
          <button onClick={share}
            className="mono flex items-center gap-1.5"
            style={{
              fontSize: 10, color: copied ? "#34d399" : "#94a3b8",
              letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500,
              padding: "6px 12px",
              background: "transparent",
              border: `1px solid ${copied ? "rgba(16,185,129,0.35)" : "rgba(255,255,255,0.1)"}`,
              borderRadius: 2, cursor: "pointer",
            }}>
            {copied ? <><RiCheckLine size={11} /> Link copied</> : <><RiShareLine size={11} /> Share this model</>}
          </button>
        </div>

        {/* ── Masthead ── */}
        <section className="pt-10 md:pt-14 pb-8">
          <p className="mono mb-3" style={{ fontSize: 11, color: "#10b981", letterSpacing: "0.12em", textTransform: "uppercase" }}>
            Tokenomics
          </p>
          <h1 className="serif text-white" style={{
            fontSize: "clamp(40px, 5.5vw, 72px)", lineHeight: 0.95, letterSpacing: "-0.045em", fontWeight: 500,
          }}>
            Model your round.
          </h1>
          <p style={{ fontSize: 16, color: "#94a3b8", marginTop: 20, maxWidth: 560, lineHeight: 1.6 }}>
            Price per token, per-cheque allocation, SAFT math with cap and discount, vesting schedule. URL-shareable — drop the
            link in a co-founder DM and they see the same model.
          </p>
        </section>

        {/* ── Grid: Inputs (left) + Outputs (right) ── */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-14 pb-16">

          {/* ── Inputs column ── */}
          <div className="md:col-span-5 flex flex-col gap-10">

            {/* Token supply + round */}
            <div>
              <h2 className="mono mb-5" style={{ fontSize: 11, color: "#10b981", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                Round
              </h2>
              <InputRow label="Total token supply"          value={inputs.totalSupply} onChange={v => patch({ totalSupply: v })} unit="tokens" />
              <InputRow label="Round size (raised)"         value={inputs.roundSize}   onChange={v => patch({ roundSize: v })}   unit="USD" />
              <InputRow label="FDV at round"                value={inputs.fdv}         onChange={v => patch({ fdv: v })}         unit="USD" hint="Fully-diluted valuation. Drives the sanity check below." />
              <InputRow label="Token allocation this round" value={inputs.allocation}  onChange={v => patch({ allocation: v })}  unit="%" />
            </div>

            {/* Vesting */}
            <div>
              <h2 className="mono mb-5" style={{ fontSize: 11, color: "#10b981", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                Vesting
              </h2>
              <InputRow label="Cliff"                       value={inputs.cliffMonths} onChange={v => patch({ cliffMonths: v })} unit="months" />
              <InputRow label="Linear vest (after cliff)"   value={inputs.vestMonths}  onChange={v => patch({ vestMonths: v })}  unit="months" />
            </div>

            {/* SAFT toggle */}
            <div>
              <div className="flex items-center justify-between mb-5">
                <h2 className="mono" style={{ fontSize: 11, color: "#10b981", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                  SAFT calculator
                </h2>
                <label className="mono flex items-center gap-2 cursor-pointer"
                  style={{ fontSize: 10, color: "#94a3b8", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  <input type="checkbox" checked={inputs.saftEnabled} onChange={e => patch({ saftEnabled: e.target.checked })}
                    style={{ accentColor: "#10b981" }} />
                  {inputs.saftEnabled ? "On" : "Off"}
                </label>
              </div>
              {inputs.saftEnabled ? (
                <>
                  <InputRow label="Valuation cap"       value={inputs.valuationCap} onChange={v => patch({ valuationCap: v })} unit="USD" />
                  <InputRow label="Discount"            value={inputs.discount}     onChange={v => patch({ discount: v })}     unit="%" hint="0–30% is typical. Investor takes whichever is better — cap or discount." />
                  <InputRow label="Sample cheque"       value={inputs.sampleCheque} onChange={v => patch({ sampleCheque: v })} unit="USD" />
                </>
              ) : (
                <p style={{ fontSize: 12, color: "#64748b", lineHeight: 1.6 }}>
                  Enable to compute per-cheque token allocation with valuation cap and discount. Standard SAFT: investor takes
                  whichever is better — the cap price or the discounted round price.
                </p>
              )}
            </div>
          </div>

          {/* ── Outputs column ── */}
          <div className="md:col-span-7 flex flex-col gap-10">

            {/* Headline numbers */}
            <div>
              <h2 className="mono mb-5" style={{ fontSize: 11, color: "#10b981", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                Price per token
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3" style={{ borderTop: "1px solid rgba(255,255,255,0.08)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                <Stat label="Round price"    value={fmtPrice(m.pricePerToken)} />
                <Stat label="Tokens / $1k"   value={fmtTokens(m.tokensPer1k)} bordered />
                <Stat label="Tokens in round" value={fmtTokens(m.tokensInRound)} bordered />
              </div>
              {Math.abs(m.implicitFdvDrift) > 1 && (
                <p className="mono mt-3" style={{
                  fontSize: 10, color: Math.abs(m.implicitFdvDrift) > 10 ? "#f87171" : "#fbbf24",
                  letterSpacing: "0.04em",
                }}>
                  {m.implicitFdvDrift > 0 ? "↑" : "↓"} Implicit FDV from price × supply is{" "}
                  <span style={{ color: "#e5e7eb" }}>{fmtUsd(m.fdvAtPrice)}</span>{" "}
                  ({m.implicitFdvDrift > 0 ? "+" : ""}{m.implicitFdvDrift.toFixed(1)}% vs. your stated FDV). Round size / allocation disagrees with FDV — check one of them.
                </p>
              )}
            </div>

            {/* SAFT outputs */}
            {inputs.saftEnabled && (
              <div>
                <h2 className="mono mb-5 flex items-center gap-2" style={{ fontSize: 11, color: "#10b981", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                  <RiLockLine size={12} /> SAFT terms
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3" style={{ borderTop: "1px solid rgba(255,255,255,0.08)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                  <Stat label="Cap price"       value={fmtPrice(m.capPricePerToken)} />
                  <Stat label="Discounted"      value={fmtPrice(m.discountedPrice)} bordered />
                  <Stat label="Effective"       value={fmtPrice(m.saftPrice)} accent bordered />
                </div>
                <p className="mono mt-3" style={{
                  fontSize: 10, color: "#94a3b8",
                  letterSpacing: "0.04em", textTransform: "uppercase",
                }}>
                  Investor wins on:{" "}
                  <span style={{ color: "#34d399", fontWeight: 600 }}>
                    {m.saftWinner === "cap" ? "Cap" : `Discount (${inputs.discount}%)`}
                  </span>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 mt-6" style={{ borderTop: "1px solid rgba(255,255,255,0.08)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                  <Stat label={`For a ${fmtUsd(inputs.sampleCheque)} cheque`} value={fmtTokens(m.saftTokens)} large />
                  <Stat label="% of total supply" value={`${((m.saftTokens / inputs.totalSupply) * 100).toFixed(3)}%`} bordered />
                </div>
              </div>
            )}

            {/* Vesting schedule */}
            <div>
              <h2 className="mono mb-5 flex items-center gap-2" style={{ fontSize: 11, color: "#10b981", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                <RiCoinLine size={12} /> Vesting schedule
              </h2>
              <div style={{ border: "1px solid rgba(255,255,255,0.08)", padding: "20px 20px 8px", borderRadius: 2 }}>
                <div className="mono mb-3" style={{ fontSize: 10, color: "#64748b", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  Tokens unlocked for {fmtUsd(inputs.sampleCheque)} over {m.totalVestMonths} months
                </div>
                <VestChart schedule={m.schedule} cliffMonths={inputs.cliffMonths} />
                <div className="mono flex justify-between mt-3" style={{ fontSize: 9, color: "#64748b", letterSpacing: "0.06em" }}>
                  <span>Month 0</span>
                  <span>Cliff ({inputs.cliffMonths}m)</span>
                  <span>Fully unlocked (M{m.totalVestMonths})</span>
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <p className="mono" style={{ fontSize: 10, color: "#475569", letterSpacing: "0.04em", lineHeight: 1.6 }}>
              Illustrative model. Not legal, tax, or investment advice. Consult a lawyer before signing anything.
            </p>
          </div>
        </section>

        <div style={{ height: 80 }} />
      </div>
    </main>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Reusable input row — label on top, number input with hairline underline,
// unit tag on the right. Matches the rest of the app's underlined-input style.
// ─────────────────────────────────────────────────────────────────────────────
function InputRow({ label, value, onChange, unit, hint }: {
  label: string
  value: number
  onChange: (v: number) => void
  unit: string
  hint?: string
}) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label className="mono block mb-1.5" style={{ fontSize: 10, color: "#64748b", letterSpacing: "0.12em", textTransform: "uppercase" }}>
        {label}
      </label>
      <div className="flex items-center gap-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.18)", paddingBottom: 4 }}>
        <input type="number" value={value}
          onChange={e => onChange(Number(e.target.value) || 0)}
          min={0}
          style={{
            flex: 1,
            background: "transparent", border: 0, color: "#e5e7eb",
            fontSize: 15, outline: "none",
            padding: "6px 0",
            fontFamily: "'JetBrains Mono', ui-monospace, monospace",
          }} />
        <span className="mono" style={{ fontSize: 10, color: "#64748b", letterSpacing: "0.1em", textTransform: "uppercase", flexShrink: 0 }}>
          {unit}
        </span>
      </div>
      {hint && (
        <p className="mono mt-1.5" style={{ fontSize: 10, color: "#64748b", letterSpacing: "0.02em", lineHeight: 1.5 }}>
          {hint}
        </p>
      )}
    </div>
  )
}

function Stat({ label, value, bordered, accent, large }: {
  label: string; value: string; bordered?: boolean; accent?: boolean; large?: boolean
}) {
  return (
    <div style={{
      padding: large ? "26px 20px" : "18px 20px",
      borderLeft: bordered ? "1px solid rgba(255,255,255,0.06)" : "none",
    }}>
      <div className="mono mb-2" style={{ fontSize: 10, color: "#64748b", letterSpacing: "0.12em", textTransform: "uppercase" }}>
        {label}
      </div>
      <div className="serif" style={{
        fontSize: large ? 36 : 26,
        color: accent ? "#34d399" : "#fff",
        fontWeight: 500, letterSpacing: "-0.02em", lineHeight: 1,
      }}>
        {value}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Vesting chart — hand-drawn SVG, no chart library. A single line showing
// cumulative unlock over time, plus a dashed cliff marker. Kept simple so
// it renders crisp at any size and weighs nothing in the bundle.
// ─────────────────────────────────────────────────────────────────────────────
function VestChart({ schedule, cliffMonths }: { schedule: Array<{ month: number; cumulative: number; tgePct: number }>; cliffMonths: number }) {
  const W = 720
  const H = 200
  const padL = 40, padR = 16, padT = 12, padB = 24
  const maxMonth = schedule[schedule.length - 1]?.month || 1
  const x = (month: number) => padL + (month / maxMonth) * (W - padL - padR)
  const y = (pct: number) => padT + (1 - pct / 100) * (H - padT - padB)

  const path = schedule.map((s, i) => `${i === 0 ? "M" : "L"} ${x(s.month).toFixed(1)} ${y(s.tgePct).toFixed(1)}`).join(" ")
  const cliffX = x(cliffMonths)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} style={{ display: "block" }} aria-label="Vesting schedule">
      {/* Grid lines at 0/50/100% */}
      {[0, 50, 100].map(p => (
        <g key={p}>
          <line x1={padL} x2={W - padR} y1={y(p)} y2={y(p)} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
          <text x={padL - 6} y={y(p) + 3} textAnchor="end" style={{ fontSize: 9, fill: "#475569", fontFamily: "'JetBrains Mono', monospace" }}>
            {p}%
          </text>
        </g>
      ))}
      {/* Cliff marker */}
      {cliffMonths > 0 && (
        <g>
          <line x1={cliffX} x2={cliffX} y1={padT} y2={H - padB} stroke="rgba(251,191,36,0.4)" strokeWidth="1" strokeDasharray="3 3" />
          <text x={cliffX + 4} y={padT + 10} style={{ fontSize: 9, fill: "#fbbf24", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.06em" }}>
            CLIFF
          </text>
        </g>
      )}
      {/* Vest curve */}
      <path d={path} fill="none" stroke="#10b981" strokeWidth="2" />
      {/* End marker */}
      <circle cx={x(maxMonth)} cy={y(100)} r="3.5" fill="#10b981" />
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Number formatters — chosen so each reads right at human glance. We
// don't use Intl.NumberFormat for the big ones because the "1.2M" / "5B"
// pattern is what founders actually want to see in a model, not "1,000,000".
// ─────────────────────────────────────────────────────────────────────────────
function fmtUsd(n: number): string {
  if (!isFinite(n) || n === 0) return "$0"
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(n >= 10_000_000_000 ? 0 : 2)}B`
  if (n >= 1_000_000)     return `$${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 2)}M`
  if (n >= 1_000)         return `$${(n / 1_000).toFixed(0)}k`
  return `$${n.toFixed(0)}`
}
function fmtTokens(n: number): string {
  if (!isFinite(n) || n === 0) return "0"
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`
  if (n >= 1_000_000)     return `${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000)         return `${(n / 1_000).toFixed(1)}k`
  return n.toFixed(0)
}
function fmtPrice(n: number): string {
  if (!isFinite(n) || n === 0) return "$0"
  if (n >= 1)       return `$${n.toFixed(4)}`
  if (n >= 0.001)   return `$${n.toFixed(5)}`
  if (n >= 0.00001) return `$${n.toFixed(7)}`
  return `$${n.toExponential(2)}`
}
