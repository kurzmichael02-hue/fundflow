"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { RiCloseLine, RiCheckLine, RiArrowRightLine, RiLockLine } from "react-icons/ri"
import { requireToken } from "@/lib/api"

// Pops when a user hits the free-plan cap or otherwise tries to cross a
// Pro-gated line (add investor #26, bulk-import a CSV with 100 rows,
// advanced analytics, directory on a free plan, etc).
//
// Why this exists instead of just a toast: a "Free plan limit reached"
// toast is a dead-end for the user — they already tried to do the thing,
// hit a wall, and we're giving them nothing but an error. At the exact
// moment their motivation to pay is highest (they *want* to do the
// action), we should be making upgrade trivial, not hiding it behind a
// nav click to /profile. Research says in-context upgrade moments
// convert 3-5× better than generic pricing pages.
//
// Usage: the caller controls `open`, provides a `reason` prop describing
// what got blocked, and the modal handles the Stripe Checkout roundtrip
// itself. Falls back to a nice error if Checkout can't be reached.

export type UpgradeReason =
  | "investor-cap"        // tried to add investor when at 25/25
  | "bulk-import-cap"     // CSV import would cross the cap
  | "analytics-locked"    // locked advanced analytics view
  | "directory-locked"    // directory on free plan
  | "draft-locked"        // AI email draft on free plan
  | "generic"             // catch-all fallback

const REASON_COPY: Record<UpgradeReason, { kicker: string; title: string; body: string }> = {
  "investor-cap": {
    kicker: "Free plan · 25 / 25 used",
    title: "You've maxed out the free plan.",
    body: "Upgrade to Pro to keep adding investors — unlimited pipeline, plus the directory, advanced analytics, and CSV exports at scale.",
  },
  "bulk-import-cap": {
    kicker: "Free plan cap · Import blocked",
    title: "That import would cross the free-plan cap.",
    body: "Upgrade to Pro for unlimited imports. Your existing rows stay put — the rest land the moment the upgrade clears.",
  },
  "analytics-locked": {
    kicker: "Pro feature",
    title: "Advanced analytics is a Pro feature.",
    body: "Cohort conversion, time-in-stage, per-source yield. Seven-figure pipelines live and die by these charts — upgrade to unlock.",
  },
  "directory-locked": {
    kicker: "Pro feature",
    title: "The curated investor directory is Pro.",
    body: "30+ hand-vetted web3 funds with check sizes and focus areas. Saves you a week of scraping Twitter bios.",
  },
  "draft-locked": {
    kicker: "Pro feature",
    title: "Email drafts are Pro.",
    body: "Three cold-outreach openers per investor in ten seconds — direct, warm, and technical. Tailored to your pitch and the investor's profile. Pick one, tweak, send.",
  },
  "generic": {
    kicker: "Unlock Pro",
    title: "This one's on the Pro plan.",
    body: "Pro removes every cap and opens advanced analytics + the curated directory. $99/month, cancel anytime.",
  },
}

const FEATURES: Array<{ label: string }> = [
  { label: "Unlimited investors" },
  { label: "AI email drafts (3 tones per investor)" },
  { label: "Curated directory (30+ web3 funds)" },
  { label: "Advanced analytics & cohort funnel" },
  { label: "CSV export at scale" },
  { label: "Follow-up reminders with email digest" },
  { label: "Priority support" },
]

