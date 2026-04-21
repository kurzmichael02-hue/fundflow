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
  const fontSize = isSm ? 17 : 38
  const dotSize = isSm ? 6 : 12
  const dotOffset = isSm ? 2 : 4

  const content = (
    <span className={`flex items-baseline ${className}`} style={{ gap: 1 }}>
      <span
        style={{
          fontFamily: "'Fraunces', 'Times New Roman', serif",
          // Slightly heavier than body serif — the wordmark is the one
          // place where 600 reads as "definitely a logo" instead of "a
          // regular heading that happens to be the brand name".
          fontWeight: 600,
          fontSize,
          letterSpacing: "-0.035em",
          color: "#fff",
          lineHeight: 1,
          // fontOpticalSizing pulls the right master from Fraunces variable —
          // at 38px it's sharper, at 17px it's chunkier. That's the whole
          // point of an optical-size font, let's actually use it.
          fontOpticalSizing: "auto",
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
          // Drop the dot to baseline — that's where a normal period would
          // sit, which is the entire joke. Set `alignSelf` to avoid the
          // flex baseline hoisting it into the body of the word.
          alignSelf: "flex-end",
          marginBottom: isSm ? 1 : 3,
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
