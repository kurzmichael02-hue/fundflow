// Bloomberg-style scrolling ticker for the landing page.
// Sits right under the hero, gives the page a pulse and shows what kind
// of activity FundFlow tracks without faking a "real-time" stream — the
// items below are illustrative samples, not live data. We label the
// strip "DEMO" so a sharp visitor doesn't think they're looking at
// production telemetry.
//
// Animation lives in globals.css (.ticker-track + ff-ticker keyframes).
// Pauses on hover so a curious visitor can read.

const ITEMS: Array<{ stage: string; project: string; meta: string; color: string }> = [
  { stage: "Closed",      project: "NovaPay",       meta: "$1.2M term sheet",   color: "#34d399" },
  { stage: "Term Sheet",  project: "ZK Routing Co", meta: "Lead investor in",   color: "#38bdf8" },
  { stage: "Meeting",     project: "Solenya",       meta: "VC scheduled",       color: "#fbbf24" },
  { stage: "Interested",  project: "Forge Labs",    meta: "Inbound from /discover", color: "#a78bfa" },
  { stage: "Closed",      project: "Tessera",       meta: "$800k seed",         color: "#34d399" },
  { stage: "Outreach",    project: "Dovetail",      meta: "Cold intro sent",    color: "#9ca3af" },
  { stage: "Term Sheet",  project: "Helix Studio",  meta: "Negotiating",        color: "#38bdf8" },
  { stage: "Interested",  project: "Atlas Mint",    meta: "Reply received",     color: "#a78bfa" },
  { stage: "Meeting",     project: "Glass Protocol",meta: "Pitch booked Friday",color: "#fbbf24" },
  { stage: "Closed",      project: "Rivet",         meta: "$2.5M closed",       color: "#34d399" },
]

export default function LiveTicker() {
  return (
    <section
      aria-label="Sample pipeline activity"
      style={{
        borderTop: "1px solid rgba(255,255,255,0.06)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        overflow: "hidden",
        background: "rgba(255,255,255,0.01)",
      }}
    >
      <div className="max-w-[1180px] mx-auto px-6 md:px-10 flex items-center" style={{ minHeight: 44 }}>
        <span className="mono flex-shrink-0 mr-5" style={{
          fontSize: 10, color: "#10b981",
          letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 600,
          paddingRight: 14,
          borderRight: "1px solid rgba(255,255,255,0.08)",
        }}>
          Demo &middot; Sample feed
        </span>
        <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
          {/* Track is rendered twice so the keyframe loop reads continuously
              without a visible jump back to start. */}
          <div className="ticker-track">
            {[0, 1].map(loopIdx => (
              <div key={loopIdx} className="flex items-center" style={{ paddingRight: 0 }}>
                {ITEMS.map((it, i) => (
                  <div key={`${loopIdx}-${i}`} className="flex items-center"
                    style={{ padding: "0 24px", borderRight: "1px solid rgba(255,255,255,0.04)" }}>
                    <span className="mono" style={{
                      fontSize: 10, color: it.color,
                      letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600,
                      marginRight: 10,
                    }}>
                      {it.stage}
                    </span>
                    <span style={{ fontSize: 12, color: "#e5e7eb", fontWeight: 500, marginRight: 8 }}>
                      {it.project}
                    </span>
                    <span className="mono" style={{ fontSize: 11, color: "#94a3b8", letterSpacing: "0.02em" }}>
                      {it.meta}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
