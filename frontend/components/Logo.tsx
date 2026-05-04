import Link from "next/link"

// The wordmark. Not a square, not a gradient, not two initials in a box.
// It's the product name set in Fraunces — the same serif we use for every
// display heading — lowercase, tight-tracked, with a single emerald dot
// where the period would normally sit.
//
// Why this and not a proper icon:
//   · Logo generators (Looka, Brandmark, the AI ones) all output the same
//     thing: a geometric shape in a rounded square with a gradient. Using
//     any of them reads as template the second a dev sees it.
//   · A pure typographic mark ties into the rest of the editorial design
//     language without needing to "also" match — it's literally the same
//     typography. Notion did this. Vercel sort of did this with their ▲.
//     Linear too.
//   · The emerald dot doubles as a "live" signal — the same colour shows
//     up everywhere on the product for active / closed / green-path
//     states, so the mark quietly reinforces the brand's one colour rule.
//   · Scales cleanly. Small = just the dot in the favicon, and that
//     minimalism reads as confidence rather than poverty.
//
// size="sm" is for the in-app nav (~16px font). "lg" is for hero
// treatments on the landing and OG images. Both share the same geometry.
export default function Logo({
  size = "sm",
  href = "/",
  className = "",
}: {
  size?: "sm" | "lg"
  href?: string | null
  className?: string
}) {
  const isSm = size === "sm"
  const fontSize = isSm ? 15 : 32
  const dotSize = isSm ? 5 : 10
  const dotOffset = isSm ? 2 : 3

  const content = (
    <span className={`flex items-baseline ${className}`} style={{ gap: 1 }}>
      <span
        style={{
          // Mono wordmark — same family as the rest of the product chrome.
          // Lowercase + heavier weight = reads as a logo without needing
          // a separate display face.
          fontFamily: "'JetBrains Mono', ui-monospace, monospace",
          fontWeight: 700,
          fontSize,
          letterSpacing: "-0.04em",
          color: "#fff",
          lineHeight: 1,
        }}>
        fundflow
      </span>
      <span
        aria-hidden
        style={{
          width: dotSize,
          height: dotSize,
          borderRadius: "50%",
          background: "#10b981",
          display: "inline-block",
          marginLeft: dotOffset,
          // Drop the dot to baseline — same period-as-dot joke as before.
          alignSelf: "flex-end",
          marginBottom: isSm ? 1 : 2,
        }} />
    </span>
  )

  if (href === null) return content
  return (
    <Link href={href} className="no-underline inline-flex items-center" aria-label="FundFlow">
      {content}
    </Link>
  )
}
