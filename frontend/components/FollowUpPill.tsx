import { RiAlarmLine } from "react-icons/ri"

// Small inline marker shown next to an investor's name when a follow-up
// reminder is set. Three states:
//   · overdue: red, "Xd late" / "Xh late" / "Due"
//   · today (same calendar day): amber, "Today"
//   · upcoming: dim, "in Xd" or a short date if >7 days out
// Renders nothing when there's no reminder, so the table stays readable
// for rows that don't need attention.
//
// Shared between the investors table and the pipeline card. Kept purely
// presentational — no interaction, no PATCH — so it's cheap to drop
// anywhere an Investor row is displayed.
export default function FollowUpPill({ at }: { at: string | null }) {
  if (!at) return null
  const t = new Date(at).getTime()
  if (isNaN(t)) return null
  const now = Date.now()
  const endOfToday = new Date()
  endOfToday.setHours(23, 59, 59, 999)

  let color = "#64748b"
  let label = ""
  if (t < now) {
    color = "#f87171"
    const h = Math.floor((now - t) / 3_600_000)
    const d = Math.floor(h / 24)
    label = d >= 1 ? `${d}d late` : h >= 1 ? `${h}h late` : "Due"
  } else if (t <= endOfToday.getTime()) {
    color = "#fbbf24"
    label = "Today"
  } else {
    const d = Math.ceil((t - now) / 86_400_000)
    label = d <= 7 ? `in ${d}d` : new Date(at).toLocaleDateString("en", { month: "short", day: "numeric" })
  }
  return (
    <span className="mono flex-shrink-0 inline-flex items-center gap-1"
      title={`Follow-up: ${new Date(at).toLocaleString("en", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}`}
      style={{
        fontSize: 9, color,
        letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600,
        padding: "2px 6px",
        background: `${color}12`,
        border: `1px solid ${color}33`,
        borderRadius: 2,
        lineHeight: 1,
      }}>
      <RiAlarmLine size={9} />
      {label}
    </span>
  )
}