export default function UpgradeModal({
  open, reason = "generic", onClose,
}: {
  open: boolean
  reason?: UpgradeReason
  onClose: () => void
}) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  // Body scroll lock while open.
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = prev }
  }, [open])

  // Esc closes.
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !busy) onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, busy, onClose])

  async function handleUpgrade() {
    setBusy(true)
    setErr(null)
    const token = requireToken(router.push)
    if (!token) { setBusy(false); return }
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        // Email gets picked up server-side from the authed user — we just
        // need to POST something. Keeping the shape consistent with the
        // existing dashboard handleUpgrade() for good measure.
        body: JSON.stringify({}),
      })
      const data = await res.json().catch(() => null)
      if (data?.url) {
        window.location.href = data.url
        return
      }
      setErr(data?.error || "Couldn't reach Stripe. Try again in a moment.")
      setBusy(false)
    } catch {
      setErr("Network blip — try again.")
      setBusy(false)
    }
  }

  if (!open) return null
  const copy = REASON_COPY[reason]

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="upgrade-modal-title"
      className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
      style={{ background: "rgba(2,4,10,0.78)" }}
      onClick={() => !busy && onClose()}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 520,
          background: "#060608",
          border: "1px solid rgba(255,255,255,0.1)",
          borderTop: "2px solid #10b981",
          boxShadow: "0 32px 80px rgba(0,0,0,0.7)",
          borderRadius: 2,
        }}
      >
        {/* Header */}
        <div className="px-7 pt-7 pb-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="mono flex items-center gap-2 mb-3" style={{ fontSize: 10, color: "#10b981", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 600 }}>
                <RiLockLine size={11} />
                {copy.kicker}
              </div>
              <h2 id="upgrade-modal-title" className="serif text-white" style={{ fontSize: 28, fontWeight: 500, letterSpacing: "-0.02em", lineHeight: 1.15 }}>
                {copy.title}
              </h2>
            </div>
            <button onClick={onClose} disabled={busy} aria-label="Close"
              style={{
                width: 28, height: 28,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#64748b", flexShrink: 0,
                background: "transparent", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 2, cursor: busy ? "not-allowed" : "pointer",
              }}>
              <RiCloseLine size={14} />
            </button>
          </div>
          <p style={{ fontSize: 14, color: "#cbd5e1", lineHeight: 1.65, marginTop: 16 }}>
            {copy.body}
          </p>
        </div>

        {/* Feature list */}
        <div className="px-7 py-5"
          style={{
            borderTop: "1px solid rgba(255,255,255,0.06)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}>
          <div className="mono mb-3" style={{ fontSize: 10, color: "#64748b", letterSpacing: "0.12em", textTransform: "uppercase" }}>
            What you get
          </div>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {FEATURES.map(f => (
              <li key={f.label} className="flex items-center gap-3 py-1.5" style={{ fontSize: 13, color: "#e5e7eb" }}>
                <RiCheckLine size={13} style={{ color: "#10b981", flexShrink: 0 }} />
                {f.label}
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <div className="px-7 pt-5 pb-6 flex flex-col gap-3">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="serif text-white" style={{ fontSize: 30, fontWeight: 500, letterSpacing: "-0.02em" }}>
                $99
              </span>
              <span className="mono" style={{ fontSize: 11, color: "#64748b", letterSpacing: "0.06em", marginLeft: 6 }}>
                / month
              </span>
            </div>
            <span className="mono" style={{ fontSize: 10, color: "#64748b", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Cancel anytime
            </span>
          </div>

          <button onClick={handleUpgrade} disabled={busy}
            className="mono w-full flex items-center justify-center gap-2"
            style={{
              padding: "13px 0", fontSize: 11,
              color: "#fff", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700,
              background: "#10b981", border: 0, borderRadius: 2,
              cursor: busy ? "not-allowed" : "pointer",
              opacity: busy ? 0.6 : 1,
            }}>
            {busy ? "Redirecting to Stripe..." : <>Upgrade to Pro <RiArrowRightLine size={12} /></>}
          </button>

          {err && (
            <div className="mono" style={{ fontSize: 11, color: "#f87171", letterSpacing: "0.04em", textAlign: "center" }}>
              {err}
            </div>
          )}

          <button onClick={onClose} disabled={busy}
            className="mono"
            style={{
              padding: "10px 0", fontSize: 10,
              color: "#64748b", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500,
              background: "transparent", border: 0,
              cursor: busy ? "not-allowed" : "pointer",
            }}>
            Maybe later
          </button>
        </div>
      </div>
    </div>
  )
}
